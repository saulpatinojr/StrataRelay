
import functions_framework
from google.cloud import firestore
import requests
import json
import re
import os

# --- Environment Setup ---
# Initialize Firestore client. In a GCP environment, credentials are handled automatically.
db = firestore.Client()

# --- Constants ---
# URL to get the list of all regional bulk API endpoints for EC2
AWS_PRICING_INDEX_URL = "https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/region_index.json"
# Collection name in Firestore
PRICING_COLLECTION = "cloudPricing"

def _parse_aws_sku(attributes):
    """
    Parses AWS instance attributes to extract CPU (vCPU) and Memory.
    This is a heuristic-based parser.
    """
    vcpu = attributes.get('vcpu', 'N/A')
    memory_str = attributes.get('memory', '0 GiB')
    memory = 'N/A'
    try:
        # Memory often comes in "X GiB" format
        memory_val = re.search(r'([\d\.]+)', memory_str)
        if memory_val:
            memory = float(memory_val.group(1))
    except (ValueError, TypeError):
        pass
    return {'cpu': vcpu, 'memory': memory}

@functions_framework.http
def update_aws_prices(request):
    """
    A Google Cloud Function to be triggered by a scheduler (e.g., weekly).
    It fetches AWS EC2 pricing for a specific region and updates Firestore.
    """
    # For this example, we'll target a single, common region.
    # A more advanced version could iterate through all regions.
    target_region = "us-east-1"
    
    try:
        # 1. Get the regional bulk API URL
        index_response = requests.get(AWS_PRICING_INDEX_URL)
        index_response.raise_for_status()
        index_data = index_response.json()
        
        regional_url_relative = index_data['regions'][target_region]['currentVersionUrl']
        regional_url = f"https://pricing.us-east-1.amazonaws.com{regional_url_relative}"

        # 2. Download the regional pricing file
        print(f"Downloading pricing for {target_region} from {regional_url}...")
        pricing_response = requests.get(regional_url)
        pricing_response.raise_for_status()
        pricing_data = pricing_response.json()
        
        print("Download complete. Parsing products...")
        
        # 3. Parse and prepare data for Firestore
        batch = db.batch()
        count = 0
        
        for sku, product in pricing_data['products'].items():
            # We only care about On-Demand instances for now
            if product.get('productFamily') == 'Compute Instance' and product.get('attributes', {}).get('operatingSystem') == 'Linux':
                
                # Find the On-Demand price
                on_demand_terms = pricing_data['terms'].get('OnDemand', {}).get(sku)
                if not on_demand_terms:
                    continue
                
                # Get the first (and usually only) price dimension
                price_dimension = next(iter(on_demand_terms.values()), {}).get('priceDimensions', {})
                price_details = next(iter(price_dimension.values()), {})
                
                cost_hourly_str = price_details.get('pricePerUnit', {}).get('USD')
                if not cost_hourly_str:
                    continue

                try:
                    cost_hourly = float(cost_hourly_str)
                except (ValueError, TypeError):
                    continue

                attributes = product['attributes']
                specs = _parse_aws_sku(attributes)
                
                # Create a structured document
                price_doc = {
                    'provider': 'aws',
                    'region': attributes.get('location'),
                    'instanceType': attributes.get('instanceType'),
                    'family': attributes.get('instanceFamily'),
                    'cpu': specs['cpu'],
                    'memory': specs['memory'],
                    'costHourly': cost_hourly,
                    'lastUpdated': firestore.SERVER_TIMESTAMP
                }
                
                # Use a predictable document ID: aws-<region>-<instanceType>
                doc_id = f"aws-{price_doc['region']}-{price_doc['instanceType']}"
                doc_ref = db.collection(PRICING_COLLECTION).document(doc_id)
                batch.set(doc_ref, price_doc, merge=True)
                count += 1
                
                # Firestore batch limit is 500 operations
                if count % 499 == 0:
                    print(f"Committing batch of {len(batch._writes)} documents...")
                    batch.commit()
                    batch = db.batch()

        # Commit any remaining documents
        if len(batch._writes) > 0:
            print(f"Committing final batch of {len(batch._writes)} documents...")
            batch.commit()
            
        success_message = f"Successfully updated/verified {count} AWS price points in Firestore."
        print(success_message)
        return (success_message, 200)

    except requests.exceptions.RequestException as e:
        error_message = f"Error fetching AWS pricing data: {e}"
        print(error_message)
        return (error_message, 500)
    except Exception as e:
        error_message = f"An unexpected error occurred: {e}"
        print(error_message)
        return (error_message, 500)

