/**
 * Sidebar component - Desktop navigation sidebar
 * Collapsible navigation for desktop view
 */

export const Sidebar = () => {
  return (
    <aside>
      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/players">Players</a></li>
          <li><a href="/events">Events</a></li>
          <li><a href="/results">Results</a></li>
          <li><a href="/rankings">Rankings</a></li>
        </ul>
      </nav>
    </aside>
  );
};
