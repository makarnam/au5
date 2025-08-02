import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Eye, Plus, Filter } from 'lucide-react';

const Risks: React.FC = () => {
  const [selectedRisk, setSelectedRisk] = useState<number | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const risks = [
    {
      id: 1,
      title: 'Inadequate Access Controls',
      category: 'Cybersecurity',
      severity: 'High',
      probability: 'Medium',
      impact: 'High',
      riskScore: 8.5,
      description: 'Current access control systems lack proper segregation and regular review processes',
      potentialImpact: 'Unauthorized access to sensitive data, financial loss, regulatory penalties',
      mitigation: 'Implement role-based access control, regular access reviews, and multi-factor authentication',
      owner: 'IT Security Team',
      status: 'Open',
      identifiedDate: '2024-01-10',
      lastReviewed: '2024-01-20',
      trend: 'increasing',
      relatedControls: ['Multi-Factor Authentication', 'User Access Review'],
      complianceImpact: 'GDPR, SOX compliance violations possible'
    },
    {
      id: 2,
      title: 'Third-Party Vendor Security',
      category: 'Third Party Risk',
      severity: 'Medium',
      probability: 'High',
      impact: 'Medium', 
      riskScore: 6.8,
      description: 'Limited visibility into vendor security practices and data handling procedures',
      potentialImpact: 'Data breaches through vendor systems, service disruptions, reputational damage',
      mitigation: 'Enhanced vendor risk assessments, security questionnaires, contract security clauses',
      owner: 'Procurement Team',
      status: 'In Progress',
      identifiedDate: '2024-01-05',
      lastReviewed: '2024-01-18',
      trend: 'stable',
      relatedControls: ['Vendor Risk Assessment', 'Contract Security Review'],
      complianceImpact: 'Potential regulatory scrutiny on third-party data handling'
    },
    {
      id: 3,
      title: 'Business Continuity Planning',
      category: 'Operational Risk',
      severity: 'High',
      probability: 'Low',
      impact: 'High',
      riskScore: 7.2,
      description: 'Outdated business continuity plans not tested regularly for critical operations',
      potentialImpact: 'Extended service outages, revenue loss, customer dissatisfaction',
      mitigation: 'Update BCP documentation, conduct regular testing, establish alternate sites',
      owner: 'Operations Team',
      status: 'Open',
      identifiedDate: '2024-01-12',
      lastReviewed: '2024-01-19',
      trend: 'decreasing',
      relatedControls: ['Disaster Recovery Testing', 'Business Impact Analysis'],
      complianceImpact: 'Regulatory requirements for operational resilience'
    },
    {
      id: 4,
      title: 'Financial Reporting Accuracy',
      category: 'Financial Risk',
      severity: 'Medium',
      probability: 'Medium',
      impact: 'Medium',
      riskScore: 5.5,
      description: 'Manual processes in financial reporting create potential for errors and omissions',
      potentialImpact: 'Financial misstatements, regulatory penalties, investor confidence issues',
      mitigation: 'Automation of key processes, enhanced review controls, staff training',
      owner: 'Finance Team',
      status: 'Mitigated',
      identifiedDate: '2023-12-20',
      lastReviewed: '2024-01-15',
      trend: 'decreasing',
      relatedControls: ['Financial Close Process', 'Management Review Controls'],
      complianceImpact: 'SOX compliance, SEC reporting requirements'
    }
  ];

  const getRiskColor = (severity: string) => {
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
      case 'Mitigated':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-green-600" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const filteredRisks = risks.filter(risk => 
    filterSeverity === 'all' || risk.severity === filterSeverity
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Risk Management</h1>
          <p className="text-gray-600">Identify, assess, and monitor organizational risks and their impacts</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Risk</span>
        </button>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">High Risk</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {risks.filter(r => r.severity === 'High').length}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Medium Risk</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {risks.filter(r => r.severity === 'Medium').length}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Avg Risk Score</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {(risks.reduce((sum, r) => sum + r.riskScore, 0) / risks.length).toFixed(1)}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Open Risks</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {risks.filter(r => r.status === 'Open').length}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Severities</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk List */}
        <div className="space-y-4">
          {filteredRisks.map((risk) => (
            <div
              key={risk.id}
              onClick={() => setSelectedRisk(risk.id)}
              className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all ${
                selectedRisk === risk.id
                  ? 'border-blue-500 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{risk.title}</h3>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(risk.trend)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(risk.severity)}`}>
                    {risk.severity}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{risk.category}</p>
              
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm text-gray-600">
                  Risk Score: <span className="font-bold text-gray-900">{risk.riskScore}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(risk.status)}`}>
                  {risk.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-700 line-clamp-2">{risk.description}</p>
            </div>
          ))}
        </div>

        {/* Risk Detail */}
        <div className="lg:sticky lg:top-8">
          {selectedRisk ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {(() => {
                const risk = risks.find(r => r.id === selectedRisk);
                if (!risk) return null;
                
                return (
                  <>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{risk.title}</h2>
                        <p className="text-gray-600">{risk.category}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-1">{risk.riskScore}</div>
                        <div className="text-sm text-gray-500">Risk Score</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(risk.severity)}`}>
                          {risk.severity}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Severity</div>
                      </div>
                      <div className="text-center">
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(risk.probability)}`}>
                          {risk.probability}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Probability</div>
                      </div>
                      <div className="text-center">
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(risk.impact)}`}>
                          {risk.impact}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Impact</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                        <p className="text-sm text-gray-700">{risk.description}</p>
                      </div>

                      <div className="p-4 bg-red-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Potential Impact</h4>
                        <p className="text-sm text-gray-700">{risk.potentialImpact}</p>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Mitigation Strategy</h4>
                        <p className="text-sm text-gray-700">{risk.mitigation}</p>
                      </div>

                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Compliance Impact</h4>
                        <p className="text-sm text-gray-700">{risk.complianceImpact}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Owner:</span>
                          <span className="font-medium ml-2">{risk.owner}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <span className="font-medium ml-2">{risk.status}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Identified:</span>
                          <span className="font-medium ml-2">{risk.identifiedDate}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Review:</span>
                          <span className="font-medium ml-2">{risk.lastReviewed}</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Related Controls</h4>
                        <div className="flex flex-wrap gap-2">
                          {risk.relatedControls.map((control, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {control}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Risk</h3>
              <p className="text-gray-600">Choose a risk from the left panel to view detailed information.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Risks;