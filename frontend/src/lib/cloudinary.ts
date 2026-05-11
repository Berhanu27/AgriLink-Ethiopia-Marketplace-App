// Cloudinary configuration and upload utility
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dnnmkd1ob';
const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '639613315184679';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'agrilink_broadcast';
const CLOUDINARY_LISTING_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_LISTING_PRESET || CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_TRANSPORTER_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_TRANSPORTER_PRESET || CLOUDINARY_UPLOAD_PRESET;

export async function uploadToCloudinary(file: File, preset?: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const uploadPreset = preset || CLOUDINARY_UPLOAD_PRESET;
  formData.append('upload_preset', uploadPreset);

  try {
    console.log(`Uploading to Cloudinary cloud: ${CLOUDINARY_CLOUD_NAME}`);
    console.log(`Using preset: ${uploadPreset}`);
    console.log(`File: ${file.name}, Size: ${file.size}, Type: ${file.type}`);
    
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    console.log(`Request URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    console.log(`Response status: ${response.status}`);
    const data = await response.json();
    console.log(`Response data:`, data);

    if (!response.ok) {
      console.error('Cloudinary error response:', data);
      throw new Error(`Cloudinary upload failed: ${data.error?.message || response.statusText}`);
    }

    console.log('Cloudinary upload successful:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

export function getListingUploadPreset(): string {
  return CLOUDINARY_LISTING_PRESET;
}

export function getTransporterUploadPreset(): string {
  return CLOUDINARY_TRANSPORTER_PRESET;
}

export function getCloudinaryImageUrl(publicId: string, options?: { width?: number; height?: number; crop?: string }): string {
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  
  const transformations: string[] = [];
  if (options?.width) transformations.push(`w_${options.width}`);
  if (options?.height) transformations.push(`h_${options.height}`);
  if (options?.crop) transformations.push(`c_${options.crop}`);
  
  const transform = transformations.length > 0 ? `/${transformations.join(',')}` : '';
  return `${baseUrl}${transform}/${publicId}`;
}
