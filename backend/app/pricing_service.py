from typing import Dict, Any
import requests
import re
import os
import csv
from google.cloud import firestore

class PricingService:
    def __init__(self):
        try:
            project_id = os.getenv('GOOGLE_CLOUD_PROJECT', 'stratarelay-87aaf')
            self.db = firestore.Client(project=project_id, database='stratarelaydb')
        except Exception as e:
            print(f"Warning: Failed to initialize Firestore client: {e}")
            self.db = None

    def _extract_cpu_from_sku(self, sku_name: str) -> int:
        """Extract CPU count from Azure SKU name like Standard_D2s_v3"""
        if not sku_name:
            return 2
        # Common patterns: D2s = 2 CPU, D4s = 4 CPU, etc.
        cpu_match = re.search(r'[A-Z](\d+)', sku_name)
        return int(cpu_match.group(1)) if cpu_match else 2
    
    def _extract_memory_from_sku(self, sku_name: str) -> float:
        """Estimate memory from Azure SKU name"""
        if not sku_name:
            return 4
        # Basic estimation: D series = 4GB per CPU, E series = 8GB per CPU
        cpu = self._extract_cpu_from_sku(sku_name)
        if 'E' in sku_name:
            return cpu * 8  # Memory optimized
        elif 'F' in sku_name:
            return cpu * 2  # Compute optimized
        else:
            return cpu * 4  # General purpose

    def _parse_gcp_sku(self, description: str) -> Dict[str, Any]:
        cpu_match = re.search(r'(\d+)\s+vCPUs', description)
        mem_match = re.search(r'([\d\.]+)\s+GB RAM', description)
        
        cpu = int(cpu_match.group(1)) if cpu_match else 'N/A'
        memory = float(mem_match.group(1)) if mem_match else 'N/A'
        
        return {'cpu': cpu, 'memory': memory}

    def get_aws_pricing(self, region: str = 'us-east-1', os_type: str = 'linux') -> Dict[str, Any]:
        # Try Firestore first, fallback to static data
        if self.db:
            try:
                instances = []
                docs = self.db.collection('cloudPricing').where('provider', '==', 'aws').where('region', '==', region).limit(50).stream()
                
                for doc in docs:
                    instance_data = doc.to_dict()
                    # Apply OS pricing adjustment (Windows typically 20% more expensive)
                    base_cost = instance_data.get('costHourly', 0)
                    adjusted_cost = base_cost * 1.2 if os_type == 'windows' else base_cost
                    
                    instances.append({
                        'type': instance_data.get('instanceType'),
                        'family': instance_data.get('family'),
                        'cpu': instance_data.get('cpu'),
                        'memory': instance_data.get('memory'),
                        'cost_hourly': adjusted_cost
                    })
                
                if instances:
                    return {
                        'region': region,
                        'instances': sorted(instances, key=lambda x: x.get('cost_hourly', 0))
                    }
            except Exception as e:
                print(f"Error fetching AWS pricing from Firestore: {e}")
        
        # Fallback instances with OS adjustment
        base_instances = [
            {'type': 't3.micro', 'family': 't3', 'cpu': 2, 'memory': 1, 'cost_hourly': 0.0104},
            {'type': 't3.small', 'family': 't3', 'cpu': 2, 'memory': 2, 'cost_hourly': 0.0208},
            {'type': 't3.medium', 'family': 't3', 'cpu': 2, 'memory': 4, 'cost_hourly': 0.0416},
            {'type': 't3.large', 'family': 't3', 'cpu': 2, 'memory': 8, 'cost_hourly': 0.0832},
            {'type': 'm5.large', 'family': 'm5', 'cpu': 2, 'memory': 8, 'cost_hourly': 0.096},
            {'type': 'm5.xlarge', 'family': 'm5', 'cpu': 4, 'memory': 16, 'cost_hourly': 0.192},
            {'type': 'c5.large', 'family': 'c5', 'cpu': 2, 'memory': 4, 'cost_hourly': 0.085},
            {'type': 'r5.large', 'family': 'r5', 'cpu': 2, 'memory': 16, 'cost_hourly': 0.126}
        ]
        
        # Apply OS pricing adjustment
        for instance in base_instances:
            if os_type == 'windows':
                instance['cost_hourly'] *= 1.2
        
        return {
            'region': region,
            'instances': base_instances,
            'note': 'Using fallback pricing data. Set up Firestore for live pricing.'
        }

    def get_azure_pricing(self, region: str = 'eastus', os_type: str = 'linux') -> Dict[str, Any]:
        api_url = "https://prices.azure.com/api/retail/prices"
        
        # Filter by OS type
        os_filter = "and contains(productName, 'Windows')" if os_type == 'windows' else "and not contains(productName, 'Windows')"
        query = f"$filter=serviceName eq 'Virtual Machines' and priceType eq 'Consumption' and armRegionName eq '{region}' {os_filter}"
        
        try:
            response = requests.get(f"{api_url}?{query}", timeout=10)
            response.raise_for_status()
            data = response.json()
            
            instances = []
            for item in data.get('Items', [])[:50]:  # Limit to first 50
                if item.get('armSkuName'):
                    sku_name = item.get('armSkuName', '')
                    cpu = self._extract_cpu_from_sku(sku_name)
                    memory = self._extract_memory_from_sku(sku_name)
                    
                    instances.append({
                        'type': sku_name,
                        'family': sku_name.split('_')[1] if '_' in sku_name else 'Standard',
                        'cpu': cpu,
                        'memory': memory,
                        'cost_hourly': item.get('retailPrice', 0)
                    })
            
            return {
                'region': region,
                'instances': sorted(instances, key=lambda x: x.get('cost_hourly', 0))
            }

        except Exception as e:
            print(f"Error fetching Azure pricing from API: {e}")
            return {'region': region, 'instances': [], 'error': str(e)}

    def get_gcp_pricing(self, region: str = 'us-central1', os_type: str = 'linux') -> Dict[str, Any]:
        # Use Firestore data with OS adjustment
        if self.db:
            try:
                instances = []
                docs = self.db.collection('cloudPricing').where('provider', '==', 'gcp').limit(50).stream()
                
                for doc in docs:
                    instance_data = doc.to_dict()
                    # Apply OS pricing adjustment (Windows typically 30% more expensive on GCP)
                    base_cost = instance_data.get('costHourly', 0)
                    adjusted_cost = base_cost * 1.3 if os_type == 'windows' else base_cost
                    
                    instances.append({
                        'type': instance_data.get('instanceType'),
                        'family': instance_data.get('family'),
                        'cpu': instance_data.get('cpu'),
                        'memory': instance_data.get('memory'),
                        'cost_hourly': adjusted_cost
                    })
                
                if instances:
                    return {
                        'region': region,
                        'instances': sorted(instances, key=lambda x: x.get('cost_hourly', 0))
                    }
            except Exception as e:
                print(f"Error fetching GCP pricing from Firestore: {e}")
        
        return {'region': region, 'instances': [], 'error': 'No GCP pricing data available'}

    def get_all_cloud_pricing(self, region_map: dict = None, os_type: str = 'linux') -> Dict[str, Any]:
        # Try Firestore first for all providers
        if self.db:
            try:
                result = {}
                for provider in ['aws', 'azure', 'gcp']:
                    instances = []
                    region = 'us-east-1'  # Default region
                    docs = self.db.collection('cloudPricing').where('provider', '==', provider).limit(50).stream()
                    
                    for doc in docs:
                        instance_data = doc.to_dict()
                        region = instance_data.get('region', region)  # Update region from data
                        instances.append({
                            'type': instance_data.get('instanceType'),
                            'family': instance_data.get('family'),
                            'cpu': instance_data.get('cpu'),
                            'memory': instance_data.get('memory'),
                            'cost_hourly': instance_data.get('costHourly')
                        })
                    
                    if instances:
                        result[provider] = {
                            'region': region,
                            'instances': sorted(instances, key=lambda x: x.get('cost_hourly', 0))
                        }
                        print(f"Loaded {len(instances)} {provider.upper()} instances from Firestore")
                
                if result:
                    return result
            except Exception as e:
                print(f"Error fetching pricing from Firestore: {e}")
        
        # Fallback to individual methods
        return {
            'aws': self.get_aws_pricing(),
            'azure': self.get_azure_pricing(),
            'gcp': {'region': 'us-central1', 'instances': []},
        }
    
    def refresh_pricing_data(self) -> Dict[str, str]:
        """Trigger manual pricing data refresh"""
        try:
            from .pricing_updater import GCPPricingUpdater
            updater = GCPPricingUpdater()
            updater.update_pricing()
            return {'status': 'success', 'message': 'Pricing data refreshed successfully'}
        except Exception as e:
            return {'status': 'error', 'message': f'Failed to refresh pricing data: {str(e)}'}
