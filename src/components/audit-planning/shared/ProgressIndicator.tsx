import React from 'react';
import { motion } from 'framer-motion';
import { Check, FileText, Target, Settings, CheckCircle } from 'lucide-react';

interface Step {
  id: number;
  name: string;
  icon: React.ComponentType<any>;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  completedSteps = []
}) => {
  return (
    <div className="flex justify-between items-center mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = completedSteps.includes(step.id);
        const isAccessible = step.id <= currentStep;

        return (
          <div key={step.id} className="flex items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                ${
                  isActive
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                    : isCompleted
                      ? "bg-green-600 border-green-600 text-white"
                      : isAccessible
                        ? "bg-white border-blue-300 text-blue-600 hover:border-blue-400"
                        : "bg-gray-100 border-gray-300 text-gray-400"
                }
              `}
            >
              {isCompleted ? (
                <Check className="w-6 h-6" />
              ) : (
                <Icon className="w-6 h-6" />
              )}
            </motion.div>

            <div className="ml-4 hidden sm:block">
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "text-blue-600"
                    : isCompleted
                      ? "text-green-600"
                      : isAccessible
                        ? "text-gray-900"
                        : "text-gray-400"
                }`}
              >
                {step.name}
              </motion.p>
            </div>

            {index < steps.length - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                className={`flex-1 h-0.5 mx-6 transition-colors ${
                  step.id < currentStep ? "bg-green-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProgressIndicator;