import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface ValidationError {
  field: string;
  message: string;
}

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  isValid?: boolean;
  nextLabel?: string;
  submitLabel?: string;
  canGoNext?: boolean;
  validationErrors?: ValidationError[];
}

const FormNavigation: React.FC<FormNavigationProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isLoading = false,
  isValid = true,
  nextLabel = "Next",
  submitLabel = "Create Plan",
  canGoNext = true,
  validationErrors = [],
}) => {
  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 pt-8 border-t border-gray-200"
    >
      {/* Validation Status */}
      <div className="flex justify-center">
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
          canGoNext
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {canGoNext ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Ready to proceed</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validationErrors.length > 0 ? (
                <ul className="ml-4 list-disc text-sm">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              ) : (
                <span>Complete required fields to continue</span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
      <div>
        {!isFirstStep && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onPrevious}
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </motion.button>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-500">
          Step {currentStep} of {totalSteps}
        </div>

        {!isLastStep ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onNext}
            disabled={isLoading || !canGoNext}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              canGoNext && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
            title={canGoNext ? 'Click to proceed to next step' : 'Complete required fields to continue'}
          >
            <span>{nextLabel}</span>
            <ChevronRight className="w-4 h-4" />
            {!canGoNext && (
              <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded">
                Incomplete
              </span>
            )}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onSubmit}
            disabled={isLoading || !isValid}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{submitLabel}</span>
          </motion.button>
        )}
      </div>
      </div>
    </motion.div>
  );
};

export default FormNavigation;