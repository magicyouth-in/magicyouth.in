/**
 * admin/admin.js
 * Shared JavaScript utilities for all admin pages.
 * Handles: auth check, sidebar loading, logout, toast notifications, API helpers.
 */

// ─── AUTH GUARD ───────────────────────────────────────────────────────────────
// Runs on every admin page load to verify session is active.
(async function checkAuth() {
  try {
    const res = await fetch('/api/auth/status');
    const data = await res.json();
    if (!data.loggedIn) {
      window.location.href = '/admin/login.html';
      return;
    }
    // Set admin name in sidebar
    document.querySelectorAll('#adminName').forEach(el => el.textContent = data.admin.username);
    document.querySelectorAll('#userAvatar').forEach(el => el.textContent = data.admin.username[0].toUpperCase());
  } catch {
    window.location.href = '/admin/login.html';
  }
})();

// ─── SIDEBAR LOADER ───────────────────────────────────────────────────────────
/**
 * Loads the sidebar HTML into #sidebarContainer and highlights the current page.
 * Call this from each admin page after DOMContentLoaded.
 */
async function loadSidebar(currentPage) {
  try {
    const res = await fetch('/admin/_sidebar.html');
    const html = await res.text();
    const container = document.getElementById('sidebarContainer');
    if (container) {
      container.innerHTML = html;
      // Highlight active nav link
      document.querySelectorAll('.nav-link').forEach(link => {
        if (link.dataset.page === currentPage) {
          link.classList.add('bg-purple-900/40', 'text-purple-300');
          link.classList.remove('text-gray-400');
        }
      });
    }
  } catch (e) {
    console.error('Failed to load sidebar:', e);
  }
}

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login.html';
  } catch {
    window.location.href = '/admin/login.html';
  }
}

// ─── TOAST NOTIFICATIONS ──────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer') || createToastContainer();
  const toast = document.createElement('div');
  const colors = {
    success: 'bg-green-900/90 border-green-600/50 text-green-200',
    error:   'bg-red-900/90 border-red-600/50 text-red-200',
    info:    'bg-blue-900/90 border-blue-600/50 text-blue-200',
    warning: 'bg-yellow-900/90 border-yellow-600/50 text-yellow-200'
  };
  toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-2xl backdrop-blur-sm transition-all duration-300 opacity-0 translate-x-4 ${colors[type] || colors.success}`;
  toast.innerHTML = `
    <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      ${type === 'success' ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>' : '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>'}
    </svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.remove('opacity-0', 'translate-x-4'); }, 10);
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-4');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function createToastContainer() {
  const div = document.createElement('div');
  div.id = 'toastContainer';
  div.className = 'fixed top-5 right-5 z-[9999] space-y-2 w-80';
  document.body.appendChild(div);
  return div;
}

// ─── API HELPERS ──────────────────────────────────────────────────────────────
/**
 * Generic API fetch wrapper with error handling.
 */
async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
}

/**
 * Format a date string nicely for display.
 */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

/**
 * Returns a badge HTML string for event status.
 */
function statusBadge(status) {
  const styles = {
    upcoming:  'bg-blue-900/40 text-blue-300 border-blue-700/50',
    completed: 'bg-green-900/40 text-green-300 border-green-700/50',
  };
  return `<span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.upcoming} capitalize">${status}</span>`;
}

/**
 * Opens a generic confirmation modal. Returns Promise<boolean>.
 */
function confirmDelete(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/70 z-[9998] flex items-center justify-center p-4';
    overlay.innerHTML = `
      <div class="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center">
            <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <div>
            <h3 class="text-white font-semibold">Confirm Delete</h3>
            <p class="text-gray-400 text-sm">${message}</p>
          </div>
        </div>
        <div class="flex gap-3">
          <button id="cancelBtn" class="flex-1 px-4 py-2 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm transition">Cancel</button>
          <button id="confirmBtn" class="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition">Delete</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#cancelBtn').onclick = () => { overlay.remove(); resolve(false); };
    overlay.querySelector('#confirmBtn').onclick = () => { overlay.remove(); resolve(true); };
  });
}

// ─── MOBILE SIDEBAR TOGGLE ────────────────────────────────────────────────────
function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('-translate-x-full');
}
