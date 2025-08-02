import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Shield, 
  AlertTriangle, 
  Search, 
  Settings,
  Bot
} from 'lucide-react';

type ActiveView = 'dashboard' | 'audit-plan' | 'checklists' | 'controls' | 'risks' | 'findings' | 'settings';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'audit-plan', label: 'Audit Plans', icon: FileText },
    { id: 'checklists', label: 'Checklists', icon: CheckSquare },
    { id: 'controls', label: 'Controls', icon: Shield },
    { id: 'risks', label: 'Risks', icon: AlertTriangle },
    { id: 'findings', label: 'Findings', icon: Search },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Auditor</h1>
            <p className="text-slate-300 text-sm">Enterprise Platform</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveView(item.id as ActiveView)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm font-medium">AI Status</span>
          </div>
          <p className="text-xs text-slate-400">Connected to GPT-4</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;