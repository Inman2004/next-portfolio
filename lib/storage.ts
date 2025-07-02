import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const uploadProfileImage = async (file: File, userId: string): Promise<string> => {
  try {
    // Create a reference to the storage location
    const storageRef = ref(storage, `profile-images/${userId}/${Date.now()}-${file.name}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

export const deleteProfileImage = async (url: string): Promise<void> => {
  try {
    if (!url) return;
    
    // Create a reference to the file to delete
    const storageRef = ref(storage, url);
    
    // Delete the file
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting profile image:', error);
    // Don't throw the error as we don't want to block the user if deletion fails
  }
};
