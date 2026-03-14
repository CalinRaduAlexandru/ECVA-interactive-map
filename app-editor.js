(function () {
  const mapFrame = document.querySelector('.desktop-map iframe');
  if (!mapFrame) return;

  const adminHub = document.getElementById('ecva-admin-hub');
  const manageRoot = document.getElementById('ecva-manage-root');
  const manageBody = document.getElementById('ecva-manage-body');
  const countryTabsHost = document.getElementById('ecva-manage-country-tabs');
  const manageBtn = document.getElementById('ecva-manage-app-btn');
  const accessCodeInput = document.getElementById('ecva-access-code-input');
  const accessCodeError = document.getElementById('ecva-access-code-error');
  const websiteBtn = document.getElementById('ecva-go-website-btn');
  const closeHubBtn = document.getElementById('ecva-close-hub-btn');
  const closeManageBtn = document.getElementById('ecva-manage-close-btn');

  const editorModal = document.getElementById('ecva-editor-modal');
  const editorForm = document.getElementById('ecva-editor-form');
  const editorHeading = document.getElementById('ecva-editor-heading');
  const entryFieldsWrap = document.getElementById('ecva-editor-entry-fields');
  const repFieldsWrap = document.getElementById('ecva-editor-rep-fields');
  const editorTitle = document.getElementById('ecva-editor-title');
  const editorSubtitle = document.getElementById('ecva-editor-subtitle');
  const editorDescription = document.getElementById('ecva-editor-description');
  const editorRepName = document.getElementById('ecva-editor-rep-name');
  const editorRepTitle = document.getElementById('ecva-editor-rep-title');
  const editorRepOrganisation = document.getElementById('ecva-editor-rep-organisation');
  const editorRepImageFile = document.getElementById('ecva-editor-rep-image-file');
  const editorCropImage = document.getElementById('ecva-editor-crop-image');
  const editorCropFrame = document.getElementById('ecva-editor-crop-frame');
  const editorCropHandle = document.getElementById('ecva-editor-crop-handle');
  const editorCropStatus = document.getElementById('ecva-editor-crop-status');
  const editorCancelBtn = document.getElementById('ecva-editor-cancel-btn');
  const editorRemoveBtn = document.getElementById('ecva-editor-remove-btn');

  const toast = document.getElementById('ecva-toast');
  const mobileLegendLogo = document.querySelector('.mobile-legend .legend-logo');

  const WEBSITE_URL = 'https://www.ecvassociation.org';
  const EDITOR_API = '/api/editor-data';
  const EDITOR_VERSIONS_API = '/api/editor-data/versions';
  const UPLOAD_API = '/api/upload-image';
  const GLOBAL_ACCESS_CODES = new Set();
  const INVALID_CODE_MESSAGE = 'Invalid code';

  function getCurrentLang() {
    const query = new URLSearchParams(window.location.search);
    const fromQuery = String(query.get('lang') || query.get('pa') || query.get('language') || '')
      .trim()
      .toLowerCase();
    if (fromQuery) return fromQuery;
    return String(document.documentElement.lang || 'en').trim().toLowerCase() || 'en';
  }

  function canEditContent() {
    return true;
  }

  function normalizeManageCountryCode(rawCode) {
    const value = String(rawCode || '').trim().toUpperCase();
    if (!value) return '';
    return value === 'UK' ? 'GB' : value;
  }

  function countryPrefixForAccessCode(rawCode) {
    const normalized = normalizeManageCountryCode(rawCode);
    if (!normalized) return '';
    return normalized === 'GB' ? 'uk' : normalized.toLowerCase();
  }

  function displayCountryCode(rawCode) {
    const normalized = normalizeManageCountryCode(rawCode);
    return normalized === 'GB' ? 'UK' : normalized;
  }

  function buildCountryAccessCode(rawCode, salt) {
    const prefix = countryPrefixForAccessCode(rawCode);
    if (!prefix) return '';
    const seed = `${prefix}|ecva|${Number(salt) || 0}`;
    let hash = 2166136261;
    for (let i = 0; i < seed.length; i += 1) {
      hash ^= seed.charCodeAt(i);
      hash +=
        (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
      hash >>>= 0;
    }
    const digits = String(hash % 100000).padStart(5, '0');
    const letter = String.fromCharCode(65 + (hash % 26));
    const insertAt = hash % 6;
    const token = `${digits.slice(0, insertAt)}${letter}${digits.slice(insertAt)}`;
    return `${prefix}ecva${token}`;
  }

  function getAccessCodeForCountry(rawCode) {
    const normalized = normalizeManageCountryCode(rawCode);
    if (!normalized) return '';
    return (
      countryAccessCodeMap.get(normalized) ||
      buildCountryAccessCode(normalized, 1).toLowerCase()
    );
  }

  function maskAccessCode(value) {
    const code = String(value || '').trim();
    if (!code) return '';
    return '•'.repeat(Math.max(8, code.length));
  }

  function normalizeStatus(rawStatus) {
    const value = String(rawStatus || '').trim().toLowerCase();
    if (value.includes('lead')) return { label: 'Leading', className: 'is-leading' };
    if (value.includes('moment')) {
      return { label: 'High Momentum', className: 'is-momentum' };
    }
    if (value.includes('pending')) return { label: 'Pending', className: 'is-pending' };
    if (value.includes('no data') || value === 'no_data' || value === 'nodata') {
      return { label: 'No data', className: 'is-no-data' };
    }
    return { label: 'In Development', className: 'is-development' };
  }

  function normalizeStatusValue(rawStatus) {
    const value = String(rawStatus || '').trim().toLowerCase();
    if (!value) return 'no_data';
    if (value === 'high_momentum' || value === 'momentum' || value === 'high momentum') {
      return 'high_momentum';
    }
    if (value === 'in development' || value === 'development' || value === 'dev') {
      return 'development';
    }
    if (value === 'leading' || value === 'leader') return 'leading';
    if (value === 'pending') return 'pending';
    if (value === 'no_data' || value === 'no data' || value === 'nodata') return 'no_data';
    return 'no_data';
  }

  function getStatusLabelFromValue(statusValue) {
    const value = normalizeStatusValue(statusValue);
    if (value === 'leading') return 'Leading';
    if (value === 'high_momentum') return 'High Momentum';
    if (value === 'development') return 'In Development';
    if (value === 'pending') return 'Pending';
    return 'No data';
  }

  function isActiveStatusValue(statusValue) {
    const value = normalizeStatusValue(statusValue);
    return value === 'leading' || value === 'high_momentum' || value === 'development';
  }

  function normalizeSubmissionStatus(rawStatus) {
    const value = String(rawStatus || '').trim().toLowerCase();
    if (value === 'in_progress' || value === 'in progress' || value === 'processing') {
      return 'in_progress';
    }
    if (value === 'rejected' || value === 'declined') return 'rejected';
    if (value === 'archived' || value === 'used' || value === 'done') return 'archived';
    return 'new';
  }

  function getSubmissionStatusLabel(statusValue) {
    const value = normalizeSubmissionStatus(statusValue);
    if (value === 'in_progress') return 'In progress';
    if (value === 'rejected') return 'Rejected';
    if (value === 'archived') return 'Archived';
    return 'New';
  }

  let activeCountries = [];
  let countryCatalog = [];
  let inboxByCountry = {};
  let selectedCountryId = '';
  let accessScope = { mode: 'all', countryId: '' };
  let accessCodeToCountryMap = new Map();
  let countryAccessCodeMap = new Map();
  let activeCountriesWaiters = [];
  let editorTarget = null;
  let editorMode = 'entry';
  let representativeImagePath = '';
  let representativeSourceImagePath = '';
  let representativeCropSource = '';
  let representativeCropFileName = 'representative-image.png';
  let representativeImageNaturalWidth = 0;
  let representativeImageNaturalHeight = 0;
  let representativeCrop = null;
  let representativeInitial = null;
  let cropPointerState = null;
  let toastTimer = null;
  let persistTimer = null;
  let inboxRequestCounter = 0;
  let pendingInboxRequests = new Map();
  let versionHistoryBtn = null;
  let versionHistoryModal = null;
  let versionHistoryList = null;
  let versionHistoryCloseBtn = null;
  let versionHistoryWired = false;

  function postToMap(type, payload) {
    if (!mapFrame.contentWindow) return;
    mapFrame.contentWindow.postMessage({ type, payload: payload || {} }, '*');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function clearAccessCodeError() {
    if (!accessCodeError) return;
    accessCodeError.textContent = '';
    accessCodeError.classList.remove('is-visible');
  }

  function showAccessCodeError(message) {
    if (!accessCodeError) return;
    accessCodeError.textContent = String(message || INVALID_CODE_MESSAGE);
    accessCodeError.classList.add('is-visible');
  }

  function getNormalizedAccessCodeInput(rawValue) {
    return String(rawValue || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '');
  }

  function isCountryAllowed(countryId) {
    if (!countryId) return false;
    if (accessScope.mode !== 'country') return true;
    return (
      normalizeManageCountryCode(countryId) ===
      normalizeManageCountryCode(accessScope.countryId)
    );
  }

  function getVersionScopeCountryId(explicitCountryId) {
    const fromExplicit = normalizeManageCountryCode(explicitCountryId);
    if (fromExplicit) return fromExplicit;
    const fromSelected = normalizeManageCountryCode(selectedCountryId);
    if (fromSelected) return fromSelected;
    if (accessScope.mode === 'country') {
      return normalizeManageCountryCode(accessScope.countryId);
    }
    return '';
  }

  function updateVersionHistoryButtonVisibility() {
    if (!versionHistoryBtn) return;
    const hasCountryScope = Boolean(getVersionScopeCountryId());
    versionHistoryBtn.style.display = hasCountryScope ? 'inline-flex' : 'none';
    if (!hasCountryScope) {
      closeVersionHistoryModal();
    }
  }

  function rebuildCountryAccessMaps() {
    accessCodeToCountryMap = new Map();
    countryAccessCodeMap = new Map();
    const source = Array.isArray(countryCatalog) && countryCatalog.length ? countryCatalog : activeCountries;
    source.forEach((country, index) => {
      const countryId = normalizeManageCountryCode(country && country.code);
      if (!countryId) return;
      const statusValue = normalizeStatusValue(country && (country.statusValue || country.status));
      if (!(isActiveStatusValue(statusValue) || statusValue === 'pending')) return;
      const code = buildCountryAccessCode(countryId, index + 1).toLowerCase();
      accessCodeToCountryMap.set(code, countryId);
      countryAccessCodeMap.set(countryId, code);
    });
  }

  function resolveAccessScope(inputRaw) {
    const code = getNormalizedAccessCodeInput(inputRaw);
    if (!code) {
      return { mode: 'all', countryId: '' };
    }
    if (GLOBAL_ACCESS_CODES.has(code)) {
      return { mode: 'all', countryId: '' };
    }
    const countryId = accessCodeToCountryMap.get(code);
    if (!countryId) return null;
    return { mode: 'country', countryId };
  }

  function resolveActiveCountriesWaiters() {
    if (!activeCountriesWaiters.length) return;
    activeCountriesWaiters.forEach((waiter) => {
      if (waiter.timeout) window.clearTimeout(waiter.timeout);
      waiter.resolve(activeCountries);
    });
    activeCountriesWaiters = [];
  }

  function rejectActiveCountriesWaiters() {
    if (!activeCountriesWaiters.length) return;
    activeCountriesWaiters.forEach((waiter) => {
      if (waiter.timeout) window.clearTimeout(waiter.timeout);
      waiter.reject(new Error('active_countries_timeout'));
    });
    activeCountriesWaiters = [];
  }

  function ensureActiveCountriesLoaded() {
    if (activeCountries.length || countryCatalog.length) return Promise.resolve(activeCountries);
    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        rejectActiveCountriesWaiters();
      }, 2500);
      activeCountriesWaiters.push({ resolve, reject, timeout });
      postToMap('ecva-request-active-countries');
    });
  }

  function getFirstAllowedCountryId() {
    const first = activeCountries.find((country) => isCountryAllowed(country && country.code));
    return first ? String(first.code || '').trim() : '';
  }

  function ensureSelectedCountryIsAllowed() {
    if (!selectedCountryId) return;
    if (
      activeCountries.some(
        (country) =>
          normalizeManageCountryCode(country && country.code) ===
            normalizeManageCountryCode(selectedCountryId) &&
          isCountryAllowed(selectedCountryId),
      )
    ) {
      return;
    }
    if (accessScope.mode === 'country') {
      const fallback = getFirstAllowedCountryId();
      selectedCountryId = fallback || '';
      return;
    }
    selectedCountryId = '';
  }

  function wireAccessPanel(panel) {
    if (!panel) return;
    const rows = panel.querySelectorAll('.ecva-manage-access-row-item');
    rows.forEach((row) => {
      const code = String(row.getAttribute('data-access-code') || '').trim();
      const codeText = row.querySelector('.ecva-manage-access-code');
      const eyeBtn = row.querySelector('.ecva-manage-access-eye');
      const copyBtn = row.querySelector('.ecva-manage-access-copy');
      const copiedMsg = row.querySelector('.ecva-manage-access-copied');
      if (!code || !codeText || !eyeBtn || !copyBtn) return;

      const setRevealState = (revealed) => {
        row.setAttribute('data-revealed', revealed ? 'true' : 'false');
        codeText.textContent = revealed ? code : maskAccessCode(code);
        eyeBtn.textContent = revealed ? '👁' : '👁‍🗨';
        eyeBtn.setAttribute('aria-label', revealed ? 'Hide app access code' : 'Show app access code');
      };

      setRevealState(false);
      eyeBtn.addEventListener('click', () => {
        const revealed = row.getAttribute('data-revealed') === 'true';
        setRevealState(!revealed);
      });
      copyBtn.addEventListener('click', async () => {
        const fallbackCopy = () => {
          const area = document.createElement('textarea');
          area.value = code;
          area.setAttribute('readonly', '');
          area.style.position = 'fixed';
          area.style.top = '-9999px';
          document.body.appendChild(area);
          area.select();
          area.setSelectionRange(0, area.value.length);
          const ok = document.execCommand('copy');
          document.body.removeChild(area);
          return ok;
        };
        try {
          let copied = false;
          if (navigator.clipboard) {
            try {
              await navigator.clipboard.writeText(code);
              copied = true;
            } catch (error) {
              copied = false;
            }
          }
          if (!copied) copied = fallbackCopy();
          if (!copied) {
            throw new Error('copy_failed');
          }
          if (copiedMsg) {
            copiedMsg.classList.add('is-visible');
            window.setTimeout(() => {
              copiedMsg.classList.remove('is-visible');
            }, 1500);
          }
        } catch (error) {
          showToast('Could not copy code.', true);
        }
      });
    });
  }

  function wireStatusSelects(panel) {
    if (!panel) return;
    const selects = panel.querySelectorAll('.ecva-manage-status-select[data-country-id]');
    selects.forEach((selectEl) => {
      if (selectEl.dataset.wired === '1') return;
      selectEl.dataset.wired = '1';
      selectEl.addEventListener('change', () => {
        const countryId = normalizeManageCountryCode(selectEl.getAttribute('data-country-id'));
        const nextStatus = normalizeStatusValue(selectEl.value);
        if (!countryId) return;
        postToMap('ecva-editor-update-country-status', {
          countryId,
          status: nextStatus,
        });
      });
    });
  }

  function buildStatusSelectHtml(countryId, currentStatus, variant) {
    const value = normalizeStatusValue(currentStatus);
    const country = normalizeManageCountryCode(countryId);
    const allOptions = [
      { value: 'leading', label: 'Leading' },
      { value: 'high_momentum', label: 'High Momentum' },
      { value: 'development', label: 'In Development' },
      { value: 'pending', label: 'Pending' },
      { value: 'no_data', label: 'No data' },
    ];
    const otherOptions = [
      { value: 'no_data', label: 'No data' },
      { value: 'pending', label: 'Pending' },
    ];
    const options = variant === 'active' ? allOptions : otherOptions;
    const optionsHtml = options
      .map((option) => {
        const selected = option.value === value ? ' selected' : '';
        return `<option value="${option.value}"${selected}>${option.label}</option>`;
      })
      .join('');
    return `<select class="ecva-manage-status-select" data-country-id="${country}">${optionsHtml}</select>`;
  }

  function buildCodeControlsHtml(countryId, statusValue) {
    const hasCode = isActiveStatusValue(statusValue) || normalizeStatusValue(statusValue) === 'pending';
    if (!hasCode) {
      return `<span class="ecva-manage-access-empty">-</span>`;
    }
    const code = getAccessCodeForCountry(countryId);
    return `
      <span class="ecva-manage-access-controls">
        <code class="ecva-manage-access-code">${maskAccessCode(code)}</code>
        <button type="button" class="ecva-manage-access-eye" aria-label="Show app access code">👁‍🗨</button>
        <button type="button" class="ecva-manage-access-copy" aria-label="Copy app access code">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M8 4.8A2.8 2.8 0 0 1 10.8 2h7.4A2.8 2.8 0 0 1 21 4.8v7.4a2.8 2.8 0 0 1-2.8 2.8H16v1.2A2.8 2.8 0 0 1 13.2 19H5.8A2.8 2.8 0 0 1 3 16.2V8.8A2.8 2.8 0 0 1 5.8 6H8V4.8Zm2-.8v8.2c0 .44.36.8.8.8H19c.44 0 .8-.36.8-.8V4.8c0-.44-.36-.8-.8-.8h-8.2c-.44 0-.8.36-.8.8ZM8 8H5.8c-.44 0-.8.36-.8.8v7.4c0 .44.36.8.8.8h7.4c.44 0 .8-.36.8-.8V15h-3.2A2.8 2.8 0 0 1 8 12.2V8Z"></path>
          </svg>
        </button>
        <span class="ecva-manage-access-copied" aria-live="polite">Copied</span>
      </span>
    `;
  }

  function buildOverviewCountryRow(country, variant) {
    const countryCode = normalizeManageCountryCode(country && country.code);
    if (!countryCode) return '';
    const statusValue = normalizeStatusValue(country && (country.statusValue || country.status));
    const statusMeta = normalizeStatus(getStatusLabelFromValue(statusValue));
    const displayCode = displayCountryCode(countryCode);
    return `
      <article class="ecva-manage-access-row-item" data-access-code="${getAccessCodeForCountry(countryCode)}" data-revealed="false">
        <span class="ecva-manage-access-country">${String(country.flag || '')} ${displayCode}</span>
        <span class="ecva-manage-access-status ${statusMeta.className}">${getStatusLabelFromValue(statusValue)}</span>
        ${buildStatusSelectHtml(countryCode, statusValue, variant)}
        ${buildCodeControlsHtml(countryCode, statusValue)}
      </article>
    `;
  }

  function renderGeneralAccessPanel() {
    if (!manageBody) return;
    const previous = manageBody.querySelector('.ecva-manage-access-panel');
    if (previous) previous.remove();
    if (selectedCountryId || !countryCatalog.length) return;

    const panel = document.createElement('section');
    panel.className = 'ecva-manage-access-panel';
    const sortedCatalog = [...countryCatalog]
      .filter((country) =>
        accessScope.mode === 'all' ? true : isCountryAllowed(country && country.code),
      )
      .sort((a, b) =>
        String(a && a.name ? a.name : '').localeCompare(String(b && b.name ? b.name : '')),
      );
    const managedRows = sortedCatalog.filter(
      (country) => normalizeStatusValue(country && (country.statusValue || country.status)) !== 'no_data',
    );
    const otherRows = sortedCatalog.filter(
      (country) => normalizeStatusValue(country && (country.statusValue || country.status)) === 'no_data',
    );
    panel.innerHTML = `
      <article class="ecva-manage-access-card">
        <header class="ecva-manage-access-head">
          <h4>General management</h4>
        </header>
        <div class="ecva-manage-access-table">
          <div class="ecva-manage-access-table-head">
            <span>Country</span>
            <span>Status</span>
            <span>Edit status</span>
            <span>App access*</span>
          </div>
          ${
            managedRows.length
              ? managedRows.map((country) => buildOverviewCountryRow(country, 'active')).join('')
              : '<div class="ecva-manage-access-empty-row">No countries are in management yet.</div>'
          }
        </div>
      </article>
      <article class="ecva-manage-access-card is-secondary">
        <header class="ecva-manage-access-head">
          <h4>Other countries</h4>
        </header>
        <div class="ecva-manage-access-table">
          <div class="ecva-manage-access-table-head">
            <span>Country</span>
            <span>Status</span>
            <span>Edit status</span>
            <span>App access*</span>
          </div>
          ${
            otherRows.length
              ? otherRows.map((country) => buildOverviewCountryRow(country, 'other')).join('')
              : '<div class="ecva-manage-access-empty-row">No remaining countries.</div>'
          }
        </div>
      </article>
    `;
    manageBody.prepend(panel);
    wireAccessPanel(panel);
    wireStatusSelects(panel);
  }

  function showToast(message, isError) {
    if (!toast) return;
    if (toastTimer) {
      window.clearTimeout(toastTimer);
      toastTimer = null;
    }
    toast.textContent = message;
    toast.style.background = isError ? '#6a2e2e' : '#274351';
    toast.classList.add('is-visible');
    toastTimer = window.setTimeout(() => {
      toast.classList.remove('is-visible');
      toastTimer = null;
    }, 2200);
  }

  function openHub() {
    if (!adminHub) return;
    adminHub.classList.add('is-visible');
    adminHub.setAttribute('aria-hidden', 'false');
  }

  function closeHub() {
    if (!adminHub) return;
    adminHub.classList.remove('is-visible');
    adminHub.setAttribute('aria-hidden', 'true');
  }

  function openManage() {
    if (!manageRoot) return;
    closeHub();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    manageRoot.classList.add('is-visible');
    manageRoot.setAttribute('aria-hidden', 'false');
    ensureVersionHistoryUi();
    ensureVersionHistoryButton();
    updateVersionHistoryButtonVisibility();
    postToMap('ecva-request-active-countries');
  }

  async function launchManageFromAccessCode() {
    if (!manageBtn) return;
    manageBtn.disabled = true;
    try {
      await ensureActiveCountriesLoaded();
      const resolved = resolveAccessScope(accessCodeInput ? accessCodeInput.value : '');
      if (!resolved) {
        showAccessCodeError(INVALID_CODE_MESSAGE);
        if (accessCodeInput) accessCodeInput.focus();
        return;
      }
      clearAccessCodeError();
      accessScope = resolved;
      if (accessScope.mode === 'country') {
        selectedCountryId = accessScope.countryId;
      } else {
        selectedCountryId = '';
      }
      openManage();
    } catch (error) {
      showAccessCodeError('Could not validate code');
    } finally {
      manageBtn.disabled = false;
    }
  }

  function closeManage() {
    if (!manageRoot) return;
    closeEditorModal();
    closeVersionHistoryModal();
    pendingInboxRequests.forEach((pending) => {
      if (pending && pending.timeout) window.clearTimeout(pending.timeout);
    });
    pendingInboxRequests.clear();
    manageRoot.classList.remove('is-visible');
    manageRoot.setAttribute('aria-hidden', 'true');
    if (manageBody) manageBody.innerHTML = '';
  }

  function openEditorModal() {
    if (!editorModal) return;
    editorModal.classList.add('is-visible');
    editorModal.setAttribute('aria-hidden', 'false');
  }

  function closeEditorModal() {
    if (!editorModal) return;
    editorModal.classList.remove('is-visible');
    editorModal.setAttribute('aria-hidden', 'true');
    editorTarget = null;
    editorMode = 'entry';
    clearEditorFields();
    setEditorMode('entry');
  }

  function ensureVersionHistoryUi() {
    if (versionHistoryModal) return;

    const style = document.createElement('style');
    style.textContent = `
      .ecva-version-modal{position:fixed;inset:0;z-index:3300;display:none;align-items:center;justify-content:center;background:rgba(15,26,34,.52);padding:16px}
      .ecva-version-modal.is-visible{display:flex}
      .ecva-version-dialog{width:min(760px,calc(100vw - 28px));max-height:calc(100dvh - 28px);overflow:auto;border-radius:16px;border:1px solid rgba(128,149,161,.45);background:#f5fbfd;box-shadow:0 18px 46px rgba(21,38,49,.3);padding:16px}
      .ecva-version-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
      .ecva-version-title{margin:0;font:800 24px/1.15 "Alexandria",sans-serif;color:#223a46}
      .ecva-version-sub{margin:0 0 10px;color:#45616f;font:600 13px/1.4 "Alexandria",sans-serif}
      .ecva-version-close{height:38px;padding:0 12px;border-radius:10px;border:1px solid rgba(106,130,143,.58);background:#eef4f6;color:#2a414c;font:800 13px "Alexandria",sans-serif;cursor:pointer}
      .ecva-version-list{display:grid;gap:8px}
      .ecva-version-item{display:grid;grid-template-columns:1fr auto;align-items:center;gap:10px;padding:10px 12px;border:1px solid rgba(142,161,171,.35);border-radius:12px;background:#fbfdfe}
      .ecva-version-meta{display:grid;gap:3px}
      .ecva-version-main{font:800 14px/1.2 "Alexandria",sans-serif;color:#223d49}
      .ecva-version-note{font:600 12px/1.25 "Alexandria",sans-serif;color:#597482}
      .ecva-version-restore{height:36px;padding:0 12px;border-radius:10px;border:1px solid rgba(108,132,145,.58);background:#e8f1f4;color:#27404c;font:800 12px "Alexandria",sans-serif;cursor:pointer}
      .ecva-version-empty{padding:14px;border:1px dashed rgba(137,158,169,.45);border-radius:12px;color:#5a7785;font:700 13px/1.3 "Alexandria",sans-serif}
    `;
    document.head.appendChild(style);

    const modal = document.createElement('div');
    modal.className = 'ecva-version-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <section class="ecva-version-dialog" role="dialog" aria-modal="true" aria-label="Version history">
        <header class="ecva-version-head">
          <h3 class="ecva-version-title">Version history</h3>
          <button type="button" class="ecva-version-close">Close</button>
        </header>
        <p class="ecva-version-sub">Each save creates a version. Restore any previous state instantly.</p>
        <div class="ecva-version-list"></div>
      </section>
    `;
    document.body.appendChild(modal);
    versionHistoryModal = modal;
    versionHistoryList = modal.querySelector('.ecva-version-list');
    versionHistoryCloseBtn = modal.querySelector('.ecva-version-close');

    if (versionHistoryCloseBtn) {
      versionHistoryCloseBtn.addEventListener('click', closeVersionHistoryModal);
    }
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeVersionHistoryModal();
    });
  }

  function ensureVersionHistoryButton() {
    if (!manageRoot) return;
    if (versionHistoryBtn) {
      updateVersionHistoryButtonVisibility();
      return;
    }
    const topbar = manageRoot.querySelector('.ecva-manage-topbar');
    if (!topbar) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ecva-manage-close';
    btn.textContent = 'Version history';
    btn.addEventListener('click', openVersionHistoryModal);
    const closeBtn = topbar.querySelector('#ecva-manage-close-btn');
    if (closeBtn && closeBtn.parentNode === topbar) {
      topbar.insertBefore(btn, closeBtn);
    } else {
      topbar.appendChild(btn);
    }
    versionHistoryBtn = btn;
    updateVersionHistoryButtonVisibility();
  }

  function closeVersionHistoryModal() {
    if (!versionHistoryModal) return;
    versionHistoryModal.classList.remove('is-visible');
    versionHistoryModal.setAttribute('aria-hidden', 'true');
  }

  function formatVersionDate(value) {
    const d = new Date(String(value || ''));
    if (!Number.isFinite(d.getTime())) return 'Unknown time';
    return d.toLocaleString();
  }

  async function fetchVersions(scopeCountryId) {
    const scopedCountry = getVersionScopeCountryId(scopeCountryId);
    if (!scopedCountry) return [];
    const scope = `country:${scopedCountry}`;
    const response = await fetch(
      `${EDITOR_VERSIONS_API}?limit=30&scope=${encodeURIComponent(scope)}`,
      { cache: 'no-store' },
    );
    if (!response.ok) throw new Error('versions_fetch_failed');
    const payload = await response.json();
    return Array.isArray(payload && payload.versions) ? payload.versions : [];
  }

  async function rollbackToVersion(versionId, scopeCountryId) {
    const scopedCountry = getVersionScopeCountryId(scopeCountryId);
    if (!scopedCountry) throw new Error('missing_scope');
    const response = await fetch(EDITOR_VERSIONS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ versionId, scope: `country:${scopedCountry}` }),
    });
    if (!response.ok) throw new Error('rollback_failed');
    const payload = await response.json();
    if (!payload || payload.ok === false || !payload.state || typeof payload.state !== 'object') {
      throw new Error('rollback_invalid_payload');
    }
    postToMap('ecva-editor-apply-state', { state: payload.state });
    if (selectedCountryId) {
      postToMap('ecva-request-country-modal-html', { countryId: selectedCountryId });
    }
    showToast('Version restored.');
  }

  function renderVersionHistory(items) {
    if (!versionHistoryList) return;
    const list = Array.isArray(items) ? items : [];
    if (!list.length) {
      versionHistoryList.innerHTML = '<div class="ecva-version-empty">No saved versions yet.</div>';
      return;
    }
    versionHistoryList.innerHTML = '';
    list.forEach((item) => {
      const row = document.createElement('article');
      row.className = 'ecva-version-item';
      const id = Number(item && item.versionId);
      row.innerHTML = `
        <div class="ecva-version-meta">
          <div class="ecva-version-main">Version #${Number.isInteger(id) ? id : 'n/a'}</div>
          <div class="ecva-version-note">${formatVersionDate(item && item.createdAt)} • ${String((item && item.note) || 'save')}</div>
        </div>
      `;
      const restore = document.createElement('button');
      restore.type = 'button';
      restore.className = 'ecva-version-restore';
      restore.textContent = 'Restore';
      restore.disabled = !canEditContent() || !Number.isInteger(id);
      restore.title = canEditContent() ? 'Restore this version' : 'Read-only mode';
      restore.addEventListener('click', async () => {
        if (!canEditContent() || !Number.isInteger(id)) return;
        restore.disabled = true;
        const prev = restore.textContent;
        restore.textContent = 'Restoring...';
        try {
          await rollbackToVersion(id);
          closeVersionHistoryModal();
        } catch (error) {
          showToast('Could not restore this version.', true);
          restore.disabled = false;
          restore.textContent = prev;
        }
      });
      row.appendChild(restore);
      versionHistoryList.appendChild(row);
    });
  }

  async function openVersionHistoryModal() {
    ensureVersionHistoryUi();
    if (!versionHistoryModal || !versionHistoryList) return;
    const scopeCountryId = getVersionScopeCountryId();
    if (!scopeCountryId) {
      showToast('Choose a country first.');
      return;
    }
    versionHistoryModal.classList.add('is-visible');
    versionHistoryModal.setAttribute('aria-hidden', 'false');
    versionHistoryList.innerHTML = '<div class="ecva-version-empty">Loading versions...</div>';
    try {
      const versions = await fetchVersions(scopeCountryId);
      renderVersionHistory(versions);
    } catch (error) {
      versionHistoryList.innerHTML = '<div class="ecva-version-empty">Could not load version history.</div>';
    }
    if (!versionHistoryWired) {
      versionHistoryWired = true;
    }
  }

  function setEditorMode(mode) {
    editorMode = mode === 'representative' ? 'representative' : 'entry';
    if (entryFieldsWrap) {
      entryFieldsWrap.classList.toggle('is-visible', editorMode === 'entry');
    }
    if (repFieldsWrap) {
      repFieldsWrap.classList.toggle('is-visible', editorMode === 'representative');
    }
    if (editorHeading) {
      editorHeading.textContent = editorMode === 'representative' ? 'Edit representative' : 'Edit entry';
    }
    if (editorRemoveBtn) {
      const canRemove = editorMode === 'representative' && editorTarget && editorTarget.action !== 'add';
      editorRemoveBtn.style.display = canRemove ? 'inline-flex' : 'none';
    }
  }

  function clearEditorFields() {
    if (editorTitle) editorTitle.value = '';
    if (editorSubtitle) editorSubtitle.value = '';
    if (editorDescription) editorDescription.value = '';
    if (editorRepName) editorRepName.value = '';
    if (editorRepTitle) editorRepTitle.value = '';
    if (editorRepOrganisation) editorRepOrganisation.value = '';
    if (editorRepImageFile) editorRepImageFile.value = '';
    representativeImagePath = '';
    representativeSourceImagePath = '';
    representativeCropSource = '';
    representativeCropFileName = 'representative-image.png';
    representativeImageNaturalWidth = 0;
    representativeImageNaturalHeight = 0;
    representativeCrop = null;
    representativeInitial = null;
    cropPointerState = null;
    if (editorCropImage) {
      editorCropImage.removeAttribute('src');
      editorCropImage.style.display = 'none';
      editorCropImage.style.transform = 'translate(-50%, -50%)';
      editorCropImage.style.width = '0px';
      editorCropImage.style.height = '0px';
    }
    if (editorCropFrame) {
      editorCropFrame.style.display = 'none';
      editorCropFrame.style.left = '0px';
      editorCropFrame.style.top = '0px';
      editorCropFrame.style.width = '0px';
      editorCropFrame.style.height = '0px';
    }
    if (editorCropStatus) {
      editorCropStatus.textContent = 'No new image selected.';
    }
  }

  function setCropStatus(message) {
    if (editorCropStatus) editorCropStatus.textContent = String(message || '');
  }

  function getPreviewRect() {
    if (!editorCropImage || !editorCropImage.parentElement) return null;
    const naturalW = representativeImageNaturalWidth || editorCropImage.naturalWidth || 0;
    const naturalH = representativeImageNaturalHeight || editorCropImage.naturalHeight || 0;
    if (!naturalW || !naturalH) return null;
    const pw = editorCropImage.parentElement.clientWidth;
    const ph = editorCropImage.parentElement.clientHeight;
    const scale = Math.min(pw / naturalW, ph / naturalH);
    const dw = naturalW * scale;
    const dh = naturalH * scale;
    const x = (pw - dw) / 2;
    const y = (ph - dh) / 2;
    return { naturalW, naturalH, pw, ph, scale, dw, dh, x, y };
  }

  function clampCropFrame(nextFrame) {
    const rect = getPreviewRect();
    if (!rect) return null;
    const ratio = 700 / 520;
    const minW = Math.max(120, rect.dw * 0.2);
    const maxW = Math.min(rect.dw, rect.dh * ratio);
    let w = Math.max(minW, Math.min(nextFrame.w, maxW));
    let h = w / ratio;
    if (h > rect.dh) {
      h = rect.dh;
      w = h * ratio;
    }
    const halfW = w / 2;
    const halfH = h / 2;
    const minCx = rect.x + halfW;
    const maxCx = rect.x + rect.dw - halfW;
    const minCy = rect.y + halfH;
    const maxCy = rect.y + rect.dh - halfH;
    const cx = Math.max(minCx, Math.min(nextFrame.cx, maxCx));
    const cy = Math.max(minCy, Math.min(nextFrame.cy, maxCy));
    return { cx, cy, w, h };
  }

  function applyCropFrameUI() {
    if (!editorCropFrame || !representativeCrop) return;
    const frame = clampCropFrame(representativeCrop);
    if (!frame) return;
    representativeCrop = frame;
    editorCropFrame.style.display = 'block';
    editorCropFrame.style.width = `${frame.w}px`;
    editorCropFrame.style.height = `${frame.h}px`;
    editorCropFrame.style.left = `${frame.cx - frame.w / 2}px`;
    editorCropFrame.style.top = `${frame.cy - frame.h / 2}px`;
  }

  function initializeCropFrame(cropNorm) {
    const rect = getPreviewRect();
    if (!rect) return;
    if (cropNorm && typeof cropNorm === 'object') {
      const cx = rect.x + ((Number(cropNorm.x) || 0) + (Number(cropNorm.w) || 0) / 2) * rect.dw;
      const cy = rect.y + ((Number(cropNorm.y) || 0) + (Number(cropNorm.h) || 0) / 2) * rect.dh;
      const w = Math.max(10, (Number(cropNorm.w) || 0.7) * rect.dw);
      representativeCrop = { cx, cy, w, h: w / (700 / 520) };
    } else {
      const maxW = Math.min(rect.dw, rect.dh * (700 / 520));
      const w = maxW * 0.72;
      representativeCrop = {
        cx: rect.x + rect.dw / 2,
        cy: rect.y + rect.dh / 2,
        w,
        h: w / (700 / 520),
      };
    }
    applyCropFrameUI();
  }

  function normalizeCropFrame() {
    const rect = getPreviewRect();
    const frame = clampCropFrame(representativeCrop);
    if (!rect || !frame) return null;
    const x = (frame.cx - frame.w / 2 - rect.x) / rect.dw;
    const y = (frame.cy - frame.h / 2 - rect.y) / rect.dh;
    const w = frame.w / rect.dw;
    const h = frame.h / rect.dh;
    return {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
      w: Math.max(0.02, Math.min(1, w)),
      h: Math.max(0.02, Math.min(1, h)),
    };
  }

  function setCropPreviewImage(src, cropNorm) {
    representativeCropSource = String(src || '').trim();
    representativeImageNaturalWidth = 0;
    representativeImageNaturalHeight = 0;
    if (!editorCropImage) return;
    if (!representativeCropSource) {
      editorCropImage.removeAttribute('src');
      editorCropImage.style.display = 'none';
      if (editorCropFrame) editorCropFrame.style.display = 'none';
      setCropStatus('No new image selected.');
      return;
    }
    editorCropImage.style.display = 'block';
    if (/^https?:\/\//i.test(representativeCropSource)) {
      editorCropImage.crossOrigin = 'anonymous';
    } else {
      editorCropImage.removeAttribute('crossorigin');
    }
    editorCropImage.src = representativeCropSource;
    editorCropImage.onload = () => {
      representativeImageNaturalWidth = editorCropImage.naturalWidth || 0;
      representativeImageNaturalHeight = editorCropImage.naturalHeight || 0;
      const rect = getPreviewRect();
      if (!rect) return;
      editorCropImage.style.width = `${rect.dw}px`;
      editorCropImage.style.height = `${rect.dh}px`;
      editorCropImage.style.transform = 'translate(-50%, -50%)';
      initializeCropFrame(cropNorm);
    };
    setCropStatus('Move and resize frame. Save will keep this framing.');
  }

  async function uploadRepresentativeImageData(dataUrl, filename) {
    const response = await fetch(UPLOAD_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: filename || 'representative-image.png',
        dataUrl: String(dataUrl || ''),
      }),
    });
    let payload = null;
    try {
      payload = await response.json();
    } catch (error) {
      payload = null;
    }
    if (!response.ok || (payload && payload.ok === false)) {
      const details = payload && payload.details ? String(payload.details) : '';
      const code = payload && payload.error ? String(payload.error) : `http_${response.status}`;
      throw new Error(details ? `${code}: ${details}` : code);
    }
    const imagePath = payload && payload.path ? String(payload.path) : '';
    if (!imagePath) throw new Error('upload_no_path');
    return imagePath;
  }

  function makeCroppedDataUrl() {
    return new Promise((resolve, reject) => {
      if (!representativeCropSource) {
        reject(new Error('no_source'));
        return;
      }
      const img = new Image();
      if (/^https?:\/\//i.test(representativeCropSource)) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        const width = 700;
        const height = 520;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('no_ctx'));
          return;
        }
        const crop = normalizeCropFrame();
        if (!crop) {
          reject(new Error('crop_not_ready'));
          return;
        }
        const sx = crop.x * img.naturalWidth;
        const sy = crop.y * img.naturalHeight;
        const sw = crop.w * img.naturalWidth;
        const sh = crop.h * img.naturalHeight;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
        try {
          resolve(canvas.toDataURL('image/png'));
        } catch (error) {
          reject(new Error('canvas_tainted'));
        }
      };
      img.onerror = () => reject(new Error('image_load_failed'));
      img.src = representativeCropSource;
    });
  }

  function cropEquals(a, b) {
    if (!a && !b) return true;
    if (!a || !b) return false;
    const eps = 0.0005;
    return (
      Math.abs(Number(a.x || 0) - Number(b.x || 0)) < eps &&
      Math.abs(Number(a.y || 0) - Number(b.y || 0)) < eps &&
      Math.abs(Number(a.w || 0) - Number(b.w || 0)) < eps &&
      Math.abs(Number(a.h || 0) - Number(b.h || 0)) < eps
    );
  }

  function renderCountryTabs() {
    if (!countryTabsHost) return;
    countryTabsHost.innerHTML = '';
    if (accessScope.mode === 'all') {
      const overviewBtn = document.createElement('button');
      overviewBtn.type = 'button';
      overviewBtn.className = 'ecva-manage-country-tab is-overview';
      overviewBtn.textContent = 'Overview';
      if (!selectedCountryId) {
        overviewBtn.classList.add('is-active');
      }
      overviewBtn.addEventListener('click', () => {
        selectedCountryId = '';
        renderCountryTabs();
        if (manageBody) {
          manageBody.innerHTML = '';
          renderGeneralAccessPanel();
        }
      });
      countryTabsHost.appendChild(overviewBtn);
    }

    activeCountries.forEach((country) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ecva-manage-country-tab';
      const countryCode = normalizeManageCountryCode(country && country.code);
      const allowed = isCountryAllowed(countryCode);
      if (countryCode === normalizeManageCountryCode(selectedCountryId) && allowed) {
        btn.classList.add('is-active');
      }
      const displayCode =
        String(countryCode || '').toUpperCase() === 'GB'
          ? 'UK'
          : String(countryCode || '').toUpperCase();
      btn.textContent = `${country.flag || ''} ${displayCode}`.trim();
      btn.title = country.name || country.code;
      if (!allowed) {
        btn.classList.add('is-locked');
        btn.disabled = true;
        btn.textContent = `🔒 ${btn.textContent}`;
      }
      btn.addEventListener('click', () => {
        selectCountry(countryCode);
      });
      countryTabsHost.appendChild(btn);
    });
    updateVersionHistoryButtonVisibility();
  }

  function selectCountry(countryId) {
    const nextCountryId = normalizeManageCountryCode(countryId);
    if (!nextCountryId || !isCountryAllowed(nextCountryId)) return;
    selectedCountryId = String(nextCountryId || '').trim();
    if (!selectedCountryId) return;
    renderCountryTabs();
    updateVersionHistoryButtonVisibility();
    if (manageBody) manageBody.innerHTML = '';
    postToMap('ecva-request-country-modal-html', { countryId: selectedCountryId });
    requestCountryInbox(selectedCountryId).catch(() => {});
  }

  function setCountryInbox(countryId, inbox) {
    const code = normalizeManageCountryCode(countryId);
    if (!code) return;
    const list = Array.isArray(inbox) ? inbox : [];
    inboxByCountry[code] = list
      .filter((item) => item && typeof item === 'object')
      .map((item) => ({
        id:
          String(item.id || '').trim() ||
          `${code}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        countryId: code,
        type:
          String(item.type || '').trim().toLowerCase() === 'representative'
            ? 'representative'
            : 'article',
        status: normalizeSubmissionStatus(item.status),
        pillarId: String(item.pillarId || '').trim().toLowerCase(),
        pillarLabel: String(item.pillarLabel || '').trim(),
        title: String(item.title || '').trim(),
        description: String(item.description || '').trim(),
        languageAvailability: String(item.languageAvailability || '').trim(),
        links: Array.isArray(item.links)
          ? item.links.map((next) => String(next || '').trim()).filter(Boolean)
          : [],
        attachments: Array.isArray(item.attachments)
          ? item.attachments
              .filter((next) => next && typeof next === 'object')
              .map((next) => ({
                name: String(next.name || '').trim(),
                url: String(next.url || '').trim(),
              }))
              .filter((next) => next.name || next.url)
          : [],
        submittedBy:
          item.submittedBy && typeof item.submittedBy === 'object'
            ? {
                name: String(item.submittedBy.name || '').trim(),
                email: String(item.submittedBy.email || '').trim(),
              }
            : { name: '', email: '' },
        representativeContact:
          item.representativeContact && typeof item.representativeContact === 'object'
            ? {
                name: String(item.representativeContact.name || '').trim(),
                role: String(item.representativeContact.role || '').trim(),
                email: String(item.representativeContact.email || '').trim(),
              }
            : { name: '', role: '', email: '' },
        createdAt: String(item.createdAt || '').trim(),
        updatedAt: String(item.updatedAt || '').trim(),
      }));
  }

  function getCountryInbox(countryId) {
    const code = normalizeManageCountryCode(countryId);
    if (!code) return [];
    if (!Array.isArray(inboxByCountry[code])) {
      inboxByCountry[code] = [];
    }
    return inboxByCountry[code];
  }

  function requestCountryInbox(countryId) {
    const code = normalizeManageCountryCode(countryId);
    if (!code) return Promise.resolve([]);
    return new Promise((resolve, reject) => {
      if (!mapFrame.contentWindow) {
        reject(new Error('map_not_ready'));
        return;
      }
      const requestId = `inbox-${Date.now()}-${inboxRequestCounter += 1}`;
      const timeout = window.setTimeout(() => {
        pendingInboxRequests.delete(requestId);
        reject(new Error('inbox_timeout'));
      }, 2600);
      pendingInboxRequests.set(requestId, { resolve, reject, timeout, countryId: code });
      postToMap('ecva-request-country-inbox', { countryId: code, requestId });
    });
  }

  function updateSubmissionStatus(countryId, submissionId, status) {
    const code = normalizeManageCountryCode(countryId);
    const nextStatus = normalizeSubmissionStatus(status);
    if (!code || !submissionId) return;
    postToMap('ecva-editor-update-submission-status', {
      countryId: code,
      submissionId: String(submissionId),
      status: nextStatus,
    });
  }

  function wireManageEntryExpanders(scope) {
    const entries = scope.querySelectorAll('.country-modal-entry');
    entries.forEach((entry) => {
      const btn = entry.querySelector('.country-modal-entry-readmore-btn');
      const panel = entry.querySelector('.country-modal-entry-expand');
      if (!btn || !panel || btn.dataset.wired === '1') return;
      btn.dataset.wired = '1';
      panel.hidden = true;
      panel.style.height = '0px';
      btn.addEventListener('click', () => {
        const isOpen = entry.classList.contains('is-open');
        if (isOpen) {
          const current = panel.scrollHeight;
          panel.style.height = `${current}px`;
          requestAnimationFrame(() => {
            entry.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
            btn.textContent = 'Read More';
            panel.style.height = '0px';
          });
          window.setTimeout(() => {
            panel.hidden = true;
          }, 320);
          return;
        }

        panel.hidden = false;
        panel.style.height = '0px';
        requestAnimationFrame(() => {
          const target = panel.scrollHeight;
          entry.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          btn.textContent = 'Show Less';
          panel.style.height = `${target}px`;
        });
        window.setTimeout(() => {
          if (entry.classList.contains('is-open')) {
            panel.style.height = 'auto';
          }
        }, 340);
      });
    });
  }

  function wireManageSeeMore(scope) {
    const buttons = scope.querySelectorAll('.country-modal-see-more-btn[data-pillar-target]');
    buttons.forEach((btn) => {
      if (btn.dataset.wired === '1') return;
      btn.dataset.wired = '1';
      btn.addEventListener('click', () => {
        const pillarId = btn.getAttribute('data-pillar-target');
        if (!pillarId || !manageBody) return;
        const target = manageBody.querySelector(`[data-pillar-card="${pillarId}"]`);
        if (!target) return;
        const targetRect = target.getBoundingClientRect();
        const top = window.scrollY + (targetRect.top - 14);
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  function wireManageOutlookCarousels(scope) {
    if (!scope) return;
    const carousels = scope.querySelectorAll('[data-rep-carousel]');
    carousels.forEach((carousel) => {
      if (carousel.dataset.editorWired === '1') return;
      carousel.dataset.editorWired = '1';

      const slides = Array.from(carousel.querySelectorAll('.country-modal-rep-slide'));
      const prevBtn = carousel.querySelector('.country-modal-rep-nav.is-prev');
      const nextBtn = carousel.querySelector('.country-modal-rep-nav.is-next');
      const dotsHost = carousel
        .closest('.country-modal-rep-carousel-wrap')
        ?.querySelector('[data-rep-dots]');
      if (!slides.length) return;

      let index = 0;
      const len = slides.length;
      const hasMultiple = len > 1;
      let dots = [];

      if (prevBtn) {
        prevBtn.style.display = hasMultiple ? '' : 'none';
        prevBtn.disabled = !hasMultiple;
        prevBtn.setAttribute('aria-hidden', hasMultiple ? 'false' : 'true');
      }
      if (nextBtn) {
        nextBtn.style.display = hasMultiple ? '' : 'none';
        nextBtn.disabled = !hasMultiple;
        nextBtn.setAttribute('aria-hidden', hasMultiple ? 'false' : 'true');
      }
      if (dotsHost) {
        dotsHost.style.display = hasMultiple ? 'inline-flex' : 'none';
      }

      const getCircularOffset = (i, active, total) => {
        let diff = i - active;
        if (diff > total / 2) diff -= total;
        if (diff < -total / 2) diff += total;
        return diff;
      };

      const apply = () => {
        slides.forEach((slide, i) => {
          const offset = getCircularOffset(i, index, len);
          slide.classList.remove('is-hidden');
          slide.removeAttribute('data-offset');
          if (Math.abs(offset) > 2) {
            slide.classList.add('is-hidden');
            return;
          }
          slide.setAttribute('data-offset', String(offset));
        });
        dots.forEach((dot, i) => {
          dot.classList.toggle('is-active', i === index);
          dot.setAttribute('aria-current', i === index ? 'true' : 'false');
        });
      };

      if (dotsHost) {
        dotsHost.innerHTML = '';
        dots = slides.map((_, i) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'country-modal-rep-dot';
          dot.setAttribute('aria-label', `Go to representative ${i + 1}`);
          dot.addEventListener('click', () => {
            index = i;
            apply();
          });
          dotsHost.appendChild(dot);
          return dot;
        });
      }

      if (prevBtn && hasMultiple) {
        prevBtn.addEventListener('click', () => {
          index = (index - 1 + len) % len;
          apply();
        });
      }
      if (nextBtn && hasMultiple) {
        nextBtn.addEventListener('click', () => {
          index = (index + 1) % len;
          apply();
        });
      }

      slides.forEach((slide, i) => {
        slide.addEventListener('click', () => {
          if (!hasMultiple) return;
          if (i === index) return;
          index = i;
          apply();
        });
      });

      apply();
    });
  }

  function openEntryEditor(entryEl) {
    const pillarSection = entryEl.closest('[data-pillar-card]');
    const pillarId =
      (entryEl.getAttribute('data-entry-pillar') ||
        (pillarSection ? pillarSection.getAttribute('data-pillar-card') : '') ||
        '')
        .trim();
    const countryId = (entryEl.getAttribute('data-entry-country') || selectedCountryId || '').trim();
    const entryIndex = Number(entryEl.getAttribute('data-entry-index'));

    if (!pillarId || !countryId || !Number.isInteger(entryIndex) || entryIndex < 0) {
      showToast('This entry cannot be edited yet.', true);
      return;
    }

    const title = (entryEl.querySelector('.country-modal-entry-top h5') || {}).textContent || '';
    const subtitle = (entryEl.querySelector('.country-modal-entry-subtitle') || {}).textContent || '';
    const description = (entryEl.querySelector('.country-modal-entry-description') || {}).textContent || '';

    clearEditorFields();
    if (editorTitle) editorTitle.value = title.trim();
    if (editorSubtitle) editorSubtitle.value = subtitle.trim();
    if (editorDescription) editorDescription.value = description.trim();

    editorTarget = { type: 'entry', countryId, pillarId, entryIndex };
    setEditorMode('entry');
    openEditorModal();
  }

  function openRepresentativeEditor(repEl, countryId, repIndex) {
    const validCountryId = String(countryId || selectedCountryId || '').trim();
    const validIndex = Number(repIndex);
    if (!validCountryId || !Number.isInteger(validIndex) || validIndex < 0) {
      showToast('This representative cannot be edited yet.', true);
      return;
    }

    const name = (repEl.querySelector('.country-modal-rep-meta h5') || {}).textContent || '';
    const title = (repEl.querySelector('.country-modal-representative-title') || {}).textContent || '';
    const organisation = (repEl.querySelector('.country-modal-representative-org') || {}).textContent || '';
    const imgEl = repEl.querySelector('.country-modal-rep-media img');
    const image = imgEl ? String(imgEl.getAttribute('src') || '').trim() : '';
    const sourceImage = String(repEl.getAttribute('data-source-image') || image).trim();
    const cropXRaw = String(repEl.getAttribute('data-crop-x') || '').trim();
    const cropYRaw = String(repEl.getAttribute('data-crop-y') || '').trim();
    const cropWRaw = String(repEl.getAttribute('data-crop-w') || '').trim();
    const cropHRaw = String(repEl.getAttribute('data-crop-h') || '').trim();
    const crop = {
      x: cropXRaw === '' ? NaN : Number(cropXRaw),
      y: cropYRaw === '' ? NaN : Number(cropYRaw),
      w: cropWRaw === '' ? NaN : Number(cropWRaw),
      h: cropHRaw === '' ? NaN : Number(cropHRaw),
    };
    const hasCrop = [crop.x, crop.y, crop.w, crop.h].every((value) => Number.isFinite(value));

    clearEditorFields();
    if (editorRepName) editorRepName.value = name.trim();
    if (editorRepTitle) editorRepTitle.value = title.trim();
    if (editorRepOrganisation) editorRepOrganisation.value = organisation.trim();
    representativeImagePath = image;
    representativeSourceImagePath = sourceImage;
    setCropPreviewImage(sourceImage, hasCrop ? crop : null);
    setCropStatus('Current image loaded. Move or resize frame, then Save.');
    representativeInitial = {
      name: name.trim(),
      title: title.trim(),
      organisation: organisation.trim(),
      image,
      sourceImage,
      crop: hasCrop ? crop : null,
    };

    editorTarget = {
      type: 'representative',
      action: 'update',
      countryId: validCountryId,
      representativeIndex: validIndex,
    };
    setEditorMode('representative');
    openEditorModal();
  }

  function openAddRepresentativeEditor(countryId) {
    const validCountryId = String(countryId || selectedCountryId || '').trim();
    if (!validCountryId) return;
    clearEditorFields();
    setCropPreviewImage('');
    editorTarget = {
      type: 'representative',
      action: 'add',
      countryId: validCountryId,
    };
    setEditorMode('representative');
    openEditorModal();
  }

  function addEditButtons(scope) {
    const entries = scope.querySelectorAll('.country-modal-entry');
    entries.forEach((entryEl) => {
      if (entryEl.querySelector('.ecva-entry-edit-btn')) return;
      const top = entryEl.querySelector('.country-modal-entry-top');
      if (!top) return;
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'ecva-entry-edit-btn';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => {
        openEntryEditor(entryEl);
      });
      top.appendChild(editBtn);
    });
  }

  function addRepresentativeControls(scope) {
    const carouselWrap = scope.querySelector('.country-modal-rep-carousel-wrap');
    if (!carouselWrap) return;
    const countryId =
      selectedCountryId ||
      String(scope.querySelector('.country-modal-hero-name')?.textContent || '').trim();

    const slides = carouselWrap.querySelectorAll('.country-modal-rep-slide');
    slides.forEach((slideEl) => {
      if (slideEl.classList.contains('is-empty')) return;
      if (slideEl.querySelector('.ecva-rep-edit-btn')) return;
      if (window.getComputedStyle(slideEl).position === 'static') {
        slideEl.style.position = 'relative';
      }
      const repIndex = Number(slideEl.getAttribute('data-slide-index'));
      if (!Number.isInteger(repIndex) || repIndex < 0) return;
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'ecva-entry-edit-btn ecva-rep-edit-btn';
      editBtn.textContent = 'Edit';
      editBtn.style.position = 'absolute';
      editBtn.style.top = '10px';
      editBtn.style.right = '10px';
      editBtn.style.zIndex = '4';
      editBtn.addEventListener('click', () => {
        openRepresentativeEditor(slideEl, countryId, repIndex);
      });
      slideEl.appendChild(editBtn);
    });

    const footer = carouselWrap.querySelector('.country-modal-rep-footer');
    if (!footer || footer.querySelector('.ecva-rep-add-btn')) return;
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'ecva-admin-btn secondary ecva-rep-add-btn';
    addBtn.style.height = '44px';
    addBtn.style.fontSize = '14px';
    addBtn.textContent = 'Add Representative';
    addBtn.addEventListener('click', () => {
      openAddRepresentativeEditor(countryId);
    });
    footer.appendChild(addBtn);
  }

  function formatSubmissionDate(value) {
    const parsed = new Date(String(value || ''));
    if (!Number.isFinite(parsed.getTime())) return 'Just now';
    return parsed.toLocaleString();
  }

  function getSubmissionTypeLabel(item) {
    const mode = String(item && item.type ? item.type : '').trim().toLowerCase();
    return mode === 'representative' ? 'Representative' : 'Article';
  }

  function getSubmissionPillarLabel(item) {
    const explicit = String(item && item.pillarLabel ? item.pillarLabel : '').trim();
    if (explicit) return explicit;
    const pillarId = String(item && item.pillarId ? item.pillarId : '').trim().toLowerCase();
    if (!pillarId) return 'General';
    if (pillarId === 'organisations') return 'Organisations';
    if (pillarId === 'resources') return 'Resources';
    if (pillarId === 'events') return 'Events';
    if (pillarId === 'research') return 'Research';
    if (pillarId === 'government') return 'Government';
    if (pillarId === 'representatives') return 'Representatives';
    return pillarId;
  }

  function buildSubmissionCardHtml(item, currentStatus) {
    const title = String(item && item.title ? item.title : '').trim() || 'Untitled suggestion';
    const description = String(item && item.description ? item.description : '').trim();
    const submittedBy =
      item && item.submittedBy && typeof item.submittedBy === 'object'
        ? item.submittedBy
        : { name: '', email: '' };
    const links = Array.isArray(item && item.links) ? item.links.filter(Boolean) : [];
    const attachments = Array.isArray(item && item.attachments)
      ? item.attachments.filter((next) => next && (next.name || next.url))
      : [];
    const contact =
      item && item.representativeContact && typeof item.representativeContact === 'object'
        ? item.representativeContact
        : { name: '', role: '', email: '' };
    const actions = [];
    if (currentStatus === 'new') {
      actions.push('<button type="button" class="ecva-inbox-action" data-action-status="in_progress">Mark in progress</button>');
      actions.push('<button type="button" class="ecva-inbox-action is-reject" data-action-status="rejected">Reject</button>');
    } else if (currentStatus === 'in_progress') {
      actions.push('<button type="button" class="ecva-inbox-action" data-action-status="archived">Archive</button>');
      actions.push('<button type="button" class="ecva-inbox-action is-reject" data-action-status="rejected">Reject</button>');
    } else if (currentStatus === 'rejected') {
      actions.push('<button type="button" class="ecva-inbox-action" data-action-status="in_progress">Re-open</button>');
      actions.push('<button type="button" class="ecva-inbox-action" data-action-status="archived">Archive</button>');
    } else if (currentStatus === 'archived') {
      actions.push('<button type="button" class="ecva-inbox-action" data-action-status="in_progress">Restore</button>');
    }
    return `
      <article class="ecva-inbox-card" data-submission-id="${escapeHtml(item.id)}">
        <header class="ecva-inbox-card-head">
          <span class="ecva-inbox-type">${escapeHtml(getSubmissionTypeLabel(item))}</span>
          <span class="ecva-inbox-pillar">${escapeHtml(getSubmissionPillarLabel(item))}</span>
        </header>
        <h5>${escapeHtml(title)}</h5>
        ${description ? `<p class="ecva-inbox-description">${escapeHtml(description)}</p>` : ''}
        <dl class="ecva-inbox-meta">
          <div><dt>Submitted by</dt><dd>${escapeHtml(submittedBy.name || '-')}</dd></div>
          <div><dt>Email</dt><dd>${escapeHtml(submittedBy.email || '-')}</dd></div>
          <div><dt>Languages</dt><dd>${escapeHtml(item.languageAvailability || '-')}</dd></div>
          <div><dt>Received</dt><dd>${escapeHtml(formatSubmissionDate(item.createdAt))}</dd></div>
        </dl>
        ${
          links.length
            ? `<div class="ecva-inbox-links">${links
                .slice(0, 3)
                .map((url) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>`)
                .join('')}</div>`
            : ''
        }
        ${
          attachments.length
            ? `<div class="ecva-inbox-attachments">${attachments
                .slice(0, 4)
                .map((item) => {
                  const label = escapeHtml(item.name || item.url || 'Attachment');
                  const href = escapeHtml(item.url || '#');
                  if (!item.url) return `<span>${label}</span>`;
                  return `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
                })
                .join('')}</div>`
            : ''
        }
        ${
          contact.name || contact.role || contact.email
            ? `<p class="ecva-inbox-contact"><strong>Representative:</strong> ${escapeHtml(
                [contact.name, contact.role, contact.email].filter(Boolean).join(' • ') || '-',
              )}</p>`
            : ''
        }
        ${actions.length ? `<div class="ecva-inbox-actions">${actions.join('')}</div>` : ''}
      </article>
    `;
  }

  function buildInboxColumnHtml(title, status, items, emptyText) {
    const cards = items
      .map((item) => buildSubmissionCardHtml(item, status))
      .join('');
    return `
      <section class="ecva-inbox-column" data-inbox-column="${status}">
        <header>
          <h5>${escapeHtml(title)}</h5>
          <span>${items.length}</span>
        </header>
        <div class="ecva-inbox-column-list">
          ${cards || `<p class="ecva-inbox-empty">${escapeHtml(emptyText)}</p>`}
        </div>
      </section>
    `;
  }

  function wireCountryFlowActions(panel, countryId) {
    if (!panel) return;
    panel.querySelectorAll('.ecva-inbox-action[data-action-status]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.ecva-inbox-card[data-submission-id]');
        const submissionId = card ? card.getAttribute('data-submission-id') : '';
        const status = btn.getAttribute('data-action-status');
        if (!submissionId || !status) return;
        updateSubmissionStatus(countryId, submissionId, status);
      });
    });
    const archiveToggle = panel.querySelector('.ecva-inbox-archive-toggle');
    const archiveBody = panel.querySelector('.ecva-inbox-archive-body');
    if (archiveToggle && archiveBody) {
      archiveToggle.addEventListener('click', () => {
        const expanded = archiveToggle.getAttribute('aria-expanded') === 'true';
        archiveToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        archiveBody.hidden = expanded;
      });
    }
  }

  function renderCountryFlowPanel(scope) {
    if (!scope || !selectedCountryId) return;
    const countryId = normalizeManageCountryCode(selectedCountryId);
    if (!countryId) return;
    const old = scope.querySelector('.ecva-country-flow-panel');
    if (old) old.remove();
    const inbox = getCountryInbox(countryId);
    const next = inbox.filter((item) => normalizeSubmissionStatus(item.status) === 'new');
    const inProgress = inbox.filter(
      (item) => normalizeSubmissionStatus(item.status) === 'in_progress',
    );
    const rejected = inbox.filter(
      (item) => normalizeSubmissionStatus(item.status) === 'rejected',
    );
    const archived = inbox.filter(
      (item) => normalizeSubmissionStatus(item.status) === 'archived',
    );
    const panel = document.createElement('section');
    panel.className = 'ecva-country-flow-panel';
    panel.innerHTML = `
      <header class="ecva-country-flow-head">
        <div>
          <p class="ecva-country-flow-kicker">Information flow</p>
          <h4>Country submissions inbox</h4>
        </div>
        <div class="ecva-country-flow-summary">
          <span class="is-new">New ${next.length}</span>
          <span class="is-progress">In progress ${inProgress.length}</span>
          <span class="is-rejected">Rejected ${rejected.length}</span>
          <span class="is-archived">Archive ${archived.length}</span>
        </div>
      </header>
      <div class="ecva-country-flow-grid">
        ${buildInboxColumnHtml('New', 'new', next, 'No new submissions yet.')}
        ${buildInboxColumnHtml(
          'In progress',
          'in_progress',
          inProgress,
          'Nothing currently in review.',
        )}
        ${buildInboxColumnHtml('Rejected', 'rejected', rejected, 'No rejected submissions.')}
      </div>
      <section class="ecva-inbox-archive">
        <button type="button" class="ecva-inbox-archive-toggle" aria-expanded="false">
          Archive (${archived.length})
        </button>
        <div class="ecva-inbox-archive-body" hidden>
          ${
            archived.length
              ? archived.map((item) => buildSubmissionCardHtml(item, 'archived')).join('')
              : '<p class="ecva-inbox-empty">No archived submissions.</p>'
          }
        </div>
      </section>
    `;
    const header = scope.querySelector('.country-modal-header');
    if (header && header.parentNode === scope) {
      scope.insertBefore(panel, header);
    } else {
      scope.prepend(panel);
    }
    wireCountryFlowActions(panel, countryId);
  }

  function enhanceManageContent() {
    if (!manageBody) return;
    renderCountryFlowPanel(manageBody);
    wireManageOutlookCarousels(manageBody);
    wireManageEntryExpanders(manageBody);
    wireManageSeeMore(manageBody);
    manageBody.querySelectorAll('.country-modal-rep-recommend-btn').forEach((btn) => {
      btn.style.display = 'none';
    });
    if (canEditContent()) {
      addEditButtons(manageBody);
      addRepresentativeControls(manageBody);
    }
  }

  async function persistEditorState(state, scopeCountryId) {
    if (!canEditContent()) return;
    if (window.__ecvaLanguageSwitching) return;
    const scopeCountry = getVersionScopeCountryId(scopeCountryId);
    try {
      const body = { state };
      if (scopeCountry) {
        body.scope = `country:${scopeCountry}`;
      }
      const response = await fetch(EDITOR_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('persist failed');
      const payload = await response.json().catch(() => null);
      const store = payload && payload.store ? String(payload.store) : '';
      if (store && store !== 'postgres') {
        showToast('Saved on temporary storage only. Check Postgres.', true);
        return;
      }
      showToast('Saved permanently.');
    } catch (error) {
      showToast('Could not save permanently.', true);
    }
  }

  function schedulePersist(state, scopeCountryId) {
    if (!state || typeof state !== 'object') return;
    if (persistTimer) {
      window.clearTimeout(persistTimer);
    }
    persistTimer = window.setTimeout(() => {
      persistEditorState(state, scopeCountryId);
      persistTimer = null;
    }, 160);
  }

  async function loadPersistedEditorState() {
    try {
      const response = await fetch(EDITOR_API, { cache: 'no-store' });
      if (!response.ok) return;
      const payload = await response.json();
      if (payload && payload.state && typeof payload.state === 'object') {
        postToMap('ecva-editor-apply-state', { state: payload.state });
      }
    } catch (error) {
      // Run without persistence API if static server is used.
    }
  }

  window.addEventListener('message', (event) => {
    if (!event || !event.data || typeof event.data !== 'object') return;
    const type = String(event.data.type || '');
    const payload = event.data.payload || {};

    if (type === 'ecva-open-app-hub') {
      openHub();
      return;
    }

    if (type === 'ecva-active-countries') {
      activeCountries = Array.isArray(payload.countries) ? payload.countries : [];
      countryCatalog = Array.isArray(payload.allCountries) ? payload.allCountries : [];
      if (!countryCatalog.length) {
        countryCatalog = activeCountries.map((country) => ({
          ...country,
          statusValue: normalizeStatusValue(country && country.status),
        }));
      }
      rebuildCountryAccessMaps();
      if (accessScope.mode === 'country') {
        selectedCountryId =
          normalizeManageCountryCode(accessScope.countryId) || getFirstAllowedCountryId() || '';
      }
      ensureSelectedCountryIsAllowed();
      renderCountryTabs();
      resolveActiveCountriesWaiters();
      if (selectedCountryId) {
        selectCountry(selectedCountryId);
      } else if (manageBody) {
        manageBody.innerHTML = '';
        renderGeneralAccessPanel();
      }
      return;
    }

    if (type === 'ecva-country-inbox') {
      const countryId = normalizeManageCountryCode(payload.countryId);
      const requestId = String(payload.requestId || '').trim();
      if (requestId && pendingInboxRequests.has(requestId)) {
        const pending = pendingInboxRequests.get(requestId);
        pendingInboxRequests.delete(requestId);
        if (pending && pending.timeout) window.clearTimeout(pending.timeout);
        setCountryInbox(countryId, payload.inbox);
        pending.resolve(getCountryInbox(countryId));
      } else {
        setCountryInbox(countryId, payload.inbox);
      }
      if (countryId && normalizeManageCountryCode(selectedCountryId) === countryId && manageBody) {
        renderCountryFlowPanel(manageBody);
      }
      return;
    }

    if (type === 'ecva-country-inbox-updated') {
      const countryId = normalizeManageCountryCode(payload.countryId);
      setCountryInbox(countryId, payload.inbox);
      if (countryId && normalizeManageCountryCode(selectedCountryId) === countryId && manageBody) {
        renderCountryFlowPanel(manageBody);
      }
      return;
    }

    if (type === 'ecva-country-modal-html') {
      const countryId = String(payload.countryId || '').trim();
      if (!countryId || countryId !== selectedCountryId || !manageBody) return;
      manageBody.innerHTML = payload.html || '';
      renderGeneralAccessPanel();
      enhanceManageContent();
      return;
    }

    if (type === 'ecva-editor-entry-updated' || type === 'ecva-editor-representatives-updated') {
      const countryId = String(payload.countryId || '').trim();
      if (countryId && countryId === selectedCountryId && manageBody) {
        manageBody.innerHTML = payload.html || '';
        renderGeneralAccessPanel();
        enhanceManageContent();
      }
      showToast(type === 'ecva-editor-entry-updated' ? 'Text updated in the app.' : 'Representative updated in the app.');
      return;
    }

    if (type === 'ecva-editor-state-changed') {
      schedulePersist(payload.state, payload.countryId || '');
    }
  });

  if (manageBtn) {
    manageBtn.addEventListener('click', launchManageFromAccessCode);
  }

  if (accessCodeInput) {
    accessCodeInput.addEventListener('input', () => {
      clearAccessCodeError();
    });
    accessCodeInput.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      launchManageFromAccessCode();
    });
  }

  if (websiteBtn) {
    websiteBtn.addEventListener('click', () => {
      window.open(WEBSITE_URL, '_blank', 'noopener,noreferrer');
    });
  }

  if (closeHubBtn) {
    closeHubBtn.addEventListener('click', closeHub);
  }

  if (mobileLegendLogo) {
    mobileLegendLogo.style.cursor = 'pointer';
    mobileLegendLogo.addEventListener('click', openHub);
  }

  if (adminHub) {
    adminHub.addEventListener('click', (event) => {
      if (event.target === adminHub) {
        closeHub();
      }
    });
  }

  if (closeManageBtn) {
    closeManageBtn.addEventListener('click', closeManage);
  }

  if (manageRoot) {
    manageRoot.addEventListener('click', (event) => {
      if (event.target === manageRoot) {
        closeManage();
      }
    });
  }

  if (editorCancelBtn) {
    editorCancelBtn.addEventListener('click', closeEditorModal);
  }

  if (editorModal) {
    editorModal.addEventListener('click', (event) => {
      if (event.target === editorModal) {
        closeEditorModal();
      }
    });
  }

  if (editorForm) {
    editorForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!editorTarget) return;
      const target = { ...editorTarget };
      if (editorMode === 'entry' && target.type === 'entry') {
        postToMap('ecva-editor-update-entry', {
          countryId: target.countryId,
          pillarId: target.pillarId,
          entryIndex: target.entryIndex,
          fields: {
            title: editorTitle ? editorTitle.value : '',
            subtitle: editorSubtitle ? editorSubtitle.value : '',
            description: editorDescription ? editorDescription.value : '',
            summary: editorDescription ? editorDescription.value : '',
          },
        });
        closeEditorModal();
        return;
      }

      if (editorMode === 'representative' && target.type === 'representative') {
        let image = representativeImagePath;
        let sourceImage = representativeSourceImagePath || representativeCropSource || '';
        const cropNow = normalizeCropFrame();
        const cropChanged = !cropEquals(cropNow, representativeInitial && representativeInitial.crop);
        const hasNewLocalImage = representativeCropSource.startsWith('data:image/');
        const shouldRegenerateImage = hasNewLocalImage || cropChanged;
        if (hasNewLocalImage) {
          try {
            sourceImage = await uploadRepresentativeImageData(
              representativeCropSource,
              representativeCropFileName,
            );
            image = await uploadRepresentativeImageData(
              await makeCroppedDataUrl(),
              representativeCropFileName,
            );
          } catch (error) {
            const reason = error && error.message ? ` (${error.message})` : '';
            showToast(`Image upload failed${reason}`, true);
            return;
          }
        } else if (shouldRegenerateImage && sourceImage && representativeCropSource) {
          try {
            image = await uploadRepresentativeImageData(
              await makeCroppedDataUrl(),
              representativeCropFileName,
            );
          } catch (error) {
            const reason = error && error.message ? String(error.message) : '';
            if (reason.includes('canvas_tainted')) {
              showToast('Image crop blocked by browser security. Re-upload image and save again.', true);
            } else {
              showToast(`Image crop failed${reason ? ` (${reason})` : ''}.`, true);
            }
            return;
          }
        }

        const representative = {
          name: editorRepName ? editorRepName.value : '',
          title: editorRepTitle ? editorRepTitle.value : '',
          organisation: editorRepOrganisation ? editorRepOrganisation.value : '',
          image,
          sourceImage,
          crop: cropNow,
        };

        if (target.action === 'add') {
          postToMap('ecva-editor-add-representative', {
            countryId: target.countryId,
            representative,
          });
        } else {
          postToMap('ecva-editor-update-representative', {
            countryId: target.countryId,
            representativeIndex: target.representativeIndex,
            representative,
          });
        }
      }
      closeEditorModal();
    });
  }

  if (editorRemoveBtn) {
    editorRemoveBtn.addEventListener('click', () => {
      if (!editorTarget || editorMode !== 'representative' || editorTarget.type !== 'representative') return;
      if (!Number.isInteger(editorTarget.representativeIndex)) return;
      postToMap('ecva-editor-remove-representative', {
        countryId: editorTarget.countryId,
        representativeIndex: editorTarget.representativeIndex,
      });
      closeEditorModal();
    });
  }

  if (editorRepImageFile) {
    editorRepImageFile.addEventListener('change', () => {
      const file = editorRepImageFile.files && editorRepImageFile.files[0];
      if (!file) return;
      representativeCropFileName = file.name || 'representative-image.png';
      const reader = new FileReader();
      reader.onerror = () => {
        showToast('Could not read image file.', true);
      };
      reader.onload = () => {
        representativeSourceImagePath = '';
        setCropPreviewImage(String(reader.result || ''), null);
      };
      reader.readAsDataURL(file);
    });
  }

  if (editorCropFrame) {
    editorCropFrame.addEventListener('pointerdown', (event) => {
      if (!(event.target instanceof Element)) return;
      const isHandle = event.target === editorCropHandle;
      if (!representativeCrop) return;
      cropPointerState = {
        mode: isHandle ? 'resize' : 'move',
        startX: event.clientX,
        startY: event.clientY,
        startFrame: { ...representativeCrop },
      };
      editorCropFrame.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    editorCropFrame.addEventListener('pointermove', (event) => {
      if (!cropPointerState || !representativeCrop) return;
      const dx = event.clientX - cropPointerState.startX;
      const dy = event.clientY - cropPointerState.startY;
      if (cropPointerState.mode === 'move') {
        representativeCrop = clampCropFrame({
          ...cropPointerState.startFrame,
          cx: cropPointerState.startFrame.cx + dx,
          cy: cropPointerState.startFrame.cy + dy,
        });
      } else {
        const ratio = 700 / 520;
        const start = cropPointerState.startFrame;
        // Uniform resize from bottom-right handle.
        // Using deltas keeps it responsive both when shrinking and expanding.
        const delta = Math.max(dx, dy * ratio);
        const nextW = Math.max(40, start.w + delta);
        representativeCrop = clampCropFrame({
          cx: start.cx + (nextW - start.w) / 2,
          cy: start.cy + ((nextW / ratio) - start.h) / 2,
          w: nextW,
        });
      }
      applyCropFrameUI();
      event.preventDefault();
    });
    const endPointer = (event) => {
      if (cropPointerState && editorCropFrame.hasPointerCapture(event.pointerId)) {
        editorCropFrame.releasePointerCapture(event.pointerId);
      }
      cropPointerState = null;
    };
    editorCropFrame.addEventListener('pointerup', endPointer);
    editorCropFrame.addEventListener('pointercancel', endPointer);
  }

  window.addEventListener('resize', () => {
    if (!representativeCropSource) return;
    const cropNorm = normalizeCropFrame();
    setCropPreviewImage(representativeCropSource, cropNorm);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (editorModal && editorModal.classList.contains('is-visible')) {
      closeEditorModal();
      return;
    }
    if (manageRoot && manageRoot.classList.contains('is-visible')) {
      closeManage();
      return;
    }
    if (adminHub && adminHub.classList.contains('is-visible')) {
      closeHub();
    }
  });

  mapFrame.addEventListener('load', () => {
    loadPersistedEditorState();
  });

  if (mapFrame.contentWindow) {
    loadPersistedEditorState();
  }
})();
