import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Zap, Sparkles, Contrast, Sun, Palette } from 'lucide-react';
import { EnhancementSettings } from '../App';

interface EnhancementControlsProps {
  settings: EnhancementSettings;
  onChange: (settings: EnhancementSettings) => void;
}

const EnhancementControls: React.FC<EnhancementControlsProps> = ({ settings, onChange }) => {
  const handleSliderChange = (key: keyof EnhancementSettings, value: number) => {
    onChange({ ...settings, [key]: value });
  };

  const handleToggle = (key: keyof EnhancementSettings) => {
    onChange({ ...settings, [key]: !settings[key] });
  };

  const resetToDefaults = () => {
    onChange({
      sharpening: 40,
      denoising: 30,
      brightness: 5,
      contrast: 15,
      saturation: 10,
      useAI: true,
    });
  };

  const setModePreset = (mode: string) => {
    const presets = {
      portrait: {
        sharpening: 35,
        denoising: 40,
        brightness: 8,
        contrast: 12,
        saturation: 15,
        useAI: true,
      },
      landscape: {
        sharpening: 50,
        denoising: 25,
        brightness: 3,
        contrast: 20,
        saturation: 12,
        useAI: true,
      },
      vintage: {
        sharpening: 25,
        denoising: 35,
        brightness: -5,
        contrast: 25,
        saturation: -10,
        useAI: false,
      },
      professional: {
        sharpening: 60,
        denoising: 45,
        brightness: 0,
        contrast: 25,
        saturation: 8,
        useAI: true,
      }
    };
    
    const preset = presets[mode as keyof typeof presets];
    if (preset) {
      onChange(preset);
    }
  };

  const SliderControl = ({ 
    label, 
    value, 
    onChange, 
    min = 0, 
    max = 100, 
    step = 1,
    description,
    icon: Icon
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    description?: string;
    icon?: React.ComponentType<{ className?: string }>;
  }) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="h-4 w-4 text-purple-400" />}
          <div>
            <label className="text-sm font-semibold text-purple-200">{label}</label>
            {description && (
              <p className="text-xs text-purple-300/70 mt-1">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-white font-mono bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-2 py-1 rounded-md border border-white/10">
            {value > 0 && min >= 0 ? '+' : ''}{value}
          </span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-3 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg appearance-none cursor-pointer slider border border-white/10"
          style={{
            background: `linear-gradient(to right, 
              rgba(139, 92, 246, 0.3) 0%, 
              rgba(236, 72, 153, 0.3) ${((value - min) / (max - min)) * 100}%, 
              rgba(255, 255, 255, 0.1) ${((value - min) / (max - min)) * 100}%, 
              rgba(255, 255, 255, 0.1) 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-purple-300/60 mt-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Enhancement Presets */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-purple-200 flex items-center space-x-2">
          <Sparkles className="h-4 w-4" />
          <span>Quick Presets</span>
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'professional', label: 'Professional', desc: 'Maximum quality' },
            { key: 'portrait', label: 'Portrait', desc: 'Skin-friendly' },
            { key: 'landscape', label: 'Landscape', desc: 'Nature scenes' },
            { key: 'vintage', label: 'Vintage', desc: 'Classic look' }
          ].map(preset => (
            <motion.button
              key={preset.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setModePreset(preset.key)}
              className="p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-left hover:bg-white/10 transition-all duration-200"
            >
              <div className="text-xs font-medium text-white">{preset.label}</div>
              <div className="text-xs text-purple-300/70">{preset.desc}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* AI Enhancement Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20"
      >
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white">AI Enhancement</span>
            <p className="text-xs text-purple-200 mt-1">Professional-grade AI processing with detail enhancement and color optimization</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleToggle('useAI')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.useAI ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-white/20'
          }`}
        >
          <motion.span
            animate={{ x: settings.useAI ? 20 : 2 }}
            transition={{ duration: 0.2 }}
            className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
          />
        </motion.button>
      </motion.div>

      {/* Advanced Controls */}
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-purple-200">Advanced Controls</h3>
        
        <SliderControl
          label="Professional Sharpening"
          description="Unsharp mask algorithm for maximum detail enhancement"
          value={settings.sharpening}
          onChange={(value) => handleSliderChange('sharpening', value)}
          max={100}
          icon={Contrast}
        />
        
        <SliderControl
          label="Bilateral Denoising"
          description="Edge-preserving noise reduction for cleaner images"
          value={settings.denoising}
          onChange={(value) => handleSliderChange('denoising', value)}
          max={100}
          icon={Sparkles}
        />
        
        <SliderControl
          label="Adaptive Brightness"
          description="Intelligent brightness with tone mapping"
          value={settings.brightness}
          onChange={(value) => handleSliderChange('brightness', value)}
          min={-50}
          max={50}
          icon={Sun}
        />
        
        <SliderControl
          label="S-Curve Contrast"
          description="Professional contrast enhancement with smooth transitions"
          value={settings.contrast}
          onChange={(value) => handleSliderChange('contrast', value)}
          min={-50}
          max={50}
          icon={Contrast}
        />
        
        <SliderControl
          label="HSL Saturation"
          description="Luminance-preserving color intensity adjustment"
          value={settings.saturation}
          onChange={(value) => handleSliderChange('saturation', value)}
          min={-50}
          max={50}
          icon={Palette}
        />
      </div>

      {/* Reset Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={resetToDefaults}
        className="w-full py-3 px-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 text-white rounded-xl text-sm font-medium hover:from-white/20 hover:to-white/10 transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <RotateCcw className="h-4 w-4" />
        <span>Reset to Professional Settings</span>
      </motion.button>
    </div>
  );
};

export default EnhancementControls;
