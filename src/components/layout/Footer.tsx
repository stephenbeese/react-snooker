/**
 * Footer component - Application footer
 * Contains links and information
 */

export interface FooterLink {
  href: string;
  label: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  sections?: FooterSection[];
  className?: string;
}

const defaultFooterSections: FooterSection[] = [
  {
    title: 'Navigation',
    links: [
      { href: '/', label: 'Home' },
      { href: '/players', label: 'Players' },
      { href: '/events', label: 'Events' },
      { href: '/results', label: 'Results' },
      { href: '/rankings', label: 'Rankings' },
      { href: '/upcoming', label: 'Upcoming Matches' },
    ],
  },
  {
    title: 'Features',
    links: [
      { href: '/head-to-head', label: 'Head to Head' },
      { href: '/search', label: 'Search' },
      { href: '/watchlist', label: 'Watchlist' },
      { href: '/historical', label: 'Historical Data' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: 'https://snooker.org', label: 'Snooker.org', external: true },
      { href: '/api-docs', label: 'API Documentation' },
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
    ],
  },
];

export const Footer = ({ 
  sections = defaultFooterSections,
  className = '' 
}: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-gray-50 border-t border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                <span className="text-green-600">Snooker</span>
                <span className="text-gray-800">Results</span>
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Your comprehensive source for snooker results, player statistics, 
              and tournament information powered by the official snooker.org API.
            </p>
            <div className="flex space-x-4">
              {/* Social media icons using the available icons */}
              <a
                href="https://github.com"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="h-5 w-5" fill="currentColor">
                  <use href="/icons.svg#github-icon" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Twitter/X"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="h-5 w-5" fill="currentColor">
                  <use href="/icons.svg#x-icon" />
                </svg>
              </a>
            </div>
          </div>

          {/* Footer sections */}
          {sections.map((section) => (
            <div key={section.title} className="col-span-1">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      {...(link.external && {
                        target: '_blank',
                        rel: 'noopener noreferrer',
                      })}
                    >
                      {link.label}
                      {link.external && (
                        <svg
                          className="inline-block ml-1 h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom footer */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600 mb-4 md:mb-0">
              <p>
                © {currentYear} Snooker Results App. All rights reserved.
              </p>
              <p className="mt-1">
                Data provided by{' '}
                <a
                  href="https://snooker.org"
                  className="text-green-600 hover:text-green-700 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  snooker.org
                </a>
              </p>
            </div>
            
            <div className="flex space-x-6 text-sm">
              <a
                href="/privacy"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/cookies"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
