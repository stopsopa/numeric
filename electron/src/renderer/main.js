// Main Renderer
console.log('Numerical Keyboard Trainer Loaded');

const CONFIG = {
  defaults: {
    groupSize: 4,
    groupsPerLine: 5,
    totalLines: 10,
    fontSize: 24,
    errorMode: "carry_on",
    fontFamily: "Roboto Mono",
  },
  fonts: ["Roboto Mono", "Courier New", "monospace", "Arial"],
  limits: {
    groupSize: { min: 1, max: 10 },
    groupsPerLine: { min: 1, max: 20 },
    totalLines: { min: 1, max: 100 },
    fontSize: { min: 12, max: 72 },
  },
};

let userState = {
  username: "",
  settings: { ...CONFIG.defaults },
};

let leaderboard = [];

const screens = {
  start: document.getElementById('screen-start'),
  work: document.getElementById('screen-work'),
  summary: document.getElementById('screen-summary'),
  leaderboard: document.getElementById('screen-leaderboard'),
};

async function loadInitialData() {
  const savedSettings = await window.electronAPI.getSettings();
  if (savedSettings && Object.keys(savedSettings).length > 0) {
    userState.settings = { ...CONFIG.defaults, ...savedSettings };
  }
  const savedUser = await window.electronAPI.getCurrentUser();
  if (savedUser && savedUser.username) {
    userState.username = savedUser.username;
  }
  leaderboard = await window.electronAPI.getLeaderboard();
  initStartScreen();
}

function showScreen(screenId) {
  Object.values(screens).forEach(screen => {
    if (screen) screen.classList.remove('active');
  });
  if (screens[screenId]) {
    screens[screenId].classList.add('active');
    if (screenId === 'start') initStartScreen();
    if (screenId === 'leaderboard') renderLeaderboard();
  }
}

function showModal(title, message, onConfirm = null) {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal">
      <h2>${title}</h2>
      <p>${message}</p>
      <div class="modal-actions">
        ${onConfirm ? '<button id="modal-cancel">No</button>' : ''}
        <button id="modal-confirm">${onConfirm ? 'Yes' : 'OK'}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  if (onConfirm) {
    document.getElementById('modal-cancel').onclick = () => document.body.removeChild(modal);
    document.getElementById('modal-confirm').onclick = () => {
      onConfirm();
      document.body.removeChild(modal);
    };
  } else {
    document.getElementById('modal-confirm').onclick = () => document.body.removeChild(modal);
  }
}

let sounds = [];
let audioContext = null;
let soundBuffers = {};

async function loadSounds() {
  try {
    const response = await fetch('./sounds/list.json');
    sounds = await response.json();
    initStartScreen(); // Re-render with sounds
    
    // Preload sounds
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    for (const sound of sounds) {
      const resp = await fetch(`./sounds/${sound.file}`);
      const arrayBuffer = await resp.arrayBuffer();
      soundBuffers[sound.file] = await audioContext.decodeAudioData(arrayBuffer);
    }
  } catch (e) {
    console.error('Error loading sounds:', e);
  }
}

function playErrorSound() {
  const soundFile = userState.settings.soundFile || (sounds[0] ? sounds[0].file : null);
  
  if (soundFile && soundBuffers[soundFile]) {
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    const source = audioContext.createBufferSource();
    source.buffer = soundBuffers[soundFile];
    source.connect(audioContext.destination);
    source.start(0);
  } else {
    // Fallback beep
    playFallbackBeep();
  }
}

function playFallbackBeep() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === 'suspended') audioContext.resume();
  
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, audioContext.currentTime);
  gain.gain.setValueAtTime(0.1, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  osc.connect(gain);
  gain.connect(audioContext.destination);
  
  osc.start();
  osc.stop(audioContext.currentTime + 0.1);
}

function initStartScreen() {
  const settingsContainer = document.getElementById('settings-container');
  if (!settingsContainer) return;

  settingsContainer.innerHTML = `
    <div class="setting-item">
      <label>Username:</label>
      <input type="text" id="input-username" value="${userState.username}" placeholder="Enter name">
    </div>
    <div class="setting-item">
      <label>Error Handling Mode:</label>
      <select id="select-errorMode">
        <option value="carry_on" ${userState.settings.errorMode === 'carry_on' ? 'selected' : ''}>Carry on</option>
        <option value="leave_empty" ${userState.settings.errorMode === 'leave_empty' ? 'selected' : ''}>Leave empty</option>
      </select>
    </div>
    <div class="setting-item">
      <label>Group Size:</label>
      <input type="number" id="input-groupSize" value="${userState.settings.groupSize}" min="${CONFIG.limits.groupSize.min}" max="${CONFIG.limits.groupSize.max}">
    </div>
    <div class="setting-item">
      <label>Groups per Line:</label>
      <input type="number" id="input-groupsPerLine" value="${userState.settings.groupsPerLine}" min="${CONFIG.limits.groupsPerLine.min}" max="${CONFIG.limits.groupsPerLine.max}">
    </div>
    <div class="setting-item">
      <label>Total Lines:</label>
      <input type="number" id="input-totalLines" value="${userState.settings.totalLines}" min="${CONFIG.limits.totalLines.min}" max="${CONFIG.limits.totalLines.max}">
    </div>
    <div class="setting-item">
      <label>Font Size:</label>
      <input type="number" id="input-fontSize" value="${userState.settings.fontSize}" min="${CONFIG.limits.fontSize.min}" max="${CONFIG.limits.fontSize.max}">
    </div>
    <div class="setting-item">
      <label>Font Family:</label>
      <select id="select-fontFamily">
        ${CONFIG.fonts.map(f => `<option value="${f}" ${userState.settings.fontFamily === f ? 'selected' : ''}>${f}</option>`).join('')}
      </select>
    </div>
    <div class="setting-item full-width">
      <label>Font Preview:</label>
      <div id="font-preview" class="font-preview-demo">
        <div class="task-group">123</div>
        <div class="task-group">456</div>
        <div class="task-group">789</div>
      </div>
    </div>
    <div class="setting-item">
      <label>Sound Select:</label>
      <div class="sound-select-row">
        <select id="select-soundFile">
          ${sounds.map(s => `<option value="${s.file}" ${userState.settings.soundFile === s.file ? 'selected' : ''}>${s.name}</option>`).join('')}
        </select>
        <button id="btn-preview-sound" class="btn-small">Play</button>
      </div>
    </div>
  `;

  document.getElementById('btn-preview-sound').onclick = () => {
    userState.settings.soundFile = document.getElementById('select-soundFile').value;
    playErrorSound();
  };

  // Add listeners for font preview
  ['input-fontSize', 'select-fontFamily'].forEach(id => {
    document.getElementById(id).addEventListener('change', updateFontPreview);
  });
  updateFontPreview();
}

function updateFontPreview() {
  const preview = document.getElementById('font-preview');
  if (!preview) return;
  const size = document.getElementById('input-fontSize').value;
  const family = document.getElementById('select-fontFamily').value;
  preview.style.fontSize = `${size}px`;
  preview.style.fontFamily = family;
  preview.innerHTML = `
    <div class="task-group">123</div>
    <div class="task-group">456</div>
    <div class="task-group">789</div>
  `;
}

async function startSession() {
  userState.username = document.getElementById('input-username').value.trim();
  if (!userState.username) {
    showModal('Error', 'Please enter a username');
    return;
  }

  userState.settings.errorMode = document.getElementById('select-errorMode').value;
  userState.settings.groupSize = parseInt(document.getElementById('input-groupSize').value);
  userState.settings.groupsPerLine = parseInt(document.getElementById('input-groupsPerLine').value);
  userState.settings.totalLines = parseInt(document.getElementById('input-totalLines').value);
  userState.settings.fontSize = parseInt(document.getElementById('input-fontSize').value);
  userState.settings.fontFamily = document.getElementById('select-fontFamily').value;
  userState.settings.soundFile = document.getElementById('select-soundFile').value;

  // Save current defaults
  window.electronAPI.saveSettings(userState.settings);
  window.electronAPI.saveCurrentUser({ username: userState.username });

  showScreen('work');
  initWorkScreen();
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div id="screen-start" class="screen active">
      <h1>Numerical Keyboard Trainer</h1>
      <div id="settings-container" class="settings-grid"></div>
      <div class="actions">
        <button id="btn-start">Start Session</button>
        <button id="btn-view-leaderboard">Leaderboard</button>
      </div>
    </div>
    <div id="screen-work" class="screen">
      <div class="work-header">
        <button id="btn-abandon" class="btn-danger">x</button>
      </div>
      <div id="work-area"></div>
    </div>
    <div id="screen-summary" class="screen">
      <h1>Summary</h1>
      <div id="summary-metrics"></div>
      <div class="actions">
        <button id="btn-restart">Restart</button>
        <button id="btn-summary-leaderboard">Leaderboard</button>
      </div>
    </div>
    <div id="screen-leaderboard" class="screen">
      <div class="screen-header">
        <h1>Leaderboard</h1>
        <button id="btn-back-to-start">Back</button>
      </div>
      <div id="leaderboard-table-container"></div>
    </div>
  `;
  
  // Refresh screen references
  screens.start = document.getElementById('screen-start');
  screens.work = document.getElementById('screen-work');
  screens.summary = document.getElementById('screen-summary');
  screens.leaderboard = document.getElementById('screen-leaderboard');
  
  loadInitialData();
  loadSounds();

  // Add event listeners
  document.getElementById('btn-start').onclick = startSession;
  document.getElementById('btn-abandon').onclick = () => {
    showModal('Abandon run?', 'Are you sure you want to abandon this session?', () => showScreen('start'));
  };
  document.getElementById('btn-restart').onclick = () => showScreen('start');
  document.getElementById('btn-back-to-start').onclick = () => showScreen('start');
  document.getElementById('btn-view-leaderboard').onclick = () => showScreen('leaderboard');
  document.getElementById('btn-summary-leaderboard').onclick = () => showScreen('leaderboard');
});

// Work Screen Implementation
let sessionData = {
  lines: [], // Array of { groups: [ [1,2,3], [4,5,6] ] }
  currentLineIdx: 0,
  currentGroupIdx: 0,
  currentDigitIdx: 0,
  startTime: null,
  errors: 0,
  totalKeypresses: 0,
};

function generateSessionNumbers() {
  const { totalLines, groupsPerLine, groupSize } = userState.settings;
  sessionData.lines = [];
  for (let l = 0; l < totalLines; l++) {
    const line = { groups: [] };
    for (let g = 0; g < groupsPerLine; g++) {
      const group = [];
      for (let s = 0; s < groupSize; s++) {
        group.push(Math.floor(Math.random() * 10));
      }
      line.groups.push(group);
    }
    sessionData.lines.push(line);
  }
}

function initWorkScreen() {
  generateSessionNumbers();
  sessionData.currentLineIdx = 0;
  sessionData.currentGroupIdx = 0;
  sessionData.currentDigitIdx = 0;
  sessionData.startTime = Date.now();
  sessionData.errors = 0;
  sessionData.totalKeypresses = 0;

  const workArea = document.getElementById('work-area');
  workArea.style.fontSize = `${userState.settings.fontSize}px`;
  workArea.style.fontFamily = userState.settings.fontFamily;

  renderWorkLines();
  updateFocus();
}

function renderWorkLines() {
  const workArea = document.getElementById('work-area');
  workArea.innerHTML = sessionData.lines.map((line, lIdx) => `
    <div class="work-line ${lIdx === sessionData.currentLineIdx ? 'active' : ''}" data-line="${lIdx}">
      <div class="task-row">
        ${line.groups.map((group, gIdx) => `
          <div class="task-group">
            ${group.map(digit => `<span class="digit">${digit}</span>`).join('')}
          </div>
        `).join('')}
      </div>
      <div class="input-row">
        ${line.groups.map((group, gIdx) => `
          <div class="input-group" data-line="${lIdx}" data-group="${gIdx}">
            ${group.map((_, dIdx) => `<div class="digit-box" data-line="${lIdx}" data-group="${gIdx}" data-digit="${dIdx}"></div>`).join('')}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function updateFocus() {
  document.querySelectorAll('.digit-box').forEach(box => box.classList.remove('focused'));
  const currentBox = document.querySelector(`.digit-box[data-line="${sessionData.currentLineIdx}"][data-group="${sessionData.currentGroupIdx}"][data-digit="${sessionData.currentDigitIdx}"]`);
  if (currentBox) {
    currentBox.classList.add('focused');
    const activeLine = document.querySelector(`.work-line.active`);
    if (activeLine) activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

window.addEventListener('keydown', (e) => {
  if (screens.work.classList.contains('active')) {
    if (e.key >= '0' && e.key <= '9') {
      handleDigitInput(parseInt(e.key));
    }
  }
});

function handleDigitInput(digit) {
  const currentLine = sessionData.lines[sessionData.currentLineIdx];
  const currentGroup = currentLine.groups[sessionData.currentGroupIdx];
  const targetDigit = currentGroup[sessionData.currentDigitIdx];

  sessionData.totalKeypresses++;

  if (digit === targetDigit) {
    const box = document.querySelector(`.digit-box[data-line="${sessionData.currentLineIdx}"][data-group="${sessionData.currentGroupIdx}"][data-digit="${sessionData.currentDigitIdx}"]`);
    box.textContent = digit;
    box.classList.add('correct');
    
    sessionData.currentDigitIdx++;
    if (sessionData.currentDigitIdx >= userState.settings.groupSize) {
      sessionData.currentDigitIdx = 0;
      sessionData.currentGroupIdx++;
      if (sessionData.currentGroupIdx >= userState.settings.groupsPerLine) {
        sessionData.currentGroupIdx = 0;
        sessionData.currentLineIdx++;
        if (sessionData.currentLineIdx >= userState.settings.totalLines) {
          finishSession();
          return;
        }
        document.querySelectorAll('.work-line').forEach((l, i) => {
          l.classList.toggle('active', i === sessionData.currentLineIdx);
        });
      }
    }
    updateFocus();
  } else {
    sessionData.errors++;
    playErrorSound();
    const box = document.querySelector(`.digit-box[data-line="${sessionData.currentLineIdx}"][data-group="${sessionData.currentGroupIdx}"][data-digit="${sessionData.currentDigitIdx}"]`);
    
    if (userState.settings.errorMode === 'leave_empty') {
      box.textContent = digit;
      box.classList.add('incorrect');
      sessionData.currentDigitIdx++;
      if (sessionData.currentDigitIdx >= userState.settings.groupSize) {
        sessionData.currentDigitIdx = 0;
        sessionData.currentGroupIdx++;
        if (sessionData.currentGroupIdx >= userState.settings.groupsPerLine) {
          sessionData.currentGroupIdx = 0;
          sessionData.currentLineIdx++;
          if (sessionData.currentLineIdx >= userState.settings.totalLines) {
            finishSession();
            return;
          }
          document.querySelectorAll('.work-line').forEach((l, i) => {
            l.classList.toggle('active', i === sessionData.currentLineIdx);
          });
        }
      }
      updateFocus();
    } else {
      box.classList.add('flash-error');
      setTimeout(() => box.classList.remove('flash-error'), 200);
    }
  }
}

async function finishSession() {
  const duration = (Date.now() - sessionData.startTime) / 1000;
  
  const totalDigits = userState.settings.totalLines * userState.settings.groupsPerLine * userState.settings.groupSize;
  const correctHits = sessionData.totalKeypresses - sessionData.errors;
  const accuracy = parseFloat(((correctHits / sessionData.totalKeypresses) * 100).toFixed(2));
  
  const record = {
    name: userState.username,
    accuracy,
    time: duration,
    errors: sessionData.errors,
    totalKeys: sessionData.totalKeypresses,
    date: new Date().toISOString(),
    settings: { ...userState.settings }, // Save settings for filtering
  };

  leaderboard.push(record);
  await window.electronAPI.saveLeaderboard(leaderboard);

  showScreen('summary');
  initSummaryScreen(record);
}

function initSummaryScreen(record) {
  const summaryMetrics = document.getElementById('summary-metrics');
  const minutes = Math.floor(record.time / 60);
  const seconds = Math.floor(record.time % 60);

  summaryMetrics.innerHTML = `
    <p>User: <strong>${record.name || record.username || 'Unknown'}</strong></p>
    <p>Time Taken: ${minutes}m ${seconds}s</p>
    <p>Errors: ${record.errors} / ${sessionData.totalKeypresses}</p>
    <p>Accuracy: ${record.accuracy}%</p>
  `;

  // Check for record
  const bestAccuracy = Math.max(...leaderboard.map(r => r.accuracy));
  if (record.accuracy >= bestAccuracy) {
    if (window.confetti) {
      window.confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }
}

let activeSorts = []; // Array of { column, direction: 'asc'|'desc' }

function renderLeaderboard() {
  const container = document.getElementById('leaderboard-table-container');
  if (leaderboard.length === 0) {
    container.innerHTML = '<p>No records yet.</p>';
    return;
  }

  activeSorts = []; // Clear on fresh entry if needed, or keep? 
  // User asked for reset, let's keep it until reset is clicked.
  renderLeaderboardContent();
}

function handleSortClick(column) {
  const existingIdx = activeSorts.findIndex(s => s.column === column);
  
  if (existingIdx === 0) {
    // Primary exists, toggle direction
    activeSorts[0].direction = activeSorts[0].direction === 'desc' ? 'asc' : 'desc';
  } else if (existingIdx > 0) {
    // Secondary/Tertiary exists, move to primary or just toggle?
    // Let's toggle direction if clicked again
    activeSorts[existingIdx].direction = activeSorts[existingIdx].direction === 'desc' ? 'asc' : 'desc';
  } else {
    // New sort level
    if (activeSorts.length < 7) {
      activeSorts.push({ column, direction: 'desc' });
    } else {
      showModal('Limit Reached', 'Maximum 7 levels of sorting allowed.');
    }
  }
  renderLeaderboardContent(document.getElementById('leaderboard-table-container').dataset.showAll === 'true');
}

function renderLeaderboardContent(showAll = false) {
  const container = document.getElementById('leaderboard-table-container');
  container.dataset.showAll = showAll;
  const s = userState.settings;
  
  let list = leaderboard.map(r => ({
    ...r,
    groupSize: r.settings?.groupSize || 0,
    groupsPerLine: r.settings?.groupsPerLine || 0,
    totalLines: r.settings?.totalLines || 0,
    errorMode: r.settings?.errorMode || 'N/A'
  }));

  if (!showAll) {
    list = list.filter(r => 
      r.settings && 
      r.settings.groupSize === s.groupSize &&
      r.settings.groupsPerLine === s.groupsPerLine &&
      r.settings.totalLines === s.totalLines &&
      r.settings.errorMode === s.errorMode
    );
  }

  // Multi-column sorting logic
  const sorted = [...list].sort((a, b) => {
    for (const sort of activeSorts) {
      const valA = a[sort.column];
      const valB = b[sort.column];
      
      if (valA === valB) continue;
      
      const comparison = typeof valA === 'string' 
        ? valA.localeCompare(valB) 
        : valA - valB;
        
      return sort.direction === 'desc' ? -comparison : comparison;
    }
    // Default fallback sort by date
    return new Date(b.date) - new Date(a.date);
  });

  const getSortClass = (col) => {
    const idx = activeSorts.findIndex(s => s.column === col);
    if (idx >= 0 && idx < 7) return `sort-${idx + 1}`;
    return '';
  };

  const getSortIndicator = (col) => {
    const sort = activeSorts.find(s => s.column === col);
    if (!sort) return '';
    return `<span class="sort-indicator">${sort.direction === 'desc' ? '▼' : '▲'}</span>`;
  };

  container.innerHTML = `
    <div class="leaderboard-legend">
      <div class="legend-item"><div class="color-box sort-1"></div> Primary Sort</div>
      <div class="legend-item"><div class="color-box sort-7"></div> 7th Level</div>
      <div class="legend-item"><span>▼/▲ = Desc/Asc</span></div>
      <button id="btn-reset-sort" class="btn-small">Reset Sort</button>
    </div>
    <div class="leaderboard-header">
      <p><strong>${showAll ? 'Global Leaderboard' : 'Filtered Leaderboard'}</strong></p>
      <button id="btn-toggle-leaderboard" class="btn-small">${showAll ? 'Show Matching Settings' : 'Show All Settings'}</button>
    </div>
    <table class="leaderboard-table">
      <thead>
        <tr>
          <th onclick="handleSortClick('name')" class="${getSortClass('name')}">User ${getSortIndicator('name')}</th>
          <th onclick="handleSortClick('accuracy')" class="${getSortClass('accuracy')}">Acc % ${getSortIndicator('accuracy')}</th>
          <th onclick="handleSortClick('time')" class="${getSortClass('time')}">Time ${getSortIndicator('time')}</th>
          <th onclick="handleSortClick('errors')" class="${getSortClass('errors')}">Errors ${getSortIndicator('errors')}</th>
          <th onclick="handleSortClick('groupSize')" class="${getSortClass('groupSize')}" title="Group Size">GS ${getSortIndicator('groupSize')}</th>
          <th onclick="handleSortClick('groupsPerLine')" class="${getSortClass('groupsPerLine')}" title="Groups per Line">G/L ${getSortIndicator('groupsPerLine')}</th>
          <th onclick="handleSortClick('totalLines')" class="${getSortClass('totalLines')}">Lines ${getSortIndicator('totalLines')}</th>
          <th onclick="handleSortClick('errorMode')" class="${getSortClass('errorMode')}">Mode ${getSortIndicator('errorMode')}</th>
          <th onclick="handleSortClick('date')" class="${getSortClass('date')}">Date ${getSortIndicator('date')}</th>
        </tr>
      </thead>
      <tbody>
        ${sorted.map(r => `
          <tr>
            <td>${r.name || r.username || 'Unknown'}</td>
            <td>${r.accuracy}%</td>
            <td>${Math.floor(r.time / 60)}m ${Math.floor(r.time % 60)}s</td>
            <td>${r.errors}</td>
            <td>${r.groupSize}</td>
            <td>${r.groupsPerLine}</td>
            <td>${r.totalLines}</td>
            <td><small>${r.errorMode}</small></td>
            <td><small>${(() => {
              const d = new Date(r.date);
              const pad = n => n.toString().padStart(2, '0');
              return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
            })()}</small></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  document.getElementById('btn-toggle-leaderboard').onclick = () => {
    renderLeaderboardContent(!showAll);
  };
  document.getElementById('btn-reset-sort').onclick = () => {
    activeSorts = [];
    renderLeaderboardContent(showAll);
  };
}

// Make globally accessible for onclick
window.handleSortClick = handleSortClick;
