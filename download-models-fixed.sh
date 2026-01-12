#!/bin/bash

# Create models directory
mkdir -p public/models

# Base URL for models from the correct repository
BASE_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

echo "Downloading face-api.js models..."

# Download SSD MobileNet v1 model files
echo "Downloading SSD MobileNet v1..."
curl -L "$BASE_URL/ssd_mobilenetv1_model-weights_manifest.json" -o public/models/ssd_mobilenetv1_model-weights_manifest.json
curl -L "$BASE_URL/ssd_mobilenetv1_model-shard1" -o public/models/ssd_mobilenetv1_model-shard1
curl -L "$BASE_URL/ssd_mobilenetv1_model-shard2" -o public/models/ssd_mobilenetv1_model-shard2

# Download Face Landmark 68 model files
echo "Downloading Face Landmark 68..."
curl -L "$BASE_URL/face_landmark_68_model-weights_manifest.json" -o public/models/face_landmark_68_model-weights_manifest.json
curl -L "$BASE_URL/face_landmark_68_model-shard1" -o public/models/face_landmark_68_model-shard1

# Download Face Recognition model files
echo "Downloading Face Recognition model..."
curl -L "$BASE_URL/face_recognition_model-weights_manifest.json" -o public/models/face_recognition_model-weights_manifest.json
curl -L "$BASE_URL/face_recognition_model-shard1" -o public/models/face_recognition_model-shard1
curl -L "$BASE_URL/face_recognition_model-shard2" -o public/models/face_recognition_model-shard2

echo "All models downloaded successfully!"
echo "Verifying file sizes..."
ls -lh public/models/
