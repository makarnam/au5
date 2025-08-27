import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DragDropMatrix from '../../../components/risk-control-matrix/DragDropMatrix';
import { RiskControlMatrix, RiskControlMapping } from '../../../types/riskControlMatrix';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockMatrix: RiskControlMatrix = {
  id: '1',
  name: 'Test Matrix',
  description: 'Test matrix for testing',
  matrix_type: '3x3',
  risk_levels: ['low', 'medium', 'high'],
  control_effectiveness_levels: ['excellent', 'good', 'adequate'],
  business_unit_id: '1',
  created_by: '1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockRisks = [
  {
    id: '1',
    title: 'Test Risk 1',
    risk_level: 'high',
    category: 'Operational',
  },
  {
    id: '2',
    title: 'Test Risk 2',
    risk_level: 'medium',
    category: 'Financial',
  },
];

const mockControls = [
  {
    id: '1',
    title: 'Test Control 1',
    control_type: 'Preventive',
    effectiveness: 'good',
  },
  {
    id: '2',
    title: 'Test Control 2',
    control_type: 'Detective',
    effectiveness: 'adequate',
  },
];

const mockMappings: RiskControlMapping[] = [
  {
    id: '1',
    matrix_id: '1',
    risk_id: '1',
    control_id: '1',
    mapping_date: '2024-01-01',
    mapped_by: '1',
    effectiveness_rating: 4,
    coverage_rating: 3,
    notes: 'Test mapping',
    created_at: '2024-01-01T00:00:00Z',
  },
];

const mockProps = {
  matrix: mockMatrix,
  risks: mockRisks,
  controls: mockControls,
  mappings: mockMappings,
  onMappingChange: jest.fn(),
  onRiskDrop: jest.fn(),
  onControlDrop: jest.fn(),
};

describe('DragDropMatrix', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the matrix grid correctly', () => {
    render(<DragDropMatrix {...mockProps} />);
    
    // Check if matrix title is displayed
    expect(screen.getByText('Risk Control Matrix - 3x3')).toBeInTheDocument();
    
    // Check if risk and control counts are displayed
    expect(screen.getByText('2 Risks')).toBeInTheDocument();
    expect(screen.getByText('2 Controls')).toBeInTheDocument();
    expect(screen.getByText('1 Mappings')).toBeInTheDocument();
  });

  it('renders draggable risk items', () => {
    render(<DragDropMatrix {...mockProps} />);
    
    expect(screen.getByText('Test Risk 1')).toBeInTheDocument();
    expect(screen.getByText('Test Risk 2')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
  });

  it('renders draggable control items', () => {
    render(<DragDropMatrix {...mockProps} />);
    
    expect(screen.getByText('Test Control 1')).toBeInTheDocument();
    expect(screen.getByText('Test Control 2')).toBeInTheDocument();
    expect(screen.getByText('good')).toBeInTheDocument();
    expect(screen.getByText('adequate')).toBeInTheDocument();
  });

  it('handles cell selection', () => {
    render(<DragDropMatrix {...mockProps} />);
    
    // Find and click on a cell (first cell should be 1-1)
    const cells = screen.getAllByRole('button');
    const firstCell = cells[0];
    
    fireEvent.click(firstCell);
    
    // Check if cell details are displayed
    expect(screen.getByText('Selected Cell Details')).toBeInTheDocument();
  });

  it('displays mapping count in cells', () => {
    render(<DragDropMatrix {...mockProps} />);
    
    // Check if mapping count badge is displayed
    const mappingBadges = screen.getAllByText(/mapping/);
    expect(mappingBadges.length).toBeGreaterThan(0);
  });

  it('handles drag start for risks', () => {
    render(<DragDropMatrix {...mockProps} />);
    
    const riskItem = screen.getByText('Test Risk 1').closest('[draggable]');
    expect(riskItem).toBeInTheDocument();
    
    if (riskItem) {
      fireEvent.dragStart(riskItem);
      // The component should handle drag start internally
    }
  });

  it('handles drag start for controls', () => {
    render(<DragDropMatrix {...mockProps} />);
    
    const controlItem = screen.getByText('Test Control 1').closest('[draggable]');
    expect(controlItem).toBeInTheDocument();
    
    if (controlItem) {
      fireEvent.dragStart(controlItem);
      // The component should handle drag start internally
    }
  });

  it('displays keyboard navigation instructions', () => {
    render(<DragDropMatrix {...mockProps} />);
    
    // Select a cell first
    const cells = screen.getAllByRole('button');
    fireEvent.click(cells[0]);
    
    // Check if keyboard navigation instructions are shown
    expect(screen.getByText('Use arrow keys to navigate')).toBeInTheDocument();
  });

  it('shows cell information when selected', () => {
    render(<DragDropMatrix {...mockProps} />);
    
    // Select a cell
    const cells = screen.getAllByRole('button');
    fireEvent.click(cells[0]);
    
    // Check if cell information is displayed
    expect(screen.getByText('Cell Information')).toBeInTheDocument();
    expect(screen.getByText(/Position:/)).toBeInTheDocument();
    expect(screen.getByText(/Risk Level:/)).toBeInTheDocument();
    expect(screen.getByText(/Control Effectiveness:/)).toBeInTheDocument();
    expect(screen.getByText(/Action Required:/)).toBeInTheDocument();
  });

  it('shows mappings information when selected', () => {
    render(<DragDropMatrix {...mockProps} />);
    
    // Select a cell
    const cells = screen.getAllByRole('button');
    fireEvent.click(cells[0]);
    
    // Check if mappings information is displayed
    expect(screen.getByText(/Mappings/)).toBeInTheDocument();
  });

  it('handles empty mappings gracefully', () => {
    const propsWithNoMappings = {
      ...mockProps,
      mappings: [],
    };
    
    render(<DragDropMatrix {...propsWithNoMappings} />);
    
    // Should still render without errors
    expect(screen.getByText('Risk Control Matrix - 3x3')).toBeInTheDocument();
    expect(screen.getByText('0 Mappings')).toBeInTheDocument();
  });

  it('displays tooltips on hover', async () => {
    render(<DragDropMatrix {...mockProps} />);
    
    const cells = screen.getAllByRole('button');
    const firstCell = cells[0];
    
    // Hover over cell to trigger tooltip
    fireEvent.mouseEnter(firstCell);
    
    // Wait for tooltip to appear
    await waitFor(() => {
      expect(screen.getByText(/Risk Level/)).toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', () => {
    render(<DragDropMatrix {...mockProps} />);
    
    const cells = screen.getAllByRole('button');
    
    cells.forEach(cell => {
      expect(cell).toHaveAttribute('tabIndex', '0');
      expect(cell).toHaveAttribute('role', 'button');
      expect(cell).toHaveAttribute('aria-label');
    });
  });
});
