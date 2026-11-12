/**
 * dos-intro.js
 * Retro MS-DOS Terminal 10-second Cinematic Boot Sequence
 */

export function initDosIntro(onComplete) {
  const dosContainer = document.getElementById('dos-intro');
  const terminalContent = document.getElementById('dos-terminal-content');
  const skipBtn = document.getElementById('dos-skip-btn');
  const replayBtn = document.getElementById('btn-replay-intro');

  if (!dosContainer || !terminalContent) return;

  let typingTimeout = null;
  let isFinished = false;

  // Check if previously seen
  const hasSeenIntro = localStorage.getItem('water_intro_seen') === 'true';

  // Check prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (hasSeenIntro || prefersReduced) {
    dosContainer.style.display = 'none';
    if (onComplete) onComplete({ skipped: true });
  } else {
    runDosSequence();
  }

  // Setup replay button listener
  if (replayBtn) {
    replayBtn.addEventListener('click', (e) => {
      e.preventDefault();
      runDosSequence(true);
    });
  }

  // Skip button listener
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      finishDosIntro(true);
    });
  }

  // ESC key listener to skip
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dosContainer.style.display !== 'none') {
      finishDosIntro(true);
    }
  });

  function runDosSequence(force = false) {
    isFinished = false;
    terminalContent.textContent = '';
    dosContainer.classList.remove('fade-out');
    dosContainer.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Sequence script lines
    const lines = [
      { text: "C:\\> ECHO OFF", delay: 250 },
      { text: "C:\\> INITIALIZING WATER SYSTEM...", delay: 600 },
      { text: "C:\\> LOADING ENVIRONMENTAL DATA (USGS / EPA)...", delay: 600 },
      { text: "C:\\> ANALYZING FRESHWATER BASINS...", delay: 500 },
      { text: "C:\\> INITIALIZING LIQUID GLASS INTERFACE...", delay: 500 },
      { text: "PROGRESS: ", isProgress: true, delay: 60 },
      { text: "\nC:\\> SYSTEM READY.", delay: 400 },
      { text: "C:\\> WATER CONSERVATION PROJECT INITIALIZED.", delay: 50, isFinal: true }
    ];

    let currentLineIndex = 0;

    // Phase 1: 0-1.5s Initial black screen & blinking cursor
    setTimeout(() => {
      if (isFinished) return;
      processNextLine();
    }, 1500);

    function processNextLine() {
      if (isFinished) return;
      if (currentLineIndex >= lines.length) {
        finishDosIntro();
        return;
      }

      const item = lines[currentLineIndex];
      currentLineIndex++;

      if (item.isProgress) {
        animateProgressBar(() => {
          processNextLine();
        });
      } else {
        typeLine(item.text, () => {
          if (item.isFinal) {
            // Immediate transition without any waiting or delay!
            finishDosIntro();
          } else {
            typingTimeout = setTimeout(processNextLine, item.delay);
          }
        });
      }
    }

    function typeLine(str, callback) {
      let charIdx = 0;
      function nextChar() {
        if (isFinished) return;
        if (charIdx < str.length) {
          terminalContent.textContent += str[charIdx];
          charIdx++;
          typingTimeout = setTimeout(nextChar, 12 + Math.random() * 14);
        } else {
          terminalContent.textContent += '\n';
          callback();
        }
      }
      nextChar();
    }

    function animateProgressBar(callback) {
      let percent = 0;
      const totalBlocks = 20;

      function updateBar() {
        if (isFinished) return;
        percent += 5;
        if (percent > 100) percent = 100;

        const filledBlocks = Math.round((percent / 100) * totalBlocks);
        const emptyBlocks = totalBlocks - filledBlocks;
        const barStr = "PROGRESS: [" + "█".repeat(filledBlocks) + " ".repeat(emptyBlocks) + `] ${percent}%\r`;

        // Update last line in terminal
        const currentText = terminalContent.textContent;
        const lastLineBreak = currentText.lastIndexOf('\n');
        terminalContent.textContent = (lastLineBreak >= 0 ? currentText.substring(0, lastLineBreak + 1) : "") + barStr;

        if (percent < 100) {
          typingTimeout = setTimeout(updateBar, 35);
        } else {
          terminalContent.textContent += '\n';
          callback();
        }
      }
      updateBar();
    }
  }

  function finishDosIntro(isSkipped = false) {
    if (isFinished) return;
    isFinished = true;
    clearTimeout(typingTimeout);

    localStorage.setItem('water_intro_seen', 'true');

    if (isSkipped) {
      dosContainer.style.display = 'none';
      document.body.style.overflow = '';
      if (onComplete) onComplete({ skipped: true });
      return;
    }

    // Step 1: Text briefly flickers (~200ms)
    terminalContent.classList.add('crt-text-flicker');

    // Step 2: Terminal collapses into horizontal CRT scanlines & compresses toward center
    setTimeout(() => {
      dosContainer.classList.add('crt-shutdown-transition');

      // Step 3: Transition smoothly into the dark atmospheric water environment (approx 0.8s)
      setTimeout(() => {
        dosContainer.style.display = 'none';
        dosContainer.classList.remove('crt-shutdown-transition');
        terminalContent.classList.remove('crt-text-flicker');
        document.body.style.overflow = '';
        if (onComplete) onComplete({ skipped: false });
      }, 780);
    }, 200);
  }
}
