#!/usr/bin/env bash
set -e

# ==============================================================================
# Google Cloud Run (GCR / Artifact Registry) Serverless Deployment Script
# ==============================================================================

SERVICE_NAME="pos-backend"
REGION="${GCP_REGION:-asia-southeast1}"
PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null)}"

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: GCP_PROJECT_ID is not set and no active gcloud project found."
  echo "👉 Run: gcloud config set project <YOUR_PROJECT_ID>"
  exit 1
fi

IMAGE_TAG="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"

echo "🚀 Deploying ${SERVICE_NAME} to Google Cloud Run (Serverless)..."
echo "📦 Project: ${PROJECT_ID}"
echo "🌏 Region:  ${REGION}"
echo "🏷️ Image:   ${IMAGE_TAG}"

# 1. Build and Submit to Google Cloud Container Registry (GCR)
echo "🔨 Building and pushing image with Cloud Build..."
gcloud builds submit --tag "${IMAGE_TAG}" .

# 2. Deploy to Cloud Run with Serverless Auto-scaling (0 to N instances)
echo "☁️ Deploying container to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE_TAG}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars NODE_ENV=production,PORT=8080

echo "✅ Deployment completed successfully!"
gcloud run services describe "${SERVICE_NAME}" --platform managed --region "${REGION}" --format='value(status.url)'
