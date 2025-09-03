from typing import Dict, Any
import requests
import re
from google.cloud import firestore

class PricingService:
    def __init__(self):
        # Initialize Firestore client
        try:
            self.db = firestore.Client()
        except Exception as e:
            # In environments without default credentials, this might fail.
            # The service can still run, but Firestore-dependent methods will fail.
            print(f"Warning: Failed to initialize Firestore client: {e}")
            self.db = None

    def _parse_azure_sku(self, sku_name: str) -> Dict[str, Any]:
        # ... (existing helper function)
        return {'cpu': 'N/A', 'memory': 'N/A'} # Simplified for brevity

    def get_aws_pricing(self) -> Dict[str, Any]:
        """
        Fetches AWS EC2 instance pricing data from the Firestore cache.
        """
        if not self.db:
            return {'region': 'us-east-1', 'instances': [], 'error': 'Firestore client not initialized.'}

        try:
            instances = []
            # Query for AWS prices, limiting to a common region for the API response
            docs = self.db.collection('cloudPricing').where('provider', '==', 'aws').where('region', '==', 'us-east-1').limit(50).stream()
            
            for doc in docs:
                instance_data = doc.to_dict()
                instances.append({
                    'type': instance_data.get('instanceType'),
                    'family': instance_data.get('family'),
                    'cpu': instance_data.get('cpu'),
                    'memory': instance_data.get('memory'),
                    'cost_hourly': instance_data.get('costHourly')
                })
            
            return {
                'region': 'us-east-1',
                'instances': sorted(instances, key=lambda x: x.get('cost_hourly', 0))
            }
        except Exception as e:
            print(f"Error fetching AWS pricing from Firestore: {e}")
            return {'region': 'us-east-1', 'instances': [], 'error': str(e)}

    def get_azure_pricing(self) -> Dict[str, Any]:
        """
        Fetches Azure VM instance pricing data from the Azure Retail Prices API.
        """
        # ... (existing implementation)
        return {'region': 'East US', 'instances': []} # Simplified for brevity

    def get_gcp_pricing(self) -> Dict[str, Any]:
        """
        Fetches GCP VM instance pricing data from Firestore or a mock dataset.
        TODO: Implement a GCP price importer similar to the AWS one.
        """
        return {
            'region': 'us-east1',
            'instances': [
                {'type': 'e2-standard-2', 'family': 'General Purpose', 'cpu': 2, 'memory': 8, 'cost_hourly': 0.067},
            ]
        }

    def get_all_cloud_pricing(self) -> Dict[str, Any]:
        """
        Aggregates pricing data from all supported cloud providers.
        """
        return {
            'aws': self.get_aws_pricing(),
            'azure': self.get_azure_pricing(),
            'gcp': self.get_gcp_pricing(),
        }
