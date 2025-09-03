from fastapi import FastAPI, HTTPException, Body, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
from .cloud_assessment import CloudAssessmentEngine
from .cloud_connector_service import CloudConnectorService
from .pricing_service import PricingService
from google.cloud import firestore

# --- FastAPI Initialization ---
app = FastAPI(
    title="StrataRelay Intelligence API",
    description="Provides cloud assessment and migration analysis.",
    version="2.0.0"
)

# Allow all origins for development. In production, this should be restricted to the frontend's domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# assessment_engine will be created per request with pricing options
cloud_connector_service = CloudConnectorService()
pricing_service = PricingService()
project_id = os.getenv('GOOGLE_CLOUD_PROJECT', 'stratarelay-87aaf')
db = firestore.Client(project=project_id, database='stratarelaydb')

# --- Validation Functions ---
def validate_customer_id(customer_id: str):
    if not (isinstance(customer_id, str) and len(customer_id) == 4):
        raise HTTPException(status_code=400, detail="Invalid customer_id: Must be a 4-letter string.")

def validate_doc_code(doc_code: str):
    if not (isinstance(doc_code, str) and len(doc_code) == 2 and doc_code.isdigit()):
        raise HTTPException(status_code=400, detail="Invalid doc_code: Must be a 2-digit string.")

# --- API Endpoints ---

@app.post("/analyze", tags=["Assessment"])
async def analyze_data(request_body: dict = Body(...)):
    """
    Accepts structured data (e.g., from RVTools, Azure Migrate), runs it 
    through the CloudAssessmentEngine, and returns a comprehensive analysis.
    """
    try:
        # Extract data from the request body
        data = request_body.get('data', {})
        customer_id = request_body.get('customer_id', 'DEMO')
        doc_code = request_body.get('doc_code', '01')
        pricing_options = request_body.get('pricing_options')
        
        print(f"Received request: customer_id={customer_id}, doc_code={doc_code}")
        print(f"Data keys: {list(data.keys()) if data else 'No data'}")
        
        validate_customer_id(customer_id)
        validate_doc_code(doc_code)

        file_type = data.get('fileType')
        raw_sheets = data.get('rawSheets', {})
        
        print(f"Processing file_type: {file_type}")
        print(f"Raw sheets keys: {list(raw_sheets.keys()) if raw_sheets else 'No sheets'}")

        if not file_type or not raw_sheets:
            raise HTTPException(status_code=400, detail="Invalid data: 'fileType' and 'rawSheets' are required.")

        dataframes = {sheet_name: pd.DataFrame(sheet_data) for sheet_name, sheet_data in raw_sheets.items()}
        
        # Create assessment engine with pricing options
        assessment_engine = CloudAssessmentEngine(pricing_options)

        if file_type == 'rvtools':
            vinfo_df = dataframes.get('vInfo')
            if vinfo_df is None:
                raise HTTPException(status_code=400, detail="'vInfo' sheet not found for rvtools analysis.")

            analysis_result = assessment_engine.analyze_rvtools_data(
                df_vinfo=vinfo_df,
                df_vcpu=dataframes.get('vCPU'),
                df_vmemory=dataframes.get('vMemory'),
                df_vdisk=dataframes.get('vDisk'),
                customer_id=customer_id,
                doc_code=doc_code
            )
        elif file_type == 'azmigrate':
            # Try different possible sheet names for Azure Migrate
            az_df = None
            possible_sheets = ['AzureVMs', 'All_Assessed_Machines', 'Assessment_Summary', 'Machines']
            
            for sheet_name in possible_sheets:
                if sheet_name in dataframes:
                    az_df = dataframes[sheet_name]
                    print(f"Using AzMigrate sheet: {sheet_name}")
                    break
            
            if az_df is None:
                available_sheets = list(dataframes.keys())
                raise HTTPException(status_code=400, detail=f"No suitable AzMigrate sheet found. Available: {available_sheets}")
                
            analysis_result = assessment_engine.analyze_azmigrate_data(
                df_az=az_df,
                customer_id=customer_id,
                doc_code=doc_code
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: '{file_type}'")

        return analysis_result

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"ERROR in /analyze endpoint: {str(e)}")
        print(f"Full traceback: {error_details}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.delete("/customer-data/{customer_id}", tags=["Data Management"])
async def delete_customer_data(customer_id: str):
    """
    Deletes all assessment metrics data associated with a given customer_id.
    """
    validate_customer_id(customer_id)
    try:
        metrics_ref = db.collection('assessmentMetrics').where('customerId', '==', customer_id)
        docs = metrics_ref.stream()
        
        deleted_count = 0
        batch = db.batch()
        for doc in docs:
            batch.delete(doc.reference)
            deleted_count += 1
            if deleted_count % 499 == 0: # Firestore batch limit is 500
                batch.commit()
                batch = db.batch()
        
        if deleted_count > 0:
            batch.commit()

        return {"message": f"Successfully deleted {deleted_count} metrics for customer {customer_id}."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete data for customer {customer_id}: {str(e)}")

@app.get("/fetch-and-analyze-cloud-data", tags=["Data Ingestion"])
async def fetch_and_analyze_cloud_data(
    provider: str = Query(None, description="Optional: Specify a cloud provider (aws, azure, gcp) to fetch data from. If not specified, fetches from all.")
):
    """
    Fetches inventory data directly from specified cloud provider(s) (mocked for now)
    and runs it through the assessment engine.
    """
    try:
        inventory_data = cloud_connector_service.fetch_all_cloud_inventory(provider=provider)
        
        if not inventory_data:
            raise HTTPException(status_code=404, detail=f"No inventory data found for provider: {provider or 'all'}")

        df_vinfo = pd.DataFrame(inventory_data)
        analysis_result = assessment_engine.analyze_rvtools_data(df_vinfo=df_vinfo)

        return analysis_result

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during cloud data fetch and analysis: {str(e)}")

# --- Health Check & Entry Point ---

@app.get("/health", tags=["System"])
async def health_check():
    """A simple health check endpoint to confirm the API is running."""
    return {"status": "ok"}

@app.get("/pricing", tags=["Pricing"])
async def get_pricing():
    """Get current cloud pricing data from all providers."""
    try:
        return pricing_service.get_all_cloud_pricing()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch pricing data: {str(e)}")

@app.post("/pricing/refresh", tags=["Pricing"])
async def refresh_pricing():
    """Manually refresh GCP pricing data."""
    try:
        result = pricing_service.refresh_pricing_data()
        if result['status'] == 'error':
            raise HTTPException(status_code=500, detail=result['message'])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to refresh pricing data: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8080)))