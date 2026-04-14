(function() {
  // Synchronous dark mode check to prevent white flash
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
  
  if (isDark) {
    document.documentElement.classList.add('dark-mode');
  }

  // Bind UI interactions after DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('global-theme-toggle');
    const fabMoon = document.getElementById('fab-moon');
    const fabSun = document.getElementById('fab-sun');

    function updateIcons(isDarkMode) {
      if (fabMoon && fabSun) {
        if (isDarkMode) {
          fabMoon.style.display = 'none';
          fabSun.style.display = 'block';
        } else {
          fabMoon.style.display = 'block';
          fabSun.style.display = 'none';
        }
      }
    }

    // Set initial icon visiblity safely
    updateIcons(document.documentElement.classList.contains('dark-mode'));

    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const currentlyDark = document.documentElement.classList.contains('dark-mode');
        
        // Toggle styling & save
        if (currentlyDark) {
          document.documentElement.classList.remove('dark-mode');
          localStorage.setItem('theme', 'light');
          updateIcons(false);
        } else {
          document.documentElement.classList.add('dark-mode');
          localStorage.setItem('theme', 'dark');
          updateIcons(true);
        }

        // Trigger light haptic feedback
        if (typeof window.triggerHaptic === 'function') {
          window.triggerHaptic('light');
        } else if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      });
    }
  });
})();
