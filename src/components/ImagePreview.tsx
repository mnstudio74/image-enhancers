import React from 'react';
import { motion } from 'framer-motion';

interface ImagePreviewProps {
  title: string;
  image: File | string;
  isFile: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ title, image, isFile }) => {
  const getImageSrc = () => {
    if (isFile && image instanceof File) {
      return URL.createObjectURL(image);
    }
    return image as string;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4"
    >
      <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
      <div className="aspect-square bg-white/5 rounded-lg overflow-hidden">
        <img
          src={getImageSrc()}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      {isFile && image instanceof File && (
        <div className="mt-3 text-sm text-purple-200">
          <p>Size: {(image.size / 1024 / 1024).toFixed(2)} MB</p>
          <p>Type: {image.type}</p>
        </div>
      )}
    </motion.div>
  );
};

export default ImagePreview;
