import Constants from 'expo-constants';

const CLOUDINARY_CLOUD_NAME = Constants.expoConfig?.extra?.cloudinaryCloudName || 'your-cloud-name';
const CLOUDINARY_UPLOAD_PRESET = Constants.expoConfig?.extra?.cloudinaryUploadPreset || 'agrilink_uploads';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

export function getListingUploadPreset(): string {
  return CLOUDINARY_UPLOAD_PRESET;
}

export function getVehicleUploadPreset(): string {
  return CLOUDINARY_UPLOAD_PRESET;
}

export async function uploadToCloudinary(
  image: { uri: string; name?: string; type?: string },
  uploadPreset?: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    // Create form data
    const formData = new FormData();
    
    // Extract filename from URI
    const filename = image.name || image.uri.split('/').pop() || 'upload.jpg';
    const type = image.type || 'image/jpeg';

    // Append image file
    formData.append('file', {
      uri: image.uri,
      name: filename,
      type,
    } as any);
    
    formData.append('upload_preset', uploadPreset || CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'agrilink');

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary upload failed:', errorText);
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const data: CloudinaryUploadResult = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'jpg' | 'png' | 'webp';
  } = {}
): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const { width, height, quality = 80, format = 'auto' } = options;
  
  const transformations: string[] = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);
  
  const transformString = transformations.join(',');
  
  // Insert transformations into Cloudinary URL
  return url.replace('/upload/', `/upload/${transformString}/`);
}
