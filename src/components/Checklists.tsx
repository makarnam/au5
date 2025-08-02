import React, { useState } from 'react';
import { Plus, CheckSquare, Square, Bot, Download, Filter } from 'lucide-react';

const Checklists: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedChecklist, setSelectedChecklist] = useState<number | null>(null);

  const checklists = [
    {
      id: 1,
      name: 'IT Security Controls Assessment',
      category: 'Information Technology',
      totalItems: 45,
      completedItems: 32,
      createdDate: '2024-01-15',
      lastUpdated: '2024-01-20',
      status: 'Active',
      assignee: 'John Smith',
      items: [
        { id: 1, text: 'Verify firewall configuration is up to date', completed: true, priority: 'High' },
        { id: 2, text: 'Check user access permissions quarterly', completed: true, priority: 'High' },
        { id: 3, text: 'Validate backup systems functionality', completed: false, priority: 'Medium' },
        { id: 4, text: 'Review incident response procedures', completed: false, priority: 'High' },
        { id: 5, text: 'Assess vulnerability scanning reports', completed: true, priority: 'Medium' }
      ]
    },
    {
      id: 2,
      name: 'Financial Controls Checklist',
      category: 'Finance',
      totalItems: 28,
      completedItems: 28,
      createdDate: '2024-01-10',
      lastUpdated: '2024-01-18',
      status: 'Completed',
      assignee: 'Sarah Johnson',
      items: [
        { id: 1, text: 'Verify segregation of duties in AP process', completed: true, priority: 'High' },
        { id: 2, text: 'Review expense approval workflows', completed: true, priority: 'Medium' },
        { id: 3, text: 'Check month-end closing procedures', completed: true, priority: 'High' },
        { id: 4, text: 'Validate bank reconciliation controls', completed: true, priority: 'High' }
      ]
    },
    {
      id: 3,
      name: 'Compliance Documentation Review',
      category: 'Legal & Compliance',
      totalItems: 35,
      completedItems: 12,
      createdDate: '2024-01-20',
      lastUpdated: '2024-01-22',
      status: 'Active',
      assignee: 'Mike Davis',
      items: [
        { id: 1, text: 'Review data privacy policies', completed: true, priority: 'High' },
        { id: 2, text: 'Check regulatory filing completeness', completed: false, priority: 'High' },
        { id: 3, text: 'Validate training record maintenance', completed: false, priority: 'Medium' },
        { id: 4, text: 'Assess contract management processes', completed: false, priority: 'Medium' }
      ]
    }
  ];

  const filteredChecklists = checklists.filter(checklist => {
    if (activeTab === 'active') return checklist.status === 'Active';
    if (activeTab === 'completed') return checklist.status === 'Completed';
    return true;
  });

  const generateAIChecklist = () => {
    // Mock AI generation functionality
    alert('AI Checklist Generator: This would open a dialog to specify audit area and generate a comprehensive checklist using AI.');
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Checklists</h1>
          <p className="text-gray-600">AI-generated and customizable checklists for comprehensive auditing</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={generateAIChecklist}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Bot className="w-4 h-4" />
            <span>Generate AI Checklist</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Create Checklist</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All Checklists' },
              { key: 'active', label: 'Active' },
              { key: 'completed', label: 'Completed' }
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checklist Cards */}
        <div className="lg:col-span-1 space-y-4">
          {filteredChecklists.map((checklist) => (
            <div
              key={checklist.id}
              onClick={() => setSelectedChecklist(checklist.id)}
              className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all ${
                selectedChecklist === checklist.id
                  ? 'border-blue-500 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{checklist.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  checklist.status === 'Active' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {checklist.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{checklist.category}</p>
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">
                  {checklist.completedItems}/{checklist.totalItems} completed
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round((checklist.completedItems / checklist.totalItems) * 100)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(checklist.completedItems / checklist.totalItems) * 100}%` }}
                ></div>
              </div>
              
              <div className="text-xs text-gray-500">
                <p>Assignee: {checklist.assignee}</p>
                <p>Updated: {checklist.lastUpdated}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Checklist Detail */}
        <div className="lg:col-span-2">
          {selectedChecklist ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {(() => {
                const checklist = checklists.find(c => c.id === selectedChecklist);
                if (!checklist) return null;
                
                return (
                  <>
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">{checklist.name}</h2>
                          <p className="text-gray-600">{checklist.category}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <Download className="w-4 h-4" />
                            <span>Export</span>
                          </button>
                          <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <Filter className="w-4 h-4" />
                            <span>Filter</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Progress:</span>
                          <span className="font-medium ml-2">
                            {checklist.completedItems}/{checklist.totalItems}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Assignee:</span>
                          <span className="font-medium ml-2">{checklist.assignee}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Updated:</span>
                          <span className="font-medium ml-2">{checklist.lastUpdated}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Checklist Items</h3>
                      <div className="space-y-3">
                        {checklist.items.map((item) => (
                          <div key={item.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <button className="mt-1">
                              {item.completed ? (
                                <CheckSquare className="w-5 h-5 text-green-600" />
                              ) : (
                                <Square className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                            <div className="flex-1">
                              <p className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                {item.text}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  item.priority === 'High' ? 'bg-red-100 text-red-800' :
                                  item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {item.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Checklist</h3>
              <p className="text-gray-600">Choose a checklist from the left panel to view and manage its items.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checklists;