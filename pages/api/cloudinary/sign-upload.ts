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
      public_id,
      transformation = '',
      tags = [],
      context = '',
      overwrite = false,
      invalidate = false
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

    // Create the parameters to sign in the exact order expected by Cloudinary
    // The order of these parameters is VERY important for the signature
    const paramsToSign: Record<string, any> = {};
    
    // Add parameters in the exact order they should be signed
    // This order must match what Cloudinary expects
    if (context) paramsToSign.context = context;
    if (folder) paramsToSign.folder = folder;
    if (public_id) paramsToSign.public_id = public_id;
    if (tags?.length) paramsToSign.tags = Array.isArray(tags) ? tags.join(',') : tags;
    
    // Always include these
    paramsToSign.timestamp = timestamp;
    paramsToSign.upload_preset = preset;
    
    // Add transformation if it exists
    if (transformation) paramsToSign.transformation = transformation;
    
    // Add boolean flags if true
    if (overwrite) paramsToSign.overwrite = 'true';
    if (invalidate) paramsToSign.invalidate = 'true';

    console.log('Parameters to sign:', paramsToSign);

    // Create the signature string in the exact format Cloudinary expects
    // The order of parameters in the string is critical
    const signatureParts = [];
    
    // Add parameters in the correct order
    if (paramsToSign.context) signatureParts.push(`context=${paramsToSign.context}`);
    if (paramsToSign.folder) signatureParts.push(`folder=${paramsToSign.folder}`);
    if (paramsToSign.invalidate) signatureParts.push(`invalidate=${paramsToSign.invalidate}`);
    if (paramsToSign.overwrite) signatureParts.push(`overwrite=${paramsToSign.overwrite}`);
    if (paramsToSign.public_id) signatureParts.push(`public_id=${paramsToSign.public_id}`);
    if (paramsToSign.tags) signatureParts.push(`tags=${paramsToSign.tags}`);
    
    // Always include these
    signatureParts.push(`timestamp=${paramsToSign.timestamp}`);
    
    // Add transformation if it exists (must be URL encoded)
    if (paramsToSign.transformation) {
      signatureParts.push(`transformation=${encodeURIComponent(paramsToSign.transformation)}`);
    }
    
    signatureParts.push(`upload_preset=${paramsToSign.upload_preset}`);
    
    const signatureString = signatureParts.join('&') + cloudinarySecret;
    console.log('Final signature string (before hashing):', signatureString);
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
