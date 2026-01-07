const CONFIG = {
  defaults: {
    groupSize: 4,
    groupsPerLine: 5,
    totalLines: 10,
    fontSize: 24,
    errorMode: "carry_on",
    fontFamily: "Roboto Mono",
    sound: "default"
  },
  fonts: [
    "Roboto Mono",
    "Source Code Pro",
    "Fira Code",
    "JetBrains Mono",
    "Ubuntu Mono",
    "Courier New",
    "Lucida Console",
    "Monaco",
    "Menlo",
    "Consolas"
  ],
  limits: {
    groupSize: { min: 1, max: 10 },
    groupsPerLine: { min: 1, max: 20 },
    totalLines: { min: 1, max: 100 },
    fontSize: { min: 12, max: 72 },
  },
};

let state = {
  currentScreen: 'start',
  currentUser: '',
  allUsers: [],
  settings: { ...CONFIG.defaults },
  sounds: [],
  session: null
};

// --- Utils ---
const $ = (id) => document.getElementById(id);
const render = (html) => {
  $('app').innerHTML = html;
};

// --- Error Logging ---
window.onerror = (msg, url, line, col, error) => {
  console.error('Renderer ERROR:', { msg, url, line, col, error });
};

// --- Sound Engine ---
const soundEngine = {
  audioContext: null,
  buffers: {},
  async init() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  },
  async loadSound(name, url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.buffers[name] = audioBuffer;
  },
  play(name) {
    if (!this.buffers[name] || !this.audioContext) return;
    const source = this.audioContext.createBufferSource();
    source.buffer = this.buffers[name];
    source.connect(this.audioContext.destination);
    source.start(0);
  }
};

// --- Screens ---

const Screens = {
  _formatDate(isoString) {
    const d = new Date(isoString);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hr = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const sec = String(d.getSeconds()).padStart(2, '0');
    return `${yr}-${mo}-${day} ${hr}:${min}:${sec}`;
  },

  async start() {
    const users = await window.electronAPI.readLeaderboard();
    const lastUser = await window.electronAPI.readCurrentUser();
    const settings = await window.electronAPI.readSettings() || CONFIG.defaults;
    const sounds = await window.electronAPI.getSounds();

    state.allUsers = [...new Set(users.map(u => u.name))];
    state.currentUser = lastUser || '';
    state.settings = settings;
    state.sounds = sounds;

    const userOptions = state.allUsers.map(u => `<option value="${u}" ${u === state.currentUser ? 'selected' : ''}>${u}</option>`).join('');
    
    const fontOptions = CONFIG.fonts.map(f => `<option value="${f}" ${f === state.settings.fontFamily ? 'selected' : ''}>${f}</option>`).join('');
    
    const soundOptions = state.sounds.map(s => `<option value="${s.file}" ${s.file === state.settings.sound ? 'selected' : ''}>${s.name}</option>`).join('');

    render(`
      <div class="screen start-screen">
        <h1>Numerical Keyboard Trainer</h1>
        
        <div class="form-group user-group">
          <label>User:</label>
          <div class="user-inputs">
            <select id="user-select">
              <option value="">-- New User --</option>
              ${userOptions}
            </select>
            <input type="text" id="new-user-input" placeholder="Enter name" style="display: ${state.currentUser ? 'none' : 'block'}">
          </div>
        </div>

        <div class="settings-grid">
          <div class="form-group">
            <label>Error Mode:</label>
            <select id="error-mode">
              <option value="carry_on" ${state.settings.errorMode === 'carry_on' ? 'selected' : ''}>Carry on</option>
              <option value="leave_empty" ${state.settings.errorMode === 'leave_empty' ? 'selected' : ''}>Leave empty</option>
            </select>
          </div>
          <div class="form-group">
            <label>Group Size:</label>
            <input type="number" id="group-size" value="${state.settings.groupSize}" min="${CONFIG.limits.groupSize.min}" max="${CONFIG.limits.groupSize.max}">
          </div>
          <div class="form-group">
            <label>Groups per Line:</label>
            <input type="number" id="groups-per-line" value="${state.settings.groupsPerLine}" min="${CONFIG.limits.groupsPerLine.min}" max="${CONFIG.limits.groupsPerLine.max}">
          </div>
          <div class="form-group">
            <label>Total Lines:</label>
            <input type="number" id="total-lines" value="${state.settings.totalLines}" min="${CONFIG.limits.totalLines.min}" max="${CONFIG.limits.totalLines.max}">
          </div>
          <div class="form-group">
            <label>Font Size:</label>
            <input type="number" id="font-size" value="${state.settings.fontSize}" min="${CONFIG.limits.fontSize.min}" max="${CONFIG.limits.fontSize.max}">
          </div>
          <div class="form-group">
            <label>Font Family:</label>
            <select id="font-family">${fontOptions}</select>
          </div>
          <div class="form-group">
            <label>Sound:</label>
            <div class="sound-controls">
              <select id="sound-select">${soundOptions}</select>
              <button id="preview-sound">Play</button>
            </div>
          </div>
        </div>

        <div class="font-preview" id="font-preview">
          123 456 789
        </div>

        <div class="actions">
          <button id="start-btn" class="primary">Start Session</button>
          <button id="leaderboard-btn">Leaderboard</button>
        </div>
      </div>
    `);

    // --- Listeners ---
    console.log('Start screen listeners attaching...');
    $('user-select').onchange = (e) => {
      const val = e.target.value;
      $('new-user-input').style.display = val ? 'none' : 'block';
      state.currentUser = val;
    };

    $('preview-sound').onclick = async () => {
      const soundFile = $('sound-select').value;
      if (!soundEngine.audioContext) await soundEngine.init();
      if (!soundEngine.buffers[soundFile]) {
        await soundEngine.loadSound(soundFile, `sounds/${soundFile}`);
      }
      soundEngine.play(soundFile);
    };

    const updatePreview = () => {
      const preview = $('font-preview');
      preview.style.fontSize = $('font-size').value + 'px';
      preview.style.fontFamily = $('font-family').value;
    };

    $('font-size').oninput = updatePreview;
    $('font-family').onchange = updatePreview;
    updatePreview();

    $('start-btn').onclick = () => {
      const name = $('user-select').value || $('new-user-input').value.trim();
      if (!name) {
        Screens.showModal('Name Required', 'Please enter or select a name to start.', () => {});
        return;
      }
      
      state.currentUser = name;
      state.settings = {
        errorMode: $('error-mode').value,
        groupSize: parseInt($('group-size').value),
        groupsPerLine: parseInt($('groups-per-line').value),
        totalLines: parseInt($('total-lines').value),
        fontSize: parseInt($('font-size').value),
        fontFamily: $('font-family').value,
        sound: $('sound-select').value
      };

      window.electronAPI.writeCurrentUser(state.currentUser);
      window.electronAPI.writeSettings(state.settings);
      
      Screens.work();
    };

    const lbBtn = $('leaderboard-btn');
    if (lbBtn) {
      lbBtn.onclick = () => {
        console.log('Leaderboard button clicked from Start');
        Screens.leaderboard();
      };
    } else {
      console.warn('Leaderboard button NOT found in Start screen!');
    }
  },

  work() {
    state.session = {
      startTime: Date.now(),
      totalDigts: state.settings.totalLines * state.settings.groupsPerLine * state.settings.groupSize,
      currentDigitIndex: 0, // 0 to totalDigits - 1
      errors: 0,
      totalKeys: 0,
      data: [] // Array of lines, each line an array of groups, each group an array of digits
    };

    // Generate random numbers
    for (let l = 0; l < state.settings.totalLines; l++) {
      const line = [];
      for (let g = 0; g < state.settings.groupsPerLine; g++) {
        const group = [];
        for (let d = 0; d < state.settings.groupSize; d++) {
          group.push(Math.floor(Math.random() * 10));
        }
        line.push(group);
      }
      state.session.data.push(line);
    }

    const renderLines = () => {
      let html = '<div class="screen work-screen">';
      html += `<button id="abandon-btn" class="top-right-btn">×</button>`;
      html += '<div class="scroll-container">';
      
      state.session.data.forEach((line, lIdx) => {
        html += `<div class="task-line" id="line-${lIdx}">`;
        
        // Task numbers
        html += '<div class="task-numbers">';
        line.forEach((group, gIdx) => {
          html += '<div class="number-group">';
          group.forEach((digit, dIdx) => {
            html += `<div class="digit-box" style="font-size: ${state.settings.fontSize}px; font-family: ${state.settings.fontFamily}">${digit}</div>`;
          });
          html += '</div>';
        });
        html += '</div>';

        // Input boxes
        html += '<div class="input-line">';
        line.forEach((group, gIdx) => {
          html += '<div class="number-group">';
          group.forEach((digit, dIdx) => {
            const globalIdx = (lIdx * state.settings.groupsPerLine * state.settings.groupSize) + (gIdx * state.settings.groupSize) + dIdx;
            let statusClass = '';
            if (globalIdx < state.session.currentDigitIndex) statusClass = 'filled';
            if (globalIdx === state.session.currentDigitIndex) statusClass = 'active';
            
            html += `<div class="digit-box input-box ${statusClass}" id="input-${globalIdx}" style="font-size: ${state.settings.fontSize}px; font-family: ${state.settings.fontFamily}"></div>`;
          });
          html += '</div>';
        });
        html += '</div>';
        
        html += '</div>';
      });

      html += '</div></div>';
      return html;
    };

    render(renderLines());

    const handleKey = (e) => {
      if (!/^[0-9]$/.test(e.key)) return;

      const expectedDigit = Screens._getExpectedDigit(state.session.currentDigitIndex);
      state.session.totalKeys++;

      if (e.key === expectedDigit.toString()) {
        const currentBox = $(`input-${state.session.currentDigitIndex}`);
        currentBox.textContent = e.key;
        currentBox.classList.remove('active', 'error');
        currentBox.classList.add('filled');

        state.session.currentDigitIndex++;
        
        if (state.session.currentDigitIndex >= state.session.totalDigts) {
          window.removeEventListener('keydown', handleKey);
          Screens.summary();
        } else {
          $(`input-${state.session.currentDigitIndex}`).classList.add('active');
          // Scroll if needed
          const lineSize = state.settings.groupsPerLine * state.settings.groupSize;
          if (state.session.currentDigitIndex % lineSize === 0) {
              const nextLineIdx = Math.floor(state.session.currentDigitIndex / lineSize);
              $(`line-${nextLineIdx}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      } else {
        state.session.errors++;
        soundEngine.play(state.settings.sound);
        
        const currentBox = $(`input-${state.session.currentDigitIndex}`);
        if (state.settings.errorMode === 'leave_empty') {
          currentBox.textContent = e.key;
          currentBox.classList.remove('active');
          currentBox.classList.add('error', 'filled');
          
          state.session.currentDigitIndex++;
          if (state.session.currentDigitIndex >= state.session.totalDigts) {
            window.removeEventListener('keydown', handleKey);
            Screens.summary();
          } else {
            $(`input-${state.session.currentDigitIndex}`).classList.add('active');
            const lineSize = state.settings.groupsPerLine * state.settings.groupSize;
            if (state.session.currentDigitIndex % lineSize === 0) {
                const nextLineIdx = Math.floor(state.session.currentDigitIndex / lineSize);
                $(`line-${nextLineIdx}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        } else {
          // Carry on mode - just show error briefly
          currentBox.classList.add('error');
          setTimeout(() => currentBox.classList.remove('error'), 200);
        }
      }
    };

    window.addEventListener('keydown', handleKey);

    $('abandon-btn').onclick = () => {
      Screens.showModal('Abandon session?', 'Are you sure you want to return to the start screen?', () => {
        window.removeEventListener('keydown', handleKey);
        Screens.start();
      });
    };
  },

  _getExpectedDigit(index) {
    const lSize = state.settings.groupsPerLine * state.settings.groupSize;
    const gSize = state.settings.groupSize;
    
    const lIdx = Math.floor(index / lSize);
    const inLineIdx = index % lSize;
    const gIdx = Math.floor(inLineIdx / gSize);
    const dIdx = inLineIdx % gSize;
    
    return state.session.data[lIdx][gIdx][dIdx];
  },

  showModal(title, message, onYes) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <h2>${title}</h2>
        <p>${message}</p>
        <div class="modal-actions">
          <button id="modal-yes" class="primary">Yes</button>
          <button id="modal-no">No</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    $('modal-yes').onclick = () => {
      document.body.removeChild(modal);
      onYes();
    };
    $('modal-no').onclick = () => {
      document.body.removeChild(modal);
    };
  },

  async summary() {
    const endTime = Date.now();
    const duration = (endTime - state.session.startTime) / 1000;
    const accuracy = ((state.session.totalDigts - state.session.errors) / state.session.totalDigts * 100).toFixed(2);
    
    // Check for records
    const leaderboard = await window.electronAPI.readLeaderboard();
    const userRecords = leaderboard.filter(r => r.name === state.currentUser);
    let isRecord = false;
    if (userRecords.length === 0 || parseFloat(accuracy) > Math.max(...userRecords.map(r => r.accuracy))) {
      isRecord = true;
    }

    const sessionRecord = {
      name: state.currentUser,
      accuracy: parseFloat(accuracy),
      time: duration,
      errors: state.session.errors,
      totalKeys: state.session.totalKeys,
      date: new Date().toISOString(),
      settings: state.settings
    };

    leaderboard.push(sessionRecord);
    await window.electronAPI.writeLeaderboard(leaderboard);

    const minutes = Math.floor(duration / 60);
    const seconds = (duration % 60).toFixed(2);

    render(`
      <div class="screen summary-screen">
        <button id="restart-top-btn" class="top-right-btn">×</button>
        <h1>Session Summary</h1>
        
        <div class="metrics-grid">
          <div class="metric">
            <div class="label">Accuracy</div>
            <div class="value">${accuracy}%</div>
          </div>
          <div class="metric">
            <div class="label">Errors</div>
            <div class="value">${state.session.errors} / ${state.session.totalKeys}</div>
          </div>
          <div class="metric">
            <div class="label">Time Taken</div>
            <div class="value">${minutes}m ${seconds}s</div>
          </div>
        </div>

        ${isRecord ? '<div class="record-badge">NEW RECORD! 🎉</div>' : ''}

        <div class="actions">
          <button id="restart-btn" class="primary">Restart</button>
          <button id="leaderboard-btn">Leaderboard</button>
        </div>
      </div>
    `);

    if (isRecord && typeof confetti === 'function') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    $('restart-top-btn').onclick = () => Screens.start();
    $('restart-btn').onclick = () => Screens.start();
    const lbBtn = $('leaderboard-btn');
    if (lbBtn) {
      lbBtn.onclick = () => {
        console.log('Leaderboard button clicked from Summary');
        Screens.leaderboard();
      };
    } else {
      console.warn('Leaderboard button NOT found in Summary screen!');
    }
  },

  async leaderboard() {
    console.log('Entering Leaderboard screen...');
    let leaderboard = await window.electronAPI.readLeaderboard();
    console.log('Leaderboard data loaded:', leaderboard.length, 'records');
    let sortLevels = []; // Array of { column, direction }

    const renderTable = () => {
      console.log('Rendering Leaderboard table...');
      // Apply sorting
      let sortedData = [...leaderboard];
      if (sortLevels.length > 0) {
        sortedData.sort((a, b) => {
          for (const level of sortLevels) {
            let valA, valB;
            if (level.column === 'GS') {
              valA = a.settings.groupSize;
              valB = b.settings.groupSize;
            } else if (level.column === 'G/L') {
              valA = a.settings.groupsPerLine;
              valB = b.settings.groupsPerLine;
            } else if (level.column === 'Lines') {
              valA = a.settings.totalLines;
              valB = b.settings.totalLines;
            } else if (level.column === 'Mode') {
              valA = a.settings.errorMode;
              valB = b.settings.errorMode;
            } else if (level.column === 'Date') {
              valA = new Date(a.date).getTime();
              valB = new Date(b.date).getTime();
            } else {
              valA = a[level.column.toLowerCase()];
              valB = b[level.column.toLowerCase()];
            }

            if (valA < valB) return level.direction === 'asc' ? -1 : 1;
            if (valA > valB) return level.direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }

      const headers = ['User', 'Accuracy', 'Time', 'Errors', 'GS', 'G/L', 'Lines', 'Mode', 'Date'];
      const tooltips = {
        'GS': 'Group Size',
        'G/L': 'Groups per Line',
        'Lines': 'Total Lines',
        'Mode': 'Error Handling Mode'
      };

      let html = `
        <div class="screen leaderboard-screen">
          <button id="back-top-btn" class="top-right-btn">×</button>
          <div class="header-actions">
            <h1>Leaderboard</h1>
          </div>

          <div class="legend">
            <div class="legend-item"><div class="legend-box sort-level-1"></div> Primary</div>
            <div class="legend-item"><div class="legend-box sort-level-2"></div> Secondary</div>
            <div class="legend-item"><div class="legend-box sort-level-3"></div> Tertiary</div>
            <div class="legend-item"><div class="legend-box sort-level-4"></div> 4th</div>
            <div class="legend-item"><div class="legend-box sort-level-5"></div> 5th</div>
            <div class="legend-item"><div class="legend-box sort-level-6"></div> 6th</div>
            <div class="legend-item"><div class="legend-box sort-level-7"></div> 7th</div>
            <button id="reset-sort">Reset Sorting</button>
          </div>

          <div class="table-container">
            <table class="leaderboard-table">
              <thead>
                <tr>
                  ${headers.map(h => {
                    const sortIdx = sortLevels.findIndex(s => s.column === h);
                    const levelClass = sortIdx !== -1 ? `sort-level-${sortIdx + 1}` : '';
                    const indicator = sortIdx !== -1 ? (sortLevels[sortIdx].direction === 'asc' ? '▲' : '▼') : '';
                    const tooltip = tooltips[h] ? `title="${tooltips[h]}"` : '';
                    return `<th class="sortable ${levelClass}" data-col="${h}" ${tooltip}>${h} ${indicator}</th>`;
                  }).join('')}
                </tr>
              </thead>
              <tbody>
                ${sortedData.map(row => `
                  <tr>
                    <td>${row.name}</td>
                    <td>${row.accuracy}%</td>
                    <td>${row.time.toFixed(2)}s</td>
                    <td>${row.errors}</td>
                    <td>${row.settings.groupSize}</td>
                    <td>${row.settings.groupsPerLine}</td>
                    <td>${row.settings.totalLines}</td>
                    <td>${row.settings.errorMode}</td>
                    <td>${Screens._formatDate(row.date)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
      render(html);

      // Listeners
      $('back-top-btn').onclick = () => Screens.start();
      $('reset-sort').onclick = () => {
        sortLevels = [];
        renderTable();
      };

      document.querySelectorAll('th.sortable').forEach(th => {
        th.onclick = () => {
          const col = th.dataset.col;
          const existingIdx = sortLevels.findIndex(s => s.column === col);

          if (existingIdx !== -1) {
            // Toggle direction or remove if it was the last level?
            // "Clicking the same column again toggles to Ascending."
            sortLevels[existingIdx].direction = sortLevels[existingIdx].direction === 'desc' ? 'asc' : 'desc';
          } else {
            if (sortLevels.length < 7) {
              sortLevels.push({ column: col, direction: 'desc' });
            } else {
              // Replace primary if already 7? Or just do nothing?
              // The plan says "supports up to 7 levels".
            }
          }
          renderTable();
        };
      });
    };

    renderTable();
  }
};

// Start the app
Screens.start();
