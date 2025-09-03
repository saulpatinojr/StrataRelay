#!/usr/bin/env python3
"""
GCP Pricing Data Auto-Updater
Automatically fetches and updates GCP pricing data from the Cloud Billing API
"""

import requests
import csv
import os
import schedule
import time
from datetime import datetime
from google.cloud import billing_v1
from typing import Dict, List

class GCPPricingUpdater:
    def __init__(self):
        self.csv_file = '../gcp_pricing.csv'
        self.backup_file = f'../gcp_pricing_backup_{datetime.now().strftime("%Y%m%d")}.csv'
        
    def fetch_pricing_data(self) -> List[Dict]:
        """Fetch pricing data from GCP Cloud Billing API"""
        try:
            client = billing_v1.CloudCatalogClient()
            services = client.list_services()
            
            pricing_data = []
            for service in services:
                skus = client.list_skus(parent=service.name)
                for sku in skus:
                    for tier in sku.pricing_info:
                        for price in tier.pricing_expression.tiered_rates:
                            pricing_data.append({
                                'Google service': service.display_name,
                                'Service description': service.description,
                                'Service ID': service.service_id,
                                'SKU ID': sku.sku_id,
                                'SKU description': sku.description,
                                'Consumption model description': 'Default',
                                'Product taxonomy': sku.category.resource_family,
                                'Price reason': 'DEFAULT_PRICE',
                                'Discount': '0%',
                                'Unit description': tier.pricing_expression.usage_unit,
                                'Per unit quantity': tier.pricing_expression.usage_unit_description,
                                'Tiered usage start': price.start_usage_amount,
                                'List price ($)': price.unit_price.units + (price.unit_price.nanos / 1e9),
                                'Contract price ($)': price.unit_price.units + (price.unit_price.nanos / 1e9),
                                'Effective discount': '0%'
                            })
            return pricing_data
        except Exception as e:
            print(f"Error fetching pricing data: {e}")
            return []

    def backup_current_data(self):
        """Create backup of current pricing data"""
        if os.path.exists(self.csv_file):
            os.rename(self.csv_file, self.backup_file)
            print(f"Backup created: {self.backup_file}")

    def update_csv_file(self, pricing_data: List[Dict]):
        """Update the CSV file with new pricing data"""
        if not pricing_data:
            print("No pricing data to update")
            return
            
        fieldnames = [
            'Google service', 'Service description', 'Service ID', 'SKU ID',
            'SKU description', 'Consumption model description', 'Product taxonomy',
            'Price reason', 'Discount', 'Unit description', 'Per unit quantity',
            'Tiered usage start', 'List price ($)', 'Contract price ($)', 'Effective discount'
        ]
        
        with open(self.csv_file, 'w', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(pricing_data)
        
        print(f"Updated {len(pricing_data)} pricing records")

    def update_pricing(self):
        """Main update function"""
        print(f"Starting pricing update at {datetime.now()}")
        
        # Backup current data
        self.backup_current_data()
        
        # Fetch new data
        pricing_data = self.fetch_pricing_data()
        
        # Update CSV
        self.update_csv_file(pricing_data)
        
        print(f"Pricing update completed at {datetime.now()}")

def main():
    updater = GCPPricingUpdater()
    
    # Schedule updates
    schedule.every().day.at("02:00").do(updater.update_pricing)  # Daily at 2 AM
    schedule.every().monday.at("01:00").do(updater.update_pricing)  # Weekly on Monday
    
    print("GCP Pricing Updater started. Press Ctrl+C to stop.")
    
    # Run initial update
    updater.update_pricing()
    
    # Keep running
    while True:
        schedule.run_pending()
        time.sleep(3600)  # Check every hour

if __name__ == "__main__":
    main()