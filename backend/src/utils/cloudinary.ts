import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (fileSource: string, folder: string): Promise<string> => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
        throw new Error('Cloudinary credentials not configured');
    }

    const result = await cloudinary.uploader.upload(fileSource, {
      folder: `picasso/${folder}`,
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export default cloudinary;
