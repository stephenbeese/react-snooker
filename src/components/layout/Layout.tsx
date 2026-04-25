/**
 * Layout component - Main application layout wrapper
 * Combines Header, Sidebar, and Footer with responsive behavior
 */

import { useState, type ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export interface LayoutProps {
  children: ReactNode;
  onSearch?: (term: string) => void;
  className?: string;
  showSidebar?: boolean;
}

export const Layout = ({ 
  children, 
  onSearch, 
  className = '',
  showSidebar = true 
}: LayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSearch = (term: string) => {
    onSearch?.(term);
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <Header
        onSearch={handleSearch}
        onMenuToggle={handleMenuToggle}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex">
        {/* Sidebar - Desktop only */}
        {showSidebar && (
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleSidebarToggle}
          />
        )}

        {/* Main content area */}
        <main 
          className={`
            flex-1 min-h-screen
            ${showSidebar ? 'lg:ml-64' : ''}
            ${showSidebar && isSidebarCollapsed ? 'lg:ml-16' : ''}
            transition-all duration-300 ease-in-out
          `}
        >
          {/* Content wrapper with proper spacing */}
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer className={`
        ${showSidebar ? 'lg:ml-64' : ''}
        ${showSidebar && isSidebarCollapsed ? 'lg:ml-16' : ''}
        transition-all duration-300 ease-in-out
      `} />

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};