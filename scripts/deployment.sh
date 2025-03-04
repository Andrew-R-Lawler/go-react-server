#!/bin/bash

# Replace with your GitHub username and repository name
OWNER="Andrew-R-Lawler"
REPO="go-react-server"

# Fetch the list of artifacts and extract the download URL of the most recent artifact
ARCHIVE_URL=$(curl -s "https://api.github.com/repos/$OWNER/$REPO/actions/artifacts" \
    | grep -o '"archive_download_url": *"[^"]*' \
    | head -n 1 \
    | sed 's/"archive_download_url": "//')

# Check if we got a valid URL
if [ -n "$ARCHIVE_URL" ]; then
    # Download the artifact as a ZIP file
    curl -L -o artifact.zip "$ARCHIVE_URL"
    echo "Artifact downloaded successfully as artifact.zip"

    # Make directory for program files to be extracted into
    mkdir gin-server

    # Extract the ZIP file
    echo "Extracting artifact.zip..."
    unzip -o artifact.zip -d
    echo "Extraction complete"
    
else
    echo "No artifacts found."
fi

