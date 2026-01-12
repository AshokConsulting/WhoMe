#!/bin/bash

# Create models directory
mkdir -p public/models

# Base URL for models
BASE_URL="https://github.com/vladmandic/face-api/raw/master/model"

# Download SSD MobileNet v1 model files
curl -L "$BASE_URL/ssd_mobilenetv1_model-weights_manifest.json" -o public/models/ssd_mobilenetv1_model-weights_manifest.json
curl -L "$BASE_URL/ssd_mobilenetv1_model-shard1" -o public/models/ssd_mobilenetv1_model-shard1
curl -L "$BASE_URL/ssd_mobilenetv1_model-shard2" -o public/models/ssd_mobilenetv1_model-shard2

# Download Face Landmark 68 model files
curl -L "$BASE_URL/face_landmark_68_model-weights_manifest.json" -o public/models/face_landmark_68_model-weights_manifest.json
curl -L "$BASE_URL/face_landmark_68_model-shard1" -o public/models/face_landmark_68_model-shard1

# Download Face Recognition model files
curl -L "$BASE_URL/face_recognition_model-weights_manifest.json" -o public/models/face_recognition_model-weights_manifest.json
curl -L "$BASE_URL/face_recognition_model-shard1" -o public/models/face_recognition_model-shard1
curl -L "$BASE_URL/face_recognition_model-shard2" -o public/models/face_recognition_model-shard2

echo "All models downloaded successfully!"
