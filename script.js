/* ═══════════════════════════════════════════════
   THE KEY TO APARTMENT 701 — script.js
   Pure vanilla JS. No frameworks. No dependencies.
   ═══════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────
   ✏️  EDIT THIS: Set your event date and time here.
   Format: 'YYYY-MM-DDTHH:MM:SS'
   Example: '2025-08-16T18:30:00' = Aug 16 2025, 6:30 PM
   ────────────────────────────────────────────────── */
const EVENT_DATE = new Date('2026-06-26T18:00:00');

/* ──────────────────────────────────────────────────
   ✏️  EDIT THIS: The secret access code.
   Currently set to 168
   Change it to anything you like.
   ────────────────────────────────────────────────── */
const ACCESS_CODE = '168';

/* ══════════════════════════════════════
   SCREEN NAVIGATION
══════════════════════════════════════ */

/**
 * goTo(screenId) — hides all screens, shows the target screen.
 * Called from onclick attributes in the HTML.
 */
function goTo(screenId) {
  const all = document.querySelectorAll('.screen');

  // Fade out current active screen
  const current = document.querySelector('.screen.active');
  if (current) {
    current.classList.add('screen-fade-out');
    setTimeout(() => {
      current.classList.remove('screen-fade-out', 'active');
      revealScreen(screenId);
    }, 380);
  } else {
    revealScreen(screenId);
  }
}

function revealScreen(screenId) {
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Trigger screen-specific logic after reveal
    if (screenId === 'screen-invite') {
      startCountdown();
    }
  }
}

/* ══════════════════════════════════════
   SCREEN 1: TYPEWRITER ANIMATION
══════════════════════════════════════ */
(function initTypewriter() {
  // Lines that will be typed out one by one
  const lines = [
    'A new door has opened.',
    '',
    'You have been selected',
    'for a mission.'
  ];

  const el = document.getElementById('typewriter');
  const btn = document.getElementById('btn-accept');

  let lineIndex  = 0;
  let charIndex  = 0;
  let currentText = '';
  let isDeleting  = false;
  let isPaused    = false;

  const TYPING_SPEED  = 55;   // ms per character while typing
  const LINE_PAUSE    = 900;  // pause at end of a complete line
  const NEWLINE_PAUSE = 220;  // pause before starting the next line

  function type() {
    if (lineIndex >= lines.length) {
      // Finished all lines — remove blinking cursor and show button
      el.style.setProperty('--cursor', 'none');
      el.classList.add('done');
      btn.classList.remove('hidden');
      setTimeout(() => btn.classList.add('visible'), 50);
      return;
    }

    const line = lines[lineIndex];

    if (!isPaused) {
      currentText += line[charIndex] || '';
      charIndex++;

      // Build display: all done lines + current line being typed
      const displayLines = lines.slice(0, lineIndex).join('\n') + (lineIndex > 0 ? '\n' : '') + currentText;
      el.textContent = displayLines;
    }

    if (charIndex >= line.length) {
      // Finished this line
      lineIndex++;
      charIndex = 0;
      currentText = '';
      isPaused = true;

      const pause = line === '' ? NEWLINE_PAUSE : LINE_PAUSE;
      setTimeout(() => {
        isPaused = false;
        type();
      }, pause);
    } else {
      setTimeout(type, TYPING_SPEED);
    }
  }

  // Small delay before starting — feels more cinematic
  setTimeout(type, 800);
})();

/* ══════════════════════════════════════
   SCREEN 3: ELEVATOR
══════════════════════════════════════ */

/**
 * pressFloor(btn) — handles elevator button presses.
 * Only floor 7 advances to the unlock screen.
 */
function pressFloor(btn) {
  const floor = btn.dataset.floor;
  const display = document.getElementById('elevator-display');
  const msg     = document.getElementById('elevator-msg');

  // Light up the pressed button
  document.querySelectorAll('.floor-btn').forEach(b => b.classList.remove('pressed'));
  btn.classList.add('pressed');

  display.textContent = floor;

  if (floor === '7') {
    msg.textContent = 'Ascending to Level 7…';

    // After a brief dramatic pause, go to the unlock screen
    setTimeout(() => {
      goTo('screen-unlock');
    }, 1500);
  } else {
    // Wrong floor — give a cheeky response
    const wrong = [
      'Not quite, agent…',
      'That\'s not it.',
      'Keep looking.',
      'Hmm. Wrong floor.',
      'Almost. Think higher.'
    ];
    msg.textContent = wrong[Math.floor(Math.random() * wrong.length)];
  }
}

/* ══════════════════════════════════════
   SCREEN 4: ACCESS CODE UNLOCK
══════════════════════════════════════ */

/**
 * checkCode() — validates the access code input.
 * Correct: HOUSE701 (or whatever you set in ACCESS_CODE above).
 * Shows unlock animation, then navigates to the invitation.
 */
function checkCode() {
  const input = document.getElementById('code-input');
  const msg   = document.getElementById('code-msg');
  const lock  = document.getElementById('lock-icon');

  const entered = input.value.trim().toUpperCase();

  if (entered === ACCESS_CODE.toUpperCase()) {
    // ✅ Correct!
    msg.textContent = '✓ Access granted. Welcome, agent.';
    msg.className   = 'code-msg success';
    lock.textContent = '🔓';
    lock.classList.add('unlocked');
    input.disabled = true;

    // Save to localStorage so returning guests skip the unlock
    try { localStorage.setItem('apt701_unlocked', '1'); } catch(e) {}

    setTimeout(() => {
      goTo('screen-invite');
    }, 1400);

  } else {
    // ❌ Wrong code
    msg.textContent = 'Access denied. Try again, agent.';
    msg.className   = 'code-msg error';
    input.classList.add('shake');
    input.value = '';

    setTimeout(() => {
      input.classList.remove('shake');
    }, 400);
  }
}

/* ──────────────────────────────────────────────────
   Remember unlocked state (optional localStorage trick).
   If the guest already unlocked it, skip straight to
   the mission card on their next visit.
   Comment this block out if you don't want that behaviour.
   ────────────────────────────────────────────────── */
(function checkPreviousUnlock() {
  try {
    if (localStorage.getItem('apt701_unlocked') === '1') {
      // They've been here before — still show the intro but
      // the unlock screen will pre-fill and auto-pass.
      // (We don't skip the whole journey — that's more fun!)
      // If you DO want to skip to the invite directly, uncomment:
      // goTo('screen-invite');
    }
  } catch(e) { /* localStorage not available — that's fine */ }
})();

/* ══════════════════════════════════════
   SCREEN 5: COUNTDOWN TIMER
══════════════════════════════════════ */

/**
 * startCountdown() — runs a live countdown to EVENT_DATE.
 * Called automatically when the invite screen becomes active.
 */
function startCountdown() {
  function update() {
    const now  = new Date();
    const diff = EVENT_DATE - now;

    if (diff <= 0) {
      // Party is happening NOW (or already happened)
      document.getElementById('cd-days').textContent  = '0';
      document.getElementById('cd-hours').textContent = '0';
      document.getElementById('cd-mins').textContent  = '0';
      document.getElementById('cd-secs').textContent  = '0';

      // Optional: change the countdown title when party starts
      const titleEl = document.querySelector('.countdown-card .section-title');
      if (titleEl) titleEl.textContent = "It's Party Time! 🎉";
      return;
    }

    const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins  = Math.floor((diff / (1000 * 60)) % 60);
    const secs  = Math.floor((diff / 1000) % 60);

    // Pad single digits with a leading zero
    document.getElementById('cd-days').textContent  = String(days).padStart(2, '0');
    document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cd-mins').textContent  = String(mins).padStart(2, '0');
    document.getElementById('cd-secs').textContent  = String(secs).padStart(2, '0');
  }

  update(); // Run immediately so there's no blank flash
  setInterval(update, 1000);
}

/* ══════════════════════════════════════
   KEYBOARD ACCESSIBILITY
══════════════════════════════════════ */

// Allow Enter key on the elevator buttons
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.floor-btn').forEach(btn => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        pressFloor(btn);
      }
    });
  });
});
