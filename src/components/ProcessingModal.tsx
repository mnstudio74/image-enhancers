import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Cpu, Zap, Image as ImageIcon } from 'lucide-react';

interface ProcessingModalProps {
  isOpen: boolean;
  progress?: number;
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({ isOpen, progress = 0 }) => {
  const getProcessingStep = (progress: number) => {
    if (progress < 25) return { icon: ImageIcon, text: 'Loading and analyzing image...', step: 1 };
    if (progress < 50) return { icon: Cpu, text: 'Applying enhancement filters...', step: 2 };
    if (progress < 80) return { icon: Zap, text: 'Processing advanced algorithms...', step: 3 };
    return { icon: Sparkles, text: 'Finalizing improvements...', step: 4 };
  };

  const currentStep = getProcessingStep(progress);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 max-w-md w-full"
          >
            <div className="text-center space-y-6">
              {/* Main Animation */}
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                >
                  <currentStep.icon className="h-10 w-10 text-white" />
                </motion.div>
                
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-purple-500/20 rounded-full"
                />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Enhancing Image</h3>
                <p className="text-purple-200 mb-4">{currentStep.text}</p>
                <div className="text-3xl font-mono text-white">{Math.round(progress)}%</div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>

              {/* Processing Steps */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      step <= currentStep.step
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>

              <p className="text-sm text-purple-300">
                Processing step {currentStep.step} of 4
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProcessingModal;
