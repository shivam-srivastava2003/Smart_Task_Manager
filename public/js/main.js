// Auto-hide flash messages for cleaner UX.
document.querySelectorAll('.flash').forEach((flash) => {
  setTimeout(() => {
    flash.style.opacity = '0';
    flash.style.transition = 'opacity 300ms ease';
  }, 3000);
});
