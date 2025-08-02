import React from 'react';
import { TrendingUp, AlertCircle, CheckCircle, Clock, FileText, Users } from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Active Audits', value: '12', icon: FileText, color: 'bg-blue-500', change: '+8%' },
    { label: 'Open Findings', value: '47', icon: AlertCircle, color: 'bg-red-500', change: '-12%' },
    { label: 'Completed Controls', value: '234', icon: CheckCircle, color: 'bg-green-500', change: '+15%' },
    { label: 'Pending Reviews', value: '8', icon: Clock, color: 'bg-yellow-500', change: '+3%' },
  ];

  const recentAudits = [
    { id: 1, name: 'IT Security Audit 2024', status: 'In Progress', progress: 75, department: 'IT' },
    { id: 2, name: 'Financial Controls Review', status: 'Planning', progress: 25, department: 'Finance' },
    { id: 3, name: 'Compliance Assessment', status: 'Review', progress: 90, department: 'Legal' },
    { id: 4, name: 'Operational Efficiency', status: 'In Progress', progress: 60, department: 'Operations' },
  ];

  const criticalFindings = [
    { id: 1, title: 'Inadequate Access Controls', severity: 'High', department: 'IT', date: '2024-01-15' },
    { id: 2, title: 'Missing Documentation', severity: 'Medium', department: 'Finance', date: '2024-01-14' },
    { id: 3, title: 'Process Gap Identified', severity: 'High', department: 'Operations', date: '2024-01-13' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Dashboard</h1>
        <p className="text-gray-600">Overview of your organization's audit activities and compliance status</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Audits */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Audits</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentAudits.map((audit) => (
                <div key={audit.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{audit.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{audit.department}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        audit.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        audit.status === 'Planning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {audit.status}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${audit.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{audit.progress}% Complete</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Critical Findings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Critical Findings</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {criticalFindings.map((finding) => (
                <div key={finding.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    finding.severity === 'High' ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    <AlertCircle className={`w-4 h-4 ${
                      finding.severity === 'High' ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{finding.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{finding.department}</span>
                      <span>{finding.date}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        finding.severity === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {finding.severity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">AI Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h3 className="font-medium text-gray-900 mb-2">Risk Trend</h3>
            <p className="text-sm text-gray-600">IT security risks have increased by 15% this quarter. Consider additional controls.</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h3 className="font-medium text-gray-900 mb-2">Compliance Score</h3>
            <p className="text-sm text-gray-600">Overall compliance improved to 87%. Focus on documentation completeness.</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h3 className="font-medium text-gray-900 mb-2">Recommendation</h3>
            <p className="text-sm text-gray-600">Schedule quarterly training for access control procedures.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;