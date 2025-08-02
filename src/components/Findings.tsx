import React, { useState } from 'react';
import { Search, AlertCircle, CheckCircle, Clock, FileText, Filter, Plus } from 'lucide-react';

const Findings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'closed'>('all');
  const [selectedFinding, setSelectedFinding] = useState<number | null>(null);

  const findings = [
    {
      id: 1,
      title: 'Inadequate Password Policy Implementation',
      description: 'Current password policies do not meet industry standards for complexity and rotation',
      severity: 'High',
      status: 'Open',
      category: 'Access Control',
      auditArea: 'IT Security Audit 2024',
      identifiedDate: '2024-01-15',
      dueDate: '2024-02-15',
      assignee: 'IT Security Team',
      details: {
        observation: 'During testing of user accounts, it was found that 45% of users have passwords that do not meet complexity requirements. Additionally, password rotation is not enforced for administrative accounts.',
        criteria: 'Password policies should require minimum 12 characters, combination of uppercase, lowercase, numbers and special characters, and 90-day rotation for privileged accounts.',
        condition: 'Current policy allows 8-character passwords and does not enforce regular rotation for admin accounts.',
        cause: 'Legacy system limitations and lack of centralized password management tools.',
        effect: 'Increased risk of unauthorized access through compromised credentials.',
        recommendation: 'Implement enterprise password management solution, update password policies, and enforce compliance monitoring.'
      },
      relatedControls: ['Multi-Factor Authentication', 'User Access Management'],
      evidence: ['Password complexity audit report', 'User account analysis', 'Policy documentation review']
    },
    {
      id: 2,
      title: 'Missing Documentation for Financial Close Process',
      description: 'Key financial close procedures lack proper documentation and approval workflows',
      severity: 'Medium',
      status: 'In Progress',
      category: 'Financial Controls',
      auditArea: 'Financial Controls Review',
      identifiedDate: '2024-01-10',
      dueDate: '2024-02-28',
      assignee: 'Finance Team',
      details: {
        observation: 'Several critical steps in the month-end financial close process are not documented. Manual procedures rely on institutional knowledge without formal written procedures.',
        criteria: 'All financial processes should have documented procedures with defined roles, responsibilities, and approval requirements.',
        condition: 'Three key reconciliation processes lack written procedures and approval workflows.',
        cause: 'Rapid growth and staff turnover without adequate knowledge transfer processes.',
        effect: 'Risk of errors, delays in financial reporting, and compliance issues.',
        recommendation: 'Document all critical financial processes, implement approval workflows, and establish regular review cycles.'
      },
      relatedControls: ['Financial Reporting Controls', 'Management Review Process'],
      evidence: ['Process walkthrough documentation', 'Interview notes', 'Current procedure gaps analysis']
    },
    {
      id: 3,
      title: 'Vendor Risk Assessment Gaps',
      description: 'Third-party vendor assessments do not adequately evaluate security and compliance risks',
      severity: 'Medium',
      status: 'Open',
      category: 'Third Party Risk',
      auditArea: 'Vendor Management Audit',
      identifiedDate: '2024-01-12',
      dueDate: '2024-03-15',
      assignee: 'Procurement Team',
      details: {
        observation: 'Current vendor onboarding process lacks comprehensive security questionnaires and ongoing monitoring of vendor compliance status.',
        criteria: 'All vendors handling sensitive data should undergo thorough security assessments and regular compliance monitoring.',
        condition: 'Security assessments are limited to basic questionnaires without validation or ongoing monitoring.',
        cause: 'Lack of standardized vendor risk assessment framework and dedicated resources.',
        effect: 'Potential data breaches, compliance violations, and operational disruptions through vendor channels.',
        recommendation: 'Implement comprehensive vendor risk assessment program with regular monitoring and review cycles.'
      },
      relatedControls: ['Vendor Due Diligence', 'Third Party Monitoring'],
      evidence: ['Vendor assessment forms', 'Security questionnaire analysis', 'Contract review findings']
    },
    {
      id: 4,
      title: 'Data Retention Policy Non-Compliance',
      description: 'Data retention practices do not align with established policies and regulatory requirements',
      severity: 'High',
      status: 'Closed',
      category: 'Data Management',
      auditArea: 'Data Governance Audit',
      identifiedDate: '2023-12-05',
      dueDate: '2024-01-15',
      assignee: 'IT Operations',
      details: {
        observation: 'Review of data storage systems revealed retention of customer data beyond policy requirements and regulatory limits.',
        criteria: 'Data should be retained only as long as necessary for business purposes and in compliance with applicable regulations.',
        condition: 'Customer data is being retained 2-3 years beyond policy requirements in multiple systems.',
        cause: 'Automated deletion processes were not implemented when retention policies were updated.',
        effect: 'Increased storage costs, regulatory compliance violations, and privacy risks.',
        recommendation: 'Implement automated data lifecycle management with regular compliance monitoring.'
      },
      relatedControls: ['Data Lifecycle Management', 'Privacy Controls'],
      evidence: ['Data inventory analysis', 'Retention policy review', 'System configuration audit'],
      resolutionNotes: 'Automated deletion processes implemented and verified. Data retention now complies with policy requirements.'
    }
  ];

  const filteredFindings = findings.filter(finding => {
    if (activeTab === 'open') return finding.status === 'Open' || finding.status === 'In Progress';
    if (activeTab === 'closed') return finding.status === 'Closed';
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-red-100 text-red-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'Closed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Findings</h1>
          <p className="text-gray-600">Track and manage audit findings with detailed analysis and remediation</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Finding</span>
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Open Findings</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {findings.filter(f => f.status === 'Open').length}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">In Progress</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {findings.filter(f => f.status === 'In Progress').length}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Closed</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {findings.filter(f => f.status === 'Closed').length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All Findings' },
              { key: 'open', label: 'Open & In Progress' },
              { key: 'closed', label: 'Closed' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Findings List */}
        <div className="space-y-4">
          {filteredFindings.map((finding) => (
            <div
              key={finding.id}
              onClick={() => setSelectedFinding(finding.id)}
              className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all ${
                selectedFinding === finding.id
                  ? 'border-blue-500 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 pr-4">{finding.title}</h3>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {getStatusIcon(finding.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(finding.severity)}`}>
                    {finding.severity}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{finding.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                <div>
                  <span className="font-medium">Category:</span> {finding.category}
                </div>
                <div>
                  <span className="font-medium">Due:</span> {finding.dueDate}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(finding.status)}`}>
                  {finding.status}
                </span>
                <span className="text-sm text-gray-500">{finding.assignee}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Finding Detail */}
        <div className="lg:sticky lg:top-8">
          {selectedFinding ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {(() => {
                const finding = findings.find(f => f.id === selectedFinding);
                if (!finding) return null;
                
                return (
                  <>
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold text-gray-900 pr-4">{finding.title}</h2>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {getStatusIcon(finding.status)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(finding.status)}`}>
                            {finding.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Severity:</span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(finding.severity)}`}>
                            {finding.severity}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <span className="font-medium ml-2">{finding.category}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Audit Area:</span>
                          <span className="font-medium ml-2">{finding.auditArea}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Due Date:</span>
                          <span className="font-medium ml-2">{finding.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 max-h-96 overflow-y-auto">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Observation</h4>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {finding.details.observation}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Criteria</h4>
                          <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                            {finding.details.criteria}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Condition</h4>
                          <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg">
                            {finding.details.condition}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Root Cause</h4>
                          <p className="text-sm text-gray-700 bg-orange-50 p-3 rounded-lg">
                            {finding.details.cause}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Effect/Risk</h4>
                          <p className="text-sm text-gray-700 bg-red-50 p-3 rounded-lg">
                            {finding.details.effect}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Recommendation</h4>
                          <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                            {finding.details.recommendation}
                          </p>
                        </div>
                        
                        {finding.details.resolutionNotes && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Resolution Notes</h4>
                            <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                              {finding.details.resolutionNotes}
                            </p>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Related Controls</h4>
                          <div className="flex flex-wrap gap-2">
                            {finding.relatedControls.map((control, index) => (
                              <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                {control}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Supporting Evidence</h4>
                          <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                            {finding.evidence.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Finding</h3>
              <p className="text-gray-600">Choose a finding from the left panel to view detailed analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Findings;