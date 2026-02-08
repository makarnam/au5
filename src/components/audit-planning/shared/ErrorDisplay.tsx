import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface ValidationError {
  field: string;
  message: string;
}

interface ErrorDisplayProps {
  errors: Record<string, any>;
  validationErrors?: ValidationError[];
  onDismiss?: (field: string) => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errors, validationErrors = [], onDismiss }) => {
  const errorEntries = Object.entries(errors).filter(([, error]) => error?.message);

  if (errorEntries.length === 0 && validationErrors.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
      >
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-2">
              Please fix the following errors:
            </h3>
            <ul className="space-y-1">
              {/* React Hook Form errors */}
              {errorEntries.map(([field, error]) => (
                <motion.li
                  key={field}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-start space-x-2 text-sm text-red-700"
                >
                  <span className="text-red-500 mt-1">•</span>
                  <span className="flex-1">{error.message}</span>
                  {onDismiss && (
                    <button
                      onClick={() => onDismiss(field)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </motion.li>
              ))}

              {/* Custom validation errors */}
              {validationErrors.map((error, index) => (
                <motion.li
                  key={`validation-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-start space-x-2 text-sm text-red-700"
                >
                  <span className="text-red-500 mt-1">•</span>
                  <span className="flex-1">{error.message}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ErrorDisplay;