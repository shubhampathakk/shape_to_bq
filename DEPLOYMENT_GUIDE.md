# Google Cloud App Engine Deployment Guide

This guide explains how to deploy the Shapefile to BigQuery application on Google Cloud App Engine with proper authentication.

## Prerequisites

1. Google Cloud Project with billing enabled
2. Google Cloud SDK (gcloud) installed
3. App Engine API enabled
4. BigQuery API enabled

## Authentication Options

### Option 1: App Engine Default Service Account (Recommended)

When deployed to App Engine, the application automatically uses the App Engine default service account for authentication. This is the easiest approach.

**Steps:**
1. Ensure your App Engine default service account has BigQuery permissions:
   ```bash
   # Get your project ID
   PROJECT_ID=$(gcloud config get-value project)
   
   # Grant BigQuery permissions to App Engine default service account
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
     --role="roles/bigquery.admin"
   ```

### Option 2: Custom Service Account

Create a dedicated service account for the application:

1. Create service account:
   ```bash
   gcloud iam service-accounts create shapefile-bigquery \
     --display-name="Shapefile to BigQuery Service Account"
   ```

2. Grant BigQuery permissions:
   ```bash
   PROJECT_ID=$(gcloud config get-value project)
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:shapefile-bigquery@$PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/bigquery.admin"
   ```

3. Update `app.yaml` to use the custom service account:
   ```yaml
   runtime: nodejs20
   service: shapefile-bigquery
   service_account: shapefile-bigquery@your-project-id.iam.gserviceaccount.com
   ```

## Deployment Steps

### 1. Setup Google Cloud

```bash
# Authenticate with Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable appengine.googleapis.com
gcloud services enable bigquery.googleapis.com

# Initialize App Engine (if not already done)
gcloud app create --region=us-central
```

### 2. Prepare Application

```bash
# Build the application
npm run build

# The build creates:
# - client/dist/ (frontend static files)
# - dist/index.js (backend server bundle)
```

### 3. Deploy to App Engine

```bash
# Deploy the application
gcloud app deploy app.yaml

# View the deployed application
gcloud app browse
```

### 4. Set Environment Variables (Optional)

If you need to set additional environment variables:

```bash
# Set environment variables
gcloud app deploy app.yaml --set-env-vars="CUSTOM_VAR=value"
```

## Local Development with GCloud Authentication

For local development, you can use your personal Google Cloud credentials:

```bash
# Authenticate locally
gcloud auth application-default login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Run the application locally
npm run dev
```

## File Structure for Deployment

```
your-app/
├── app.yaml                 # App Engine configuration
├── .gcloudignore           # Files to exclude from deployment
├── build.js                # Build script
├── client/dist/            # Built frontend (created by npm run build)
├── dist/index.js           # Built server (created by npm run build)
├── server/                 # Server source code
├── client/src/             # Client source code (excluded from deployment)
└── package.json            # Dependencies
```

## Required Google Cloud APIs

Make sure these APIs are enabled in your project:

1. **App Engine Admin API** - For deploying to App Engine
2. **BigQuery API** - For creating datasets and tables
3. **Cloud Storage API** - For file storage (if needed)

## IAM Permissions Required

The service account needs these permissions:

- `roles/bigquery.admin` - Full BigQuery access
- `roles/bigquery.dataEditor` - For creating and modifying data
- `roles/bigquery.jobUser` - For running BigQuery jobs

## Monitoring and Logs

View application logs:
```bash
# View recent logs
gcloud app logs tail -s default

# View logs in Cloud Console
gcloud app logs read
```

## Troubleshooting

### Authentication Issues
- Verify APIs are enabled
- Check service account permissions
- Ensure BigQuery API is enabled in your project

### Deployment Issues
- Check `app.yaml` syntax
- Verify all required files are included
- Review build output for errors

### Runtime Issues
- Check App Engine logs for errors
- Verify environment variables are set correctly
- Test BigQuery connectivity

## Security Considerations

1. **Service Account Permissions**: Use least privilege principle
2. **Network Security**: App Engine provides HTTPS by default
3. **Data Protection**: All data is encrypted in transit and at rest
4. **Access Control**: Implement authentication for production use

## Cost Optimization

1. **Auto Scaling**: Configure appropriate min/max instances
2. **Instance Classes**: Choose appropriate instance size
3. **BigQuery**: Monitor query costs and optimize schemas

## Next Steps

After deployment:
1. Test the application with real shapefile data
2. Monitor performance and costs
3. Set up alerts for errors or high usage
4. Consider implementing user authentication for production use