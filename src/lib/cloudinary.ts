export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
}

/**
 * Generates an optimized responsive Cloudinary delivery URL with f_auto,q_auto
 * when given a Cloudinary image URL. Local uploaded assets pass through unchanged.
 */
export function getOptimizedImageUrl(url: string, width?: number): string {
  if (!url) return '';
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const transform = width ? `f_auto,q_auto,w_${width},c_limit` : 'f_auto,q_auto';
    if (url.includes('/upload/f_auto')) return url;
    return url.replace('/upload/', `/upload/${transform}/`);
  }
  return url;
}

/**
 * Uploads an image file securely via server-signed Cloudinary signature (/api/cloudinary/sign).
 * Never exposes Cloudinary API secrets in frontend code.
 */
export async function uploadImageToCloudinary(
  file: File,
  folder = 'makh-and-more/products'
): Promise<CloudinaryUploadResult> {
  const signRes = await fetch('/api/cloudinary/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder }),
  });

  const signData = await signRes.json();
  if (!signRes.ok || !signData.configured) {
    throw new Error(
      signData?.error ||
        'Cloudinary is not configured yet. Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in environment secrets.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signData.apiKey);
  formData.append('timestamp', String(signData.timestamp));
  formData.append('signature', signData.signature);
  formData.append('folder', signData.folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const uploadData = await uploadRes.json();
  if (!uploadRes.ok || !uploadData.secure_url) {
    throw new Error(uploadData?.error?.message || 'Cloudinary image upload failed.');
  }

  return {
    url: uploadData.secure_url,
    publicId: uploadData.public_id,
    width: uploadData.width,
    height: uploadData.height,
  };
}
