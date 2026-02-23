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

// Sidebar toggle + outside click close.
const menuToggle = document.getElementById('menuToggle');
const sidebarNav = document.getElementById('sidebarNav');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');

const closeSidebar = () => {
  if (!sidebarNav) return;
  sidebarNav.classList.remove('open');
  if (sidebarBackdrop) sidebarBackdrop.classList.remove('show');
};

if (menuToggle && sidebarNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = sidebarNav.classList.toggle('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.toggle('show', isOpen);
  });
}

if (sidebarBackdrop) {
  sidebarBackdrop.addEventListener('click', closeSidebar);
}

document.addEventListener('click', (e) => {
  if (!sidebarNav || !sidebarNav.classList.contains('open')) return;
  const insideSidebar = e.target.closest('#sidebarNav');
  const toggleBtn = e.target.closest('#menuToggle');
  if (!insideSidebar && !toggleBtn) {
    closeSidebar();
  }
});

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

const setupPageTransitions = () => {
  const links = document.querySelectorAll("a[href^='/']");
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('/#')) return;
      document.body.classList.remove('page-ready');
    });
  });
};

const initDashboardCharts = () => {
  if (typeof Chart === 'undefined' || !window.dashboardAnalytics) return;

  const priorityCanvas = document.getElementById('priorityChart');
  const trendCanvas = document.getElementById('trendChart');
  if (!priorityCanvas || !trendCanvas) return;

  const isDark = getTheme() === 'dark';
  const labelColor = isDark ? '#d1d5db' : '#374151';
  const gridColor = isDark ? '#334155' : '#e5e7eb';

  const { priorityLabels, priorityValues, trendLabels, trendValues } = window.dashboardAnalytics;

  new Chart(priorityCanvas, {
    type: 'doughnut',
    data: {
      labels: priorityLabels,
      datasets: [
        {
          data: priorityValues,
          backgroundColor: ['#22c55e', '#facc15', '#ef4444'],
          borderWidth: 0,
          hoverOffset: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: labelColor }
        }
      }
    }
  });

  new Chart(trendCanvas, {
    type: 'line',
    data: {
      labels: trendLabels,
      datasets: [
        {
          label: 'Tasks Created',
          data: trendValues,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.14)',
          fill: true,
          tension: 0.35,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: labelColor },
          grid: { color: gridColor }
        },
        y: {
          beginAtZero: true,
          ticks: { color: labelColor, precision: 0 },
          grid: { color: gridColor }
        }
      },
      plugins: {
        legend: {
          labels: { color: labelColor }
        }
      }
    }
  });
};

setupPageTransitions();
initDashboardCharts();
