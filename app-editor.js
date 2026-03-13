(function () {
  const mapFrame = document.querySelector('.desktop-map iframe');
  if (!mapFrame) return;

  const adminHub = document.getElementById('ecva-admin-hub');
  const manageRoot = document.getElementById('ecva-manage-root');
  const manageBody = document.getElementById('ecva-manage-body');
  const countryTabsHost = document.getElementById('ecva-manage-country-tabs');
  const manageBtn = document.getElementById('ecva-manage-app-btn');
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
  const UPLOAD_API = '/api/upload-image';

  let activeCountries = [];
  let selectedCountryId = '';
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

  function postToMap(type, payload) {
    if (!mapFrame.contentWindow) return;
    mapFrame.contentWindow.postMessage({ type, payload: payload || {} }, '*');
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
    manageRoot.classList.add('is-visible');
    manageRoot.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    postToMap('ecva-request-active-countries');
  }

  function closeManage() {
    if (!manageRoot) return;
    closeEditorModal();
    manageRoot.classList.remove('is-visible');
    manageRoot.setAttribute('aria-hidden', 'true');
    if (manageBody) manageBody.innerHTML = '';
    document.body.style.overflow = '';
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
    activeCountries.forEach((country) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ecva-manage-country-tab';
      if (country.code === selectedCountryId) {
        btn.classList.add('is-active');
      }
      btn.textContent = `${country.flag || ''} ${country.code}`.trim();
      btn.title = country.name || country.code;
      btn.addEventListener('click', () => {
        selectCountry(country.code);
      });
      countryTabsHost.appendChild(btn);
    });
  }

  function selectCountry(countryId) {
    selectedCountryId = String(countryId || '').trim();
    if (!selectedCountryId) return;
    renderCountryTabs();
    postToMap('ecva-request-country-modal-html', { countryId: selectedCountryId });
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
        const hostRect = manageBody.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const top = manageBody.scrollTop + (targetRect.top - hostRect.top) - 14;
        manageBody.scrollTo({ top, behavior: 'smooth' });
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
      let dots = [];

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

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          index = (index - 1 + len) % len;
          apply();
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          index = (index + 1) % len;
          apply();
        });
      }

      slides.forEach((slide, i) => {
        slide.addEventListener('click', () => {
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

  function enhanceManageContent() {
    if (!manageBody) return;
    wireManageOutlookCarousels(manageBody);
    wireManageEntryExpanders(manageBody);
    wireManageSeeMore(manageBody);
    addEditButtons(manageBody);
    addRepresentativeControls(manageBody);
  }

  async function persistEditorState(state) {
    try {
      const response = await fetch(EDITOR_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state }),
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

  function schedulePersist(state) {
    if (!state || typeof state !== 'object') return;
    if (persistTimer) {
      window.clearTimeout(persistTimer);
    }
    persistTimer = window.setTimeout(() => {
      persistEditorState(state);
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
      if (!selectedCountryId && activeCountries.length) {
        selectedCountryId = activeCountries[0].code;
      }
      renderCountryTabs();
      if (selectedCountryId) {
        selectCountry(selectedCountryId);
      }
      return;
    }

    if (type === 'ecva-country-modal-html') {
      const countryId = String(payload.countryId || '').trim();
      if (!countryId || countryId !== selectedCountryId || !manageBody) return;
      manageBody.innerHTML = payload.html || '';
      enhanceManageContent();
      return;
    }

    if (type === 'ecva-editor-entry-updated' || type === 'ecva-editor-representatives-updated') {
      const countryId = String(payload.countryId || '').trim();
      if (countryId && countryId === selectedCountryId && manageBody) {
        manageBody.innerHTML = payload.html || '';
        enhanceManageContent();
      }
      showToast(type === 'ecva-editor-entry-updated' ? 'Text updated in the app.' : 'Representative updated in the app.');
      return;
    }

    if (type === 'ecva-editor-state-changed') {
      schedulePersist(payload.state);
    }
  });

  if (manageBtn) {
    manageBtn.addEventListener('click', openManage);
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
