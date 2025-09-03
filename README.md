# StrataRelay Analytics Platform

A full-stack analytics application with React MUI frontend and Python FastAPI backend on Google Cloud.

## Features

- **Frontend**: React with Material-UI dark theme
- **File Upload**: Drag-and-drop Excel file uploader to Cloud Storage
- **Real-time Status**: Job timeline with Firestore integration
- **Analytics**: Interactive charts with Chart.js
- **Backend**: FastAPI service on Cloud Run
- **Processing**: Pandas data processing with report generation
- **Integration**: Power BI REST API, multi-cloud support (Azure, AWS, GCP, OCI)

## Architecture

```
Frontend (React) → Firebase Storage → Cloud Function → Cloud Run (FastAPI) → Power BI
                ↓                                           ↓
            Firestore ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

## Setup

### Frontend
```bash
npm install
npm start
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Deployment
```bash
# Build and deploy to Cloud Run
gcloud builds submit --tag gcr.io/PROJECT_ID/stratarelay-api backend/
gcloud run deploy stratarelay-api --image gcr.io/PROJECT_ID/stratarelay-api --platform managed

# Deploy Cloud Function
gcloud functions deploy trigger-processing --runtime python311 --trigger-bucket YOUR_BUCKET
```

## Environment Variables

Copy `.env.example` to `.env` and configure:
- Firebase credentials
- Google Cloud project settings
- API endpoints

## Secret Manager Setup

Store these secrets in Google Secret Manager:
- `powerbi-token`: Power BI access token
- `powerbi-dataset-id`: Power BI dataset ID
- `azure-credentials`: Azure service principal
- `aws-credentials`: AWS access keys
- `oci-credentials`: OCI configuration