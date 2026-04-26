/**
 * Navigation component - Main navigation menu
 * Used for both desktop sidebar and mobile navigation
 */

import { Link, useLocation } from 'react-router-dom';

export interface NavigationItem {
  href: string;
  label: string;
  icon?: string;
  isActive?: boolean;
}

export interface NavigationProps {
  items?: NavigationItem[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  onItemClick?: (href: string) => void;
}

const defaultNavigationItems: NavigationItem[] = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/players', label: 'Players', icon: '👤' },
  { href: '/events', label: 'Events', icon: '🏆' },
  { href: '/results', label: 'Results', icon: '📊' },
  { href: '/rankings', label: 'Rankings', icon: '📈' },
  { href: '/upcoming', label: 'Upcoming Matches', icon: '📅' },
  { href: '/head-to-head', label: 'Head to Head', icon: '⚔️' },
  { href: '/historical', label: 'Historical', icon: '📚' },
];

export const Navigation = ({ 
  items = defaultNavigationItems, 
  orientation = 'vertical',
  className = '',
  onItemClick 
}: NavigationProps) => {
  const location = useLocation();

  const handleItemClick = (href: string, event: React.MouseEvent) => {
    if (onItemClick) {
      event.preventDefault();
      onItemClick(href);
    }
  };

  // Helper function to determine if a link is active
  const isActiveLink = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const baseItemClasses = orientation === 'horizontal' 
    ? "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
    : "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors w-full";

  const activeItemClasses = "bg-green-100 text-green-900 border-r-2 border-green-500";
  const inactiveItemClasses = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

  return (
    <nav className={`${className}`} role="navigation" aria-label="Main navigation">
      <ul className={`space-y-1 ${orientation === 'horizontal' ? 'flex space-y-0 space-x-4' : ''}`}>
        {items.map((item) => {
          const isActive = item.isActive !== undefined ? item.isActive : isActiveLink(item.href);
          
          return (
            <li key={item.href}>
              <Link
                to={item.href}
                onClick={(e) => handleItemClick(item.href, e)}
                className={`${baseItemClasses} ${
                  isActive ? activeItemClasses : inactiveItemClasses
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon && (
                  <span className="mr-3 text-lg" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
