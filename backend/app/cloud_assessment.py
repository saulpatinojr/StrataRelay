import pandas as pd
import numpy as np
from typing import Dict, List, Any
import uuid
from google.cloud import firestore
from fastapi import HTTPException # Import HTTPException
from .pricing_service import PricingService
from .predictive_analytics_service import PredictiveAnalyticsService

# --- Guru Grade Assessment Engine ---
class CloudAssessmentEngine:
    def __init__(self):
        self.pricing_service = PricingService()
        self.pricing_data = self.pricing_service.get_all_cloud_pricing()
        self.predictive_analytics_service = PredictiveAnalyticsService()
        try:
            self.db = firestore.Client()
        except Exception as e:
            print(f"Warning: Firestore client could not be initialized: {e}")
            self.db = None

    def _save_metrics_to_firestore(self, df: pd.DataFrame, assessment_id: str, source_type: str, customer_id: str, doc_code: str):
        if not self.db:
            print("Skipping metric save: Firestore client not available.")
            return

        # Check for existing doc_code for this customer
        existing_docs = self.db.collection('assessmentMetrics')\
            .where('customerId', '==', customer_id)\
            .where('docCode', '==', doc_code)\
            .limit(1).get()
        
        if len(list(existing_docs)) > 0:
            raise HTTPException(status_code=409, detail=f"Doc code '{doc_code}' already exists for customer '{customer_id}'. Please choose another.")

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
                'userId': "placeholder_user_id", # Placeholder for future user integration
                'entityId': vm_id,
                'entityName': vm.get('VM', 'N/A'),
                'timestamp': timestamp
            }
            
            # Add CPU metric
            cpu_doc_ref = metrics_collection.document()
            cpu_metric = base_metric.copy()
            cpu_metric.update({'metricType': 'cpu_cores', 'value': vm.get('CPUs', 0)})
            batch.set(cpu_doc_ref, cpu_metric)

            # Add Memory metric
            mem_doc_ref = metrics_collection.document()
            mem_metric = base_metric.copy()
            mem_metric.update({'metricType': 'memory_gb', 'value': vm.get('Memory', 0) / 1024})
            batch.set(mem_doc_ref, mem_metric)

        try:
            batch.commit()
            print(f"Successfully saved {len(batch._writes)} metrics for assessment {assessment_id}.")
        except Exception as e:
            print(f"Error saving metrics to Firestore: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to save metrics: {str(e)}")

    def analyze_rvtools_data(self, df_vinfo: pd.DataFrame, df_vcpu: pd.DataFrame = None, 
                           df_vmemory: pd.DataFrame = None, df_vdisk: pd.DataFrame = None, 
                           customer_id: str = "", doc_code: str = "") -> Dict[str, Any]:
        assessment_id = str(uuid.uuid4())
        df_vinfo_processed = df_vinfo.rename(columns={
            'CPUs': 'CPUs',
            'Memory': 'Memory',
            'Powerstate': 'Powerstate',
            'OS': 'OS',
            'VM': 'VM'
        })

        analysis = {
            'assessmentId': assessment_id,
            'summary': self._get_infrastructure_summary(df_vinfo_processed),
            'compute_analysis': self._analyze_compute_resources(df_vinfo_processed, df_vcpu),
            'memory_analysis': self._analyze_memory_usage(df_vinfo_processed, df_vmemory),
            'storage_analysis': self._analyze_storage_requirements(df_vdisk) if df_vdisk is not None else {},
            'licensing_analysis': self._analyze_licensing(df_vinfo_processed),
            'cloud_readiness': self._assess_cloud_readiness(df_vinfo_processed),
            'cost_estimates': self._estimate_cloud_costs(df_vinfo_processed),
            'migration_complexity': self._assess_migration_complexity(df_vinfo_processed),
            'recommendations': []
        }

        analysis['predictive_analytics'] = self._run_predictive_analysis(df_vinfo_processed)
        analysis['recommendations'] = self._generate_recommendations(analysis)

        self._save_metrics_to_firestore(df_vinfo_processed, assessment_id, 'rvtools', customer_id, doc_code)
        return analysis

    def analyze_azmigrate_data(self, df_az: pd.DataFrame, customer_id: str = "", doc_code: str = "") -> Dict[str, Any]:
        assessment_id = str(uuid.uuid4())
        df_processed = df_az.rename(columns={
            'VM Name': 'VM',
            'vCPUs': 'CPUs',
            'Memory (MB)': 'Memory',
            'Operating System': 'OS',
            'Power Status': 'Powerstate'
        })
        df_processed['Memory'] = df_processed['Memory'] * 1024
        df_processed['Powerstate'] = df_processed['Powerstate'].apply(lambda x: 'poweredOn' if x == 'Started' else 'poweredOff')

        analysis = {
            'assessmentId': assessment_id,
            'summary': self._get_infrastructure_summary(df_processed),
            'compute_analysis': self._analyze_compute_resources(df_processed),
            'memory_analysis': self._analyze_memory_usage(df_processed),
            'storage_analysis': {},
            'licensing_analysis': self._analyze_licensing(df_processed),
            'cloud_readiness': self._assess_cloud_readiness(df_processed),
            'cost_estimates': self._estimate_cloud_costs(df_processed),
            'migration_complexity': self._assess_migration_complexity(df_processed),
            'recommendations': []
        }

        analysis['predictive_analytics'] = self._run_predictive_analysis(df_processed)
        analysis['recommendations'] = self._generate_recommendations(analysis)

        self._save_metrics_to_firestore(df_processed, assessment_id, 'azmigrate', customer_id, doc_code)
        return analysis

    def _run_predictive_analysis(self, df_vinfo: pd.DataFrame) -> Dict[str, Any]:
        """Runs predictive analytics on the provided VM info."""
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
        total_gb = df_vdisk['Capacity MB'].sum() / 1024
        return {
            'total_storage_gb': int(total_gb),
            'total_storage_tb': int(total_gb / 1024),
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
            total_cost = 0
            instance_mapping = []
            for _, vm in powered_on.iterrows():
                cpu, mem = vm.get('CPUs', 2), vm.get('Memory', 4096) / 1024
                
                best_fit = min(
                    (inst for inst in data['instances'] if inst['cpu'] >= cpu and inst['memory'] >= mem),
                    key=lambda x: x['cost_hourly'],
                    default=max(data['instances'], key=lambda x: x['cost_hourly']) # Default to largest if no fit
                )
                total_cost += best_fit['cost_hourly'] * 730 # 730 hours in a month
                instance_mapping.append({'vm_name': vm.get('VM', 'N/A'), 'mapped_instance': best_fit['type']})

            cost_estimates[provider] = {
                'monthly_cost': round(total_cost, 2),
                'annual_cost': round(total_cost * 12, 2),
                'instance_mapping': instance_mapping[:5] # Show a sample of mappings
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
