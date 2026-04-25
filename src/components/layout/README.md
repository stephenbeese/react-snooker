# Layout Components

This directory contains the main layout components for the Snooker Results App. These components provide the structural foundation for the application with responsive design and proper TypeScript interfaces.

## Components

### Header (`Header.tsx`)

The main application header containing logo, search functionality, and navigation.

**Features:**
- Responsive design with mobile hamburger menu
- Integrated search bar using the common SearchBar component
- Desktop and mobile navigation
- Sticky positioning for consistent access
- Touch-friendly mobile interface

**Props:**
```typescript
interface HeaderProps {
  onSearch?: (term: string) => void;
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}
```

**Usage:**
```tsx
<Header 
  onSearch={(term) => console.log('Search:', term)}
  onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
  isMobileMenuOpen={mobileMenuOpen}
/>
```

### Navigation (`Navigation.tsx`)

Reusable navigation component used in both header and sidebar.

**Features:**
- Configurable navigation items
- Horizontal and vertical orientations
- Active state indicators
- Icon support with emojis
- Accessible navigation with proper ARIA labels

**Props:**
```typescript
interface NavigationProps {
  items?: NavigationItem[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  onItemClick?: (href: string) => void;
}

interface NavigationItem {
  href: string;
  label: string;
  icon?: string;
  isActive?: boolean;
}
```

**Usage:**
```tsx
<Navigation 
  items={[
    { href: '/', label: 'Home', icon: '🏠', isActive: true },
    { href: '/players', label: 'Players', icon: '👤' }
  ]}
  orientation="vertical"
  onItemClick={(href) => navigate(href)}
/>
```

### Sidebar (`Sidebar.tsx`)

Desktop-only collapsible sidebar navigation.

**Features:**
- Collapsible functionality with smooth animations
- Desktop-only display (hidden on mobile/tablet)
- Integrated Navigation component
- Brand display when expanded
- Collapse/expand toggle button
- Footer information when expanded

**Props:**
```typescript
interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}
```

**Usage:**
```tsx
<Sidebar 
  isCollapsed={sidebarCollapsed}
  onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
/>
```

### Footer (`Footer.tsx`)

Application footer with links, information, and branding.

**Features:**
- Multi-column responsive layout
- Configurable footer sections and links
- Social media icons using SVG sprites
- External link indicators
- Copyright and attribution information
- Legal links (Privacy, Terms, Cookies)

**Props:**
```typescript
interface FooterProps {
  sections?: FooterSection[];
  className?: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterLink {
  href: string;
  label: string;
  external?: boolean;
}
```

**Usage:**
```tsx
<Footer 
  sections={[
    {
      title: 'Navigation',
      links: [
        { href: '/', label: 'Home' },
        { href: '/players', label: 'Players' }
      ]
    }
  ]}
/>
```

### Layout (`Layout.tsx`)

Main layout wrapper that combines all layout components.

**Features:**
- Complete application layout structure
- Responsive sidebar behavior
- Mobile menu overlay
- Proper content spacing and margins
- Coordinated state management for mobile menu and sidebar

**Props:**
```typescript
interface LayoutProps {
  children: ReactNode;
  onSearch?: (term: string) => void;
  className?: string;
  showSidebar?: boolean;
}
```

**Usage:**
```tsx
<Layout 
  onSearch={(term) => handleSearch(term)}
  showSidebar={true}
>
  <YourPageContent />
</Layout>
```

## Responsive Design

The layout components implement a mobile-first responsive design:

### Breakpoints
- **Mobile**: < 768px (md)
- **Tablet**: 768px - 1024px (md to lg)
- **Desktop**: > 1024px (lg+)

### Mobile Behavior
- Header shows hamburger menu instead of navigation
- Sidebar is hidden
- Footer adapts to single column layout
- Touch-friendly button sizes and spacing

### Tablet Behavior
- Header navigation may be visible depending on content
- Sidebar remains hidden
- Footer uses multi-column layout

### Desktop Behavior
- Full header navigation visible
- Sidebar visible and collapsible
- Multi-column footer layout
- Hover states and transitions

## Styling

All components use Tailwind CSS for styling with:
- Consistent color scheme (green primary, gray neutrals)
- Smooth transitions and animations
- Proper focus states for accessibility
- Responsive utilities for different screen sizes

### Color Scheme
- **Primary Green**: `text-green-600`, `bg-green-100`
- **Text**: `text-gray-900` (primary), `text-gray-600` (secondary)
- **Backgrounds**: `bg-white`, `bg-gray-50`
- **Borders**: `border-gray-200`

## Accessibility

The layout components include proper accessibility features:
- Semantic HTML elements (`header`, `nav`, `aside`, `footer`, `main`)
- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly text
- Focus indicators
- Proper heading hierarchy

## Integration

### With React Router
The components are designed to work with React Router or similar routing libraries:

```tsx
import { useNavigate } from 'react-router-dom';

const App = () => {
  const navigate = useNavigate();
  
  return (
    <Layout 
      onSearch={(term) => navigate(`/search?q=${term}`)}
    >
      <Routes>
        {/* Your routes */}
      </Routes>
    </Layout>
  );
};
```

### State Management
The Layout component manages its own internal state but accepts external control:

```tsx
const App = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div>
      <Header 
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        isMobileMenuOpen={mobileMenuOpen}
      />
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      {/* Rest of layout */}
    </div>
  );
};
```

## Testing

The components include basic tests that verify:
- Component exports and structure
- TypeScript interface compliance
- Basic functionality

To run tests:
```bash
npm test src/components/layout/__tests__/layout.test.tsx
```

## Future Enhancements

Potential improvements for the layout components:
1. **Theme Support**: Dark/light mode toggle
2. **Animation Library**: More sophisticated animations with Framer Motion
3. **Keyboard Shortcuts**: Quick navigation shortcuts
4. **Breadcrumbs**: Navigation breadcrumb component
5. **Progressive Web App**: PWA-specific layout considerations
6. **Internationalization**: Multi-language support for navigation labels