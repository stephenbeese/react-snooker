/**
 * Sidebar component - Desktop navigation sidebar
 * Collapsible navigation for desktop view
 */

import { useState } from 'react';
import { Navigation } from './Navigation';

export interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export const Sidebar = ({ 
  isCollapsed = false, 
  onToggleCollapse,
  className = '' 
}: SidebarProps) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const collapsed = onToggleCollapse ? isCollapsed : internalCollapsed;
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

  return (
    <aside 
      className={`
        hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-40 lg:w-64
        ${collapsed ? 'lg:w-16' : 'lg:w-64'}
        transition-all duration-300 ease-in-out
        ${className}
      `}
      aria-label="Sidebar navigation"
    >
      {/* Sidebar content */}
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
        {/* Sidebar header with collapse toggle */}
        <div className="flex items-center justify-between px-4 mb-5">
          {!collapsed && (
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                <span className="text-green-600">Snooker</span>
                <span className="text-gray-800">Results</span>
              </h2>
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className={`h-5 w-5 transform transition-transform duration-200 ${
                collapsed ? 'rotate-180' : ''
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3">
          <Navigation 
            orientation="vertical"
            className={collapsed ? 'space-y-2' : ''}
          />
        </div>

        {/* Sidebar footer */}
        {!collapsed && (
          <div className="px-4 mt-6 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p>© 2024 Snooker Results</p>
              <p className="mt-1">Powered by snooker.org API</p>
            </div>
          </div>
        )}
      </div>

      {/* Collapsed state tooltip overlay */}
      {collapsed && (
        <div className="absolute top-20 left-16 z-50 hidden group-hover:block">
          <div className="bg-gray-900 text-white text-sm rounded py-1 px-2 whitespace-nowrap">
            Navigation Menu
          </div>
        </div>
      )}
    </aside>
  );
};
