import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Sign upload request received:', {
    method: req.method,
    body: req.body,
    headers: req.headers,
    env: {
      hasCloudinarySecret: !!(process.env.CLOUDINARY_API_SECRET || process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET),
      hasApiKey: !!process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
    }
  });

  if (req.method !== 'POST') {
    const error = 'Method not allowed';
    console.error('Error:', error);
    return res.status(405).json({ 
      error,
      allowedMethods: ['POST'],
      timestamp: Math.round(Date.now() / 1000)
    });
  }

  try {
    const cloudinarySecret = process.env.CLOUDINARY_API_SECRET || process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;
    if (!cloudinarySecret) {
      const error = 'CLOUDINARY_API_SECRET is not set';
      console.error('Error:', error);
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: error,
        timestamp: Math.round(Date.now() / 1000)
      });
    }

    if (!req.body) {
      const error = 'Request body is empty';
      console.error('Error:', error);
      return res.status(400).json({ 
        error: 'Invalid request',
        details: error,
        timestamp: Math.round(Date.now() / 1000)
      });
    }

    const {
      timestamp = Math.round(Date.now() / 1000),
      preset,
      folder,
      transformation = '',
      tags = []
    } = req.body;

    console.log('Processing request with:', {
      preset,
      folder,
      transformation,
      tags,
      timestamp
    });

    if (!preset) {
      const error = 'Preset is required';
      console.error('Error:', error);
      return res.status(400).json({ 
        error: 'Invalid request',
        details: error,
        receivedBody: req.body,
        timestamp: Math.round(Date.now() / 1000)
      });
    }

    // Create the parameters to sign
    const paramsToSign: Record<string, any> = {
      timestamp,
      upload_preset: preset
    };

    if (folder) paramsToSign.folder = folder;
    if (transformation) paramsToSign.transformation = transformation;
    if (tags?.length) paramsToSign.tags = Array.isArray(tags) ? tags.join(',') : tags;

    console.log('Parameters to sign:', paramsToSign);

    // Create the signature string in the exact format Cloudinary expects
    // The parameters must be in a specific order: upload_preset, folder, etc.
    const signatureParams = [
      `folder=${paramsToSign.folder || ''}`,
      `timestamp=${paramsToSign.timestamp}`,
      `upload_preset=${paramsToSign.upload_preset}`
    ];
    
    // Add optional parameters if they exist
    if (paramsToSign.transformation) {
      signatureParams.push(`transformation=${encodeURIComponent(paramsToSign.transformation)}`);
    }
    if (paramsToSign.tags) {
      signatureParams.push(`tags=${paramsToSign.tags}`);
    }

    const signatureString = signatureParams.join('&') + cloudinarySecret;
    console.log('Signature string:', signatureString);

    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');
    console.log('Generated signature:', signature);

    const response = {
      signature,
      timestamp: paramsToSign.timestamp,
      api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
    };

    console.log('Sending response:', response);
    res.status(200).json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating signature:', error);
    res.status(500).json({ 
      error: 'Failed to generate upload signature',
      details: errorMessage,
      timestamp: Math.round(Date.now() / 1000)
    });
  }
}
