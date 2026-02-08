import { useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AuditPlanningWizardData } from '../form/validationSchemas';

interface UseFormPersistenceOptions {
  form: UseFormReturn<AuditPlanningWizardData>;
  storageKey: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export const useFormPersistence = ({
  form,
  storageKey,
  autoSave = true,
  autoSaveDelay = 2000,
}: UseFormPersistenceOptions) => {
  const { watch, reset, getValues } = form;

  // Load saved data on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Only load if the data structure is valid
        if (parsedData && typeof parsedData === 'object') {
          reset(parsedData);
        }
      }
    } catch (error) {
      console.warn('Failed to load saved form data:', error);
    }
  }, [storageKey, reset]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave) return;

    let timeoutId: NodeJS.Timeout;

    const subscription = watch((data) => {
      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set new timeout for auto-save
      timeoutId = setTimeout(() => {
        try {
          const currentData = getValues();
          localStorage.setItem(storageKey, JSON.stringify(currentData));
        } catch (error) {
          console.warn('Failed to auto-save form data:', error);
        }
      }, autoSaveDelay);
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [watch, getValues, storageKey, autoSave, autoSaveDelay]);

  // Manual save function
  const saveFormData = useCallback(() => {
    try {
      const currentData = getValues();
      localStorage.setItem(storageKey, JSON.stringify(currentData));
      return true;
    } catch (error) {
      console.error('Failed to save form data:', error);
      return false;
    }
  }, [getValues, storageKey]);

  // Load saved data manually
  const loadFormData = useCallback(() => {
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        reset(parsedData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load form data:', error);
      return false;
    }
  }, [storageKey, reset]);

  // Clear saved data
  const clearFormData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error('Failed to clear form data:', error);
      return false;
    }
  }, [storageKey]);

  // Check if there's saved data
  const hasSavedData = useCallback(() => {
    try {
      return localStorage.getItem(storageKey) !== null;
    } catch {
      return false;
    }
  }, [storageKey]);

  return {
    saveFormData,
    loadFormData,
    clearFormData,
    hasSavedData,
  };
};