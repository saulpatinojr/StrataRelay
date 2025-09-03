import pandas as pd
import numpy as np
from typing import Dict, List, Any
import json

class CloudAssessmentEngine:
    def __init__(self):
        self.cloud_skus = {
            'aws': {
                'small': {'cpu': 2, 'memory': 4, 'cost_monthly': 50},
                'medium': {'cpu': 4, 'memory': 8, 'cost_monthly': 100},
                'large': {'cpu': 8, 'memory': 16, 'cost_monthly': 200},
                'xlarge': {'cpu': 16, 'memory': 32, 'cost_monthly': 400}
            },
            'azure': {
                'small': {'cpu': 2, 'memory': 4, 'cost_monthly': 55},
                'medium': {'cpu': 4, 'memory': 8, 'cost_monthly': 110},
                'large': {'cpu': 8, 'memory': 16, 'cost_monthly': 220},
                'xlarge': {'cpu': 16, 'memory': 32, 'cost_monthly': 440}
            },
            'gcp': {
                'small': {'cpu': 2, 'memory': 4, 'cost_monthly': 48},
                'medium': {'cpu': 4, 'memory': 8, 'cost_monthly': 96},
                'large': {'cpu': 8, 'memory': 16, 'cost_monthly': 192},
                'xlarge': {'cpu': 16, 'memory': 32, 'cost_monthly': 384}
            }
        }

    def analyze_rvtools_data(self, df_vinfo: pd.DataFrame, df_vcpu: pd.DataFrame = None, 
                           df_vmemory: pd.DataFrame = None, df_vdisk: pd.DataFrame = None) -> Dict[str, Any]:
        """Comprehensive RVTools data analysis for cloud readiness"""
        
        analysis = {
            'summary': self._get_infrastructure_summary(df_vinfo),
            'compute_analysis': self._analyze_compute_resources(df_vinfo, df_vcpu),
            'memory_analysis': self._analyze_memory_usage(df_vinfo, df_vmemory),
            'storage_analysis': self._analyze_storage_requirements(df_vdisk) if df_vdisk is not None else {},
            'licensing_analysis': self._analyze_licensing(df_vinfo),
            'cloud_readiness': self._assess_cloud_readiness(df_vinfo),
            'cost_estimates': self._estimate_cloud_costs(df_vinfo),
            'migration_complexity': self._assess_migration_complexity(df_vinfo),
            'recommendations': []
        }
        
        analysis['recommendations'] = self._generate_recommendations(analysis)
        return analysis

    def _get_infrastructure_summary(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Get high-level infrastructure summary"""
        powered_on = df[df['Powerstate'] == 'poweredOn']
        
        return {
            'total_vms': len(df),
            'powered_on_vms': len(powered_on),
            'total_vcpus': powered_on['CPUs'].sum() if 'CPUs' in df.columns else 0,
            'total_memory_gb': (powered_on['Memory'].sum() / 1024) if 'Memory' in df.columns else 0,
            'avg_cpu_per_vm': powered_on['CPUs'].mean() if 'CPUs' in df.columns else 0,
            'avg_memory_per_vm_gb': (powered_on['Memory'].mean() / 1024) if 'Memory' in df.columns else 0
        }

    def _analyze_compute_resources(self, df_vinfo: pd.DataFrame, df_vcpu: pd.DataFrame = None) -> Dict[str, Any]:
        """Analyze CPU utilization and right-sizing opportunities"""
        powered_on = df_vinfo[df_vinfo['Powerstate'] == 'poweredOn']
        
        cpu_distribution = powered_on['CPUs'].value_counts().to_dict() if 'CPUs' in powered_on.columns else {}
        
        # Identify over-provisioned VMs (high CPU allocation, low utilization if available)
        over_provisioned = powered_on[powered_on['CPUs'] > 8] if 'CPUs' in powered_on.columns else pd.DataFrame()
        
        return {
            'cpu_distribution': cpu_distribution,
            'over_provisioned_vms': len(over_provisioned),
            'right_sizing_candidates': len(powered_on[powered_on['CPUs'] <= 2]) if 'CPUs' in powered_on.columns else 0,
            'high_cpu_vms': len(powered_on[powered_on['CPUs'] >= 16]) if 'CPUs' in powered_on.columns else 0
        }

    def _analyze_memory_usage(self, df_vinfo: pd.DataFrame, df_vmemory: pd.DataFrame = None) -> Dict[str, Any]:
        """Analyze memory allocation and usage patterns"""
        powered_on = df_vinfo[df_vinfo['Powerstate'] == 'poweredOn']
        
        if 'Memory' not in powered_on.columns:
            return {}
            
        memory_gb = powered_on['Memory'] / 1024
        
        return {
            'total_allocated_memory_gb': memory_gb.sum(),
            'avg_memory_per_vm_gb': memory_gb.mean(),
            'memory_distribution': {
                'small_vms_2gb': len(memory_gb[memory_gb <= 2]),
                'medium_vms_4_8gb': len(memory_gb[(memory_gb > 2) & (memory_gb <= 8)]),
                'large_vms_16gb': len(memory_gb[(memory_gb > 8) & (memory_gb <= 16)]),
                'xlarge_vms_32gb_plus': len(memory_gb[memory_gb > 16])
            }
        }

    def _analyze_storage_requirements(self, df_vdisk: pd.DataFrame) -> Dict[str, Any]:
        """Analyze storage requirements and IOPS needs"""
        if df_vdisk.empty:
            return {}
            
        total_storage_mb = df_vdisk['Capacity MB'].sum() if 'Capacity MB' in df_vdisk.columns else 0
        
        return {
            'total_storage_gb': total_storage_mb / 1024,
            'total_storage_tb': total_storage_mb / (1024 * 1024),
            'disk_count': len(df_vdisk),
            'avg_disk_size_gb': (total_storage_mb / len(df_vdisk) / 1024) if len(df_vdisk) > 0 else 0
        }

    def _analyze_licensing(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze OS licensing and optimization opportunities"""
        if 'OS' not in df.columns:
            return {}
            
        os_counts = df['OS'].value_counts()
        
        windows_vms = sum([count for os, count in os_counts.items() if 'windows' in str(os).lower()])
        linux_vms = sum([count for os, count in os_counts.items() if 'linux' in str(os).lower()])
        
        return {
            'windows_vms': windows_vms,
            'linux_vms': linux_vms,
            'other_os': len(df) - windows_vms - linux_vms,
            'os_distribution': os_counts.head(10).to_dict(),
            'hybrid_benefit_eligible': windows_vms  # Assume all Windows VMs eligible
        }

    def _assess_cloud_readiness(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Assess cloud migration readiness based on VM characteristics"""
        powered_on = df[df['Powerstate'] == 'poweredOn']
        
        if powered_on.empty:
            return {'ready': 0, 'needs_work': 0, 'complex': 0}
            
        ready = 0
        needs_work = 0
        complex_migration = 0
        
        for _, vm in powered_on.iterrows():
            cpu = vm.get('CPUs', 0)
            memory_gb = vm.get('Memory', 0) / 1024 if vm.get('Memory') else 0
            
            # Simple readiness criteria
            if cpu <= 4 and memory_gb <= 8:
                ready += 1
            elif cpu <= 8 and memory_gb <= 16:
                needs_work += 1
            else:
                complex_migration += 1
                
        return {
            'ready': ready,
            'needs_work': needs_work,
            'complex': complex_migration,
            'readiness_percentage': (ready / len(powered_on)) * 100 if len(powered_on) > 0 else 0
        }

    def _estimate_cloud_costs(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Estimate monthly cloud costs across providers"""
        powered_on = df[df['Powerstate'] == 'poweredOn']
        
        if powered_on.empty:
            return {}
            
        cost_estimates = {}
        
        for provider in ['aws', 'azure', 'gcp']:
            total_cost = 0
            
            for _, vm in powered_on.iterrows():
                cpu = vm.get('CPUs', 2)
                memory_gb = vm.get('Memory', 4096) / 1024 if vm.get('Memory') else 4
                
                # Match to appropriate SKU
                if cpu <= 2 and memory_gb <= 4:
                    sku = 'small'
                elif cpu <= 4 and memory_gb <= 8:
                    sku = 'medium'
                elif cpu <= 8 and memory_gb <= 16:
                    sku = 'large'
                else:
                    sku = 'xlarge'
                    
                total_cost += self.cloud_skus[provider][sku]['cost_monthly']
                
            cost_estimates[provider] = {
                'monthly_cost': total_cost,
                'annual_cost': total_cost * 12
            }
            
        return cost_estimates

    def _assess_migration_complexity(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Assess migration complexity factors"""
        powered_on = df[df['Powerstate'] == 'poweredOn']
        
        complexity_factors = {
            'high_resource_vms': 0,
            'legacy_os': 0,
            'complex_networking': 0,
            'total_complexity_score': 0
        }
        
        for _, vm in powered_on.iterrows():
            score = 0
            
            # High resource VMs are more complex
            if vm.get('CPUs', 0) > 8 or (vm.get('Memory', 0) / 1024) > 16:
                complexity_factors['high_resource_vms'] += 1
                score += 3
                
            # Legacy OS detection
            os = str(vm.get('OS', '')).lower()
            if 'windows server 2008' in os or 'windows server 2003' in os:
                complexity_factors['legacy_os'] += 1
                score += 5
                
            complexity_factors['total_complexity_score'] += score
            
        return complexity_factors

    def _generate_recommendations(self, analysis: Dict[str, Any]) -> List[Dict[str, str]]:
        """Generate actionable migration recommendations"""
        recommendations = []
        
        # Right-sizing recommendations
        if analysis['compute_analysis'].get('right_sizing_candidates', 0) > 0:
            recommendations.append({
                'type': 'success',
                'category': 'Cost Optimization',
                'title': 'Right-sizing Opportunity',
                'description': f"{analysis['compute_analysis']['right_sizing_candidates']} VMs can be right-sized to smaller instances, saving 30-50% on compute costs."
            })
            
        # Licensing recommendations
        if analysis['licensing_analysis'].get('windows_vms', 0) > 0:
            recommendations.append({
                'type': 'info',
                'category': 'Licensing',
                'title': 'Azure Hybrid Benefit',
                'description': f"Apply Azure Hybrid Benefit to {analysis['licensing_analysis']['windows_vms']} Windows VMs for up to 40% cost savings."
            })
            
        # Migration complexity warnings
        if analysis['cloud_readiness'].get('complex', 0) > analysis['summary'].get('total_vms', 1) * 0.2:
            recommendations.append({
                'type': 'warning',
                'category': 'Migration Planning',
                'title': 'Complex Migration Detected',
                'description': f"{analysis['cloud_readiness']['complex']} VMs require detailed migration planning due to high resource requirements."
            })
            
        return recommendations