export class NavigationComponent {
  private location: string;

  constructor() {
    this.location = window.location.pathname;
    this.setupNavigation();
  }

  private setupNavigation(): void {
    const nav = document.createElement('nav');
    nav.className = 'nav-bar';
    nav.innerHTML = `
      <div class="nav-content">
        <div class="nav-left">
          <button class="menu-button" id="menuToggle">
            <svg stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <a href="/" class="nav-logo">AI Chat</a>
        </div>
        <div class="nav-links">
          <a href="/" class="nav-link ${
            this.location === '/' ? 'active' : ''
          }">Home</a>
          <a href="/api.html" class="nav-link ${
            this.location === '/api.html' ? 'active' : ''
          }">API</a>
          <a href="/developer.html" class="nav-link ${
            this.location === '/developer.html' ? 'active' : ''
          }">Developer</a>
        </div>
      </div>
    `;

    this.setupMobileMenu(nav);
    document.body.insertBefore(nav, document.body.firstChild);
  }

  private setupMobileMenu(nav: HTMLElement): void {
    const menuToggle = nav.querySelector('#menuToggle');
    const navBar = nav;
    const navLinks = nav.querySelector('.nav-links');

    menuToggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      navBar?.classList.toggle('mobile-menu-open');
    });

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.nav-bar')) {
        navBar?.classList.remove('mobile-menu-open');
      }
    });

    navLinks?.addEventListener('click', () => {
      navBar?.classList.remove('mobile-menu-open');
    });
  }
}
