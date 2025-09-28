export const uploadToCloudinary = async (file: File, folder: string = 'blog-images') => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const signatureResponse = await fetch('/api/cloudinary/sign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ timestamp, folder }),
  });

  if (!signatureResponse.ok) {
    throw new Error('Failed to get upload signature');
  }

  const { signature, api_key, cloud_name } = await signatureResponse.json();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', api_key);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', folder);

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload image');
  }

  const data = await uploadResponse.json();
  return data.secure_url;
};