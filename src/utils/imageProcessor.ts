export interface ProcessingSettings {
  sharpening: number;
  denoising: number;
  brightness: number;
  contrast: number;
  saturation: number;
  useAI: boolean;
}

export class ImageProcessor {
  // Advanced unsharp masking for professional sharpening
  private static applyUnsharpMask(
    imageData: ImageData,
    width: number,
    height: number,
    amount: number,
    radius: number = 1,
    threshold: number = 0
  ): ImageData {
    const data = imageData.data;
    const outputData = new Uint8ClampedArray(data);
    
    // Create Gaussian blur for unsharp mask
    const blurred = this.gaussianBlur(imageData, width, height, radius);
    
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) { // RGB channels
        const original = data[i + c];
        const blurredValue = blurred.data[i + c];
        const diff = original - blurredValue;
        
        if (Math.abs(diff) > threshold) {
          const sharpened = original + (diff * amount);
          outputData[i + c] = Math.min(255, Math.max(0, sharpened));
        } else {
          outputData[i + c] = original;
        }
      }
      outputData[i + 3] = data[i + 3]; // Alpha
    }
    
    return new ImageData(outputData, width, height);
  }

  // Advanced Gaussian blur implementation
  private static gaussianBlur(
    imageData: ImageData,
    width: number,
    height: number,
    radius: number
  ): ImageData {
    const data = imageData.data;
    const outputData = new Uint8ClampedArray(data);
    
    // Generate Gaussian kernel
    const kernel = this.generateGaussianKernel(radius);
    const kernelSize = kernel.length;
    const halfKernel = Math.floor(kernelSize / 2);
    
    // Horizontal pass
    const tempData = new Uint8ClampedArray(data);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          let weightSum = 0;
          
          for (let k = 0; k < kernelSize; k++) {
            const px = x + k - halfKernel;
            if (px >= 0 && px < width) {
              const idx = (y * width + px) * 4 + c;
              sum += data[idx] * kernel[k];
              weightSum += kernel[k];
            }
          }
          
          tempData[(y * width + x) * 4 + c] = sum / weightSum;
        }
        tempData[(y * width + x) * 4 + 3] = data[(y * width + x) * 4 + 3];
      }
    }
    
    // Vertical pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          let weightSum = 0;
          
          for (let k = 0; k < kernelSize; k++) {
            const py = y + k - halfKernel;
            if (py >= 0 && py < height) {
              const idx = (py * width + x) * 4 + c;
              sum += tempData[idx] * kernel[k];
              weightSum += kernel[k];
            }
          }
          
          outputData[(y * width + x) * 4 + c] = sum / weightSum;
        }
        outputData[(y * width + x) * 4 + 3] = tempData[(y * width + x) * 4 + 3];
      }
    }
    
    return new ImageData(outputData, width, height);
  }

  private static generateGaussianKernel(radius: number): number[] {
    const size = Math.max(3, Math.ceil(radius * 6) | 1); // Ensure odd size
    const kernel = new Array(size);
    const sigma = radius / 3;
    const twoSigmaSquare = 2 * sigma * sigma;
    const center = Math.floor(size / 2);
    let sum = 0;
    
    for (let i = 0; i < size; i++) {
      const x = i - center;
      kernel[i] = Math.exp(-(x * x) / twoSigmaSquare);
      sum += kernel[i];
    }
    
    // Normalize
    for (let i = 0; i < size; i++) {
      kernel[i] /= sum;
    }
    
    return kernel;
  }

  // Advanced brightness and contrast with tone mapping
  private static applyAdvancedToneMapping(
    imageData: ImageData,
    brightness: number,
    contrast: number
  ): ImageData {
    const data = imageData.data;
    
    // Calculate histogram for adaptive processing
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      const luminance = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      histogram[luminance]++;
    }
    
    // Calculate cumulative distribution
    const cdf = new Array(256);
    cdf[0] = histogram[0];
    for (let i = 1; i < 256; i++) {
      cdf[i] = cdf[i - 1] + histogram[i];
    }
    
    const totalPixels = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        let value = data[i + c];
        
        // Apply contrast with S-curve
        const normalized = value / 255;
        const contrasted = this.applySCurve(normalized, contrast / 100);
        
        // Apply brightness with gamma correction
        const brightened = Math.pow(contrasted, 1 + brightness / 100) * 255;
        
        data[i + c] = Math.min(255, Math.max(0, brightened));
      }
    }
    
    return imageData;
  }

  private static applySCurve(value: number, strength: number): number {
    if (strength === 0) return value;
    
    const factor = strength * 2;
    if (factor > 0) {
      // Increase contrast
      return 0.5 + Math.tanh(factor * (value - 0.5)) / (2 * Math.tanh(factor / 2));
    } else {
      // Decrease contrast
      const absFactor = Math.abs(factor);
      return 0.5 + (value - 0.5) / (1 + absFactor);
    }
  }

  // Advanced saturation with luminance preservation
  private static applyAdvancedSaturation(imageData: ImageData, saturation: number): ImageData {
    const data = imageData.data;
    const factor = (saturation + 100) / 100;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      
      // Convert to HSL for better saturation control
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const diff = max - min;
      const sum = max + min;
      const l = sum / 2;
      
      if (diff === 0) continue; // Grayscale pixel
      
      const s = l > 0.5 ? diff / (2 - sum) : diff / sum;
      let h = 0;
      
      if (max === r) h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / diff + 2) / 6;
      else if (max === b) h = ((r - g) / diff + 4) / 6;
      
      // Apply saturation
      const newS = Math.min(1, Math.max(0, s * factor));
      
      // Convert back to RGB
      const c = (1 - Math.abs(2 * l - 1)) * newS;
      const x = c * (1 - Math.abs((h * 6) % 2 - 1));
      const m = l - c / 2;
      
      let rPrime = 0, gPrime = 0, bPrime = 0;
      const hSector = Math.floor(h * 6);
      
      switch (hSector) {
        case 0: rPrime = c; gPrime = x; bPrime = 0; break;
        case 1: rPrime = x; gPrime = c; bPrime = 0; break;
        case 2: rPrime = 0; gPrime = c; bPrime = x; break;
        case 3: rPrime = 0; gPrime = x; bPrime = c; break;
        case 4: rPrime = x; gPrime = 0; bPrime = c; break;
        case 5: rPrime = c; gPrime = 0; bPrime = x; break;
      }
      
      data[i] = Math.min(255, Math.max(0, (rPrime + m) * 255));
      data[i + 1] = Math.min(255, Math.max(0, (gPrime + m) * 255));
      data[i + 2] = Math.min(255, Math.max(0, (bPrime + m) * 255));
    }
    
    return imageData;
  }

  // Advanced noise reduction using bilateral filtering
  private static applyBilateralFilter(
    imageData: ImageData,
    width: number,
    height: number,
    spatialSigma: number,
    intensitySigma: number
  ): ImageData {
    const data = imageData.data;
    const outputData = new Uint8ClampedArray(data);
    const radius = Math.ceil(spatialSigma * 2);
    
    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        for (let c = 0; c < 3; c++) {
          const centerIdx = (y * width + x) * 4 + c;
          const centerValue = data[centerIdx];
          let sum = 0;
          let weightSum = 0;
          
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const idx = ((y + dy) * width + (x + dx)) * 4 + c;
              const pixelValue = data[idx];
              
              // Spatial weight (Gaussian)
              const spatialDistance = dx * dx + dy * dy;
              const spatialWeight = Math.exp(-spatialDistance / (2 * spatialSigma * spatialSigma));
              
              // Intensity weight (Gaussian)
              const intensityDistance = Math.abs(centerValue - pixelValue);
              const intensityWeight = Math.exp(-intensityDistance * intensityDistance / (2 * intensitySigma * intensitySigma));
              
              const weight = spatialWeight * intensityWeight;
              sum += pixelValue * weight;
              weightSum += weight;
            }
          }
          
          outputData[centerIdx] = weightSum > 0 ? sum / weightSum : centerValue;
        }
        outputData[(y * width + x) * 4 + 3] = data[(y * width + x) * 4 + 3];
      }
    }
    
    return new ImageData(outputData, width, height);
  }

  // Advanced AI enhancement with multiple techniques
  private static applyAdvancedAIEnhancement(imageData: ImageData, width: number, height: number): ImageData {
    const data = imageData.data;
    
    // Step 1: Edge-preserving smoothing
    let enhanced = this.applyBilateralFilter(imageData, width, height, 3, 25);
    
    // Step 2: Local contrast enhancement (CLAHE simulation)
    enhanced = this.applyCLAHE(enhanced, width, height);
    
    // Step 3: Detail enhancement
    enhanced = this.enhanceDetails(enhanced, width, height);
    
    // Step 4: Color enhancement
    enhanced = this.enhanceColors(enhanced);
    
    return enhanced;
  }

  // Contrast Limited Adaptive Histogram Equalization simulation
  private static applyCLAHE(imageData: ImageData, width: number, height: number): ImageData {
    const data = imageData.data;
    const blockSize = 64;
    const clipLimit = 3.0;
    
    for (let by = 0; by < height; by += blockSize) {
      for (let bx = 0; bx < width; bx += blockSize) {
        const endY = Math.min(by + blockSize, height);
        const endX = Math.min(bx + blockSize, width);
        
        // Calculate histogram for this block
        const histogram = new Array(256).fill(0);
        let pixelCount = 0;
        
        for (let y = by; y < endY; y++) {
          for (let x = bx; x < endX; x++) {
            const idx = (y * width + x) * 4;
            const luminance = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
            histogram[luminance]++;
            pixelCount++;
          }
        }
        
        // Apply contrast limiting
        const clipValue = (clipLimit * pixelCount) / 256;
        let excess = 0;
        for (let i = 0; i < 256; i++) {
          if (histogram[i] > clipValue) {
            excess += histogram[i] - clipValue;
            histogram[i] = clipValue;
          }
        }
        
        // Redistribute excess
        const redistribute = excess / 256;
        for (let i = 0; i < 256; i++) {
          histogram[i] += redistribute;
        }
        
        // Calculate CDF
        const cdf = new Array(256);
        cdf[0] = histogram[0];
        for (let i = 1; i < 256; i++) {
          cdf[i] = cdf[i - 1] + histogram[i];
        }
        
        // Apply equalization to block
        for (let y = by; y < endY; y++) {
          for (let x = bx; x < endX; x++) {
            const idx = (y * width + x) * 4;
            for (let c = 0; c < 3; c++) {
              const value = data[idx + c];
              const newValue = (cdf[value] / pixelCount) * 255;
              data[idx + c] = Math.min(255, Math.max(0, newValue));
            }
          }
        }
      }
    }
    
    return imageData;
  }

  // Detail enhancement using high-pass filtering
  private static enhanceDetails(imageData: ImageData, width: number, height: number): ImageData {
    const blurred = this.gaussianBlur(imageData, width, height, 2);
    const data = imageData.data;
    const blurredData = blurred.data;
    
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const detail = data[i + c] - blurredData[i + c];
        const enhanced = data[i + c] + detail * 0.8;
        data[i + c] = Math.min(255, Math.max(0, enhanced));
      }
    }
    
    return imageData;
  }

  // Advanced color enhancement
  private static enhanceColors(imageData: ImageData): ImageData {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i] / 255;
      let g = data[i + 1] / 255;
      let b = data[i + 2] / 255;
      
      // Apply color temperature adjustment
      r = Math.pow(r, 0.9) * 1.05;
      g = Math.pow(g, 0.95) * 1.02;
      b = Math.pow(b, 1.1) * 0.98;
      
      // Enhance color separation
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      if (max > min) {
        const factor = 1.15;
        r = min + (r - min) * factor;
        g = min + (g - min) * factor;
        b = min + (b - min) * factor;
      }
      
      data[i] = Math.min(255, Math.max(0, r * 255));
      data[i + 1] = Math.min(255, Math.max(0, g * 255));
      data[i + 2] = Math.min(255, Math.max(0, b * 255));
    }
    
    return imageData;
  }

  // Bicubic upscaling for better quality
  private static bicubicUpscale(imageData: ImageData, scaleFactor: number): ImageData {
    const srcWidth = imageData.width;
    const srcHeight = imageData.height;
    const dstWidth = Math.round(srcWidth * scaleFactor);
    const dstHeight = Math.round(srcHeight * scaleFactor);
    
    const srcData = imageData.data;
    const dstData = new Uint8ClampedArray(dstWidth * dstHeight * 4);
    
    for (let y = 0; y < dstHeight; y++) {
      for (let x = 0; x < dstWidth; x++) {
        const srcX = x / scaleFactor;
        const srcY = y / scaleFactor;
        
        for (let c = 0; c < 4; c++) {
          const value = this.bicubicInterpolate(srcData, srcWidth, srcHeight, srcX, srcY, c);
          dstData[(y * dstWidth + x) * 4 + c] = Math.min(255, Math.max(0, value));
        }
      }
    }
    
    return new ImageData(dstData, dstWidth, dstHeight);
  }

  private static bicubicInterpolate(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    x: number,
    y: number,
    channel: number
  ): number {
    const x1 = Math.floor(x);
    const y1 = Math.floor(y);
    const dx = x - x1;
    const dy = y - y1;
    
    const getValue = (px: number, py: number): number => {
      px = Math.min(width - 1, Math.max(0, px));
      py = Math.min(height - 1, Math.max(0, py));
      return data[(py * width + px) * 4 + channel];
    };
    
    const cubic = (t: number): number => {
      const a = -0.5;
      const absT = Math.abs(t);
      if (absT <= 1) {
        return (a + 2) * absT * absT * absT - (a + 3) * absT * absT + 1;
      } else if (absT <= 2) {
        return a * absT * absT * absT - 5 * a * absT * absT + 8 * a * absT - 4 * a;
      }
      return 0;
    };
    
    let result = 0;
    for (let m = -1; m <= 2; m++) {
      for (let n = -1; n <= 2; n++) {
        const value = getValue(x1 + n, y1 + m);
        const weight = cubic(dx - n) * cubic(dy - m);
        result += value * weight;
      }
    }
    
    return result;
  }

  private static createOptimizedCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
      willReadFrequently: true
    });
    
    if (!ctx) throw new Error('Canvas context not available');
    
    canvas.width = width;
    canvas.height = height;
    
    return { canvas, ctx };
  }

  // Real-time processing with aggressive enhancements
  static async processImageRealtime(
    file: File,
    settings: ProcessingSettings
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          // Use moderate size for real-time processing
          const maxSize = 800;
          const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
          const width = Math.floor(img.width * scale);
          const height = Math.floor(img.height * scale);

          const { canvas, ctx } = this.createOptimizedCanvas(width, height);
          ctx.drawImage(img, 0, 0, width, height);

          let imageData = ctx.getImageData(0, 0, width, height);

          // Apply aggressive enhancements for real-time preview
          if (settings.denoising > 0) {
            const spatialSigma = 2 + (settings.denoising / 100) * 3;
            const intensitySigma = 15 + (settings.denoising / 100) * 35;
            imageData = this.applyBilateralFilter(imageData, width, height, spatialSigma, intensitySigma);
          }

          if (settings.brightness !== 0 || settings.contrast !== 0) {
            imageData = this.applyAdvancedToneMapping(imageData, settings.brightness, settings.contrast);
          }

          if (settings.saturation !== 0) {
            imageData = this.applyAdvancedSaturation(imageData, settings.saturation);
          }

          if (settings.sharpening > 0) {
            const amount = 0.5 + (settings.sharpening / 100) * 2;
            const radius = 1 + (settings.sharpening / 100) * 1.5;
            imageData = this.applyUnsharpMask(imageData, width, height, amount, radius, 3);
          }

          if (settings.useAI) {
            imageData = this.applyAdvancedAIEnhancement(imageData, width, height);
          }

          ctx.putImageData(imageData, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Full quality processing with maximum enhancement
  static async processImage(
    file: File,
    settings: ProcessingSettings,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          // Optional upscaling for better quality
          let scale = 1;
          if (img.width * img.height < 1000000) { // Less than 1MP
            scale = Math.min(2, 1500 / Math.max(img.width, img.height));
          }
          
          const width = Math.floor(img.width * scale);
          const height = Math.floor(img.height * scale);

          const { canvas, ctx } = this.createOptimizedCanvas(width, height);
          ctx.drawImage(img, 0, 0, width, height);
          onProgress?.(10);

          let imageData = ctx.getImageData(0, 0, width, height);

          // Apply comprehensive enhancement pipeline
          if (settings.denoising > 0) {
            const spatialSigma = 3 + (settings.denoising / 100) * 4;
            const intensitySigma = 20 + (settings.denoising / 100) * 50;
            imageData = this.applyBilateralFilter(imageData, width, height, spatialSigma, intensitySigma);
            onProgress?.(25);
          }

          if (settings.useAI) {
            imageData = this.applyAdvancedAIEnhancement(imageData, width, height);
            onProgress?.(50);
          }

          if (settings.brightness !== 0 || settings.contrast !== 0) {
            imageData = this.applyAdvancedToneMapping(imageData, settings.brightness, settings.contrast);
            onProgress?.(65);
          }

          if (settings.saturation !== 0) {
            imageData = this.applyAdvancedSaturation(imageData, settings.saturation);
            onProgress?.(80);
          }

          if (settings.sharpening > 0) {
            const amount = 1 + (settings.sharpening / 100) * 3;
            const radius = 1.2 + (settings.sharpening / 100) * 2;
            imageData = this.applyUnsharpMask(imageData, width, height, amount, radius, 2);
            onProgress?.(95);
          }

          ctx.putImageData(imageData, 0, 0);
          onProgress?.(100);

          resolve(canvas.toDataURL('image/jpeg', 0.98));
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  static async getImageInfo(file: File): Promise<{
    width: number;
    height: number;
    size: number;
    type: string;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type
        });
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}
