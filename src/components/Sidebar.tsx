import { Link, useLocation } from 'react-router-dom';

type NavItem = {
  to: string;
  label: string;
};

const complianceItems: NavItem[] = [
  { to: 'compliance/frameworks', label: 'Frameworks' },
  { to: 'compliance/requirements', label: 'Requirements' },
  { to: 'compliance/profiles', label: 'Profiles' },
  { to: 'compliance/assessments', label: 'Assessments' },
  { to: 'compliance/attestations', label: 'Attestations' },
  { to: 'compliance/exceptions', label: 'Exceptions' },
  { to: 'compliance/posture', label: 'Posture' },
];

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <aside className="w-64 border-r h-full overflow-y-auto">
      <div className="p-4">
        <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Main</div>
        <nav className="space-y-1">
          <Link to="/" className={`block px-3 py-2 rounded ${isActive('/') ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}>Dashboard</Link>
        </nav>

        <div className="mt-6">
          <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Audits & Risks</div>
          <nav className="space-y-1">
            <Link to="audits" className={`block px-3 py-2 rounded ${isActive('/audits') ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}>Audits</Link>
            <Link to="risks" className={`block px-3 py-2 rounded ${isActive('/risks') ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}>Risks</Link>
            <Link to="findings" className={`block px-3 py-2 rounded ${isActive('/findings') ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}>Findings</Link>
            <Link to="controls" className={`block px-3 py-2 rounded ${isActive('/controls') ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}>Controls</Link>
          </nav>
        </div>

        <div className="mt-6">
          <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Compliance</div>
          <nav className="space-y-1">
            {complianceItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`block px-3 py-2 rounded ${isActive(item.to) ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Admin</div>
          <nav className="space-y-1">
            <Link to="settings" className={`block px-3 py-2 rounded ${isActive('/settings') ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}>Settings</Link>
          </nav>
        </div>
      </div>
    </aside>
  );
}