import React, { useState } from 'react';
import { Plus, Calendar, Users, FileText, Edit, Trash2, Bot } from 'lucide-react';

const AuditPlan: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    department: '',
    startDate: '',
    endDate: '',
    auditors: '',
    scope: ''
  });

  const auditPlans = [
    {
      id: 1,
      name: 'IT Security Audit 2024',
      department: 'Information Technology',
      startDate: '2024-02-01',
      endDate: '2024-03-15',
      status: 'In Progress',
      auditors: ['John Smith', 'Sarah Johnson'],
      scope: 'Network security, access controls, data protection',
      progress: 65
    },
    {
      id: 2,
      name: 'Financial Controls Review',
      department: 'Finance',
      startDate: '2024-01-15',
      endDate: '2024-02-28',
      status: 'Planning',
      auditors: ['Mike Davis', 'Lisa Chen'],
      scope: 'Account reconciliation, expense approval, financial reporting',
      progress: 25
    },
    {
      id: 3,
      name: 'Operational Efficiency Assessment',
      department: 'Operations',
      startDate: '2024-03-01',
      endDate: '2024-04-15',
      status: 'Scheduled',
      auditors: ['Tom Wilson', 'Emma Brown'],
      scope: 'Process optimization, resource allocation, performance metrics',
      progress: 10
    }
  ];

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Creating audit plan:', newPlan);
    setShowCreateForm(false);
    setNewPlan({ name: '', department: '', startDate: '', endDate: '', auditors: '', scope: '' });
  };

  const generateAIPlan = () => {
    // Mock AI generation
    setNewPlan({
      name: 'AI-Generated Compliance Audit',
      department: 'Legal & Compliance',
      startDate: '2024-04-01',
      endDate: '2024-05-15',
      auditors: 'TBD - Recommended: Senior Auditor, Compliance Specialist',
      scope: 'Regulatory compliance verification, policy adherence assessment, documentation review, control effectiveness testing'
    });
    setShowCreateForm(true);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Plans</h1>
          <p className="text-gray-600">Create and manage comprehensive audit plans for your organization</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={generateAIPlan}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Bot className="w-4 h-4" />
            <span>AI Generate</span>
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Plan</span>
          </button>
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Audit Plan</h2>
            <form onSubmit={handleCreatePlan} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
                <input
                  type="text"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={newPlan.department}
                  onChange={(e) => setNewPlan({ ...newPlan, department: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Department</option>
                  <option value="IT">Information Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="HR">Human Resources</option>
                  <option value="Legal">Legal & Compliance</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newPlan.startDate}
                    onChange={(e) => setNewPlan({ ...newPlan, startDate: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={newPlan.endDate}
                    onChange={(e) => setNewPlan({ ...newPlan, endDate: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Auditors</label>
                <input
                  type="text"
                  value={newPlan.auditors}
                  onChange={(e) => setNewPlan({ ...newPlan, auditors: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter auditor names (comma separated)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Audit Scope</label>
                <textarea
                  value={newPlan.scope}
                  onChange={(e) => setNewPlan({ ...newPlan, scope: e.target.value })}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the scope and objectives of this audit..."
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {auditPlans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <FileText className="w-4 h-4" />
                <span className="text-sm">{plan.department}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{plan.startDate} - {plan.endDate}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span className="text-sm">{plan.auditors.join(', ')}</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 line-clamp-2">{plan.scope}</p>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-600">{plan.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${plan.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                plan.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                plan.status === 'Planning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {plan.status}
              </span>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditPlan;