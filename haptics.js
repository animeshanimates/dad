/* ══════════════════════════════════════════════════════════════════
   HAPTIC ENGINE v2.0
   Shared cross-platform haptic feedback for the entire website.
   
   Usage:  triggerHaptic('light' | 'medium' | 'success' | 'error')
   
   ▸ Android: Uses navigator.vibrate() with tuned durations.
   ▸ iOS 17.4+: Falls back to the invisible <input switch> toggle
     which triggers the Taptic Engine natively.
   ▸ Desktop: Silently no-ops (no vibration hardware).
   
   All haptics are bound lazily on first user gesture to comply
   with browser "Sticky User Activation" rules.
══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── State ──
  let _iosNode = null;
  let _initialized = false;

  // ── Vibration patterns tuned for Android motor spin-up ──
  const PATTERNS = {
    light:   40,                    // Subtle tap — toggles, navigation
    medium:  60,                    // Firm press — actions, submissions
    success: [40, 60, 50],          // Double bump — confirmations
    error:   [80, 80, 80, 80, 80]  // Staccato buzz — failures
  };

  // ── iOS fallback setup ──
  function _init() {
    if (_initialized) return;
    _initialized = true;

    // Only create fallback node when vibrate API is absent (iOS Safari)
    if (!navigator.vibrate) {
      try {
        _iosNode = document.createElement('input');
        _iosNode.type = 'checkbox';
        _iosNode.setAttribute('switch', '');  // iOS 17.4+ Taptic trigger
        _iosNode.style.cssText =
          'position:fixed;left:-9999px;top:-9999px;opacity:0;pointer-events:none;';
        document.body.appendChild(_iosNode);
      } catch (_) {
        _iosNode = null;
      }
    }
  }

  // Bootstrap on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

  // ── Core function ──
  function triggerHaptic(type) {
    if (!_initialized) _init();

    var pattern = PATTERNS[type];
    if (!pattern) return;

    // 1. Android / Chrome — native API
    try {
      if (navigator.vibrate) {
        navigator.vibrate(pattern);
        return;
      }
    } catch (_) { /* swallow */ }

    // 2. iOS Safari — invisible switch toggle
    if (_iosNode) {
      var ticks = 1;
      var delay = 120;

      if (type === 'success') ticks = 2;
      else if (type === 'error') ticks = 4;

      for (var i = 0; i < ticks; i++) {
        if (i === 0) {
          _iosNode.click();
        } else {
          (function (ms) {
            setTimeout(function () {
              if (_iosNode) _iosNode.click();
            }, ms);
          })(i * delay);
        }
      }
    }
  }

  // ── Throttle utility for rapid interactions ──
  var _throttleTimers = {};

  function triggerHapticThrottled(type, key, cooldownMs) {
    key = key || type;
    cooldownMs = cooldownMs || 800;

    if (_throttleTimers[key]) return;
    _throttleTimers[key] = true;

    triggerHaptic(type);

    setTimeout(function () {
      _throttleTimers[key] = false;
    }, cooldownMs);
  }

  // ── Auto-bind helper ──
  // Attaches haptic to all matching elements via event delegation
  function bindHaptics(parentSelector, eventMap) {
    var parent = document.querySelector(parentSelector) || document;

    parent.addEventListener('click', function (e) {
      for (var selector in eventMap) {
        var el = e.target.closest(selector);
        if (el) {
          triggerHaptic(eventMap[selector]);
          break;  // Only fire once per click
        }
      }
    }, { passive: true });
  }

  // ── Expose globally ──
  window.triggerHaptic = triggerHaptic;
  window.triggerHapticThrottled = triggerHapticThrottled;
  window.bindHaptics = bindHaptics;

})();
