import functions_framework
from google.cloud import firestore
import requests
import os

@functions_framework.cloud_event
def trigger_processing(cloud_event):
    """Triggered by Cloud Storage file upload"""
    
    data = cloud_event.data
    bucket_name = data['bucket']
    file_name = data['name']
    
    if not file_name.startswith('uploads/'):
        return
    
    # Find corresponding job in Firestore
    db = firestore.Client()
    jobs = db.collection('jobs').where('filePath', '==', file_name).get()
    
    if not jobs:
        print(f"No job found for file: {file_name}")
        return
    
    job = jobs[0]
    job_id = job.id
    
    # Trigger FastAPI processing
    api_url = os.getenv('FASTAPI_URL', 'https://your-cloud-run-url')
    
    try:
        response = requests.post(
            f"{api_url}/process-file",
            json={
                "job_id": job_id,
                "file_path": file_name
            }
        )
        response.raise_for_status()
        print(f"Processing triggered for job: {job_id}")
        
    except Exception as e:
        print(f"Failed to trigger processing: {e}")
        # Update job status to error
        db.collection('jobs').document(job_id).update({
            'status': 'error',
            'error': str(e)
        })