import { Link, useLocation } from 'react-router-dom';

type NavItem = {
  to: string;
  label: string;
};

const complianceItems: NavItem[] = [
  // Use absolute paths so routing works regardless of nesting level.
  // Note: Only "frameworks" and "requirements" have implemented routes in App.tsx.
  // The others will render the "Coming soon" placeholder via Layout's navigation, not this legacy sidebar.
  { to: '/compliance/frameworks', label: 'Frameworks' },
  { to: '/compliance/requirements', label: 'Requirements' },
];

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  // This Sidebar component appears to be a legacy/simple sidebar. The app's active navigation lives in Layout.tsx.
  // To avoid duplicate/contradicting sidebars, render a minimal wrapper that defers to Layout's sidebar.
  // Keeping links only for Compliance quick access while not duplicating the full nav.
  return (
    <aside className="w-64 border-r h-full overflow-y-auto">
      <div className="p-4">
        <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Compliance</div>
        <nav className="space-y-1">
          {complianceItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`block px-3 py-2 rounded ${
                isActive(item.to) ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 text-xs text-gray-500">
          Navigation is managed by the main layout. This sidebar is slimmed to avoid duplication.
        </div>
      </div>
    </aside>
  );
}