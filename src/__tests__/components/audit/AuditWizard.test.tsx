import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AuditWizard from '../../../components/audit/AuditWizard';

describe('AuditWizard', () => {
  it('renders the first step with required fields', () => {
    render(<AuditWizard />);
    
    // Check if the first step is rendered
    expect(screen.getByText('Create Audit')).toBeInTheDocument();
    expect(screen.getByLabelText('Audit Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Department')).toBeInTheDocument();
    
    // Check if the Next button is enabled
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeInTheDocument();
    
    // Check if the Back button is disabled on the first step
    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toBeDisabled();
  });

  it('validates required fields before proceeding to the next step', async () => {
    render(<AuditWizard />);
    
    // Try to proceed without filling required fields
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    // Check for validation errors
    expect(await screen.findByText(/name too short/i)).toBeInTheDocument();
    expect(screen.getByText(/required/i)).toBeInTheDocument();
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Audit Name'), {
      target: { value: 'Test Audit' },
    });
    fireEvent.change(screen.getByLabelText('Department'), {
      target: { value: 'it' },
    });
    
    // Try to proceed again
    fireEvent.click(nextButton);
    
    // Should now be on the second step
    expect(screen.getByText('Schedule')).toBeInTheDocument();
  });

  it('navigates through all steps and submits the form', async () => {
    const onComplete = vi.fn();
    render(<AuditWizard onComplete={onComplete} />);
    
    // Step 1: Fill basic info
    fireEvent.change(screen.getByLabelText('Audit Name'), {
      target: { value: 'Test Audit' },
    });
    fireEvent.change(screen.getByLabelText('Department'), {
      target: { value: 'it' },
    });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    // Step 2: Fill schedule
    fireEvent.change(screen.getByLabelText('Start Date'), {
      target: { value: '2024-01-01' },
    });
    fireEvent.change(screen.getByLabelText('End Date'), {
      target: { value: '2024-01-31' },
    });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    // Step 3: Fill scope
    fireEvent.change(screen.getByLabelText('Scope'), {
      target: { value: 'This is a detailed scope for the test audit' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Check if onComplete was called
    expect(onComplete).toHaveBeenCalled();
    
    // Check the form data that would be submitted
    expect(onComplete.mock.calls[0][0]).toMatchObject({
      name: 'Test Audit',
      department: 'it',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      scope: 'This is a detailed scope for the test audit',
    });
  });
});
