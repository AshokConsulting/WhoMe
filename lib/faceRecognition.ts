let faceapi: any = null;
let modelsLoaded = false;
let detectionNet: any = null;

async function loadFaceApi() {
  if (typeof window === 'undefined') {
    throw new Error('face-api.js can only be used in the browser');
  }
  
  if (!faceapi) {
    faceapi = await import('@vladmandic/face-api');
  }
  return faceapi;
}

export async function loadFaceRecognitionModels() {
  if (modelsLoaded) return;

  try {
    const api = await loadFaceApi();
    const MODEL_URL = '/models';
    
    await Promise.all([
      api.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      api.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      api.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
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

  const api = await loadFaceApi();
  const detection = await api
    .detectSingleFace(input)
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detection;
}

export async function detectAllFaces(input: HTMLVideoElement | HTMLImageElement) {
  if (!modelsLoaded) {
    await loadFaceRecognitionModels();
  }

  const api = await loadFaceApi();
  const detections = await api
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

export async function compareFaceDescriptors(descriptor1: Float32Array, descriptor2: Float32Array): Promise<number> {
  const api = await loadFaceApi();
  const distance = api.euclideanDistance(descriptor1, descriptor2);
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

export const recognizeFace = async (
  videoOrImageData: HTMLVideoElement | string,
  users?: any[]
): Promise<any | null> => {
  console.log('🎯 Starting face recognition process...');
  
  if (!modelsLoaded) {
    console.log('📦 Loading face recognition models...');
    await loadFaceRecognitionModels();
    console.log('✅ Models loaded successfully');
  }

  let usersToCheck = users;
  if (!usersToCheck) {
    console.log('👥 Fetching all users from database...');
    const { getAllUsers } = await import('./userService');
    usersToCheck = await getAllUsers();
  }
  
  if (!usersToCheck || usersToCheck.length === 0) {
    console.log('❌ No users available for recognition');
    return null;
  }

  console.log(`🔍 Checking against ${usersToCheck.length} registered users`);

  let detection;
  if (videoOrImageData instanceof HTMLVideoElement) {
    console.log('📹 Detecting face in video stream...');
    detection = await detectSingleFace(videoOrImageData);
  } else {
    console.log('🖼️ Detecting face in image data...');
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = videoOrImageData;
    });
    detection = await detectSingleFace(img);
  }
  
  if (!detection) {
    console.log('❌ No face detected in the input');
    return null;
  }

  console.log('✅ Face detected successfully');

  const currentDescriptor = getFaceDescriptor(detection);
  if (!currentDescriptor) {
    console.log('❌ Could not extract face descriptor from detected face');
    return null;
  }

  console.log('🔢 Face descriptor extracted successfully');

  let bestMatch: { user: any; similarity: number } | null = null;

  for (const user of usersToCheck) {
    if (!user.faceData) {
      console.log(`⚠️ User ${user.name} (${user.id}) has no face data, skipping`);
      continue;
    }
    
    const storedDescriptor = stringToDescriptor(user.faceData);
    const similarity = await compareFaceDescriptors(currentDescriptor, storedDescriptor);

    console.log(`👤 Comparing with ${user.name}: similarity = ${similarity.toFixed(3)}`);

    if (similarity > 0.6 && (!bestMatch || similarity > bestMatch.similarity)) {
      bestMatch = { user, similarity };
      console.log(`🎯 New best match: ${user.name} with similarity ${similarity.toFixed(3)}`);
    }
  }

  if (bestMatch) {
    console.log(`✅ FACE RECOGNIZED: ${bestMatch.user.name} with similarity ${bestMatch.similarity.toFixed(3)}`);
    return bestMatch.user;
  }

  console.log('❌ No matching face found above threshold (0.6)');
  return null;
};
