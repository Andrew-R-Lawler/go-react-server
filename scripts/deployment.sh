#!/bin/bash

# Set your repository details here
OWNER="andrew-r-lawler"
REPO="go-react-server"

# Get the latest workflow run ID
LATEST_RUN_ID=$(curl -s \
  "https://api.github.com/repos/$OWNER/$REPO/actions/runs" | \
  jq -r '.workflow_runs[0].id')

echo $LATEST_RUN_ID

# Get the artifact ID for the latest run
ARTIFACT_ID=$(curl -s \
  "https://api.github.com/repos/$OWNER/$REPO/actions/runs/$LATEST_RUN_ID/artifacts" | \
  jq -r '.artifacts[0].id')

echo $ARTIFACT_ID

# Get the download URL for the artifact
ARTIFACT_URL=$(curl -s \
  "https://api.github.com/repos/$OWNER/$REPO/actions/artifacts/$ARTIFACT_ID" | \
  jq -r '.archive_download_url')

echo $ARTIFACT_URL

# Download the artifact as a ZIP file
wget "https://github.com/Andrew-R-Lawler/go-react-server/releases/download/1.0.0/gin-server.zip"
echo "Artifact downloaded as artifact.zip"

