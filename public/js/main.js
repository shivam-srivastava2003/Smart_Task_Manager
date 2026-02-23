// Auto-hide flash messages for cleaner UX.
document.querySelectorAll('.flash').forEach((flash) => {
  setTimeout(() => {
    flash.style.opacity = '0';
    flash.style.transition = 'opacity 300ms ease';
  }, 3000);
});

const THEME_KEY = 'smart-theme';

const getTheme = () => document.documentElement.getAttribute('data-theme') || 'light';

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    // Ignore storage errors safely.
  }

  const icon = theme === 'dark' ? '☀️' : '🌙';
  document.querySelectorAll('#themeToggle, #themeTogglePublic').forEach((btn) => {
    btn.textContent = icon;
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  });
};

const toggleTheme = () => {
  const nextTheme = getTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
};

applyTheme(getTheme());

document.querySelectorAll('#themeToggle, #themeTogglePublic').forEach((btn) => {
  btn.addEventListener('click', toggleTheme);
});

// Sidebar toggle for mobile.
const menuToggle = document.getElementById('menuToggle');
const sidebarNav = document.getElementById('sidebarNav');
if (menuToggle && sidebarNav) {
  menuToggle.addEventListener('click', () => {
    sidebarNav.classList.toggle('open');
  });
}

// Profile dropdown interaction.
const profileBtn = document.getElementById('profileBtn');
const profileMenu = document.getElementById('profileMenu');
if (profileBtn && profileMenu) {
  profileBtn.addEventListener('click', () => {
    const isOpen = profileMenu.classList.toggle('open');
    profileBtn.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (e) => {
    const clickedInside = e.target.closest('#profileDropdown');
    if (!clickedInside) {
      profileMenu.classList.remove('open');
      profileBtn.setAttribute('aria-expanded', 'false');
    }
  });
}
