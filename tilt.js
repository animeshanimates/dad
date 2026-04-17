(function() {
  'use strict';

  // Respect user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const cardSelectors = ['.practice-card', '.article-card', '.comment-card'];

  document.addEventListener('pointermove', (event) => {
    // Only apply for mouse/pen to prevent weird touch behaviors
    if (event.pointerType === 'touch') return;

    const target = event.target;
    if (!target) return;
    
    // Find closest card
    let card = null;
    for (const selector of cardSelectors) {
      const match = target.closest(selector);
      if (match) {
        card = match;
        break;
      }
    }

    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    
    // Limit coordinates to [0, 1] bounds (in case padding causes overstretch)
    const limitedX = Math.max(0, Math.min(1, x));
    const limitedY = Math.max(0, Math.min(1, y));

    // Calculate tilts
    const tiltY = (limitedX - 0.5) * 10;
    const tiltX = (0.5 - limitedY) * 10;

    card.style.setProperty('--card-tilt-x', `${tiltX.toFixed(2)}deg`);
    card.style.setProperty('--card-tilt-y', `${tiltY.toFixed(2)}deg`);
    card.style.setProperty('--pointer-shift-y', `${((0.5 - limitedY) * -10).toFixed(2)}px`);
    card.style.setProperty('--pointer-depth', `18px`);
    card.style.setProperty('--glow-x', `${(limitedX * 100).toFixed(2)}%`);
    card.style.setProperty('--glow-y', `${(limitedY * 100).toFixed(2)}%`);
    card.style.setProperty('--pointer-active', '1');
  });

  // Use pointerover to lazily attach pointerleave logic
  document.addEventListener('pointerover', (event) => {
    if (event.pointerType === 'touch') return;

    const target = event.target;
    if (!target) return;
    
    let card = null;
    for (const selector of cardSelectors) {
      const match = target.closest(selector);
      if (match) {
        card = match;
        break;
      }
    }

    if (card && !card.dataset.tiltInitialized) {
      card.dataset.tiltInitialized = 'true';
      
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--card-tilt-x', '0deg');
        card.style.setProperty('--card-tilt-y', '0deg');
        card.style.setProperty('--pointer-shift-y', '0px');
        card.style.setProperty('--pointer-depth', '0px');
        card.style.setProperty('--pointer-active', '0');
        card.style.setProperty('--glow-x', '50%');
        card.style.setProperty('--glow-y', '20%');
      });
    }
  }, { passive: true });

})();
