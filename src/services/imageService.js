import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export const requestCameraPermission = async () => {
  if (Platform.OS === 'web') {
    return { granted: true }; 
  }

  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return { granted: status === 'granted' };
};

export const requestGalleryPermission = async () => {
  if (Platform.OS === 'web') {
    return { granted: true }; 
  }

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return { granted: status === 'granted' };
};

// Take photo with camera
export const takePhoto = async () => {
  try {
    console.log('Requesting camera permission...');
    const permission = await requestCameraPermission();
    
    if (!permission.granted) {
      alert('Camera permission is required to take photos');
      return null;
    }

    console.log('Opening camera...');
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // REDUCED from 0.8 - smaller file
    });

    console.log('Camera result:', result);

    if (result.canceled) {
      return null;
    }

    return result.assets[0];
  } catch (error) {
    console.error('Error taking photo:', error);
    alert('Failed to take photo: ' + error.message);
    return null;
  }
};

// Pick image from gallery
export const pickImage = async () => {
  try {
    console.log('Requesting gallery permission...');
    const permission = await requestGalleryPermission();
    
    if (!permission.granted) {
      alert('Gallery permission is required to select photos');
      return null;
    }

    console.log('Opening gallery...');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // REDUCED from 0.8 - smaller file
    });

    console.log('Gallery result:', result);

    if (result.canceled) {
      return null;
    }

    return result.assets[0];
  } catch (error) {
    console.error('Error picking image:', error);
    alert('Failed to pick image: ' + error.message);
    return null;
  }
};

// Convert image to base64 (for future API use)
export const imageToBase64 = async (uri) => {
  try {
    console.log('Converting to base64, URI:', uri);
    
    const response = await fetch(uri);
    console.log('Fetch response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const blob = await response.blob();
    console.log('Blob size:', blob.size, 'Type:', blob.type);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        console.log('Base64 conversion complete, length:', base64.length);
        resolve(base64);
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting to base64:', error);
    return null;
  }
};