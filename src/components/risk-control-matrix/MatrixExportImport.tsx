import React, { useState, useRef } from 'react';
import {
  Download, Upload, FileText, Grid3X3, Database, FileCheck,
  AlertTriangle, CheckCircle, XCircle, RefreshCw, Settings,
  Eye, EyeOff, Trash2, Copy, ExternalLink, Info
} from 'lucide-react';
import { riskControlMatrixService } from '../../services/riskControlMatrixService';
import { RiskControlMatrix, MatrixTemplate } from '../../types/riskControlMatrix';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

interface MatrixExportImportProps {
  matrixId?: string;
  onImportComplete?: () => void;
  onExportComplete?: () => void;
}

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  extension: string;
  mimeType: string;
}

interface ImportResult {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

const MatrixExportImport: React.FC<MatrixExportImportProps> = ({
  matrixId,
  onImportComplete,
  onExportComplete
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportFormat, setExportFormat] = useState<string>('excel');
  const [exportOptions, setExportOptions] = useState({
    includeAnalytics: true,
    includeTemplates: false,
    includeHistory: false,
    includeMetadata: true,
    format: 'excel' as 'excel' | 'pdf' | 'csv' | 'json'
  });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportFormats: ExportFormat[] = [
    {
      id: 'excel',
      name: 'Excel (.xlsx)',
      description: 'Spreadsheet format with multiple sheets for detailed analysis',
      icon: Grid3X3,
      extension: 'xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    {
      id: 'pdf',
      name: 'PDF Report',
      description: 'Professional report format with charts and analytics',
      icon: FileText,
      extension: 'pdf',
      mimeType: 'application/pdf'
    },
    {
      id: 'csv',
      name: 'CSV Data',
      description: 'Simple comma-separated values for data processing',
      icon: Database,
      extension: 'csv',
      mimeType: 'text/csv'
    },
    {
      id: 'json',
      name: 'JSON Format',
      description: 'Structured data format for system integration',
      icon: FileCheck,
      extension: 'json',
      mimeType: 'application/json'
    }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setValidationErrors([]);
      previewFile(file);
    }
  };

  const previewFile = async (file: File) => {
    try {
      const preview = await riskControlMatrixService.previewImport(file);
      setImportPreview(preview);
    } catch (error) {
      setValidationErrors([`Failed to preview file: ${error}`]);
      setImportPreview(null);
    }
  };

  const validateImportData = (data: any): string[] => {
    const errors: string[] = [];

    if (!data.matrix) {
      errors.push('Matrix data is missing');
    } else {
      if (!data.matrix.name) errors.push('Matrix name is required');
      if (!data.matrix.matrix_type) errors.push('Matrix type is required');
      if (!data.matrix.risk_levels) errors.push('Risk levels are required');
      if (!data.matrix.control_effectiveness_levels) errors.push('Control effectiveness levels are required');
    }

    if (data.cells && !Array.isArray(data.cells)) {
      errors.push('Cells must be an array');
    }

    if (data.mappings && !Array.isArray(data.mappings)) {
      errors.push('Mappings must be an array');
    }

    return errors;
  };

  const handleImport = async () => {
    if (!importFile || !importPreview) return;

    setImporting(true);
    try {
      const result = await riskControlMatrixService.importMatrix(importFile, {
        validateOnly: false,
        createNew: true,
        overwriteExisting: false
      });

      if (result.success) {
        toast.success('Matrix imported successfully!');
        setImportFile(null);
        setImportPreview(null);
        setValidationErrors([]);
        onImportComplete?.();
      } else {
        setValidationErrors(result.errors || ['Import failed']);
        toast.error('Import failed. Please check the errors below.');
      }
    } catch (error) {
      setValidationErrors([`Import failed: ${error}`]);
      toast.error('Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    if (!matrixId) {
      toast.error('Please select a matrix to export');
      return;
    }

    setExporting(true);
    try {
      const blob = await riskControlMatrixService.exportMatrix(matrixId, exportOptions.format, exportOptions);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `risk-control-matrix-${matrixId}-${new Date().toISOString().split('T')[0]}.${exportOptions.format}`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('Matrix exported successfully!');
      onExportComplete?.();
    } catch (error) {
      toast.error('Export failed');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      setImportFile(file);
      setValidationErrors([]);
      previewFile(file);
    }
  };

  const clearImport = () => {
    setImportFile(null);
    setImportPreview(null);
    setValidationErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Export & Import</h2>
          <p className="text-gray-600">Export matrices in various formats or import from external sources</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('export')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'export'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'import'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
        </nav>
      </div>

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          {/* Format Selection */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exportFormats.map((format) => (
                <div
                  key={format.id}
                  onClick={() => setExportOptions({ ...exportOptions, format: format.id as any })}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    exportOptions.format === format.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <format.icon className="w-6 h-6 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{format.name}</h4>
                      <p className="text-sm text-gray-600">{format.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Export Options</h3>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">Include Analytics</label>
                  <p className="text-sm text-gray-600">Export charts and analytics data</p>
                </div>
                <input
                  type="checkbox"
                  checked={exportOptions.includeAnalytics}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeAnalytics: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">Include Metadata</label>
                  <p className="text-sm text-gray-600">Export creation date, author, and version info</p>
                </div>
                <input
                  type="checkbox"
                  checked={exportOptions.includeMetadata}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeMetadata: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              {showAdvanced && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-900">Include Templates</label>
                      <p className="text-sm text-gray-600">Export associated matrix templates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={exportOptions.includeTemplates}
                      onChange={(e) => setExportOptions({ ...exportOptions, includeTemplates: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-900">Include History</label>
                      <p className="text-sm text-gray-600">Export change history and audit trail</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={exportOptions.includeHistory}
                      onChange={(e) => setExportOptions({ ...exportOptions, includeHistory: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end">
            <button
              onClick={handleExport}
              disabled={exporting || !matrixId}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {exporting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {exporting ? 'Exporting...' : 'Export Matrix'}
            </button>
          </div>
        </div>
      )}

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* File Upload */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Matrix</h3>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Drop your file here</p>
              <p className="text-gray-600 mb-4">or click to browse</p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.csv,.json,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Choose File
              </button>
              
              <p className="text-sm text-gray-500 mt-4">
                Supported formats: Excel (.xlsx), CSV (.csv), JSON (.json), PDF (.pdf)
              </p>
            </div>

            {importFile && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{importFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {(importFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearImport}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <h4 className="font-medium text-red-900">Validation Errors</h4>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Import Preview */}
          {importPreview && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Import Preview</h3>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(importPreview, null, 2))}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" />
                  Copy JSON
                </button>
              </div>
              
              <div className="space-y-4">
                {importPreview.matrix && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Matrix Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <span className="ml-2 font-medium">{importPreview.matrix.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="ml-2 font-medium">{importPreview.matrix.matrix_type}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Risk Levels:</span>
                        <span className="ml-2 font-medium">{importPreview.matrix.risk_levels?.length || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Control Levels:</span>
                        <span className="ml-2 font-medium">{importPreview.matrix.control_effectiveness_levels?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                )}

                {importPreview.cells && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Matrix Cells</h4>
                    <p className="text-sm text-gray-600">
                      {importPreview.cells.length} cells will be imported
                    </p>
                  </div>
                )}

                {importPreview.mappings && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Risk-Control Mappings</h4>
                    <p className="text-sm text-gray-600">
                      {importPreview.mappings.length} mappings will be imported
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Import Button */}
          {importFile && importPreview && validationErrors.length === 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {importing ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {importing ? 'Importing...' : 'Import Matrix'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Need Help?</h4>
            <p className="text-sm text-blue-700 mb-2">
              {activeTab === 'export' 
                ? 'Export your risk control matrices in various formats for reporting, analysis, or backup purposes.'
                : 'Import matrices from external sources. Supported formats include Excel, CSV, JSON, and PDF files.'
              }
            </p>
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              View Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatrixExportImport;
