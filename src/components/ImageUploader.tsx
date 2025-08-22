import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageUpload(acceptedFiles[0]);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.bmp', '.tiff']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
        isDragActive
          ? 'border-purple-400 bg-purple-400/10'
          : 'border-white/30 hover:border-purple-400 hover:bg-white/5'
      }`}
    >
      <input {...getInputProps()} />
      
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="bg-white/10 p-4 rounded-full">
            {isDragActive ? (
              <Upload className="h-8 w-8 text-purple-400 animate-bounce" />
            ) : (
              <ImageIcon className="h-8 w-8 text-purple-300" />
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {isDragActive ? 'Drop your image here' : 'Upload an image'}
          </h3>
          <p className="text-purple-200 text-sm">
            Drag and drop an image file, or click to browse
          </p>
          <p className="text-purple-300 text-xs mt-2">
            Supports: JPEG, PNG, WebP, BMP, TIFF (max 10MB)
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ImageUploader;
