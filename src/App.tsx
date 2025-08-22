import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Download, Sparkles, Image as ImageIcon, Settings, Zap, Info, Eye, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUploader from './components/ImageUploader';
import ImagePreview from './components/ImagePreview';
import EnhancementControls from './components/EnhancementControls';
import ProcessingModal from './components/ProcessingModal';
import { ImageProcessor } from './utils/imageProcessor';

export interface EnhancementSettings {
  sharpening: number;
  denoising: number;
  brightness: number;
  contrast: number;
  saturation: number;
  useAI: boolean;
}

interface ImageInfo {
  width: number;
  height: number;
  size: number;
  type: string;
}

function App() {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [realtimePreview, setRealtimePreview] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRealtimeProcessing, setIsRealtimeProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showComparison, setShowComparison] = useState(true);
  const [settings, setSettings] = useState<EnhancementSettings>({
    sharpening: 40,
    denoising: 30,
    brightness: 5,
    contrast: 15,
    saturation: 10,
    useAI: true,
  });

  // Debounced real-time processing
  const processRealtimePreview = useCallback(
    async (file: File, settings: EnhancementSettings) => {
      if (!file) return;
      
      setIsRealtimeProcessing(true);
      try {
        const preview = await ImageProcessor.processImageRealtime(file, settings);
        setRealtimePreview(preview);
      } catch (error) {
        console.error('Real-time processing failed:', error);
      } finally {
        setIsRealtimeProcessing(false);
      }
    },
    []
  );

  // Effect for real-time processing with debouncing
  useEffect(() => {
    if (!originalImage) return;

    const timeoutId = setTimeout(() => {
      processRealtimePreview(originalImage, settings);
    }, 200); // 200ms debounce for better performance with heavy algorithms

    return () => clearTimeout(timeoutId);
  }, [originalImage, settings, processRealtimePreview]);

  const handleImageUpload = async (file: File) => {
    setOriginalImage(file);
    setEnhancedImage(null);
    setRealtimePreview(null);
    
    try {
      const info = await ImageProcessor.getImageInfo(file);
      setImageInfo(info);
    } catch (error) {
      console.error('Failed to get image info:', error);
    }
  };

  const handleEnhance = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    
    try {
      const enhanced = await ImageProcessor.processImage(
        originalImage,
        settings,
        setProcessingProgress
      );
      setEnhancedImage(enhanced);
    } catch (error) {
      console.error('Enhancement failed:', error);
      alert('Failed to enhance image. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handleDownload = () => {
    const imageToDownload = enhancedImage || realtimePreview;
    if (!imageToDownload) return;

    const link = document.createElement('a');
    link.download = `enhanced_${originalImage?.name || 'image.jpg'}`;
    link.href = imageToDownload;
    link.click();
  };

  const hasChanges = () => {
    return settings.sharpening > 0 || 
           settings.denoising > 0 || 
           settings.brightness !== 0 || 
           settings.contrast !== 0 || 
           settings.saturation !== 0 || 
           settings.useAI;
  };

  const getEnhancementStrength = () => {
    const total = Math.abs(settings.sharpening) + 
                  Math.abs(settings.denoising) + 
                  Math.abs(settings.brightness) + 
                  Math.abs(settings.contrast) + 
                  Math.abs(settings.saturation) + 
                  (settings.useAI ? 50 : 0);
    return Math.min(100, Math.round(total / 3));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Professional Image Enhancer</h1>
                  <p className="text-purple-200">Advanced AI-powered enhancement with real-time preview</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {originalImage && realtimePreview && (
                  <div className="flex items-center space-x-2 text-sm bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                    <Cpu className="h-4 w-4 text-purple-400" />
                    <span className="text-white">Enhancement: {getEnhancementStrength()}%</span>
                  </div>
                )}
                
                {originalImage && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowComparison(!showComparison)}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-all duration-200 flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>{showComparison ? 'Hide' : 'Show'} Comparison</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Upload className="h-5 w-5 text-purple-300" />
                    <h2 className="text-xl font-semibold text-white">Professional Enhancement</h2>
                  </div>
                  
                  {originalImage && realtimePreview && (
                    <div className="flex items-center space-x-4 text-sm">
                      {isRealtimeProcessing && (
                        <div className="flex items-center space-x-2 text-purple-300">
                          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                          <span>Processing...</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-3 py-1 rounded-full border border-green-500/30">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-300 font-medium">Live Preview Active</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {!originalImage ? (
                  <ImageUploader onImageUpload={handleImageUpload} />
                ) : (
                  <div className="space-y-6">
                    {/* Image Comparison */}
                    {showComparison ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ImagePreview
                          title="Original"
                          image={originalImage}
                          isFile={true}
                        />
                        
                        <div className="relative">
                          <ImagePreview
                            title={`Enhanced ${isRealtimeProcessing ? '(Processing...)' : ''}`}
                            image={realtimePreview || originalImage}
                            isFile={!realtimePreview}
                          />
                          {isRealtimeProcessing && (
                            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
                              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                                <div className="flex items-center space-x-2 text-white text-sm">
                                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                  <span>Applying professional enhancement...</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-white/5 rounded-xl overflow-hidden">
                        <img
                          src={realtimePreview || URL.createObjectURL(originalImage)}
                          alt="Enhanced preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    
                    {/* New Upload Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => document.querySelector('input[type="file"]')?.click()}
                      className="w-full py-3 px-4 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/10 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload Different Image</span>
                    </motion.button>
                    
                    {/* Hidden file input */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                      className="hidden"
                    />
                  </div>
                )}
                
                {/* Image Info */}
                {imageInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4"
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <Info className="h-4 w-4 text-purple-300" />
                      <h3 className="text-sm font-semibold text-white">Image Information</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-purple-200">Dimensions:</span>
                        <p className="text-white font-mono">{imageInfo.width} × {imageInfo.height}</p>
                      </div>
                      <div>
                        <span className="text-purple-200">File Size:</span>
                        <p className="text-white font-mono">{(imageInfo.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <div>
                        <span className="text-purple-200">Format:</span>
                        <p className="text-white font-mono">{imageInfo.type.split('/')[1].toUpperCase()}</p>
                      </div>
                      <div>
                        <span className="text-purple-200">Megapixels:</span>
                        <p className="text-white font-mono">{((imageInfo.width * imageInfo.height) / 1000000).toFixed(1)}MP</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Controls Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Enhancement Controls */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Settings className="h-5 w-5 text-purple-300" />
                  <h2 className="text-xl font-semibold text-white">Professional Controls</h2>
                </div>
                
                <EnhancementControls
                  settings={settings}
                  onChange={setSettings}
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEnhance}
                  disabled={!originalImage || isProcessing || !hasChanges()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/25"
                >
                  <Zap className="h-5 w-5" />
                  <span>
                    {isProcessing ? 'Processing...' : 
                     !hasChanges() ? 'No Changes to Apply' : 
                     'Apply Final Enhancement'}
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownload}
                  disabled={!realtimePreview && !enhancedImage}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 hover:bg-white/20"
                >
                  <Download className="h-5 w-5" />
                  <span>Download Enhanced Image</span>
                </motion.button>
              </div>

              {/* Processing Stats */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Enhancement Status</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-200">Status:</span>
                    <span className="text-white">
                      {isProcessing ? `Processing ${processingProgress}%` : 
                       isRealtimeProcessing ? 'Live Processing' :
                       realtimePreview || enhancedImage ? 'Enhanced' : 'Ready'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Enhancement Strength:</span>
                    <span className="text-white">{getEnhancementStrength()}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">AI Processing:</span>
                    <span className="text-white">{settings.useAI ? 'Active' : 'Disabled'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Active Filters:</span>
                    <span className="text-white">
                      {Object.entries(settings).filter(([key, value]) => 
                        key !== 'useAI' && typeof value === 'number' && value !== 0
                      ).length + (settings.useAI ? 1 : 0)}
                    </span>
                  </div>
                  {imageInfo && (
                    <div className="flex justify-between">
                      <span className="text-purple-200">Resolution:</span>
                      <span className="text-white">{imageInfo.width}×{imageInfo.height}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Processing Modal */}
      <ProcessingModal isOpen={isProcessing} progress={processingProgress} />
    </div>
  );
}

export default App;
