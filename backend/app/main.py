from fastapi import FastAPI, HTTPException, Body, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
from .cloud_assessment import CloudAssessmentEngine
from .cloud_connector_service import CloudConnectorService
from google.cloud import firestore

# --- Guru Grade Initialization ---
app = FastAPI(
    title="StrataRelay Intelligence API",
    description="Provides cloud assessment and migration analysis.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

assessment_engine = CloudAssessmentEngine()
cloud_connector_service = CloudConnectorService()
db = firestore.Client()

# --- API Endpoints ---

@app.post("/analyze", tags=["Assessment"])
async def analyze_data(data: dict = Body(...), customer_id: str = Body(...), doc_code: str = Body(...)):
    """
    Accepts structured data (e.g., from RVTools, Azure Migrate), runs it 
    through the CloudAssessmentEngine, and returns a comprehensive analysis.
    Requires customer_id (4-letter code) and doc_code (2-digit code).
    """
    try:
        file_type = data.get('fileType')
        raw_sheets = data.get('rawSheets', {})

        if not file_type or not raw_sheets:
            raise HTTPException(status_code=400, detail="Invalid data: 'fileType' and 'rawSheets' are required.")
        if not (isinstance(customer_id, str) and len(customer_id) == 4):
            raise HTTPException(status_code=400, detail="Invalid customer_id: Must be a 4-letter string.")
        if not (isinstance(doc_code, str) and len(doc_code) == 2 and doc_code.isdigit()):
            raise HTTPException(status_code=400, detail="Invalid doc_code: Must be a 2-digit string.")

        # Convert the incoming JSON/dict sheets into Pandas DataFrames
        dataframes = {sheet_name: pd.DataFrame(sheet_data) for sheet_name, sheet_data in raw_sheets.items()}

        # --- Analysis Routing ---
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
            az_df = dataframes.get('AzureVMs')
            if az_df is None:
                raise HTTPException(status_code=400, detail="'AzureVMs' sheet not found for azmigrate analysis.")
            analysis_result = assessment_engine.analyze_azmigrate_data(
                df_az=az_df,
                customer_id=customer_id,
                doc_code=doc_code
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: '{file_type}'")

        return analysis_result

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.delete("/customer-data/{customer_id}", tags=["Data Management"])
async def delete_customer_data(customer_id: str):
    """
    Deletes all assessment metrics data associated with a given customer_id.
    """
    if not (isinstance(customer_id, str) and len(customer_id) == 4):
        raise HTTPException(status_code=400, detail="Invalid customer_id: Must be a 4-letter string.")

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
        
        if deleted_count > 0: # Commit any remaining documents
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
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during cloud data fetch and analysis: {str(e)}")

# --- Health Check & Entry Point ---

@app.get("/health", tags=["System"])
async def health_check():
    """A simple health check endpoint to confirm the API is running."""
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8080)))