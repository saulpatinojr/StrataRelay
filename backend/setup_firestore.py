#!/usr/bin/env python3
"""
Setup Firestore with initial pricing data
Run this once after creating the Firestore database
"""

import os
import csv
from google.cloud import firestore

def setup_firestore_pricing():
    project_id = os.getenv('GOOGLE_CLOUD_PROJECT', 'stratarelay-87aaf')
    db = firestore.Client(project=project_id, database='stratarelaydb')
    
    # Clear existing data
    docs = db.collection('cloudPricing').stream()
    for doc in docs:
        doc.reference.delete()
    
    # Comprehensive AWS pricing data
    aws_instances = [
        {'instanceType': 't3.nano', 'family': 't3', 'cpu': 2, 'memory': 0.5, 'costHourly': 0.0052, 'provider': 'aws', 'region': 'us-east-1'},
        {'instanceType': 't3.micro', 'family': 't3', 'cpu': 2, 'memory': 1, 'costHourly': 0.0104, 'provider': 'aws', 'region': 'us-east-1'},
        {'instanceType': 't3.small', 'family': 't3', 'cpu': 2, 'memory': 2, 'costHourly': 0.0208, 'provider': 'aws', 'region': 'us-east-1'},
        {'instanceType': 't3.medium', 'family': 't3', 'cpu': 2, 'memory': 4, 'costHourly': 0.0416, 'provider': 'aws', 'region': 'us-east-1'},
        {'instanceType': 't3.large', 'family': 't3', 'cpu': 2, 'memory': 8, 'costHourly': 0.0832, 'provider': 'aws', 'region': 'us-east-1'},
        {'instanceType': 't3.xlarge', 'family': 't3', 'cpu': 4, 'memory': 16, 'costHourly': 0.1664, 'provider': 'aws', 'region': 'us-east-1'},
        {'instanceType': 'm5.large', 'family': 'm5', 'cpu': 2, 'memory': 8, 'costHourly': 0.096, 'provider': 'aws', 'region': 'us-east-1'},
        {'instanceType': 'm5.xlarge', 'family': 'm5', 'cpu': 4, 'memory': 16, 'costHourly': 0.192, 'provider': 'aws', 'region': 'us-east-1'},
        {'instanceType': 'm5.2xlarge', 'family': 'm5', 'cpu': 8, 'memory': 32, 'costHourly': 0.384, 'provider': 'aws', 'region': 'us-east-1'},
        {'instanceType': 'c5.large', 'family': 'c5', 'cpu': 2, 'memory': 4, 'costHourly': 0.085, 'provider': 'aws', 'region': 'us-east-1'},
        {'instanceType': 'c5.xlarge', 'family': 'c5', 'cpu': 4, 'memory': 8, 'costHourly': 0.17, 'provider': 'aws', 'region': 'us-east-1'},
        {'instanceType': 'r5.large', 'family': 'r5', 'cpu': 2, 'memory': 16, 'costHourly': 0.126, 'provider': 'aws', 'region': 'us-east-1'},
        {'instanceType': 'r5.xlarge', 'family': 'r5', 'cpu': 4, 'memory': 32, 'costHourly': 0.252, 'provider': 'aws', 'region': 'us-east-1'}
    ]
    
    # GCP pricing data
    gcp_instances = [
        {'instanceType': 'e2-micro', 'family': 'e2', 'cpu': 2, 'memory': 1, 'costHourly': 0.008, 'provider': 'gcp', 'region': 'us-central1'},
        {'instanceType': 'e2-small', 'family': 'e2', 'cpu': 2, 'memory': 2, 'costHourly': 0.016, 'provider': 'gcp', 'region': 'us-central1'},
        {'instanceType': 'e2-medium', 'family': 'e2', 'cpu': 2, 'memory': 4, 'costHourly': 0.033, 'provider': 'gcp', 'region': 'us-central1'},
        {'instanceType': 'e2-standard-2', 'family': 'e2', 'cpu': 2, 'memory': 8, 'costHourly': 0.067, 'provider': 'gcp', 'region': 'us-central1'},
        {'instanceType': 'e2-standard-4', 'family': 'e2', 'cpu': 4, 'memory': 16, 'costHourly': 0.134, 'provider': 'gcp', 'region': 'us-central1'},
        {'instanceType': 'n2-standard-2', 'family': 'n2', 'cpu': 2, 'memory': 8, 'costHourly': 0.097, 'provider': 'gcp', 'region': 'us-central1'},
        {'instanceType': 'n2-standard-4', 'family': 'n2', 'cpu': 4, 'memory': 16, 'costHourly': 0.194, 'provider': 'gcp', 'region': 'us-central1'},
        {'instanceType': 'n2-standard-8', 'family': 'n2', 'cpu': 8, 'memory': 32, 'costHourly': 0.388, 'provider': 'gcp', 'region': 'us-central1'},
        {'instanceType': 'c2-standard-4', 'family': 'c2', 'cpu': 4, 'memory': 16, 'costHourly': 0.212, 'provider': 'gcp', 'region': 'us-central1'},
        {'instanceType': 'n2-highmem-2', 'family': 'n2', 'cpu': 2, 'memory': 16, 'costHourly': 0.130, 'provider': 'gcp', 'region': 'us-central1'}
    ]
    
    # Azure pricing data
    azure_instances = [
        {'instanceType': 'Standard_B1s', 'family': 'B', 'cpu': 1, 'memory': 1, 'costHourly': 0.0104, 'provider': 'azure', 'region': 'East US'},
        {'instanceType': 'Standard_B1ms', 'family': 'B', 'cpu': 1, 'memory': 2, 'costHourly': 0.0208, 'provider': 'azure', 'region': 'East US'},
        {'instanceType': 'Standard_B2s', 'family': 'B', 'cpu': 2, 'memory': 4, 'costHourly': 0.0416, 'provider': 'azure', 'region': 'East US'},
        {'instanceType': 'Standard_D2s_v3', 'family': 'D', 'cpu': 2, 'memory': 8, 'costHourly': 0.096, 'provider': 'azure', 'region': 'East US'},
        {'instanceType': 'Standard_D4s_v3', 'family': 'D', 'cpu': 4, 'memory': 16, 'costHourly': 0.192, 'provider': 'azure', 'region': 'East US'},
        {'instanceType': 'Standard_D8s_v3', 'family': 'D', 'cpu': 8, 'memory': 32, 'costHourly': 0.384, 'provider': 'azure', 'region': 'East US'},
        {'instanceType': 'Standard_F2s_v2', 'family': 'F', 'cpu': 2, 'memory': 4, 'costHourly': 0.085, 'provider': 'azure', 'region': 'East US'},
        {'instanceType': 'Standard_E2s_v3', 'family': 'E', 'cpu': 2, 'memory': 16, 'costHourly': 0.126, 'provider': 'azure', 'region': 'East US'}
    ]
    
    # Combine all instances
    all_instances = aws_instances + gcp_instances + azure_instances
    
    # Add to Firestore in batches
    batch = db.batch()
    count = 0
    
    for instance in all_instances:
        doc_ref = db.collection('cloudPricing').document()
        batch.set(doc_ref, instance)
        count += 1
        
        # Commit every 500 documents (Firestore limit)
        if count % 500 == 0:
            batch.commit()
            batch = db.batch()
    
    # Commit remaining documents
    if count % 500 != 0:
        batch.commit()
    
    print(f"Added {len(aws_instances)} AWS, {len(gcp_instances)} GCP, and {len(azure_instances)} Azure pricing records")
    print(f"Total: {len(all_instances)} pricing records loaded to Firestore")

if __name__ == "__main__":
    setup_firestore_pricing()