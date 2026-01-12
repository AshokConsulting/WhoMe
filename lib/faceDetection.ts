import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';

let model: blazeface.BlazeFaceModel | null = null;

export async function loadFaceDetectionModel() {
  if (!model) {
    await tf.ready();
    model = await blazeface.load();
  }
  return model;
}

export async function detectFaces(video: HTMLVideoElement) {
  if (!model) {
    model = await loadFaceDetectionModel();
  }
  
  const predictions = await model.estimateFaces(video, false);
  return predictions;
}

export function extractFaceDescriptor(video: HTMLVideoElement, prediction: any) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return null;
  
  const start = prediction.topLeft as number[];
  const end = prediction.bottomRight as number[];
  const size = [end[0] - start[0], end[1] - start[1]];
  
  canvas.width = 160;
  canvas.height = 160;
  
  ctx.drawImage(
    video,
    start[0], start[1], size[0], size[1],
    0, 0, 160, 160
  );
  
  return canvas.toDataURL('image/jpeg', 0.8);
}

export function compareFaces(face1Data: string, face2Data: string): number {
  return face1Data === face2Data ? 1.0 : 0.0;
}
