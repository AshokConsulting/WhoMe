import * as faceapi from '@vladmandic/face-api';

let modelsLoaded = false;
let detectionNet: any = null;

export async function loadFaceRecognitionModels() {
  if (modelsLoaded) return;

  try {
    const MODEL_URL = '/models';
    
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);

    modelsLoaded = true;
    console.log('Face recognition models loaded successfully');
  } catch (error) {
    console.error('Error loading face recognition models:', error);
    throw error;
  }
}

export async function detectSingleFace(input: HTMLVideoElement | HTMLImageElement) {
  if (!modelsLoaded) {
    await loadFaceRecognitionModels();
  }

  const detection = await faceapi
    .detectSingleFace(input)
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detection;
}

export async function detectAllFaces(input: HTMLVideoElement | HTMLImageElement) {
  if (!modelsLoaded) {
    await loadFaceRecognitionModels();
  }

  const detections = await faceapi
    .detectAllFaces(input)
    .withFaceLandmarks()
    .withFaceDescriptors();

  return detections;
}

export function getFaceDescriptor(detection: any): Float32Array | null {
  if (!detection || !detection.descriptor) {
    return null;
  }
  return detection.descriptor;
}

export function compareFaceDescriptors(descriptor1: Float32Array, descriptor2: Float32Array): number {
  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  const similarity = 1 - distance;
  return similarity;
}

export function descriptorToString(descriptor: Float32Array): string {
  return JSON.stringify(Array.from(descriptor));
}

export function stringToDescriptor(str: string): Float32Array {
  try {
    const array = JSON.parse(str);
    return new Float32Array(array);
  } catch (error) {
    console.error('Error parsing descriptor:', error);
    return new Float32Array(128);
  }
}

export async function captureFaceImage(video: HTMLVideoElement): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  ctx.drawImage(video, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.8);
}

export function captureFaceSnapshot(video: HTMLVideoElement, detection: any): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  const box = detection.detection.box;
  const padding = 50;
  
  const x = Math.max(0, box.x - padding);
  const y = Math.max(0, box.y - padding);
  const width = Math.min(video.videoWidth - x, box.width + padding * 2);
  const height = Math.min(video.videoHeight - y, box.height + padding * 2);
  
  canvas.width = 200;
  canvas.height = 200;
  
  ctx.drawImage(
    video,
    x, y, width, height,
    0, 0, 200, 200
  );
  
  return canvas.toDataURL('image/jpeg', 0.9);
}
