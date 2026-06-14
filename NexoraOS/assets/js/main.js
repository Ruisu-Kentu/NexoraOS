// ===========================
// NEXORAOS - MAIN SYSTEM
// ===========================

// ===========================
// TOAST NOTIFICATION SYSTEM
// ===========================

function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: '✅',
    error:   '❌',
    info:    'ℹ️',
    warning: '⚠️'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <span class="toast-msg">${message}</span>
    <button class="toast-close" onclick="dismissToast(this.parentElement)">✕</button>
    <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
  `;

  container.appendChild(toast);
  setTimeout(() => dismissToast(toast), duration);
}

function dismissToast(toast) {
  if (!toast || toast.classList.contains('hide')) return;
  toast.classList.add('hide');
  setTimeout(() => toast.remove(), 400);
}

function showConfirm(message, onConfirm) {
  const existing = document.getElementById('confirm-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'confirm-modal';
  modal.innerHTML = `
    <div id="confirm-box">
      <div id="confirm-icon">⚠️</div>
      <div id="confirm-msg">${message}</div>
      <div id="confirm-btns">
        <button id="confirm-cancel" onclick="document.getElementById('confirm-modal').remove()">Cancel</button>
        <button id="confirm-ok">Confirm</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.getElementById('confirm-ok').onclick = () => {
    modal.remove();
    onConfirm();
  };
}

// ===========================
// CLOCK
// ===========================

function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// Load desktop folders on startup
window.addEventListener('DOMContentLoaded', () => {
  setDesktopGridRows();
  loadDesktopFolders();
  applyStoredWallpaper();
  if (sessionStorage.getItem('nexora-locked') === '1') {
    lockScreen();
  }
  // Start news ticker after 5 seconds
  setTimeout(() => initNewsTicker(), 5000);
});

window.addEventListener('resize', () => {
  setDesktopGridRows();
});

function setDesktopGridRows() {
  const grid = document.getElementById('desktop-grid');
  if (!grid) return;
  const availableHeight = window.innerHeight - 70;
  const rowSize = 92;
  const rows = Math.floor(availableHeight / rowSize);
  grid.style.gridTemplateRows = `repeat(${rows}, 88px)`;
}

// ===========================
// PROCESS / WINDOW TRACKER
// ===========================

let processes  = [];
let pidCounter = 1;
let highestZ   = 10;

// ===========================
// APP CONFIG
// ===========================

const appConfig = {

  myDocuments: {
    title: ' My Documents', lucideIcon: 'folder',
    width: '680px',
    height: '460px',
    content: `
      <div id="explorer-toolbar">
        <button class="toolbar-btn" onclick="showNewFolderPrompt()"><i data-lucide="folder-plus"></i> New Folder</button>
        <button class="toolbar-btn" onclick="showUploadContextMenu(event)" id="upload-btn"><i data-lucide="upload"></i> Upload File</button>
        <button class="toolbar-btn" onclick="loadDesktopView()"><i data-lucide="monitor"></i> Desktop</button>
        <button class="toolbar-btn" id="paste-btn" onclick="pasteFolderOrFile()" style="display:none;"><i data-lucide="clipboard"></i> Paste</button>
        <span id="explorer-status"></span>
      </div>
      <div id="explorer-breadcrumb">
        <button class="nav-arrow" id="btn-back" onclick="navigateBack()" disabled>&#8592;</button>
        <button class="nav-arrow" id="btn-forward" onclick="navigateForward()" disabled>&#8594;</button>
        <span id="breadcrumb-text" style="font-size: 14px; margin-bottom: 5px;"><i data-lucide="folder"></i> My Documents</span>
      </div>
      <div id="explorer-header">
        <span>Name</span>
        <span>Date Created</span>
        <span>Type</span>
      </div>
      <div id="file-list-container">Loading files...</div>
    `
  },

notepad: {
    title: ' Notepad', lucideIcon: 'file-text',
    width: '600px',
    height: '500px',
    content: `
      <div id="notepad-wrapper">

        <div id="notepad-menubar">
          <div class="notepad-menu-item" id="menu-file" onclick="toggleNotepadMenu('file')">File</div>
          <div class="notepad-menu-item" id="menu-format" onclick="toggleNotepadMenu('format')">Format</div>

          <div class="notepad-dropdown" id="dropdown-file">
            <div class="notepad-dd-row" onclick="notepadOpen()">
              <span>Open</span><span class="notepad-dd-key">Alt+O</span>
            </div>
         <div class="notepad-dd-row" onclick="saveNotepadFile()">
              <span>Save</span><span class="notepad-dd-key">Alt+S</span>
            </div>
            <div class="notepad-dd-row" onclick="saveNotepadAs()">
              <span>Save As</span><span class="notepad-dd-key">Alt+A</span>
            </div>
          </div>

          

          <div class="notepad-dropdown" id="dropdown-format">
            <div class="notepad-dd-label">Font</div>
            <div class="notepad-dd-fonts">
              <div class="notepad-font-opt" onclick="applyNotepadFont('Courier New')"      style="font-family:'Courier New'">Courier New</div>
              <div class="notepad-font-opt" onclick="applyNotepadFont('Arial')"            style="font-family:'Arial'">Arial</div>
              <div class="notepad-font-opt" onclick="applyNotepadFont('Georgia')"          style="font-family:'Georgia'">Georgia</div>
              <div class="notepad-font-opt" onclick="applyNotepadFont('Verdana')"          style="font-family:'Verdana'">Verdana</div>
              <div class="notepad-font-opt" onclick="applyNotepadFont('Trebuchet MS')"     style="font-family:'Trebuchet MS'">Trebuchet MS</div>
              <div class="notepad-font-opt" onclick="applyNotepadFont('Times New Roman')"  style="font-family:'Times New Roman'">Times New Roman</div>
              <div class="notepad-font-opt" onclick="applyNotepadFont('Impact')"           style="font-family:'Impact'">Impact</div>
              <div class="notepad-font-opt" onclick="applyNotepadFont('Comic Sans MS')"    style="font-family:'Comic Sans MS'">Comic Sans MS</div>
              <div class="notepad-font-opt" onclick="applyNotepadFont('Lucida Console')"   style="font-family:'Lucida Console'">Lucida Console</div>
              <div class="notepad-font-opt" onclick="applyNotepadFont('Tahoma')"           style="font-family:'Tahoma'">Tahoma</div>
            </div>
            <div class="notepad-dd-divider"></div>
            <div class="notepad-dd-label">Style</div>
            <div class="notepad-dd-row" onclick="formatText('bold')">
              <span><b>Bold</b></span>
            </div>
            <div class="notepad-dd-row" onclick="formatText('italic')">
              <span><i>Italic</i></span>
            </div>
            <div class="notepad-dd-row" onclick="formatText('underline')">
              <span><u>Underline</u></span>
            </div>
            <div class="notepad-dd-divider"></div>
            <div class="notepad-dd-label">Font Size</div>
            <div class="notepad-dd-size-row">
              <button class="notepad-size-btn" onclick="changeFontSize(-1)">A−</button>
              <span id="font-size-display">14px</span>
              <button class="notepad-size-btn" onclick="changeFontSize(1)">A+</button>
            </div>
            <div class="notepad-dd-divider"></div>
            <div class="notepad-dd-row" onclick="toggleNotepadTheme()">
              <span id="theme-toggle-label">🌙 Dark Mode</span>
            </div>
          </div>

          <div id="notepad-filename-display"></div>
          <div id="notepad-unsaved" style="display:none;">●</div>
        </div>

        <div id="notepad-editor-wrap">
          <div id="notepad-content"
            contenteditable="true"
            spellcheck="true"
            placeholder="Start typing...">
          </div>
        </div>

        <div id="notepad-statusbar">
          <span id="word-count">0 words</span>
          <span id="char-count">0 chars</span>
          <span id="notepad-current-font">Courier New</span>
          <span id="notepad-zoom">14px</span>
        </div>

      </div>

      <div id="notepad-search-bar" style="display:none;">
        <input type="text" id="notepad-search-input" placeholder="Search..."/>
        <button onclick="notepadFindNext()">Find Next</button>
        <button onclick="closeNotepadSearch()">✕</button>
      </div>

      <input type="text" id="notepad-filename" style="display:none;"/>
    `
  },

  terminal: {
    title: ' Terminal', lucideIcon: 'terminal',
    width: '600px',
    height: '400px',
    content: `
      <div id="terminal-output" style="flex:1; overflow-y:auto; padding:8px; font-family:monospace; font-size:13px; color:#00ff99;"></div>
      <div style="display:flex; gap:5px; padding:8px;">
        <span style="color:#00ff99; font-family:monospace;">$</span>
        <input type="text" id="terminal-input" placeholder="Type a command..."
          style="flex:1; background:transparent; border:none; outline:none; color:#00ff99; font-family:monospace; font-size:13px;"
          onkeydown="handleTerminalInput(event)"/>
      </div>`
  },

  taskManager: {
    title: ' Task Manager', lucideIcon: 'settings',
    width: '500px',
    height: '350px',
    content: `
      <div style="padding:10px;">
        <h3 style="margin-bottom:10px; color:#00ffc8; text-transform:uppercase; letter-spacing:1px; font-size:13px;">Running Processes</h3>
        <div id="process-list"></div>
      </div>`
  },

  recycleBin: {
    title: ' Recycle Bin', lucideIcon: 'trash-2',
    width: '680px',
    height: '460px',
    content: `
      <div id="explorer-toolbar">
        <button class="toolbar-btn" onclick="emptyRecycleBin()" style="color:#fca5a5;"><i data-lucide="trash-2"></i> Empty Recycle Bin</button>
        <span id="bin-status"></span>
      </div>
      <div id="explorer-header">
        <span>Name</span>
        <span>Date Deleted</span>
        <span>Type</span>
      </div>
      <div id="bin-list-container">Loading...</div>
    `
  },

  about: {
    title: 'About NexoraOS', lucideIcon: 'info',
    width: '520px',
    height: '480px',
    content: `
      <div id="about-wrapper">
        <div id="about-hero">
          <div id="about-logo">
            <svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg">
              <path d="M479.8 576L384.7 576L276.5 421.5L276.5 512.6L190.1 576L92.4 576L92.4 93.8L132.9 64L240.9 64L364.6 240.1L364.6
              127.4L451 64L548.7 64L548.7 525.5L479.8 576zM103.2 99.3L103.2 560L175.2 507.1L175.2 258L390.7 565.6L475.5 565.6L527.9
              527.4L449.6 527.4L133.5 76.9L103.3 99.2zM185.7 565.9L265.7 507.1L265.7 406.1L185.9 291.7L185.9 512.6L113.3 565.9L185.6
              565.9L185.6 565.9zM145 74.8L455.6 517.4L538 517.4L538 74.8L458.2 74.8L458.2 392.4L235.3 74.8L145 74.8zM375.4 255.6L447.4
              358.4L447.4 79.9L375.4 132.9L375.4 255.6z"/>
            </svg>
          </div>
          <div id="about-title-block">
            <h1 id="about-os-name">NexoraOS</h1>
            <p id="about-version">Version 1.0.0</p>
          </div>
        </div>
        <div id="about-divider"></div>
        <div id="about-description">
          A browser-based operating system simulator built with full-stack web technologies.
          Designed to replicate core OS concepts including file management, process simulation,
          terminal commands, and persistent storage.
        </div>
        <div id="about-specs">
          <div class="about-spec-row">
            <span class="about-spec-label">Platform</span>
            <span class="about-spec-value">Web-Based (Browser)</span>
          </div>
          <div class="about-spec-row">
            <span class="about-spec-label">Frontend</span>
            <span class="about-spec-value">HTML5, CSS3, JavaScript</span>
          </div>
          <div class="about-spec-row">
            <span class="about-spec-label">Backend</span>
            <span class="about-spec-value">PHP 8</span>
          </div>
          <div class="about-spec-row">
            <span class="about-spec-label">Database</span>
            <span class="about-spec-value">MySQL via phpMyAdmin</span>
          </div>
          <div class="about-spec-row">
            <span class="about-spec-label">Server</span>
            <span class="about-spec-value">Apache (XAMPP)</span>
          </div>
          <div class="about-spec-row">
            <span class="about-spec-label">Architecture</span>
            <span class="about-spec-value">MVC-inspired REST API</span>
          </div>
          <div class="about-spec-row">
            <span class="about-spec-label">Authentication</span>
            <span class="about-spec-value">PHP Sessions + bcrypt</span>
          </div>
          <div class="about-spec-row">
            <span class="about-spec-label">Storage</span>
            <span class="about-spec-value">Database-driven Virtual File System</span>
          </div>
        </div>
        <div id="about-divider"></div>
        <div id="about-footer">
          <span>Developed for Web Development — Final Project</span>
          <span id="about-year">© 2026 NexoraOS</span>
        </div>
      </div>
    `
  },

  wallpaperBrowser: {
    title: ' Wallpaper Browser', lucideIcon: 'image',
    width: '780px',
    height: '560px',
    content: `
      <div id="wp-wrapper">

        <div id="wp-toolbar">
          <div id="wp-search-wrap">
            <i data-lucide="search" id="wp-search-icon"></i>
            <input
              type="text"
              id="wp-search-input"
              placeholder="Search wallpapers... (e.g. cyberpunk, space, nature)"
              onkeydown="handleWpSearch(event)"
            />
          </div>
          <button class="toolbar-btn" onclick="doWpSearch()">
            <i data-lucide="search"></i> Search
          </button>
          <button class="toolbar-btn" onclick="loadWpRandom()">
            <i data-lucide="shuffle"></i> Random
          </button>
        </div>

        <div id="wp-status-bar">
          <span id="wp-status-text">Enter a keyword to search wallpapers, or click Random.</span>
        </div>

        <div id="wp-gallery">
          <div id="wp-gallery-grid"></div>
        </div>

        <div id="wp-preview-bar" style="display:none;">
          <img id="wp-preview-img" src="" alt="Preview"/>
          <div id="wp-preview-actions">
            <div id="wp-preview-credit"></div>
            <button class="toolbar-btn" id="wp-apply-btn" onclick="applyUnsplashWallpaper()">
              <i data-lucide="check-circle"></i> Apply to Desktop
            </button>
          </div>
        </div>

      </div>
    `
  },

  systemDashboard: {
    title: ' System Dashboard', lucideIcon: 'layout-dashboard',
    width: '620px',
    height: '500px',
    content: `
      <div id="dashboard-wrapper">

        <div id="dashboard-top">
          <div class="dash-card" id="dash-uptime-card">
            <div class="dash-card-label">UPTIME</div>
            <div class="dash-card-value" id="dash-uptime">00:00:00</div>
          </div>
          <div class="dash-card">
            <div class="dash-card-label">PROCESSES</div>
            <div class="dash-card-value" id="dash-processes">0</div>
          </div>
          <div class="dash-card">
            <div class="dash-card-label">FILES</div>
            <div class="dash-card-value" id="dash-files">—</div>
          </div>
          <div class="dash-card">
            <div class="dash-card-label">FOLDERS</div>
            <div class="dash-card-value" id="dash-folders">—</div>
          </div>
          <div class="dash-card">
            <div class="dash-card-label">UPLOADS</div>
            <div class="dash-card-value" id="dash-uploads">—</div>
          </div>
          <div class="dash-card">
            <div class="dash-card-label">DISK USED</div>
            <div class="dash-card-value" id="dash-disk">—</div>
          </div>
        </div>

        <div id="dashboard-charts">
          <div class="dash-chart-block">
            <div class="dash-chart-label">
              <span>CPU USAGE</span>
              <span id="dash-cpu-val">0%</span>
            </div>
            <div class="dash-bar-track">
              <div class="dash-bar-fill dash-cpu-fill" id="dash-cpu-bar"></div>
            </div>
            <canvas id="dash-cpu-canvas" width="540" height="60"></canvas>
          </div>

          <div class="dash-chart-block">
            <div class="dash-chart-label">
              <span>RAM USAGE</span>
              <span id="dash-ram-val">0%</span>
            </div>
            <div class="dash-bar-track">
              <div class="dash-bar-fill dash-ram-fill" id="dash-ram-bar"></div>
            </div>
            <canvas id="dash-ram-canvas" width="540" height="60"></canvas>
          </div>
        </div>

        <div id="dashboard-footer">
          <span id="dash-status">● SYSTEM NOMINAL</span>
          <span id="dash-time"></span>
        </div>

      </div>
    `
  },

  shortcutsHelp: {
    title: 'Keyboard Shortcuts', lucideIcon: 'keyboard',
    width: '400px',
    height: '380px',
    content: `
      <div id="shortcuts-wrapper">
        <div class="shortcuts-intro">
          All shortcuts work when not typing in an input field.
        </div>
        <div class="shortcuts-list">
         <div class="shortcut-row">
            <span class="shortcut-key">Alt + E</span>
            <span class="shortcut-desc">Open My Documents</span>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-key">Alt + N</span>
            <span class="shortcut-desc">Open Notepad</span>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-key">Alt + T</span>
            <span class="shortcut-desc">Open Terminal</span>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-key">Alt + M</span>
            <span class="shortcut-desc">Open Task Manager</span>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-key">Alt + R</span>
            <span class="shortcut-desc">Open Recycle Bin</span>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-key">Alt + D</span>
            <span class="shortcut-desc">Open System Dashboard</span>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-key">Alt + L</span>
            <span class="shortcut-desc">Lock Screen</span>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-key">Alt + /</span>
            <span class="shortcut-desc">Show this window</span>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-key">Alt + S</span>
            <span class="shortcut-desc">Save file (Notepad)</span>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-key">Alt + A</span>
            <span class="shortcut-desc">Save As (Notepad)</span>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-key">Alt + B</span>
            <span class="shortcut-desc">Open NexoraBrowser</span>
          </div>
          
    `
  },

  nexoraAI: {
    title: ' Nexora AI', lucideIcon: 'bot',
    width: '420px',
    height: '620px',
    content: `
      <div id="ai-wrapper">
        <iframe
          src="https://app.vectorshift.ai/chatbots/embedded/69f16cb908e7fa9ad9f76256"
          id="ai-iframe"
          frameborder="0"
          allow="microphone">
        </iframe>
      </div>
    `
  },

  nexoraBrowser: {
    title: ' NexoraBrowser', lucideIcon: 'globe',
    width: '860px',
    height: '680px',
    content: `
      <div id="browser-tab-bar">
        <!-- tabs injected here by JS -->
        <button id="browser-new-tab-btn" onclick="browserNewTab()" title="New Tab">+</button>
      </div>
      <div id="browser-toolbar">
        <button class="toolbar-btn" id="browser-back-btn" onclick="browserBack()" disabled>
          <i data-lucide="arrow-left"></i>
        </button>
        <button class="toolbar-btn" id="browser-forward-btn" onclick="browserForward()" disabled>
          <i data-lucide="arrow-right"></i>
        </button>
        <button class="toolbar-btn" id="browser-refresh-btn" onclick="browserRefresh()">
          <i data-lucide="refresh-cw"></i>
        </button>
        <div id="browser-address-wrap">
          <i data-lucide="globe" id="browser-addr-icon"></i>
          <input
            type="text"
            id="browser-address-bar"
            placeholder="Enter URL or search with Bing..."
            onkeydown="handleBrowserAddress(event)"
          />
        </div>
        <button class="toolbar-btn" id="browser-go-btn" onclick="browserGo()">
          <i data-lucide="arrow-right-circle"></i> Go
        </button>
      </div>
      <div id="browser-status-bar">
        <span id="browser-status-text">Ready</span>
      </div>
      <div id="browser-content-area">
        <div id="browser-iframe-stack">
          <!-- iframes injected here by JS -->
        </div>
      </div>
    `
  },

  dictionary: {
    title: ' Dictionary', lucideIcon: 'book-open',
    width: '520px',
    height: '560px',
    content: `
      <div id="dict-wrapper">

        <div id="dict-search-bar">
          <div id="dict-input-wrap">
            <i data-lucide="search" id="dict-search-icon"></i>
            <input
              type="text"
              id="dict-input"
              placeholder="Search a word..."
              onkeydown="handleDictSearch(event)"
              oninput="handleDictSuggest(event)"
              autocomplete="off"
            />
            <div id="dict-suggestions"></div>
          </div>
          <button class="toolbar-btn" onclick="doWordSearch()">
            <i data-lucide="search"></i> Search
          </button>
        </div>

        <div id="dict-status-bar">
          <span id="dict-status">Enter a word to look up its definition.</span>
        </div>

        <div id="dict-result-container">
          <div id="dict-placeholder">
            <i data-lucide="book-open" id="dict-placeholder-icon"></i>
            <p>Your definition will appear here.</p>
          </div>
        </div>

      </div>
    `
  },

  currency: {
    title: ' Currency Converter', lucideIcon: 'landmark',
    width: '480px',
    height: '520px',
    content: `
      <div id="currency-wrapper">

        <div id="currency-header">
          <i data-lucide="landmark" id="currency-header-icon"></i>
          <span>Live Exchange Rates</span>
        </div>

        <div id="currency-body">

          <div class="currency-group">
            <label class="currency-label">From</label>
            <div class="currency-row">
              <select id="currency-from" onchange="doConvert()"></select>
              <input
                type="number"
                id="currency-amount"
                value="1"
                min="0"
                oninput="doConvert()"
              />
            </div>
          </div>

          <button id="currency-swap-btn" onclick="swapCurrencies()" title="Swap currencies">
            <i data-lucide="arrow-left-right"></i>
          </button>

          <div class="currency-group">
            <label class="currency-label">To</label>
            <div class="currency-row">
              <select id="currency-to" onchange="doConvert()"></select>
              <div id="currency-result">—</div>
            </div>
          </div>

          <div id="currency-rate-display">
            <span id="currency-rate-text">Select currencies to see rate.</span>
          </div>

          <div id="currency-updated">
            <span id="currency-updated-text"></span>
          </div>

        </div>

        <div id="currency-offline" style="display:none;">
          <i data-lucide="wifi-off" id="currency-offline-icon"></i>
          <div class="currency-offline-title">You Are Offline</div>
          <div class="currency-offline-desc">
            NexoraCurrency requires an internet connection.<br/>
            Please check your connection and try again.
          </div>
        </div>

      </div>
    `
  },

  weather: {
    title: ' Weather', lucideIcon: 'cloud-sun',
    width: '560px',
    height: '620px',
    content: `
      <div id="weather-wrapper">

        <div id="weather-search-bar">
          <div id="weather-input-wrap">
            <i data-lucide="search" id="weather-search-icon"></i>
            <input
              type="text"
              id="weather-input"
              placeholder="Search any city in the world..."
              onkeydown="handleWeatherSearch(event)"
              oninput="handleWeatherSuggest(event)"
              autocomplete="off"
            />
            <div id="weather-suggestions"></div>
          </div>
          <button class="toolbar-btn" onclick="doWeatherSearch()">
            <i data-lucide="search"></i> Search
          </button>
        </div>

        <div id="weather-status-bar">
          <span id="weather-status">Live weather data powered by OpenWeatherMap.</span>
        </div>

        <div id="weather-result">
          <div id="weather-default-grid"></div>
        </div>

      </div>
    `
  },

  nexoraNews: {
    title: ' NexoraNews', lucideIcon: 'newspaper',
    width: '740px',
    height: '640px',
    content: `
      <div id="news-wrapper">

        <div id="news-status-bar">
          <span id="news-status">Loading latest headlines...</span>
          <span id="news-timestamp"></span>
        </div>

        <div id="news-list-container">
          <div id="news-placeholder">
            <i data-lucide="newspaper" id="news-placeholder-icon"></i>
            <p>Fetching latest news...</p>
          </div>
        </div>

        <div id="news-load-more-bar" style="display:none;">
          <div id="news-load-spinner">
            <i data-lucide="loader-2" id="news-spinner-icon"></i>
            <span>Loading more...</span>
          </div>
        </div>

      </div>
    `
  },

  nexoraReader: {
    title: ' NexoraReader', lucideIcon: 'book-open',
    width: '660px',
    height: '620px',
    content: `
      <div id="reader-wrapper">
        <div id="reader-content">
          <div id="reader-placeholder">
            <i data-lucide="book-open" id="reader-placeholder-icon"></i>
            <p>No article loaded.</p>
          </div>
        </div>
      </div>
    `
  },

  nasaApod: {
    title: ' Space Explorer', lucideIcon: 'sun',
    width: '680px',
    height: '640px',
    content: `
      <div id="nasa-wrapper">

        <div id="nasa-toolbar">
          <button class="toolbar-btn" onclick="loadNasaToday()">
            <i data-lucide="sun"></i> Today
          </button>
          <button class="toolbar-btn" onclick="loadNasaRandom()">
            <i data-lucide="shuffle"></i> Random
          </button>
          <div id="nasa-date-wrap">
            <i data-lucide="calendar" id="nasa-cal-icon"></i>
            <input
              type="date"
              id="nasa-date-input"
              onchange="loadNasaByDate(this.value)"
            />
          </div>
          <div id="nasa-favorite-wrap">
            <select id="nasa-favorites" onchange="loadNasaByDate(this.value)">
              <option value="">⭐ Iconic Dates</option>
              <option value="1996-09-04">1996 — First APOD Ever</option>
              <option value="2004-01-04">2004 — Mars Rover Landing</option>
              <option value="2015-07-14">2015 — Pluto Flyby</option>
              <option value="2019-04-10">2019 — First Black Hole Image</option>
              <option value="2022-07-12">2022 — James Webb First Light</option>
            </select>
          </div>
        </div>

        <div id="nasa-status-bar">
          <span id="nasa-status">Loading today's astronomy picture...</span>
          <span id="nasa-date-display"></span>
        </div>

        <div id="nasa-content">
          <div id="nasa-placeholder">
            <i data-lucide="sun"></i>
            <p>Connecting to NASA...</p>
          </div>
        </div>

      </div>
    `
  },

  nexoraMaps: {
    title: ' NexoraMaps', lucideIcon: 'map',
    width: '860px',
    height: '620px',
    content: `
      <div id="maps-wrapper">

        <div id="maps-toolbar">
          <div id="maps-search-wrap">
            <i data-lucide="search" id="maps-search-icon"></i>
            <input
              type="text"
              id="maps-search-input"
              placeholder="Search any place in the world..."
              onkeydown="handleMapsSearch(event)"
              autocomplete="off"
            />
            <div id="maps-suggestions"></div>
          </div>
          <button class="toolbar-btn" onclick="doMapsSearch()">
            <i data-lucide="search"></i> Search
          </button>
          <button class="toolbar-btn" id="maps-locate-btn" onclick="mapsLocateMe()" title="My Location">
            <i data-lucide="locate"></i>
          </button>
          <button class="toolbar-btn" id="maps-style-btn" onclick="toggleMapsStyle()" title="Toggle Style">
            <i data-lucide="layers"></i>
          </button>
          <button class="toolbar-btn" id="maps-measure-btn" onclick="toggleMapsMeasure()" title="Measure Distance">
            <i data-lucide="ruler"></i>
          </button>
        </div>

        <div id="maps-status-bar">
          <span id="maps-status">Click anywhere on the map to drop a pin.</span>
          <span id="maps-coords"></span>
        </div>

        <div id="maps-container">
          <div id="maps-map"></div>
          <div id="maps-info-panel" style="display:none;">
            <div id="maps-info-header">
              <span id="maps-info-title">Location Info</span>
              <button id="maps-info-close" onclick="closeMapsInfo()">✕</button>
            </div>
            <div id="maps-info-body"></div>
          </div>
        </div>

      </div>
    `
  },

  
    calculator: {
    title: ' Calculator', lucideIcon: 'calculator',
    width: '320px',
    height: '500px',
    content: `
      <div id="calc-wrapper">
        <div id="calc-history"></div>
        <div id="calc-display">
          <div id="calc-expression"></div>
          <div id="calc-result">0</div>
        </div>
        <div id="calc-buttons">

          <button class="calc-btn calc-fn"  onclick="calcFn('clear')">AC</button>
          <button class="calc-btn calc-fn"  onclick="calcFn('toggle')">+/−</button>
          <button class="calc-btn calc-fn"  onclick="calcFn('percent')">%</button>
          <button class="calc-btn calc-op"  onclick="calcOp('/')">÷</button>

          <button class="calc-btn calc-num" onclick="calcNum('7')">7</button>
          <button class="calc-btn calc-num" onclick="calcNum('8')">8</button>
          <button class="calc-btn calc-num" onclick="calcNum('9')">9</button>
          <button class="calc-btn calc-op"  onclick="calcOp('*')">×</button>

          <button class="calc-btn calc-num" onclick="calcNum('4')">4</button>
          <button class="calc-btn calc-num" onclick="calcNum('5')">5</button>
          <button class="calc-btn calc-num" onclick="calcNum('6')">6</button>
          <button class="calc-btn calc-op"  onclick="calcOp('-')">−</button>

          <button class="calc-btn calc-num" onclick="calcNum('1')">1</button>
          <button class="calc-btn calc-num" onclick="calcNum('2')">2</button>
          <button class="calc-btn calc-num" onclick="calcNum('3')">3</button>
          <button class="calc-btn calc-op"  onclick="calcOp('+')">+</button>

          <button class="calc-btn calc-fn"  onclick="calcFn('sqrt')">√</button>
          <button class="calc-btn calc-num" onclick="calcNum('0')">0</button>
          <button class="calc-btn calc-num" onclick="calcNum('.')">.</button>
          <button class="calc-btn calc-eq"  onclick="calcEquals()">=</button>

        </div>
      </div>
    `
  }
};

// ===========================
// WINDOW MANAGEMENT
// ===========================

function openWindow(appName) {
  if (processes.find(p => p.app === appName)) {
    focusWindow(appName);
    return;
  }

  const config = appConfig[appName];
  if (!config) return;

  const pid = pidCounter++;
  const win = document.createElement('div');
  win.className = 'window';
  win.id        = 'win-' + appName;
  win.style.width  = config.width;
  win.style.height = config.height;
  // Keep windows within viewport and above taskbar
  const maxTop  = window.innerHeight - parseInt(config.height) - 60;
  const maxLeft = window.innerWidth  - parseInt(config.width)  - 20;
  const topPos  = Math.min(80  + processes.length * 30, Math.max(10, maxTop));
  const leftPos = Math.min(150 + processes.length * 30, Math.max(10, maxLeft));

  win.style.top    = topPos  + 'px';
  win.style.left   = leftPos + 'px';
  win.style.zIndex = ++highestZ;

  win.innerHTML = `
    <div class="window-titlebar" onmousedown="startDrag(event, '${appName}')">
      <span class="win-title-inner">
        <i data-lucide="${config.lucideIcon || 'app-window'}"></i>
        ${config.title}
      </span>
      <div class="window-controls">
        <button class="minimize-btn" onclick="minimizeWindow('${appName}')">−</button>
        <button class="close-btn" onclick="closeWindow('${appName}')">✕</button>
      </div>
    </div>
    <div class="window-content">
      ${config.content}
    </div>
  `;

  document.getElementById('windows-container').appendChild(win);
  lucide.createIcons();
  processes.push({ pid, app: appName, title: config.title });

  // Post-open hooks
  if (appName === 'myDocuments') loadFiles();
  if (appName === 'terminal')    printToTerminal('NexoraOS Terminal v1.0 — type "help" for commands.');
  if (appName === 'recycleBin')  loadBin();

 if (appName === 'notepad') {
    notepadCurrentFileId   = null;
    notepadCurrentFileName = null;
    notepadHasUnsaved      = false;
    setTimeout(() => {
      const fnEl = document.getElementById('notepad-filename');
      const fcEl = document.getElementById('notepad-content');
      if (fnEl) {
        fnEl.value          = '';
        fnEl.dataset.fileId = '';
        fnEl.dataset.saving = 'false';
        fnEl.disabled       = false;
      }
      if (fcEl) {
        fcEl.innerHTML       = '';
        fcEl.contentEditable = 'true';
        fcEl.style.opacity   = '1';
        fcEl.addEventListener('input', () => {
          updateWordCount();
          setNotepadUnsaved();
        });
      }

      // Close menus when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#notepad-menubar')) {
          closeAllNotepadMenus();
        }
      });

      updateWordCount();
    }, 150);
  }

  if (document.getElementById('win-taskManager') || appName === 'taskManager') {
    refreshTaskManager();
  }

  if (appName === 'nexoraBrowser') {
    setTimeout(() => browserInit(), 200);
  }

  if (appName === 'currency') {
    setTimeout(() => initCurrency(), 200);
  }

  if (appName === 'weather') {
    setTimeout(() => {
      const input = document.getElementById('weather-input');
      if (input) input.focus();
    }, 200);
  }

  if (appName === 'nexoraNews') {
    setTimeout(() => loadNews('general', null), 200);
  }

  if (appName === 'nasaApod') {
    setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      const dateInput = document.getElementById('nasa-date-input');
      if (dateInput) {
        dateInput.max = today;
        dateInput.min = '1995-06-16';
      }
      loadNasaToday();
    }, 200);
  }

  if (appName === 'nexoraMaps') {
    setTimeout(() => {
      mapsInstance = null;
      initMaps();
    }, 300);
  }

  if (appName === 'wallpaperBrowser') {
    setTimeout(() => loadWpRandom(), 300);
  }

  win.addEventListener('mousedown', () => focusWindow(appName));
}

function closeWindow(appName) {
  if (appName === 'systemDashboard') stopDashboard();
  if (appName === 'nexoraMaps' && mapsInstance) {
    mapsInstance.remove();
    mapsInstance = null;
  }
  const win = document.getElementById('win-' + appName);
  if (win) win.remove();
  processes = processes.filter(p => p.app !== appName);
  removeTaskbarBtn(appName);
  if (document.getElementById('win-taskManager')) refreshTaskManager();
}

function minimizeWindow(appName) {
  const win = document.getElementById('win-' + appName);
  if (!win) return;
  win.style.display = 'none';
  addTaskbarBtn(appName);
}

function restoreWindow(appName) {
  const win = document.getElementById('win-' + appName);
  if (!win) return;
  win.style.display = 'flex';
  focusWindow(appName);
}

function toggleMinimize(appName) {
  const win = document.getElementById('win-' + appName);
  if (!win) return;
  if (win.style.display === 'none') {
    restoreWindow(appName);
  } else {
    minimizeWindow(appName);
  }
}

function addTaskbarBtn(appName) {
  const taskbarLeft = document.getElementById('taskbar-left');
  if (!taskbarLeft) return;
  if (document.getElementById('tbtn-' + appName)) return;

  const process = processes.find(p => p.app === appName);
  if (!process) return;

  const btn     = document.createElement('button');
  btn.className = 'taskbar-app-btn';
  btn.id        = 'tbtn-' + appName;

  const config = appConfig[appName];
 const iconName = config ? (config.lucideIcon || 'app-window') : 'app-window';
  const label    = process.title;

  btn.innerHTML = `<span class="tbtn-icon"><i data-lucide="${iconName}"></i></span><span class="tbtn-label">${label}</span>`;
  btn.onclick   = () => toggleMinimize(appName);
  taskbarLeft.appendChild(btn);
  lucide.createIcons();
}

function removeTaskbarBtn(appName) {
  const btn = document.getElementById('tbtn-' + appName);
  if (btn) btn.remove();
}

function focusWindow(appName) {
  const win = document.getElementById('win-' + appName);
  if (win) win.style.zIndex = ++highestZ;
}

// ===========================
// DRAG SYSTEM
// ===========================

let dragging    = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

function startDrag(e, appName) {
  const win   = document.getElementById('win-' + appName);
  dragging    = win;
  dragOffsetX = e.clientX - win.offsetLeft;
  dragOffsetY = e.clientY - win.offsetTop;
  focusWindow(appName);
}

document.addEventListener('mousemove', (e) => {
  if (dragging) {
    dragging.style.left = (e.clientX - dragOffsetX) + 'px';
    dragging.style.top  = (e.clientY - dragOffsetY) + 'px';
  }
});

document.addEventListener('mouseup', () => { dragging = null; });

// ===========================
// HIDE ALL CONTEXT MENUS
// ===========================

document.addEventListener('click', () => {
  ['context-menu','bin-context-menu','bin-folder-context-menu',
   'folder-context-menu','upload-context-menu','desktop-context-menu',
   'desktop-folder-context-menu'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
});

// ===========================
// FILE SYSTEM
// ===========================

let selectedFile    = null;
let selectedFolder  = null;
let selectedUpload  = null;
let clipboardFile   = null;
let clipboardFolder = null;
let currentFolderId = null;

let navHistory = [{ folderId: null, folderName: 'My Documents' }];
let navIndex   = 0;

// --- UPLOAD BUTTON HELPERS ---
function removeUploadBtn() {
  const btn   = document.getElementById('upload-btn');
  const input = document.getElementById('upload-input');
  if (btn)   btn.remove();
  if (input) input.remove();
}

function addUploadBtn(folderId) {
  const toolbar = document.getElementById('explorer-toolbar');
  if (!toolbar) return;

  removeUploadBtn();

  const btn     = document.createElement('button');
  btn.className = 'toolbar-btn';
  btn.id        = 'upload-btn';
  btn.innerHTML = 'Upload File';
  btn.onclick   = () => {
    const input = document.getElementById('upload-input');
    if (input) input.click();
  };
  toolbar.appendChild(btn);

  const input    = document.createElement('input');
  input.type     = 'file';
  input.id       = 'upload-input';
  input.style.display = 'none';
  input.accept   = 'image/*,audio/*,video/*,.jfif,.pjpeg,.pjp,.txt,.md,.log,.csv,.json';
  input.onchange = (e) => handleUpload(e, folderId);
  toolbar.appendChild(input);
}

// --- LOAD ROOT ---
function loadFiles() {
  navigateTo(null, 'My Documents');
}

// --- LOAD ROOT CONTENTS ONLY ---
function loadFilesOnly() {
  removeUploadBtn();

  fetch('/NexoraOs/api/folder_actions.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get_all' })
  })
    .then(res => res.json())
    .then(folders => {
      fetch('/NexoraOs/api/get_files.php')
        .then(res => res.json())
        .then(files => {
          const container = document.getElementById('file-list-container');
          if (!container) return;

          let html = '';

          folders.forEach(folder => {
            html += `
              <div class="file-row" id="folder-row-${folder.id}"
                onclick="selectFolder(${folder.id}, '${escapeQuotes(folder.name)}')"
                ondblclick="openFolder(${folder.id}, '${escapeQuotes(folder.name)}')"
                oncontextmenu="showFolderContextMenu(event, ${folder.id}, '${escapeQuotes(folder.name)}')">
                <span class="file-row-name"><i data-lucide="folder"></i> ${folder.name}</span>
                <span class="file-row-date">${folder.created_at}</span>
                <span class="file-row-type">Folder</span>
              </div>`;
          });

          files.forEach(file => {
            html += `
              <div class="file-row" id="file-row-${file.id}"
                onclick="selectFile(${file.id}, '${escapeQuotes(file.name)}')"
                ondblclick="openFileInNotepad(${file.id}, '${escapeQuotes(file.name)}')"
                oncontextmenu="showContextMenu(event, ${file.id}, '${escapeQuotes(file.name)}')">
                <span class="file-row-name">📄 ${file.name}</span>
                <span class="file-row-date">${file.created_at}</span>
                <span class="file-row-type">Text File</span>
              </div>`;
          });

          if (!html) html = '<p style="color:#aaa; padding:12px;">No files or folders yet.</p>';
          container.innerHTML = html;
          lucide.createIcons();
        });
    });
}

// --- DESKTOP VIEW ---
function loadDesktopView() {
  removeUploadBtn();

  const el = document.getElementById('breadcrumb-text');
  if (el) el.innerHTML = `
    <span style="cursor:pointer;" onclick="loadFiles()"><i data-lucide="folder"></i> My Documents</span>
    <span style="color:#888;"> › </span>
    <span style="color:#00ffc8;">🖥️ Desktop</span>
  `;

  fetch('/NexoraOs/api/folder_actions.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get_desktop' })
  })
    .then(res => res.json())
    .then(folders => {
      const container = document.getElementById('file-list-container');
      if (!container) return;

      if (folders.length === 0) {
        container.innerHTML = '<p style="color:#aaa; padding:12px;">No folders on desktop yet. Right-click the desktop to create one.</p>';
        return;
      }

      container.innerHTML = folders.map(folder => `
        <div class="file-row" id="folder-row-${folder.id}"
          onclick="selectFolder(${folder.id}, '${escapeQuotes(folder.name)}')"
          ondblclick="openFolder(${folder.id}, '${escapeQuotes(folder.name)}')"
          oncontextmenu="showFolderContextMenu(event, ${folder.id}, '${escapeQuotes(folder.name)}')">
          <span class="file-row-name"><i data-lucide="folder"></i> ${folder.name}</span>
          <span class="file-row-date">Desktop</span>
          <span class="file-row-type">Folder</span>
        </div>
      `).join('');
      lucide.createIcons();
    })
    .catch(() => showToast('Failed to load desktop folders.', 'error'));
}

// --- NAVIGATION ---
function navigateTo(folderId, folderName, addToHistory = true) {
  if (addToHistory) {
    navHistory = navHistory.slice(0, navIndex + 1);
    navHistory.push({ folderId, folderName });
    navIndex = navHistory.length - 1;
  }

  if (!folderId) {
    currentFolderId = null;
    updateBreadcrumb(null);
    loadFilesOnly();
  } else {
    currentFolderId = folderId;
    updateBreadcrumb(folderName);
    openFolderContents(folderId, folderName);
  }
}

function navigateBack() {
  if (navIndex <= 0) return;
  navIndex--;
  const entry = navHistory[navIndex];
  navigateTo(entry.folderId, entry.folderName, false);
}

function navigateForward() {
  if (navIndex >= navHistory.length - 1) return;
  navIndex++;
  const entry = navHistory[navIndex];
  navigateTo(entry.folderId, entry.folderName, false);
}

function updateBreadcrumb(folderName) {
  const el = document.getElementById('breadcrumb-text');
  if (!el) return;

  if (!currentFolderId) {
    el.innerHTML = `<span style="cursor:pointer;" onclick="loadFiles()"><i data-lucide="folder"></i> My Documents</span>`;
    updateNavArrows();
    return;
  }

  const folderIdToFetch = currentFolderId;

  fetch('/NexoraOs/api/folder_actions.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get_path', id: folderIdToFetch })
  })
    .then(res => res.json())
    .then(path => {
      if (currentFolderId !== folderIdToFetch) return;
      let html = `<span style="cursor:pointer;" onclick="loadFiles()"><i data-lucide="folder"></i> My Documents</span>`;
      path.forEach(segment => {
        html += `<span style="color:#888;"> › </span>
                 <span style="cursor:pointer; color:#00ffc8;"
                   onclick="openFolder(${segment.id}, '${escapeQuotes(segment.name)}')">
                   <i data-lucide="folder"></i> ${segment.name}
                 </span>`;
      });
      el.innerHTML = html;
      updateNavArrows();
    })
    .catch(() => {
      el.innerHTML = `<span style="cursor:pointer;" onclick="loadFiles()"><i data-lucide="folder"></i> My Documents</span>`;
      updateNavArrows();
    });
}

function updateNavArrows() {
  const btnBack    = document.getElementById('btn-back');
  const btnForward = document.getElementById('btn-forward');
  if (btnBack)    btnBack.disabled    = (navIndex <= 0);
  if (btnForward) btnForward.disabled = (navIndex >= navHistory.length - 1);
}

// --- SELECTION ---
function clearSelections() {
  document.querySelectorAll('.file-row').forEach(r => r.classList.remove('selected'));
}

function selectFile(id, name) {
  clearSelections();
  const row = document.getElementById('file-row-' + id);
  if (row) row.classList.add('selected');
  selectedFile   = { id, name };
  selectedFolder = null;
  selectedUpload = null;
}

function selectFolder(id, name) {
  clearSelections();
  const row = document.getElementById('folder-row-' + id);
  if (row) row.classList.add('selected');
  selectedFolder = { id, name };
  selectedFile   = null;
  selectedUpload = null;
}

function selectUpload(id, name, fileType) {
  clearSelections();
  const row = document.getElementById('upload-row-' + id);
  if (row) row.classList.add('selected');
  selectedUpload = { id, name, fileType };
  selectedFile   = null;
  selectedFolder = null;
}

// --- CONTEXT MENUS ---
function showMenu(menuId, x, y) {
  ['context-menu','bin-context-menu','folder-context-menu',
   'upload-context-menu','desktop-context-menu','desktop-folder-context-menu'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const menu = document.getElementById(menuId);
  if (!menu) return;
  menu.style.display = 'block';
  menu.style.left    = x + 'px';
  menu.style.top     = y + 'px';
}

function showContextMenu(e, id, name) {
  e.preventDefault();
  selectFile(id, name);
  showMenu('context-menu', e.clientX, e.clientY);
}

function showFolderContextMenu(e, id, name) {
  e.preventDefault();
  selectFolder(id, name);
  showMenu('folder-context-menu', e.clientX, e.clientY);
}

function showUploadContextMenu(e, id, name, fileType) {
  e.preventDefault();
  selectUpload(id, name, fileType);

  const actionLabel = document.getElementById('upload-context-action');
  if (actionLabel) {
    if (fileType === 'image')      actionLabel.textContent = 'Preview';
    else if (fileType === 'audio') actionLabel.textContent = 'Play';
    else if (fileType === 'video') actionLabel.textContent = 'Play';
    else                           actionLabel.textContent = 'Open';
  }

  showMenu('upload-context-menu', e.clientX, e.clientY);
}

// --- FILE CONTEXT ACTIONS ---
function contextOpen() {
  if (!selectedFile) return;
  openFileInNotepad(selectedFile.id, selectedFile.name);
}

function contextCopy() {
  if (!selectedFile) return;
  clipboardFile   = { ...selectedFile };
  clipboardFolder = null;
  const pasteBtn  = document.getElementById('paste-btn');
  if (pasteBtn) pasteBtn.style.display = 'inline-flex';
  setExplorerStatus('Copied: ' + clipboardFile.name);
}

function contextRename() {
  if (!selectedFile) return;
  const newName = window.prompt('Rename file:', selectedFile.name);
  if (!newName || newName.trim() === '') return;

  fetch('/NexoraOs/api/get_file.php?id=' + selectedFile.id)
    .then(res => res.json())
    .then(file => {
      if (file.error) { showToast('Error: ' + file.error, 'error'); return; }
      fetch('/NexoraOs/api/save_file.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedFile.id, name: newName.trim(), content: file.content })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            selectedFile.name = newName.trim();
            loadFilesOnly();
            setExplorerStatus('Renamed to: ' + newName.trim());
          } else {
            showToast('Error: ' + (data.error || 'Unknown'), 'error');
          }
        });
    });
}

function contextDelete() {
  if (!selectedFile) return;
  showConfirm('Move "' + selectedFile.name + '" to Recycle Bin?', () => {
    fetch('/NexoraOs/api/recycle.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'soft_delete', id: selectedFile.id })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          selectedFile = null;
          loadFilesOnly();
          showToast('File moved to Recycle Bin.', 'warning');
            refreshDashboardIfOpen(); // ADD THIS
        } else {
          showToast('Error: ' + (data.error || 'Unknown'), 'error');
        }
      });
  });
}

// --- FOLDER CONTEXT ACTIONS ---
function folderContextOpen() {
  if (!selectedFolder) return;
  openFolder(selectedFolder.id, selectedFolder.name);
}

function folderContextRename() {
  if (!selectedFolder) return;
  const newName = window.prompt('Rename folder:', selectedFolder.name);
  if (!newName || newName.trim() === '') return;

  fetch('/NexoraOs/api/folder_actions.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'rename', id: selectedFolder.id, name: newName.trim() })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        if (currentFolderId) {
          openFolderContents(currentFolderId, null);
        } else {
          loadFilesOnly();
        }
        setExplorerStatus('Folder renamed to: ' + newName.trim());
      } else {
        showToast('Error: ' + (data.error || 'Unknown'), 'error');
      }
    });
}

function folderContextCopy() {
  if (!selectedFolder) return;
  clipboardFolder = { ...selectedFolder };
  clipboardFile   = null;
  const pasteBtn  = document.getElementById('paste-btn');
  if (pasteBtn) pasteBtn.style.display = 'inline-flex';
  setExplorerStatus('Copied folder: ' + clipboardFolder.name);
}

function folderContextDelete() {
  if (!selectedFolder) return;
  showConfirm('Move "' + selectedFolder.name + '" to Recycle Bin?', () => {
    fetch('/NexoraOs/api/folder_actions.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'soft_delete', id: selectedFolder.id })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          selectedFolder = null;
          if (currentFolderId) {
            openFolderContents(currentFolderId, null);
          } else {
            loadFilesOnly();
          }
          showToast('Folder moved to Recycle Bin.', 'warning');
          refreshDashboardIfOpen(); // ADD THIS
        } else {
          showToast('Error: ' + (data.error || 'Unknown'), 'error');
        }
      });
  });
}

function pasteFolderOrFile() {
  if (clipboardFolder) {
    fetch('/NexoraOs/api/copy_folder.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        folder_id: clipboardFolder.id,
        parent_id: currentFolderId || null
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast('Pasted: ' + clipboardFolder.name + ' - Copy', 'success');
          if (currentFolderId) {
            openFolderContents(currentFolderId, null);
          } else {
            loadFilesOnly();
          }
        } else {
          showToast('Error: ' + (data.error || 'Unknown'), 'error');
        }
      });
  } else if (clipboardFile) {
    pasteFile();
  }
}

// --- OPEN FOLDER ---
function openFolder(id, name) {
  navigateTo(id, name);
}

function openFolderContents(id, name) {
  addUploadBtn(id);

  fetch('/NexoraOs/api/get_folder_files.php?folder_id=' + id)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('file-list-container');
      if (!container) return;

      const folders = data.folders || [];
      const files   = data.files   || [];

      let html = '';

      folders.forEach(folder => {
        html += `
          <div class="file-row" id="folder-row-${folder.id}"
            onclick="selectFolder(${folder.id}, '${escapeQuotes(folder.name)}')"
            ondblclick="openFolder(${folder.id}, '${escapeQuotes(folder.name)}')"
            oncontextmenu="showFolderContextMenu(event, ${folder.id}, '${escapeQuotes(folder.name)}')">
            <span class="file-row-name"><i data-lucide="folder"></i> ${folder.name}</span>
            <span class="file-row-date">${folder.created_at}</span>
            <span class="file-row-type">Folder</span>
          </div>`;
      });

      files.forEach(file => {
        const fileType = getFileType(file.name);
        const icon     = getFileIcon(fileType);
        const typeName = fileType === 'text'  ? 'Text File'
                       : fileType === 'image' ? 'Image'
                       : fileType === 'audio' ? 'Audio'
                       : fileType === 'video' ? 'Video'
                       : 'File';
        html += `
          <div class="file-row" id="upload-row-${file.id}"
            onclick="selectUpload(${file.id}, '${escapeQuotes(file.name)}', '${fileType}')"
            ondblclick="uploadContextAction(${file.id}, '${escapeQuotes(file.name)}', '${fileType}')"
            oncontextmenu="showUploadContextMenu(event, ${file.id}, '${escapeQuotes(file.name)}', '${fileType}')">
            <span class="file-row-name">${icon} ${file.name}</span>
            <span class="file-row-date">${file.created_at}</span>
            <span class="file-row-type">${typeName}</span>
          </div>`;
      });

      if (!html) {
        html = '<p style="color:#aaa; padding:12px;">This folder is empty. Upload a file or create a subfolder.</p>';
      }

      container.innerHTML = html;
      lucide.createIcons();
    });
}

// --- UPLOAD ---
function triggerUpload(folderId) {
  const input = document.getElementById('upload-input');
  if (input) input.click();
}

function handleUpload(e, folderId) {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder_id', folderId);

  setExplorerStatus('Uploading...');

  fetch('/NexoraOs/api/upload_file.php', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('Uploaded: ' + data.name, 'success');
        setExplorerStatus('');
        openFolderContents(folderId, null);
        refreshDashboardIfOpen(); // ADD THIS
      } else {
        showToast('Upload error: ' + (data.error || 'Unknown'), 'error');
        setExplorerStatus('');
      }
      e.target.value = '';
    })
    .catch(() => {
      showToast('Upload failed. Please try again.', 'error');
      setExplorerStatus('');
      e.target.value = '';
    });
}

// --- UPLOADED FILE ACTIONS ---
function uploadContextAction(id, name, fileType) {
  if (!id && selectedUpload) {
    id       = selectedUpload.id;
    name     = selectedUpload.name;
    fileType = selectedUpload.fileType;
  }
  if (!id) return;

  if (fileType === 'text' || fileType === 'file') {
    openFileInNotepad(id, name);
    return;
  }

  fetch('/NexoraOs/api/get_file.php?id=' + id)
    .then(res => res.json())
    .then(file => {
      if (file.error) { showToast('Error: ' + file.error, 'error'); return; }
      const path = '/NexoraOs/uploads/' + file.content;
      if (fileType === 'image')      openImagePreview(path, name);
      else if (fileType === 'audio') openAudioPlayer(path, name);
      else if (fileType === 'video') openVideoPlayer(path, name);
    });
}

function uploadContextRename() {
  if (!selectedUpload) return;
  const newName = window.prompt('Rename file:', selectedUpload.name);
  if (!newName || newName.trim() === '') return;

  fetch('/NexoraOs/api/get_file.php?id=' + selectedUpload.id)
    .then(res => res.json())
    .then(file => {
      fetch('/NexoraOs/api/save_file.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedUpload.id, name: newName.trim(), content: file.content })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            openFolderContents(currentFolderId, null);
            setExplorerStatus('Renamed to: ' + newName.trim());
          } else {
            showToast('Error: ' + (data.error || 'Unknown'), 'error');
          }
        });
    });
}

function uploadContextDelete() {
  if (!selectedUpload) return;
  showConfirm('Move "' + selectedUpload.name + '" to Recycle Bin?', () => {
    fetch('/NexoraOs/api/recycle.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'soft_delete', id: selectedUpload.id })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          selectedUpload = null;
          openFolderContents(currentFolderId, null);
          showToast('File moved to Recycle Bin.', 'warning');
        } else {
          showToast('Error: ' + (data.error || 'Unknown'), 'error');
        }
      });
  });
}

// --- MEDIA VIEWERS ---
function openImagePreview(path, name) {
  const winId = 'imagePreview';
  if (document.getElementById('win-' + winId)) closeWindow(winId);
  appConfig[winId] = {
    title: ' ' + name,
    width: '500px',
    height: '400px',
    content: `<div style="display:flex;align-items:center;justify-content:center;height:100%;padding:10px;">
                <img src="${path}" style="max-width:100%;max-height:100%;border-radius:6px;"/>
              </div>`
  };
  openWindow(winId);
}

function openAudioPlayer(path, name) {
  const winId = 'audioPlayer';
  if (document.getElementById('win-' + winId)) closeWindow(winId);
  appConfig[winId] = {
    title: '🎵 ' + name,
    width: '400px',
    height: '160px',
    content: `<div style="padding:20px;display:flex;flex-direction:column;align-items:center;gap:12px;">
                <p style="color:#ddd;font-size:13px;">🎵 ${name}</p>
                <audio controls autoplay style="width:100%;">
                  <source src="${path}">
                </audio>
              </div>`
  };
  openWindow(winId);
}

function openVideoPlayer(path, name) {
  const winId = 'videoPlayer';
  if (document.getElementById('win-' + winId)) closeWindow(winId);
  appConfig[winId] = {
    title: '🎬 ' + name,
    width: '560px',
    height: '380px',
    content: `<div style="padding:10px;display:flex;flex-direction:column;align-items:center;gap:10px;">
                <video controls autoplay style="width:100%;border-radius:6px;">
                  <source src="${path}">
                </video>
              </div>`
  };
  openWindow(winId);
}

// --- HELPERS ---
function getFileType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  if (['jpg','jpeg','jfif','pjpeg','pjp','png','gif','webp','bmp','svg','ico'].includes(ext)) return 'image';
  if (['mp3','wav','ogg','flac','aac','m4a','wma'].includes(ext)) return 'audio';
  if (['mp4','webm','mkv','avi','mov','wmv','flv'].includes(ext)) return 'video';
  if (['txt','md','log','csv','json','xml','html','css','js','php'].includes(ext)) return 'text';
  return 'file';
}

function getFileIcon(fileType) {
  if (fileType === 'image') return '<i data-lucide="image"></i>';
  if (fileType === 'audio') return '<i data-lucide="music"></i>';
  if (fileType === 'video') return '<i data-lucide="video"></i>';
  return '<i data-lucide="file-text"></i>';
}

function pasteFile() {
  if (!clipboardFile) return;

  fetch('/NexoraOs/api/get_file.php?id=' + clipboardFile.id)
    .then(res => res.json())
    .then(file => {
      if (file.error) { showToast('Error: ' + file.error, 'error'); return; }
      const newName = 'Copy of ' + file.name;
      fetch('/NexoraOs/api/save_file.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, content: file.content })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            if (currentFolderId) {
              openFolderContents(currentFolderId, null);
            } else {
              loadFilesOnly();
            }
            showToast('Pasted as: ' + newName, 'success');
          } else {
            showToast('Error: ' + (data.error || 'Unknown'), 'error');
          }
        });
    });
}

function showNewFilePrompt() {
  const name = window.prompt('Enter filename:', 'untitled.txt');
  if (!name || name.trim() === '') return;

  fetch('/NexoraOs/api/save_file.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.trim(), content: '' })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        loadFilesOnly();
        showToast('Created: ' + name.trim(), 'success');
          refreshDashboardIfOpen(); // ADD THIS
      } else {
        showToast('Error: ' + (data.error || 'Unknown'), 'error');
      }
    });
}

function showNewFolderPrompt() {
  const name = window.prompt('Enter folder name:', 'New Folder');
  if (!name || name.trim() === '') return;

  fetch('/NexoraOs/api/folder_actions.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action:    'create',
      name:      name.trim(),
      parent_id: currentFolderId || null
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        if (currentFolderId) {
          openFolderContents(currentFolderId, null);
        } else {
          loadFilesOnly();
        }
        showToast('Folder created: ' + name.trim(), 'success');
      } else {
        showToast('Error: ' + (data.error || 'Unknown'), 'error');
      }
    });
}

function setExplorerStatus(msg) {
  const el = document.getElementById('explorer-status');
  if (el) {
    el.textContent = msg;
    setTimeout(() => { el.textContent = ''; }, 3000);
  }
}

function escapeQuotes(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// ===========================
// NOTEPAD
// ===========================

let notepadFontSize = 14;
let notepadDarkMode = true;

function openFileInNotepad(id, name) {
  fetch('/NexoraOs/api/get_file.php?id=' + id)
    .then(res => res.json())
    .then(file => {
      if (file.error) { showToast('Error: ' + file.error, 'error'); return; }
      if (!document.getElementById('win-notepad')) openWindow('notepad');
      setTimeout(() => {
        const fnEl    = document.getElementById('notepad-filename');
        const fcEl    = document.getElementById('notepad-content');
        const display = document.getElementById('notepad-filename-display');
        if (fnEl) {
          fnEl.value          = file.name;
          fnEl.disabled       = false;
          fnEl.dataset.fileId = file.id;
          fnEl.dataset.saving = 'false';
        }
        if (fcEl) {
          fcEl.innerHTML       = file.content;
          fcEl.style.opacity   = '1';
          fcEl.contentEditable = 'true';
        }
        if (display) display.textContent = file.name;
        notepadCurrentFileId   = file.id;
        notepadCurrentFileName = file.name;
        notepadHasUnsaved      = false;
        const dot = document.getElementById('notepad-unsaved');
        if (dot) dot.style.display = 'none';
        updateWordCount();
      }, 300);
    });
}

function saveNotepadFile() {
  closeAllNotepadMenus();
  const fnEl = document.getElementById('notepad-filename');
  const fcEl = document.getElementById('notepad-content');
  if (!fnEl || !fcEl) return;

  if (fnEl.dataset.saving === 'true') return;

  const name    = notepadCurrentFileName || fnEl.value.trim();
  const content = fcEl.innerHTML;
  const id      = notepadCurrentFileId || (fnEl.dataset.fileId ? parseInt(fnEl.dataset.fileId) : 0);

  if (!name) {
    const newName = window.prompt('Enter filename:', 'untitled.txt');
    if (!newName || newName.trim() === '') return;
    notepadCurrentFileName = newName.trim();
    fnEl.value = newName.trim();
  }

  fnEl.dataset.saving = 'true';

  fetch('/NexoraOs/api/save_file.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name: notepadCurrentFileName || fnEl.value.trim(), content })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        notepadCurrentFileId = data.id || id;
        setNotepadSaved(notepadCurrentFileName || fnEl.value.trim());
        showToast('File saved!', 'success');
        if (document.getElementById('win-myDocuments')) loadFilesOnly();
        refreshDashboardIfOpen();
      } else {
        showToast('Error saving: ' + (data.error || 'Unknown'), 'error');
      }
      fnEl.dataset.saving = 'false';
    })
    .catch(() => {
      fnEl.dataset.saving = 'false';
      showToast('Connection error.', 'error');
    });
}

function formatText(command) {
  document.execCommand(command, false, null);
  document.getElementById('notepad-content').focus();
}

function changeFontSize(delta) {
  notepadFontSize = Math.min(28, Math.max(10, notepadFontSize + delta));
  const display = document.getElementById('font-size-display');
  const zoom    = document.getElementById('notepad-zoom');
  if (display) display.textContent = notepadFontSize + 'px';
  if (zoom)    zoom.textContent    = notepadFontSize + 'px';

  const selection = window.getSelection();
  if (selection && selection.toString().length > 0) {
    document.execCommand('fontSize', false, '7');
    const fontEls = document.getElementById('notepad-content').querySelectorAll('font[size="7"]');
    fontEls.forEach(el => {
      el.removeAttribute('size');
      el.style.fontSize = notepadFontSize + 'px';
    });
  } else {
    const editor = document.getElementById('notepad-content');
    if (editor) editor.style.fontSize = notepadFontSize + 'px';
  }
}

function toggleNotepadTheme() {
  notepadDarkMode = !notepadDarkMode;
  const wrap   = document.getElementById('notepad-editor-wrap');
  const btn    = document.getElementById('theme-toggle-btn');
  const editor = document.getElementById('notepad-content');
  if (notepadDarkMode) {
    wrap.style.background   = 'rgba(0,0,0,0.3)';
    editor.style.color      = '#d0d8ff';
    editor.style.background = 'transparent';
    if (btn) btn.textContent = '🌙';
  } else {
    wrap.style.background   = '#f5f5f5';
    editor.style.color      = '#1a1a2e';
    editor.style.background = '#f5f5f5';
    if (btn) btn.textContent = '☀️';
  }
}

function updateWordCount() {
  const editor = document.getElementById('notepad-content');
  const wordEl = document.getElementById('word-count');
  const charEl = document.getElementById('char-count');
  if (!editor || !wordEl || !charEl) return;
  const text  = editor.innerText || '';
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  wordEl.textContent = words + ' word' + (words !== 1 ? 's' : '');
  charEl.textContent = text.length + ' char' + (text.length !== 1 ? 's' : '');
}

// ===========================
// TERMINAL
// ===========================

function printToTerminal(text) {
  const output = document.getElementById('terminal-output');
  if (!output) return;
  const line = document.createElement('div');
  line.style.marginBottom = '4px';
  line.style.whiteSpace   = 'pre-wrap';
  line.textContent        = text;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

function handleTerminalInput(e) {
  if (e.key !== 'Enter') return;
  const input = document.getElementById('terminal-input');
  if (!input) return;
  const command = input.value.trim();
  if (!command) return;

  printToTerminal('$ ' + command);
  input.value = '';

  if (command === 'clear') {
    document.getElementById('terminal-output').innerHTML = '';
    return;
  }

  fetch('/NexoraOs/api/command.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command })
  })
    .then(res => res.json())
    .then(data => {
      if (data.output === '__CLEAR__') {
        document.getElementById('terminal-output').innerHTML = '';
        return;
      }
      printToTerminal(data.output);
      if (data.openFile) {
        const file = data.openFile;
        if (!document.getElementById('win-notepad')) openWindow('notepad');
        setTimeout(() => {
          const fnEl = document.getElementById('notepad-filename');
          const fcEl = document.getElementById('notepad-content');
          if (fnEl) { fnEl.value = file.name; fnEl.dataset.fileId = file.id; }
          if (fcEl) fcEl.innerText = file.content;
        }, 300);
      }
    })
    .catch(() => {
      printToTerminal('Error: Could not reach the command processor.');
    });
}

// ===========================
// TASK MANAGER
// ===========================

function refreshTaskManager() {
  const list = document.getElementById('process-list');
  if (!list) return;
  if (processes.length === 0) {
    list.innerHTML = '<p style="color:#aaa;">No running processes.</p>';
    return;
  }
  list.innerHTML = processes.map(p => `
    <div class="process-item">
      <span class="process-info">
        <span class="process-pid">PID ${p.pid}</span>
        ${p.title}
      </span>
      <button class="kill-btn" onclick="killProcess('${p.app}')">End Task</button>
    </div>
  `).join('');
}

function killProcess(appName) {
  closeWindow(appName);
  if (document.getElementById('win-taskManager')) refreshTaskManager();
}

// ===========================
// RECYCLE BIN
// ===========================

let selectedBinFile   = null;
let selectedBinFolder = null;

function loadBin() {
  fetch('/NexoraOs/api/recycle.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get_bin' })
  })
    .then(res => res.json())
    .then(files => {
      fetch('/NexoraOs/api/folder_actions.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_bin' })
      })
        .then(res => res.json())
        .then(folders => {
          const container = document.getElementById('bin-list-container');
          if (!container) return;

          let html = '';

          folders.forEach(folder => {
            html += `
              <div class="file-row" id="bin-folder-row-${folder.id}"
                onclick="selectBinFolder(${folder.id}, '${escapeQuotes(folder.name)}')"
                oncontextmenu="showBinFolderContextMenu(event, ${folder.id}, '${escapeQuotes(folder.name)}')">
                <span class="file-row-name"><i data-lucide="folder"></i> ${folder.name}</span>
                <span class="file-row-date">${folder.created_at}</span>
                <span class="file-row-type">Folder</span>
              </div>`;
          });

          files.forEach(file => {
            const fileType = getFileType(file.name);
            const icon     = getFileIcon(fileType);
            const typeName = fileType === 'file' ? 'Text File'
                           : fileType.charAt(0).toUpperCase() + fileType.slice(1);
            html += `
              <div class="file-row" id="bin-row-${file.id}"
                onclick="selectBinFile(${file.id}, '${escapeQuotes(file.name)}')"
                ondblclick="previewBinFile(${file.id}, '${escapeQuotes(file.name)}')"
                oncontextmenu="showBinContextMenu(event, ${file.id}, '${escapeQuotes(file.name)}')">
                <span class="file-row-name">${icon} ${file.name}</span>
                <span class="file-row-date">${file.created_at}</span>
                <span class="file-row-type">${typeName}</span>
              </div>`;
          });

          if (!html) html = '<p style="color:#aaa; padding:12px;">Recycle Bin is empty.</p>';
          container.innerHTML = html;
          lucide.createIcons();
        });
    });
}

function selectBinFile(id, name) {
  document.querySelectorAll('.file-row').forEach(r => r.classList.remove('selected'));
  const row = document.getElementById('bin-row-' + id);
  if (row) row.classList.add('selected');
  selectedBinFile   = { id, name };
  selectedBinFolder = null;
}

function selectBinFolder(id, name) {
  document.querySelectorAll('.file-row').forEach(r => r.classList.remove('selected'));
  const row = document.getElementById('bin-folder-row-' + id);
  if (row) row.classList.add('selected');
  selectedBinFolder = { id, name };
  selectedBinFile   = null;
}

function showBinContextMenu(e, id, name) {
  e.preventDefault();
  selectBinFile(id, name);
  showMenu('bin-context-menu', e.clientX, e.clientY);
}

function showBinFolderContextMenu(e, id, name) {
  e.preventDefault();
  selectBinFolder(id, name);
  showMenu('bin-folder-context-menu', e.clientX, e.clientY);
}

function binContextRestore() {
  if (!selectedBinFile) return;
  fetch('/NexoraOs/api/recycle.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'restore', id: selectedBinFile.id })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        selectedBinFile = null;
        loadBin();
        showToast('File restored to My Documents.', 'success');
        if (document.getElementById('win-myDocuments')) loadFilesOnly();
        refreshDashboardIfOpen(); // ADD THIS
      } else {
        showToast('Error: ' + (data.error || 'Unknown'), 'error');
      }
    });
}

function binFolderRestore() {
  if (!selectedBinFolder) return;
  fetch('/NexoraOs/api/folder_actions.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'restore', id: selectedBinFolder.id })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        selectedBinFolder = null;
        loadBin();
        showToast('Folder restored to My Documents.', 'success');
        if (document.getElementById('win-myDocuments')) loadFilesOnly();
      } else {
        showToast('Error: ' + (data.error || 'Unknown'), 'error');
      }
    });
}

function binContextPermanentDelete() {
  if (!selectedBinFile) return;
  showConfirm('Permanently delete "' + selectedBinFile.name + '"? This CANNOT be undone.', () => {
    fetch('/NexoraOs/api/recycle.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'permanent_delete', id: selectedBinFile.id })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          selectedBinFile = null;
          loadBin();
          showToast('File permanently deleted.', 'error');
          refreshDashboardIfOpen(); // ADD THIS
        } else {
          showToast('Error: ' + (data.error || 'Unknown'), 'error');
        }
      });
  });
}

function binFolderPermanentDelete() {
  if (!selectedBinFolder) return;
  showConfirm('Permanently delete "' + selectedBinFolder.name + '" and ALL its contents?', () => {
    fetch('/NexoraOs/api/folder_actions.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'permanent_delete', id: selectedBinFolder.id })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          selectedBinFolder = null;
          loadBin();
          showToast('Folder permanently deleted.', 'error');
        } else {
          showToast('Error: ' + (data.error || 'Unknown'), 'error');
        }
      });
  });
}

function emptyRecycleBin() {
  showConfirm('Permanently delete EVERYTHING in the Recycle Bin? This CANNOT be undone.', () => {
    fetch('/NexoraOs/api/recycle.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'empty_bin' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          loadBin();
          showToast('Recycle Bin emptied.', 'error');
          refreshDashboardIfOpen(); // ADD THIS
        } else {
          showToast('Error: ' + (data.error || 'Unknown'), 'error');
        }
      });
  });
}

function setBinStatus(msg) {
  const el = document.getElementById('bin-status');
  if (el) {
    el.textContent = msg;
    setTimeout(() => { el.textContent = ''; }, 3000);
  }
}

function previewBinFile(id, name) {
  const fileType = getFileType(name);
  fetch('/NexoraOs/api/get_file.php?id=' + id)
    .then(res => res.json())
    .then(file => {
      if (file.error) { showToast('Error: ' + file.error, 'error'); return; }

      if (fileType === 'image') {
        openImagePreview('/NexoraOs/uploads/' + file.content, name);
      } else if (fileType === 'audio') {
        openAudioPlayer('/NexoraOs/uploads/' + file.content, name);
      } else if (fileType === 'video') {
        openVideoPlayer('/NexoraOs/uploads/' + file.content, name);
      } else {
        if (!document.getElementById('win-notepad')) openWindow('notepad');
        setTimeout(() => {
          const fnEl    = document.getElementById('notepad-filename');
          const fcEl    = document.getElementById('notepad-content');
          const saveBtn = document.querySelector('#win-notepad .notepad-action-btn');
          if (fnEl) { fnEl.value = '🗑️ ' + file.name + ' (Read-only)'; fnEl.disabled = true; }
if (fcEl) { fcEl.innerHTML = file.content; fcEl.contentEditable = 'false'; fcEl.style.opacity = '0.6'; }
          if (saveBtn) saveBtn.style.display = 'none';
        }, 300);
      }
    });
}

// ===========================
// LOGOUT
// ===========================

function logoutUser() {
  showConfirm('Log out of NexoraOS?', () => {
    fetch('/NexoraOs/api/logout.php')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          document.body.style.transition = 'opacity 0.5s ease';
          document.body.style.opacity    = '0';
          setTimeout(() => {
            localStorage.removeItem('nexora-login-time');
            window.location.href = '/NexoraOs/login.html';
          }, 500);
        }
      });
  });
}

// ===========================
// DESKTOP FOLDERS
// ===========================

function loadDesktopFolders() {
  fetch('/NexoraOs/api/folder_actions.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get_desktop' })
  })
    .then(res => res.json())
    .then(folders => {
      const container = document.getElementById('desktop-folder-grid');
      if (!container) return;

      container.innerHTML = '';

      folders.forEach(folder => {
        const icon     = document.createElement('div');
        icon.className = 'desktop-folder-icon';
        icon.id        = 'deskfolder-' + folder.id;

        icon.innerHTML = `
          <div class="icon-img"><i data-lucide="folder"></i></div>
          <span>${folder.name}</span>
        `;

        icon.addEventListener('dblclick', () => {
          if (!document.getElementById('win-myDocuments')) openWindow('myDocuments');
          setTimeout(() => openFolder(folder.id, folder.name), 200);
        });

        icon.addEventListener('click', (e) => {
          e.stopPropagation();
          document.querySelectorAll('.desktop-folder-icon').forEach(i => i.classList.remove('selected'));
          icon.classList.add('selected');
        });

        icon.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          e.stopPropagation();
          document.querySelectorAll('.desktop-folder-icon').forEach(i => i.classList.remove('selected'));
          icon.classList.add('selected');
          showDesktopFolderMenu(e, folder.id, folder.name);
        });

        container.appendChild(icon);
      });
      lucide.createIcons();
    });
}

let selectedDesktopFolder = null;

function showDesktopFolderMenu(e, id, name) {
  selectedDesktopFolder = { id, name };
  showMenu('desktop-folder-context-menu', e.clientX, e.clientY);
}

function desktopFolderOpen() {
  if (!selectedDesktopFolder) return;
  if (!document.getElementById('win-myDocuments')) openWindow('myDocuments');
  setTimeout(() => openFolder(selectedDesktopFolder.id, selectedDesktopFolder.name), 200);
}

function desktopFolderRename() {
  if (!selectedDesktopFolder) return;
  const newName = window.prompt('Rename folder:', selectedDesktopFolder.name);
  if (!newName || newName.trim() === '') return;

  fetch('/NexoraOs/api/folder_actions.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'rename', id: selectedDesktopFolder.id, name: newName.trim() })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        loadDesktopFolders();
        showToast('Folder renamed.', 'success');
      } else {
        showToast('Error: ' + (data.error || 'Unknown'), 'error');
      }
    });
}

function desktopFolderDelete() {
  if (!selectedDesktopFolder) return;
  showConfirm('Move "' + selectedDesktopFolder.name + '" to Recycle Bin?', () => {
    fetch('/NexoraOs/api/folder_actions.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'soft_delete', id: selectedDesktopFolder.id })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          selectedDesktopFolder = null;
          loadDesktopFolders();
          showToast('Folder moved to Recycle Bin.', 'warning');
        } else {
          showToast('Error: ' + (data.error || 'Unknown'), 'error');
        }
      });
  });
}

function showDesktopNewFolder() {
  const name = window.prompt('Enter folder name:', 'New Folder');
  if (!name || name.trim() === '') return;

  fetch('/NexoraOs/api/folder_actions.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action:     'create',
      name:       name.trim(),
      parent_id:  null,
      is_desktop: 1,
      position_x: 0,
      position_y: 0
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        loadDesktopFolders();
        showToast('Folder "' + name.trim() + '" created on desktop.', 'success');
        refreshDashboardIfOpen(); // ADD THIS
      } else {
        showToast('Error: ' + (data.error || 'Unknown'), 'error');
      }
    });
}

function refreshDesktop() {
  loadDesktopFolders();
  if (document.getElementById('win-myDocuments')) loadFilesOnly();
  showToast('Desktop refreshed.', 'info');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.desktop-folder-icon') &&
      !e.target.closest('.desktop-icon') &&
      !e.target.closest('.window')) {
    document.querySelectorAll('.desktop-folder-icon').forEach(i => i.classList.remove('selected'));
  }
});

document.addEventListener('contextmenu', (e) => {
  if (e.target.closest('.window')              ||
      e.target.closest('.desktop-icon')        ||
      e.target.closest('.context-menu-box')    ||
      e.target.closest('.desktop-folder-icon') ||
      e.target.closest('#taskbar')) return;

  e.preventDefault();
  showMenu('desktop-context-menu', e.clientX, e.clientY);
});

// ===========================
// PERSONALIZE
// ===========================

let pendingWallpaper = null;

function showPersonalize() {
  const modal = document.getElementById('personalize-modal');
  if (!modal) return;
  modal.classList.add('show');

  const saved = localStorage.getItem('nexora-wallpaper');
  if (saved) {
    const preview     = document.getElementById('wallpaper-preview');
    const placeholder = document.getElementById('wallpaper-placeholder');
    if (preview)     { preview.src = saved; preview.style.display = 'block'; }
    if (placeholder) placeholder.style.display = 'none';
  }
}

function closePersonalize() {
  const modal = document.getElementById('personalize-modal');
  if (modal) modal.classList.remove('show');
  pendingWallpaper = null;
  const applyBtn = document.getElementById('apply-wallpaper-btn');
  if (applyBtn) applyBtn.style.display = 'none';
}

function previewWallpaper(e) {
  const file = e.target.files[0];
  if (!file) return;

  pendingWallpaper = file;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const preview     = document.getElementById('wallpaper-preview');
    const placeholder = document.getElementById('wallpaper-placeholder');
    const applyBtn    = document.getElementById('apply-wallpaper-btn');
    if (preview)     { preview.src = ev.target.result; preview.style.display = 'block'; }
    if (placeholder) placeholder.style.display = 'none';
    if (applyBtn)    applyBtn.style.display = 'inline-flex';
  };
  reader.readAsDataURL(file);
}

function applyWallpaper() {
  if (!pendingWallpaper) return;

  const formData = new FormData();
  formData.append('wallpaper', pendingWallpaper);

  fetch('/NexoraOs/api/save_wallpaper.php', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById('desktop').style.background =
          `url('${data.path}') center/cover no-repeat`;
        localStorage.setItem('nexora-wallpaper', data.path);
        closePersonalize();
        showToast('Wallpaper applied!', 'success');
      } else {
        showToast('Error: ' + (data.error || 'Unknown'), 'error');
      }
    })
    .catch(() => showToast('Upload failed. Try again.', 'error'));
}

function removeWallpaper() {
  localStorage.removeItem('nexora-wallpaper');
  document.getElementById('desktop').style.background =
    'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 25%, #0f1929 50%, #1a0f2e 75%, #0a0e27 100%)';
  closePersonalize();
  showToast('Wallpaper removed.', 'info');
}

function applyStoredWallpaper() {
  const saved = localStorage.getItem('nexora-wallpaper');
  if (saved) {
    const desktop = document.getElementById('desktop');
    if (desktop) desktop.style.background = `url('${saved}') center/cover no-repeat`;
  }
}


// ===========================
// CALCULATOR
// ===========================

let calcCurrent    = '0';
let calcPrev       = '';
let calcOperator   = null;
let calcShouldReset = false;

function calcUpdateDisplay() {
  const result = document.getElementById('calc-result');
  const expr   = document.getElementById('calc-expression');
  if (result) result.textContent = calcCurrent;

  if (expr) {
    if (calcOperator && calcPrev) {
      const opSymbol = calcOperator === '*' ? '×'
                     : calcOperator === '/' ? '÷'
                     : calcOperator;
      expr.textContent = calcPrev + ' ' + opSymbol;
    } else {
      expr.textContent = '';
    }
  }
}

function calcNum(val) {
  if (calcShouldReset) {
    calcCurrent    = '';
    calcShouldReset = false;
  }

  // Prevent multiple decimals
  if (val === '.' && calcCurrent.includes('.')) return;

  // Limit display length
  if (calcCurrent.length >= 12) return;

  if (calcCurrent === '0' && val !== '.') {
    calcCurrent = val;
  } else {
    calcCurrent += val;
  }

  calcUpdateDisplay();
}

function calcOp(op) {
  if (calcOperator && !calcShouldReset) {
    calcEquals(true);
  }

  calcPrev       = calcCurrent;
  calcOperator   = op;
  calcShouldReset = true;
  calcUpdateDisplay();
}

function calcEquals(silent = false) {
  if (!calcOperator || !calcPrev) return;

  const a = parseFloat(calcPrev);
  const b = parseFloat(calcCurrent);
  let result;

  switch (calcOperator) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    case '/':
      if (b === 0) {
        calcCurrent = 'Error';
        calcOperator = null;
        calcPrev     = '';
        calcUpdateDisplay();
        return;
      }
      result = a / b;
      break;
    default: return;
  }

  // Add to history
  if (!silent) {
    const opSymbol = calcOperator === '*' ? '×'
                   : calcOperator === '/' ? '÷'
                   : calcOperator;
    addCalcHistory(calcPrev + ' ' + opSymbol + ' ' + calcCurrent + ' = ' + formatCalcResult(result));
  }

  calcCurrent    = formatCalcResult(result);
  calcOperator   = null;
  calcPrev       = '';
  calcShouldReset = true;
  calcUpdateDisplay();
}

function calcFn(fn) {
  const val = parseFloat(calcCurrent);

  switch (fn) {
    case 'clear':
      calcCurrent    = '0';
      calcPrev       = '';
      calcOperator   = null;
      calcShouldReset = false;
      const expr = document.getElementById('calc-expression');
      if (expr) expr.textContent = '';
      break;

    case 'toggle':
      if (calcCurrent !== '0' && calcCurrent !== 'Error') {
        calcCurrent = calcCurrent.startsWith('-')
          ? calcCurrent.slice(1)
          : '-' + calcCurrent;
      }
      break;

    case 'percent':
      if (!isNaN(val)) {
        calcCurrent = formatCalcResult(val / 100);
      }
      break;

    case 'sqrt':
      if (val < 0) {
        calcCurrent = 'Error';
      } else {
        addCalcHistory('√' + calcCurrent + ' = ' + formatCalcResult(Math.sqrt(val)));
        calcCurrent = formatCalcResult(Math.sqrt(val));
        calcShouldReset = true;
      }
      break;
  }

  calcUpdateDisplay();
}

function formatCalcResult(num) {
  if (isNaN(num) || !isFinite(num)) return 'Error';
  // Round to avoid floating point mess
  const rounded = Math.round(num * 1e10) / 1e10;
  // Trim long decimals
  return parseFloat(rounded.toFixed(10)).toString();
}

function addCalcHistory(entry) {
  const history = document.getElementById('calc-history');
  if (!history) return;
  const line = document.createElement('div');
  line.className   = 'calc-history-item';
  line.textContent = entry;
  history.appendChild(line);
  history.scrollTop = history.scrollHeight;
}

// Keyboard support for calculator
document.addEventListener('keydown', (e) => {
  if (!document.getElementById('win-calculator')) return;

  const key = e.key;
  if ('0123456789'.includes(key))  { calcNum(key); return; }
  if (key === '.')                  { calcNum('.'); return; }
  if (key === '+')                  { calcOp('+'); return; }
  if (key === '-')                  { calcOp('-'); return; }
  if (key === '*')                  { calcOp('*'); return; }
  if (key === '/')                  { e.preventDefault(); calcOp('/'); return; }
  if (key === 'Enter' || key === '=') { calcEquals(); return; }
  if (key === 'Escape')             { calcFn('clear'); return; }
  if (key === 'Backspace') {
    if (calcCurrent.length > 1) {
      calcCurrent = calcCurrent.slice(0, -1);
    } else {
      calcCurrent = '0';
    }
    calcUpdateDisplay();
  }
});


// ===========================
// SYSTEM DASHBOARD
// ===========================

let dashInterval      = null;
const dashStartTime = window.loginTime || Date.now();
let dashCpuHistory    = new Array(54).fill(10);
let dashRamHistory    = new Array(54).fill(28);
let dashCpuCurrent    = 10;
let dashRamCurrent    = 28;

const appResourceWeights = {
  myDocuments:     { cpu: 8,  ram: 12 },
  notepad:         { cpu: 5,  ram: 8  },
  terminal:        { cpu: 15, ram: 10 },
  taskManager:     { cpu: 6,  ram: 6  },
  recycleBin:      { cpu: 7,  ram: 9  },
  calculator:      { cpu: 3,  ram: 4  },
  nexoraAI:        { cpu: 12, ram: 18 },
  systemDashboard: { cpu: 10, ram: 14 },
  about:           { cpu: 2,  ram: 3  },
  imagePreview:    { cpu: 10, ram: 15 },
  audioPlayer:     { cpu: 18, ram: 12 },
  videoPlayer:     { cpu: 25, ram: 20 },
};

function getTargetResources() {
  let cpu = 8 + Math.random() * 4;
  let ram = 25 + Math.random() * 5;
  processes.forEach(p => {
    const w = appResourceWeights[p.app];
    if (w) {
      cpu += w.cpu + (Math.random() * 3 - 1.5);
      ram += w.ram + (Math.random() * 2 - 1);
    }
  });
  return {
    cpu: Math.min(98, Math.max(5, cpu)),
    ram: Math.min(95, Math.max(20, ram))
  };
}

function openDashboard() {
  if (!document.getElementById('win-systemDashboard')) {
    openWindow('systemDashboard');
    setTimeout(() => startDashboard(), 300);
  } else {
    focusWindow('systemDashboard');
  }
}

function startDashboard() {
 
  fetchDashboardStats();
  updateDashboard();
  dashInterval = setInterval(() => {
    updateDashboard();
  }, 1000);

  const win = document.getElementById('win-systemDashboard');
  if (win) {
    win.addEventListener('remove', stopDashboard);
  }
}

function stopDashboard() {
  if (dashInterval) {
    clearInterval(dashInterval);
    dashInterval = null;
  }
}

function fetchDashboardStats() {
  fetch('/NexoraOs/api/system_stats.php')
    .then(res => res.json())
    .then(data => {
      const files   = document.getElementById('dash-files');
      const folders = document.getElementById('dash-folders');
      const uploads = document.getElementById('dash-uploads');
      const disk    = document.getElementById('dash-disk');
      if (files)   files.textContent   = data.total_files;
      if (folders) folders.textContent = data.total_folders;
      if (uploads) uploads.textContent = data.total_uploads;
      if (disk)    disk.textContent    = data.disk_used;
    })
    .catch(() => {});
}

function refreshDashboardIfOpen() {
  if (document.getElementById('win-systemDashboard')) {
    fetchDashboardStats();
  }
}

function updateDashboard() {
  if (!document.getElementById('win-systemDashboard')) {
    stopDashboard();
    return;
  }

  // Uptime
  const elapsed = Math.floor((Date.now() - dashStartTime) / 1000);
  const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
  const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
  const s = String(elapsed % 60).padStart(2, '0');
  const uptimeEl = document.getElementById('dash-uptime');
  if (uptimeEl) uptimeEl.textContent = `${h}:${m}:${s}`;

  // Processes
  const procEl = document.getElementById('dash-processes');
  if (procEl) procEl.textContent = processes.length;

  // Clock
  const timeEl = document.getElementById('dash-time');
  if (timeEl) timeEl.textContent = new Date().toLocaleTimeString();

  // Resource usage based on open apps
  const targets    = getTargetResources();
  dashCpuCurrent   = dashCpuCurrent + (targets.cpu - dashCpuCurrent) * 0.25;
  dashRamCurrent   = dashRamCurrent + (targets.ram - dashRamCurrent) * 0.12;
  dashCpuHistory.push(Math.round(dashCpuCurrent));
  dashRamHistory.push(Math.round(dashRamCurrent));
  dashCpuHistory.shift();
  dashRamHistory.shift();

  // Update bars
  const cpuBar = document.getElementById('dash-cpu-bar');
  const ramBar = document.getElementById('dash-ram-bar');
  const cpuVal = document.getElementById('dash-cpu-val');
  const ramVal = document.getElementById('dash-ram-val');

  if (cpuBar) cpuBar.style.width = dashCpuCurrent + '%';
  if (ramBar) ramBar.style.width = dashRamCurrent + '%';
  if (cpuVal) cpuVal.textContent = Math.round(dashCpuCurrent) + '%';
  if (ramVal) ramVal.textContent = Math.round(dashRamCurrent) + '%';

  // Draw canvases
  drawDashCanvas('dash-cpu-canvas', dashCpuHistory, '#00ffc8');
  drawDashCanvas('dash-ram-canvas', dashRamHistory, '#ff0096');

  // Status
  const statusEl = document.getElementById('dash-status');
  if (statusEl) {
    const cpu = Math.round(dashCpuCurrent);
    if (cpu > 80) {
      statusEl.textContent = '⚠ HIGH CPU LOAD';
      statusEl.style.color = '#ffd060';
    } else {
      statusEl.textContent = '● SYSTEM NOMINAL';
      statusEl.style.color = '#00ffc8';
    }
  }

 
  // Refresh real stats every 5 seconds
  if (elapsed % 5 === 0) fetchDashboardStats();
}

function drawDashCanvas(canvasId, history, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w   = canvas.width;
  const h   = canvas.height;
  const len  = history.length;

  ctx.clearRect(0, 0, w, h);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth   = 1;
  for (let i = 0; i <= 4; i++) {
    const y = (h / 4) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Fill gradient under line
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, color + '44');
  gradient.addColorStop(1, color + '00');

  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let i = 0; i < len; i++) {
    const x = (w / (len - 1)) * i;
    const y = h - (history[i] / 100) * h;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth   = 2;
  ctx.lineJoin    = 'round';
  for (let i = 0; i < len; i++) {
    const x = (w / (len - 1)) * i;
    const y = h - (history[i] / 100) * h;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
}


// ===========================
// KEYBOARD SHORTCUTS
// ===========================

const keyboardShortcuts = {
  'alt+e': () => openWindow('myDocuments'),
  'alt+n': () => openWindow('notepad'),
  'alt+t': () => openWindow('terminal'),
  'alt+m': () => openWindow('taskManager'),
  'alt+r': () => openWindow('recycleBin'),
  'alt+d': () => openDashboard(),
  'alt+l': () => lockScreen(),
  'alt+/': () => openWindow('shortcutsHelp'),
  'alt+s': () => { if (document.getElementById('win-notepad')) saveNotepadFile(); },
  'alt+a': () => { if (document.getElementById('win-notepad')) saveNotepadAs(); },
  'alt+b': () => openWindow('nexoraBrowser'),
  'alt+w': () => openWindow('wallpaperBrowser'),
};

document.addEventListener('keydown', (e) => {
  // Skip if typing in an input or contenteditable
  const tag = document.activeElement.tagName.toLowerCase();
  const isEditable = document.activeElement.contentEditable === 'true';
  if (tag === 'input' || tag === 'textarea' || isEditable) return;

 const key = (e.altKey ? 'alt+' : '') + e.key.toLowerCase();

  if (keyboardShortcuts[key]) {
    e.preventDefault();
    keyboardShortcuts[key]();
  }
});


// ===========================
// LOCK SCREEN
// ===========================

let lockClockInterval = null;

function lockScreen() {
  if (document.getElementById('lock-screen')) return;

  const lock = document.createElement('div');
  lock.id = 'lock-screen';
  lock.innerHTML = `
    <video id="lock-video" autoplay loop muted playsinline>
      <source src="assets/video/NexoraOS.mp4">y
    </video>
    <div id="lock-overlay"></div>

    <div id="lock-content">
      <div id="lock-clock">00:00:00</div>
      <div id="lock-date"></div>

      <div id="lock-card">
        <div id="lock-card-title"> SYSTEM LOCKED</div>
        <input type="password" id="lock-password"
          placeholder="Enter password to unlock"
          onkeydown="if(event.key==='Enter') attemptUnlock()"/>
        <div id="lock-error"></div>
       <button id="lock-unlock-btn" onclick="attemptUnlock()">UNLOCK</button>
        <button id="lock-logout-btn" onclick="lockScreenLogout()">Sign Out Instead</button>
      </div>
    </div>
  `;

  document.body.appendChild(lock);
  sessionStorage.setItem('nexora-locked', '1');
  setTimeout(() => startLockClock(), 50);

  setTimeout(() => {
    lock.classList.add('show');
    document.getElementById('lock-password').focus();
  }, 10);
}

function createLockParticles() {
  const container = document.getElementById('lock-particles');
  if (!container) return;
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.className = 'lock-particle';
    const size = Math.random() * 3 + 1;
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      animation-duration: ${Math.random() * 12 + 8}s;
      animation-delay: ${Math.random() * 8}s;
      opacity: ${Math.random() * 0.5 + 0.2};
    `;
    container.appendChild(p);
  }
}

function startLockClock() {
  function updateLockClock() {
    const now     = new Date();
    const clockEl = document.getElementById('lock-clock');
    const dateEl  = document.getElementById('lock-date');
    if (clockEl) clockEl.textContent = now.toLocaleTimeString();
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year:    'numeric',
        month:   'long',
        day:     'numeric'
      });
    }
  }
  updateLockClock();
  lockClockInterval = setInterval(updateLockClock, 1000);
}

function attemptUnlock() {
  const input   = document.getElementById('lock-password');
  const errorEl = document.getElementById('lock-error');
  const card    = document.getElementById('lock-card');
  if (!input) return;

  const password = input.value;
  if (!password) {
    errorEl.textContent = 'Please enter your password.';
    shakeCard(card);
    return;
  }

  errorEl.textContent = '';

  // Get username from taskbar
  const usernameEl = document.getElementById('taskbar-username');
  const username   = usernameEl
    ? usernameEl.textContent.replace('👤 ', '').trim()
    : 'admin';

  fetch('/NexoraOs/api/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
          sessionStorage.removeItem('nexora-locked');
          const lock = document.getElementById('lock-screen');
          if (lock) {
            lock.classList.remove('show');
            lock.classList.add('hide');
            setTimeout(() => {
              lock.remove();
              clearInterval(lockClockInterval);
              lockClockInterval = null;
            }, 600);
          }
      } else {
        input.value          = '';
        errorEl.textContent  = 'Wrong password. Try again.';
        shakeCard(card);
      }
    })
    .catch(() => {
      errorEl.textContent = 'Connection error. Try again.';
    });
}

function shakeCard(el) {
  if (!el) return;
  el.classList.remove('lock-shake');
  void el.offsetWidth;
  el.classList.add('lock-shake');
}

function lockScreenLogout() {
  showConfirm('Sign out of NexoraOS?', () => {
    sessionStorage.removeItem('nexora-locked');
    localStorage.removeItem('nexora-login-time');
    fetch('/NexoraOs/api/logout.php')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          document.body.style.transition = 'opacity 0.5s ease';
          document.body.style.opacity    = '0';
          setTimeout(() => {
            window.location.href = '/NexoraOs/login.html';
          }, 500);
        }
      });
  });
}


// ===========================
// NOTEPAD MENU SYSTEM
// ===========================

let notepadCurrentFileId   = null;
let notepadCurrentFileName = null;
let notepadHasUnsaved      = false;

function toggleNotepadMenu(menu) {
  const menus = ['file', 'format'];
  menus.forEach(m => {
    const dd  = document.getElementById('dropdown-' + m);
    const btn = document.getElementById('menu-' + m);
    if (m === menu) {
      const isOpen = dd.classList.contains('open');
      dd.classList.toggle('open', !isOpen);
      btn.classList.toggle('active', !isOpen);
    } else {
      dd.classList.remove('open');
      btn.classList.remove('active');
    }
  });
}

function closeAllNotepadMenus() {
  ['file','format'].forEach(m => {
    const dd  = document.getElementById('dropdown-' + m);
    const btn = document.getElementById('menu-' + m);
    if (dd)  dd.classList.remove('open');
    if (btn) btn.classList.remove('active');
  });
}



function applyNotepadFont(font) {
  closeAllNotepadMenus();
  const editor = document.getElementById('notepad-content');
  const fontEl = document.getElementById('notepad-current-font');
  if (!editor) return;

  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0 && selection.toString().length > 0) {
    const range = selection.getRangeAt(0);
    const span  = document.createElement('span');
    span.style.fontFamily = font;
    try {
      range.surroundContents(span);
    } catch {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
    }
  } else {
    editor.style.fontFamily = font;
  }

  if (fontEl) fontEl.textContent = font;
  editor.focus();
}

function notepadOpen() {
  closeAllNotepadMenus();
  if (!document.getElementById('win-myDocuments')) openWindow('myDocuments');
  else focusWindow('myDocuments');
}

function saveNotepadAs() {
  closeAllNotepadMenus();
  const name = window.prompt('Save As — enter filename:', notepadCurrentFileName || 'untitled.txt');
  if (!name || name.trim() === '') return;

  notepadCurrentFileId   = null;
  notepadCurrentFileName = name.trim();

  const fnEl = document.getElementById('notepad-filename');
  if (fnEl) {
    fnEl.value          = name.trim();
    fnEl.dataset.fileId = '';
  }

  saveNotepadFile();
}

function notepadSearch() {
  closeAllNotepadMenus();
  const bar = document.getElementById('notepad-search-bar');
  if (bar) {
    bar.style.display = 'flex';
    document.getElementById('notepad-search-input').focus();
  }
}

let notepadSearchIndex = 0;
let notepadSearchMatches = [];

function notepadFindNext() {
  const term    = document.getElementById('notepad-search-input').value.trim();
  const editor  = document.getElementById('notepad-content');
  if (!term || !editor) return;

  // Clear previous highlights
  editor.querySelectorAll('.notepad-highlight').forEach(el => {
    const parent = el.parentNode;
    parent.replaceChild(document.createTextNode(el.textContent), el);
    parent.normalize();
  });

  if (!term) return;

  // Walk text nodes and highlight matches
  const walker  = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
  const matches = [];
  let node;

  while ((node = walker.nextNode())) {
    let text  = node.nodeValue;
    let lower = text.toLowerCase();
    let search = term.toLowerCase();
    let idx   = lower.indexOf(search);

    while (idx !== -1) {
      matches.push({ node, idx, len: term.length });
      idx = lower.indexOf(search, idx + 1);
    }
  }

  if (matches.length === 0) {
    showToast('No results found for "' + term + '"', 'info');
    return;
  }

  notepadSearchMatches = matches;
  if (notepadSearchIndex >= matches.length) notepadSearchIndex = 0;

  const match = matches[notepadSearchIndex];
  const range = document.createRange();
  range.setStart(match.node, match.idx);
  range.setEnd(match.node, match.idx + match.len);

  const span = document.createElement('mark');
  span.className   = 'notepad-highlight';
  span.style.cssText = 'background:#00ffc8;color:#0a0e27;border-radius:2px;';
  range.surroundContents(span);
  span.scrollIntoView({ block: 'center' });

  notepadSearchIndex++;
  showToast(`Match ${notepadSearchIndex} of ${matches.length}`, 'info');
}

function closeNotepadSearch() {
  const bar    = document.getElementById('notepad-search-bar');
  const editor = document.getElementById('notepad-content');
  if (bar) bar.style.display = 'none';
  if (editor) {
    editor.querySelectorAll('.notepad-highlight').forEach(el => {
      const parent = el.parentNode;
      parent.replaceChild(document.createTextNode(el.textContent), el);
      parent.normalize();
    });
  }
  notepadSearchIndex   = 0;
  notepadSearchMatches = [];
}

function closeNotepadSearch() {
  const bar = document.getElementById('notepad-search-bar');
  if (bar) bar.style.display = 'none';
}

function setNotepadUnsaved() {
  notepadHasUnsaved = true;
  const dot = document.getElementById('notepad-unsaved');
  if (dot) dot.style.display = 'inline';
}

function setNotepadSaved(name) {
  notepadHasUnsaved      = false;
  notepadCurrentFileName = name;
  const dot     = document.getElementById('notepad-unsaved');
  const display = document.getElementById('notepad-filename-display');
  if (dot)     dot.style.display = 'none';
  if (display) display.textContent = name;
}

// ===========================
// NEXORA BROWSER
// ===========================

let browserTabs       = [];
let browserActiveTab  = null;
let browserTabCounter = 0;

// --- INIT ---
function browserInit() {
  browserTabs      = [];
  browserActiveTab = null;
  browserTabCounter = 0;

  // Listen for postMessage from newtab.html
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'newtab-navigate') {
      const bar = document.getElementById('browser-address-bar');
      if (bar) bar.value = e.data.url;
      browserNavigateTo(e.data.url);
    }
  });

  // Open the first tab
  browserNewTab();
}

// --- CREATE A NEW TAB ---
function browserNewTab(url) {
  const tabId = 'btab-' + (++browserTabCounter);

  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.className       = 'browser-tab-iframe';
  iframe.id              = 'iframe-' + tabId;
  iframe.referrerPolicy  = 'no-referrer';
  iframe.onload          = () => browserOnLoad(tabId);
  iframe.onerror         = () => browserOnError(tabId);

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'browser-tab-overlay';
  overlay.id        = 'overlay-' + tabId;

  // Append to stack
  const stack = document.getElementById('browser-iframe-stack');
  if (stack) {
    stack.appendChild(iframe);
    stack.appendChild(overlay);
  }

  // Tab state object
  const tab = {
    id:      tabId,
    history: [],
    index:   -1,
    title:   'New Tab',
    url:     url || '/NexoraOs/newtab.html'
  };

  browserTabs.push(tab);
  renderBrowserTabs();
  browserSwitchTab(tabId);
  browserNavigateTo(tab.url, tabId);
}

// --- SWITCH TAB ---
function browserSwitchTab(tabId) {
  browserActiveTab = tabId;

  // Toggle iframes and overlays
  browserTabs.forEach(t => {
    const iframe  = document.getElementById('iframe-'   + t.id);
    const overlay = document.getElementById('overlay-'  + t.id);
    const active  = (t.id === tabId);
    if (iframe)  iframe.classList.toggle('active',  active);
    if (overlay) overlay.classList.toggle('active', active);
  });

  // Restore address bar and nav buttons for this tab
  const tab = browserTabs.find(t => t.id === tabId);
  if (tab) {
    const bar = document.getElementById('browser-address-bar');
    if (bar) bar.value = tab.url === '/NexoraOs/newtab.html' ? '' : tab.url;
    updateBrowserNavBtns(tab);
  }

  renderBrowserTabs();
}

// --- CLOSE A TAB ---
function browserCloseTab(tabId) {
  const idx    = browserTabs.findIndex(t => t.id === tabId);
  if (idx === -1) return;

  // Remove iframe and overlay from DOM
  const iframe  = document.getElementById('iframe-'  + tabId);
  const overlay = document.getElementById('overlay-' + tabId);
  if (iframe)  iframe.remove();
  if (overlay) overlay.remove();

  // Remove from array
  browserTabs.splice(idx, 1);

  // If no tabs left, close the browser window
  if (browserTabs.length === 0) {
    closeWindow('nexoraBrowser');
    return;
  }

  // Switch to adjacent tab
  const newIdx = Math.min(idx, browserTabs.length - 1);
  browserSwitchTab(browserTabs[newIdx].id);
  renderBrowserTabs();
}

// --- RENDER TAB BAR ---
function renderBrowserTabs() {
  const bar = document.getElementById('browser-tab-bar');
  if (!bar) return;

  // Remove existing tab elements (not the + button)
  bar.querySelectorAll('.browser-tab').forEach(el => el.remove());

  const newTabBtn = document.getElementById('browser-new-tab-btn');

  browserTabs.forEach(tab => {
    const el = document.createElement('div');
    el.className = 'browser-tab' + (tab.id === browserActiveTab ? ' active' : '');
    el.id        = 'tab-el-' + tab.id;
    el.title     = tab.title;

    el.innerHTML = `
      <i data-lucide="globe" class="browser-tab-favicon"></i>
      <span class="browser-tab-title">${tab.title}</span>
      <button class="browser-tab-close" title="Close tab">✕</button>
    `;

    // Click tab to switch
    el.addEventListener('click', (e) => {
      if (e.target.classList.contains('browser-tab-close')) return;
      browserSwitchTab(tab.id);
    });

    // Click × to close
    el.querySelector('.browser-tab-close').addEventListener('click', (e) => {
      e.stopPropagation();
      browserCloseTab(tab.id);
    });

    // Insert before the + button
    bar.insertBefore(el, newTabBtn);
  });

  lucide.createIcons();
}

// --- NAVIGATE ---
function browserNavigateTo(url, tabId) {
  tabId = tabId || browserActiveTab;
  const tab    = browserTabs.find(t => t.id === tabId);
  const iframe = document.getElementById('iframe-' + tabId);
  if (!tab || !iframe) return;

  const resolved = resolveUrl(url);
  if (!resolved) return;

  // Update tab state
  if (tab.index < tab.history.length - 1) {
    tab.history = tab.history.slice(0, tab.index + 1);
  }
  tab.history.push(resolved);
  tab.index = tab.history.length - 1;
  tab.url   = resolved;

  // Update address bar only if this is the active tab
  if (tabId === browserActiveTab) {
    const bar = document.getElementById('browser-address-bar');
    if (bar) bar.value = resolved === '/NexoraOs/newtab.html' ? '' : resolved;
    updateBrowserNavBtns(tab);
    setBrowserStatus('Loading...');
  }

  iframe.src = resolved;
}

// --- URL RESOLVER ---
function resolveUrl(input) {
  input = input.trim();
  if (!input) return null;
  if (input.startsWith('/')) return input;
  try {
    const u = new URL(input.startsWith('http') ? input : 'https://' + input);
    if (u.hostname.includes('.')) return u.href;
    throw new Error();
  } catch {
    return 'https://www.bing.com/search?q=' + encodeURIComponent(input);
  }
}

// --- GO BUTTON / ENTER ---
function browserGo() {
  const bar = document.getElementById('browser-address-bar');
  if (!bar) return;
  const val = bar.value.trim();
  if (!val) return;
  browserNavigateTo(val);
}

function handleBrowserAddress(e) {
  if (e.key === 'Enter') browserGo();
}

// --- BACK / FORWARD / REFRESH ---
function browserBack() {
  const tab    = browserTabs.find(t => t.id === browserActiveTab);
  const iframe = document.getElementById('iframe-' + browserActiveTab);
  if (!tab || tab.index <= 0) return;
  tab.index--;
  const url = tab.history[tab.index];
  tab.url   = url;
  if (iframe) iframe.src = url;
  const bar = document.getElementById('browser-address-bar');
  if (bar) bar.value = url === '/NexoraOs/newtab.html' ? '' : url;
  updateBrowserNavBtns(tab);
  setBrowserStatus('Loading...');
}

function browserForward() {
  const tab    = browserTabs.find(t => t.id === browserActiveTab);
  const iframe = document.getElementById('iframe-' + browserActiveTab);
  if (!tab || tab.index >= tab.history.length - 1) return;
  tab.index++;
  const url = tab.history[tab.index];
  tab.url   = url;
  if (iframe) iframe.src = url;
  const bar = document.getElementById('browser-address-bar');
  if (bar) bar.value = url === '/NexoraOs/newtab.html' ? '' : url;
  updateBrowserNavBtns(tab);
  setBrowserStatus('Loading...');
}

function browserRefresh() {
  const iframe = document.getElementById('iframe-' + browserActiveTab);
  if (!iframe) return;
  setBrowserStatus('Refreshing...');
  iframe.src = iframe.src;
}

// --- LOAD HANDLERS ---
function browserOnLoad(tabId) {
  tabId = tabId || browserActiveTab;
  const tab     = browserTabs.find(t => t.id === tabId);
  const iframe  = document.getElementById('iframe-'  + tabId);
  const overlay = document.getElementById('overlay-' + tabId);
  if (!iframe || !tab) return;

  const src = iframe.src;
  if (!src || src === 'about:blank') {
    if (tabId === browserActiveTab) setBrowserStatus('Ready');
    return;
  }

  // Try reading content — cross-origin will throw, that's fine (it loaded)
  try {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    if (!doc || doc.body === null || doc.body.innerHTML === '') {
      showBrowserBlocked(src, tabId);
      return;
    }
    // Try to get page title
    const pageTitle = doc.title || extractDomain(src);
    updateTabTitle(tabId, pageTitle);
  } catch {
    // Cross-origin loaded successfully
    updateTabTitle(tabId, extractDomain(src));
  }

  if (overlay) {
    overlay.style.display = 'none';
    overlay.innerHTML     = '';
  }
  if (tabId === browserActiveTab) setBrowserStatus('Done');
  if (tab) updateBrowserNavBtns(tab);
}

function browserOnError(tabId) {
  tabId     = tabId || browserActiveTab;
  const iframe = document.getElementById('iframe-' + tabId);
  const src    = iframe ? iframe.src : '';
  showBrowserOffline(src, tabId);
}

// --- OVERLAY MESSAGES ---
function showBrowserBlocked(url, tabId) {
  tabId = tabId || browserActiveTab;
  const overlay = document.getElementById('overlay-' + tabId);
  if (!overlay) return;
  overlay.style.display = 'flex';
  overlay.innerHTML = `
    <div class="browser-message-box">
      <i data-lucide="shield-off" class="browser-msg-icon"></i>
      <div class="browser-msg-title">Site Blocked Embedding</div>
      <div class="browser-msg-desc">
        <strong>${url}</strong> has restricted iframe embedding.<br/>
        This is a browser security policy — not a NexoraBrowser bug.
      </div>
      <button class="toolbar-btn" onclick="window.open('${url}', '_blank')">
        <i data-lucide="external-link"></i> Open in New Tab
      </button>
    </div>
  `;
  lucide.createIcons();
  if (tabId === browserActiveTab) setBrowserStatus('Blocked — site disallows embedding');
  updateTabTitle(tabId, extractDomain(url));
}

function showBrowserOffline(url, tabId) {
  tabId = tabId || browserActiveTab;
  const overlay = document.getElementById('overlay-' + tabId);
  if (!overlay) return;
  overlay.style.display = 'flex';
  overlay.innerHTML = `
    <div class="browser-message-box">
      <i data-lucide="wifi-off" class="browser-msg-icon"></i>
      <div class="browser-msg-title">Cannot Reach Site</div>
      <div class="browser-msg-desc">
        NexoraBrowser could not load <strong>${url}</strong>.<br/>
        Check your internet connection and try again.
      </div>
      <button class="toolbar-btn" onclick="browserRefresh()">
        <i data-lucide="refresh-cw"></i> Try Again
      </button>
    </div>
  `;
  lucide.createIcons();
  if (tabId === browserActiveTab) setBrowserStatus('Offline or unreachable');
}

// --- HELPERS ---
function setBrowserStatus(msg) {
  const el = document.getElementById('browser-status-text');
  if (el) el.textContent = msg;
}

function updateBrowserNavBtns(tab) {
  const back    = document.getElementById('browser-back-btn');
  const forward = document.getElementById('browser-forward-btn');
  if (!tab) {
    if (back)    back.disabled    = true;
    if (forward) forward.disabled = true;
    return;
  }
  if (back)    back.disabled    = (tab.index <= 0);
  if (forward) forward.disabled = (tab.index >= tab.history.length - 1);
}

function updateTabTitle(tabId, title) {
  const tab = browserTabs.find(t => t.id === tabId);
  if (!tab) return;
  const short = title.length > 20 ? title.slice(0, 18) + '…' : title;
  tab.title = short || 'New Tab';
  const el  = document.querySelector('#tab-el-' + tabId + ' .browser-tab-title');
  if (el) el.textContent = tab.title;
  const tabEl = document.getElementById('tab-el-' + tabId);
  if (tabEl) tabEl.title = title;
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'New Tab';
  }
}

// ===========================
// WALLPAPER BROWSER
// ===========================

// *** PASTE YOUR UNSPLASH ACCESS KEY BELOW ***
const UNSPLASH_ACCESS_KEY = '_3TOcNmuuCoT-vvGWV-QSGVu3mzi-USXkeSo9-JyeHg';

let wpCurrentFull  = null;
let wpCurrentThumb = null;
let wpPage         = 1;
let wpCurrentQuery = '';

function handleWpSearch(e) {
  if (e.key === 'Enter') doWpSearch();
}

function doWpSearch() {
  const input = document.getElementById('wp-search-input');
  if (!input) return;
  const query = input.value.trim();
  if (!query) {
    showToast('Enter a search keyword first.', 'warning');
    return;
  }
  wpCurrentQuery = query;
  wpPage         = 1;
  fetchWallpapers(query, wpPage);
}

function loadWpRandom() {
  const keywords = ['cyberpunk', 'space', 'nature', 'city', 'abstract', 'ocean', 'mountains', 'galaxy'];
  const random   = keywords[Math.floor(Math.random() * keywords.length)];
  wpCurrentQuery = random;
  wpPage         = 1;
  const input    = document.getElementById('wp-search-input');
  if (input) input.value = random;
  fetchWallpapers(random, wpPage);
}

function fetchWallpapers(query, page) {
  setWpStatus('Searching for "' + query + '"...');
  clearWpGallery();
  hideWpPreview();

  const url = 'https://api.unsplash.com/search/photos' +
              '?query=' + encodeURIComponent(query) +
              '&page=' + page +
              '&per_page=16' +
              '&orientation=landscape' +
              '&client_id=' + "_3TOcNmuuCoT-vvGWV-QSGVu3mzi-USXkeSo9-JyeHg";

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data.results || data.results.length === 0) {
        setWpStatus('No wallpapers found for "' + query + '". Try a different keyword.');
        return;
      }
      setWpStatus(data.total + ' wallpapers found for "' + query + '" — click any to preview.');
      renderWpGallery(data.results);
    })
    .catch(() => {
      setWpStatus('Failed to load wallpapers. Check your internet connection.');
      showToast('Unsplash API error. Check your connection.', 'error');
    });
}

function renderWpGallery(photos) {
  const grid = document.getElementById('wp-gallery-grid');
  if (!grid) return;

  grid.innerHTML = '';

  photos.forEach(photo => {
    const thumb = photo.urls.small;
    const full  = photo.urls.full;
    const name  = photo.user.name;
    const link  = photo.user.links.html;

    const card  = document.createElement('div');
    card.className = 'wp-card';
    card.innerHTML = `
      <img src="${thumb}" alt="Wallpaper by ${name}" loading="lazy"/>
      <div class="wp-card-overlay">
        <span class="wp-card-author">📷 ${name}</span>
      </div>
    `;

    card.onclick = () => selectWpCard(card, full, thumb, name, link);
    grid.appendChild(card);
  });
}

function selectWpCard(card, full, thumb, name, link) {
  // Deselect all
  document.querySelectorAll('.wp-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');

  wpCurrentFull  = full;
  wpCurrentThumb = thumb;

  // Show preview bar
  const bar     = document.getElementById('wp-preview-bar');
  const img     = document.getElementById('wp-preview-img');
  const credit  = document.getElementById('wp-preview-credit');

  if (bar)    bar.style.display    = 'flex';
  if (img)    img.src              = thumb;
  if (credit) credit.innerHTML     = `Photo by <a href="${link}?utm_source=NexoraOS&utm_medium=referral" target="_blank">${name}</a> on <a href="https://unsplash.com?utm_source=NexoraOS&utm_medium=referral" target="_blank">Unsplash</a>`;

  lucide.createIcons();
}

function applyUnsplashWallpaper() {
  if (!wpCurrentFull) return;

  setWpStatus('Applying wallpaper...');

  // Download image as blob then upload to server
  fetch(wpCurrentFull)
    .then(res => res.blob())
    .then(blob => {
      const ext      = 'jpg';
      const filename = 'unsplash_wallpaper.' + ext;
      const file     = new File([blob], filename, { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('wallpaper', file);

      return fetch('/NexoraOs/api/save_wallpaper.php', {
        method: 'POST',
        body:   formData
      });
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById('desktop').style.background =
          `url('${data.path}') center/cover no-repeat`;
        localStorage.setItem('nexora-wallpaper', data.path);
        showToast('Wallpaper applied to desktop!', 'success');
        setWpStatus('Wallpaper applied successfully.');
      } else {
        showToast('Error applying wallpaper: ' + (data.error || 'Unknown'), 'error');
        setWpStatus('Failed to apply wallpaper.');
      }
    })
    .catch(() => {
      showToast('Failed to download wallpaper. Check your connection.', 'error');
      setWpStatus('Download failed.');
    });
}

function setWpStatus(msg) {
  const el = document.getElementById('wp-status-text');
  if (el) el.textContent = msg;
}

function clearWpGallery() {
  const grid = document.getElementById('wp-gallery-grid');
  if (grid) grid.innerHTML = '';
}

function hideWpPreview() {
  const bar = document.getElementById('wp-preview-bar');
  if (bar) bar.style.display = 'none';
  wpCurrentFull  = null;
  wpCurrentThumb = null;
}


// ===========================
// DICTIONARY APP
// ===========================

function handleDictSearch(e) {
  if (e.key === 'Enter') doWordSearch();
}

function doWordSearch() {
  const input = document.getElementById('dict-input');
  if (!input) return;
  const word = input.value.trim().toLowerCase();
  if (!word) {
    setDictStatus('Please enter a word to search.');
    return;
  }
  setDictStatus('Looking up "' + word + '"...');

  fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word))
    .then(res => {
      if (!res.ok) throw new Error('not_found');
      return res.json();
    })
    .then(data => {
      setDictStatus('Showing results for "' + word + '"');
      renderDictResult(data);
    })
    .catch(err => {
      if (err.message === 'not_found') {
        showDictError('not_found', word);
      } else {
        showDictOffline();
      }
    });
}

function renderDictResult(data) {
  const container = document.getElementById('dict-result-container');
  if (!container) return;

  const entry    = data[0];
  const word     = entry.word;
  const phonetic = entry.phonetics?.find(p => p.text)?.text || '';
  const audioUrl = entry.phonetics?.find(p => p.audio)?.audio || '';

  let html = `
    <div class="dict-word-header">
      <div>
        <div class="dict-word">${word}</div>
        ${phonetic ? `<div class="dict-phonetic">${phonetic}</div>` : ''}
      </div>
      ${audioUrl ? `
        <button class="dict-audio-btn" onclick="playDictAudio('${audioUrl}')" title="Hear pronunciation">
          <i data-lucide="volume-2"></i>
        </button>` : ''}
    </div>
    <div class="dict-divider"></div>
  `;

  entry.meanings.forEach(meaning => {
    const synonyms = meaning.synonyms?.slice(0, 6) || [];

    html += `
      <div class="dict-meaning-block">
        <div class="dict-part-of-speech">${meaning.partOfSpeech}</div>
    `;

    meaning.definitions.slice(0, 4).forEach((def, i) => {
      html += `
        <div class="dict-definition-item">
          <span class="dict-def-num">${i + 1}.</span>
          <div>
            <div>${def.definition}</div>
            ${def.example ? `<div class="dict-example">"${def.example}"</div>` : ''}
          </div>
        </div>
      `;
    });

    if (synonyms.length > 0) {
      html += `<div class="dict-synonyms">`;
      synonyms.forEach(syn => {
        html += `<span class="dict-synonym-tag" onclick="searchSynonym('${syn}')">${syn}</span>`;
      });
      html += `</div>`;
    }

    html += `</div><div class="dict-divider"></div>`;
  });

  container.innerHTML = html;
  lucide.createIcons();
}

function searchSynonym(word) {
  const input = document.getElementById('dict-input');
  if (input) input.value = word;
  doWordSearch();
}

function playDictAudio(url) {
  if (!url) return;
  const audio = new Audio(url);
  audio.play().catch(() => showToast('Could not play audio.', 'warning'));
}

function showDictError(type, word) {
  const container = document.getElementById('dict-result-container');
  if (!container) return;
  container.innerHTML = `
    <div class="dict-offline-box">
      <i data-lucide="search-x"></i>
      <div class="dict-offline-title">Word Not Found</div>
      <div class="dict-offline-desc">
        No definition found for "<strong style="color:#d0d8ff;">${word}</strong>".<br/>
        Check the spelling and try again.
      </div>
    </div>
  `;
  lucide.createIcons();
  setDictStatus('No results for "' + word + '"');
}

function showDictOffline() {
  const container = document.getElementById('dict-result-container');
  if (!container) return;
  container.innerHTML = `
    <div class="dict-offline-box">
      <i data-lucide="wifi-off"></i>
      <div class="dict-offline-title">You Are Offline</div>
      <div class="dict-offline-desc">
        NexoraDictionary requires an internet connection.<br/>
        Please check your connection and try again.
      </div>
    </div>
  `;
  lucide.createIcons();
  setDictStatus('Offline — cannot reach Dictionary API');
}

function setDictStatus(msg) {
  const el = document.getElementById('dict-status');
  if (el) el.textContent = msg;
}


// ===========================
// DICTIONARY SUGGESTIONS
// ===========================

let dictSuggestTimeout  = null;
let dictSuggestIndex    = -1;
let dictSuggestItems    = [];

function handleDictSuggest(e) {
  const val = e.target.value.trim();

  // Clear previous timer
  clearTimeout(dictSuggestTimeout);
  dictSuggestIndex = -1;

  if (val.length < 2) {
    closeDictSuggestions();
    return;
  }

  // Debounce — wait 250ms after user stops typing
  dictSuggestTimeout = setTimeout(() => {
    fetchDictSuggestions(val);
  }, 250);
}

function fetchDictSuggestions(query) {
  fetch('https://api.datamuse.com/sug?s=' + encodeURIComponent(query) + '&max=8')
    .then(res => res.json())
    .then(data => {
      if (!data || data.length === 0) {
        closeDictSuggestions();
        return;
      }
      renderDictSuggestions(data.map(item => item.word));
    })
    .catch(() => {
      // Silently fail — suggestions are a bonus feature
      closeDictSuggestions();
    });
}

function renderDictSuggestions(words) {
  const box = document.getElementById('dict-suggestions');
  if (!box) return;

  dictSuggestItems = words;

  box.innerHTML = words.map((word, i) => `
    <div class="dict-suggestion-item"
      id="dict-sug-${i}"
      onmousedown="selectDictSuggestion('${word}')"
      onmouseover="highlightDictSuggestion(${i})">
      <i data-lucide="corner-down-right"></i>
      <span>${word}</span>
    </div>
  `).join('');

  box.classList.add('open');
  lucide.createIcons();
}

function selectDictSuggestion(word) {
  const input = document.getElementById('dict-input');
  if (input) input.value = word;
  closeDictSuggestions();
  doWordSearch();
}

function highlightDictSuggestion(index) {
  dictSuggestIndex = index;
  document.querySelectorAll('.dict-suggestion-item').forEach((el, i) => {
    el.classList.toggle('highlighted', i === index);
  });
}

function closeDictSuggestions() {
  const box = document.getElementById('dict-suggestions');
  if (box) {
    box.classList.remove('open');
    box.innerHTML = '';
  }
  dictSuggestIndex = -1;
  dictSuggestItems = [];
}

// Update handleDictSearch to support arrow key navigation
function handleDictSearch(e) {
  const items = document.querySelectorAll('.dict-suggestion-item');

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    dictSuggestIndex = Math.min(dictSuggestIndex + 1, items.length - 1);
    items.forEach((el, i) => el.classList.toggle('highlighted', i === dictSuggestIndex));
    return;
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    dictSuggestIndex = Math.max(dictSuggestIndex - 1, 0);
    items.forEach((el, i) => el.classList.toggle('highlighted', i === dictSuggestIndex));
    return;
  }

  if (e.key === 'Escape') {
    closeDictSuggestions();
    return;
  }

  if (e.key === 'Enter') {
    if (dictSuggestIndex >= 0 && dictSuggestItems[dictSuggestIndex]) {
      selectDictSuggestion(dictSuggestItems[dictSuggestIndex]);
    } else {
      closeDictSuggestions();
      doWordSearch();
    }
  }
}

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('#dict-input-wrap')) {
    closeDictSuggestions();
  }
});


// ===========================
// CURRENCY CONVERTER
// ===========================

const EXCHANGE_API_KEY = 'e449cf9d07d47536a4292577';
let currencyRates = {};
let currencyList  = [];

const POPULAR_CURRENCIES = [
  'USD','EUR','GBP','JPY','CAD','AUD','CHF','CNY','INR','PHP',
  'SGD','HKD','KRW','MXN','BRL','ZAR','AED','SAR','NOK','SEK'
];

function initCurrency() {
  setBrowserStatus('');
  const body    = document.getElementById('currency-body');
  const offline = document.getElementById('currency-offline');

  fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/USD`)
    .then(res => res.json())
    .then(data => {
      if (data.result !== 'success') throw new Error('api_error');

      currencyRates = data.conversion_rates;
      currencyList  = Object.keys(currencyRates).sort();

      populateCurrencyDropdowns();

      if (body)    body.style.display    = 'flex';
      if (offline) offline.style.display = 'none';

      // Set defaults
      document.getElementById('currency-from').value = 'USD';
      document.getElementById('currency-to').value   = 'PHP';

      // Update timestamp
      const updated = new Date(data.time_last_update_utc);
      const el      = document.getElementById('currency-updated-text');
      if (el) el.textContent = 'Rates updated: ' + updated.toLocaleString();

      doConvert();
    })
    .catch(() => {
      if (body)    body.style.display    = 'none';
      if (offline) offline.style.display = 'flex';
      lucide.createIcons();
    });
}

function populateCurrencyDropdowns() {
  const fromEl = document.getElementById('currency-from');
  const toEl   = document.getElementById('currency-to');
  if (!fromEl || !toEl) return;

  // Popular first, then rest
  const popular = POPULAR_CURRENCIES.filter(c => currencyList.includes(c));
  const rest    = currencyList.filter(c => !POPULAR_CURRENCIES.includes(c));
  const ordered = [...popular, ...rest];

  const options = ordered.map(code =>
    `<option value="${code}">${code}</option>`
  ).join('');

  fromEl.innerHTML = options;
  toEl.innerHTML   = options;
}

function doConvert() {
  const fromEl   = document.getElementById('currency-from');
  const toEl     = document.getElementById('currency-to');
  const amountEl = document.getElementById('currency-amount');
  const resultEl = document.getElementById('currency-result');
  const rateEl   = document.getElementById('currency-rate-text');

  if (!fromEl || !toEl || !amountEl || !resultEl) return;

  const from   = fromEl.value;
  const to     = toEl.value;
  const amount = parseFloat(amountEl.value);

  if (!from || !to || isNaN(amount) || amount < 0) {
    resultEl.textContent = '—';
    return;
  }

  if (!currencyRates[from] || !currencyRates[to]) return;

  // Convert via USD as base
  const inUSD  = amount / currencyRates[from];
  const result = inUSD * currencyRates[to];

  // Format result
  resultEl.textContent = result >= 0.01
    ? result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
    : result.toFixed(6);

  // Rate display
  const oneUnit = (1 / currencyRates[from]) * currencyRates[to];
  rateEl.textContent = `1 ${from} = ${oneUnit.toLocaleString('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6
  })} ${to}`;
}

function swapCurrencies() {
  const fromEl = document.getElementById('currency-from');
  const toEl   = document.getElementById('currency-to');
  if (!fromEl || !toEl) return;
  const temp     = fromEl.value;
  fromEl.value   = toEl.value;
  toEl.value     = temp;
  doConvert();
}


// ===========================
// WEATHER APP
// ===========================

const WEATHER_API_KEY = '6e6a250d45c561a960759ef95f74f152';

const WEATHER_DEFAULT_CITIES = [
  'Cebu',
  'Tokyo',
  'New York',
  'London',
  'Dubai'
];

// --- SUGGESTIONS ---
let weatherSuggestTimeout = null;
let weatherSuggestIndex   = -1;
let weatherSuggestItems   = [];

function handleWeatherSuggest(e) {
  const val = e.target.value.trim();
  clearTimeout(weatherSuggestTimeout);
  weatherSuggestIndex = -1;

  if (val.length < 2) {
    closeWeatherSuggestions();
    return;
  }

  weatherSuggestTimeout = setTimeout(() => {
    fetchWeatherSuggestions(val);
  }, 300);
}

function fetchWeatherSuggestions(query) {
  fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=6&appid=${WEATHER_API_KEY}`)
    .then(res => res.json())
    .then(data => {
      if (!data || data.length === 0) {
        closeWeatherSuggestions();
        return;
      }
      // Deduplicate by city+country
      const seen = new Set();
      const unique = data.filter(item => {
        const key = item.name + item.country;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      renderWeatherSuggestions(unique);
    })
    .catch(() => closeWeatherSuggestions());
}

function renderWeatherSuggestions(items) {
  const box = document.getElementById('weather-suggestions');
  if (!box) return;

  weatherSuggestItems = items;

  box.innerHTML = items.map((item, i) => `
    <div class="weather-suggestion-item"
      id="weather-sug-${i}"
      onmousedown="selectWeatherSuggestion(${i})"
      onmouseover="highlightWeatherSuggestion(${i})">
      <i data-lucide="map-pin"></i>
      <span>${item.name}${item.state ? ', ' + item.state : ''}</span>
      <span class="weather-sug-country">${item.country}</span>
    </div>
  `).join('');

  box.classList.add('open');
  lucide.createIcons();
}

function selectWeatherSuggestion(index) {
  const item  = weatherSuggestItems[index];
  if (!item) return;
  const input = document.getElementById('weather-input');
  if (input)  input.value = item.name;
  closeWeatherSuggestions();
  doWeatherSearch();
}

function highlightWeatherSuggestion(index) {
  weatherSuggestIndex = index;
  document.querySelectorAll('.weather-suggestion-item').forEach((el, i) => {
    el.classList.toggle('highlighted', i === index);
  });
}

function closeWeatherSuggestions() {
  const box = document.getElementById('weather-suggestions');
  if (box) {
    box.classList.remove('open');
    box.innerHTML = '';
  }
  weatherSuggestIndex = -1;
  weatherSuggestItems = [];
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('#weather-input-wrap')) {
    closeWeatherSuggestions();
  }
});

// --- SEARCH ---
function handleWeatherSearch(e) {
  const items = document.querySelectorAll('.weather-suggestion-item');

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    weatherSuggestIndex = Math.min(weatherSuggestIndex + 1, items.length - 1);
    items.forEach((el, i) => el.classList.toggle('highlighted', i === weatherSuggestIndex));
    return;
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    weatherSuggestIndex = Math.max(weatherSuggestIndex - 1, 0);
    items.forEach((el, i) => el.classList.toggle('highlighted', i === weatherSuggestIndex));
    return;
  }

  if (e.key === 'Escape') {
    closeWeatherSuggestions();
    return;
  }

  if (e.key === 'Enter') {
    if (weatherSuggestIndex >= 0 && weatherSuggestItems[weatherSuggestIndex]) {
      selectWeatherSuggestion(weatherSuggestIndex);
    } else {
      closeWeatherSuggestions();
      doWeatherSearch();
    }
  }
}

function doWeatherSearch() {
  const input = document.getElementById('weather-input');
  if (!input) return;
  const city = input.value.trim();
  if (!city) {
    setWeatherStatus('Please enter a city name.');
    return;
  }
  setWeatherStatus('Fetching weather for "' + city + '"...');
  fetchWeatherByCity(city, true);
}

// --- FETCH ---
function fetchWeatherByCity(city, fullView = false, cardId = null) {
  return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`)
    .then(res => {
      if (res.status === 401) throw new Error('unauthorized');
      if (res.status === 404) throw new Error('not_found');
      if (!res.ok)            throw new Error('api_error');
      return res.json();
    })
    .then(data => {
      if (fullView) {
        setWeatherStatus('Showing weather for ' + data.name + ', ' + data.sys.country);
        renderWeather(data);
      }
      return data;
    })
    .catch(err => {
      if (fullView) {
        if (err.message === 'not_found') {
          showWeatherError(city);
        } else if (err.message === 'unauthorized') {
          showWeatherOffline('API key activating — please wait up to 2 hours after signup.');
        } else {
          showWeatherOffline();
        }
      }
      return null;
    });
}

// --- DEFAULT GRID ---
function loadDefaultWeatherGrid() {
  const grid = document.getElementById('weather-default-grid');
  if (!grid) return;

  // Render skeleton cards first
  grid.innerHTML = WEATHER_DEFAULT_CITIES.map((city, i) => `
    <div class="weather-default-card loading" id="wdc-${i}">
      <div class="wdc-top">
        <div>
          <div class="wdc-city">${city}</div>
          <div class="wdc-country">Loading...</div>
        </div>
        <div class="wdc-emoji">⏳</div>
      </div>
      <div class="wdc-temp">--°C</div>
      <div class="wdc-desc">Fetching...</div>
    </div>
  `).join('');

  // Fetch each city
  WEATHER_DEFAULT_CITIES.forEach((city, i) => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`)
      .then(res => {
        if (!res.ok) throw new Error('failed');
        return res.json();
      })
      .then(data => {
        const card = document.getElementById('wdc-' + i);
        if (!card) return;

        const temp    = Math.round(data.main.temp);
        const desc    = data.weather[0].description;
        const emoji   = getWeatherEmoji(data.weather[0].id, data.weather[0].icon);
        const humidity = data.main.humidity;
        const wind    = (data.wind.speed * 3.6).toFixed(1);
        const country = data.sys.country;

        card.classList.remove('loading');
        card.innerHTML = `
          <div class="wdc-top">
            <div>
              <div class="wdc-city">${data.name}</div>
              <div class="wdc-country">${country}</div>
            </div>
            <div class="wdc-emoji">${emoji}</div>
          </div>
          <div class="wdc-temp">${temp}°C</div>
          <div class="wdc-desc">${desc}</div>
          <div class="wdc-details">
            <span class="wdc-detail">💧 ${humidity}%</span>
            <span class="wdc-detail">💨 ${wind} km/h</span>
          </div>
        `;

        // Click card to expand full view
        card.onclick = () => {
          const input = document.getElementById('weather-input');
          if (input) input.value = data.name;
          setWeatherStatus('Showing weather for ' + data.name + ', ' + country);
          renderWeather(data);
        };
      })
      .catch(() => {
        const card = document.getElementById('wdc-' + i);
        if (!card) return;
        card.classList.remove('loading');
        card.classList.add('error');
        card.innerHTML = `
          <div class="wdc-top">
            <div>
              <div class="wdc-city">${city}</div>
              <div class="wdc-country">Unavailable</div>
            </div>
            <div class="wdc-emoji">❌</div>
          </div>
          <div class="wdc-error-text">Could not load weather.</div>
        `;
      });
  });
}

// --- FULL WEATHER RENDER ---
function renderWeather(data) {
  const container = document.getElementById('weather-result');
  if (!container) return;

  const temp       = Math.round(data.main.temp);
  const feels      = Math.round(data.main.feels_like);
  const tempMin    = Math.round(data.main.temp_min);
  const tempMax    = Math.round(data.main.temp_max);
  const humidity   = data.main.humidity;
  const windSpeed  = (data.wind.speed * 3.6).toFixed(1);
  const windDir    = getWindDirection(data.wind.deg);
  const visibility = data.visibility ? (data.visibility / 1000).toFixed(1) + ' km' : 'N/A';
  const pressure   = data.main.pressure;
  const desc       = data.weather[0].description;
  const iconCode   = data.weather[0].icon;
  const iconEmoji  = getWeatherEmoji(data.weather[0].id, iconCode);
  const sunrise    = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunset     = new Date(data.sys.sunset  * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const localTime  = new Date((data.dt + data.timezone) * 1000).toUTCString().slice(-12, -4);

  container.innerHTML = `
    <div class="weather-main-card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div class="weather-city-name">${data.name}</div>
        <button class="toolbar-btn" onclick="showWeatherDefaultGrid()" style="font-size:11px; padding:4px 10px;">
          <i data-lucide="arrow-left"></i> Back
        </button>
      </div>
      <div class="weather-country">${data.sys.country} · Local time ${localTime}</div>
      <div class="weather-temp-row">
        <div>
          <div class="weather-temp">${temp}<span class="weather-temp-unit">°C</span></div>
          <div class="weather-desc">${desc}</div>
          <div class="weather-feels">Feels like ${feels}°C · ${tempMin}° / ${tempMax}°</div>
        </div>
        <div class="weather-icon-wrap">${iconEmoji}</div>
      </div>
    </div>

    <div class="weather-stats-grid">
      <div class="weather-stat-card">
        <div class="weather-stat-label">
          <i data-lucide="droplets"></i> Humidity
        </div>
        <div class="weather-stat-value">${humidity}%</div>
        <div class="weather-stat-sub">${humidity > 70 ? 'High' : humidity > 40 ? 'Moderate' : 'Low'}</div>
      </div>
      <div class="weather-stat-card">
        <div class="weather-stat-label">
          <i data-lucide="wind"></i> Wind
        </div>
        <div class="weather-stat-value">${windSpeed} km/h</div>
        <div class="weather-stat-sub">${windDir}</div>
      </div>
      <div class="weather-stat-card">
        <div class="weather-stat-label">
          <i data-lucide="eye"></i> Visibility
        </div>
        <div class="weather-stat-value">${visibility}</div>
        <div class="weather-stat-sub">${parseFloat(visibility) > 5 ? 'Clear' : 'Limited'}</div>
      </div>
      <div class="weather-stat-card">
        <div class="weather-stat-label">
          <i data-lucide="gauge"></i> Pressure
        </div>
        <div class="weather-stat-value">${pressure}</div>
        <div class="weather-stat-sub">hPa</div>
      </div>
    </div>

    <div class="weather-sun-row">
      <div class="weather-sun-item">
        <div class="weather-sun-label">🌅 Sunrise</div>
        <div class="weather-sun-value">${sunrise}</div>
      </div>
      <div class="weather-sun-item">
        <div class="weather-sun-label">🌇 Sunset</div>
        <div class="weather-sun-value">${sunset}</div>
      </div>
    </div>
  `;

  lucide.createIcons();
}

// --- BACK TO DEFAULT GRID ---
function showWeatherDefaultGrid() {
  const container = document.getElementById('weather-result');
  if (!container) return;
  const input = document.getElementById('weather-input');
  if (input) input.value = '';
  setWeatherStatus('Live weather data powered by OpenWeatherMap.');
  container.innerHTML = '<div id="weather-default-grid"></div>';
  loadDefaultWeatherGrid();
}

// --- HELPERS ---
function getWeatherEmoji(id, icon) {
  const isNight = icon && icon.endsWith('n');
  if (id >= 200 && id < 300) return '⛈️';
  if (id >= 300 && id < 400) return '🌦️';
  if (id >= 500 && id < 600) return id >= 511 ? '🌨️' : '🌧️';
  if (id >= 600 && id < 700) return '❄️';
  if (id >= 700 && id < 800) return '🌫️';
  if (id === 800)             return isNight ? '🌙' : '☀️';
  if (id === 801)             return isNight ? '🌤️' : '🌤️';
  if (id >= 802 && id < 900) return '☁️';
  return '🌡️';
}

function getWindDirection(deg) {
  if (deg === undefined) return 'N/A';
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function showWeatherError(city) {
  const container = document.getElementById('weather-result');
  if (!container) return;
  container.innerHTML = `
    <div class="weather-offline-box">
      <i data-lucide="map-pin-off"></i>
      <div class="weather-offline-title">City Not Found</div>
      <div class="weather-offline-desc">
        No weather data found for "<strong style="color:#d0d8ff;">${city}</strong>".<br/>
        Check the spelling and try again.
      </div>
      <button class="toolbar-btn" onclick="showWeatherDefaultGrid()">
        <i data-lucide="arrow-left"></i> Back
      </button>
    </div>
  `;
  lucide.createIcons();
}

function showWeatherOffline(msg) {
  const container = document.getElementById('weather-result');
  if (!container) return;
  container.innerHTML = `
    <div class="weather-offline-box">
      <i data-lucide="wifi-off"></i>
      <div class="weather-offline-title">You Are Offline</div>
      <div class="weather-offline-desc">
        ${msg || 'NexoraWeather requires an internet connection.<br/>Please check your connection and try again.'}
      </div>
      <button class="toolbar-btn" onclick="showWeatherDefaultGrid()">
        <i data-lucide="refresh-cw"></i> Retry
      </button>
    </div>
  `;
  lucide.createIcons();
  setWeatherStatus('Offline — cannot reach Weather API');
}

function setWeatherStatus(msg) {
  const el = document.getElementById('weather-status');
  if (el) el.textContent = msg;
}



// ===========================
// NEXORA NEWS
// ===========================

const NEWSDATA_API_KEY    = 'pub_d936a625727b407590b4acc8160178e6';
let newsPage              = 1;
let newsNextPage          = null;
let newsLoading           = false;
let newsTickerInterval    = null;
let newsTickerDismissed   = false;

// --- LOAD NEWS ---
function loadNews(category, btnEl) {
  newsPage     = 1;
  newsNextPage = null;
  newsLoading  = false;

  const container = document.getElementById('news-list-container');
  if (container) {
    container.innerHTML = `
      <div id="news-placeholder">
        <i data-lucide="loader-2"></i>
        <p>Loading headlines...</p>
      </div>
    `;
    lucide.createIcons();
  }

  setNewsStatus('Fetching latest news...');
  fetchNewsPage(true);
}

function fetchNewsPage(fresh = false) {
  if (newsLoading) return;
  newsLoading = true;

  const loadBar = document.getElementById('news-load-more-bar');
  if (loadBar && !fresh) {
    loadBar.style.display = 'block';
    lucide.createIcons();
  }

  let url = `https://newsdata.io/api/1/news?apikey=${NEWSDATA_API_KEY}&language=en&size=10`;
  if (newsNextPage) url += '&page=' + newsNextPage;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      newsLoading = false;
      if (loadBar) loadBar.style.display = 'none';

      if (data.status !== 'success') throw new Error('api_error');

      newsNextPage = data.nextPage || null;

      const now  = new Date();
      const tsEl = document.getElementById('news-timestamp');
      if (tsEl) tsEl.textContent = 'Updated ' + now.toLocaleTimeString();

      setNewsStatus(data.totalResults + ' articles available');

      if (fresh) {
        renderNewsFresh(data.results);
      } else {
        appendNewsItems(data.results);
      }
    })
    .catch(() => {
      newsLoading = false;
      if (loadBar) loadBar.style.display = 'none';
      if (fresh) showNewsOffline();
    });
}

// --- RENDER FRESH (replaces all) ---
function renderNewsFresh(items) {
  const container = document.getElementById('news-list-container');
  if (!container) return;

  container.innerHTML = '';
  items.forEach(item => container.appendChild(buildNewsCard(item)));

  // Attach infinite scroll
  container.onscroll = () => {
    const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distFromBottom < 200 && !newsLoading && newsNextPage) {
      fetchNewsPage(false);
    }
  };
}

// --- APPEND (infinite scroll) ---
function appendNewsItems(items) {
  const container = document.getElementById('news-list-container');
  if (!container) return;
  items.forEach(item => container.appendChild(buildNewsCard(item)));
}

// --- BUILD CARD ---
function buildNewsCard(item) {
  const title    = item.title
    ? item.title.replace(/<[^>]*>/g, '').slice(0, 100)
    : 'No title available';

  const desc     = item.description
    ? item.description.replace(/<[^>]*>/g, '').trim().slice(0, 180)
    : item.content
      ? item.content.replace(/<[^>]*>/g, '').trim().slice(0, 180)
      : 'No summary available for this article.';

  const source   = item.source_id
    ? item.source_id.toUpperCase()
    : 'UNKNOWN';

  const category = item.category?.[0]
    ? item.category[0].toUpperCase()
    : 'NEWS';

  const time     = item.pubDate
    ? timeAgo(new Date(item.pubDate))
    : '';

  const img      = item.image_url || '';
  const link     = item.link || '#';

  const card     = document.createElement('div');
  card.className = 'news-card';
  card.onclick   = () => openInReader(item);

  card.innerHTML = `
    <div class="news-card-inner">

      ${img ? `
        <div class="news-card-img-wrap">
          <img
            src="${img}"
            alt=""
            onerror="this.closest('.news-card-img-wrap').style.display='none'"
          />
        </div>
      ` : ''}

      <div class="news-card-body">

        <div class="news-card-top-meta">
          <span class="news-card-category">${category}</span>
          ${time ? `<span class="news-card-time">${time}</span>` : ''}
        </div>

        <div class="news-card-title">${title}</div>

        <div class="news-card-desc">${desc}</div>

        <div class="news-card-bottom-meta">
          <span class="news-card-source">📡 ${source}</span>
          <span class="news-card-read-more">Read more →</span>
        </div>

      </div>

    </div>
  `;

  return card;
}

// --- OPEN ARTICLE ---
function openNewsArticle(item) {
  openInReader(item);
}

// --- OFFLINE ---
function showNewsOffline() {
  const container = document.getElementById('news-list-container');
  if (!container) return;
  container.innerHTML = `
    <div class="news-offline-box">
      <i data-lucide="wifi-off"></i>
      <div class="news-offline-title">You Are Offline</div>
      <div class="news-offline-desc">
        NexoraNews requires an internet connection.<br/>
        Please check your connection and try again.
      </div>
      <button class="toolbar-btn" onclick="loadNews('general', null)" style="margin-top:8px;">
        <i data-lucide="refresh-cw"></i> Retry
      </button>
    </div>
  `;
  lucide.createIcons();
  setNewsStatus('Offline — cannot reach NewsData API');
}

function setNewsStatus(msg) {
  const el = document.getElementById('news-status');
  if (el) el.textContent = msg;
}

// --- DESKTOP TICKER ---
function initNewsTicker() {
  if (newsTickerDismissed) return;
  if (document.getElementById('news-desktop-ticker')) return;

  fetch(`https://newsdata.io/api/1/news?apikey=${NEWSDATA_API_KEY}&language=en&size=5`)
    .then(res => res.json())
    .then(data => {
      if (data.status !== 'success' || !data.results?.length) return;
      renderNewsTicker(data.results);
    })
    .catch(() => {});
}

function renderNewsTicker(items) {
  if (newsTickerDismissed) return;
  if (document.getElementById('news-desktop-ticker')) return;

  const desktop = document.getElementById('desktop');
  if (!desktop) return;

  const ticker = document.createElement('div');
  ticker.id    = 'news-desktop-ticker';

  ticker.innerHTML = `
    <div id="news-ticker-header">
      <div id="news-ticker-label">
        <i data-lucide="newspaper"></i>
        LIVE NEWS
      </div>
      <div id="news-ticker-actions">
        <button id="news-ticker-open-btn" onclick="openNewsFromTicker()">OPEN NEXORANEWS</button>
        <button id="news-ticker-close-btn" onclick="dismissNewsTicker()">✕</button>
      </div>
    </div>
    <div id="news-ticker-body">
      ${items.map(item => `
        <div class="news-ticker-item"
          onclick="openInReader(${JSON.stringify(item).replace(/"/g, '&quot;')})">
          <div class="news-ticker-dot"></div>
          <div>
            <div class="news-ticker-text">${item.title}</div>
            <div class="news-ticker-source">
              ${item.source_id?.toUpperCase() || 'NEWS'} · ${timeAgo(new Date(item.pubDate))}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  desktop.appendChild(ticker);
  lucide.createIcons();

  newsTickerInterval = setTimeout(() => dismissNewsTicker(), 30000);
}

function dismissNewsTicker() {
  const ticker = document.getElementById('news-desktop-ticker');
  if (ticker) {
    ticker.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    ticker.style.opacity    = '0';
    ticker.style.transform  = 'translateX(-50%) translateY(20px)';
    setTimeout(() => ticker.remove(), 400);
  }
  if (newsTickerInterval) {
    clearTimeout(newsTickerInterval);
    newsTickerInterval = null;
  }
  newsTickerDismissed = true;
}

function openNewsFromTicker() {
  dismissNewsTicker();
  openWindow('nexoraNews');
}

// --- TIME AGO ---
function timeAgo(date) {
  if (!date || isNaN(date)) return '';
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60)  return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)  return minutes + 'm ago';
  const hours = Math.floor(minutes / 60);
  if (hours < 24)    return hours + 'h ago';
  const days = Math.floor(hours / 24);
  return days + 'd ago';
}


// ===========================
// NEXORA READER
// ===========================

function openInReader(item) {
  // Open or focus the reader window
  if (document.getElementById('win-nexoraReader')) {
    closeWindow('nexoraReader');
  }

  // Temporarily register the config
  openWindow('nexoraReader');

  setTimeout(() => {
    renderReaderContent(item);
  }, 150);
}

function renderReaderContent(item) {
  const container = document.getElementById('reader-content');
  if (!container) return;

  const title    = item.title
    ? item.title.replace(/<[^>]*>/g, '')
    : 'No title';

  const desc     = item.description
    ? item.description.replace(/<[^>]*>/g, '').trim()
    : '';

  const content  = item.content
    ? item.content.replace(/<[^>]*>/g, '').trim()
    : '';

  const source   = item.source_id
    ? item.source_id.toUpperCase()
    : 'UNKNOWN';

  const category = item.category?.[0]
    ? item.category[0].toUpperCase()
    : 'NEWS';

  const time     = item.pubDate
    ? new Date(item.pubDate).toLocaleString('en-US', {
        weekday: 'long',
        year:    'numeric',
        month:   'long',
        day:     'numeric',
        hour:    '2-digit',
        minute:  '2-digit'
      })
    : '';

  const img      = item.image_url || '';
  const link     = item.link      || '#';

  // Clean content — remove duplicate of description if present
  const bodyText = content && content !== desc
    ? content
    : desc;

  container.innerHTML = `

    <span class="reader-category">${category}</span>

    <div class="reader-title">${title}</div>

    <div class="reader-meta">
      <span class="reader-meta-source">📡 ${source}</span>
      ${time ? `<span class="reader-meta-time">🕐 ${time}</span>` : ''}
      <a class="reader-meta-link" href="${link}" target="_blank" title="Open original article">
        <i data-lucide="external-link"></i> Original
      </a>
    </div>

    <div class="reader-divider"></div>

    ${img ? `
      <div class="reader-img-wrap">
        <img
          src="${img}"
          alt=""
          onerror="this.closest('.reader-img-wrap').style.display='none'"
        />
      </div>
    ` : ''}

    ${desc ? `
      <div>
        <div class="reader-body-label">Summary</div>
        <div class="reader-summary-box">${desc}</div>
      </div>
    ` : ''}

    ${bodyText && bodyText !== desc ? `
      <div>
        <div class="reader-body-label">Full Content</div>
        <div class="reader-full-content">${bodyText}</div>
      </div>
    ` : ''}

    <div class="reader-divider"></div>

    <div class="reader-footer-note">
      Some articles may be truncated by the source publisher.<br/>
      Click "Original" above to read the full article on the publisher's website.
    </div>

  `;

  lucide.createIcons();

  // Update window title
  const titlebar = document.querySelector('#win-nexoraReader .win-title-inner');
  if (titlebar) {
    titlebar.innerHTML = `<i data-lucide="book-open"></i> ${source}`;
    lucide.createIcons();
  }
}


// ===========================
// NASA SPACE EXPLORER
// ===========================

const NASA_API_KEY = 'JcOBm6o1PcMmRKWWYfvgMNvkQhLxcJlGSHlHleLK';

function loadNasaToday() {
  const today = new Date().toISOString().split('T')[0];
  loadNasaByDate(today);
  const favEl = document.getElementById('nasa-favorites');
  if (favEl) favEl.value = '';
}

function loadNasaRandom() {
  // Random date between 1995-06-16 and today
  const start  = new Date('1995-06-16').getTime();
  const end    = new Date().getTime();
  const random = new Date(start + Math.random() * (end - start));
  const date   = random.toISOString().split('T')[0];
  loadNasaByDate(date);
  const favEl = document.getElementById('nasa-favorites');
  if (favEl) favEl.value = '';
}

function loadNasaByDate(date) {
  if (!date) return;

  // Set date input
  const dateInput = document.getElementById('nasa-date-input');
  if (dateInput) dateInput.value = date;

  setNasaStatus('Fetching space data for ' + date + '...');

  const content = document.getElementById('nasa-content');
  if (content) {
    content.innerHTML = `
      <div id="nasa-placeholder">
        <i data-lucide="loader-2" style="animation: newsSpinAnim 1s linear infinite;"></i>
        <p>Contacting NASA...</p>
      </div>
    `;
    lucide.createIcons();
  }

  fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&date=${date}`)
    .then(res => {
      if (!res.ok) throw new Error('api_error');
      return res.json();
    })
    .then(data => {
      renderNasaApod(data);
    })
    .catch(() => showNasaOffline());
}

function renderNasaApod(data) {
  const content = document.getElementById('nasa-content');
  if (!content) return;

  const title       = data.title       || 'Unknown';
  const date        = data.date        || '';
  const explanation = data.explanation || '';
  const mediaType   = data.media_type  || 'image';
  const url         = data.url         || '';
  const hdUrl       = data.hdurl       || url;
  const copyright   = data.copyright
    ? '© ' + data.copyright.replace('\n', ' ')
    : 'NASA / Public Domain';

  // Update date display
  const dateEl = document.getElementById('nasa-date-display');
  if (dateEl) {
    const formatted = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year:    'numeric',
      month:   'long',
      day:     'numeric'
    });
    dateEl.textContent = formatted;
  }

  setNasaStatus(mediaType === 'video' ? '🎬 Video content' : '🖼️ Image content · Click image for HD');

  content.innerHTML = `
    <div class="nasa-media-wrap">
      ${mediaType === 'video'
        ? `<iframe src="${url}" allowfullscreen></iframe>`
        : `<img
             src="${url}"
             alt="${title}"
             onclick="window.open('${hdUrl}', '_blank')"
             title="Click to view HD"
           />
           <button class="nasa-hd-btn" onclick="window.open('${hdUrl}', '_blank')">
             🔍 VIEW HD
           </button>`
      }
    </div>

    <div class="nasa-info-panel">

      <div class="nasa-info-title">${title}</div>

      <div class="nasa-info-meta">
        <span class="nasa-info-date">📅 ${date}</span>
        <span class="nasa-info-copyright">${copyright}</span>
      </div>

      <div class="nasa-divider"></div>

      <div class="nasa-explanation-label">NASA Explanation</div>
      <div class="nasa-explanation">${explanation}</div>

    </div>
  `;

  lucide.createIcons();
}

function setNasaStatus(msg) {
  const el = document.getElementById('nasa-status');
  if (el) el.textContent = msg;
}

function showNasaOffline() {
  const content = document.getElementById('nasa-content');
  if (!content) return;
  content.innerHTML = `
    <div class="nasa-offline-box">
      <i data-lucide="wifi-off"></i>
      <div class="nasa-offline-title">Cannot Reach NASA</div>
      <div class="nasa-offline-desc">
        NexoraSpace requires an internet connection.<br/>
        Please check your connection and try again.
      </div>
      <button class="toolbar-btn" onclick="loadNasaToday()" style="margin-top:8px;">
        <i data-lucide="refresh-cw"></i> Retry
      </button>
    </div>
  `;
  lucide.createIcons();
  setNasaStatus('Offline — cannot reach NASA API');
}

// ===========================
// NEXORA MAPS
// ===========================

let mapsInstance       = null;
let mapsCurrentStyle   = 'street';
let mapsPin            = null;
let mapsMeasureMode    = false;
let mapsMeasurePoints  = [];
let mapsMeasureLine    = null;
let mapsSuggestTimeout = null;
let mapsSuggestItems   = [];
let mapsSuggestIndex   = -1;

const MAPS_TILES = {
  street: {
    url:   'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attr:  '© OpenStreetMap contributors',
    label: 'Street'
  },
  dark: {
    url:   'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    attr:  '© Stadia Maps © OpenStreetMap contributors',
    label: 'Dark'
  },
  satellite: {
    url:   'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attr:  '© Esri © OpenStreetMap contributors',
    label: 'Satellite'
  }
};

let mapsCurrentTileLayer = null;

function initMaps() {
  // Load Leaflet CSS
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id    = 'leaflet-css';
    link.rel   = 'stylesheet';
    link.href  = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }

  // Load Leaflet JS
  if (typeof L === 'undefined') {
    const script    = document.createElement('script');
    script.src      = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload   = () => buildMap();
    document.head.appendChild(script);
  } else {
    buildMap();
  }
}

function buildMap() {
  const mapEl = document.getElementById('maps-map');
  if (!mapEl || mapsInstance) return;

  // Init map centered on world
  mapsInstance = L.map('maps-map', {
    center:           [20, 0],
    zoom:             3,
    zoomControl:      false,
  });

  // Custom zoom control position
  L.control.zoom({ position: 'bottomright' }).addTo(mapsInstance);

  // Default tile layer
  const tile = MAPS_TILES[mapsCurrentStyle];
  mapsCurrentTileLayer = L.tileLayer(tile.url, {
    attribution: tile.attr,
    maxZoom:     19
  }).addTo(mapsInstance);

  // Click to drop pin
  mapsInstance.on('click', (e) => {
    if (mapsMeasureMode) {
      handleMapsMeasureClick(e.latlng);
    } else {
      dropMapsPin(e.latlng.lat, e.latlng.lng);
    }
  });

  // Mouse move — show coords
  mapsInstance.on('mousemove', (e) => {
    const coordEl = document.getElementById('maps-coords');
    if (coordEl) {
      coordEl.textContent =
        e.latlng.lat.toFixed(5) + ', ' + e.latlng.lng.toFixed(5);
    }
  });

  setMapsStatus('Map ready — search a place or click anywhere to drop a pin.');
}

function dropMapsPin(lat, lng, label) {
  if (mapsPin) mapsInstance.removeLayer(mapsPin);

  // Custom cyan pin
  const icon = L.divIcon({
    className: '',
    html: `<div style="
      width: 16px; height: 16px;
      background: #00ffc8;
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 0 0 12px rgba(0,255,200,0.8), 0 0 24px rgba(0,255,200,0.4);
    "></div>`,
    iconSize:   [16, 16],
    iconAnchor: [8, 8]
  });

  mapsPin = L.marker([lat, lng], { icon }).addTo(mapsInstance);

  // Reverse geocode to get place name
  reverseGeocode(lat, lng, label);
}

function reverseGeocode(lat, lng, fallbackLabel) {
  fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
    .then(res => res.json())
    .then(data => {
      const place   = data.display_name || fallbackLabel || 'Unknown location';
      const country = data.address?.country || '';
      const city    = data.address?.city
        || data.address?.town
        || data.address?.village
        || data.address?.county
        || '';
      showMapsInfo(lat, lng, place, city, country);
    })
    .catch(() => {
      showMapsInfo(lat, lng, fallbackLabel || 'Unknown location', '', '');
    });
}

function showMapsInfo(lat, lng, place, city, country) {
  const panel = document.getElementById('maps-info-panel');
  const body  = document.getElementById('maps-info-body');
  if (!panel || !body) return;

  body.innerHTML = `
    <div class="maps-info-row">
      <div class="maps-info-label">Place</div>
      <div class="maps-info-value highlight">${city || place.split(',')[0]}</div>
    </div>
    ${country ? `
    <div class="maps-info-row">
      <div class="maps-info-label">Country</div>
      <div class="maps-info-value">${country}</div>
    </div>` : ''}
    <div class="maps-info-row">
      <div class="maps-info-label">Coordinates</div>
      <div class="maps-info-value">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
    </div>
    <div class="maps-info-row">
      <div class="maps-info-label">Full Address</div>
      <div class="maps-info-value" style="font-size:10px; color:white;">${place}</div>
    </div>
  `;

  panel.style.display = 'block';
  setMapsStatus('📍 ' + (city || place.split(',')[0]));
}

function closeMapsInfo() {
  const panel = document.getElementById('maps-info-panel');
  if (panel) panel.style.display = 'none';
  if (mapsPin) {
    mapsInstance.removeLayer(mapsPin);
    mapsPin = null;
  }
  setMapsStatus('Click anywhere on the map to drop a pin.');
}

// --- SEARCH ---
function handleMapsSearch(e) {
  const items = document.querySelectorAll('.maps-suggestion-item');

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    mapsSuggestIndex = Math.min(mapsSuggestIndex + 1, items.length - 1);
    items.forEach((el, i) => el.classList.toggle('highlighted', i === mapsSuggestIndex));
    return;
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    mapsSuggestIndex = Math.max(mapsSuggestIndex - 1, 0);
    items.forEach((el, i) => el.classList.toggle('highlighted', i === mapsSuggestIndex));
    return;
  }
  if (e.key === 'Escape') {
    closeMapsSearchSuggestions();
    return;
  }
  if (e.key === 'Enter') {
    if (mapsSuggestIndex >= 0 && mapsSuggestItems[mapsSuggestIndex]) {
      selectMapsSuggestion(mapsSuggestIndex);
    } else {
      doMapsSearch();
    }
  }

  // Trigger suggest on input
  const val = document.getElementById('maps-search-input')?.value.trim();
  clearTimeout(mapsSuggestTimeout);
  mapsSuggestIndex = -1;
  if (!val || val.length < 2) {
    closeMapsSearchSuggestions();
    return;
  }
  mapsSuggestTimeout = setTimeout(() => fetchMapsSuggestions(val), 350);
}

function fetchMapsSuggestions(query) {
  fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1`)
    .then(res => res.json())
    .then(data => {
      if (!data || data.length === 0) {
        closeMapsSearchSuggestions();
        return;
      }
      mapsSuggestItems = data;
      renderMapsSuggestions(data);
    })
    .catch(() => closeMapsSearchSuggestions());
}

function renderMapsSuggestions(items) {
  const box = document.getElementById('maps-suggestions');
  if (!box) return;

  box.innerHTML = items.map((item, i) => `
    <div class="maps-suggestion-item"
      id="maps-sug-${i}"
      onmousedown="selectMapsSuggestion(${i})"
      onmouseover="highlightMapsSuggestion(${i})">
      <i data-lucide="map-pin"></i>
      <span>${item.display_name.split(',').slice(0, 3).join(',')}</span>
      <span class="maps-sug-type">${item.type || ''}</span>
    </div>
  `).join('');

  box.classList.add('open');
  lucide.createIcons();
}

function selectMapsSuggestion(index) {
  const item = mapsSuggestItems[index];
  if (!item) return;
  const input = document.getElementById('maps-search-input');
  if (input) input.value = item.display_name.split(',')[0];
  closeMapsSearchSuggestions();
  flyToLocation(parseFloat(item.lat), parseFloat(item.lon), item.display_name);
}

function highlightMapsSuggestion(index) {
  mapsSuggestIndex = index;
  document.querySelectorAll('.maps-suggestion-item').forEach((el, i) => {
    el.classList.toggle('highlighted', i === index);
  });
}

function closeMapsSearchSuggestions() {
  const box = document.getElementById('maps-suggestions');
  if (box) {
    box.classList.remove('open');
    box.innerHTML = '';
  }
  mapsSuggestIndex = -1;
  mapsSuggestItems = [];
}

function doMapsSearch() {
  const input = document.getElementById('maps-search-input');
  if (!input) return;
  const query = input.value.trim();
  if (!query) return;

  closeMapsSearchSuggestions();
  setMapsStatus('Searching for "' + query + '"...');

  fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`)
    .then(res => res.json())
    .then(data => {
      if (!data || data.length === 0) {
        setMapsStatus('No results found for "' + query + '"');
        showToast('Location not found. Try a different name.', 'warning');
        return;
      }
      const item = data[0];
      flyToLocation(parseFloat(item.lat), parseFloat(item.lon), item.display_name);
    })
    .catch(() => {
      setMapsStatus('Search failed — check your connection.');
      showToast('Maps search failed. Check your internet connection.', 'error');
    });
}

function flyToLocation(lat, lng, label) {
  if (!mapsInstance) return;
  mapsInstance.flyTo([lat, lng], 13, { duration: 1.5 });
  setTimeout(() => dropMapsPin(lat, lng, label), 800);
}

// --- LOCATE ME ---
function mapsLocateMe() {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser.', 'warning');
    return;
  }
  setMapsStatus('Getting your location...');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      mapsInstance.flyTo([lat, lng], 14, { duration: 1.5 });
      setTimeout(() => dropMapsPin(lat, lng, 'My Location'), 800);
    },
    () => {
      showToast('Could not get your location. Check browser permissions.', 'warning');
      setMapsStatus('Location access denied.');
    }
  );
}

// --- STYLE TOGGLE ---
function toggleMapsStyle() {
  if (!mapsInstance) return;
  const styles = ['street', 'dark', 'satellite'];
  const current = styles.indexOf(mapsCurrentStyle);
  mapsCurrentStyle = styles[(current + 1) % styles.length];

  if (mapsCurrentTileLayer) mapsInstance.removeLayer(mapsCurrentTileLayer);

  const tile = MAPS_TILES[mapsCurrentStyle];
  mapsCurrentTileLayer = L.tileLayer(tile.url, {
    attribution: tile.attr,
    maxZoom: 19
  }).addTo(mapsInstance);

  const btn = document.getElementById('maps-style-btn');
  if (btn) {
    const labels = { street: '🗺️', dark: '🌙', satellite: '🛰️' };
    setMapsStatus('Map style: ' + tile.label);
    showToast('Map style: ' + tile.label, 'info');
  }
}

// --- MEASURE DISTANCE ---
function toggleMapsMeasure() {
  mapsMeasureMode = !mapsMeasureMode;
  const btn = document.getElementById('maps-measure-btn');
  if (btn) btn.classList.toggle('active', mapsMeasureMode);

  if (!mapsMeasureMode) {
    // Clear measure
    mapsMeasurePoints = [];
    if (mapsMeasureLine) {
      mapsInstance.removeLayer(mapsMeasureLine);
      mapsMeasureLine = null;
    }
    setMapsStatus('Measure mode off.');
    showToast('Measure mode off.', 'info');
  } else {
    mapsMeasurePoints = [];
    setMapsStatus('Measure mode on — click two points on the map.');
    showToast('Click two points to measure distance.', 'info');
  }
}

function handleMapsMeasureClick(latlng) {
  mapsMeasurePoints.push(latlng);

  if (mapsMeasurePoints.length === 1) {
    setMapsStatus('First point set — click second point.');
    return;
  }

  if (mapsMeasurePoints.length === 2) {
    // Draw line
    if (mapsMeasureLine) mapsInstance.removeLayer(mapsMeasureLine);
    mapsMeasureLine = L.polyline(mapsMeasurePoints, {
      color:  '#00ffc8',
      weight: 2,
      dashArray: '6, 6',
      opacity: 0.8
    }).addTo(mapsInstance);

    // Calculate distance
    const dist = mapsMeasurePoints[0].distanceTo(mapsMeasurePoints[1]);
    const km   = (dist / 1000).toFixed(2);
    const mi   = (dist / 1609.34).toFixed(2);

    setMapsStatus(`📏 Distance: ${km} km (${mi} miles)`);
    showToast(`Distance: ${km} km / ${mi} miles`, 'success');

    // Reset for next measure
    mapsMeasurePoints = [];
  }
}

// --- HELPERS ---
function setMapsStatus(msg) {
  const el = document.getElementById('maps-status');
  if (el) el.textContent = msg;
}

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('#maps-search-wrap')) {
    closeMapsSearchSuggestions();
  }
});