import pandas as pd
import numpy as np
from typing import Dict, List, Any
import uuid
from google.cloud import firestore
from fastapi import HTTPException
from .pricing_service import PricingService
from .predictive_analytics_service import PredictiveAnalyticsService

class CloudAssessmentEngine:
    def __init__(self, pricing_options=None):
        self.pricing_service = PricingService()
        if pricing_options:
            region_map = {
                'aws': pricing_options['region']['aws'],
                'azure': pricing_options['region']['azure'], 
                'gcp': pricing_options['region']['gcp']
            }
            self.pricing_data = self.pricing_service.get_all_cloud_pricing(region_map, pricing_options['os'])
        else:
            self.pricing_data = self.pricing_service.get_all_cloud_pricing()
        print(f"CloudAssessmentEngine initialized with pricing data: {list(self.pricing_data.keys())}")
        for provider, data in self.pricing_data.items():
            print(f"{provider.upper()}: {len(data.get('instances', []))} instances")
        self.predictive_analytics_service = PredictiveAnalyticsService()
        try:
            self.db = firestore.Client(project='stratarelay-87aaf', database='stratarelaydb')
        except Exception as e:
            print(f"Warning: Firestore client could not be initialized: {e}")
            self.db = None

    def _save_metrics_to_firestore(self, df: pd.DataFrame, assessment_id: str, source_type: str, customer_id: str, doc_code: str):
        if not self.db:
            print("Skipping metric save: Firestore client not available.")
            return

        # Check for existing metrics and warn if overwriting
        existing_docs = self.db.collection('assessmentMetrics').where('customerId', '==', customer_id).where('docCode', '==', doc_code).get()
        existing_docs_list = list(existing_docs)
        
        if len(existing_docs_list) > 0:
            print(f"WARNING: File already uploaded - overwriting existing assessment for customer '{customer_id}', doc code '{doc_code}'")
            batch_delete = self.db.batch()
            for doc in existing_docs_list:
                batch_delete.delete(doc.reference)
            batch_delete.commit()
            return {'warning': f"File already uploaded - previous assessment overwritten"}

        batch = self.db.batch()
        metrics_collection = self.db.collection('assessmentMetrics')
        timestamp = firestore.SERVER_TIMESTAMP

        for _, vm in df.iterrows():
            vm_id = vm.get('VM', str(uuid.uuid4()))
            base_metric = {
                'assessmentId': assessment_id,
                'sourceType': source_type,
                'customerId': customer_id,
                'docCode': doc_code,
                'userId': "placeholder_user_id",
                'entityId': vm_id,
                'entityName': vm.get('VM', 'N/A'),
                'timestamp': timestamp
            }
            
            cpu_doc_ref = metrics_collection.document()
            cpu_metric = base_metric.copy()
            cpu_metric.update({'metricType': 'cpu_cores', 'value': vm.get('CPUs', 0)})
            batch.set(cpu_doc_ref, cpu_metric)

            mem_doc_ref = metrics_collection.document()
            mem_metric = base_metric.copy()
            mem_metric.update({'metricType': 'memory_gb', 'value': vm.get('Memory', 0) / 1024})
            batch.set(mem_doc_ref, mem_metric)

        try:
            batch.commit()
            print(f"Successfully saved metrics for assessment {assessment_id}.")
        except Exception as e:
            print(f"Error saving metrics to Firestore: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to save metrics: {str(e)}")

    def _analyze_dataframe(self, df: pd.DataFrame, source_type: str, customer_id: str, doc_code: str, **kwargs) -> Dict[str, Any]:
        assessment_id = str(uuid.uuid4())
        
        analysis = {
            'assessmentId': assessment_id,
            'summary': self._get_infrastructure_summary(df),
            'compute_analysis': self._analyze_compute_resources(df, kwargs.get('df_vcpu')),
            'memory_analysis': self._analyze_memory_usage(df, kwargs.get('df_vmemory')),
            'storage_analysis': self._analyze_storage_requirements(kwargs.get('df_vdisk')) if kwargs.get('df_vdisk') is not None else {},
            'licensing_analysis': self._analyze_licensing(df),
            'cloud_readiness': self._assess_cloud_readiness(df),
            'cost_estimates': self._estimate_cloud_costs(df),
            'migration_complexity': self._assess_migration_complexity(df),
            'recommendations': []
        }

        analysis['predictive_analytics'] = self._run_predictive_analysis(df)
        analysis['recommendations'] = self._generate_recommendations(analysis)

        save_result = self._save_metrics_to_firestore(df, assessment_id, source_type, customer_id, doc_code)
        if save_result and 'warning' in save_result:
            analysis['warning'] = save_result['warning']
        return analysis

    def analyze_rvtools_data(self, df_vinfo: pd.DataFrame, df_vcpu: pd.DataFrame = None, 
                           df_vmemory: pd.DataFrame = None, df_vdisk: pd.DataFrame = None, 
                           customer_id: str = "", doc_code: str = "") -> Dict[str, Any]:
        
        print(f"RVTools vInfo columns: {list(df_vinfo.columns)}")
        
        # Map actual RVTools column names to expected names
        column_mapping = {}
        
        # Find OS column
        if 'OS according to the configuration file' in df_vinfo.columns:
            column_mapping['OS according to the configuration file'] = 'OS'
        elif 'OS according to the VMware Tools' in df_vinfo.columns:
            column_mapping['OS according to the VMware Tools'] = 'OS'
        elif 'OS' in df_vinfo.columns:
            pass  # Already correct
        
        # Find CPU column
        if 'CPUs' in df_vinfo.columns:
            pass  # Already correct
        elif 'CPU' in df_vinfo.columns:
            column_mapping['CPU'] = 'CPUs'
        elif 'vCPU' in df_vinfo.columns:
            column_mapping['vCPU'] = 'CPUs'
        
        # Find Memory column
        if 'Memory' in df_vinfo.columns:
            pass  # Already correct
        elif 'Memory MB' in df_vinfo.columns:
            column_mapping['Memory MB'] = 'Memory'
        elif 'RAM' in df_vinfo.columns:
            column_mapping['RAM'] = 'Memory'
        
        df_vinfo_processed = df_vinfo.rename(columns=column_mapping)
        
        # Ensure required columns exist with defaults
        if 'OS' not in df_vinfo_processed.columns:
            df_vinfo_processed['OS'] = 'Unknown'
        if 'CPUs' not in df_vinfo_processed.columns:
            df_vinfo_processed['CPUs'] = 2  # Default
        if 'Memory' not in df_vinfo_processed.columns:
            df_vinfo_processed['Memory'] = 4096  # Default 4GB
        if 'Powerstate' not in df_vinfo_processed.columns:
            df_vinfo_processed['Powerstate'] = 'poweredOn'  # Default
        if 'VM' not in df_vinfo_processed.columns:
            df_vinfo_processed['VM'] = df_vinfo_processed.index.astype(str)  # Use index as VM name
            
        print(f"Processed columns: {list(df_vinfo_processed.columns)}")
        return self._analyze_dataframe(df_vinfo_processed, 'rvtools', customer_id, doc_code, df_vcpu=df_vcpu, df_vmemory=df_vmemory, df_vdisk=df_vdisk)

    def analyze_azmigrate_data(self, df_az: pd.DataFrame, customer_id: str = "", doc_code: str = "") -> Dict[str, Any]:
        print(f"AzMigrate columns: {list(df_az.columns)}")
        
        # Flexible column mapping for Azure Migrate
        column_mapping = {}
        
        # Find VM name column
        for col in df_az.columns:
            if 'vm' in col.lower() and 'name' in col.lower():
                column_mapping[col] = 'VM'
                break
        
        # Find CPU column
        for col in df_az.columns:
            if 'cpu' in col.lower() or 'core' in col.lower():
                column_mapping[col] = 'CPUs'
                break
        
        # Find Memory column
        for col in df_az.columns:
            if 'memory' in col.lower() or 'ram' in col.lower():
                column_mapping[col] = 'Memory'
                break
        
        # Find OS column
        for col in df_az.columns:
            if 'os' in col.lower() or 'operating' in col.lower():
                column_mapping[col] = 'OS'
                break
        
        # Find Power/Status column
        for col in df_az.columns:
            if 'power' in col.lower() or 'status' in col.lower():
                column_mapping[col] = 'Powerstate'
                break
        
        df_processed = df_az.rename(columns=column_mapping)
        
        # Ensure required columns exist with defaults
        if 'VM' not in df_processed.columns:
            df_processed['VM'] = df_processed.index.astype(str)
        if 'CPUs' not in df_processed.columns:
            df_processed['CPUs'] = 2
        if 'Memory' not in df_processed.columns:
            df_processed['Memory'] = 4096
        if 'OS' not in df_processed.columns:
            df_processed['OS'] = 'Unknown'
        if 'Powerstate' not in df_processed.columns:
            df_processed['Powerstate'] = 'poweredOn'
        
        # Convert memory to MB if it's in GB
        if 'Memory' in df_processed.columns and df_processed['Memory'].max() < 1000:
            df_processed['Memory'] = df_processed['Memory'] * 1024
        
        # Standardize power state
        if 'Powerstate' in df_processed.columns:
            df_processed['Powerstate'] = df_processed['Powerstate'].apply(
                lambda x: 'poweredOn' if str(x).lower() in ['started', 'running', 'on', 'poweredon'] else 'poweredOff'
            )
        
        print(f"AzMigrate processed columns: {list(df_processed.columns)}")
        return self._analyze_dataframe(df_processed, 'azmigrate', customer_id, doc_code)

    def _run_predictive_analysis(self, df_vinfo: pd.DataFrame) -> Dict[str, Any]:
        return self.predictive_analytics_service.predict_cloud_spend(df_vinfo)

    def _get_infrastructure_summary(self, df: pd.DataFrame) -> Dict[str, Any]:
        powered_on = df[df['Powerstate'] == 'poweredOn']
        return {
            'total_vms': len(df),
            'powered_on_vms': len(powered_on),
            'total_vcpus': int(powered_on['CPUs'].sum()),
            'total_memory_gb': int(powered_on['Memory'].sum() / 1024),
        }

    def _analyze_compute_resources(self, df_vinfo: pd.DataFrame, df_vcpu: pd.DataFrame = None) -> Dict[str, Any]:
        powered_on = df_vinfo[df_vinfo['Powerstate'] == 'poweredOn']
        cpu_dist = powered_on['CPUs'].value_counts().to_dict()
        return {
            'cpu_distribution': {str(k): int(v) for k, v in cpu_dist.items()},
            'right_sizing_candidates_cpu': len(powered_on[powered_on['CPUs'] > 8]),
        }

    def _analyze_memory_usage(self, df_vinfo: pd.DataFrame, df_vmemory: pd.DataFrame = None) -> Dict[str, Any]:
        powered_on = df_vinfo[df_vinfo['Powerstate'] == 'poweredOn']
        memory_gb = powered_on['Memory'] / 1024
        return {
            'total_allocated_memory_gb': int(memory_gb.sum()),
            'avg_memory_per_vm_gb': int(memory_gb.mean()),
            'right_sizing_candidates_memory': len(memory_gb[memory_gb > 32]),
        }

    def _analyze_storage_requirements(self, df_vdisk: pd.DataFrame) -> Dict[str, Any]:
        if df_vdisk is None or df_vdisk.empty:
            return {}
        
        # Try different possible column names for capacity
        capacity_columns = ['Capacity MB', 'Capacity MiB', 'Capacity', 'Size MB', 'Size', 'Capacity (MB)']
        capacity_col = None
        
        for col in capacity_columns:
            if col in df_vdisk.columns:
                capacity_col = col
                break
        
        if capacity_col is None:
            print(f"Warning: No capacity column found in vDisk data. Available columns: {list(df_vdisk.columns)}")
            return {'error': 'No capacity data available'}
        
        total_mb = df_vdisk[capacity_col].sum()
        total_gb = total_mb / 1024 if 'MB' in capacity_col else total_mb
        
        return {
            'total_storage_gb': int(total_gb),
            'total_storage_tb': int(total_gb / 1024),
            'capacity_column_used': capacity_col
        }

    def _analyze_licensing(self, df: pd.DataFrame) -> Dict[str, Any]:
        os_counts = df['OS'].value_counts()
        windows_vms = sum(count for os, count in os_counts.items() if 'windows' in str(os).lower())
        linux_vms = sum(count for os, count in os_counts.items() if 'linux' in str(os).lower())
        return {
            'windows_vms': windows_vms,
            'linux_vms': linux_vms,
            'os_distribution': {k: int(v) for k, v in os_counts.head(5).to_dict().items()}
        }

    def _assess_cloud_readiness(self, df: pd.DataFrame) -> Dict[str, Any]:
        ready = len(df[(df['CPUs'] <= 4) & (df['Memory'] <= 16384)])
        needs_work = len(df[(df['CPUs'] > 4) & (df['CPUs'] <= 8) & (df['Memory'] > 16384) & (df['Memory'] <= 65536)])
        complex_migration = len(df[(df['CPUs'] > 8) | (df['Memory'] > 65536)])
        return {'ready': ready, 'needsWork': needs_work, 'complex': complex_migration}

    def _estimate_cloud_costs(self, df: pd.DataFrame) -> Dict[str, Any]:
        powered_on = df[df['Powerstate'] == 'poweredOn']
        if powered_on.empty: return {}

        cost_estimates = {}
        for provider, data in self.pricing_data.items():
            sorted_instances = sorted(data['instances'], key=lambda x: x['cost_hourly'])
            total_cost = 0
            instance_mapping = []
            for _, vm in powered_on.iterrows():
                cpu, mem = vm.get('CPUs', 2), vm.get('Memory', 4096) / 1024
                
                # Find best fit instance
                best_fit = None
                for inst in sorted_instances:
                    if inst.get('cpu', 0) >= cpu and inst.get('memory', 0) >= mem:
                        best_fit = inst
                        break
                
                # If no perfect fit, use the largest available
                if best_fit is None and sorted_instances:
                    best_fit = sorted_instances[-1]
                elif best_fit is None:
                    continue  # Skip if no instances available
                total_cost += best_fit['cost_hourly'] * 730
                instance_mapping.append({'vm_name': vm.get('VM', 'N/A'), 'mapped_instance': best_fit['type']})

            cost_estimates[provider] = {
                'monthly_cost': round(total_cost, 2),
                'annual_cost': round(total_cost * 12, 2),
                'instance_mapping': instance_mapping[:5]
            }
        return cost_estimates

    def _assess_migration_complexity(self, df: pd.DataFrame) -> Dict[str, Any]:
        legacy_os_list = ['windows server 2008', 'windows server 2003', 'rhel 5']
        legacy_os_vms = df[df['OS'].str.lower().str.contains('|'.join(legacy_os_list), na=False)]
        return {
            'high_resource_vms': len(df[(df['CPUs'] > 16) | (df['Memory'] > 131072)]),
            'legacy_os_vms': len(legacy_os_vms),
            'legacy_os_examples': legacy_os_vms[['VM', 'OS']].head(5).to_dict('records')
        }

    def _generate_recommendations(self, analysis: Dict[str, Any]) -> List[Dict[str, str]]:
        recs = []
        if analysis['compute_analysis'].get('right_sizing_candidates_cpu', 0) > 0:
            count = analysis['compute_analysis']['right_sizing_candidates_cpu']
            recs.append({
                'type': 'success', 'title': f'Right-Size {count} High-CPU VMs',
                'description': f'We identified {count} VMs with more than 8 vCPUs. Analyze their utilization to consider right-sizing them and reduce costs.'
})
        
        if analysis['migration_complexity'].get('legacy_os_vms', 0) > 0:
            count = analysis['migration_complexity']['legacy_os_vms']
            recs.append({
                'type': 'warning', 'title': f'Address {count} Legacy OS Instances',
                'description': f'We found {count} VMs running unsupported or legacy operating systems (e.g., Windows Server 2008). These require special handling or modernization before migration.'
})

        if analysis['licensing_analysis'].get('windows_vms', 0) > 0:
            count = analysis['licensing_analysis']['windows_vms']
            recs.append({
                'type': 'info', 'title': 'Leverage Azure Hybrid Benefit',
                'description': f'You have {count} Windows Server VMs. You could save up to 40% on Azure compute costs by leveraging your existing licenses with Azure Hybrid Benefit.'
            })
        return recs
