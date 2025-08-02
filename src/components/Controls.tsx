import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock, Plus, Search, Filter } from 'lucide-react';

const Controls: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const controls = [
    {
      id: 1,
      name: 'Multi-Factor Authentication',
      category: 'Access Control',
      description: 'Requires users to provide two or more verification factors to gain access to systems',
      effectiveness: 'High',
      implementationStatus: 'Implemented',
      lastTested: '2024-01-15',
      testResult: 'Passed',
      owner: 'IT Security Team',
      frequency: 'Continuous',
      riskMitigation: 'Prevents unauthorized access even with compromised credentials'
    },
    {
      id: 2,
      name: 'Segregation of Duties',
      category: 'Financial Control',
      description: 'Separates key financial processes among different individuals to prevent fraud',
      effectiveness: 'High',
      implementationStatus: 'Implemented',
      lastTested: '2024-01-10',
      testResult: 'Passed',
      owner: 'Finance Team',
      frequency: 'Monthly',
      riskMitigation: 'Reduces risk of financial fraud and errors'
    },
    {
      id: 3,
      name: 'Data Backup and Recovery',
      category: 'Data Protection',
      description: 'Regular automated backups with tested recovery procedures',
      effectiveness: 'Medium',
      implementationStatus: 'Partially Implemented',
      lastTested: '2024-01-20',
      testResult: 'Failed',
      owner: 'IT Operations',
      frequency: 'Daily',
      riskMitigation: 'Ensures business continuity in case of data loss'
    },
    {
      id: 4,
      name: 'Vendor Risk Assessment',
      category: 'Third Party Risk',
      description: 'Comprehensive evaluation of vendor security and compliance practices',
      effectiveness: 'Medium',
      implementationStatus: 'In Progress',
      lastTested: '2024-01-05',
      testResult: 'Pending',
      owner: 'Procurement Team',
      frequency: 'Annually',
      riskMitigation: 'Minimizes third-party security and operational risks'
    },
    {
      id: 5,
      name: 'Employee Security Training',
      category: 'Human Resources',
      description: 'Regular security awareness training for all employees',
      effectiveness: 'Medium',
      implementationStatus: 'Implemented',
      lastTested: '2023-12-15',
      testResult: 'Passed',
      owner: 'HR Department',
      frequency: 'Quarterly',
      riskMitigation: 'Reduces human error and social engineering risks'
    },
    {
      id: 6,
      name: 'Network Firewall Configuration',
      category: 'Network Security',
      description: 'Properly configured firewalls with regular rule reviews',
      effectiveness: 'High',
      implementationStatus: 'Implemented',
      lastTested: '2024-01-18',
      testResult: 'Passed',
      owner: 'Network Team',
      frequency: 'Monthly',
      riskMitigation: 'Prevents unauthorized network access and data breaches'
    }
  ];

  const categories = ['all', ...Array.from(new Set(controls.map(c => c.category)))];

  const filteredControls = controls.filter(control => {
    const matchesCategory = selectedCategory === 'all' || control.category === selectedCategory;
    const matchesSearch = control.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         control.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Implemented':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Partially Implemented':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'In Progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'High':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTestResultColor = (result: string) => {
    switch (result) {
      case 'Passed':
        return 'text-green-600';
      case 'Failed':
        return 'text-red-600';
      case 'Pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Controls Management</h1>
          <p className="text-gray-600">Monitor and manage organizational controls for risk mitigation</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Control</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search controls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>{filteredControls.length} controls found</span>
          </div>
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredControls.map((control) => (
          <div key={control.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{control.name}</h3>
                  <span className="text-sm text-gray-500">{control.category}</span>
                </div>
              </div>
              {getStatusIcon(control.implementationStatus)}
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{control.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-xs text-gray-500 block mb-1">Effectiveness</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEffectivenessColor(control.effectiveness)}`}>
                  {control.effectiveness}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">Status</span>
                <span className="text-sm font-medium text-gray-900">{control.implementationStatus}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-500">Owner:</span>
                <span className="font-medium ml-1">{control.owner}</span>
              </div>
              <div>
                <span className="text-gray-500">Frequency:</span>
                <span className="font-medium ml-1">{control.frequency}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Last Tested:</span>
                <span className="text-sm font-medium text-gray-900">{control.lastTested}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Test Result:</span>
                <span className={`text-sm font-medium ${getTestResultColor(control.testResult)}`}>
                  {control.testResult}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-500 block mb-1">Risk Mitigation</span>
              <p className="text-sm text-gray-700">{control.riskMitigation}</p>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                Test Control
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredControls.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Controls Found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or add a new control.</p>
        </div>
      )}
    </div>
  );
};

export default Controls;