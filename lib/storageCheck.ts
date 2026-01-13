import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export async function checkStorageConfiguration(): Promise<{
  isConfigured: boolean;
  canUpload: boolean;
  canRead: boolean;
  canDelete: boolean;
  error?: string;
  bucketName?: string;
}> {
  try {
    const testFileName = `test/storage_check_${Date.now()}.txt`;
    const testContent = new Blob(['Firebase Storage Test'], { type: 'text/plain' });
    const storageRef = ref(storage, testFileName);

    const bucketName = storage.app.options.storageBucket;
    
    if (!bucketName) {
      return {
        isConfigured: false,
        canUpload: false,
        canRead: false,
        canDelete: false,
        error: 'Storage bucket not configured in Firebase config',
        bucketName: undefined
      };
    }

    try {
      await uploadBytes(storageRef, testContent);
    } catch (uploadError: any) {
      return {
        isConfigured: true,
        canUpload: false,
        canRead: false,
        canDelete: false,
        error: `Upload failed: ${uploadError.code || uploadError.message}`,
        bucketName
      };
    }

    let canRead = false;
    try {
      await getDownloadURL(storageRef);
      canRead = true;
    } catch (readError: any) {
      return {
        isConfigured: true,
        canUpload: true,
        canRead: false,
        canDelete: false,
        error: `Read failed: ${readError.code || readError.message}`,
        bucketName
      };
    }

    let canDelete = false;
    try {
      await deleteObject(storageRef);
      canDelete = true;
    } catch (deleteError: any) {
      return {
        isConfigured: true,
        canUpload: true,
        canRead: true,
        canDelete: false,
        error: `Delete failed: ${deleteError.code || deleteError.message}`,
        bucketName
      };
    }

    return {
      isConfigured: true,
      canUpload: true,
      canRead: true,
      canDelete: true,
      bucketName
    };
  } catch (error: any) {
    return {
      isConfigured: false,
      canUpload: false,
      canRead: false,
      canDelete: false,
      error: error.message || 'Unknown error',
      bucketName: storage.app.options.storageBucket
    };
  }
}
