// Type definitions for Cloudinary upload widget
declare global {
  interface Window {
    cloudinary: {
      createUploadWidget: (options: any, callback: (error: any, result: any) => void) => {
        open: () => void;
      };
    };
  }
}

export {};
