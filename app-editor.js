(function () {
  const mapFrame = document.querySelector(".desktop-map iframe");
  if (!mapFrame) return;

  const adminHub = document.getElementById("ecva-admin-hub");
  const manageRoot = document.getElementById("ecva-manage-root");
  const manageBody = document.getElementById("ecva-manage-body");
  const countryTabsHost = document.getElementById("ecva-manage-country-tabs");
  const manageBtn = document.getElementById("ecva-manage-app-btn");
  const accessCodeInput = document.getElementById("ecva-access-code-input");
  const accessCodeError = document.getElementById("ecva-access-code-error");
  const websiteBtn = document.getElementById("ecva-go-website-btn");
  const closeHubBtn = document.getElementById("ecva-close-hub-btn");
  const closeManageBtn = document.getElementById("ecva-manage-close-btn");

  const editorModal = document.getElementById("ecva-editor-modal");
  const editorDialog = editorModal
    ? editorModal.querySelector(".ecva-editor-modal-dialog")
    : null;
  const editorForm = document.getElementById("ecva-editor-form");
  const editorHeading = document.getElementById("ecva-editor-heading");
  const editorStepper = document.getElementById("ecva-editor-stepper");
  const editorStepperList = document.getElementById("ecva-editor-stepper-list");
  const entryFieldsWrap = document.getElementById("ecva-editor-entry-fields");
  const repFieldsWrap = document.getElementById("ecva-editor-rep-fields");
  const editorStepTextPanel = document.getElementById("ecva-editor-step-text");
  const editorStepTranslationPanel = document.getElementById(
    "ecva-editor-step-translation",
  );
  const editorStepLanguagesPanel = document.getElementById(
    "ecva-editor-step-languages",
  );
  const editorStepContactPanel = document.getElementById(
    "ecva-editor-step-contact",
  );
  const editorTitle = document.getElementById("ecva-editor-title");
  const editorDescription = document.getElementById("ecva-editor-description");
  const editorTitleCount = document.getElementById("ecva-editor-title-count");
  const editorDescriptionCount = document.getElementById(
    "ecva-editor-description-count",
  );
  const editorTranslationBlock = document.getElementById(
    "ecva-editor-translation-block",
  );
  const editorTranslationNote = document.getElementById(
    "ecva-editor-translation-note",
  );
  const editorNativeTitlePreview = document.getElementById(
    "ecva-editor-native-title-preview",
  );
  const editorNativeDescriptionPreview = document.getElementById(
    "ecva-editor-native-description-preview",
  );
  const editorNativeTitleLabel = document.getElementById(
    "ecva-editor-native-title-label",
  );
  const editorNativeDescriptionLabel = document.getElementById(
    "ecva-editor-native-description-label",
  );
  const editorTitleFieldLabel = document.getElementById(
    "ecva-editor-title-field-label",
  );
  const editorDescriptionFieldLabel = document.getElementById(
    "ecva-editor-description-field-label",
  );
  const editorSourceLangFlag = document.getElementById(
    "ecva-editor-source-lang-flag",
  );
  const editorSourceLangLabel = document.getElementById(
    "ecva-editor-source-lang-label",
  );
  const editorEnglishTitlePreview = document.getElementById(
    "ecva-editor-english-title-preview",
  );
  const editorEnglishDescriptionPreview = document.getElementById(
    "ecva-editor-english-description-preview",
  );
  const editorEnglishTitleLabel = document.getElementById(
    "ecva-editor-english-title-label",
  );
  const editorEnglishDescriptionLabel = document.getElementById(
    "ecva-editor-english-description-label",
  );
  const editorSyncNativeTitleBtn = document.getElementById(
    "ecva-editor-sync-native-title",
  );
  const editorSyncNativeDescriptionBtn = document.getElementById(
    "ecva-editor-sync-native-description",
  );
  const editorSyncEnglishTitleBtn = document.getElementById(
    "ecva-editor-sync-english-title",
  );
  const editorSyncEnglishDescriptionBtn = document.getElementById(
    "ecva-editor-sync-english-description",
  );
  const editorResourceLanguageList = document.getElementById(
    "ecva-editor-resource-language-list",
  );
  const editorResourceAddLanguageBtn = document.getElementById(
    "ecva-editor-resource-add-language-btn",
  );
  const editorContactName = document.getElementById("ecva-editor-contact-name");
  const editorContactRole = document.getElementById("ecva-editor-contact-role");
  const editorContactEmail = document.getElementById(
    "ecva-editor-contact-email",
  );
  const editorOwnershipType = document.getElementById(
    "ecva-editor-ownership-type",
  );
  const editorOwnershipName = document.getElementById(
    "ecva-editor-ownership-name",
  );
  const editorRepName = document.getElementById("ecva-editor-rep-name");
  const editorRepTitle = document.getElementById("ecva-editor-rep-title");
  const editorRepOrganisation = document.getElementById(
    "ecva-editor-rep-organisation",
  );
  const editorRepImageFile = document.getElementById(
    "ecva-editor-rep-image-file",
  );
  const editorCropImage = document.getElementById("ecva-editor-crop-image");
  const editorCropFrame = document.getElementById("ecva-editor-crop-frame");
  const editorCropHandle = document.getElementById("ecva-editor-crop-handle");
  const editorCropStatus = document.getElementById("ecva-editor-crop-status");
  const editorBackBtn = document.getElementById("ecva-editor-back-btn");
  const editorCancelBtn = document.getElementById("ecva-editor-cancel-btn");
  const editorRemoveBtn = document.getElementById("ecva-editor-remove-btn");
  const editorRemoveConfirmText = editorModal
    ? editorModal.querySelector(".ecva-editor-remove-confirm-text")
    : null;
  const editorSaveBtn = document.getElementById("ecva-editor-save-btn");
  const editorPendingBtn = document.getElementById("ecva-editor-pending-btn");
  const editorAcceptBtn = document.getElementById("ecva-editor-accept-btn");

  const toast = document.getElementById("ecva-toast");
  const mobileLegendLogo = document.querySelector(
    ".mobile-legend .legend-logo",
  );

  const WEBSITE_URL = "https://www.ecvassociation.org";
  const EDITOR_API = "/api/editor-data";
  const EDITOR_VERSIONS_API = "/api/editor-data/versions";
  const UPLOAD_API = "/api/upload-image";
  const ATTACHMENT_UPLOAD_API = "/api/upload-attachment";
  const ATTACHMENT_MAX_BYTES = 15 * 1024 * 1024;
  const ATTACHMENT_FILE_RE = /\.(pdf|doc|docx|ppt|pptx|png|jpe?g)$/i;
  const TRANSLATE_BATCH_API = "/api/translate-batch";
  const GLOBAL_ACCESS_CODES = new Set();
  const INVALID_CODE_MESSAGE = "Invalid code";
  const normalizeLanguageCode = (rawLang) => {
    const value = String(rawLang || "")
      .trim()
      .toLowerCase();
    if (!/^[a-z]{2}(?:-[a-z]{2})?$/.test(value)) return "en";
    return value.slice(0, 2);
  };
  const COUNTRY_PRIMARY_LANGUAGE = {
    AD: "ca",
    AL: "sq",
    AM: "hy",
    AT: "de",
    BA: "bs",
    BE: "nl",
    BG: "bg",
    BY: "be",
    CH: "de",
    CY: "el",
    CZ: "cs",
    DE: "de",
    DK: "da",
    EE: "et",
    ES: "es",
    FI: "fi",
    FR: "fr",
    GB: "en",
    GE: "ka",
    GR: "el",
    HR: "hr",
    HU: "hu",
    IE: "en",
    IS: "is",
    IT: "it",
    LT: "lt",
    LU: "lb",
    LV: "lv",
    MD: "ro",
    ME: "sr",
    MK: "mk",
    NL: "nl",
    NO: "no",
    PL: "pl",
    PT: "pt",
    RO: "ro",
    RS: "sr",
    SE: "sv",
    SI: "sl",
    SK: "sk",
    TR: "tr",
    UA: "uk",
  };
  const LANGUAGE_ENDONYMS = {
    en: "English",
    ro: "Română",
    fr: "Français",
    de: "Deutsch",
    es: "Español",
    cs: "Čeština",
    da: "Dansk",
    et: "Eesti",
    fi: "Suomi",
    el: "Ελληνικά",
    is: "Íslenska",
    no: "Norsk",
    sv: "Svenska",
    nl: "Nederlands",
    bg: "Български",
    be: "Беларуская",
    sq: "Shqip",
    hy: "Հայերեն",
    bs: "Bosanski",
    ka: "ქართული",
    hr: "Hrvatski",
    hu: "Magyar",
    it: "Italiano",
    lt: "Lietuvių",
    lb: "Lëtzebuergesch",
    lv: "Latviešu",
    sr: "Srpski",
    mk: "Македонски",
    pl: "Polski",
    pt: "Português",
    sl: "Slovenščina",
    sk: "Slovenčina",
    tr: "Türkçe",
    uk: "Українська",
    ca: "Català",
  };
  const EDITOR_RESOURCE_LIMITS = { maxLanguages: 3 };
  const EDITOR_TEXT_LIMITS = {
    title: 72,
    description: 200,
  };
  const EDITOR_RESOURCE_TYPE_OPTIONS = [
    { value: "webpage", label: "Webpage", inputMode: "url" },
    { value: "youtube", label: "YouTube", inputMode: "url" },
    { value: "document", label: "Document", inputMode: "file" },
    { value: "image", label: "Image", inputMode: "file" },
  ];
  const EDITOR_RESOURCE_PRICING_OPTIONS = [
    { value: "free", label: "Free", icon: "gift" },
    { value: "paid", label: "Paid", icon: "coin" },
    { value: "freemium", label: "Freemium", icon: "trophy" },
    { value: "subscription", label: "Subscription", icon: "calendar" },
  ];
  const EDITOR_UI_COPY_BASE = {
    reviewEntry: "Review Entry",
    editRepresentative: "Edit representative",
    stepWord: "Step",
    stepWriteNativeBeforeSubmit: "Text in {language}",
    stepReviewText: "Review text",
    stepCheckTranslation: "Check translation",
    stepLanguagesLinks: "Languages & links",
    stepContactDetails: "Contact",
    back: "Back",
    cancel: "Cancel",
    removeItem: "Delete",
    confirmAction: "Confirm",
    next: "Next",
    save: "Save",
    pendingAction: "Pending",
    acceptAction: "Accept",
    choosePendingOrAcceptBeforeSaving:
      "Choose Pending or Accept to finish this review.",
    checking: "Checking...",
    contentReview: "Content review",
    translationReview: "Translation review",
    checkTranslationButton: "Refresh translation",
    noTitleYet: "No title yet.",
    noDescriptionYet: "No description yet.",
    notCheckedYet: "Not checked yet.",
    translationCheckingNote: "Updating translation...",
    translationVerifiedNote:
      "Edit both columns freely. Use ↻ to sync any field from the opposite column.",
    translationNeedsCheckNote:
      "Edit title and description in {language} and run Check translation before saving.",
    checkTranslationBeforeContinuing:
      "Check translation before continuing.",
    completeAllStepsBeforeSaving:
      "Complete all review steps before saving.",
    runCheckTranslationBeforeSaving:
      "Run Check translation before saving.",
    translationCheckedToast: "Translation checked.",
    translationCheckFailedToast: "Could not check translation right now.",
    addTitleOrDescriptionBeforeCheck:
      "Add title or description before translation check.",
    completeTitle: "Complete title.",
    completeDescription: "Complete description.",
    titleTooLong: "Title must be {max} characters or fewer.",
    descriptionTooLong: "Description must be {max} characters or fewer.",
    titlePlaceholder: "e.g. Character Toolkit for Schools",
    descriptionPlaceholder: "Write a short and clear resource description.",
    stepDescriptionLabel: "Short and clear resource description.",
    titleHelper: "Title will be displayed publicly.",
    descriptionHelper: "Write a short and clear description of the resource.",
  };
  const EDITOR_UI_COPY_PRESET = {
    ro: {
      ...EDITOR_UI_COPY_BASE,
      reviewEntry: "Revizuire intrare",
      editRepresentative: "Editează reprezentantul",
      stepWord: "Pasul",
      stepWriteNativeBeforeSubmit: "Text în {language}",
      stepReviewText: "Revizuiește textul",
      stepCheckTranslation: "Verifică traducerea",
      stepLanguagesLinks: "Limbi și linkuri",
      stepContactDetails: "Contact",
      back: "Înapoi",
      cancel: "Anulează",
      removeItem: "Șterge",
      confirmAction: "Confirmă",
      next: "Următorul",
      save: "Salvează",
      pendingAction: "Pending",
      acceptAction: "Acceptă",
      choosePendingOrAcceptBeforeSaving:
        "Alege Pending sau Acceptă pentru a finaliza această revizuire.",
      checking: "Se verifică...",
      contentReview: "Revizuire conținut",
      translationReview: "Revizuire traducere",
      checkTranslationButton: "Reactualizează traducerea",
      noTitleYet: "Titlul nu este completat.",
      noDescriptionYet: "Descrierea nu este completată.",
      notCheckedYet: "Nu este verificat încă.",
      translationCheckingNote: "Se actualizează traducerea...",
      translationVerifiedNote:
        "Poți edita ambele coloane. Folosește ↻ ca să sincronizezi orice câmp din coloana opusă.",
      translationNeedsCheckNote:
        "Editează titlul și descrierea în {language} și apasă Verifică traducerea înainte de salvare.",
      checkTranslationBeforeContinuing:
        "Verifică traducerea înainte de a continua.",
      completeAllStepsBeforeSaving:
        "Completează toți pașii de revizuire înainte de salvare.",
      runCheckTranslationBeforeSaving:
        "Rulează Verifică traducerea înainte de salvare.",
      translationCheckedToast: "Traducerea a fost verificată.",
      translationCheckFailedToast:
        "Traducerea nu a putut fi verificată în acest moment.",
      addTitleOrDescriptionBeforeCheck:
        "Adaugă titlu sau descriere înainte de verificarea traducerii.",
      completeTitle: "Completează titlul.",
      completeDescription: "Completează descrierea.",
      titleTooLong: "Titlul trebuie să aibă maximum {max} caractere.",
      descriptionTooLong: "Descrierea trebuie să aibă maximum {max} caractere.",
      titlePlaceholder: "ex. Toolkit de educație a caracterului pentru școli",
      descriptionPlaceholder: "Scrie o descriere scurtă și clară a resursei.",
      stepDescriptionLabel: "Descriere scurtă și clară a resursei.",
      titleHelper: "Titlul va fi afișat public.",
      descriptionHelper: "Scrie o descriere scurtă și clară a resursei.",
    },
  };
  const EDITOR_UI_COPY_KEYS = Object.keys(EDITOR_UI_COPY_BASE);
  const RESOURCE_UI_BASE_SOURCE =
    window.__ECVA_RESOURCE_UI_BASE &&
    typeof window.__ECVA_RESOURCE_UI_BASE === "object"
      ? window.__ECVA_RESOURCE_UI_BASE
      : {};
  const RESOURCE_UI_LABEL_SCHEMA_SOURCE = Array.isArray(
    window.__ECVA_RESOURCE_UI_LABEL_SCHEMA,
  )
    ? window.__ECVA_RESOURCE_UI_LABEL_SCHEMA
    : Object.keys(RESOURCE_UI_BASE_SOURCE).map((key) => ({
        key,
        group: "general",
        english: String(RESOURCE_UI_BASE_SOURCE[key] || ""),
      }));
  const RESOURCE_LABEL_GROUP_ORDER = [
    "wizard",
    "form",
    "language_card",
    "options",
    "validation",
    "status",
    "modal",
    "general",
  ];
  const RESOURCE_LABEL_GROUP_LABELS = {
    modal: "Modal",
    wizard: "Wizard",
    form: "Form",
    language_card: "Languages & links",
    options: "Options",
    validation: "Validation",
    status: "Status",
    general: "General",
  };
  const RESOURCE_LABEL_GROUP_LABELS_RO = {
    modal: "Modal",
    wizard: "Pași",
    form: "Formular",
    language_card: "Limbi și linkuri",
    options: "Opțiuni",
    validation: "Validare",
    status: "Status",
    general: "General",
  };
  const RESOURCE_LABEL_SCHEMA = RESOURCE_UI_LABEL_SCHEMA_SOURCE.map((item) => {
    const key = String(item && item.key ? item.key : "").trim();
    const english = String(item && item.english ? item.english : "").trim();
    const group = String(item && item.group ? item.group : "general")
      .trim()
      .toLowerCase();
    return { key, english, group: group || "general" };
  })
    .filter((item) => item.key)
    .sort((a, b) => {
      const indexA = RESOURCE_LABEL_GROUP_ORDER.indexOf(a.group);
      const indexB = RESOURCE_LABEL_GROUP_ORDER.indexOf(b.group);
      const groupRankA = indexA >= 0 ? indexA : RESOURCE_LABEL_GROUP_ORDER.length + 1;
      const groupRankB = indexB >= 0 ? indexB : RESOURCE_LABEL_GROUP_ORDER.length + 1;
      const byGroup = groupRankA - groupRankB;
      if (byGroup !== 0) return byGroup;
      return String(a.english || a.key).localeCompare(String(b.english || b.key));
    });
  const STATUS_VALUE_TO_LABEL_KEY = {
    leading: "statusLeading",
    high_momentum: "statusHighMomentum",
    development: "statusInDevelopment",
  };

  function getCurrentLang() {
    const query = new URLSearchParams(window.location.search);
    const fromQuery = String(
      query.get("lang") || query.get("pa") || query.get("language") || "",
    )
      .trim()
      .toLowerCase();
    if (fromQuery) return normalizeLanguageCode(fromQuery);
    return normalizeLanguageCode(document.documentElement.lang || "en");
  }

  function canEditContent() {
    return true;
  }

  function normalizeManageCountryCode(rawCode) {
    const value = String(rawCode || "")
      .trim()
      .toUpperCase();
    if (!value) return "";
    return value === "UK" ? "GB" : value;
  }

  function countryPrefixForAccessCode(rawCode) {
    const normalized = normalizeManageCountryCode(rawCode);
    if (!normalized) return "";
    return normalized === "GB" ? "uk" : normalized.toLowerCase();
  }

  function displayCountryCode(rawCode) {
    const normalized = normalizeManageCountryCode(rawCode);
    return normalized === "GB" ? "UK" : normalized;
  }

  function requiresSubmissionTranslation(rawCountryCode, rawType) {
    const mode = String(rawType || "article")
      .trim()
      .toLowerCase();
    if (mode === "representative") return false;
    return normalizeManageCountryCode(rawCountryCode) !== "GB";
  }

  function getCountryPrimaryLanguage(rawCountryCode) {
    const countryCode = normalizeManageCountryCode(rawCountryCode);
    if (!countryCode) return "en";
    return normalizeLanguageCode(COUNTRY_PRIMARY_LANGUAGE[countryCode] || "en");
  }

  function getLanguageDisplayLabel(rawLang) {
    const lang = normalizeLanguageCode(rawLang);
    return String(LANGUAGE_ENDONYMS[lang] || lang.toUpperCase());
  }

  function resolveEditorUiLanguageCode() {
    const activeLang = normalizeLanguageCode(getCurrentLang());
    const targetCountry = normalizeManageCountryCode(
      editorTarget && editorTarget.countryId,
    );
    if (targetCountry) {
      const nativeLang = getCountryPrimaryLanguage(targetCountry);
      if (activeLang && activeLang === nativeLang) return nativeLang;
      if (activeLang) return activeLang;
      return nativeLang || "en";
    }
    const stateLang = normalizeLanguageCode(
      (submissionTranslationState && submissionTranslationState.sourceLanguageCode) ||
        "",
    );
    if (stateLang) return stateLang;
    return activeLang || "en";
  }

  function getEditorUiCopy(rawLang) {
    const lang = normalizeLanguageCode(rawLang || editorUiCopyLang || "en");
    return editorUiCopyCache.get(lang) || editorUiCopyCache.get("en") || EDITOR_UI_COPY_BASE;
  }

  function localizeEditorUiText(rawValue, fallback) {
    const value = String(rawValue || "").trim();
    return value || String(fallback || "").trim();
  }

  function ensureEditorUiCopy(rawLang) {
    const lang = normalizeLanguageCode(rawLang || "en");
    if (!lang || lang === "en" || editorUiCopyCache.has(lang)) return;
    if (editorUiCopyPending.has(lang)) return;
    const request = fetch(TRANSLATE_BATCH_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceLang: "en",
        targetLang: lang,
        texts: EDITOR_UI_COPY_KEYS.map((key) => EDITOR_UI_COPY_BASE[key]),
      }),
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const payload = await response.json().catch(() => null);
        const translated = Array.isArray(payload && payload.translated)
          ? payload.translated
          : null;
        if (!translated || translated.length < EDITOR_UI_COPY_KEYS.length) return null;
        const localized = { ...EDITOR_UI_COPY_BASE };
        EDITOR_UI_COPY_KEYS.forEach((key, index) => {
          localized[key] = localizeEditorUiText(
            translated[index],
            EDITOR_UI_COPY_BASE[key],
          );
        });
        editorUiCopyCache.set(lang, localized);
        return localized;
      })
      .catch(() => null)
      .finally(() => {
        editorUiCopyPending.delete(lang);
      });
    editorUiCopyPending.set(lang, request);
    request.then(() => {
      if (resolveEditorUiLanguageCode() !== lang) return;
      editorUiCopyLang = lang;
      refreshEditorUiLanguage();
      configureEditorReviewWizard();
      updateSubmissionTranslationUi();
      updateEditorSaveAvailability();
      updateEditorHeading();
    });
  }

  function getAvailableLanguageCodes() {
    const set = new Set();
    Object.values(COUNTRY_PRIMARY_LANGUAGE).forEach((lang) => {
      const code = normalizeLanguageCode(lang);
      if (code && code !== "en") set.add(code);
    });
    if (!set.size) {
      const current = normalizeLanguageCode(getCurrentLang());
      if (current && current !== "en") set.add(current);
    }
    return Array.from(set).sort((a, b) =>
      getLanguageDisplayLabel(a).localeCompare(getLanguageDisplayLabel(b)),
    );
  }

  function getDefaultLabelManageLanguage() {
    const selected = normalizeManageCountryCode(selectedCountryId);
    if (selected) {
      const selectedLang = getCountryPrimaryLanguage(selected);
      if (selectedLang && selectedLang !== "en") return selectedLang;
    }
    if (accessScope.mode === "country") {
      const scopedLang = getCountryPrimaryLanguage(accessScope.countryId);
      if (scopedLang && scopedLang !== "en") return scopedLang;
    }
    const current = normalizeLanguageCode(getCurrentLang());
    if (current && current !== "en") return current;
    const langs = getAvailableLanguageCodes();
    return langs[0] || "ro";
  }

  function sanitizeLabelOverrides(raw) {
    const input = raw && typeof raw === "object" ? raw : {};
    const out = {};
    Object.entries(input).forEach(([key, value]) => {
      const normalizedKey = String(key || "").trim();
      if (!normalizedKey) return;
      const normalizedValue = String(value || "").trim();
      if (!normalizedValue) return;
      out[normalizedKey] = normalizedValue;
    });
    return out;
  }

  function setLabelOverridesForLang(rawLang, rawLabels) {
    const lang = normalizeLanguageCode(rawLang);
    labelOverridesByLang[lang] = sanitizeLabelOverrides(rawLabels);
    return { ...labelOverridesByLang[lang] };
  }

  function getLabelOverridesForLang(rawLang) {
    const lang = normalizeLanguageCode(rawLang);
    const source =
      labelOverridesByLang[lang] && typeof labelOverridesByLang[lang] === "object"
        ? labelOverridesByLang[lang]
        : {};
    return sanitizeLabelOverrides(source);
  }

  function ensureLabelDraft(rawLang) {
    const lang = normalizeLanguageCode(rawLang);
    if (!labelDraftByLang[lang] || typeof labelDraftByLang[lang] !== "object") {
      labelDraftByLang[lang] = getLabelOverridesForLang(lang);
    }
    return labelDraftByLang[lang];
  }

  function buildCountryAccessCode(rawCode, salt) {
    const prefix = countryPrefixForAccessCode(rawCode);
    if (!prefix) return "";
    const seed = `${prefix}|ecva|${Number(salt) || 0}`;
    let hash = 2166136261;
    for (let i = 0; i < seed.length; i += 1) {
      hash ^= seed.charCodeAt(i);
      hash +=
        (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
      hash >>>= 0;
    }
    const digits = String(hash % 100000).padStart(5, "0");
    const letter = String.fromCharCode(65 + (hash % 26));
    const insertAt = hash % 6;
    const token = `${digits.slice(0, insertAt)}${letter}${digits.slice(insertAt)}`;
    return `${prefix}ecva${token}`;
  }

  function getAccessCodeForCountry(rawCode) {
    const normalized = normalizeManageCountryCode(rawCode);
    if (!normalized) return "";
    return (
      countryAccessCodeMap.get(normalized) ||
      buildCountryAccessCode(normalized, 1).toLowerCase()
    );
  }

  function maskAccessCode(value) {
    const code = String(value || "").trim();
    if (!code) return "";
    return "•".repeat(Math.max(8, code.length));
  }

  function normalizeStatusValue(rawStatus) {
    const value = String(rawStatus || "")
      .trim()
      .toLowerCase();
    if (!value) return "no_data";
    if (
      value === "high_momentum" ||
      value === "momentum" ||
      value === "high momentum"
    ) {
      return "high_momentum";
    }
    if (
      value === "in development" ||
      value === "development" ||
      value === "dev"
    ) {
      return "development";
    }
    if (value === "leading" || value === "leader") return "leading";
    if (value === "pending") return "pending";
    if (value === "no_data" || value === "no data" || value === "nodata")
      return "no_data";
    return "no_data";
  }

  function getStatusMeta(statusValue, rawLang) {
    const value = normalizeStatusValue(statusValue);
    const lang = normalizeLanguageCode(rawLang || resolveEditorUiLanguageCode());
    const key = STATUS_VALUE_TO_LABEL_KEY[value] || "";
    const overrides = getLabelOverridesForLang(lang);
    const fallbackByValue = {
      leading: "Leading",
      high_momentum: "High Momentum",
      development: "In Development",
      pending: "Pending",
      no_data: "No data",
    };
    const fallback = fallbackByValue[value] || fallbackByValue.no_data;
    const label = key
      ? String(overrides[key] || RESOURCE_UI_BASE_SOURCE[key] || fallback).trim() ||
        fallback
      : fallback;
    const classNameByValue = {
      leading: "is-leading",
      high_momentum: "is-momentum",
      development: "is-development",
      pending: "is-pending",
      no_data: "is-no-data",
    };
    return {
      value,
      label,
      className: classNameByValue[value] || classNameByValue.no_data,
    };
  }

  function normalizeStatus(rawStatus) {
    return getStatusMeta(rawStatus);
  }

  function getStatusLabelFromValue(statusValue) {
    return getStatusMeta(statusValue).label;
  }

  function isActiveStatusValue(statusValue) {
    const value = normalizeStatusValue(statusValue);
    return (
      value === "leading" ||
      value === "high_momentum" ||
      value === "development"
    );
  }

  function normalizeSubmissionStatus(rawStatus) {
    const value = String(rawStatus || "")
      .trim()
      .toLowerCase();
    if (value === "pending") return "pending";
    if (
      value === "in_progress" ||
      value === "in progress" ||
      value === "processing"
    ) {
      return "pending";
    }
    if (value === "rejected" || value === "declined") return "pending";
    if (value === "archived" || value === "used" || value === "done")
      return "archived";
    return "new";
  }

  function getSubmissionStatusLabel(statusValue) {
    const value = normalizeSubmissionStatus(statusValue);
    if (value === "pending") return "Pending";
    if (value === "archived") return "Accepted";
    return "Entries";
  }

  const OVERVIEW_PILLAR_ORDER = [
    "resources",
    "events",
    "organisations",
    "research",
    "government",
  ];
  const OVERVIEW_PILLAR_ICON = {
    resources: "/assets/Resources.png",
    events: "/assets/Events.png",
    research: "/assets/Research.png",
    organisations: "/assets/Organisations.png",
    government: "/assets/Government.png",
  };

  function wirePillarIconLoading(scope) {
    if (!scope) return;
    const images = scope.querySelectorAll(
      ".ecva-manage-pillars-dot, .country-modal-pillar-symbol img",
    );
    images.forEach((img) => {
      if (!(img instanceof HTMLImageElement)) return;
      if (img.dataset.pillarLoadWired === "1") return;
      img.dataset.pillarLoadWired = "1";
      const minSkeletonMs = 180;
      const wiredAt = Date.now();
      const symbolWrap = img.closest(".country-modal-pillar-symbol");
      const revealLoaded = () => {
        const elapsed = Date.now() - wiredAt;
        const waitMs = elapsed < minSkeletonMs ? minSkeletonMs - elapsed : 0;
        window.setTimeout(() => {
          requestAnimationFrame(() => {
            img.classList.add("is-loaded");
            if (symbolWrap) symbolWrap.classList.add("is-loaded");
          });
        }, waitMs);
      };
      const markError = () => {
        img.classList.add("is-error");
        if (symbolWrap) symbolWrap.classList.add("is-error");
      };
      if (img.complete && img.naturalWidth > 0) {
        revealLoaded();
        return;
      }
      img.addEventListener("load", revealLoaded, { once: true });
      img.addEventListener("error", markError, { once: true });
    });
  }

  function buildOverviewPillarStatusHtml(country) {
    const statusValue = normalizeStatusValue(
      country && (country.statusValue || country.status),
    );
    if (statusValue === "no_data") return "";
    const summary =
      country &&
      country.pillarSummary &&
      typeof country.pillarSummary === "object"
        ? country.pillarSummary
        : {};
    const icons = OVERVIEW_PILLAR_ORDER.map((pillarId) => {
      const meta =
        summary[pillarId] && typeof summary[pillarId] === "object"
          ? summary[pillarId]
          : {};
      const isActive = Boolean(meta.active);
      const iconPath =
        OVERVIEW_PILLAR_ICON[pillarId] || OVERVIEW_PILLAR_ICON.resources;
      const title = `${String(pillarId).charAt(0).toUpperCase()}${String(pillarId).slice(1)}: ${isActive ? "active" : "pending/no data"}`;
      return `<img class="ecva-manage-pillars-dot${isActive ? " is-active" : ""}" src="${iconPath}" alt="" loading="eager" decoding="async" title="${escapeHtml(title)}" />`;
    }).join("");
    return `<span class="ecva-manage-pillars-status" aria-hidden="true">${icons}</span>`;
  }

  let activeCountries = [];
  let countryCatalog = [];
  let inboxByCountry = {};
  let selectedCountryId = "";
  let accessScope = { mode: "all", countryId: "" };
  let accessCodeToCountryMap = new Map();
  let countryAccessCodeMap = new Map();
  let resettingCountryCode = "";
  let activeCountriesWaiters = [];
  let editorTarget = null;
  let editorMode = "entry";
  let representativeImagePath = "";
  let representativeSourceImagePath = "";
  let representativeCropSource = "";
  let representativeCropFileName = "representative-image.png";
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
  let representativeManageModal = null;
  let representativeManageList = null;
  let representativeManageCloseBtn = null;
  let representativeManageAddBtn = null;
  let representativeManageCountryId = "";
  let labelManageBtn = null;
  let labelManageModal = null;
  let labelManageCloseBtn = null;
  let labelManageFootCloseBtn = null;
  let labelManageTitle = null;
  let labelManageSearchLabel = null;
  let labelManageSearchInput = null;
  let labelManageCategoryList = null;
  let labelManageList = null;
  let labelManageSaveBtn = null;
  let labelManageResetBtn = null;
  let labelManageResetLabel = null;
  let labelManageNotice = null;
  let labelManageLanguage = "en";
  let labelManageCategory = "all";
  let labelManageResetArmed = false;
  let labelManageResetTimer = null;
  let labelOverridesByLang = {};
  let labelDraftByLang = {};
  let pendingLabelOverrideRequests = new Map();
  let labelOverrideRequestCounter = 0;
  let removeConfirmTimer = null;
  let pendingEntryDataRequests = new Map();
  let submissionTranslationState = null;
  let editorResourceLanguageItems = [];
  let editorResourceLangUid = 0;
  let editorReviewWizardEnabled = false;
  let editorReviewStepIndex = 0;
  let editorReviewSteps = [];
  let editorUiCopyLang = "en";
  let editorAutoTranslationPrimed = false;
  let editorSubmissionFinalStatus = "";
  const editorUiCopyCache = new Map([
    ["en", { ...EDITOR_UI_COPY_BASE }],
    ["ro", { ...EDITOR_UI_COPY_PRESET.ro }],
  ]);
  const editorUiCopyPending = new Map();
  const nativeFieldLabelPending = new Map();
  const nativeFieldLabelCache = {
    en: { title: "Title", description: "Description" },
    ro: { title: "Titlu", description: "Descriere" },
  };

  function resetEditorRemoveState() {
    if (!editorRemoveBtn) return;
    const copy = getEditorUiCopy(editorUiCopyLang);
    editorRemoveBtn.classList.remove("is-confirm");
    const removeText = copy.removeItem || EDITOR_UI_COPY_BASE.removeItem;
    editorRemoveBtn.setAttribute("aria-label", removeText);
    editorRemoveBtn.setAttribute("title", removeText);
    if (editorRemoveConfirmText) {
      editorRemoveConfirmText.textContent =
        copy.confirmAction || EDITOR_UI_COPY_BASE.confirmAction;
    }
    if (removeConfirmTimer) {
      window.clearTimeout(removeConfirmTimer);
      removeConfirmTimer = null;
    }
  }

  function postToMap(type, payload) {
    if (!mapFrame.contentWindow) return;
    mapFrame.contentWindow.postMessage({ type, payload: payload || {} }, "*");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function clearAccessCodeError() {
    if (!accessCodeError) return;
    accessCodeError.textContent = "";
    accessCodeError.classList.remove("is-visible");
  }

  function showAccessCodeError(message) {
    if (!accessCodeError) return;
    accessCodeError.textContent = String(message || INVALID_CODE_MESSAGE);
    accessCodeError.classList.add("is-visible");
  }

  function getNormalizedAccessCodeInput(rawValue) {
    return String(rawValue || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");
  }

  function isCountryAllowed(countryId) {
    if (!countryId) return false;
    if (accessScope.mode !== "country") return true;
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
    if (accessScope.mode === "country") {
      return normalizeManageCountryCode(accessScope.countryId);
    }
    return "";
  }

  function updateVersionHistoryButtonVisibility() {
    if (!versionHistoryBtn) return;
    const hasCountryScope = Boolean(getVersionScopeCountryId());
    versionHistoryBtn.style.display = hasCountryScope ? "inline-flex" : "none";
    if (!hasCountryScope) {
      closeVersionHistoryModal();
    }
  }

  function rebuildCountryAccessMaps() {
    accessCodeToCountryMap = new Map();
    countryAccessCodeMap = new Map();
    const source =
      Array.isArray(countryCatalog) && countryCatalog.length
        ? countryCatalog
        : activeCountries;
    source.forEach((country, index) => {
      const countryId = normalizeManageCountryCode(country && country.code);
      if (!countryId) return;
      const fromState = String(
        country && country.accessCode ? country.accessCode : "",
      )
        .trim()
        .toLowerCase();
      const code =
        fromState || buildCountryAccessCode(countryId, index + 1).toLowerCase();
      accessCodeToCountryMap.set(code, countryId);
      countryAccessCodeMap.set(countryId, code);
    });
  }

  function makeRandomAccessCode(rawCode) {
    const prefix = countryPrefixForAccessCode(rawCode);
    if (!prefix) return "";
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let suffix = "";
    for (let i = 0; i < 6; i += 1) {
      suffix += chars[Math.floor(Math.random() * chars.length)];
    }
    return `${prefix}ecva${suffix}`;
  }

  function renderResetCodeConfirm(countryCode) {
    const existing = document.getElementById("ecva-reset-code-confirm");
    if (existing) existing.remove();
    const modal = document.createElement("div");
    modal.id = "ecva-reset-code-confirm";
    modal.className = "ecva-reset-code-modal is-visible";
    modal.innerHTML = `
      <section class="ecva-reset-code-dialog" role="dialog" aria-modal="true" aria-label="Reset app access code">
        <h3>Reset app access code?</h3>
        <p>This will generate a new code for ${escapeHtml(displayCountryCode(countryCode))}. The old code will stop working.</p>
        <div class="ecva-reset-code-actions">
          <button type="button" class="ecva-admin-btn secondary" data-reset-cancel>Cancel</button>
          <button type="button" class="ecva-admin-btn danger" data-reset-confirm>Reset code</button>
        </div>
      </section>
    `;
    document.body.appendChild(modal);
    syncAdminOverlayScrollLock();
    return modal;
  }

  function closeResetCodeConfirm() {
    const modal = document.getElementById("ecva-reset-code-confirm");
    if (modal) modal.remove();
    syncAdminOverlayScrollLock();
  }

  function resolveAccessScope(inputRaw) {
    const code = getNormalizedAccessCodeInput(inputRaw);
    if (!code) {
      return { mode: "all", countryId: "" };
    }
    if (GLOBAL_ACCESS_CODES.has(code)) {
      return { mode: "all", countryId: "" };
    }
    const countryId = accessCodeToCountryMap.get(code);
    if (!countryId) return null;
    return { mode: "country", countryId };
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
      waiter.reject(new Error("active_countries_timeout"));
    });
    activeCountriesWaiters = [];
  }

  function ensureActiveCountriesLoaded() {
    if (activeCountries.length || countryCatalog.length)
      return Promise.resolve(activeCountries);
    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        rejectActiveCountriesWaiters();
      }, 2500);
      activeCountriesWaiters.push({ resolve, reject, timeout });
      postToMap("ecva-request-active-countries");
    });
  }

  function getFirstAllowedCountryId() {
    const source =
      accessScope.mode === "country" && countryCatalog.length
        ? countryCatalog
        : activeCountries;
    const first = source.find((country) =>
      isCountryAllowed(country && country.code),
    );
    return first ? String(first.code || "").trim() : "";
  }

  function ensureSelectedCountryIsAllowed() {
    if (!selectedCountryId) return;
    if (accessScope.mode === "country") {
      const target = normalizeManageCountryCode(accessScope.countryId);
      if (
        target &&
        countryCatalog.some(
          (country) =>
            normalizeManageCountryCode(country && country.code) === target,
        )
      ) {
        selectedCountryId = target;
        return;
      }
    }
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
    if (accessScope.mode === "country") {
      const fallback = getFirstAllowedCountryId();
      selectedCountryId = fallback || "";
      return;
    }
    selectedCountryId = "";
  }

  function wireAccessPanel(panel) {
    if (!panel) return;
    const rows = panel.querySelectorAll(
      ".ecva-manage-access-row-item, .ecva-manage-other-card[data-country-id]",
    );
    rows.forEach((row) => {
      let code = String(row.getAttribute("data-access-code") || "")
        .trim()
        .toLowerCase();
      const countryId = normalizeManageCountryCode(
        row.getAttribute("data-country-id"),
      );
      const codeText = row.querySelector(".ecva-manage-access-code");
      const eyeBtn = row.querySelector(".ecva-manage-access-eye");
      const copyBtn = row.querySelector(".ecva-manage-access-copy");
      const resetBtn = row.querySelector(
        ".ecva-manage-access-reset[data-reset-code]",
      );
      const resetMsg = row.querySelector(".ecva-manage-access-reset-msg");
      const copiedMsg = row.querySelector(".ecva-manage-access-copied");
      if (!code || !codeText || !eyeBtn || !copyBtn) return;
      let resetArmed = false;
      let resetTimer = null;
      const clearInlineFeedback = () => {
        if (copiedMsg) {
          copiedMsg.classList.remove("is-visible");
          copiedMsg.textContent = "Copied";
        }
        if (resetMsg) {
          resetMsg.classList.remove("is-visible");
          resetMsg.textContent = "";
        }
      };
      const resetResetButtonState = () => {
        if (!resetBtn) return;
        resetArmed = false;
        if (resetTimer) {
          window.clearTimeout(resetTimer);
          resetTimer = null;
        }
        resetBtn.classList.remove("is-confirm");
        resetBtn.textContent = "Reset code";
      };

      const setRevealState = (revealed) => {
        row.setAttribute("data-revealed", revealed ? "true" : "false");
        codeText.textContent = revealed ? code : maskAccessCode(code);
        eyeBtn.classList.toggle("is-revealed", revealed);
        eyeBtn.setAttribute(
          "aria-label",
          revealed ? "Hide app access code" : "Show app access code",
        );
      };

      setRevealState(false);
      eyeBtn.addEventListener("click", () => {
        const revealed = row.getAttribute("data-revealed") === "true";
        setRevealState(!revealed);
      });
      copyBtn.addEventListener("click", async () => {
        const fallbackCopy = () => {
          const area = document.createElement("textarea");
          area.value = code;
          area.setAttribute("readonly", "");
          area.style.position = "fixed";
          area.style.top = "-9999px";
          document.body.appendChild(area);
          area.select();
          area.setSelectionRange(0, area.value.length);
          const ok = document.execCommand("copy");
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
            throw new Error("copy_failed");
          }
          if (resetMsg) {
            resetMsg.classList.remove("is-visible");
            resetMsg.textContent = "";
          }
          if (copiedMsg) {
            copiedMsg.textContent = "Copied";
            copiedMsg.classList.add("is-visible");
            window.setTimeout(() => {
              copiedMsg.classList.remove("is-visible");
            }, 1500);
          }
        } catch (error) {
          showToast("Could not copy code.", true);
        }
      });
      if (resetBtn && countryId) {
        resetBtn.addEventListener("click", () => {
          if (resettingCountryCode) return;
          clearInlineFeedback();
          if (!resetArmed) {
            resetArmed = true;
            resetBtn.classList.add("is-confirm");
            resetBtn.textContent = "Confirm";
            if (resetTimer) window.clearTimeout(resetTimer);
            resetTimer = window.setTimeout(() => {
              resetResetButtonState();
            }, 4500);
            return;
          }
          resettingCountryCode = countryId;
          let nextCode = "";
          let guard = 0;
          do {
            nextCode = makeRandomAccessCode(countryId);
            guard += 1;
          } while (
            nextCode &&
            accessCodeToCountryMap.has(nextCode) &&
            guard < 30
          );
          if (!nextCode) {
            resettingCountryCode = "";
            resetResetButtonState();
            return;
          }
          const previousCode = String(
            row.getAttribute("data-access-code") || "",
          )
            .trim()
            .toLowerCase();
          if (previousCode) accessCodeToCountryMap.delete(previousCode);
          countryAccessCodeMap.set(countryId, nextCode);
          accessCodeToCountryMap.set(nextCode, countryId);
          row.setAttribute("data-access-code", nextCode);
          code = nextCode;
          row.setAttribute("data-revealed", "false");
          codeText.textContent = maskAccessCode(nextCode);
          eyeBtn.classList.remove("is-revealed");
          eyeBtn.setAttribute("aria-label", "Show app access code");
          postToMap("ecva-editor-update-access-code", {
            countryId,
            accessCode: nextCode,
          });
          if (resetMsg) {
            resetMsg.textContent = "The code has been reset.";
            resetMsg.classList.add("is-visible");
            window.setTimeout(() => {
              if (resetMsg.textContent === "The code has been reset.") {
                resetMsg.classList.remove("is-visible");
              }
            }, 5200);
          }
          resettingCountryCode = "";
          resetResetButtonState();
        });
      }
    });
  }

  function wireStatusSelects(panel) {
    if (!panel) return;
    const selects = panel.querySelectorAll(
      ".ecva-manage-status-select[data-country-id]",
    );
    selects.forEach((selectEl) => {
      if (selectEl.dataset.wired === "1") return;
      selectEl.dataset.wired = "1";
      selectEl.addEventListener("change", () => {
        const countryId = normalizeManageCountryCode(
          selectEl.getAttribute("data-country-id"),
        );
        const nextStatus = normalizeStatusValue(selectEl.value);
        if (!countryId) return;
        const statusMeta = getStatusMeta(nextStatus);
        selectEl.classList.remove(
          "is-leading",
          "is-momentum",
          "is-development",
          "is-pending",
          "is-no-data",
        );
        selectEl.classList.add(statusMeta.className);
        postToMap("ecva-editor-update-country-status", {
          countryId,
          status: nextStatus,
        });
      });
    });
  }

  function buildStatusSelectHtml(countryId, currentStatus, variant) {
    const value = normalizeStatusValue(currentStatus);
    const country = normalizeManageCountryCode(countryId);
    const statusMeta = getStatusMeta(value);
    const allOptions = [
      { value: "leading", label: getStatusLabelFromValue("leading") },
      {
        value: "high_momentum",
        label: getStatusLabelFromValue("high_momentum"),
      },
      { value: "development", label: getStatusLabelFromValue("development") },
      { value: "pending", label: getStatusLabelFromValue("pending") },
      { value: "no_data", label: getStatusLabelFromValue("no_data") },
    ];
    const options = allOptions;
    const optionsHtml = options
      .map((option) => {
        const selected = option.value === value ? " selected" : "";
        return `<option value="${option.value}"${selected}>${option.label}</option>`;
      })
      .join("");
    return `<select class="ecva-manage-status-select ${statusMeta.className}" data-country-id="${country}" aria-label="Edit country status">${optionsHtml}</select>`;
  }

  function buildCodeControlsHtml(countryId, statusValue) {
    if (normalizeStatusValue(statusValue) === "no_data") {
      return "";
    }
    const code = getAccessCodeForCountry(countryId);
    return `
      <span class="ecva-manage-access-controls">
        <code class="ecva-manage-access-code">${maskAccessCode(code)}</code>
        <button type="button" class="ecva-manage-access-eye" aria-label="Show app access code">
          <svg class="ecva-manage-eye-open" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 5c5.8 0 9.7 4.8 10.9 6.6a.75.75 0 0 1 0 .8C21.7 14.2 17.8 19 12 19S2.3 14.2 1.1 12.4a.75.75 0 0 1 0-.8C2.3 9.8 6.2 5 12 5Zm0 1.5c-4.7 0-8.2 3.8-9.3 5.5 1.1 1.7 4.6 5.5 9.3 5.5s8.2-3.8 9.3-5.5c-1.1-1.7-4.6-5.5-9.3-5.5Zm0 2.2a3.3 3.3 0 1 1 0 6.6 3.3 3.3 0 0 1 0-6.6Zm0 1.5a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Z"></path>
          </svg>
          <svg class="ecva-manage-eye-off" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="m3.5 3.5 17 17-1 1-3.1-3.1A12.7 12.7 0 0 1 12 19C6.2 19 2.3 14.2 1.1 12.4a.75.75 0 0 1 0-.8c.8-1.2 2.8-3.8 5.7-5.3L2.5 4.5l1-1Zm4.4 4.4C5.6 9 4 10.9 3 12c1.1 1.7 4.6 5.5 9 5.5 1.3 0 2.5-.3 3.5-.7l-2.1-2.1a3.3 3.3 0 0 1-4.1-4.1L7.9 7.9Zm6.7 6.7-3.2-3.2a1.8 1.8 0 0 0 2.4 2.4ZM12 5c5.8 0 9.7 4.8 10.9 6.6a.75.75 0 0 1 0 .8c-.6 1-2 2.8-3.9 4.2l-1.1-1.1c1.5-1 2.6-2.4 3.4-3.5-1.1-1.7-4.6-5.5-9.3-5.5-1.4 0-2.7.3-3.9.8L7 6.2A11.8 11.8 0 0 1 12 5Z"></path>
          </svg>
        </button>
        <button type="button" class="ecva-manage-access-copy" aria-label="Copy app access code">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M8 4.8A2.8 2.8 0 0 1 10.8 2h7.4A2.8 2.8 0 0 1 21 4.8v7.4a2.8 2.8 0 0 1-2.8 2.8H16v1.2A2.8 2.8 0 0 1 13.2 19H5.8A2.8 2.8 0 0 1 3 16.2V8.8A2.8 2.8 0 0 1 5.8 6H8V4.8Zm2-.8v8.2c0 .44.36.8.8.8H19c.44 0 .8-.36.8-.8V4.8c0-.44-.36-.8-.8-.8h-8.2c-.44 0-.8.36-.8.8ZM8 8H5.8c-.44 0-.8.36-.8.8v7.4c0 .44.36.8.8.8h7.4c.44 0 .8-.36.8-.8V15h-3.2A2.8 2.8 0 0 1 8 12.2V8Z"></path>
          </svg>
        </button>
        <span class="ecva-manage-access-copied" aria-live="polite">Copied</span>
        <span class="ecva-manage-access-reset-msg" aria-live="polite"></span>
        <button type="button" class="ecva-manage-access-reset" data-reset-code aria-label="Reset app access code">Reset code</button>
      </span>
    `;
  }

  function buildOverviewCountryRow(country, variant) {
    const countryCode = normalizeManageCountryCode(country && country.code);
    if (!countryCode) return "";
    const statusValue = normalizeStatusValue(
      country && (country.statusValue || country.status),
    );
    const fullName = String(country && country.name ? country.name : "").trim();
    const displayLabel = fullName || displayCountryCode(countryCode);
    return `
      <article class="ecva-manage-access-row-item" data-country-id="${countryCode}" data-access-code="${getAccessCodeForCountry(countryCode)}" data-revealed="false">
        <span class="ecva-manage-access-country">${String(country.flag || "")} ${escapeHtml(displayLabel)}</span>
        <span class="ecva-manage-milestones-cell">${buildOverviewPillarStatusHtml(country)}</span>
        <span class="ecva-manage-status-cell">${buildStatusSelectHtml(countryCode, statusValue, variant)}</span>
        ${buildCodeControlsHtml(countryCode, statusValue)}
      </article>
    `;
  }

  function buildOtherCountryCard(country) {
    const countryCode = normalizeManageCountryCode(country && country.code);
    if (!countryCode) return "";
    const statusValue = normalizeStatusValue(
      country && (country.statusValue || country.status),
    );
    const fullName = String(country && country.name ? country.name : "").trim();
    const displayLabel = fullName || displayCountryCode(countryCode);
    if (statusValue === "no_data") {
      return `
        <article class="ecva-manage-other-card is-no-data" data-country-id="${countryCode}">
          <span class="ecva-manage-other-country">${String(country.flag || "")} ${escapeHtml(displayLabel)}</span>
          <span class="ecva-manage-status-cell">${buildStatusSelectHtml(countryCode, statusValue, "other")}</span>
        </article>
      `;
    }
    return `
      <article class="ecva-manage-other-card" data-country-id="${countryCode}" data-access-code="${getAccessCodeForCountry(countryCode)}" data-revealed="false">
        <span class="ecva-manage-other-country">${String(country.flag || "")} ${escapeHtml(displayLabel)}</span>
        <span class="ecva-manage-status-cell">
          ${buildOverviewPillarStatusHtml(country)}
          ${buildStatusSelectHtml(countryCode, statusValue, "other")}
        </span>
        ${buildCodeControlsHtml(countryCode, statusValue)}
      </article>
    `;
  }

  function renderGeneralAccessPanel() {
    if (!manageBody) return;
    const previous = manageBody.querySelector(".ecva-manage-access-panel");
    if (previous) previous.remove();
    if (selectedCountryId || !countryCatalog.length) return;

    const panel = document.createElement("section");
    panel.className = "ecva-manage-access-panel";
    const sortedCatalog = [...countryCatalog]
      .filter((country) =>
        accessScope.mode === "all"
          ? true
          : isCountryAllowed(country && country.code),
      )
      .sort((a, b) =>
        String(a && a.name ? a.name : "").localeCompare(
          String(b && b.name ? b.name : ""),
        ),
      );
    const managedRows = sortedCatalog.filter(
      (country) =>
        normalizeStatusValue(
          country && (country.statusValue || country.status),
        ) !== "no_data",
    );
    const otherRows = sortedCatalog.filter(
      (country) =>
        normalizeStatusValue(
          country && (country.statusValue || country.status),
        ) === "no_data",
    );
    panel.innerHTML = `
      <article class="ecva-manage-access-card">
        <header class="ecva-manage-access-head">
          <h4>General management</h4>
        </header>
        <div class="ecva-manage-access-table">
          <div class="ecva-manage-access-table-head">
            <span>Country</span>
            <span>Milestones</span>
            <span>Status</span>
            <span>App access code</span>
          </div>
          ${
            managedRows.length
              ? managedRows
                  .map((country) => buildOverviewCountryRow(country, "active"))
                  .join("")
              : '<div class="ecva-manage-access-empty-row">No countries are in management yet.</div>'
          }
        </div>
      </article>
      <hr class="ecva-manage-access-section-hr" />
      <article class="ecva-manage-access-card is-secondary">
        <header class="ecva-manage-access-head">
          <h4 class="ecva-manage-access-subhead">Other countries</h4>
        </header>
        <div class="ecva-manage-other-grid">
          ${
            otherRows.length
              ? otherRows
                  .map((country) => buildOtherCountryCard(country))
                  .join("")
              : '<div class="ecva-manage-access-empty-row">No remaining countries.</div>'
          }
        </div>
      </article>
    `;
    manageBody.prepend(panel);
    wirePillarIconLoading(panel);
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
    toast.style.background = isError ? "#6a2e2e" : "#274351";
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
      toastTimer = null;
    }, 2200);
  }

  function syncAdminOverlayScrollLock() {
    const resetCodeModal = document.getElementById("ecva-reset-code-confirm");
    const isLocked = Boolean(
      (adminHub && adminHub.classList.contains("is-visible")) ||
      (manageRoot && manageRoot.classList.contains("is-visible")) ||
      (editorModal && editorModal.classList.contains("is-visible")) ||
      (versionHistoryModal &&
        versionHistoryModal.classList.contains("is-visible")) ||
      (labelManageModal && labelManageModal.classList.contains("is-visible")) ||
      (representativeManageModal &&
        representativeManageModal.classList.contains("is-visible")) ||
      (resetCodeModal && resetCodeModal.classList.contains("is-visible")),
    );
    document.documentElement.classList.toggle("ecva-scroll-locked", isLocked);
    document.body.classList.toggle("ecva-scroll-locked", isLocked);
  }

  function jumpToCountryWindowTopAcrossContexts() {
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (_error) {
      window.scrollTo(0, 0);
    }
    try {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch (_error) {
      // no-op
    }
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "ecva-scroll-parent-top" }, "*");
    }
  }

  function getCountryWindowTopOffset() {
    const shell = document.querySelector(".country-modal-shell");
    const modalRoot = document.getElementById("country-modal-root");
    if (!shell || !modalRoot || !modalRoot.classList.contains("is-visible"))
      return null;
    const rect = shell.getBoundingClientRect();
    if (!Number.isFinite(rect.top)) return null;
    return Math.max(12, Math.min(window.innerHeight * 0.24, rect.top + 12));
  }

  function setAdminOverlayTopOffset(modalNode, fallbackPx) {
    if (!modalNode) return;
    const anchoredTop = getCountryWindowTopOffset();
    const resolved = Number.isFinite(anchoredTop)
      ? Math.round(anchoredTop)
      : Math.max(12, Number(fallbackPx) || 24);
    modalNode.style.setProperty("--overlay-top", `${resolved}px`);
  }

  function releaseFocusBeforeHide(container, fallbackTarget) {
    if (!(container instanceof HTMLElement)) return;
    const active = document.activeElement;
    if (!(active instanceof HTMLElement)) return;
    if (!container.contains(active)) return;
    try {
      active.blur();
    } catch (_error) {
      // no-op
    }
    const fallback =
      (fallbackTarget instanceof HTMLElement ? fallbackTarget : null) ||
      (document.body instanceof HTMLElement ? document.body : null);
    if (fallback && typeof fallback.focus === "function") {
      if (!fallback.hasAttribute("tabindex")) {
        fallback.setAttribute("tabindex", "-1");
      }
      try {
        fallback.focus({ preventScroll: true });
      } catch (_error) {
        // no-op
      }
    }
  }

  function openHub() {
    if (!adminHub) return;
    jumpToCountryWindowTopAcrossContexts();
    setAdminOverlayTopOffset(adminHub, 22);
    adminHub.classList.add("is-visible");
    adminHub.setAttribute("aria-hidden", "false");
    syncAdminOverlayScrollLock();
  }

  function closeHub() {
    if (!adminHub) return;
    releaseFocusBeforeHide(adminHub, manageBtn || closeHubBtn);
    adminHub.classList.remove("is-visible");
    adminHub.setAttribute("aria-hidden", "true");
    syncAdminOverlayScrollLock();
  }

  function openManage(options) {
    const config = options && typeof options === "object" ? options : {};
    const prefillScopedView = Boolean(config.prefillScopedView);
    const requestFreshCountries = config.requestFreshCountries !== false;
    if (!manageRoot) return;
    jumpToCountryWindowTopAcrossContexts();
    closeHub();
    if (countryTabsHost) countryTabsHost.innerHTML = "";
    if (manageBody) manageBody.innerHTML = "";
    if (prefillScopedView) {
      ensureSelectedCountryIsAllowed();
      renderCountryTabs();
      if (selectedCountryId) {
        postToMap("ecva-request-country-modal-html", {
          countryId: selectedCountryId,
        });
        requestCountryInbox(selectedCountryId).catch(() => {});
      } else if (manageBody) {
        renderGeneralAccessPanel();
      }
    }
    manageRoot.classList.add("is-visible");
    manageRoot.setAttribute("aria-hidden", "false");
    syncAdminOverlayScrollLock();
    ensureVersionHistoryUi();
    ensureVersionHistoryButton();
    ensureLabelManageUi();
    ensureLabelManageButton();
    updateVersionHistoryButtonVisibility();
    if (requestFreshCountries) {
      postToMap("ecva-request-active-countries");
    }
  }

  async function launchManageFromAccessCode() {
    if (!manageBtn) return;
    manageBtn.disabled = true;
    try {
      await ensureActiveCountriesLoaded();
      const resolved = resolveAccessScope(
        accessCodeInput ? accessCodeInput.value : "",
      );
      if (!resolved) {
        showAccessCodeError(INVALID_CODE_MESSAGE);
        if (accessCodeInput) accessCodeInput.focus();
        return;
      }
      clearAccessCodeError();
      accessScope = resolved;
      if (accessScope.mode === "country") {
        selectedCountryId = accessScope.countryId;
      } else {
        selectedCountryId = "";
      }
      openManage({ prefillScopedView: true, requestFreshCountries: true });
    } catch (error) {
      showAccessCodeError("Could not validate code");
    } finally {
      manageBtn.disabled = false;
    }
  }

  function closeManage() {
    if (!manageRoot) return;
    closeResetCodeConfirm();
    closeEditorModal();
    closeVersionHistoryModal();
    closeLabelManageModal();
    closeRepresentativeManageModal();
    pendingInboxRequests.forEach((pending) => {
      if (pending && pending.timeout) window.clearTimeout(pending.timeout);
    });
    pendingInboxRequests.clear();
    pendingLabelOverrideRequests.forEach((pending) => {
      if (pending && pending.timeout) window.clearTimeout(pending.timeout);
      if (pending && typeof pending.resolve === "function") {
        pending.resolve(
          getLabelOverridesForLang(pending && pending.lang ? pending.lang : "en"),
        );
      }
    });
    pendingLabelOverrideRequests.clear();
    releaseFocusBeforeHide(manageRoot, manageBtn || closeManageBtn);
    manageRoot.classList.remove("is-visible");
    manageRoot.setAttribute("aria-hidden", "true");
    if (manageBody) manageBody.innerHTML = "";
    syncAdminOverlayScrollLock();
    postToMap("ecva-reset-embed-height");
    try {
      window.postMessage({ type: "ecva-reset-embed-height" }, "*");
      window.setTimeout(() => {
        window.postMessage({ type: "ecva-reset-embed-height" }, "*");
      }, 180);
    } catch (_error) {
      // no-op
    }
  }

  function openEditorModal() {
    if (!editorModal) return;
    jumpToCountryWindowTopAcrossContexts();
    setAdminOverlayTopOffset(editorModal, 24);
    editorModal.classList.add("is-visible");
    editorModal.setAttribute("aria-hidden", "false");
    syncAdminOverlayScrollLock();
  }

  function closeEditorModal() {
    if (!editorModal) return;
    releaseFocusBeforeHide(editorModal, closeManageBtn || manageBtn);
    editorModal.classList.remove("is-visible");
    editorModal.setAttribute("aria-hidden", "true");
    resetEditorRemoveState();
    editorTarget = null;
    editorMode = "entry";
    clearEditorFields();
    setEditorMode("entry");
    syncAdminOverlayScrollLock();
  }

  function ensureVersionHistoryUi() {
    if (versionHistoryModal) return;

    const style = document.createElement("style");
    style.textContent = `
      .ecva-version-modal{position:fixed;inset:0;z-index:3300;display:none;align-items:flex-start;justify-content:center;background:rgba(15,26,34,.52);padding:clamp(14px,3vw,26px);padding-top:var(--overlay-top,clamp(20px,8vh,72px));padding-bottom:clamp(14px,4vh,32px);overflow:hidden}
      .ecva-version-modal.is-visible{display:flex}
      .ecva-version-dialog{--ecva-version-target-height:min(600px,calc(100dvh - clamp(40px,13vh,118px)));width:min(760px,calc(100vw - 28px));height:var(--ecva-version-target-height);max-height:var(--ecva-version-target-height);overflow:hidden;border-radius:16px;border:1px solid rgba(128,149,161,.45);background:#f5fbfd;box-shadow:0 18px 46px rgba(21,38,49,.3);padding:16px;display:grid;grid-template-rows:auto auto minmax(0,1fr);gap:0}
      .ecva-version-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
      .ecva-version-title{margin:0;font:800 24px/1.15 "Alexandria",sans-serif;color:#223a46}
      .ecva-version-sub{margin:0 0 10px;color:#45616f;font:600 13px/1.4 "Alexandria",sans-serif}
      .ecva-version-close{height:38px;padding:0 12px;border-radius:10px;border:1px solid rgba(106,130,143,.58);background:#eef4f6;color:#2a414c;font:800 13px "Alexandria",sans-serif;cursor:pointer}
      .ecva-version-list{display:grid;gap:8px;overflow-y:auto;align-content:start;min-height:0;padding-right:2px}
      .ecva-version-item{display:grid;grid-template-columns:1fr auto;align-items:center;gap:10px;padding:10px 12px;border:1px solid rgba(142,161,171,.35);border-radius:12px;background:#fbfdfe}
      .ecva-version-meta{display:grid;gap:3px}
      .ecva-version-main{font:800 14px/1.2 "Alexandria",sans-serif;color:#223d49}
      .ecva-version-note{font:600 12px/1.25 "Alexandria",sans-serif;color:#597482}
      .ecva-version-restore{height:36px;padding:0 12px;border-radius:10px;border:1px solid rgba(108,132,145,.58);background:#e8f1f4;color:#27404c;font:800 12px "Alexandria",sans-serif;cursor:pointer}
      .ecva-version-empty{padding:14px;border:1px dashed rgba(137,158,169,.45);border-radius:12px;color:#5a7785;font:700 13px/1.3 "Alexandria",sans-serif}
    `;
    document.head.appendChild(style);

    const modal = document.createElement("div");
    modal.className = "ecva-version-modal";
    modal.setAttribute("aria-hidden", "true");
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
    versionHistoryList = modal.querySelector(".ecva-version-list");
    versionHistoryCloseBtn = modal.querySelector(".ecva-version-close");

    if (versionHistoryCloseBtn) {
      versionHistoryCloseBtn.addEventListener(
        "click",
        closeVersionHistoryModal,
      );
    }
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeVersionHistoryModal();
    });
  }

  function ensureVersionHistoryButton() {
    if (!manageRoot) return;
    if (versionHistoryBtn) {
      updateVersionHistoryButtonVisibility();
      return;
    }
    const topbar = manageRoot.querySelector(".ecva-manage-topbar");
    if (!topbar) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ecva-manage-close";
    btn.textContent = "Version history";
    btn.addEventListener("click", openVersionHistoryModal);
    const closeBtn = topbar.querySelector("#ecva-manage-close-btn");
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
    releaseFocusBeforeHide(versionHistoryModal, closeManageBtn || manageBtn);
    versionHistoryModal.classList.remove("is-visible");
    versionHistoryModal.setAttribute("aria-hidden", "true");
    syncAdminOverlayScrollLock();
  }

  function getLabelManageUiCopy() {
    const lang = normalizeLanguageCode(resolveEditorUiLanguageCode());
    if (lang === "ro") {
      return {
        title: "Traduceri etichete",
        close: "Închide",
        searchLabel: "Caută cuvinte sau sintagme",
        searchPlaceholder: "Caută cuvinte sau sintagme",
        allCategories: "Toate categoriile",
        resetAll: "Resetare completă",
        resetConfirm: "Apasă din nou pentru resetare",
        resetConfirmNotice: "Apasă încă o dată pentru resetare completă.",
        save: "Salvează traducerile",
        englishColumn: "Engleză",
        nativePlaceholder: "Traducere personalizată",
        nativePlaceholderWithDefault: "Implicit: {default}",
        loading: "Se încarcă traducerile...",
        empty: "Nu există etichete pentru această căutare.",
        sourceReadOnly:
          "Engleza este text sursă și nu poate fi personalizată.",
        sourceNoReset: "Engleza este text sursă și nu poate fi resetată.",
        savedNotice: "Traducerile au fost salvate.",
        savedToast: "Traducerile au fost salvate.",
        resetDoneNotice: "Suprascrierile limbii au fost resetate.",
        resetDoneToast: "Suprascrierile limbii au fost resetate.",
        noCountryLanguage: "Nu există limbă de țară disponibilă.",
        syncedNotice: "Traducerile au fost sincronizate.",
      };
    }
    return {
      title: "Label translations",
      close: "Close",
      searchLabel: "Search words or phrases",
      searchPlaceholder: "Search words or phrases",
      allCategories: "All categories",
      resetAll: "Full reset",
      resetConfirm: "Press again to confirm reset",
      resetConfirmNotice: "Press once more to confirm full reset.",
      save: "Save translations",
      englishColumn: "English",
      nativePlaceholder: "Custom translation",
      nativePlaceholderWithDefault: "Default: {default}",
      loading: "Loading translations...",
      empty: "No labels match this search.",
      sourceReadOnly: "English is source text and cannot be overridden.",
      sourceNoReset: "English is source text and cannot be reset.",
      savedNotice: "Translations saved.",
      savedToast: "Label translations saved.",
      resetDoneNotice: "Language overrides were reset.",
      resetDoneToast: "Language overrides reset.",
      noCountryLanguage: "No country language available.",
      syncedNotice: "Translations synced.",
    };
  }

  function getLabelManageGroupLabel(rawGroup) {
    const group = String(rawGroup || "general")
      .trim()
      .toLowerCase();
    const lang = normalizeLanguageCode(resolveEditorUiLanguageCode());
    const labels =
      lang === "ro"
        ? RESOURCE_LABEL_GROUP_LABELS_RO
        : RESOURCE_LABEL_GROUP_LABELS;
    return String(
      labels[group] ||
        RESOURCE_LABEL_GROUP_LABELS[group] ||
        RESOURCE_LABEL_GROUP_LABELS.general,
    );
  }

  function getLabelManageGroupList() {
    const groupSet = new Set(
      RESOURCE_LABEL_SCHEMA.map((item) =>
        String(item && item.group ? item.group : "general")
          .trim()
          .toLowerCase(),
      ),
    );
    const ordered = RESOURCE_LABEL_GROUP_ORDER.filter((group) =>
      groupSet.has(group),
    );
    const rest = Array.from(groupSet).filter(
      (group) => !ordered.includes(group),
    );
    return ordered.concat(
      rest.sort((a, b) =>
        getLabelManageGroupLabel(a).localeCompare(getLabelManageGroupLabel(b)),
      ),
    );
  }

  function updateLabelManageNotice(message, isError) {
    if (!labelManageNotice) return;
    labelManageNotice.textContent = String(message || "");
    labelManageNotice.classList.toggle("is-error", Boolean(isError));
  }

  function setLabelManageResetButtonArmed(isArmed) {
    if (labelManageResetTimer) {
      window.clearTimeout(labelManageResetTimer);
      labelManageResetTimer = null;
    }
    labelManageResetArmed = Boolean(isArmed);
    if (labelManageResetBtn) {
      labelManageResetBtn.classList.toggle("is-armed", labelManageResetArmed);
    }
    if (labelManageResetLabel) {
      const copy = getLabelManageUiCopy();
      labelManageResetLabel.textContent = labelManageResetArmed
        ? copy.resetConfirm
        : copy.resetAll;
    }
    if (labelManageResetArmed) {
      labelManageResetTimer = window.setTimeout(() => {
        setLabelManageResetButtonArmed(false);
      }, 2400);
    }
  }

  function applyLabelManageUiCopy() {
    const copy = getLabelManageUiCopy();
    if (labelManageTitle) labelManageTitle.textContent = copy.title;
    if (labelManageCloseBtn) labelManageCloseBtn.textContent = copy.close;
    if (labelManageFootCloseBtn) labelManageFootCloseBtn.textContent = copy.close;
    if (labelManageSearchLabel) labelManageSearchLabel.textContent = copy.searchLabel;
    if (labelManageSearchInput) {
      labelManageSearchInput.placeholder = copy.searchPlaceholder;
    }
    if (labelManageSaveBtn) labelManageSaveBtn.textContent = copy.save;
    if (labelManageResetLabel) {
      labelManageResetLabel.textContent = labelManageResetArmed
        ? copy.resetConfirm
        : copy.resetAll;
    }
  }

  function getResourceLabelSchemaRows(rawLang, searchText, rawCategory) {
    const lang = normalizeLanguageCode(rawLang);
    const draft = ensureLabelDraft(lang);
    const term = String(searchText || "")
      .trim()
      .toLowerCase();
    const category = String(rawCategory || "all")
      .trim()
      .toLowerCase();
    return RESOURCE_LABEL_SCHEMA.filter((item) => {
      const group = String(item.group || "general")
        .trim()
        .toLowerCase();
      if (category && category !== "all" && group !== category) return false;
      if (!term) return true;
      const key = String(item.key || "").toLowerCase();
      const english = String(item.english || "").toLowerCase();
      const draftValue = String(draft[item.key] || "").toLowerCase();
      const groupLabel = String(getLabelManageGroupLabel(group)).toLowerCase();
      return (
        key.includes(term) ||
        english.includes(term) ||
        draftValue.includes(term) ||
        groupLabel.includes(term)
      );
    });
  }

  function renderLabelManageCategoryFilters() {
    if (!labelManageCategoryList) return;
    const copy = getLabelManageUiCopy();
    const groups = getLabelManageGroupList();
    if (
      labelManageCategory !== "all" &&
      !groups.includes(labelManageCategory)
    ) {
      labelManageCategory = "all";
    }
    labelManageCategoryList.innerHTML = [
      `<button type="button" class="ecva-label-manage-category${labelManageCategory === "all" ? " is-active" : ""}" data-label-category="all">${escapeHtml(copy.allCategories)}</button>`,
      ...groups.map((group) => {
        const label = getLabelManageGroupLabel(group);
        const isActive = group === labelManageCategory;
        return `<button type="button" class="ecva-label-manage-category${isActive ? " is-active" : ""}" data-label-category="${escapeHtml(group)}">${escapeHtml(label)}</button>`;
      }),
    ].join("");
    labelManageCategoryList
      .querySelectorAll("[data-label-category]")
      .forEach((buttonEl) => {
        buttonEl.addEventListener("click", () => {
          labelManageCategory = String(
            buttonEl.getAttribute("data-label-category") || "all",
          )
            .trim()
            .toLowerCase();
          renderLabelManageCategoryFilters();
          renderLabelManageList();
        });
      });
  }

  function renderLabelManageList() {
    if (!labelManageList) return;
    const lang = normalizeLanguageCode(labelManageLanguage || "en");
    labelManageLanguage = lang;
    const copy = getLabelManageUiCopy();
    const draft = ensureLabelDraft(lang);
    const searchTerm =
      labelManageSearchInput && labelManageSearchInput.value
        ? labelManageSearchInput.value
        : "";
    const rows = getResourceLabelSchemaRows(lang, searchTerm, labelManageCategory);
    const langLabel = getLanguageDisplayLabel(lang);
    const isEditable = lang !== "en";
    if (labelManageSaveBtn) {
      labelManageSaveBtn.disabled = !isEditable;
    }
    if (!rows.length) {
      labelManageList.innerHTML = `<p class="ecva-label-manage-empty">${escapeHtml(copy.empty)}</p>`;
      return;
    }
    labelManageList.innerHTML = `
      <section class="ecva-label-manage-grid">
        <header class="ecva-label-manage-grid-head">
          <span class="ecva-label-manage-col">${escapeHtml(copy.englishColumn)}</span>
          <span class="ecva-label-manage-col">${escapeHtml(langLabel)}</span>
        </header>
        <div class="ecva-label-manage-items">
          ${rows
            .map((item) => {
              const key = String(item.key || "");
              const english = String(item.english || "").trim();
              const value = String(draft[key] || "");
              const placeholderTemplate = String(
                copy.nativePlaceholderWithDefault ||
                  "Default: {default}",
              );
              const placeholderWithDefault = english
                ? placeholderTemplate.split("{default}").join(english)
                : copy.nativePlaceholder;
              return `
                <div class="ecva-label-manage-item" data-label-key="${escapeHtml(key)}">
                  <span class="ecva-label-manage-english" title="${escapeHtml(english)}">${escapeHtml(english)}</span>
                  <input
                    type="text"
                    class="ecva-label-manage-native-input"
                    data-label-input="${escapeHtml(key)}"
                    value="${escapeHtml(value)}"
                    placeholder="${escapeHtml(placeholderWithDefault)}"
                    ${isEditable ? "" : 'readonly tabindex="-1"'}
                  />
                </div>
              `;
            })
            .join("")}
        </div>
      </section>
    `;
    labelManageList
      .querySelectorAll("input[data-label-input]")
      .forEach((inputEl) => {
        inputEl.addEventListener("input", () => {
          const key = String(inputEl.getAttribute("data-label-input") || "").trim();
          if (!key) return;
          const nextValue = String(inputEl.value || "").trim();
          if (!nextValue) {
            delete draft[key];
          } else {
            draft[key] = nextValue;
          }
        });
      });
  }

  function saveLabelOverridesFromModal() {
    const lang = normalizeLanguageCode(labelManageLanguage || "en");
    labelManageLanguage = lang;
    const copy = getLabelManageUiCopy();
    if (lang === "en") {
      updateLabelManageNotice(copy.sourceReadOnly, true);
      return;
    }
    const draft = sanitizeLabelOverrides(ensureLabelDraft(lang));
    labelDraftByLang[lang] = { ...draft };
    setLabelOverridesForLang(lang, draft);
    postToMap("ecva-editor-update-label-overrides", { lang, labels: draft });
    updateLabelManageNotice(copy.savedNotice, false);
    showToast(copy.savedToast);
  }

  function resetLabelOverridesForCurrentLanguage() {
    const lang = normalizeLanguageCode(labelManageLanguage || "en");
    labelManageLanguage = lang;
    const copy = getLabelManageUiCopy();
    if (!labelManageResetArmed) {
      setLabelManageResetButtonArmed(true);
      updateLabelManageNotice("", false);
      return;
    }
    setLabelManageResetButtonArmed(false);
    if (lang === "en") {
      updateLabelManageNotice(copy.sourceNoReset, true);
      return;
    }
    labelDraftByLang[lang] = {};
    setLabelOverridesForLang(lang, {});
    postToMap("ecva-editor-update-label-overrides", { lang, labels: {} });
    renderLabelManageList();
    updateLabelManageNotice(copy.resetDoneNotice, false);
    showToast(copy.resetDoneToast);
  }

  async function loadLabelOverridesIntoModal(rawLang) {
    const lang = normalizeLanguageCode(rawLang || getDefaultLabelManageLanguage());
    labelManageLanguage = lang;
    applyLabelManageUiCopy();
    updateLabelManageNotice(getLabelManageUiCopy().loading, false);
    const labels = await requestLabelOverrides(lang).catch(() => ({}));
    setLabelOverridesForLang(lang, labels);
    labelDraftByLang[lang] = { ...getLabelOverridesForLang(lang) };
    renderLabelManageCategoryFilters();
    renderLabelManageList();
    if (lang === "en") {
      updateLabelManageNotice(getLabelManageUiCopy().sourceReadOnly, false);
    } else {
      updateLabelManageNotice("", false);
    }
  }

  async function syncLabelManageLanguageWithContext() {
    const nextLang = normalizeLanguageCode(getDefaultLabelManageLanguage());
    if (!nextLang) return;
    if (!labelDraftByLang[nextLang]) {
      await loadLabelOverridesIntoModal(nextLang);
      return;
    }
    labelManageLanguage = nextLang;
    applyLabelManageUiCopy();
    renderLabelManageCategoryFilters();
    renderLabelManageList();
  }

  function ensureLabelManageUi() {
    if (labelManageModal) return;
    const style = document.createElement("style");
    style.textContent = `
      .ecva-label-manage-modal{position:fixed;inset:0;z-index:3340;display:none;align-items:flex-start;justify-content:center;background:rgba(15,26,34,.52);padding:clamp(14px,3vw,26px);padding-top:var(--overlay-top,clamp(20px,8vh,72px));padding-bottom:clamp(14px,4vh,32px);overflow:hidden}
      .ecva-label-manage-modal.is-visible{display:flex}
      .ecva-label-manage-dialog{--ecva-label-manage-target-height:min(600px,calc(100dvh - clamp(40px,13vh,118px)));width:min(980px,calc(100vw - 28px));height:var(--ecva-label-manage-target-height);max-height:var(--ecva-label-manage-target-height);overflow:hidden;border-radius:16px;border:1px solid rgba(128,149,161,.45);background:#f5fbfd;box-shadow:0 18px 46px rgba(21,38,49,.3);padding:16px;display:grid;grid-template-rows:auto auto auto minmax(0,1fr) auto;gap:10px}
      .ecva-label-manage-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
      .ecva-label-manage-title{margin:0;font:800 24px/1.15 "Alexandria",sans-serif;color:#223a46}
      .ecva-label-manage-close{height:38px;padding:0 12px;border-radius:10px;border:1px solid rgba(106,130,143,.58);background:#eef4f6;color:#2a414c;font:800 13px "Alexandria",sans-serif;cursor:pointer}
      .ecva-label-manage-filters{display:flex;align-items:flex-end;justify-content:flex-start;gap:10px;flex-wrap:wrap}
      .ecva-label-manage-search-wrap{display:grid;gap:4px;min-width:min(380px,100%);flex:1 1 420px}
      .ecva-label-manage-search-wrap>span{font:700 12px/1.2 "Alexandria",sans-serif;color:#3f5d6b}
      .ecva-label-manage-search-wrap input{height:38px;border-radius:10px;border:1px solid rgba(116,139,151,.52);background:#fbfeff;color:#243e4b;font:700 13px "Alexandria",sans-serif;padding:0 10px;box-sizing:border-box}
      .ecva-label-manage-btn{height:38px;padding:0 12px;border-radius:10px;border:1px solid rgba(108,132,145,.58);background:#e8f1f4;color:#27404c;font:800 13px "Alexandria",sans-serif;cursor:pointer}
      .ecva-label-manage-btn.primary{background:#2f4f60;color:#f4fbff;border-color:#2f4f60}
      .ecva-label-manage-btn:disabled{opacity:.45;cursor:not-allowed}
      .ecva-label-manage-reset{display:inline-flex;align-items:center;gap:8px;border-color:rgba(167,91,91,.62);background:#fff2f2;color:#8a3131}
      .ecva-label-manage-reset-icon{font:800 15px/1 "Alexandria",sans-serif}
      .ecva-label-manage-reset.is-armed{border-color:rgba(151,44,44,.8);background:#e74e4e;color:#ffffff}
      .ecva-label-manage-categories{display:flex;gap:8px;overflow:auto;padding-bottom:2px}
      .ecva-label-manage-category{height:34px;padding:0 11px;border-radius:999px;border:1px solid rgba(117,141,154,.5);background:#eef5f8;color:#2f4b58;font:800 12px "Alexandria",sans-serif;cursor:pointer;white-space:nowrap}
      .ecva-label-manage-category.is-active{background:#2f4f60;color:#f4fbff;border-color:#2f4f60}
      .ecva-label-manage-list{overflow:auto;min-height:0;border:1px solid rgba(141,161,172,.38);border-radius:12px;background:#fff;padding:10px}
      .ecva-label-manage-grid{display:grid;gap:8px;align-content:start}
      .ecva-label-manage-grid-head{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:0 2px}
      .ecva-label-manage-col{font:800 12px/1.2 "Alexandria",sans-serif;color:#3f5d6b;text-transform:uppercase;letter-spacing:.02em}
      .ecva-label-manage-items{display:grid;gap:6px;align-content:start}
      .ecva-label-manage-item{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;align-items:center}
      .ecva-label-manage-english{display:flex;align-items:center;min-height:38px;padding:0 11px;border-radius:10px;border:1px solid rgba(130,152,164,.45);background:#f3f7f9;color:#405d6b;font:700 12px/1.2 "Alexandria",sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ecva-label-manage-native-input{height:38px;border-radius:10px;border:1px solid rgba(116,139,151,.52);background:#fbfeff;color:#223f4c;font:700 12px "Alexandria",sans-serif;padding:0 10px;box-sizing:border-box}
      .ecva-label-manage-native-input[readonly]{background:#f0f4f7;color:#587180;cursor:not-allowed}
      .ecva-label-manage-foot{display:flex;align-items:center;justify-content:space-between;gap:10px}
      .ecva-label-manage-left-actions{display:flex;align-items:center;gap:10px;min-width:0}
      .ecva-label-manage-notice{min-height:18px;font:700 12px/1.2 "Alexandria",sans-serif;color:#3f5d6b}
      .ecva-label-manage-notice.is-error{color:#b42318}
      .ecva-label-manage-actions{display:flex;align-items:center;gap:8px}
      .ecva-label-manage-empty{margin:0;padding:12px;border:1px dashed rgba(137,158,169,.45);border-radius:12px;color:#5a7785;font:700 13px/1.3 "Alexandria",sans-serif}
      @media (max-width:900px){.ecva-label-manage-dialog{width:min(980px,calc(100vw - 14px));padding:12px}.ecva-label-manage-search-wrap{min-width:100%;flex:1 1 100%}.ecva-label-manage-filters{align-items:stretch}.ecva-label-manage-grid-head{display:none}.ecva-label-manage-item{grid-template-columns:1fr}.ecva-label-manage-foot{flex-wrap:wrap}.ecva-label-manage-left-actions{width:100%;order:2}.ecva-label-manage-actions{width:100%;justify-content:flex-end;order:1}}
    `;
    document.head.appendChild(style);

    const modal = document.createElement("div");
    modal.className = "ecva-label-manage-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <section class="ecva-label-manage-dialog" role="dialog" aria-modal="true" aria-label="Label translations">
        <header class="ecva-label-manage-head">
          <h3 class="ecva-label-manage-title">Label translations</h3>
          <button type="button" class="ecva-label-manage-close">Close</button>
        </header>
        <section class="ecva-label-manage-filters">
          <label class="ecva-label-manage-search-wrap">
            <span>Caută cuvinte sau sintagme</span>
            <input type="search" class="ecva-label-manage-search" placeholder="Caută cuvinte sau sintagme" />
          </label>
        </section>
        <div class="ecva-label-manage-categories"></div>
        <div class="ecva-label-manage-list"></div>
        <footer class="ecva-label-manage-foot">
          <div class="ecva-label-manage-left-actions">
            <button type="button" class="ecva-label-manage-btn ecva-label-manage-reset">
              <span class="ecva-label-manage-reset-icon" aria-hidden="true">↻</span>
              <span class="ecva-label-manage-reset-label">Resetare completă</span>
            </button>
            <p class="ecva-label-manage-notice" aria-live="polite"></p>
          </div>
          <div class="ecva-label-manage-actions">
            <button type="button" class="ecva-label-manage-btn primary">Save translations</button>
            <button type="button" class="ecva-label-manage-btn" data-label-close="1">Close</button>
          </div>
        </footer>
      </section>
    `;
    document.body.appendChild(modal);

    labelManageModal = modal;
    labelManageCloseBtn = modal.querySelector(".ecva-label-manage-close");
    labelManageFootCloseBtn = modal.querySelector('[data-label-close="1"]');
    labelManageTitle = modal.querySelector(".ecva-label-manage-title");
    labelManageSearchLabel = modal.querySelector(".ecva-label-manage-search-wrap > span");
    labelManageSearchInput = modal.querySelector(".ecva-label-manage-search");
    labelManageCategoryList = modal.querySelector(".ecva-label-manage-categories");
    labelManageList = modal.querySelector(".ecva-label-manage-list");
    labelManageSaveBtn = modal.querySelector(".ecva-label-manage-btn.primary");
    labelManageResetBtn = modal.querySelector(".ecva-label-manage-reset");
    labelManageResetLabel = modal.querySelector(".ecva-label-manage-reset-label");
    labelManageNotice = modal.querySelector(".ecva-label-manage-notice");

    labelManageCloseBtn?.addEventListener("click", closeLabelManageModal);
    labelManageFootCloseBtn?.addEventListener("click", closeLabelManageModal);
    labelManageModal.addEventListener("click", (event) => {
      if (event.target === labelManageModal) closeLabelManageModal();
    });
    labelManageSearchInput?.addEventListener("input", () => {
      renderLabelManageList();
    });
    labelManageSaveBtn?.addEventListener("click", saveLabelOverridesFromModal);
    labelManageResetBtn?.addEventListener(
      "click",
      resetLabelOverridesForCurrentLanguage,
    );
    applyLabelManageUiCopy();
    renderLabelManageCategoryFilters();
  }

  function ensureLabelManageButton() {
    if (!manageRoot) return;
    if (labelManageBtn) return;
    const topbar = manageRoot.querySelector(".ecva-manage-topbar");
    if (!topbar) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ecva-manage-close";
    btn.textContent = "Label translations";
    btn.addEventListener("click", openLabelManageModal);
    const closeBtn = topbar.querySelector("#ecva-manage-close-btn");
    if (closeBtn && closeBtn.parentNode === topbar) {
      topbar.insertBefore(btn, closeBtn);
    } else {
      topbar.appendChild(btn);
    }
    labelManageBtn = btn;
  }

  async function openLabelManageModal() {
    ensureLabelManageUi();
    if (!labelManageModal) return;
    labelManageLanguage = normalizeLanguageCode(getDefaultLabelManageLanguage());
    labelManageCategory = "all";
    setLabelManageResetButtonArmed(false);
    applyLabelManageUiCopy();
    if (!labelManageLanguage) {
      updateLabelManageNotice(getLabelManageUiCopy().noCountryLanguage, true);
      return;
    }
    await loadLabelOverridesIntoModal(labelManageLanguage);
    jumpToCountryWindowTopAcrossContexts();
    setAdminOverlayTopOffset(labelManageModal, 24);
    labelManageModal.classList.add("is-visible");
    labelManageModal.setAttribute("aria-hidden", "false");
    syncAdminOverlayScrollLock();
    if (labelManageSearchInput) {
      labelManageSearchInput.value = "";
      renderLabelManageCategoryFilters();
      renderLabelManageList();
      labelManageSearchInput.focus({ preventScroll: true });
    }
  }

  function closeLabelManageModal() {
    if (!labelManageModal) return;
    setLabelManageResetButtonArmed(false);
    releaseFocusBeforeHide(labelManageModal, closeManageBtn || manageBtn);
    labelManageModal.classList.remove("is-visible");
    labelManageModal.setAttribute("aria-hidden", "true");
    syncAdminOverlayScrollLock();
  }

  function ensureRepresentativeManageUi() {
    if (representativeManageModal) return;
    const style = document.createElement("style");
    style.textContent = `
      .ecva-rep-manage-modal{position:fixed;inset:0;z-index:3320;display:none;align-items:flex-start;justify-content:center;background:rgba(15,26,34,.52);padding:clamp(14px,3vw,26px);padding-top:var(--overlay-top,clamp(20px,8vh,72px));padding-bottom:clamp(14px,4vh,32px);overflow:hidden}
      .ecva-rep-manage-modal.is-visible{display:flex}
      .ecva-rep-manage-dialog{width:min(780px,calc(100vw - 28px));max-height:calc(100dvh - clamp(40px,13vh,118px));overflow:auto;border-radius:16px;border:1px solid rgba(128,149,161,.45);background:#f5fbfd;box-shadow:0 18px 46px rgba(21,38,49,.3);padding:16px;display:grid;gap:12px}
      .ecva-rep-manage-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
      .ecva-rep-manage-title{margin:0;font:800 24px/1.15 "Alexandria",sans-serif;color:#223a46}
      .ecva-rep-manage-close{height:38px;padding:0 12px;border-radius:10px;border:1px solid rgba(106,130,143,.58);background:#eef4f6;color:#2a414c;font:800 13px "Alexandria",sans-serif;cursor:pointer}
      .ecva-rep-manage-list{display:grid;gap:8px}
      .ecva-rep-manage-empty{padding:14px;border:1px dashed rgba(137,158,169,.45);border-radius:12px;color:#5a7785;font:700 13px/1.3 "Alexandria",sans-serif}
      .ecva-rep-manage-row{display:grid;grid-template-columns:auto auto minmax(0,1fr) auto auto;align-items:center;gap:10px;padding:10px 12px;border:1px solid rgba(142,161,171,.35);border-radius:12px;background:#fbfdfe}
      .ecva-rep-manage-row.is-dragging{opacity:.65}
      .ecva-rep-manage-row.is-drop-before{box-shadow:inset 0 2px 0 #2d5568}
      .ecva-rep-manage-row.is-drop-after{box-shadow:inset 0 -2px 0 #2d5568}
      .ecva-rep-manage-order{font:800 14px/1 "Alexandria",sans-serif;color:#284450}
      .ecva-rep-manage-thumb{width:42px;height:42px;border-radius:10px;overflow:hidden;border:1px solid rgba(123,146,159,.45);background:#e4edf2;display:inline-flex;align-items:center;justify-content:center}
      .ecva-rep-manage-thumb img{width:100%;height:100%;object-fit:cover;display:block}
      .ecva-rep-manage-thumb.is-empty::before{content:"?";font:800 16px/1 "Alexandria",sans-serif;color:#67818e}
      .ecva-rep-manage-main{min-width:0;display:grid;gap:2px}
      .ecva-rep-manage-name{margin:0;font:800 14px/1.25 "Alexandria",sans-serif;color:#203945;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ecva-rep-manage-meta{margin:0;font:600 12px/1.35 "Alexandria",sans-serif;color:#567180;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ecva-rep-manage-edit{height:34px;padding:0 10px;border-radius:10px;border:1px solid rgba(108,132,145,.58);background:#e8f1f4;color:#27404c;font:800 12px "Alexandria",sans-serif;cursor:pointer}
      .ecva-rep-manage-handle{font:700 16px/1 "Alexandria",sans-serif;color:#5d7988;cursor:grab;padding:0 2px;user-select:none}
      .ecva-rep-manage-foot{display:flex;justify-content:flex-end}
      .ecva-rep-manage-add{height:42px;padding:0 14px;border-radius:10px;border:1px solid rgba(108,132,145,.58);background:#e8f1f4;color:#27404c;font:800 14px "Alexandria",sans-serif;cursor:pointer}
    `;
    document.head.appendChild(style);

    representativeManageModal = document.createElement("div");
    representativeManageModal.className = "ecva-rep-manage-modal";
    representativeManageModal.setAttribute("aria-hidden", "true");
    representativeManageModal.innerHTML = `
      <section class="ecva-rep-manage-dialog" role="dialog" aria-modal="true" aria-label="Manage representatives">
        <header class="ecva-rep-manage-head">
          <h3 class="ecva-rep-manage-title">Manage representatives</h3>
          <button type="button" class="ecva-rep-manage-close">Close</button>
        </header>
        <div class="ecva-rep-manage-list"></div>
        <footer class="ecva-rep-manage-foot">
          <button type="button" class="ecva-rep-manage-add">+ Add representative</button>
        </footer>
      </section>
    `;
    document.body.appendChild(representativeManageModal);
    representativeManageList = representativeManageModal.querySelector(
      ".ecva-rep-manage-list",
    );
    representativeManageCloseBtn = representativeManageModal.querySelector(
      ".ecva-rep-manage-close",
    );
    representativeManageAddBtn = representativeManageModal.querySelector(
      ".ecva-rep-manage-add",
    );
    representativeManageCloseBtn?.addEventListener(
      "click",
      closeRepresentativeManageModal,
    );
    representativeManageModal.addEventListener("click", (event) => {
      if (event.target === representativeManageModal) {
        closeRepresentativeManageModal();
      }
    });
    representativeManageAddBtn?.addEventListener("click", () => {
      const targetCountry = normalizeManageCountryCode(
        representativeManageCountryId || selectedCountryId,
      );
      if (!targetCountry) return;
      closeRepresentativeManageModal();
      openAddRepresentativeEditor(targetCountry);
    });
  }

  function getRepresentativeSlides(scope) {
    if (!scope) return [];
    const slides = Array.from(
      scope.querySelectorAll(".country-modal-rep-slide"),
    ).filter((slideEl) => !slideEl.classList.contains("is-empty"));
    return slides.map((slideEl, orderIndex) => {
      const parsedIndex = Number(slideEl.getAttribute("data-slide-index"));
      const index =
        Number.isInteger(parsedIndex) && parsedIndex >= 0
          ? parsedIndex
          : orderIndex;
      const name = String(
        slideEl.querySelector(".country-modal-rep-meta h5")?.textContent || "",
      ).trim();
      const title = String(
        slideEl.querySelector(".country-modal-representative-title")
          ?.textContent || "",
      ).trim();
      const organisation = String(
        slideEl.querySelector(".country-modal-representative-org")
          ?.textContent || "",
      ).trim();
      const image = String(
        slideEl
          .querySelector(".country-modal-rep-media img")
          ?.getAttribute("src") || "",
      ).trim();
      return {
        slideEl,
        orderIndex,
        representativeIndex: index,
        name: name || `Representative ${orderIndex + 1}`,
        title,
        organisation,
        image,
      };
    });
  }

  function renderRepresentativeManageList(countryId) {
    if (!representativeManageList || !manageBody) return;
    const normalizedCountryId = normalizeManageCountryCode(
      countryId || selectedCountryId,
    );
    representativeManageCountryId = normalizedCountryId;
    const records = getRepresentativeSlides(manageBody);
    if (!records.length) {
      representativeManageList.innerHTML =
        '<p class="ecva-rep-manage-empty">No representatives available yet.</p>';
      return;
    }
    representativeManageList.innerHTML = records
      .map((record, rowIndex) => {
        const meta = [record.title, record.organisation]
          .filter(Boolean)
          .join(" • ");
        const thumbHtml = record.image
          ? `<span class="ecva-rep-manage-thumb"><img src="${escapeHtml(record.image)}" alt="${escapeHtml(record.name)}" loading="lazy" decoding="async" /></span>`
          : '<span class="ecva-rep-manage-thumb is-empty" aria-hidden="true"></span>';
        return `
          <article class="ecva-rep-manage-row" draggable="true" data-row-index="${rowIndex}">
            <span class="ecva-rep-manage-order">${rowIndex + 1}.</span>
            ${thumbHtml}
            <div class="ecva-rep-manage-main">
              <p class="ecva-rep-manage-name">${escapeHtml(record.name)}</p>
              <p class="ecva-rep-manage-meta">${escapeHtml(meta || "No title provided")}</p>
            </div>
            <button type="button" class="ecva-rep-manage-edit" data-rep-index="${record.representativeIndex}">Edit</button>
            <span class="ecva-rep-manage-handle" aria-hidden="true">⋮⋮</span>
          </article>
        `;
      })
      .join("");

    representativeManageList
      .querySelectorAll(".ecva-rep-manage-edit")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const repIndex = Number(btn.getAttribute("data-rep-index"));
          if (!Number.isInteger(repIndex) || repIndex < 0) return;
          const slideEl = manageBody.querySelector(
            `.country-modal-rep-slide[data-slide-index="${repIndex}"]`,
          );
          if (!slideEl) return;
          closeRepresentativeManageModal();
          openRepresentativeEditor(slideEl, normalizedCountryId, repIndex);
        });
      });

    let dragIndex = -1;
    let dropIndex = -1;
    let dropPlacement = "after";
    const rows = Array.from(
      representativeManageList.querySelectorAll(".ecva-rep-manage-row"),
    );
    const clearDropState = () => {
      rows.forEach((row) =>
        row.classList.remove("is-drop-before", "is-drop-after"),
      );
      dropIndex = -1;
      dropPlacement = "after";
    };
    rows.forEach((row) => {
      row.addEventListener("dragstart", (event) => {
        dragIndex = Number(row.getAttribute("data-row-index"));
        row.classList.add("is-dragging");
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", String(dragIndex));
        }
      });
      row.addEventListener("dragend", () => {
        row.classList.remove("is-dragging");
        dragIndex = -1;
        clearDropState();
      });
      row.addEventListener("dragover", (event) => {
        event.preventDefault();
        const targetIndex = Number(row.getAttribute("data-row-index"));
        if (!Number.isInteger(targetIndex)) return;
        const rect = row.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const placeBefore = event.clientY < midY;
        dropIndex = targetIndex;
        dropPlacement = placeBefore ? "before" : "after";
        rows.forEach((next) => {
          next.classList.remove("is-drop-before", "is-drop-after");
        });
        row.classList.add(placeBefore ? "is-drop-before" : "is-drop-after");
      });
      row.addEventListener("drop", (event) => {
        event.preventDefault();
        if (!Number.isInteger(dragIndex) || dragIndex < 0) return;
        const targetIndex = Number(row.getAttribute("data-row-index"));
        if (!Number.isInteger(targetIndex) || targetIndex < 0) return;
        let finalIndex = targetIndex;
        if (dropPlacement === "after" && dragIndex < targetIndex) {
          finalIndex = targetIndex;
        } else if (dropPlacement === "after" && dragIndex > targetIndex) {
          finalIndex = targetIndex + 1;
        } else if (dropPlacement === "before" && dragIndex > targetIndex) {
          finalIndex = targetIndex;
        } else if (dropPlacement === "before" && dragIndex < targetIndex) {
          finalIndex = Math.max(0, targetIndex - 1);
        }
        if (finalIndex === dragIndex) {
          clearDropState();
          return;
        }
        postToMap("ecva-editor-reorder-representative", {
          countryId: normalizedCountryId,
          fromIndex: dragIndex,
          toIndex: finalIndex,
        });
        clearDropState();
      });
    });
  }

  function openRepresentativeManageModal(countryId) {
    ensureRepresentativeManageUi();
    if (!representativeManageModal) return;
    const normalizedCountryId = normalizeManageCountryCode(
      countryId || selectedCountryId,
    );
    if (!normalizedCountryId) return;
    representativeManageCountryId = normalizedCountryId;
    renderRepresentativeManageList(normalizedCountryId);
    jumpToCountryWindowTopAcrossContexts();
    setAdminOverlayTopOffset(representativeManageModal, 24);
    representativeManageModal.classList.add("is-visible");
    representativeManageModal.setAttribute("aria-hidden", "false");
    syncAdminOverlayScrollLock();
  }

  function closeRepresentativeManageModal() {
    if (!representativeManageModal) return;
    releaseFocusBeforeHide(
      representativeManageModal,
      closeManageBtn || manageBtn,
    );
    representativeManageModal.classList.remove("is-visible");
    representativeManageModal.setAttribute("aria-hidden", "true");
    syncAdminOverlayScrollLock();
  }

  function formatVersionDate(value) {
    const d = new Date(String(value || ""));
    if (!Number.isFinite(d.getTime())) return "Unknown time";
    return d.toLocaleString();
  }

  async function fetchVersions(scopeCountryId) {
    const scopedCountry = getVersionScopeCountryId(scopeCountryId);
    if (!scopedCountry) return [];
    const scope = `country:${scopedCountry}`;
    const response = await fetch(
      `${EDITOR_VERSIONS_API}?limit=30&scope=${encodeURIComponent(scope)}`,
      { cache: "no-store" },
    );
    if (!response.ok) throw new Error("versions_fetch_failed");
    const payload = await response.json();
    return Array.isArray(payload && payload.versions) ? payload.versions : [];
  }

  async function rollbackToVersion(versionId, scopeCountryId) {
    const scopedCountry = getVersionScopeCountryId(scopeCountryId);
    if (!scopedCountry) throw new Error("missing_scope");
    const response = await fetch(EDITOR_VERSIONS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId, scope: `country:${scopedCountry}` }),
    });
    if (!response.ok) throw new Error("rollback_failed");
    const payload = await response.json();
    if (
      !payload ||
      payload.ok === false ||
      !payload.state ||
      typeof payload.state !== "object"
    ) {
      throw new Error("rollback_invalid_payload");
    }
    postToMap("ecva-editor-apply-state", { state: payload.state });
    if (selectedCountryId) {
      postToMap("ecva-request-country-modal-html", {
        countryId: selectedCountryId,
      });
    }
    showToast("Version restored.");
  }

  function renderVersionHistory(items) {
    if (!versionHistoryList) return;
    const list = Array.isArray(items) ? items : [];
    if (!list.length) {
      versionHistoryList.innerHTML =
        '<div class="ecva-version-empty">No saved versions yet.</div>';
      return;
    }
    versionHistoryList.innerHTML = "";
    list.forEach((item) => {
      const row = document.createElement("article");
      row.className = "ecva-version-item";
      const id = Number(item && item.versionId);
      row.innerHTML = `
        <div class="ecva-version-meta">
          <div class="ecva-version-main">Version #${Number.isInteger(id) ? id : "n/a"}</div>
          <div class="ecva-version-note">${formatVersionDate(item && item.createdAt)} • ${String((item && item.note) || "save")}</div>
        </div>
      `;
      const restore = document.createElement("button");
      restore.type = "button";
      restore.className = "ecva-version-restore";
      restore.textContent = "Restore";
      restore.disabled = !canEditContent() || !Number.isInteger(id);
      restore.title = canEditContent()
        ? "Restore this version"
        : "Read-only mode";
      restore.addEventListener("click", async () => {
        if (!canEditContent() || !Number.isInteger(id)) return;
        restore.disabled = true;
        const prev = restore.textContent;
        restore.textContent = "Restoring...";
        try {
          await rollbackToVersion(id);
          closeVersionHistoryModal();
        } catch (error) {
          showToast("Could not restore this version.", true);
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
      showToast("Choose a country first.");
      return;
    }
    jumpToCountryWindowTopAcrossContexts();
    setAdminOverlayTopOffset(versionHistoryModal, 24);
    versionHistoryModal.classList.add("is-visible");
    versionHistoryModal.setAttribute("aria-hidden", "false");
    syncAdminOverlayScrollLock();
    versionHistoryList.innerHTML =
      '<div class="ecva-version-empty">Loading versions...</div>';
    try {
      const versions = await fetchVersions(scopeCountryId);
      renderVersionHistory(versions);
    } catch (error) {
      versionHistoryList.innerHTML =
        '<div class="ecva-version-empty">Could not load version history.</div>';
    }
    if (!versionHistoryWired) {
      versionHistoryWired = true;
    }
  }

  function getEditorTargetPillarId() {
    const target = editorTarget && typeof editorTarget === "object" ? editorTarget : null;
    if (!target) return "";
    const explicit = String(target.pillarId || "")
      .trim()
      .toLowerCase();
    if (explicit) return explicit;
    if (target.type === "submission-article") return "resources";
    return "";
  }

  function applyEditorDialogTheme() {
    if (!editorDialog) return;
    const themeClasses = [
      "is-pillar-resources",
      "is-pillar-events",
      "is-pillar-organisations",
      "is-pillar-research",
      "is-pillar-government",
      "is-pillar-default",
    ];
    themeClasses.forEach((theme) => editorDialog.classList.remove(theme));
    const pillarId = getEditorTargetPillarId();
    if (!pillarId) {
      editorDialog.classList.add("is-pillar-default");
      return;
    }
    if (pillarId === "resources") {
      editorDialog.classList.add("is-pillar-resources");
      return;
    }
    if (pillarId === "events") {
      editorDialog.classList.add("is-pillar-events");
      return;
    }
    if (pillarId === "organisations") {
      editorDialog.classList.add("is-pillar-organisations");
      return;
    }
    if (pillarId === "research") {
      editorDialog.classList.add("is-pillar-research");
      return;
    }
    if (pillarId === "government") {
      editorDialog.classList.add("is-pillar-government");
      return;
    }
    editorDialog.classList.add("is-pillar-default");
  }

  function updateEditorHeading() {
    if (!editorHeading) return;
    const copy = getEditorUiCopy(editorUiCopyLang);
    if (editorMode === "representative") {
      editorHeading.textContent =
        copy.editRepresentative || EDITOR_UI_COPY_BASE.editRepresentative;
      return;
    }
    if (!editorReviewWizardEnabled || !editorReviewSteps.length) {
      editorHeading.textContent = copy.reviewEntry || EDITOR_UI_COPY_BASE.reviewEntry;
      return;
    }
    const currentStep =
      editorReviewSteps[editorReviewStepIndex] ||
      editorReviewSteps[editorReviewSteps.length - 1] ||
      null;
    if (!currentStep) {
      editorHeading.textContent = copy.reviewEntry || EDITOR_UI_COPY_BASE.reviewEntry;
      return;
    }
    const stepWord = copy.stepWord || EDITOR_UI_COPY_BASE.stepWord;
    const stepLabel = String(currentStep.label || "").trim();
    const stepTitle = `${stepWord} ${editorReviewStepIndex + 1}`;
    editorHeading.textContent = stepLabel
      ? `${copy.reviewEntry || EDITOR_UI_COPY_BASE.reviewEntry} - ${stepTitle}: ${stepLabel}`
      : `${copy.reviewEntry || EDITOR_UI_COPY_BASE.reviewEntry} - ${stepTitle}`;
  }

  function refreshEditorUiLanguage() {
    const lang = resolveEditorUiLanguageCode();
    editorUiCopyLang = lang;
    ensureEditorUiCopy(lang);
    const copy = getEditorUiCopy(lang);
    if (editorTitleFieldLabel) {
      editorTitleFieldLabel.textContent = copy.title || EDITOR_UI_COPY_BASE.title;
    }
    if (editorDescriptionFieldLabel) {
      editorDescriptionFieldLabel.textContent =
        copy.stepDescriptionLabel ||
        copy.description ||
        EDITOR_UI_COPY_BASE.stepDescriptionLabel ||
        EDITOR_UI_COPY_BASE.description;
    }
    if (editorTitle) {
      editorTitle.placeholder =
        copy.titlePlaceholder || EDITOR_UI_COPY_BASE.titlePlaceholder;
    }
    if (editorDescription) {
      editorDescription.placeholder =
        copy.descriptionPlaceholder || EDITOR_UI_COPY_BASE.descriptionPlaceholder;
    }
    updateEditorTextCounters();
    if (editorBackBtn) {
      editorBackBtn.textContent = copy.back || EDITOR_UI_COPY_BASE.back;
    }
    if (editorCancelBtn) {
      editorCancelBtn.textContent = copy.cancel || EDITOR_UI_COPY_BASE.cancel;
    }
    if (editorRemoveBtn) {
      const removeText = copy.removeItem || EDITOR_UI_COPY_BASE.removeItem;
      editorRemoveBtn.setAttribute("aria-label", removeText);
      editorRemoveBtn.setAttribute("title", removeText);
    }
    if (editorRemoveConfirmText) {
      editorRemoveConfirmText.textContent =
        copy.confirmAction || EDITOR_UI_COPY_BASE.confirmAction;
    }
    if (editorPendingBtn) {
      editorPendingBtn.textContent =
        copy.pendingAction || EDITOR_UI_COPY_BASE.pendingAction;
    }
    if (editorAcceptBtn) {
      editorAcceptBtn.textContent =
        copy.acceptAction || EDITOR_UI_COPY_BASE.acceptAction;
    }
  }

  function setEditorMode(mode) {
    editorMode = mode === "representative" ? "representative" : "entry";
    refreshEditorUiLanguage();
    applyEditorDialogTheme();
    if (entryFieldsWrap) {
      entryFieldsWrap.classList.toggle("is-visible", editorMode === "entry");
    }
    if (repFieldsWrap) {
      repFieldsWrap.classList.toggle(
        "is-visible",
        editorMode === "representative",
      );
    }
    if (editorRemoveBtn) {
      const canRemove =
        Boolean(editorTarget) &&
        ((editorMode === "representative" &&
          editorTarget.action !== "add" &&
          (editorTarget.type === "representative" ||
            editorTarget.type === "submission-representative")) ||
          (editorMode === "entry" &&
            ((editorTarget.type === "entry" &&
              editorTarget.action !== "add" &&
              Number.isInteger(editorTarget.entryIndex)) ||
              editorTarget.type === "submission-article")));
      editorRemoveBtn.style.display = canRemove ? "inline-flex" : "none";
      resetEditorRemoveState();
    }
    configureEditorReviewWizard();
    updateEditorHeading();
  }

  function setSubmissionEntryFieldsVisible(isVisible) {
    if (!entryFieldsWrap) return;
    entryFieldsWrap.classList.toggle("is-submission", Boolean(isVisible));
  }

  function getEditorReviewStepDefinitions() {
    const copy = getEditorUiCopy(editorUiCopyLang);
    return [
      {
        id: "text",
        label: getEditorStepOneLabel(),
        panel: editorStepTextPanel,
        validate: (paintInvalid) => validateEditorTextStep(paintInvalid),
      },
      {
        id: "translation",
        label:
          copy.stepCheckTranslation || EDITOR_UI_COPY_BASE.stepCheckTranslation,
        panel: editorStepTranslationPanel,
        validate: (paintInvalid) =>
          validateEditorTranslationStep(paintInvalid),
      },
      {
        id: "languages",
        label:
          copy.stepLanguagesLinks || EDITOR_UI_COPY_BASE.stepLanguagesLinks,
        panel: editorStepLanguagesPanel,
        validate: (paintInvalid) =>
          validateEditorLanguageAndLinkFields(paintInvalid),
      },
      {
        id: "contact",
        label:
          copy.stepContactDetails || EDITOR_UI_COPY_BASE.stepContactDetails,
        panel: editorStepContactPanel,
        validate: (paintInvalid) => validateEditorContactFields(paintInvalid),
      },
    ];
  }

  function isEditorSubmissionArticleTarget() {
    return Boolean(
      editorMode === "entry" &&
        editorTarget &&
        typeof editorTarget === "object" &&
        editorTarget.type === "submission-article",
    );
  }

  function getEditorReviewStepError(stepIndex, paintInvalid) {
    if (!editorReviewWizardEnabled) return "";
    const step = editorReviewSteps[Number(stepIndex)];
    if (!step || typeof step.validate !== "function") return "";
    return String(step.validate(Boolean(paintInvalid)) || "");
  }

  function validateEditorReviewStepsUntil(stepIndex, paintInvalid) {
    if (!editorReviewWizardEnabled) return "";
    const limit = Math.min(Number(stepIndex), editorReviewSteps.length - 1);
    for (let index = 0; index <= limit; index += 1) {
      const message = getEditorReviewStepError(index, paintInvalid);
      if (message) return message;
    }
    return "";
  }

  function getFirstInvalidEditorReviewStepIndex(paintInvalid) {
    if (!editorReviewWizardEnabled) return -1;
    for (let index = 0; index < editorReviewSteps.length; index += 1) {
      const message = getEditorReviewStepError(index, paintInvalid);
      if (message) return index;
    }
    return -1;
  }

  function canActivateEditorReviewStep(nextIndex) {
    if (!editorReviewWizardEnabled) return true;
    const maxIndex = editorReviewSteps.length - 1;
    if (maxIndex < 0) return true;
    const targetIndex = Math.max(0, Math.min(Number(nextIndex), maxIndex));
    if (targetIndex <= editorReviewStepIndex) return true;
    return !validateEditorReviewStepsUntil(targetIndex - 1, false);
  }

  function maybePrimeTranslationStep(previousIndex, nextIndex) {
    if (!editorReviewWizardEnabled) return;
    const current =
      editorReviewSteps[Math.max(0, Math.min(Number(nextIndex), editorReviewSteps.length - 1))] ||
      null;
    const currentId = String(current && current.id ? current.id : "")
      .trim()
      .toLowerCase();
    if (currentId !== "translation") return;
    if (Number(previousIndex) === Number(nextIndex)) return;
    const state = submissionTranslationState;
    if (!state || !state.required) return;
    if (state.checking) return;
    const hasEnglishText = Boolean(
      String(state.englishTitle || "").trim() ||
        String(state.englishDescription || "").trim(),
    );
    if (hasEnglishText) return;
    if (editorAutoTranslationPrimed) return;
    const hasNativeText = Boolean(
      String((editorTitle && editorTitle.value) || "").trim() ||
        String((editorDescription && editorDescription.value) || "").trim(),
    );
    if (!hasNativeText) return;
    editorAutoTranslationPrimed = true;
    runSubmissionTranslationCheck();
  }

  function setEditorReviewStep(nextIndex, options = {}) {
    if (!editorReviewWizardEnabled) return;
    const maxIndex = editorReviewSteps.length - 1;
    if (maxIndex < 0) return;
    const targetIndex = Math.max(0, Math.min(Number(nextIndex), maxIndex));
    if (!options.force && !canActivateEditorReviewStep(targetIndex)) return;
    const previousIndex = editorReviewStepIndex;
    editorReviewStepIndex = targetIndex;
    updateEditorReviewUi();
    maybePrimeTranslationStep(previousIndex, targetIndex);
  }

  function renderEditorReviewStepper() {
    if (!editorStepperList) return;
    if (!editorReviewWizardEnabled || !editorReviewSteps.length) {
      editorStepperList.innerHTML = "";
      return;
    }
    editorStepperList.innerHTML = editorReviewSteps
      .map((step, index) => {
        const rawMessage = getEditorReviewStepError(index, false);
        const isValid = !rawMessage;
        const classes = ["ecva-editor-stepper-item"];
        const isLocked =
          index > editorReviewStepIndex &&
          !canActivateEditorReviewStep(index);
        if (index < editorReviewStepIndex && isValid) {
          classes.push("is-done");
        } else if (index < editorReviewStepIndex && !isValid) {
          classes.push("is-error");
        } else if (index === editorReviewStepIndex) {
          classes.push("is-active");
        }
        if (isLocked) {
          classes.push("is-locked");
        }
        const dotText = index < editorReviewStepIndex && isValid ? "✓" : String(index + 1);
        return `<li class="${classes.join(" ")}" data-editor-review-step="${index}">
          <span class="ecva-editor-stepper-dot">${escapeHtml(dotText)}</span>
          <span class="ecva-editor-stepper-label">${escapeHtml(step.label)}</span>
        </li>`;
      })
      .join("");
    editorStepperList
      .querySelectorAll("[data-editor-review-step]")
      .forEach((node) => {
        node.addEventListener("click", () => {
          if (node.classList.contains("is-locked")) return;
          const index = Number(node.getAttribute("data-editor-review-step"));
          if (!Number.isFinite(index)) return;
          if (!canActivateEditorReviewStep(index)) return;
          setEditorReviewStep(index);
        });
      });
  }

  function updateEditorReviewUi() {
    const isWizard = Boolean(editorReviewWizardEnabled && editorReviewSteps.length);
    if (editorStepper) {
      editorStepper.hidden = !isWizard;
    }
    if (!isWizard) {
      [editorStepTextPanel, editorStepTranslationPanel, editorStepLanguagesPanel, editorStepContactPanel].forEach((panel) => {
        if (!panel) return;
        panel.hidden = false;
        panel.classList.add("is-visible");
      });
      if (editorBackBtn) editorBackBtn.style.display = "none";
      renderEditorReviewStepper();
      updateEditorSaveAvailability();
      updateEditorHeading();
      return;
    }
    editorReviewSteps.forEach((step, index) => {
      if (!step || !step.panel) return;
      const isActive = index === editorReviewStepIndex;
      step.panel.hidden = !isActive;
      step.panel.classList.toggle("is-visible", isActive);
    });
    [editorStepTextPanel, editorStepTranslationPanel, editorStepLanguagesPanel, editorStepContactPanel].forEach((panel) => {
      if (!panel) return;
      const belongsToWizard = editorReviewSteps.some((step) => step.panel === panel);
      if (!belongsToWizard) {
        panel.hidden = true;
        panel.classList.remove("is-visible");
      }
    });
    if (editorBackBtn) {
      editorBackBtn.style.display = editorReviewStepIndex > 0 ? "inline-flex" : "none";
    }
    const currentStep =
      editorReviewSteps[editorReviewStepIndex] ||
      editorReviewSteps[editorReviewSteps.length - 1] ||
      null;
    const currentStepId = String(currentStep && currentStep.id ? currentStep.id : "")
      .trim()
      .toLowerCase();
    if (currentStepId === "translation") {
      maybePrimeTranslationStep(-1, editorReviewStepIndex);
    }
    renderEditorReviewStepper();
    updateEditorSaveAvailability();
    updateEditorHeading();
  }

  function configureEditorReviewWizard() {
    if (!isEditorSubmissionArticleTarget()) {
      editorReviewWizardEnabled = false;
      editorReviewStepIndex = 0;
      editorReviewSteps = [];
      updateEditorReviewUi();
      return;
    }
    const base = getEditorReviewStepDefinitions();
    const translationNeeded = Boolean(
      submissionTranslationState && submissionTranslationState.required,
    );
    editorReviewSteps = base.filter((step) =>
      step.id === "translation" ? translationNeeded : true,
    );
    editorReviewWizardEnabled = true;
    editorReviewStepIndex = Math.max(
      0,
      Math.min(editorReviewStepIndex, editorReviewSteps.length - 1),
    );
    updateEditorReviewUi();
  }

  function refreshEditorReviewProgress() {
    if (editorReviewWizardEnabled) {
      renderEditorReviewStepper();
    }
    updateEditorSaveAvailability();
    updateEditorHeading();
  }

  function toHeadingLanguageLabel(rawValue) {
    const value = String(rawValue || "").trim();
    if (!value) return "Language";
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function getEditorNativeLanguageLabel() {
    const countryId = normalizeManageCountryCode(
      (editorTarget && editorTarget.countryId) || selectedCountryId || "",
    );
    const sourceLanguageCode = normalizeLanguageCode(
      (submissionTranslationState && submissionTranslationState.sourceLanguageCode) ||
        getCountryPrimaryLanguage(countryId),
    );
    return toHeadingLanguageLabel(getLanguageDisplayLabel(sourceLanguageCode || "en"));
  }

  function getEditorStepOneLabel() {
    const copy = getEditorUiCopy(editorUiCopyLang);
    const template = String(
      copy.stepWriteNativeBeforeSubmit ||
        EDITOR_UI_COPY_BASE.stepWriteNativeBeforeSubmit ||
        copy.stepReviewText ||
        EDITOR_UI_COPY_BASE.stepReviewText ||
        "",
    );
    const languageLabel = String(getEditorNativeLanguageLabel() || "English").trim();
    return template.split("{language}").join(languageLabel);
  }

  function getEditorResourceLanguageOptions() {
    const uniqueCodes = Array.from(
      new Set(Object.values(COUNTRY_PRIMARY_LANGUAGE).concat(["en"])),
    )
      .map((code) =>
        String(code || "")
          .trim()
          .toLowerCase(),
      )
      .filter(Boolean);
    return uniqueCodes
      .sort((a, b) =>
        getLanguageDisplayLabel(a).localeCompare(getLanguageDisplayLabel(b)),
      )
      .map((code) => ({
        code,
        label: getLanguageDisplayLabel(code) || code.toUpperCase(),
        flag: getFlagFromLanguageCode(code) || "🏳️",
      }));
  }

  const EDITOR_RESOURCE_LANGUAGE_OPTIONS = getEditorResourceLanguageOptions();

  function getEditorResourceLanguageOption(languageCode) {
    const code = String(languageCode || "")
      .trim()
      .toLowerCase();
    const found = EDITOR_RESOURCE_LANGUAGE_OPTIONS.find(
      (item) => item.code === code,
    );
    if (found) return found;
    return {
      code,
      label: getLanguageDisplayLabel(code) || code.toUpperCase() || "Language",
      flag: getFlagFromLanguageCode(code) || "🏳️",
    };
  }

  function getEditorResourceTypeConfig(resourceTypeValue) {
    const value = String(resourceTypeValue || "")
      .trim()
      .toLowerCase();
    return (
      EDITOR_RESOURCE_TYPE_OPTIONS.find((item) => item.value === value) ||
      EDITOR_RESOURCE_TYPE_OPTIONS[0]
    );
  }

  function getEditorResourcePricingConfig(resourcePricingValue) {
    const value = String(resourcePricingValue || "free")
      .trim()
      .toLowerCase();
    return (
      EDITOR_RESOURCE_PRICING_OPTIONS.find((item) => item.value === value) ||
      EDITOR_RESOURCE_PRICING_OPTIONS[0]
    );
  }

  function normalizeLikelyUrl(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    return /^www\./i.test(text) ? `https://${text}` : text;
  }

  function isLikelyValidUrl(value) {
    const normalized = normalizeLikelyUrl(value);
    if (!normalized) return false;
    try {
      const parsed = new URL(normalized);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (_error) {
      return false;
    }
  }

  function setInputValidity(input, isValid) {
    if (!input) return;
    if (input.classList) {
      input.classList.toggle("is-invalid", !isValid);
    }
    if (isValid) {
      input.removeAttribute("aria-invalid");
    } else {
      input.setAttribute("aria-invalid", "true");
    }
  }

  function updateEditorTextCounter(input, output, limit) {
    if (!input || !output || !Number.isFinite(limit)) return;
    const value = String(input.value || "");
    output.textContent = `${value.length}/${limit}`;
  }

  function updateEditorTextCounters() {
    updateEditorTextCounter(
      editorTitle,
      editorTitleCount,
      EDITOR_TEXT_LIMITS.title,
    );
    updateEditorTextCounter(
      editorDescription,
      editorDescriptionCount,
      EDITOR_TEXT_LIMITS.description,
    );
  }

  function createEditorResourceLanguageItem(languageCode, isPrimary) {
    editorResourceLangUid += 1;
    const normalizedCode = String(languageCode || "")
      .trim()
      .toLowerCase();
    return {
      id: `editor-lang-${editorResourceLangUid}`,
      languageCode: normalizedCode,
      resourceType: "webpage",
      resourcePricing: "free",
      resourceUrl: "",
      fileName: "",
      file: null,
      urlDraftByType: {
        webpage: "",
        youtube: "",
      },
      fileDraftByType: {
        document: { resourceUrl: "", fileName: "", file: null },
        image: { resourceUrl: "", fileName: "", file: null },
      },
      pricingDraftByType: {
        webpage: "free",
      },
      isPrimary: Boolean(isPrimary),
    };
  }

  function createEditorResourceFileDraft(rawDraft) {
    const draft = rawDraft && typeof rawDraft === "object" ? rawDraft : {};
    return {
      resourceUrl: String(draft.resourceUrl || ""),
      fileName: String(draft.fileName || ""),
      file: draft.file instanceof File ? draft.file : null,
    };
  }

  function ensureEditorResourceItemDraftMemory(item) {
    if (!item || typeof item !== "object") return;
    if (!item.urlDraftByType || typeof item.urlDraftByType !== "object") {
      item.urlDraftByType = {};
    }
    if (!item.fileDraftByType || typeof item.fileDraftByType !== "object") {
      item.fileDraftByType = {};
    }
    if (!item.pricingDraftByType || typeof item.pricingDraftByType !== "object") {
      item.pricingDraftByType = {};
    }

    EDITOR_RESOURCE_TYPE_OPTIONS.forEach((option) => {
      const config = getEditorResourceTypeConfig(option.value);
      if (config.inputMode === "url") {
        if (typeof item.urlDraftByType[config.value] !== "string") {
          item.urlDraftByType[config.value] = "";
        }
        return;
      }
      item.fileDraftByType[config.value] = createEditorResourceFileDraft(
        item.fileDraftByType[config.value],
      );
    });

    item.pricingDraftByType.webpage = getEditorResourcePricingConfig(
      item.pricingDraftByType.webpage || item.resourcePricing || "free",
    ).value;

    const activeConfig = getEditorResourceTypeConfig(item.resourceType);
    if (activeConfig.inputMode === "url") {
      const activeType = activeConfig.value;
      const activeUrl = String(item.resourceUrl || "");
      if (activeUrl && !String(item.urlDraftByType[activeType] || "").trim()) {
        item.urlDraftByType[activeType] = activeUrl;
      }
      if (activeType === "webpage") {
        item.pricingDraftByType.webpage = getEditorResourcePricingConfig(
          item.resourcePricing || item.pricingDraftByType.webpage || "free",
        ).value;
      }
      return;
    }

    const activeType = activeConfig.value;
    const currentDraft = createEditorResourceFileDraft(item.fileDraftByType[activeType]);
    const hasDraft =
      Boolean(String(currentDraft.resourceUrl || "").trim()) ||
      Boolean(String(currentDraft.fileName || "").trim()) ||
      currentDraft.file instanceof File;
    if (!hasDraft) {
      item.fileDraftByType[activeType] = createEditorResourceFileDraft({
        resourceUrl: item.resourceUrl,
        fileName: item.fileName,
        file: item.file,
      });
      return;
    }
    item.fileDraftByType[activeType] = currentDraft;
  }

  function storeEditorResourceItemActiveDraft(item) {
    if (!item || typeof item !== "object") return;
    ensureEditorResourceItemDraftMemory(item);
    const activeConfig = getEditorResourceTypeConfig(item.resourceType);
    const activeType = activeConfig.value;
    if (activeConfig.inputMode === "url") {
      item.urlDraftByType[activeType] = String(item.resourceUrl || "");
      if (activeType === "webpage") {
        item.pricingDraftByType.webpage = getEditorResourcePricingConfig(
          item.resourcePricing || "free",
        ).value;
      }
      return;
    }
    item.fileDraftByType[activeType] = createEditorResourceFileDraft({
      resourceUrl: item.resourceUrl,
      fileName: item.fileName,
      file: item.file,
    });
  }

  function restoreEditorResourceItemDraftForType(item, nextTypeValue) {
    if (!item || typeof item !== "object") return;
    ensureEditorResourceItemDraftMemory(item);
    const nextConfig = getEditorResourceTypeConfig(nextTypeValue);
    const nextType = nextConfig.value;
    item.resourceType = nextType;
    if (nextConfig.inputMode === "url") {
      item.resourceUrl = String((item.urlDraftByType && item.urlDraftByType[nextType]) || "");
      item.fileName = "";
      item.file = null;
      if (nextType === "webpage") {
        item.resourcePricing = getEditorResourcePricingConfig(
          (item.pricingDraftByType && item.pricingDraftByType.webpage) ||
            item.resourcePricing ||
            "free",
        ).value;
      } else {
        item.resourcePricing = "free";
      }
      return;
    }
    const fileDraft = createEditorResourceFileDraft(
      item.fileDraftByType && item.fileDraftByType[nextType],
    );
    item.resourceUrl = String(fileDraft.resourceUrl || "");
    item.fileName = String(fileDraft.fileName || "");
    item.file = fileDraft.file instanceof File ? fileDraft.file : null;
    item.resourcePricing = "free";
  }

  function resetEditorResourceLanguageItems(countryId) {
    const defaultLanguage =
      getCountryPrimaryLanguage(countryId) ||
      normalizeLanguageCode(getCurrentLang()) ||
      "en";
    editorResourceLanguageItems = [
      createEditorResourceLanguageItem(defaultLanguage, true),
    ];
  }

  function loadEditorResourceLanguageItems(countryId, item) {
    const versions = getSubmissionResourceVersions(item);
    if (!versions.length) {
      resetEditorResourceLanguageItems(countryId);
      renderEditorResourceLanguageItems();
      return;
    }
    editorResourceLanguageItems = versions
      .slice(0, EDITOR_RESOURCE_LIMITS.maxLanguages)
      .map((version, index) => {
        const languageCode = String(version.languageCode || "")
          .trim()
          .toLowerCase();
        const inferredCode =
          languageCode ||
          normalizeLanguageCode(getCountryPrimaryLanguage(countryId) || "en");
        const typeConfig = getEditorResourceTypeConfig(
          version.resourceType ||
            (String(version.accessType || "").trim().toLowerCase() === "file"
              ? "document"
              : "webpage"),
        );
        const itemData = createEditorResourceLanguageItem(
          inferredCode,
          index === 0,
        );
        itemData.resourceType = typeConfig.value;
        itemData.resourcePricing = getEditorResourcePricingConfig(
          version.resourcePricing ||
            (typeConfig.value === "webpage" ? "free" : "free"),
        ).value;
        itemData.resourceUrl = String(version.resourceUrl || "").trim();
        itemData.fileName = String(version.fileName || "").trim();
        itemData.file = null;
        ensureEditorResourceItemDraftMemory(itemData);
        storeEditorResourceItemActiveDraft(itemData);
        return itemData;
      });
    if (!editorResourceLanguageItems.length) {
      resetEditorResourceLanguageItems(countryId);
    } else {
      editorResourceLanguageItems[0].isPrimary = true;
    }
    renderEditorResourceLanguageItems();
  }

  function addEditorResourceLanguageItem(countryId) {
    if (editorResourceLanguageItems.length >= EDITOR_RESOURCE_LIMITS.maxLanguages) {
      return;
    }
    const used = new Set(
      editorResourceLanguageItems.map((item) =>
        String(item.languageCode || "")
          .trim()
          .toLowerCase(),
      ),
    );
    const primaryCode = normalizeLanguageCode(
      getCountryPrimaryLanguage(countryId || selectedCountryId || "") || "en",
    );
    let nextCode = "";
    if (
      editorResourceLanguageItems.length === 1 &&
      primaryCode !== "en" &&
      !used.has("en")
    ) {
      nextCode = "en";
    } else {
      const next = EDITOR_RESOURCE_LANGUAGE_OPTIONS.find(
        (option) => !used.has(option.code),
      );
      nextCode = next ? next.code : "";
    }
    const item = createEditorResourceLanguageItem(nextCode, false);
    editorResourceLanguageItems.push(item);
    renderEditorResourceLanguageItems(item.id);
  }

  function markSubmissionContactFieldsValid() {
    setInputValidity(editorOwnershipType, true);
    setInputValidity(editorOwnershipName, true);
    setInputValidity(editorContactName, true);
    setInputValidity(editorContactRole, true);
    setInputValidity(editorContactEmail, true);
    refreshEditorReviewProgress();
  }

  function renderEditorResourceLanguageItems(focusItemId) {
    if (!editorResourceLanguageList) return;
    editorResourceLanguageList.innerHTML = "";
    const usedLanguages = new Set();
    editorResourceLanguageItems.forEach((item) => {
      ensureEditorResourceItemDraftMemory(item);
      const typeConfig = getEditorResourceTypeConfig(item.resourceType);
      const duplicate = usedLanguages.has(item.languageCode);
      if (item.languageCode) usedLanguages.add(item.languageCode);
      const card = document.createElement("section");
      card.className = "contribute-language-item";
      card.setAttribute("data-resource-lang-id", item.id);

      const head = document.createElement("div");
      head.className = "contribute-language-item-head";
      if (!item.isPrimary) {
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "contribute-language-remove";
        removeBtn.textContent = "Remove";
        removeBtn.addEventListener("click", () => {
          editorResourceLanguageItems = editorResourceLanguageItems.filter(
            (next) => next.id !== item.id,
          );
          if (editorResourceLanguageItems[0]) {
            editorResourceLanguageItems[0].isPrimary = true;
          }
          renderEditorResourceLanguageItems();
        });
        head.appendChild(removeBtn);
      }
      card.appendChild(head);

      const fields = document.createElement("div");
      fields.className = "contribute-language-fields";

      const languageLabel = document.createElement("label");
      languageLabel.textContent = "Language";
      const languageSelect = document.createElement("select");
      languageSelect.id = `editor-resource-language-${item.id}`;
      languageSelect.name = `editor-resource-language-${item.id}`;
      languageLabel.setAttribute("for", languageSelect.id);
      languageSelect.setAttribute("data-focus-language", "true");
      if (!item.languageCode) {
        const languagePlaceholder = document.createElement("option");
        languagePlaceholder.value = "";
        languagePlaceholder.disabled = true;
        languagePlaceholder.selected = true;
        languagePlaceholder.textContent = "Select language";
        languageSelect.appendChild(languagePlaceholder);
      }
      EDITOR_RESOURCE_LANGUAGE_OPTIONS.forEach((option) => {
        const opt = document.createElement("option");
        opt.value = option.code;
        opt.textContent = `${option.flag} ${option.label}`;
        if (option.code === item.languageCode) opt.selected = true;
        languageSelect.appendChild(opt);
      });
      languageSelect.addEventListener("change", () => {
        const nextCode = String(languageSelect.value || "")
          .trim()
          .toLowerCase();
        const duplicated = editorResourceLanguageItems.some(
          (next) => next.id !== item.id && next.languageCode === nextCode,
        );
        if (duplicated) {
          showToast("This language was already added.", true);
          languageSelect.value = item.languageCode;
          setInputValidity(languageSelect, false);
          return;
        }
        item.languageCode = nextCode;
        renderEditorResourceLanguageItems(item.id);
      });
      languageLabel.appendChild(languageSelect);
      fields.appendChild(languageLabel);

      const typeLabel = document.createElement("label");
      typeLabel.className = "contribute-language-type-field";
      typeLabel.textContent = "Type";
      const typeSelect = document.createElement("select");
      typeSelect.id = `editor-resource-type-${item.id}`;
      typeSelect.name = `editor-resource-type-${item.id}`;
      typeLabel.setAttribute("for", typeSelect.id);
      typeSelect.innerHTML = EDITOR_RESOURCE_TYPE_OPTIONS.map(
        (option) =>
          `<option value="${option.value}">${escapeHtml(option.label)}</option>`,
      ).join("");
      typeSelect.value = typeConfig.value;
      typeSelect.addEventListener("change", () => {
        const nextType = getEditorResourceTypeConfig(typeSelect.value).value;
        storeEditorResourceItemActiveDraft(item);
        restoreEditorResourceItemDraftForType(item, nextType);
        renderEditorResourceLanguageItems(item.id);
      });
      typeLabel.appendChild(typeSelect);
      fields.appendChild(typeLabel);

      const valueLabel = document.createElement("label");
      valueLabel.setAttribute("data-resource-focus-anchor", item.id);
      if (typeConfig.inputMode === "file") {
        valueLabel.textContent = "Resource file";
        const shell = document.createElement("div");
        shell.className = "contribute-language-file-shell";
        const fileInput = document.createElement("input");
        fileInput.id = `editor-resource-file-${item.id}`;
        fileInput.type = "file";
        fileInput.className = "contribute-language-file-input";
        fileInput.accept = ".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg";
        fileInput.name = `editor-resource-file-${item.id}`;
        valueLabel.setAttribute("for", fileInput.id);
        fileInput.setAttribute("data-focus-value", "true");
        const openPicker = () => {
          fileInput.click();
        };
        fileInput.addEventListener("change", () => {
          const file = fileInput.files && fileInput.files[0];
          item.file = file || null;
          item.fileName = file && file.name ? file.name : "";
          item.resourceUrl = "";
          storeEditorResourceItemActiveDraft(item);
          renderEditorResourceLanguageItems(item.id);
        });
        shell.appendChild(fileInput);
        const hasPickedFile =
          item.file instanceof File ||
          Boolean(String(item.fileName || "").trim()) ||
          Boolean(String(item.resourceUrl || "").trim());
        if (hasPickedFile) {
          shell.classList.add("is-loaded");
          const fileDisplayName =
            String(item.fileName || "").trim() ||
            String((item.file && item.file.name) || "").trim() ||
            "Uploaded file";
          const fileTab = document.createElement("button");
          fileTab.type = "button";
          fileTab.className = "contribute-language-file-tab";
          fileTab.setAttribute("aria-label", "Change uploaded file");
          fileTab.innerHTML = `
            <span class="contribute-language-file-tab-name">${escapeHtml(fileDisplayName)}</span>
            <span class="contribute-language-file-tab-icon" aria-hidden="true">↺</span>
          `;
          fileTab.addEventListener("click", openPicker);
          shell.appendChild(fileTab);
        } else {
          shell.classList.add("is-empty");
          const fileTrigger = document.createElement("button");
          fileTrigger.type = "button";
          fileTrigger.className = "contribute-language-file-trigger";
          fileTrigger.textContent = "Choose file";
          fileTrigger.addEventListener("click", openPicker);
          shell.appendChild(fileTrigger);
        }
        valueLabel.appendChild(shell);
      } else {
        valueLabel.textContent = "Resource link for this language";
        const input = document.createElement("input");
        input.id = `editor-resource-url-${item.id}`;
        input.name = `editor-resource-url-${item.id}`;
        input.type = "url";
        input.className = "contribute-language-url";
        input.placeholder = "https://...";
        input.value = String(item.resourceUrl || "");
        valueLabel.setAttribute("for", input.id);
        input.setAttribute("data-focus-value", "true");
        input.addEventListener("input", () => {
          item.resourceUrl = String(input.value || "");
          storeEditorResourceItemActiveDraft(item);
          setInputValidity(input, true);
        });
        input.addEventListener("blur", () => {
          const normalized = normalizeLikelyUrl(input.value);
          if (normalized !== input.value) {
            input.value = normalized;
          }
          item.resourceUrl = normalized;
          storeEditorResourceItemActiveDraft(item);
          setInputValidity(input, true);
        });
        valueLabel.appendChild(input);
      }
      fields.appendChild(valueLabel);
      card.appendChild(fields);

      if (typeConfig.value === "webpage") {
        const pricingWrap = document.createElement("section");
        pricingWrap.className = "contribute-language-pricing";
        const pricingTitle = document.createElement("h6");
        pricingTitle.textContent = "Resource access mode";
        pricingWrap.appendChild(pricingTitle);
        const tabs = document.createElement("div");
        tabs.className = "contribute-language-pricing-tabs";
        const activePricing = getEditorResourcePricingConfig(item.resourcePricing);
        item.resourcePricing = activePricing.value;
        EDITOR_RESOURCE_PRICING_OPTIONS.forEach((option) => {
          const tab = document.createElement("label");
          tab.className = "contribute-language-pricing-tab";
          if (option.value === activePricing.value) {
            tab.classList.add("is-active");
          }
          const input = document.createElement("input");
          input.type = "radio";
          input.name = `editor-resource-pricing-${item.id}`;
          input.value = option.value;
          input.checked = option.value === activePricing.value;
          input.addEventListener("change", () => {
            item.resourcePricing = getEditorResourcePricingConfig(input.value).value;
            storeEditorResourceItemActiveDraft(item);
            renderEditorResourceLanguageItems(item.id);
          });
          const icon = document.createElement("span");
          icon.className = "contribute-language-pricing-icon";
          icon.innerHTML = renderResourcePricingIconSvg(option.icon);
          const label = document.createElement("span");
          label.className = "contribute-language-pricing-label";
          label.textContent = option.label;
          tab.appendChild(input);
          tab.appendChild(icon);
          tab.appendChild(label);
          tabs.appendChild(tab);
        });
        pricingWrap.appendChild(tabs);
        card.appendChild(pricingWrap);
      } else {
        item.resourcePricing = "free";
      }

      if (duplicate) {
        const duplicateHint = document.createElement("span");
        duplicateHint.className = "contribute-field-error";
        duplicateHint.textContent = "This language was already added.";
        card.appendChild(duplicateHint);
      }

      editorResourceLanguageList.appendChild(card);
    });
    if (editorResourceAddLanguageBtn) {
      editorResourceAddLanguageBtn.hidden =
        editorResourceLanguageItems.length >= EDITOR_RESOURCE_LIMITS.maxLanguages;
    }
    if (focusItemId && editorResourceLanguageList) {
      const focusItem = editorResourceLanguageItems.find(
        (item) => item.id === focusItemId,
      );
      const focusSelector =
        focusItem && String(focusItem.languageCode || "").trim()
          ? `[data-resource-focus-anchor="${focusItemId}"] [data-focus-value="true"]`
          : `[data-resource-lang-id="${focusItemId}"] [data-focus-language="true"]`;
      const focusNode = editorResourceLanguageList.querySelector(focusSelector);
      if (focusNode) {
        window.requestAnimationFrame(() => {
          focusNode.focus();
        });
      }
    }
    refreshEditorReviewProgress();
  }

  function validateEditorTextStep(paintInvalid) {
    const copy = getEditorUiCopy(editorUiCopyLang);
    const shouldPaint = Boolean(paintInvalid);
    const titleRaw = String((editorTitle && editorTitle.value) || "");
    const descriptionRaw = String((editorDescription && editorDescription.value) || "");
    const title = titleRaw.trim();
    const description = descriptionRaw.trim();
    const titleWithinLimit = titleRaw.length <= EDITOR_TEXT_LIMITS.title;
    const descriptionWithinLimit =
      descriptionRaw.length <= EDITOR_TEXT_LIMITS.description;
    updateEditorTextCounters();
    if (editorTitle && (shouldPaint || title)) {
      setInputValidity(editorTitle, Boolean(title) && titleWithinLimit);
    }
    if (editorDescription && (shouldPaint || description)) {
      setInputValidity(
        editorDescription,
        Boolean(description) && descriptionWithinLimit,
      );
    }
    if (!title) {
      return copy.completeTitle || EDITOR_UI_COPY_BASE.completeTitle;
    }
    if (!description) {
      return copy.completeDescription || EDITOR_UI_COPY_BASE.completeDescription;
    }
    if (!titleWithinLimit) {
      return String(copy.titleTooLong || EDITOR_UI_COPY_BASE.titleTooLong).replace(
        "{max}",
        String(EDITOR_TEXT_LIMITS.title),
      );
    }
    if (!descriptionWithinLimit) {
      return String(
        copy.descriptionTooLong || EDITOR_UI_COPY_BASE.descriptionTooLong,
      ).replace("{max}", String(EDITOR_TEXT_LIMITS.description));
    }
    return "";
  }

  function validateEditorTranslationStep(_paintInvalid) {
    return "";
  }

  function validateEditorLanguageAndLinkFields(paintInvalid) {
    const shouldPaint = Boolean(paintInvalid);
    const seenLanguages = new Set();
    for (const item of editorResourceLanguageItems) {
      const card = editorResourceLanguageList
        ? editorResourceLanguageList.querySelector(
            `[data-resource-lang-id="${item.id}"]`,
          )
        : null;
      const languageSelect = card ? card.querySelector("select") : null;
      const languageCode = String(item.languageCode || "")
        .trim()
        .toLowerCase();
      if (!languageCode) {
        if (shouldPaint) setInputValidity(languageSelect, false);
        return "Select a language for each resource version.";
      }
      if (seenLanguages.has(languageCode)) {
        if (shouldPaint) setInputValidity(languageSelect, false);
        return "This language was already added.";
      }
      seenLanguages.add(languageCode);
      setInputValidity(languageSelect, true);
      const typeConfig = getEditorResourceTypeConfig(item.resourceType);
      if (typeConfig.inputMode === "file") {
        const fileNode = card
          ? card.querySelector(".contribute-language-file-shell")
          : null;
        const hasStoredFile = Boolean(String(item.resourceUrl || "").trim());
        const hasNewFile = item.file instanceof File;
        if (!hasStoredFile && !hasNewFile) {
          if (shouldPaint) setInputValidity(fileNode, false);
          return "Upload a file for each selected file-based resource type.";
        }
        if (hasNewFile) {
          const size = Number(item.file.size || 0);
          if (size > ATTACHMENT_MAX_BYTES) {
            if (shouldPaint) setInputValidity(fileNode, false);
            return "File too large. Maximum allowed size is 15MB per file.";
          }
          if (!ATTACHMENT_FILE_RE.test(String(item.file.name || ""))) {
            if (shouldPaint) setInputValidity(fileNode, false);
            return "File format is not supported.";
          }
        }
        setInputValidity(fileNode, true);
        continue;
      }
      const urlNode = card ? card.querySelector('input[type="url"]') : null;
      const normalized = normalizeLikelyUrl(item.resourceUrl);
      item.resourceUrl = normalized;
      if (!isLikelyValidUrl(normalized)) {
        if (shouldPaint) setInputValidity(urlNode, false);
        return "Use a valid link (https://...) for each resource language.";
      }
      setInputValidity(urlNode, true);
    }
    return "";
  }

  function validateEditorContactFields(paintInvalid) {
    const shouldPaint = Boolean(paintInvalid);
    const ownershipType = String(
      (editorOwnershipType && editorOwnershipType.value) || "",
    ).trim();
    const ownershipName = String(
      (editorOwnershipName && editorOwnershipName.value) || "",
    ).trim();
    const contactName = String((editorContactName && editorContactName.value) || "").trim();
    const contactRole = String((editorContactRole && editorContactRole.value) || "").trim();
    const contactEmail = String((editorContactEmail && editorContactEmail.value) || "").trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail);
    if (editorOwnershipType && (shouldPaint || ownershipType)) {
      setInputValidity(editorOwnershipType, Boolean(ownershipType));
    }
    if (editorOwnershipName && (shouldPaint || ownershipName)) {
      setInputValidity(editorOwnershipName, Boolean(ownershipName));
    }
    if (editorContactName && (shouldPaint || contactName)) {
      setInputValidity(editorContactName, Boolean(contactName));
    }
    if (editorContactRole && (shouldPaint || contactRole)) {
      setInputValidity(editorContactRole, Boolean(contactRole));
    }
    if (editorContactEmail && (shouldPaint || contactEmail)) {
      setInputValidity(editorContactEmail, emailOk);
    }
    if (!ownershipType) return "Select entity type.";
    if (!ownershipName) return "Complete entity name.";
    if (!contactName) return "Complete contact name.";
    if (!contactRole) return "Complete contact role.";
    if (!emailOk) return "Complete contact email in valid format.";
    return "";
  }

  async function uploadEditorAttachment(file) {
    if (!(file instanceof File)) {
      throw new Error("attachment_missing_file");
    }
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("attachment_read_failed"));
      reader.onload = () => resolve(String(reader.result || ""));
      reader.readAsDataURL(file);
    });
    const response = await fetch(ATTACHMENT_UPLOAD_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name || "attachment.bin",
        dataUrl,
      }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload || payload.ok === false) {
      if (
        response.status === 413 ||
        (payload && payload.error === "attachment_too_large")
      ) {
        throw new Error("attachment_file_too_large");
      }
      throw new Error("attachment_upload_failed");
    }
    const path = String((payload && payload.path) || "").trim();
    if (!path) throw new Error("attachment_upload_missing_path");
    return {
      name: String(file.name || "").trim() || "Attachment",
      url: path,
    };
  }

  async function buildEditorResourceSubmissionPayload() {
    const resourceLanguages = [];
    for (const item of editorResourceLanguageItems) {
      const languageCode = String(item.languageCode || "")
        .trim()
        .toLowerCase();
      const languageOption = getEditorResourceLanguageOption(languageCode);
      const typeConfig = getEditorResourceTypeConfig(item.resourceType);
      const pricingConfig =
        typeConfig.value === "webpage"
          ? getEditorResourcePricingConfig(item.resourcePricing)
          : getEditorResourcePricingConfig("free");
      if (typeConfig.inputMode === "file") {
        let resourceUrl = String(item.resourceUrl || "").trim();
        let fileName = String(item.fileName || "").trim();
        if (item.file instanceof File) {
          const upload = await uploadEditorAttachment(item.file);
          resourceUrl = String(upload.url || "").trim();
          fileName = String(upload.name || "").trim();
        }
        resourceLanguages.push({
          languageCode,
          languageLabel: languageOption.label,
          languageFlag: languageOption.flag,
          resourceType: typeConfig.value,
          resourceTypeLabel: typeConfig.label,
          resourcePricing: "free",
          resourcePricingLabel: getEditorResourcePricingConfig("free").label,
          accessType: "file",
          resourceUrl,
          fileName,
        });
        continue;
      }
      resourceLanguages.push({
        languageCode,
        languageLabel: languageOption.label,
        languageFlag: languageOption.flag,
        resourceType: typeConfig.value,
        resourceTypeLabel: typeConfig.label,
        resourcePricing: pricingConfig.value,
        resourcePricingLabel: pricingConfig.label,
        accessType: "url",
        resourceUrl: normalizeLikelyUrl(item.resourceUrl),
        fileName: "",
      });
    }
    const languageAvailability = resourceLanguages
      .map((item) => String(item.languageLabel || "").trim())
      .filter(Boolean)
      .join(", ");
    const links = resourceLanguages
      .map((item) => String(item.resourceUrl || "").trim())
      .filter(Boolean);
    const attachments = resourceLanguages
      .filter(
        (item) =>
          String(item.accessType || "").trim().toLowerCase() === "file" &&
          String(item.resourceUrl || "").trim(),
      )
      .map((item) => ({
        name: String(item.fileName || "").trim() || "Attachment",
        url: String(item.resourceUrl || "").trim(),
      }));
    return { resourceLanguages, languageAvailability, links, attachments };
  }

  function setNativeFieldLabels(titleText, descriptionText) {
    const titleLabel = String(titleText || "Title").trim() || "Title";
    const descriptionLabel =
      String(descriptionText || "Description").trim() || "Description";
    if (editorNativeTitleLabel) {
      editorNativeTitleLabel.textContent = titleLabel;
    }
    if (editorNativeDescriptionLabel) {
      editorNativeDescriptionLabel.textContent = descriptionLabel;
    }
    if (editorEnglishTitleLabel) {
      editorEnglishTitleLabel.textContent = titleLabel;
    }
    if (editorEnglishDescriptionLabel) {
      editorEnglishDescriptionLabel.textContent = descriptionLabel;
    }
  }

  function isEditableTextNode(node) {
    return node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement;
  }

  function readTextNodeValue(node) {
    if (!node) return "";
    if (isEditableTextNode(node)) return String(node.value || "");
    return String(node.textContent || "");
  }

  function writeTextNodeValue(node, value) {
    if (!node) return;
    const nextValue = String(value || "");
    if (isEditableTextNode(node)) {
      if (node.value !== nextValue) {
        node.value = nextValue;
      }
      return;
    }
    node.textContent = nextValue;
  }

  function setSubmissionTranslationInputsEditable(isEditable) {
    const editable = Boolean(isEditable);
    [
      editorNativeTitlePreview,
      editorNativeDescriptionPreview,
      editorEnglishTitlePreview,
      editorEnglishDescriptionPreview,
    ].forEach((field) => {
      if (!isEditableTextNode(field)) return;
      field.disabled = !editable;
      field.readOnly = !editable;
    });
  }

  function syncSubmissionNativeFieldLabels() {
    const state = submissionTranslationState;
    if (!state) {
      setNativeFieldLabels("Title", "Description");
      return;
    }
    const langCode = normalizeLanguageCode(
      (state && state.sourceLanguageCode) || "en",
    );
    const overrides = getLabelOverridesForLang(langCode);
    const overrideTitle = String((overrides && overrides.title) || "").trim();
    const overrideDescription = String(
      (overrides && overrides.description) || "",
    ).trim();
    if (overrideTitle || overrideDescription) {
      setNativeFieldLabels(
        overrideTitle || "Title",
        overrideDescription || "Description",
      );
      return;
    }
    const cached = nativeFieldLabelCache[langCode];
    if (cached && cached.title && cached.description) {
      setNativeFieldLabels(cached.title, cached.description);
      return;
    }
    setNativeFieldLabels("Title", "Description");
    if (nativeFieldLabelPending.has(langCode)) return;
    const request = fetch(TRANSLATE_BATCH_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceLang: "en",
        targetLang: langCode,
        texts: ["Title", "Description"],
      }),
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const data = await response.json().catch(() => null);
        const translated = Array.isArray(data && data.translated)
          ? data.translated
          : null;
        if (!translated || translated.length < 2) return null;
        const nextLabels = {
          title: String(translated[0] || "Title").trim() || "Title",
          description:
            String(translated[1] || "Description").trim() || "Description",
        };
        nativeFieldLabelCache[langCode] = nextLabels;
        const currentLangCode = normalizeLanguageCode(
          (submissionTranslationState && submissionTranslationState.sourceLanguageCode) ||
            "en",
        );
        if (currentLangCode === langCode) {
          setNativeFieldLabels(nextLabels.title, nextLabels.description);
        }
        return nextLabels;
      })
      .catch(() => null)
      .finally(() => {
        nativeFieldLabelPending.delete(langCode);
      });
    nativeFieldLabelPending.set(langCode, request);
  }

  function syncSubmissionSourceLanguageHeading() {
    const state = submissionTranslationState;
    if (!state) {
      if (editorSourceLangLabel) editorSourceLangLabel.textContent = "Language";
      if (editorSourceLangFlag) editorSourceLangFlag.textContent = "🏳️";
      setNativeFieldLabels("Title", "Description");
      return;
    }
    const langCode = normalizeLanguageCode(
      (state && state.sourceLanguageCode) || "en",
    );
    const langLabel = toHeadingLanguageLabel(
      (state && state.sourceLanguageLabel) || getLanguageDisplayLabel(langCode),
    );
    const langFlag =
      String((state && state.sourceLanguageFlag) || "").trim() ||
      getFlagFromLanguageCode(langCode) ||
      "🏳️";
    if (editorSourceLangLabel) editorSourceLangLabel.textContent = langLabel;
    if (editorSourceLangFlag) editorSourceLangFlag.textContent = langFlag;
    syncSubmissionNativeFieldLabels();
  }

  function isSubmissionArticleTarget(target) {
    return Boolean(
      target &&
        typeof target === "object" &&
        target.type === "submission-article" &&
        String(target.countryId || "").trim(),
    );
  }

  function updateEditorSaveAvailability() {
    if (!editorSaveBtn && !editorPendingBtn && !editorAcceptBtn) return;
    const copy = getEditorUiCopy(editorUiCopyLang);
    const state = submissionTranslationState;
    const checking = Boolean(state && state.checking);
    const setDecisionButtonsVisible = (visible) => {
      if (editorPendingBtn) {
        editorPendingBtn.style.display = visible ? "inline-flex" : "none";
      }
      if (editorAcceptBtn) {
        editorAcceptBtn.style.display = visible ? "inline-flex" : "none";
      }
    };
    if (isEditorSubmissionArticleTarget() && editorReviewWizardEnabled) {
      const maxIndex = editorReviewSteps.length - 1;
      const isFinalStep = editorReviewStepIndex >= maxIndex;
      if (!isFinalStep) {
        if (editorSaveBtn) {
          editorSaveBtn.style.display = "inline-flex";
          editorSaveBtn.textContent = copy.next || EDITOR_UI_COPY_BASE.next;
          editorSaveBtn.disabled = false;
        }
        setDecisionButtonsVisible(false);
        return;
      }
      if (editorSaveBtn) {
        editorSaveBtn.style.display = "none";
      }
      setDecisionButtonsVisible(true);
      const firstInvalidStep = getFirstInvalidEditorReviewStepIndex(false);
      const disableFinalActions = firstInvalidStep >= 0;
      if (editorPendingBtn) {
        editorPendingBtn.textContent =
          copy.pendingAction || EDITOR_UI_COPY_BASE.pendingAction;
        editorPendingBtn.disabled = disableFinalActions;
      }
      if (editorAcceptBtn) {
        editorAcceptBtn.textContent =
          copy.acceptAction || EDITOR_UI_COPY_BASE.acceptAction;
        editorAcceptBtn.disabled = disableFinalActions;
      }
      return;
    }
    setDecisionButtonsVisible(false);
    const needsCheck = Boolean(state && state.required);
    const ready = !needsCheck || !checking;
    if (editorSaveBtn) {
      editorSaveBtn.style.display = "inline-flex";
      editorSaveBtn.disabled = !ready;
      editorSaveBtn.textContent = copy.save || EDITOR_UI_COPY_BASE.save;
    }
  }

  function focusFirstInvalidEditorField() {
    if (!editorReviewWizardEnabled || !editorReviewSteps.length) return;
    const currentStep =
      editorReviewSteps[editorReviewStepIndex] ||
      editorReviewSteps[editorReviewSteps.length - 1] ||
      null;
    const panel =
      currentStep && currentStep.panel instanceof HTMLElement
        ? currentStep.panel
        : null;
    const scope = panel || entryFieldsWrap || editorForm;
    if (!scope) return;
    const invalidNode = scope.querySelector(".is-invalid, [aria-invalid='true']");
    if (invalidNode && typeof invalidNode.focus === "function") {
      invalidNode.focus();
    }
  }

  function updateSubmissionTranslationPreview() {
    const copy = getEditorUiCopy(editorUiCopyLang);
    const nativeTitle = String((editorTitle && editorTitle.value) || "");
    const nativeDescription = String((editorDescription && editorDescription.value) || "");
    updateEditorTextCounters();
    writeTextNodeValue(editorNativeTitlePreview, nativeTitle);
    writeTextNodeValue(editorNativeDescriptionPreview, nativeDescription);
    if (isEditableTextNode(editorNativeTitlePreview)) {
      editorNativeTitlePreview.placeholder =
        copy.noTitleYet || EDITOR_UI_COPY_BASE.noTitleYet;
    }
    if (isEditableTextNode(editorNativeDescriptionPreview)) {
      editorNativeDescriptionPreview.placeholder =
        copy.noDescriptionYet || EDITOR_UI_COPY_BASE.noDescriptionYet;
    }
  }

  function updateSubmissionTranslationUi() {
    const copy = getEditorUiCopy(editorUiCopyLang);
    const state = submissionTranslationState;
    const visible = Boolean(state && state.visible);
    syncSubmissionSourceLanguageHeading();
    const syncButtons = [
      editorSyncNativeTitleBtn,
      editorSyncNativeDescriptionBtn,
      editorSyncEnglishTitleBtn,
      editorSyncEnglishDescriptionBtn,
    ];
    if (editorTranslationBlock) {
      editorTranslationBlock.classList.toggle("is-visible", visible);
    }
    if (!visible) {
      setSubmissionTranslationInputsEditable(false);
      syncButtons.forEach((button) => {
        if (!button) return;
        button.disabled = true;
      });
      if (editorReviewWizardEnabled) {
        updateEditorReviewUi();
      } else {
        updateEditorSaveAvailability();
      }
      return;
    }
    setSubmissionTranslationInputsEditable(true);
    updateSubmissionTranslationPreview();
    const sourceLabel = toHeadingLanguageLabel(
      String((state && state.sourceLanguageLabel) || "source language"),
    );
    if (editorTranslationNote) {
      if (state.checking) {
        editorTranslationNote.textContent =
          copy.translationCheckingNote ||
          EDITOR_UI_COPY_BASE.translationCheckingNote;
      } else {
        editorTranslationNote.textContent = String(
          copy.translationVerifiedNote ||
            EDITOR_UI_COPY_BASE.translationVerifiedNote,
        ).replace("{language}", sourceLabel);
      }
    }
    if (editorEnglishTitlePreview) {
      writeTextNodeValue(editorEnglishTitlePreview, String(state.englishTitle || ""));
      if (isEditableTextNode(editorEnglishTitlePreview)) {
        editorEnglishTitlePreview.placeholder =
          copy.noTitleYet || EDITOR_UI_COPY_BASE.noTitleYet;
      }
    }
    if (editorEnglishDescriptionPreview) {
      writeTextNodeValue(
        editorEnglishDescriptionPreview,
        String(state.englishDescription || ""),
      );
      if (isEditableTextNode(editorEnglishDescriptionPreview)) {
        editorEnglishDescriptionPreview.placeholder =
          copy.noDescriptionYet || EDITOR_UI_COPY_BASE.noDescriptionYet;
      }
    }
    const canUseEnglishTitleSync = Boolean(
      String(readTextNodeValue(editorNativeTitlePreview) || "").trim(),
    );
    const canUseEnglishDescriptionSync = Boolean(
      String(readTextNodeValue(editorNativeDescriptionPreview) || "").trim(),
    );
    const canUseNativeTitleSync = Boolean(
      String(readTextNodeValue(editorEnglishTitlePreview) || "").trim(),
    );
    const canUseNativeDescriptionSync = Boolean(
      String(readTextNodeValue(editorEnglishDescriptionPreview) || "").trim(),
    );
    const setSyncButtonState = (button, enabled, label) => {
      if (!button) return;
      const title = `↻ ${label}`;
      button.disabled = Boolean(state.checking) || !enabled;
      button.title = title;
      button.setAttribute("aria-label", title);
    };
    setSyncButtonState(
      editorSyncNativeTitleBtn,
      canUseNativeTitleSync,
      "English → " + sourceLabel,
    );
    setSyncButtonState(
      editorSyncNativeDescriptionBtn,
      canUseNativeDescriptionSync,
      "English → " + sourceLabel,
    );
    setSyncButtonState(
      editorSyncEnglishTitleBtn,
      canUseEnglishTitleSync,
      sourceLabel + " → English",
    );
    setSyncButtonState(
      editorSyncEnglishDescriptionBtn,
      canUseEnglishDescriptionSync,
      sourceLabel + " → English",
    );
    if (editorReviewWizardEnabled) {
      updateEditorReviewUi();
    } else {
      updateEditorSaveAvailability();
    }
  }

  function resetSubmissionTranslationState() {
    submissionTranslationState = null;
    writeTextNodeValue(editorEnglishTitlePreview, "");
    writeTextNodeValue(editorEnglishDescriptionPreview, "");
    writeTextNodeValue(editorNativeTitlePreview, "");
    writeTextNodeValue(editorNativeDescriptionPreview, "");
    if (editorSourceLangLabel) editorSourceLangLabel.textContent = "Language";
    if (editorSourceLangFlag) editorSourceLangFlag.textContent = "🏳️";
    updateSubmissionTranslationUi();
  }

  function syncNativeTranslationInputsToMainFields() {
    const nativeTitle = readTextNodeValue(editorNativeTitlePreview);
    const nativeDescription = readTextNodeValue(editorNativeDescriptionPreview);
    if (editorTitle && editorTitle.value !== nativeTitle) {
      editorTitle.value = nativeTitle;
    }
    if (editorDescription && editorDescription.value !== nativeDescription) {
      editorDescription.value = nativeDescription;
    }
    updateSubmissionTranslationPreview();
    invalidateSubmissionTranslationOnNativeEdit();
    updateSubmissionTranslationUi();
  }

  function syncEnglishTranslationInputsToState() {
    const state = submissionTranslationState;
    if (!state) return;
    state.englishTitle = readTextNodeValue(editorEnglishTitlePreview);
    state.englishDescription = readTextNodeValue(editorEnglishDescriptionPreview);
    if (state.checked && !state.checkedAt) {
      state.checkedAt = new Date().toISOString();
    }
    updateSubmissionTranslationUi();
  }

  function invalidateSubmissionTranslationOnNativeEdit() {
    const state = submissionTranslationState;
    if (!state || !state.required) return;
    state.translationSourceTitle = String((editorTitle && editorTitle.value) || "").trim();
    state.translationSourceDescription = String(
      (editorDescription && editorDescription.value) || "",
    ).trim();
    state.checked = true;
    if (!state.checkedAt) {
      state.checkedAt = new Date().toISOString();
    }
  }

  async function translateSubmissionText(sourceLang, targetLang, text) {
    const sourceText = String(text || "").trim();
    if (!sourceText) return "";
    const response = await fetch(TRANSLATE_BATCH_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceLang: String(sourceLang || "auto").trim() || "auto",
        targetLang: String(targetLang || "en").trim() || "en",
        texts: [sourceText],
      }),
    });
    if (!response.ok) {
      throw new Error(`translation_status_${response.status}`);
    }
    const payload = await response.json().catch(() => null);
    const translated = Array.isArray(payload && payload.translated)
      ? payload.translated
      : null;
    const translatedText = translated && translated.length
      ? String(translated[0] || "").trim()
      : "";
    return translatedText || sourceText;
  }

  async function syncSubmissionTranslationField(options) {
    const state = submissionTranslationState;
    if (!state || !state.required || state.checking) return;
    const sourceNode = options && options.sourceNode;
    const targetNode = options && options.targetNode;
    const sourceLang = options && options.sourceLang;
    const targetLang = options && options.targetLang;
    const afterSync =
      options && typeof options.afterSync === "function"
        ? options.afterSync
        : null;
    const sourceText = String(readTextNodeValue(sourceNode) || "").trim();
    if (!sourceText) {
      writeTextNodeValue(targetNode, "");
      if (afterSync) afterSync();
      updateSubmissionTranslationUi();
      return;
    }
    state.checking = true;
    updateSubmissionTranslationUi();
    try {
      const translatedText = await translateSubmissionText(
        sourceLang,
        targetLang,
        sourceText,
      );
      writeTextNodeValue(targetNode, translatedText);
      if (afterSync) afterSync();
      state.checked = true;
      state.checkedAt = new Date().toISOString();
    } catch (_error) {
      const copy = getEditorUiCopy(editorUiCopyLang);
      showToast(
        copy.translationCheckFailedToast ||
          EDITOR_UI_COPY_BASE.translationCheckFailedToast,
        true,
      );
    } finally {
      state.checking = false;
      updateSubmissionTranslationUi();
    }
  }

  async function runSubmissionTranslationCheck() {
    const state = submissionTranslationState;
    const target = editorTarget;
    if (!state || !state.required || !isSubmissionArticleTarget(target)) return;
    const nativeTitle = String((editorTitle && editorTitle.value) || "").trim();
    const nativeDescription = String(
      (editorDescription && editorDescription.value) || "",
    ).trim();
    if (!nativeTitle && !nativeDescription) {
      const copy = getEditorUiCopy(editorUiCopyLang);
      showToast(
        copy.addTitleOrDescriptionBeforeCheck ||
          EDITOR_UI_COPY_BASE.addTitleOrDescriptionBeforeCheck,
        true,
      );
      return;
    }
    state.checking = true;
    updateSubmissionTranslationUi();
    try {
      const payload = {
        sourceLang: String(state.sourceLanguageCode || "auto"),
        targetLang: "en",
        texts: [nativeTitle, nativeDescription],
      };
      const response = await fetch(TRANSLATE_BATCH_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`translation_status_${response.status}`);
      }
      const data = await response.json();
      const translated = Array.isArray(data && data.translated)
        ? data.translated
        : [nativeTitle, nativeDescription];
      state.englishTitle = String(translated[0] || nativeTitle).trim();
      state.englishDescription = String(translated[1] || nativeDescription).trim();
      state.translationSourceTitle = nativeTitle;
      state.translationSourceDescription = nativeDescription;
      state.checked = true;
      state.checkedAt = new Date().toISOString();
      const copy = getEditorUiCopy(editorUiCopyLang);
      showToast(
        copy.translationCheckedToast || EDITOR_UI_COPY_BASE.translationCheckedToast,
      );
    } catch (_error) {
      const copy = getEditorUiCopy(editorUiCopyLang);
      showToast(
        copy.translationCheckFailedToast ||
          EDITOR_UI_COPY_BASE.translationCheckFailedToast,
        true,
      );
    } finally {
      state.checking = false;
      updateSubmissionTranslationUi();
    }
  }

  function initializeSubmissionTranslationState(countryId, item) {
    const translationRequired = requiresSubmissionTranslation(countryId, "article");
    const sourceLanguageCode = getCountryPrimaryLanguage(countryId);
    const sourceLanguageLabel = getLanguageDisplayLabel(sourceLanguageCode);
    const sourceLanguageFlag = getFlagFromLanguageCode(sourceLanguageCode);
    const nativeTitle = String(item && item.nativeTitle ? item.nativeTitle : item.title || "").trim();
    const nativeDescription = String(
      item && item.nativeDescription ? item.nativeDescription : item.description || "",
    ).trim();
    const englishTitle = String(item && item.englishTitle ? item.englishTitle : "").trim();
    const englishDescription = String(
      item && item.englishDescription ? item.englishDescription : "",
    ).trim();
    const checked = translationRequired
      ? Boolean(item && item.translationChecked)
      : true;
    submissionTranslationState = {
      visible: translationRequired,
      required: translationRequired,
      checking: false,
      checked,
      countryId: normalizeManageCountryCode(countryId),
      sourceLanguageCode,
      sourceLanguageLabel,
      sourceLanguageFlag,
      englishTitle: translationRequired ? englishTitle : englishTitle || nativeTitle,
      englishDescription: translationRequired
        ? englishDescription
        : englishDescription || nativeDescription,
      translationSourceTitle: String(
        (item && item.translationSourceTitle) || (checked ? nativeTitle : ""),
      ).trim(),
      translationSourceDescription: String(
        (item && item.translationSourceDescription) ||
          (checked ? nativeDescription : ""),
      ).trim(),
      checkedAt: String((item && item.translationCheckedAt) || "").trim(),
    };
    editorAutoTranslationPrimed = false;
    editorUiCopyLang = resolveEditorUiLanguageCode();
    ensureEditorUiCopy(editorUiCopyLang);
    updateSubmissionTranslationUi();
  }

  function clearEditorFields() {
    resetSubmissionTranslationState();
    editorReviewWizardEnabled = false;
    editorReviewStepIndex = 0;
    editorReviewSteps = [];
    editorAutoTranslationPrimed = false;
    editorSubmissionFinalStatus = "";
    if (editorTitle) editorTitle.value = "";
    if (editorDescription) editorDescription.value = "";
    updateEditorTextCounters();
    if (editorOwnershipType) editorOwnershipType.value = "";
    if (editorOwnershipName) editorOwnershipName.value = "";
    if (editorContactName) editorContactName.value = "";
    if (editorContactRole) editorContactRole.value = "";
    if (editorContactEmail) editorContactEmail.value = "";
    markSubmissionContactFieldsValid();
    resetEditorResourceLanguageItems(selectedCountryId || "");
    renderEditorResourceLanguageItems();
    if (editorRepName) editorRepName.value = "";
    if (editorRepTitle) editorRepTitle.value = "";
    if (editorRepOrganisation) editorRepOrganisation.value = "";
    if (editorRepImageFile) editorRepImageFile.value = "";
    representativeImagePath = "";
    representativeSourceImagePath = "";
    representativeCropSource = "";
    representativeCropFileName = "representative-image.png";
    representativeImageNaturalWidth = 0;
    representativeImageNaturalHeight = 0;
    representativeCrop = null;
    representativeInitial = null;
    cropPointerState = null;
    if (editorCropImage) {
      editorCropImage.removeAttribute("src");
      editorCropImage.style.display = "none";
      editorCropImage.style.transform = "translate(-50%, -50%)";
      editorCropImage.style.width = "0px";
      editorCropImage.style.height = "0px";
    }
    if (editorCropFrame) {
      editorCropFrame.style.display = "none";
      editorCropFrame.style.left = "0px";
      editorCropFrame.style.top = "0px";
      editorCropFrame.style.width = "0px";
      editorCropFrame.style.height = "0px";
    }
    if (editorCropStatus) {
      editorCropStatus.textContent = "No new image selected.";
    }
    setSubmissionEntryFieldsVisible(false);
  }

  function setCropStatus(message) {
    if (editorCropStatus) editorCropStatus.textContent = String(message || "");
  }

  function getPreviewRect() {
    if (!editorCropImage || !editorCropImage.parentElement) return null;
    const naturalW =
      representativeImageNaturalWidth || editorCropImage.naturalWidth || 0;
    const naturalH =
      representativeImageNaturalHeight || editorCropImage.naturalHeight || 0;
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
    const minW = Math.max(64, rect.dw * 0.05);
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
    editorCropFrame.style.display = "block";
    editorCropFrame.style.width = `${frame.w}px`;
    editorCropFrame.style.height = `${frame.h}px`;
    editorCropFrame.style.left = `${frame.cx - frame.w / 2}px`;
    editorCropFrame.style.top = `${frame.cy - frame.h / 2}px`;
  }

  function initializeCropFrame(cropNorm) {
    const rect = getPreviewRect();
    if (!rect) return;
    if (cropNorm && typeof cropNorm === "object") {
      const cx =
        rect.x +
        ((Number(cropNorm.x) || 0) + (Number(cropNorm.w) || 0) / 2) * rect.dw;
      const cy =
        rect.y +
        ((Number(cropNorm.y) || 0) + (Number(cropNorm.h) || 0) / 2) * rect.dh;
      const w = Math.max(10, (Number(cropNorm.w) || 0.7) * rect.dw);
      representativeCrop = { cx, cy, w, h: w / (700 / 520) };
    } else {
      const maxW = Math.min(rect.dw, rect.dh * (700 / 520));
      const w = maxW * 0.92;
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
    representativeCropSource = String(src || "").trim();
    representativeImageNaturalWidth = 0;
    representativeImageNaturalHeight = 0;
    if (!editorCropImage) return;
    if (!representativeCropSource) {
      editorCropImage.removeAttribute("src");
      editorCropImage.style.display = "none";
      if (editorCropFrame) editorCropFrame.style.display = "none";
      setCropStatus("No new image selected.");
      return;
    }
    editorCropImage.style.display = "block";
    if (/^https?:\/\//i.test(representativeCropSource)) {
      editorCropImage.crossOrigin = "anonymous";
    } else {
      editorCropImage.removeAttribute("crossorigin");
    }
    editorCropImage.src = representativeCropSource;
    editorCropImage.onload = () => {
      representativeImageNaturalWidth = editorCropImage.naturalWidth || 0;
      representativeImageNaturalHeight = editorCropImage.naturalHeight || 0;
      const rect = getPreviewRect();
      if (!rect) return;
      editorCropImage.style.width = `${rect.dw}px`;
      editorCropImage.style.height = `${rect.dh}px`;
      editorCropImage.style.transform = "translate(-50%, -50%)";
      initializeCropFrame(cropNorm);
    };
    setCropStatus("Move and resize frame. Save will keep this framing.");
  }

  async function uploadRepresentativeImageData(dataUrl, filename) {
    const response = await fetch(UPLOAD_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: filename || "representative-image.png",
        dataUrl: String(dataUrl || ""),
      }),
    });
    let payload = null;
    try {
      payload = await response.json();
    } catch (error) {
      payload = null;
    }
    if (!response.ok || (payload && payload.ok === false)) {
      const details = payload && payload.details ? String(payload.details) : "";
      const code =
        payload && payload.error
          ? String(payload.error)
          : `http_${response.status}`;
      throw new Error(details ? `${code}: ${details}` : code);
    }
    const imagePath = payload && payload.path ? String(payload.path) : "";
    if (!imagePath) throw new Error("upload_no_path");
    return imagePath;
  }

  function makeCroppedDataUrl() {
    return new Promise((resolve, reject) => {
      if (!representativeCropSource) {
        reject(new Error("no_source"));
        return;
      }
      const img = new Image();
      if (/^https?:\/\//i.test(representativeCropSource)) {
        img.crossOrigin = "anonymous";
      }
      img.onload = () => {
        const width = 700;
        const height = 520;
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("no_ctx"));
          return;
        }
        const crop = normalizeCropFrame();
        if (!crop) {
          reject(new Error("crop_not_ready"));
          return;
        }
        const sx = crop.x * img.naturalWidth;
        const sy = crop.y * img.naturalHeight;
        const sw = crop.w * img.naturalWidth;
        const sh = crop.h * img.naturalHeight;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
        try {
          resolve(canvas.toDataURL("image/png"));
        } catch (error) {
          reject(new Error("canvas_tainted"));
        }
      };
      img.onerror = () => reject(new Error("image_load_failed"));
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
    countryTabsHost.innerHTML = "";
    if (accessScope.mode === "all") {
      const overviewBtn = document.createElement("button");
      overviewBtn.type = "button";
      overviewBtn.className = "ecva-manage-country-tab is-overview";
      overviewBtn.textContent = "Overview";
      if (!selectedCountryId) {
        overviewBtn.classList.add("is-active");
        overviewBtn.disabled = true;
      }
      if (!overviewBtn.disabled) {
        overviewBtn.addEventListener("click", () => {
          selectedCountryId = "";
          renderCountryTabs();
          if (manageBody) {
            manageBody.innerHTML = "";
            renderGeneralAccessPanel();
          }
        });
      }
      countryTabsHost.appendChild(overviewBtn);
    }

    const tabsSource =
      accessScope.mode === "country"
        ? countryCatalog.filter((country) =>
            isCountryAllowed(country && country.code),
          )
        : activeCountries;

    tabsSource.forEach((country) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ecva-manage-country-tab";
      const countryCode = normalizeManageCountryCode(country && country.code);
      const allowed = isCountryAllowed(countryCode);
      if (
        countryCode === normalizeManageCountryCode(selectedCountryId) &&
        allowed
      ) {
        btn.classList.add("is-active");
        btn.disabled = true;
      }
      const displayCode =
        String(countryCode || "").toUpperCase() === "GB"
          ? "UK"
          : String(countryCode || "").toUpperCase();
      btn.textContent = `${country.flag || ""} ${displayCode}`.trim();
      btn.title = country.name || country.code;
      if (!allowed) {
        btn.classList.add("is-locked");
        btn.disabled = true;
        btn.textContent = `🔒 ${btn.textContent}`;
      }
      if (!btn.disabled) {
        btn.addEventListener("click", () => {
          selectCountry(countryCode);
        });
      }
      countryTabsHost.appendChild(btn);
    });
    updateVersionHistoryButtonVisibility();
  }

  function selectCountry(countryId) {
    const nextCountryId = normalizeManageCountryCode(countryId);
    if (!nextCountryId || !isCountryAllowed(nextCountryId)) return;
    selectedCountryId = String(nextCountryId || "").trim();
    if (!selectedCountryId) return;
    renderCountryTabs();
    updateVersionHistoryButtonVisibility();
    if (manageBody) manageBody.innerHTML = "";
    postToMap("ecva-request-country-modal-html", {
      countryId: selectedCountryId,
    });
    requestCountryInbox(selectedCountryId).catch(() => {});
  }

  function setCountryInbox(countryId, inbox) {
    const code = normalizeManageCountryCode(countryId);
    if (!code) return;
    const list = Array.isArray(inbox) ? inbox : [];
    let normalized = list
      .filter((item) => item && typeof item === "object")
      .map((item) => {
        const legacyRepresentativeName = String(
          item.representativeName || item.name || "",
        ).trim();
        const legacyRepresentativeTitle = String(
          item.representativeTitle || item.role || "",
        ).trim();
        const legacyRepresentativeOrganisation = String(
          item.organisation || item.organization || "",
        ).trim();
        const representativeDraft =
          item.representativeDraft &&
          typeof item.representativeDraft === "object"
            ? {
                name: String(item.representativeDraft.name || "").trim(),
                title: String(item.representativeDraft.title || "").trim(),
                organisation: String(
                  item.representativeDraft.organisation || "",
                ).trim(),
                image: String(item.representativeDraft.image || "").trim(),
                sourceImage: String(
                  item.representativeDraft.sourceImage || "",
                ).trim(),
                crop:
                  item.representativeDraft.crop &&
                  typeof item.representativeDraft.crop === "object"
                    ? {
                        x: Number(item.representativeDraft.crop.x),
                        y: Number(item.representativeDraft.crop.y),
                        w: Number(item.representativeDraft.crop.w),
                        h: Number(item.representativeDraft.crop.h),
                      }
                    : null,
              }
            : legacyRepresentativeName ||
                legacyRepresentativeTitle ||
                legacyRepresentativeOrganisation
              ? {
                  name: legacyRepresentativeName,
                  title: legacyRepresentativeTitle,
                  organisation: legacyRepresentativeOrganisation,
                  image: String(item.image || "").trim(),
                  sourceImage: String(
                    item.sourceImage || item.image || "",
                  ).trim(),
                  crop:
                    item.crop && typeof item.crop === "object"
                      ? {
                          x: Number(item.crop.x),
                          y: Number(item.crop.y),
                          w: Number(item.crop.w),
                          h: Number(item.crop.h),
                        }
                      : null,
                }
              : null;
        const mode =
          String(item.type || "")
            .trim()
            .toLowerCase() === "representative"
            ? "representative"
            : "article";
        const translationRequired = requiresSubmissionTranslation(code, mode);
        const nativeTitle = String(item.nativeTitle || item.title || "").trim();
        const nativeDescription = String(
          item.nativeDescription || item.description || "",
        ).trim();
        const englishTitle = String(item.englishTitle || "").trim();
        const englishDescription = String(item.englishDescription || "").trim();
        const translationChecked = translationRequired
          ? Boolean(item.translationChecked)
          : true;
        return {
          id:
            String(item.id || "").trim() ||
            `${code}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          countryId: code,
          type: mode,
          status: normalizeSubmissionStatus(item.status),
          pillarId: String(item.pillarId || "")
            .trim()
            .toLowerCase(),
          pillarLabel: String(item.pillarLabel || "").trim(),
          title: nativeTitle || legacyRepresentativeName,
          nativeTitle: nativeTitle || legacyRepresentativeName,
          englishTitle: translationRequired
            ? englishTitle
            : englishTitle || nativeTitle || legacyRepresentativeName,
          subtitle: String(item.subtitle || "").trim(),
          description:
            nativeDescription ||
            [legacyRepresentativeTitle, legacyRepresentativeOrganisation]
              .filter(Boolean)
              .join(" • "),
          nativeDescription:
            nativeDescription ||
            [legacyRepresentativeTitle, legacyRepresentativeOrganisation]
              .filter(Boolean)
              .join(" • "),
          englishDescription: translationRequired
            ? englishDescription
            : englishDescription || nativeDescription,
          translationChecked,
          translationSourceTitle: String(item.translationSourceTitle || "").trim(),
          translationSourceDescription: String(
            item.translationSourceDescription || "",
          ).trim(),
          translationCheckedAt: String(item.translationCheckedAt || "").trim(),
          languageAvailability: String(item.languageAvailability || "").trim(),
          links: Array.isArray(item.links)
            ? item.links.map((next) => String(next || "").trim()).filter(Boolean)
            : [],
          attachments: Array.isArray(item.attachments)
            ? item.attachments
                .filter((next) => next && typeof next === "object")
                .map((next) => ({
                  name: String(next.name || "").trim(),
                  url: String(next.url || "").trim(),
                }))
                .filter((next) => next.name || next.url)
            : [],
          resourceLanguages: Array.isArray(item.resourceLanguages)
            ? item.resourceLanguages
                .filter((next) => next && typeof next === "object")
                .map((next) => ({
                  languageCode: String(next.languageCode || "")
                    .trim()
                    .toLowerCase(),
                  languageLabel: String(next.languageLabel || "").trim(),
                  languageFlag: String(next.languageFlag || "").trim(),
                  resourceType: String(next.resourceType || "")
                    .trim()
                    .toLowerCase(),
                  resourceTypeLabel: String(next.resourceTypeLabel || "").trim(),
                  resourcePricing: String(next.resourcePricing || "free")
                    .trim()
                    .toLowerCase(),
                  resourcePricingLabel: String(next.resourcePricingLabel || "").trim(),
                  accessType:
                    String(next.accessType || "url").trim().toLowerCase() ===
                    "file"
                      ? "file"
                      : "url",
                  resourceUrl: String(next.resourceUrl || "").trim(),
                  fileName: String(next.fileName || "").trim(),
                }))
                .filter((next) => next.resourceUrl)
            : [],
          ownership:
            item.ownership && typeof item.ownership === "object"
              ? {
                  type: String(item.ownership.type || "").trim(),
                  name: String(item.ownership.name || "").trim(),
                }
              : { type: "", name: "" },
          submittedBy:
            item.submittedBy && typeof item.submittedBy === "object"
              ? {
                  name: String(item.submittedBy.name || "").trim(),
                  email: String(item.submittedBy.email || "").trim(),
                }
              : { name: "", email: "" },
          representativeContact:
            item.representativeContact &&
            typeof item.representativeContact === "object"
              ? {
                  name: String(item.representativeContact.name || "").trim(),
                  role: String(item.representativeContact.role || "").trim(),
                  email: String(item.representativeContact.email || "").trim(),
                }
              : { name: "", role: "", email: "" },
          representativeDraft,
          createdAt: String(item.createdAt || "").trim(),
          updatedAt: String(item.updatedAt || "").trim(),
        };
      });
    inboxByCountry[code] = normalized;
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
        reject(new Error("map_not_ready"));
        return;
      }
      const requestId = `inbox-${Date.now()}-${(inboxRequestCounter += 1)}`;
      const timeout = window.setTimeout(() => {
        pendingInboxRequests.delete(requestId);
        reject(new Error("inbox_timeout"));
      }, 2600);
      pendingInboxRequests.set(requestId, {
        resolve,
        reject,
        timeout,
        countryId: code,
      });
      postToMap("ecva-request-country-inbox", { countryId: code, requestId });
    });
  }

  function requestLabelOverrides(rawLang) {
    const lang = normalizeLanguageCode(rawLang);
    return new Promise((resolve) => {
      if (!mapFrame.contentWindow) {
        resolve(getLabelOverridesForLang(lang));
        return;
      }
      const requestId = `labels-${Date.now()}-${(labelOverrideRequestCounter += 1)}`;
      const timeout = window.setTimeout(() => {
        pendingLabelOverrideRequests.delete(requestId);
        resolve(getLabelOverridesForLang(lang));
      }, 2200);
      pendingLabelOverrideRequests.set(requestId, { lang, resolve, timeout });
      postToMap("ecva-request-label-overrides", { lang, requestId });
    });
  }

  function updateSubmissionStatus(countryId, submissionId, status) {
    const code = normalizeManageCountryCode(countryId);
    const nextStatus = normalizeSubmissionStatus(status);
    if (!code || !submissionId) return;
    postToMap("ecva-editor-update-submission-status", {
      countryId: code,
      submissionId: String(submissionId),
      status: nextStatus,
    });
  }

  function wireManageEntryExpanders(scope) {
    const entries = scope.querySelectorAll(".country-modal-entry");
    entries.forEach((entry) => {
      const btn = entry.querySelector(".country-modal-entry-readmore-btn");
      const panel = entry.querySelector(".country-modal-entry-expand");
      if (!btn || !panel || btn.dataset.wired === "1") return;
      btn.dataset.wired = "1";
      panel.hidden = true;
      panel.style.height = "0px";
      btn.addEventListener("click", () => {
        const isOpen = entry.classList.contains("is-open");
        if (isOpen) {
          const current = panel.scrollHeight;
          panel.style.height = `${current}px`;
          requestAnimationFrame(() => {
            entry.classList.remove("is-open");
            btn.setAttribute("aria-expanded", "false");
            btn.textContent = "Read More";
            panel.style.height = "0px";
          });
          window.setTimeout(() => {
            panel.hidden = true;
          }, 320);
          return;
        }

        panel.hidden = false;
        panel.style.height = "0px";
        requestAnimationFrame(() => {
          const target = panel.scrollHeight;
          entry.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
          btn.textContent = "Show Less";
          panel.style.height = `${target}px`;
        });
        window.setTimeout(() => {
          if (entry.classList.contains("is-open")) {
            panel.style.height = "auto";
          }
        }, 340);
      });
    });
  }

  function wireManageSeeMore(scope) {
    const buttons = scope.querySelectorAll(
      ".country-modal-see-more-btn[data-pillar-target]",
    );
    buttons.forEach((btn) => {
      if (btn.dataset.wired === "1") return;
      btn.dataset.wired = "1";
      btn.addEventListener("click", () => {
        const pillarId = btn.getAttribute("data-pillar-target");
        if (!pillarId || !manageBody) return;
        const target = manageBody.querySelector(
          `[data-pillar-card="${pillarId}"]`,
        );
        if (!target) return;
        const targetRect = target.getBoundingClientRect();
        const top = window.scrollY + (targetRect.top - 14);
        window.scrollTo({ top, behavior: "smooth" });
      });
    });
  }

  function wireManageEntryReorder(scope) {
    if (!scope || !canEditContent()) return;
    const lists = scope.querySelectorAll(".country-modal-entry-list");
    const dragState = {
      entry: null,
      list: null,
      fromIndex: -1,
      countryId: "",
      pillarId: "",
    };

    const clearDropMarks = (list) => {
      if (!list) return;
      list.querySelectorAll(".country-modal-entry").forEach((entry) => {
        entry.classList.remove("is-drop-before", "is-drop-after");
      });
    };

    const resetDragState = () => {
      if (dragState.entry) {
        dragState.entry.classList.remove("is-dragging");
      }
      if (dragState.list) {
        clearDropMarks(dragState.list);
      }
      dragState.entry = null;
      dragState.list = null;
      dragState.fromIndex = -1;
      dragState.countryId = "";
      dragState.pillarId = "";
    };

    lists.forEach((list) => {
      const entries = Array.from(
        list.querySelectorAll(".country-modal-entry[data-entry-index]"),
      );
      entries.forEach((entry) => {
        if (entry.dataset.reorderWired === "1") return;
        entry.dataset.reorderWired = "1";
        entry.setAttribute("draggable", "true");
        entry.classList.add("is-reorder-enabled");
        entry.addEventListener("dragstart", (event) => {
          const countryId = String(
            entry.getAttribute("data-entry-country") || selectedCountryId || "",
          ).trim();
          const pillarId = String(
            entry.getAttribute("data-entry-pillar") || "",
          ).trim();
          const fromIndex = Number(entry.getAttribute("data-entry-index"));
          if (!countryId || !pillarId || !Number.isInteger(fromIndex)) {
            event.preventDefault();
            return;
          }
          dragState.entry = entry;
          dragState.list = list;
          dragState.fromIndex = fromIndex;
          dragState.countryId = countryId;
          dragState.pillarId = pillarId;
          entry.classList.add("is-dragging");
          if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData(
              "text/plain",
              `${countryId}:${pillarId}:${fromIndex}`,
            );
          }
        });
        entry.addEventListener("dragend", () => {
          resetDragState();
        });
      });

      if (list.dataset.reorderWired === "1") return;
      list.dataset.reorderWired = "1";
      list.addEventListener("dragover", (event) => {
        if (!dragState.entry || dragState.list !== list) return;
        event.preventDefault();
        const target = event.target.closest(".country-modal-entry");
        clearDropMarks(list);
        if (!target || target === dragState.entry) return;
        const rect = target.getBoundingClientRect();
        const before = event.clientY < rect.top + rect.height / 2;
        target.classList.add(before ? "is-drop-before" : "is-drop-after");
      });
      list.addEventListener("dragleave", (event) => {
        if (!dragState.entry || dragState.list !== list) return;
        const related = event.relatedTarget;
        if (related && list.contains(related)) return;
        clearDropMarks(list);
      });
      list.addEventListener("drop", (event) => {
        if (!dragState.entry || dragState.list !== list) return;
        event.preventDefault();
        const target = event.target.closest(".country-modal-entry");
        clearDropMarks(list);
        if (!target || target === dragState.entry) return;
        const rect = target.getBoundingClientRect();
        const before = event.clientY < rect.top + rect.height / 2;
        if (before) {
          list.insertBefore(dragState.entry, target);
        } else {
          list.insertBefore(dragState.entry, target.nextSibling);
        }
        const ordered = Array.from(
          list.querySelectorAll(".country-modal-entry[data-entry-index]"),
        );
        const toIndex = ordered.indexOf(dragState.entry);
        if (
          !Number.isInteger(toIndex) ||
          toIndex < 0 ||
          toIndex === dragState.fromIndex
        )
          return;
        ordered.forEach((entryEl, idx) => {
          entryEl.setAttribute("data-entry-index", String(idx));
        });
        postToMap("ecva-editor-reorder-entry", {
          countryId: dragState.countryId,
          pillarId: dragState.pillarId,
          fromIndex: dragState.fromIndex,
          toIndex,
        });
      });
    });
  }

  function wireManageOutlookCarousels(scope) {
    if (!scope) return;
    const carousels = scope.querySelectorAll("[data-rep-carousel]");
    carousels.forEach((carousel) => {
      if (carousel.dataset.editorWired === "1") return;
      carousel.dataset.editorWired = "1";

      const slides = Array.from(
        carousel.querySelectorAll(".country-modal-rep-slide"),
      );
      const prevBtn = carousel.querySelector(".country-modal-rep-nav.is-prev");
      const nextBtn = carousel.querySelector(".country-modal-rep-nav.is-next");
      const dotsHost = carousel
        .closest(".country-modal-rep-carousel-wrap")
        ?.querySelector("[data-rep-dots]");
      if (!slides.length) return;

      let index = 0;
      const len = slides.length;
      const hasMultiple = len > 1;
      let dots = [];
      carousel.classList.toggle("is-single", !hasMultiple);

      if (prevBtn) {
        prevBtn.style.display = hasMultiple ? "" : "none";
        prevBtn.disabled = !hasMultiple;
        prevBtn.setAttribute("aria-hidden", hasMultiple ? "false" : "true");
      }
      if (nextBtn) {
        nextBtn.style.display = hasMultiple ? "" : "none";
        nextBtn.disabled = !hasMultiple;
        nextBtn.setAttribute("aria-hidden", hasMultiple ? "false" : "true");
      }
      if (dotsHost) {
        dotsHost.style.display = hasMultiple ? "inline-flex" : "none";
      }

      const getCircularOffset = (i, active, total) => {
        let diff = i - active;
        if (diff > total / 2) diff -= total;
        if (diff < -total / 2) diff += total;
        return diff;
      };

      const apply = () => {
        if (!hasMultiple) {
          slides.forEach((slide, i) => {
            slide.classList.remove("is-hidden");
            if (i === 0) {
              slide.setAttribute("data-offset", "0");
            } else {
              slide.removeAttribute("data-offset");
              slide.classList.add("is-hidden");
            }
          });
          dots.forEach((dot, i) => {
            dot.classList.toggle("is-active", i === 0);
            dot.setAttribute("aria-current", i === 0 ? "true" : "false");
          });
          return;
        }
        slides.forEach((slide, i) => {
          const offset = getCircularOffset(i, index, len);
          slide.classList.remove("is-hidden");
          slide.removeAttribute("data-offset");
          if (Math.abs(offset) > 2) {
            slide.classList.add("is-hidden");
            return;
          }
          slide.setAttribute("data-offset", String(offset));
        });
        dots.forEach((dot, i) => {
          dot.classList.toggle("is-active", i === index);
          dot.setAttribute("aria-current", i === index ? "true" : "false");
        });
      };

      if (dotsHost) {
        dotsHost.innerHTML = "";
        dots = slides.map((_, i) => {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = "country-modal-rep-dot";
          dot.setAttribute("aria-label", `Go to representative ${i + 1}`);
          dot.addEventListener("click", () => {
            index = i;
            apply();
          });
          dotsHost.appendChild(dot);
          return dot;
        });
      }

      if (prevBtn && hasMultiple) {
        prevBtn.addEventListener("click", () => {
          index = (index - 1 + len) % len;
          apply();
        });
      }
      if (nextBtn && hasMultiple) {
        nextBtn.addEventListener("click", () => {
          index = (index + 1) % len;
          apply();
        });
      }

      slides.forEach((slide, i) => {
        slide.addEventListener("click", () => {
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
    const pillarSection = entryEl.closest("[data-pillar-card]");
    const pillarId = (
      entryEl.getAttribute("data-entry-pillar") ||
      (pillarSection ? pillarSection.getAttribute("data-pillar-card") : "") ||
      ""
    ).trim();
    const countryId = (
      entryEl.getAttribute("data-entry-country") ||
      selectedCountryId ||
      ""
    ).trim();
    const entryIndex = Number(entryEl.getAttribute("data-entry-index"));

    if (
      !pillarId ||
      !countryId ||
      !Number.isInteger(entryIndex) ||
      entryIndex < 0
    ) {
      showToast("This entry cannot be edited yet.", true);
      return;
    }

    const title =
      (entryEl.querySelector(".country-modal-entry-top h5") || {})
        .textContent || "";
    const subtitle =
      (entryEl.querySelector(".country-modal-entry-subtitle") || {})
        .textContent || "";
    const description =
      (entryEl.querySelector(".country-modal-entry-description") || {})
        .textContent || "";

    if (pillarId === "resources") {
      const requestId = `entry-data-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      const timeout = window.setTimeout(() => {
        pendingEntryDataRequests.delete(requestId);
        showToast("Could not load resource editor data.", true);
      }, 2500);
      pendingEntryDataRequests.set(requestId, {
        timeout,
        countryId,
        pillarId,
        entryIndex,
        title: title.trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
      });
      postToMap("ecva-request-entry-data", {
        requestId,
        countryId,
        pillarId,
        entryIndex,
      });
      return;
    }

    clearEditorFields();
    if (editorTitle) editorTitle.value = title.trim();
    if (editorDescription) editorDescription.value = description.trim();
    updateEditorTextCounters();

    editorTarget = { type: "entry", countryId, pillarId, entryIndex };
    setEditorMode("entry");
    openEditorModal();
  }

  function openAddEntryEditor(countryId, pillarId, pillarLabel) {
    const validCountryId = String(countryId || selectedCountryId || "").trim();
    const validPillarId = String(pillarId || "").trim();
    if (!validCountryId || !validPillarId) return;
    clearEditorFields();
    editorTarget = {
      type: "entry",
      action: "add",
      countryId: validCountryId,
      pillarId: validPillarId,
    };
    setEditorMode("entry");
    openEditorModal();
  }

  function openRepresentativeEditor(repEl, countryId, repIndex) {
    const validCountryId = String(countryId || selectedCountryId || "").trim();
    const validIndex = Number(repIndex);
    if (!validCountryId || !Number.isInteger(validIndex) || validIndex < 0) {
      showToast("This representative cannot be edited yet.", true);
      return;
    }

    const name =
      (repEl.querySelector(".country-modal-rep-meta h5") || {}).textContent ||
      "";
    const title =
      (repEl.querySelector(".country-modal-representative-title") || {})
        .textContent || "";
    const organisation =
      (repEl.querySelector(".country-modal-representative-org") || {})
        .textContent || "";
    const imgEl = repEl.querySelector(".country-modal-rep-media img");
    const image = imgEl ? String(imgEl.getAttribute("src") || "").trim() : "";
    const sourceImage = String(
      repEl.getAttribute("data-source-image") || image,
    ).trim();
    const cropXRaw = String(repEl.getAttribute("data-crop-x") || "").trim();
    const cropYRaw = String(repEl.getAttribute("data-crop-y") || "").trim();
    const cropWRaw = String(repEl.getAttribute("data-crop-w") || "").trim();
    const cropHRaw = String(repEl.getAttribute("data-crop-h") || "").trim();
    const crop = {
      x: cropXRaw === "" ? NaN : Number(cropXRaw),
      y: cropYRaw === "" ? NaN : Number(cropYRaw),
      w: cropWRaw === "" ? NaN : Number(cropWRaw),
      h: cropHRaw === "" ? NaN : Number(cropHRaw),
    };
    const hasCrop = [crop.x, crop.y, crop.w, crop.h].every((value) =>
      Number.isFinite(value),
    );

    clearEditorFields();
    if (editorRepName) editorRepName.value = name.trim();
    if (editorRepTitle) editorRepTitle.value = title.trim();
    if (editorRepOrganisation)
      editorRepOrganisation.value = organisation.trim();
    representativeImagePath = image;
    representativeSourceImagePath = sourceImage;
    setCropPreviewImage(sourceImage, hasCrop ? crop : null);
    setCropStatus("Current image loaded. Move or resize frame, then Save.");
    representativeInitial = {
      name: name.trim(),
      title: title.trim(),
      organisation: organisation.trim(),
      image,
      sourceImage,
      crop: hasCrop ? crop : null,
    };

    editorTarget = {
      type: "representative",
      action: "update",
      countryId: validCountryId,
      representativeIndex: validIndex,
    };
    setEditorMode("representative");
    openEditorModal();
  }

  function openAddRepresentativeEditor(countryId) {
    const validCountryId = String(countryId || selectedCountryId || "").trim();
    if (!validCountryId) return;
    clearEditorFields();
    setCropPreviewImage("");
    editorTarget = {
      type: "representative",
      action: "add",
      countryId: validCountryId,
    };
    setEditorMode("representative");
    openEditorModal();
  }

  function addEditButtons(scope) {
    const entries = scope.querySelectorAll(".country-modal-entry");
    entries.forEach((entryEl) => {
      if (entryEl.querySelector(".ecva-entry-edit-btn")) return;
      const top = entryEl.querySelector(".country-modal-entry-top");
      if (!top) return;
      if (!top.querySelector(".ecva-entry-drag-handle")) {
        const handle = document.createElement("span");
        handle.className = "ecva-entry-drag-handle";
        handle.setAttribute("aria-hidden", "true");
        handle.textContent = "⋮⋮";
        top.prepend(handle);
      }
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "ecva-entry-edit-btn";
      editBtn.setAttribute("aria-label", "Review Entry");
      editBtn.setAttribute("title", "Review Entry");
      editBtn.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M4 6.8A2.8 2.8 0 0 1 6.8 4H12a1 1 0 1 1 0 2H6.8C6.36 6 6 6.36 6 6.8v10.4c0 .44.36.8.8.8h10.4c.44 0 .8-.36.8-.8V12a1 1 0 1 1 2 0v5.2a2.8 2.8 0 0 1-2.8 2.8H6.8A2.8 2.8 0 0 1 4 17.2V6.8Zm15.7-3.1a2.3 2.3 0 0 1 3.25 3.25l-9.22 9.22a1 1 0 0 1-.45.26l-3.48.93a1 1 0 0 1-1.22-1.22l.93-3.48a1 1 0 0 1 .26-.45l9.22-9.22Zm1.84 1.41a.3.3 0 0 0-.42 0l-8.99 8.99-.47 1.74 1.74-.47 8.99-8.99a.3.3 0 0 0 0-.42l-.85-.85Z"></path>
        </svg>
      `;
      editBtn.addEventListener("click", () => {
        openEntryEditor(entryEl);
      });
      top.appendChild(editBtn);
    });
  }

  function addRepresentativeControls(scope) {
    const carouselWrap = scope.querySelector(
      ".country-modal-rep-carousel-wrap",
    );
    if (!carouselWrap) return;
    const countryId =
      selectedCountryId ||
      String(
        scope.querySelector(".country-modal-hero-name")?.textContent || "",
      ).trim();

    const slides = carouselWrap.querySelectorAll(".country-modal-rep-slide");
    slides.forEach((slideEl) => {
      if (slideEl.classList.contains("is-empty")) return;
      if (slideEl.querySelector(".ecva-rep-edit-btn")) return;
      if (window.getComputedStyle(slideEl).position === "static") {
        slideEl.style.position = "relative";
      }
      const repIndex = Number(slideEl.getAttribute("data-slide-index"));
      if (!Number.isInteger(repIndex) || repIndex < 0) return;
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "ecva-entry-edit-btn ecva-rep-edit-btn";
      editBtn.setAttribute("aria-label", "Edit representative");
      editBtn.setAttribute("title", "Edit representative");
      editBtn.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M4 6.8A2.8 2.8 0 0 1 6.8 4H12a1 1 0 1 1 0 2H6.8C6.36 6 6 6.36 6 6.8v10.4c0 .44.36.8.8.8h10.4c.44 0 .8-.36.8-.8V12a1 1 0 1 1 2 0v5.2a2.8 2.8 0 0 1-2.8 2.8H6.8A2.8 2.8 0 0 1 4 17.2V6.8Zm15.7-3.1a2.3 2.3 0 0 1 3.25 3.25l-9.22 9.22a1 1 0 0 1-.45.26l-3.48.93a1 1 0 0 1-1.22-1.22l.93-3.48a1 1 0 0 1 .26-.45l9.22-9.22Zm1.84 1.41a.3.3 0 0 0-.42 0l-8.99 8.99-.47 1.74 1.74-.47 8.99-8.99a.3.3 0 0 0 0-.42l-.85-.85Z"></path>
        </svg>
      `;
      editBtn.style.position = "absolute";
      editBtn.style.top = "10px";
      editBtn.style.right = "10px";
      editBtn.style.zIndex = "4";
      editBtn.addEventListener("click", () => {
        openRepresentativeEditor(slideEl, countryId, repIndex);
      });
      slideEl.appendChild(editBtn);
    });

    const footer = carouselWrap.querySelector(".country-modal-rep-footer");
    if (!footer || footer.querySelector(".ecva-rep-manage-btn")) return;
    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "ecva-admin-btn secondary ecva-rep-manage-btn";
    addBtn.style.height = "44px";
    addBtn.style.fontSize = "14px";
    addBtn.textContent = "Manage representatives";
    addBtn.addEventListener("click", () => {
      openRepresentativeManageModal(countryId);
    });
    footer.appendChild(addBtn);
  }

  function wireManagePillarPostButtons(scope) {
    if (!scope) return;
    const buttons = scope.querySelectorAll(
      ".country-modal-detail-post-btn[data-contribute-pillar]",
    );
    buttons.forEach((btn) => {
      if (btn.dataset.editorWired === "1") return;
      btn.dataset.editorWired = "1";
      const pillarId = String(
        btn.getAttribute("data-contribute-pillar") || "",
      ).trim();
      const countryId = String(
        btn.getAttribute("data-contribute-country") || selectedCountryId || "",
      ).trim();
      const pillarLabel = String(
        btn.getAttribute("data-contribute-label") || "",
      ).trim();
      btn.textContent = "+";
      btn.setAttribute(
        "aria-label",
        `Add ${pillarLabel || pillarId || "article"}`,
      );
      btn.setAttribute("title", `Add ${pillarLabel || pillarId || "article"}`);
      btn.classList.add("is-editor-add");
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const countryMeta = Array.isArray(countryCatalog)
          ? countryCatalog.find(
              (country) =>
                normalizeManageCountryCode(country && country.code) ===
                normalizeManageCountryCode(countryId),
            )
          : null;
        window.postMessage(
          {
            type: "ecva-open-contribute-modal",
            payload: {
              mode: "article",
              countryId,
              countryName: String(
                (countryMeta && countryMeta.name) || countryId || "",
              ).trim(),
              pillarId,
              pillarLabel,
              directPublish: true,
            },
          },
          "*",
        );
      });
    });
  }

  function formatSubmissionDate(value) {
    const parsed = new Date(String(value || ""));
    if (!Number.isFinite(parsed.getTime())) return "Just now";
    return parsed.toLocaleString();
  }

  function getSubmissionTypeLabel(item) {
    const mode = String(item && item.type ? item.type : "")
      .trim()
      .toLowerCase();
    return mode === "representative" ? "Representative" : "Article";
  }

  function getSubmissionPillarLabel(item) {
    const explicit = String(
      item && item.pillarLabel ? item.pillarLabel : "",
    ).trim();
    if (explicit) return explicit;
    const pillarId = String(item && item.pillarId ? item.pillarId : "")
      .trim()
      .toLowerCase();
    if (!pillarId) return "General";
    if (pillarId === "organisations") return "Organisations";
    if (pillarId === "resources") return "Resources";
    if (pillarId === "events") return "Events";
    if (pillarId === "research") return "Research";
    if (pillarId === "government") return "Government";
    if (pillarId === "representatives") return "Representatives";
    return pillarId;
  }

  function getSubmissionCompactPillLabel(item) {
    const mode = String(item && item.type ? item.type : "")
      .trim()
      .toLowerCase();
    if (mode === "representative") return "Representative";
    const pillarId = String(item && item.pillarId ? item.pillarId : "")
      .trim()
      .toLowerCase();
    if (pillarId === "resources") return "Resource";
    if (pillarId === "events") return "Event";
    if (pillarId === "research") return "Research";
    if (pillarId === "organisations") return "Organisation";
    if (pillarId === "government") return "Government";
    return "Article";
  }

  function getSubmissionCompactPillClass(item) {
    const mode = String(item && item.type ? item.type : "")
      .trim()
      .toLowerCase();
    if (mode === "representative") return "";
    const pillarId = String(item && item.pillarId ? item.pillarId : "")
      .trim()
      .toLowerCase();
    if (pillarId === "resources") return "is-resources";
    if (pillarId === "events") return "is-events";
    if (pillarId === "research") return "is-research";
    if (pillarId === "organisations") return "is-organisations";
    if (pillarId === "government") return "is-government";
    return "";
  }

  function getFlagFromLanguageCode(languageCode) {
    const code = String(languageCode || "")
      .trim()
      .toLowerCase();
    if (!code) return "";
    const languageToCountry = {
      en: "GB",
      ro: "RO",
      de: "DE",
      fr: "FR",
      es: "ES",
      it: "IT",
      pt: "PT",
      nl: "NL",
      cs: "CZ",
      da: "DK",
      fi: "FI",
      sv: "SE",
      et: "EE",
      is: "IS",
      no: "NO",
      nb: "NO",
      nn: "NO",
      el: "GR",
      pl: "PL",
      hu: "HU",
      bg: "BG",
      hr: "HR",
      sk: "SK",
      sl: "SI",
      lt: "LT",
      lv: "LV",
    };
    const countryCode = languageToCountry[code] || code.toUpperCase();
    if (!/^[A-Z]{2}$/.test(countryCode)) return "";
    return String.fromCodePoint(
      ...countryCode.split("").map((char) => 127397 + char.charCodeAt(0)),
    );
  }

  function getFlagFromLanguageLabel(languageLabel) {
    const raw = String(languageLabel || "").trim().toLowerCase();
    if (!raw) return "";
    const normalized = raw
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\./g, "")
      .trim();
    if (normalized.includes("english") || normalized.includes("engleza")) {
      return getFlagFromLanguageCode("en");
    }
    if (normalized.includes("romana") || normalized.includes("romanian")) {
      return getFlagFromLanguageCode("ro");
    }
    if (normalized.includes("francais") || normalized.includes("french")) {
      return getFlagFromLanguageCode("fr");
    }
    if (normalized.includes("deutsch") || normalized.includes("german")) {
      return getFlagFromLanguageCode("de");
    }
    if (normalized.includes("espanol") || normalized.includes("spanish")) {
      return getFlagFromLanguageCode("es");
    }
    if (/^[a-z]{2}$/.test(normalized)) {
      return getFlagFromLanguageCode(normalized);
    }
    return "";
  }

  function normalizeResourceDeliveryUrl(url, accessType, fileName) {
    const value = String(url || "").trim();
    if (!value) return "";
    const isFile = String(accessType || "").trim().toLowerCase() === "file";
    const name = String(fileName || "").trim().toLowerCase();
    const looksLikeDoc =
      isFile &&
      (/\.(pdf|doc|docx|ppt|pptx)$/i.test(value) ||
        /\.(pdf|doc|docx|ppt|pptx)$/i.test(name));
    if (
      looksLikeDoc &&
      value.includes("res.cloudinary.com/") &&
      value.includes("/image/upload/")
    ) {
      return value.replace("/image/upload/", "/raw/upload/");
    }
    return value;
  }

  function inferResourceTypeLabelFromSubmission(item) {
    const resourceType = String((item && item.resourceType) || "")
      .trim()
      .toLowerCase();
    if (resourceType === "image") return "Image";
    if (resourceType === "youtube") return "Youtube";
    if (resourceType === "webpage") return "Webpage";
    if (resourceType === "document") return "Document";
    const explicit = String((item && item.resourceTypeLabel) || "").trim();
    if (explicit && !/^document$/i.test(explicit)) return explicit;
    const accessType = String((item && item.accessType) || "")
      .trim()
      .toLowerCase();
    if (accessType === "url") return "Webpage";
    const probe = `${String((item && item.fileName) || "")} ${String(
      (item && item.resourceUrl) || "",
    )}`.toLowerCase();
    if (/\.(png|jpe?g|gif|webp|svg)(\?|#|$)/i.test(probe)) return "Image";
    if (/\.(pdf|docx?|pptx?)(\?|#|$)/i.test(probe)) return "Document";
    if (/youtube\.com|youtu\.be/.test(probe)) return "Youtube";
    return explicit || (accessType === "file" ? "File" : "Webpage");
  }

  function inferResourcePricingFromSubmission(item) {
    const raw = String((item && item.resourcePricing) || "")
      .trim()
      .toLowerCase();
    if (raw === "paid")
      return { value: "paid", label: "Cu plată", icon: "coin" };
    if (raw === "freemium")
      return { value: "freemium", label: "Freemium", icon: "trophy" };
    if (raw === "subscription")
      return { value: "subscription", label: "Abonament", icon: "calendar" };
    return { value: "free", label: "Gratuit", icon: "gift" };
  }

  function renderResourcePricingIconSvg(iconName) {
    if (iconName === "coin") {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M15.2 8.7a4.2 4.2 0 1 0 0 6.6"></path><path d="M7.5 11h6"></path><path d="M7.5 13h6"></path></svg>';
    }
    if (iconName === "trophy") {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8"></path><path d="M12 17v4"></path><path d="M6 4h12v3a6 10 0 0 1-12 0V4z"></path><path d="M6 5H4a2 2 0 0 0 2 4"></path><path d="M18 5h2a2 2 0 0 1-2 4"></path></svg>';
    }
    if (iconName === "calendar") {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"></rect><path d="M8 2v4"></path><path d="M16 2v4"></path><path d="M3 10h18"></path></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="13" rx="2"></rect><path d="M12 8v13"></path><path d="M3 12h18"></path><path d="M12 8s-2.5-3-4.5-3S5 6.5 7 8h5z"></path><path d="M12 8s2.5-3 4.5-3S19 6.5 17 8h-5z"></path></svg>';
  }

  function getSubmissionResourceVersions(item) {
    const resourceLanguages = Array.isArray(item && item.resourceLanguages)
      ? item.resourceLanguages
          .filter((next) => next && typeof next === "object")
          .map((next) => ({
            languageCode: String(next.languageCode || "")
              .trim()
              .toLowerCase(),
            languageLabel: String(next.languageLabel || "").trim(),
            languageFlag: String(next.languageFlag || "").trim(),
            accessType:
              String(next.accessType || "").trim().toLowerCase() === "file"
                ? "file"
                : "url",
            resourceType: String(next.resourceType || "")
              .trim()
              .toLowerCase(),
            resourceTypeLabel: inferResourceTypeLabelFromSubmission(next),
            resourcePricing: String(next.resourcePricing || "free")
              .trim()
              .toLowerCase(),
            resourcePricingLabel: String(next.resourcePricingLabel || "").trim(),
            fileName: String(next.fileName || "").trim(),
            resourceUrl: normalizeResourceDeliveryUrl(
              String(next.resourceUrl || "").trim(),
              next.accessType,
              next.fileName,
            ),
          }))
          .filter((next) => next.resourceUrl)
      : [];
    if (resourceLanguages.length) return resourceLanguages;
    const links = Array.isArray(item && item.links)
      ? item.links.map((next) => String(next || "").trim()).filter(Boolean)
      : [];
    const attachments = Array.isArray(item && item.attachments)
      ? item.attachments
          .filter((next) => next && typeof next === "object")
          .map((next) => ({
            name: String(next.name || "").trim(),
            url: String(next.url || "").trim(),
          }))
          .filter((next) => next.url)
      : [];
    return links.map((url, index) => {
      const attachment = attachments.find((next) => next.url === url);
      const accessType = attachment ? "file" : "url";
      const typeLabel = inferResourceTypeLabelFromSubmission({
        accessType,
        resourceUrl: url,
        fileName: attachment ? attachment.name : "",
      });
      return {
        languageCode: "",
        languageLabel: "",
        languageFlag: "",
        accessType,
        resourceType: typeLabel.toLowerCase(),
        resourceTypeLabel: typeLabel,
        resourcePricing: "free",
        resourcePricingLabel: "Gratuit",
        fileName: attachment ? attachment.name : "",
        resourceUrl: normalizeResourceDeliveryUrl(
          url,
          accessType,
          attachment ? attachment.name : "",
        ),
      };
    });
  }

  function renderSubmissionResourceVersions(item) {
    const versions = getSubmissionResourceVersions(item);
    if (!versions.length) return "";
    return `<section class="country-modal-entry-block country-modal-resource-versions">
      <h6>Resource Versions</h6>
      <div class="country-modal-resource-version-list">
        ${versions
          .map((version) => {
            const displayFlag =
              String(version.languageFlag || "").trim() ||
              getFlagFromLanguageCode(version.languageCode) ||
              getFlagFromLanguageLabel(version.languageLabel);
            const typeLabel = inferResourceTypeLabelFromSubmission(version);
            const isOpenAction =
              String(version.accessType || "").trim().toLowerCase() === "url" ||
              String(version.resourceType || "").trim().toLowerCase() ===
                "webpage" ||
              String(version.resourceType || "").trim().toLowerCase() ===
                "youtube";
            const actionVerb = isOpenAction ? "Deschideți" : "Descărcați";
            const actionLabel = `${actionVerb} ${typeLabel}`.trim();
            const pricing = inferResourcePricingFromSubmission(version);
            const pricingLabel =
              String(version.resourceType || "").trim().toLowerCase() ===
              "webpage"
                ? String(version.resourcePricingLabel || "").trim() ||
                  pricing.label
                : "Gratuit";
            const pricingIconName =
              String(version.resourceType || "").trim().toLowerCase() ===
              "webpage"
                ? pricing.icon
                : "gift";
            return `<article class="country-modal-resource-version">
              <div class="country-modal-resource-version-main">
                <span class="country-modal-resource-version-flag">${escapeHtml(displayFlag || "🏳️")}</span>
                <a class="country-modal-entry-btn country-modal-entry-link-btn" href="${escapeHtml(
                  version.resourceUrl,
                )}" target="_blank" rel="noopener noreferrer">${escapeHtml(actionLabel)}</a>
                <span class="country-modal-resource-pricing-pill">
                  <span class="country-modal-resource-pricing-pill-icon" aria-hidden="true">${renderResourcePricingIconSvg(
                    pricingIconName,
                  )}</span>
                  <span>${escapeHtml(pricingLabel)}</span>
                </span>
              </div>
            </article>`;
          })
          .join("")}
      </div>
    </section>`;
  }

  function buildEntryFromArticleSubmission(item) {
    const safeItem = item && typeof item === "object" ? item : {};
    const nativeTitle = String(
      safeItem.nativeTitle || safeItem.title || safeItem.englishTitle || "",
    ).trim();
    const nativeDescription = String(
      safeItem.nativeDescription ||
        safeItem.description ||
        safeItem.englishDescription ||
        "",
    ).trim();
    const englishTitle = String(
      safeItem.englishTitle || safeItem.title || safeItem.nativeTitle || "",
    ).trim();
    const englishDescription = String(
      safeItem.englishDescription ||
        safeItem.description ||
        safeItem.nativeDescription ||
        "",
    ).trim();
    const title = nativeTitle || "Untitled entry";
    const description = nativeDescription;
    const ownership =
      safeItem.ownership && typeof safeItem.ownership === "object"
        ? safeItem.ownership
        : {};
    const normalizeResourceDeliveryUrl = (url, accessType, fileName) => {
      const value = String(url || "").trim();
      if (!value) return "";
      const isFile = String(accessType || "").trim().toLowerCase() === "file";
      const name = String(fileName || "").trim().toLowerCase();
      const looksLikeDoc =
        isFile &&
        (/\.(pdf|doc|docx|ppt|pptx)$/i.test(value) ||
          /\.(pdf|doc|docx|ppt|pptx)$/i.test(name));
      if (
        looksLikeDoc &&
        value.includes("res.cloudinary.com/") &&
        value.includes("/image/upload/")
      ) {
        return value.replace("/image/upload/", "/raw/upload/");
      }
      return value;
    };
    const inferTypeLabelFromAsset = (resourceType, accessType, url, fileName) => {
      const type = String(resourceType || "").trim().toLowerCase();
      if (type === "image") return "Image";
      if (type === "youtube") return "Youtube";
      if (type === "webpage") return "Webpage";
      if (type === "document") return "Document";
      const mode = String(accessType || "").trim().toLowerCase();
      if (mode === "url") return "Webpage";
      const target = `${String(fileName || "")} ${String(url || "")}`.toLowerCase();
      if (/\.(png|jpe?g|gif|webp|svg)(\?|#|$)/i.test(target)) return "Image";
      if (/\.(pdf|docx?|pptx?)(\?|#|$)/i.test(target)) return "Document";
      return "File";
    };

    const resourceLanguages = Array.isArray(safeItem.resourceLanguages)
      ? safeItem.resourceLanguages
          .filter((lang) => lang && typeof lang === "object")
          .map((lang) => ({
            languageLabel: String(lang.languageLabel || "").trim(),
            languageFlag: String(lang.languageFlag || "").trim(),
            languageCode: String(lang.languageCode || "")
              .trim()
              .toLowerCase(),
            resourceType: String(lang.resourceType || "")
              .trim()
              .toLowerCase(),
            resourceTypeLabel: String(lang.resourceTypeLabel || "").trim(),
            resourcePricing: String(lang.resourcePricing || "free")
              .trim()
              .toLowerCase(),
            resourcePricingLabel: String(lang.resourcePricingLabel || "").trim(),
            resourceUrl: normalizeResourceDeliveryUrl(
              String(lang.resourceUrl || "").trim(),
              lang.accessType,
              lang.fileName,
            ),
            accessType:
              String(lang.accessType || "").trim().toLowerCase() === "file"
                ? "file"
                : "url",
            fileName: String(lang.fileName || "").trim(),
          }))
          .filter((lang) => lang.resourceUrl)
      : [];
    const fallbackLinks = Array.isArray(safeItem.links)
      ? safeItem.links
          .map((url) => String(url || "").trim())
          .filter(Boolean)
      : [];
    const fallbackAttachments = Array.isArray(safeItem.attachments)
      ? safeItem.attachments
          .filter((it) => it && typeof it === "object")
          .map((it) => ({
            name: String(it.name || "").trim(),
            url: String(it.url || "").trim(),
          }))
          .filter((it) => it.url)
      : [];
    const availabilityLabels = String(safeItem.languageAvailability || "")
      .split(",")
      .map((value) => String(value || "").trim())
      .filter(Boolean);
    const normalizedResourceLanguages = resourceLanguages.length
      ? resourceLanguages.map((lang, index) => ({
          ...lang,
          languageLabel:
            lang.languageLabel ||
            availabilityLabels[index] ||
            (lang.languageCode ? lang.languageCode.toUpperCase() : "Language"),
          languageFlag:
            lang.languageFlag || getFlagFromLanguageCode(lang.languageCode),
          resourceTypeLabel: inferTypeLabelFromAsset(
            lang.resourceType,
            lang.accessType,
            lang.resourceUrl,
            lang.fileName,
          ),
          resourcePricing:
            String(lang.resourceType || "").trim().toLowerCase() === "webpage"
              ? String(lang.resourcePricing || "free").trim().toLowerCase() || "free"
              : "free",
          resourcePricingLabel:
            String(lang.resourceType || "").trim().toLowerCase() === "webpage"
              ? String(lang.resourcePricingLabel || "").trim() || "Gratuit"
              : "Gratuit",
        }))
      : fallbackLinks.map((url, index) => {
          const matchingAttachment = fallbackAttachments.find(
            (asset) => asset.url === url,
          );
          const mode = matchingAttachment ? "file" : "url";
          return {
            languageLabel:
              availabilityLabels[index] ||
              availabilityLabels[0] ||
              "Language",
            languageFlag: "",
            languageCode: "",
            resourceType:
              mode === "file"
                ? /\.(png|jpe?g|gif|webp|svg)(\?|#|$)/i.test(
                    String(
                      (matchingAttachment && matchingAttachment.name) || url || "",
                    ),
                  )
                  ? "image"
                  : "document"
                : "webpage",
            resourceTypeLabel: inferTypeLabelFromAsset(
              "",
              mode,
              url,
              matchingAttachment ? matchingAttachment.name : "",
            ),
            resourcePricing: "free",
            resourcePricingLabel: "Gratuit",
            resourceUrl: normalizeResourceDeliveryUrl(
              url,
              mode,
              matchingAttachment ? matchingAttachment.name : "",
            ),
            accessType: mode,
            fileName: matchingAttachment ? matchingAttachment.name : "",
          };
        });
    const links = fallbackLinks;
    const availabilityFlags = availabilityLabels
      .map((label) => getFlagFromLanguageLabel(label))
      .filter(Boolean);
    const languageFlags = normalizedResourceLanguages
      .map((lang) => lang.languageFlag || getFlagFromLanguageCode(lang.languageCode))
      .concat(availabilityFlags)
      .filter(Boolean);
    const methods = normalizedResourceLanguages.length
      ? normalizedResourceLanguages.map((lang) => {
          const label =
            lang.languageLabel ||
            (lang.languageCode ? lang.languageCode.toUpperCase() : "Language");
          if (lang.accessType === "file") {
            return `${label}: ${lang.fileName || "File resource"}`;
          }
          return `${label}: ${lang.resourceUrl}`;
        })
      : links;
    const contact =
      safeItem.representativeContact &&
      typeof safeItem.representativeContact === "object"
        ? safeItem.representativeContact
        : {};
    const impact = [
      String(contact.name || "").trim() ? `Contact: ${String(contact.name || "").trim()}` : "",
      String(contact.role || "").trim() ? `Role: ${String(contact.role || "").trim()}` : "",
      String(contact.email || "").trim() ? `Email: ${String(contact.email || "").trim()}` : "",
    ].filter(Boolean);

    return {
      title,
      summary: description,
      description,
      nativeTitle: nativeTitle || title,
      nativeDescription: nativeDescription || description,
      englishTitle,
      englishDescription,
      translationChecked: Boolean(safeItem.translationChecked),
      translationSourceTitle: String(safeItem.translationSourceTitle || "").trim(),
      translationSourceDescription: String(
        safeItem.translationSourceDescription || "",
      ).trim(),
      translationCheckedAt: String(safeItem.translationCheckedAt || "").trim(),
      languages: [...new Set(languageFlags)],
      resourceLanguages: normalizedResourceLanguages,
      ownership: {
        type: String(ownership.type || "").trim(),
        name: String(ownership.name || "").trim(),
      },
      representativeContact: {
        name: String(contact.name || "").trim(),
        role: String(contact.role || "").trim(),
        email: String(contact.email || "").trim(),
      },
      methods,
      programs: [],
      impact,
      badges: [],
    };
  }

  function openSubmissionEditor(countryId, submissionId) {
    const code = normalizeManageCountryCode(countryId);
    if (!code || !submissionId) return;
    const inbox = getCountryInbox(code);
    const item = inbox.find(
      (next) => String(next && next.id ? next.id : "") === String(submissionId),
    );
    if (!item) {
      showToast("Entry not found.", true);
      return;
    }
    const isRepresentative =
      String(item.type || "")
        .trim()
        .toLowerCase() === "representative";
    clearEditorFields();
    if (isRepresentative) {
      const draft =
        item.representativeDraft && typeof item.representativeDraft === "object"
          ? item.representativeDraft
          : {};
      if (editorRepName)
        editorRepName.value = String(draft.name || item.title || "").trim();
      if (editorRepTitle)
        editorRepTitle.value = String(draft.title || "").trim();
      if (editorRepOrganisation) {
        editorRepOrganisation.value = String(draft.organisation || "").trim();
      }
      const image = String(draft.image || draft.sourceImage || "").trim();
      const sourceImage = String(draft.sourceImage || draft.image || "").trim();
      const hasCrop =
        draft.crop &&
        typeof draft.crop === "object" &&
        [draft.crop.x, draft.crop.y, draft.crop.w, draft.crop.h].every(
          (value) => Number.isFinite(Number(value)),
        );
      representativeImagePath = image;
      representativeSourceImagePath = sourceImage;
      setCropPreviewImage(sourceImage, hasCrop ? draft.crop : null);
      setCropStatus("Move and resize frame. Save will keep this framing.");
      representativeInitial = {
        name: String(draft.name || item.title || "").trim(),
        title: String(draft.title || "").trim(),
        organisation: String(draft.organisation || "").trim(),
        image,
        sourceImage,
        crop: hasCrop ? draft.crop : null,
      };
      editorTarget = {
        type: "submission-representative",
        countryId: code,
        submissionId: String(item.id),
      };
      setEditorMode("representative");
      openEditorModal();
      return;
    }
    if (editorTitle) {
      editorTitle.value = String(item.nativeTitle || item.title || "").trim();
    }
    if (editorDescription) {
      editorDescription.value = String(
        item.nativeDescription || item.description || "",
      ).trim();
    }
    updateEditorTextCounters();
    loadEditorResourceLanguageItems(code, item);
    const ownership =
      item.ownership && typeof item.ownership === "object" ? item.ownership : {};
    const ownershipTypeValue = String(ownership.type || "").trim();
    if (editorOwnershipType) {
      const hasOption = Array.from(editorOwnershipType.options || []).some(
        (option) =>
          String(option && option.value ? option.value : "").trim() ===
          ownershipTypeValue,
      );
      if (ownershipTypeValue && !hasOption) {
        const customOption = document.createElement("option");
        customOption.value = ownershipTypeValue;
        customOption.textContent = ownershipTypeValue;
        editorOwnershipType.appendChild(customOption);
      }
      editorOwnershipType.value = ownershipTypeValue;
    }
    if (editorOwnershipName) {
      editorOwnershipName.value = String(ownership.name || "").trim();
    }
    const contact =
      item.representativeContact &&
      typeof item.representativeContact === "object"
        ? item.representativeContact
        : {};
    if (editorContactName)
      editorContactName.value = String(contact.name || "").trim();
    if (editorContactRole)
      editorContactRole.value = String(contact.role || "").trim();
    if (editorContactEmail)
      editorContactEmail.value = String(contact.email || "").trim();
    markSubmissionContactFieldsValid();
    setSubmissionEntryFieldsVisible(true);
    initializeSubmissionTranslationState(code, item);
    editorTarget = {
      type: "submission-article",
      countryId: code,
      submissionId: String(item.id),
      pillarId:
        String(item && item.pillarId ? item.pillarId : "")
          .trim()
          .toLowerCase() || "resources",
    };
    setEditorMode("entry");
    openEditorModal();
  }

  function buildSubmissionCardHtml(item, currentStatus) {
    const representativeDraft =
      item &&
      item.representativeDraft &&
      typeof item.representativeDraft === "object"
        ? item.representativeDraft
        : null;
    const title =
      String(item && item.title ? item.title : "").trim() ||
      String((representativeDraft && representativeDraft.name) || "").trim() ||
      String(item && item.description ? item.description : "").trim() ||
      "Untitled suggestion";
    const mode = String(item && item.type ? item.type : "")
      .trim()
      .toLowerCase();
    const isRepresentative = mode === "representative";
    const description = String(
      item && item.description ? item.description : "",
    ).trim();
    const submittedBy =
      item && item.submittedBy && typeof item.submittedBy === "object"
        ? item.submittedBy
        : { name: "", email: "" };
    const contact =
      item &&
      item.representativeContact &&
      typeof item.representativeContact === "object"
        ? item.representativeContact
        : { name: "", role: "", email: "" };
    const ownership =
      item && item.ownership && typeof item.ownership === "object"
        ? item.ownership
        : { type: "", name: "" };
    const ownershipType = String(ownership.type || "").trim();
    const ownershipName = String(ownership.name || "").trim();
    const representativeImage = String(
      (representativeDraft &&
        (representativeDraft.image || representativeDraft.sourceImage)) ||
        "",
    ).trim();
    const representativeName = String(
      (representativeDraft && representativeDraft.name) ||
        String(item && item.title ? item.title : "").trim() ||
        "Representative Name",
    ).trim();
    const representativeTitle = String(
      (representativeDraft && representativeDraft.title) || "",
    ).trim();
    const representativeOrganisation = String(
      (representativeDraft && representativeDraft.organisation) || "",
    ).trim();
    const translationRequired = requiresSubmissionTranslation(
      item && item.countryId,
      mode,
    );
    const translationReady =
      !translationRequired || Boolean(item && item.translationChecked);
    const actions = [];
    const canManage = currentStatus === "new";
    if (currentStatus === "new" && translationReady) {
      actions.push(
        '<button type="button" class="ecva-inbox-action is-delete" data-action-delete-inline="true">Delete</button>',
      );
      actions.push(
        '<button type="button" class="ecva-inbox-action is-pending" data-action-status="pending">Pending</button>',
      );
      actions.push(
        '<button type="button" class="ecva-inbox-action is-accept" data-action-status="archived" data-action-accept="true">Accept</button>',
      );
    } else if (currentStatus === "pending" && translationReady) {
      actions.push(
        '<button type="button" class="ecva-inbox-action is-delete" data-action-delete-inline="true">Delete</button>',
      );
      actions.push(
        '<button type="button" class="ecva-inbox-action is-accept" data-action-status="archived" data-action-accept="true">Accept</button>',
      );
    }
    const useTrashDelete = actions.length === 0;
    const contactLine = [contact.name, contact.role, contact.email]
      .map((next) => String(next || "").trim())
      .filter(Boolean)
      .join(" • ");
    const compactPillClass = getSubmissionCompactPillClass(item);
    return `
      <article class="ecva-inbox-card ecva-inbox-item" data-submission-id="${escapeHtml(item.id)}">
        <div class="ecva-inbox-summary">
          <span class="ecva-inbox-type${compactPillClass ? ` ${compactPillClass}` : ""}">${escapeHtml(getSubmissionCompactPillLabel(item))}</span>
          <span class="ecva-inbox-summary-title" title="${escapeHtml(title)}">${escapeHtml(title)}</span>
          ${
            canManage
              ? '<button type="button" class="ecva-inbox-manage-btn" data-inbox-manage>Manage entry</button>'
              : ""
          }
          <button type="button" class="ecva-inbox-toggle-btn" data-inbox-toggle aria-expanded="false" aria-label="Toggle entry details">
            <span class="ecva-inbox-chevron" aria-hidden="true">🔽</span>
          </button>
        </div>
        <div class="ecva-inbox-details" hidden>
          ${
            isRepresentative
              ? `<div class="ecva-inbox-rep-layout">
                   ${
                     representativeImage
                       ? `<figure class="ecva-inbox-rep-preview">
                            <img src="${escapeHtml(representativeImage)}" alt="${escapeHtml(title)} preview" />
                          </figure>`
                       : ""
                   }
                   <div class="ecva-inbox-rep-body">
                     <div class="ecva-inbox-rep-field">
                       <span>Name</span>
                       <h6>${escapeHtml(representativeName || title)}</h6>
                     </div>
                     ${
                       representativeTitle
                         ? `<div class="ecva-inbox-rep-field">
                              <span>Role / Title</span>
                              <p class="ecva-inbox-rep-role">${escapeHtml(representativeTitle)}</p>
                            </div>`
                         : ""
                     }
                     ${
                       representativeOrganisation
                         ? `<div class="ecva-inbox-rep-field">
                              <span>Organisation</span>
                              <p class="ecva-inbox-rep-org">${escapeHtml(representativeOrganisation)}</p>
                            </div>`
                         : ""
                     }
                  </div>
                 </div>`
              : ""
          }
          ${
            !isRepresentative && description
              ? `<p class="ecva-inbox-description">${escapeHtml(description)}</p>`
              : ""
          }
          ${
            !isRepresentative
              ? renderSubmissionResourceVersions(item)
              : ""
          }
          ${
            !isRepresentative && (ownershipType || ownershipName)
              ? `<p class="ecva-inbox-contact"><strong>Owner:</strong> ${
                  ownershipType
                    ? `<span class="ecva-inbox-pillar">${escapeHtml(ownershipType)}</span>`
                    : ""
                } ${escapeHtml(ownershipName || "-")}</p>`
              : ""
          }
          ${
            !isRepresentative && contactLine
              ? `<p class="ecva-inbox-contact"><strong>Contact:</strong> ${escapeHtml(
                  contactLine,
                )}</p>`
              : ""
          }
          <dl class="ecva-inbox-meta ecva-inbox-meta--footnote">
            <div><dt>Submitted by</dt><dd>${escapeHtml(submittedBy.name || "-")}</dd></div>
            <div><dt>Email</dt><dd>${escapeHtml(submittedBy.email || "-")}</dd></div>
            <div><dt>Received</dt><dd>${escapeHtml(formatSubmissionDate(item.createdAt))}</dd></div>
          </dl>
          <div class="ecva-inbox-footer${actions.length ? "" : " is-delete-only"}${useTrashDelete ? " has-trash-delete" : ""}">
            ${
              actions.length
                ? `<div class="ecva-inbox-actions ecva-inbox-actions--${actions.length}">${actions.join("")}</div>`
                : ""
            }
            ${
              canManage || useTrashDelete
                ? `<div class="ecva-inbox-footer-tools">
                    ${
                      canManage
                        ? '<button type="button" class="ecva-inbox-manage-btn ecva-inbox-manage-btn--footer" data-inbox-manage>Manage entry</button>'
                        : ""
                    }
                    ${
                      useTrashDelete
                        ? `<button type="button" class="ecva-inbox-delete-btn" data-action-delete aria-label="Delete entry permanently" title="Delete entry permanently">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M8 3.8A1.8 1.8 0 0 1 9.8 2h4.4A1.8 1.8 0 0 1 16 3.8V5h3.2a1 1 0 1 1 0 2H18v11.1A2.9 2.9 0 0 1 15.1 21H8.9A2.9 2.9 0 0 1 6 18.1V7H4.8a1 1 0 0 1 0-2H8V3.8Zm2 1.2h4V4h-4v1Zm-2 2v11.1c0 .5.4.9.9.9h6.2c.5 0 .9-.4.9-.9V7H8Zm2.2 2.1a1 1 0 0 1 1 1v6.6a1 1 0 1 1-2 0V10a1 1 0 0 1 1-1Zm3.6 0a1 1 0 0 1 1 1v6.6a1 1 0 1 1-2 0V10a1 1 0 0 1 1-1Z"></path>
                    </svg>
                    <span class="ecva-inbox-delete-confirm-text">Confirm</span>
                  </button>`
                        : ""
                    }
                  </div>`
                : ""
            }
          </div>
        </div>
      </article>
    `;
  }

  function buildInboxColumnHtml(title, status, items, emptyText) {
    const cards = items
      .map((item) => buildSubmissionCardHtml(item, status))
      .join("");
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
    panel
      .querySelectorAll(".ecva-inbox-toggle-btn[data-inbox-toggle]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const card = btn.closest(".ecva-inbox-card[data-submission-id]");
          const details = card
            ? card.querySelector(".ecva-inbox-details")
            : null;
          if (!card || !details) return;
          const expanded = btn.getAttribute("aria-expanded") === "true";
          const column = card.closest(".ecva-inbox-column");
          if (!expanded && column) {
            column
              .querySelectorAll(".ecva-inbox-card.is-expanded")
              .forEach((openCard) => {
                if (openCard === card) return;
                const openDetails = openCard.querySelector(
                  ".ecva-inbox-details",
                );
                const openToggle = openCard.querySelector(
                  ".ecva-inbox-toggle-btn[data-inbox-toggle]",
                );
                if (openDetails) openDetails.hidden = true;
                openCard.classList.remove("is-expanded");
                if (openToggle) openToggle.setAttribute("aria-expanded", "false");
              });
          }
          btn.setAttribute("aria-expanded", expanded ? "false" : "true");
          details.hidden = expanded;
          card.classList.toggle("is-expanded", !expanded);
        });
      });
    panel
      .querySelectorAll(".ecva-inbox-manage-btn[data-inbox-manage]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const card = btn.closest(".ecva-inbox-card[data-submission-id]");
          const submissionId = card
            ? card.getAttribute("data-submission-id")
            : "";
          if (!submissionId) return;
          openSubmissionEditor(countryId, submissionId);
        });
      });
    panel
      .querySelectorAll(".ecva-inbox-action[data-action-status]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const card = btn.closest(".ecva-inbox-card[data-submission-id]");
          const submissionId = card
            ? card.getAttribute("data-submission-id")
            : "";
          const status = btn.getAttribute("data-action-status");
          const isAccept = btn.getAttribute("data-action-accept") === "true";
          if (!submissionId || !status) return;
          const inbox = getCountryInbox(countryId);
          const item = inbox.find(
            (next) =>
              String(next && next.id ? next.id : "") === String(submissionId),
          );
          const mode = String(item && item.type ? item.type : "")
            .trim()
            .toLowerCase();
          if (
            requiresSubmissionTranslation(countryId, mode) &&
            !Boolean(item && item.translationChecked)
          ) {
            showToast("Check translation before updating this entry.", true);
            return;
          }
          if (isAccept) {
            const isRepresentative =
              item &&
              String(item.type || "")
                .trim()
                .toLowerCase() === "representative";
            const draft =
              isRepresentative &&
              item &&
              item.representativeDraft &&
              typeof item.representativeDraft === "object"
                ? item.representativeDraft
                : null;
            if (isRepresentative) {
              const representative = {
                name:
                  String((draft && draft.name) || item.title || "").trim() ||
                  "Representative Name",
                title: String((draft && draft.title) || "").trim(),
                organisation: String(
                  (draft && draft.organisation) || "",
                ).trim(),
                image: String(
                  (draft && (draft.image || draft.sourceImage)) || "",
                ).trim(),
                sourceImage: String(
                  (draft && (draft.sourceImage || draft.image)) || "",
                ).trim(),
                crop:
                  draft && draft.crop && typeof draft.crop === "object"
                    ? {
                        x: Number(draft.crop.x),
                        y: Number(draft.crop.y),
                        w: Number(draft.crop.w),
                        h: Number(draft.crop.h),
                      }
                    : null,
              };
              postToMap("ecva-editor-add-representative", {
                countryId,
                representative,
              });
            } else if (item) {
              const pillarId = String(item.pillarId || "")
                .trim()
                .toLowerCase() || "resources";
              postToMap("ecva-editor-add-entry", {
                countryId,
                pillarId,
                entry: buildEntryFromArticleSubmission(item),
              });
            }
          }
          updateSubmissionStatus(countryId, submissionId, status);
        });
      });
    panel
      .querySelectorAll(".ecva-inbox-action[data-action-delete-inline]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const card = btn.closest(".ecva-inbox-card[data-submission-id]");
          const submissionId = card
            ? card.getAttribute("data-submission-id")
            : "";
          if (!submissionId) return;
          if (!btn.classList.contains("is-confirm")) {
            btn.classList.add("is-confirm");
            btn.textContent = "Confirm";
            window.setTimeout(() => {
              if (!btn.isConnected) return;
              btn.classList.remove("is-confirm");
              btn.textContent = "Delete";
            }, 3800);
            return;
          }
          postToMap("ecva-editor-delete-submission", {
            countryId,
            submissionId: String(submissionId),
          });
        });
      });
    panel
      .querySelectorAll(".ecva-inbox-delete-btn[data-action-delete]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const card = btn.closest(".ecva-inbox-card[data-submission-id]");
          const submissionId = card
            ? card.getAttribute("data-submission-id")
            : "";
          if (!submissionId) return;
          if (!btn.classList.contains("is-confirm")) {
            btn.classList.add("is-confirm");
            btn.setAttribute(
              "aria-label",
              "Confirm delete entry permanently",
            );
            btn.setAttribute("title", "Confirm delete entry permanently");
            window.setTimeout(() => {
              btn.classList.remove("is-confirm");
              btn.setAttribute("aria-label", "Delete entry permanently");
              btn.setAttribute("title", "Delete entry permanently");
            }, 3800);
            return;
          }
          postToMap("ecva-editor-delete-submission", {
            countryId,
            submissionId: String(submissionId),
          });
        });
      });
  }

  function renderCountryFlowPanel(scope) {
    if (!scope || !selectedCountryId) return;
    const countryId = normalizeManageCountryCode(selectedCountryId);
    if (!countryId) return;
    const old = scope.querySelector(".ecva-country-flow-panel");
    if (old) old.remove();
    const inbox = getCountryInbox(countryId);
    const orderedInbox = [...inbox].sort((a, b) => {
      const aTime =
        Date.parse(String((a && (a.updatedAt || a.createdAt)) || "")) || 0;
      const bTime =
        Date.parse(String((b && (b.updatedAt || b.createdAt)) || "")) || 0;
      return bTime - aTime;
    });
    const next = orderedInbox.filter((item) => {
      const status = normalizeSubmissionStatus(item.status);
      return status === "new";
    });
    const pending = orderedInbox.filter(
      (item) => normalizeSubmissionStatus(item.status) === "pending",
    );
    const archived = orderedInbox.filter(
      (item) => normalizeSubmissionStatus(item.status) === "archived",
    );
    const panel = document.createElement("section");
    panel.className = "ecva-country-flow-panel";
    panel.innerHTML = `
      <header class="ecva-country-flow-head">
        <div>
          <p class="ecva-country-flow-kicker">Information flow</p>
          <h4>Country submissions inbox</h4>
        </div>
        <div class="ecva-country-flow-summary">
          <span class="is-new">Entries ${next.length}</span>
          <span class="is-pending">Pending ${pending.length}</span>
          <span class="is-archived">Accepted ${archived.length}</span>
        </div>
      </header>
      <div class="ecva-country-flow-grid">
        ${buildInboxColumnHtml("Entries", "new", next, "No entries yet.")}
        ${buildInboxColumnHtml("Pending", "pending", pending, "No pending submissions.")}
        ${buildInboxColumnHtml("Accepted", "archived", archived, "No accepted submissions yet.")}
      </div>
    `;
    const header = scope.querySelector(".country-modal-header");
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
    wirePillarIconLoading(manageBody);
    wireManageOutlookCarousels(manageBody);
    wireManageEntryExpanders(manageBody);
    wireManageSeeMore(manageBody);
    wireManageEntryReorder(manageBody);
    wireManagePillarPostButtons(manageBody);
    manageBody
      .querySelectorAll(".country-modal-rep-recommend-btn")
      .forEach((btn) => {
        btn.style.display = "none";
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("persist failed");
      const payload = await response.json().catch(() => null);
      const store = payload && payload.store ? String(payload.store) : "";
      if (store && store !== "postgres") {
        showToast("Saved on temporary storage only. Check Postgres.", true);
        return;
      }
    } catch (error) {
      showToast("Could not save permanently.", true);
    }
  }

  function schedulePersist(state, scopeCountryId) {
    if (!state || typeof state !== "object") return;
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
      const response = await fetch(EDITOR_API, { cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json();
      if (payload && payload.state && typeof payload.state === "object") {
        postToMap("ecva-editor-apply-state", { state: payload.state });
      }
    } catch (error) {
      // Run without persistence API if static server is used.
    }
  }

  window.addEventListener("message", (event) => {
    if (!event || !event.data || typeof event.data !== "object") return;
    const type = String(event.data.type || "");
    const payload = event.data.payload || {};

    if (type === "ecva-open-app-hub") {
      openHub();
      return;
    }

    if (type === "ecva-label-overrides") {
      const lang = normalizeLanguageCode(payload.lang);
      const labels = setLabelOverridesForLang(lang, payload.labels);
      if (labelManageLanguage === lang) {
        labelDraftByLang[lang] = { ...labels };
        if (
          labelManageModal &&
          labelManageModal.classList.contains("is-visible")
        ) {
          renderLabelManageCategoryFilters();
          renderLabelManageList();
        }
      }
      const requestId = String(payload.requestId || "").trim();
      if (requestId && pendingLabelOverrideRequests.has(requestId)) {
        const pending = pendingLabelOverrideRequests.get(requestId);
        pendingLabelOverrideRequests.delete(requestId);
        if (pending && pending.timeout) window.clearTimeout(pending.timeout);
        if (pending && typeof pending.resolve === "function") {
          pending.resolve({ ...labels });
        }
      }
      return;
    }

    if (type === "ecva-label-overrides-updated") {
      const lang = normalizeLanguageCode(payload.lang);
      const labels = setLabelOverridesForLang(lang, payload.labels);
      if (labelManageLanguage === lang) {
        labelDraftByLang[lang] = { ...labels };
        if (
          labelManageModal &&
          labelManageModal.classList.contains("is-visible")
        ) {
          renderLabelManageCategoryFilters();
          renderLabelManageList();
          updateLabelManageNotice(getLabelManageUiCopy().syncedNotice, false);
        }
      }
      return;
    }

    if (type === "ecva-active-countries") {
      activeCountries = Array.isArray(payload.countries)
        ? payload.countries
        : [];
      countryCatalog = Array.isArray(payload.allCountries)
        ? payload.allCountries
        : [];
      if (!countryCatalog.length) {
        countryCatalog = activeCountries.map((country) => ({
          ...country,
          statusValue: normalizeStatusValue(country && country.status),
        }));
      }
      rebuildCountryAccessMaps();
      if (accessScope.mode === "country") {
        selectedCountryId =
          normalizeManageCountryCode(accessScope.countryId) ||
          getFirstAllowedCountryId() ||
          "";
      }
      ensureSelectedCountryIsAllowed();
      renderCountryTabs();
      if (labelManageModal && labelManageModal.classList.contains("is-visible")) {
        syncLabelManageLanguageWithContext().catch(() => {});
      }
      resolveActiveCountriesWaiters();
      if (selectedCountryId) {
        selectCountry(selectedCountryId);
      } else if (manageBody) {
        manageBody.innerHTML = "";
        renderGeneralAccessPanel();
      }
      return;
    }

    if (type === "ecva-country-inbox") {
      const countryId = normalizeManageCountryCode(payload.countryId);
      const requestId = String(payload.requestId || "").trim();
      if (requestId && pendingInboxRequests.has(requestId)) {
        const pending = pendingInboxRequests.get(requestId);
        pendingInboxRequests.delete(requestId);
        if (pending && pending.timeout) window.clearTimeout(pending.timeout);
        setCountryInbox(countryId, payload.inbox);
        pending.resolve(getCountryInbox(countryId));
      } else {
        setCountryInbox(countryId, payload.inbox);
      }
      if (
        countryId &&
        normalizeManageCountryCode(selectedCountryId) === countryId &&
        manageBody
      ) {
        renderCountryFlowPanel(manageBody);
      }
      return;
    }

    if (type === "ecva-country-inbox-updated") {
      const countryId = normalizeManageCountryCode(payload.countryId);
      setCountryInbox(countryId, payload.inbox);
      if (
        countryId &&
        normalizeManageCountryCode(selectedCountryId) === countryId &&
        manageBody
      ) {
        renderCountryFlowPanel(manageBody);
      }
      return;
    }

    if (type === "ecva-country-modal-html") {
      const countryId = String(payload.countryId || "").trim();
      if (!countryId || countryId !== selectedCountryId || !manageBody) return;
      manageBody.innerHTML = payload.html || "";
      renderGeneralAccessPanel();
      enhanceManageContent();
      return;
    }

    if (
      type === "ecva-editor-entry-updated" ||
      type === "ecva-editor-representatives-updated"
    ) {
      const countryId = String(payload.countryId || "").trim();
      if (countryId && countryId === selectedCountryId && manageBody) {
        manageBody.innerHTML = payload.html || "";
        renderGeneralAccessPanel();
        enhanceManageContent();
      }
      if (
        type === "ecva-editor-representatives-updated" &&
        representativeManageModal &&
        representativeManageModal.classList.contains("is-visible") &&
        normalizeManageCountryCode(countryId) ===
          normalizeManageCountryCode(
            representativeManageCountryId || selectedCountryId,
          )
      ) {
        renderRepresentativeManageList(countryId);
      }
      showToast(
        type === "ecva-editor-entry-updated"
          ? "Text updated in the app."
          : "Representative updated in the app.",
      );
      return;
    }

    if (type === "ecva-editor-state-changed") {
      schedulePersist(payload.state, payload.countryId || "");
      return;
    }

    if (type === "ecva-entry-data") {
      const requestId = String(payload.requestId || "").trim();
      if (!requestId || !pendingEntryDataRequests.has(requestId)) return;
      const pending = pendingEntryDataRequests.get(requestId);
      pendingEntryDataRequests.delete(requestId);
      if (pending && pending.timeout) window.clearTimeout(pending.timeout);
      const detail = {
        countryId: pending.countryId,
        pillarId: pending.pillarId,
        entryIndex: pending.entryIndex,
        entry:
          payload && payload.entry && typeof payload.entry === "object"
            ? payload.entry
            : null,
        fallback: {
          title: pending.title,
          subtitle: pending.subtitle,
          description: pending.description,
        },
      };
      window.dispatchEvent(
        new CustomEvent("ecva-open-resource-entry-editor", { detail }),
      );
    }
  });

  if (manageBtn) {
    manageBtn.addEventListener("click", launchManageFromAccessCode);
  }

  if (accessCodeInput) {
    accessCodeInput.addEventListener("input", () => {
      clearAccessCodeError();
    });
    accessCodeInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      launchManageFromAccessCode();
    });
  }

  if (websiteBtn) {
    websiteBtn.addEventListener("click", () => {
      window.open(WEBSITE_URL, "_blank", "noopener,noreferrer");
    });
  }

  if (closeHubBtn) {
    closeHubBtn.addEventListener("click", closeHub);
  }

  if (mobileLegendLogo) {
    mobileLegendLogo.style.cursor = "pointer";
    mobileLegendLogo.addEventListener("click", openHub);
  }

  if (adminHub) {
    adminHub.addEventListener("click", (event) => {
      if (event.target === adminHub) {
        closeHub();
      }
    });
  }

  if (closeManageBtn) {
    closeManageBtn.addEventListener("click", closeManage);
  }

  if (manageRoot) {
    manageRoot.addEventListener("click", (event) => {
      if (event.target === manageRoot) {
        closeManage();
      }
    });
  }

  if (editorCancelBtn) {
    editorCancelBtn.addEventListener("click", closeEditorModal);
  }

  if (editorModal) {
    editorModal.addEventListener("click", (event) => {
      if (event.target === editorModal) {
        closeEditorModal();
      }
    });
  }

  if (editorTitle) {
    editorTitle.addEventListener("input", () => {
      updateSubmissionTranslationPreview();
      invalidateSubmissionTranslationOnNativeEdit();
      refreshEditorReviewProgress();
    });
  }

  if (editorDescription) {
    editorDescription.addEventListener("input", () => {
      updateSubmissionTranslationPreview();
      invalidateSubmissionTranslationOnNativeEdit();
      refreshEditorReviewProgress();
    });
  }

  if (editorNativeTitlePreview) {
    editorNativeTitlePreview.addEventListener("input", () => {
      syncNativeTranslationInputsToMainFields();
    });
  }

  if (editorNativeDescriptionPreview) {
    editorNativeDescriptionPreview.addEventListener("input", () => {
      syncNativeTranslationInputsToMainFields();
    });
  }

  if (editorEnglishTitlePreview) {
    editorEnglishTitlePreview.addEventListener("input", () => {
      syncEnglishTranslationInputsToState();
    });
  }

  if (editorEnglishDescriptionPreview) {
    editorEnglishDescriptionPreview.addEventListener("input", () => {
      syncEnglishTranslationInputsToState();
    });
  }

  if (editorSyncEnglishTitleBtn) {
    editorSyncEnglishTitleBtn.addEventListener("click", () => {
      const state = submissionTranslationState;
      if (!state) return;
      syncSubmissionTranslationField({
        sourceNode: editorNativeTitlePreview,
        targetNode: editorEnglishTitlePreview,
        sourceLang: state.sourceLanguageCode || "auto",
        targetLang: "en",
        afterSync: syncEnglishTranslationInputsToState,
      });
    });
  }

  if (editorSyncEnglishDescriptionBtn) {
    editorSyncEnglishDescriptionBtn.addEventListener("click", () => {
      const state = submissionTranslationState;
      if (!state) return;
      syncSubmissionTranslationField({
        sourceNode: editorNativeDescriptionPreview,
        targetNode: editorEnglishDescriptionPreview,
        sourceLang: state.sourceLanguageCode || "auto",
        targetLang: "en",
        afterSync: syncEnglishTranslationInputsToState,
      });
    });
  }

  if (editorSyncNativeTitleBtn) {
    editorSyncNativeTitleBtn.addEventListener("click", () => {
      const state = submissionTranslationState;
      if (!state) return;
      syncSubmissionTranslationField({
        sourceNode: editorEnglishTitlePreview,
        targetNode: editorNativeTitlePreview,
        sourceLang: "en",
        targetLang: state.sourceLanguageCode || "auto",
        afterSync: syncNativeTranslationInputsToMainFields,
      });
    });
  }

  if (editorSyncNativeDescriptionBtn) {
    editorSyncNativeDescriptionBtn.addEventListener("click", () => {
      const state = submissionTranslationState;
      if (!state) return;
      syncSubmissionTranslationField({
        sourceNode: editorEnglishDescriptionPreview,
        targetNode: editorNativeDescriptionPreview,
        sourceLang: "en",
        targetLang: state.sourceLanguageCode || "auto",
        afterSync: syncNativeTranslationInputsToMainFields,
      });
    });
  }

  if (editorBackBtn) {
    editorBackBtn.addEventListener("click", () => {
      if (!editorReviewWizardEnabled) return;
      setEditorReviewStep(editorReviewStepIndex - 1, { force: true });
    });
  }

  if (editorPendingBtn) {
    editorPendingBtn.addEventListener("click", () => {
      if (editorPendingBtn.disabled) return;
      editorSubmissionFinalStatus = "pending";
      if (editorForm && typeof editorForm.requestSubmit === "function") {
        editorForm.requestSubmit();
      }
    });
  }

  if (editorAcceptBtn) {
    editorAcceptBtn.addEventListener("click", () => {
      if (editorAcceptBtn.disabled) return;
      editorSubmissionFinalStatus = "archived";
      if (editorForm && typeof editorForm.requestSubmit === "function") {
        editorForm.requestSubmit();
      }
    });
  }

  [editorOwnershipName, editorContactName, editorContactRole, editorContactEmail].forEach((field) => {
    if (!field) return;
    field.addEventListener("input", () => {
      validateEditorContactFields(false);
      refreshEditorReviewProgress();
    });
  });

  if (editorOwnershipType) {
    editorOwnershipType.addEventListener("change", () => {
      validateEditorContactFields(false);
      refreshEditorReviewProgress();
    });
  }

  if (editorResourceAddLanguageBtn) {
    editorResourceAddLanguageBtn.addEventListener("click", () => {
      const countryId =
        (editorTarget && editorTarget.countryId) || selectedCountryId || "";
      addEditorResourceLanguageItem(countryId);
    });
  }

  if (editorForm) {
    editorForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!editorTarget) return;
      const target = { ...editorTarget };
      const requestedFinalStatus = String(editorSubmissionFinalStatus || "")
        .trim()
        .toLowerCase();
      editorSubmissionFinalStatus = "";
      if (editorMode === "entry" && target.type === "entry") {
        if (target.action === "add") {
          postToMap("ecva-editor-add-entry", {
            countryId: target.countryId,
            pillarId: target.pillarId,
            entry: {
              title: editorTitle ? editorTitle.value : "",
              description: editorDescription ? editorDescription.value : "",
              summary: editorDescription ? editorDescription.value : "",
              languages: [],
            },
          });
        } else {
          postToMap("ecva-editor-update-entry", {
            countryId: target.countryId,
            pillarId: target.pillarId,
            entryIndex: target.entryIndex,
            fields: {
              title: editorTitle ? editorTitle.value : "",
              description: editorDescription ? editorDescription.value : "",
              summary: editorDescription ? editorDescription.value : "",
            },
          });
        }
        closeEditorModal();
        return;
      }

      if (editorMode === "entry" && target.type === "submission-article") {
        const translationRequired = requiresSubmissionTranslation(
          target.countryId,
          "article",
        );
        const state = submissionTranslationState;
        if (editorReviewWizardEnabled) {
          const currentIndex = Math.max(
            0,
            Math.min(editorReviewStepIndex, editorReviewSteps.length - 1),
          );
          const currentError = getEditorReviewStepError(currentIndex, true);
          if (currentError) {
            showToast(currentError, true);
            focusFirstInvalidEditorField();
            return;
          }
          const lastStepIndex = Math.max(0, editorReviewSteps.length - 1);
          if (currentIndex < lastStepIndex) {
            setEditorReviewStep(currentIndex + 1, { force: true });
            return;
          }
          const firstInvalidStep = getFirstInvalidEditorReviewStepIndex(true);
          if (firstInvalidStep >= 0) {
            const message = getEditorReviewStepError(firstInvalidStep, true);
            const copy = getEditorUiCopy(editorUiCopyLang);
            setEditorReviewStep(firstInvalidStep, { force: true });
            showToast(
              message ||
                copy.completeAllStepsBeforeSaving ||
                EDITOR_UI_COPY_BASE.completeAllStepsBeforeSaving,
              true,
            );
            focusFirstInvalidEditorField();
            return;
          }
          if (!requestedFinalStatus) {
            const copy = getEditorUiCopy(editorUiCopyLang);
            showToast(
              copy.choosePendingOrAcceptBeforeSaving ||
                EDITOR_UI_COPY_BASE.choosePendingOrAcceptBeforeSaving,
              true,
            );
            return;
          }
        }
        const nativeTitle = editorTitle ? editorTitle.value : "";
        const nativeDescription = editorDescription
          ? editorDescription.value
          : "";
        const languageError = validateEditorLanguageAndLinkFields(true);
        if (languageError) {
          showToast(languageError, true);
          return;
        }
        const contactError = validateEditorContactFields(true);
        if (contactError) {
          showToast(contactError, true);
          return;
        }
        let resourcePayload = null;
        if (editorSaveBtn) {
          editorSaveBtn.disabled = true;
          editorSaveBtn.textContent = "Saving...";
        }
        if (editorPendingBtn) {
          editorPendingBtn.disabled = true;
        }
        if (editorAcceptBtn) {
          editorAcceptBtn.disabled = true;
        }
        try {
          resourcePayload = await buildEditorResourceSubmissionPayload();
        } catch (error) {
          const code = String((error && error.message) || "").trim();
          if (code === "attachment_file_too_large") {
            showToast("File too large. Maximum allowed size is 15MB per file.", true);
          } else {
            showToast("Could not upload resource file right now.", true);
          }
          updateSubmissionTranslationUi();
          return;
        }
        const updatedFields = {
          title: nativeTitle,
          description: nativeDescription,
          nativeTitle,
          nativeDescription,
          englishTitle: translationRequired
            ? String((state && state.englishTitle) || "").trim()
            : String(nativeTitle || "").trim(),
          englishDescription: translationRequired
            ? String((state && state.englishDescription) || "").trim()
            : String(nativeDescription || "").trim(),
          translationChecked: true,
          translationSourceTitle: translationRequired
            ? String(nativeTitle || "").trim()
            : String(nativeTitle || "").trim(),
          translationSourceDescription: translationRequired
            ? String(nativeDescription || "").trim()
            : String(nativeDescription || "").trim(),
          translationCheckedAt: translationRequired
            ? String((state && state.checkedAt) || new Date().toISOString())
            : new Date().toISOString(),
          languageAvailability: String(
            (resourcePayload && resourcePayload.languageAvailability) || "",
          ).trim(),
          links: Array.isArray(resourcePayload && resourcePayload.links)
            ? resourcePayload.links
            : [],
          attachments: Array.isArray(
            resourcePayload && resourcePayload.attachments,
          )
            ? resourcePayload.attachments
            : [],
          resourceLanguages: Array.isArray(
            resourcePayload && resourcePayload.resourceLanguages,
          )
            ? resourcePayload.resourceLanguages
            : [],
          ownership: {
            type: String(
              (editorOwnershipType && editorOwnershipType.value) || "",
            ).trim(),
            name: String(
              (editorOwnershipName && editorOwnershipName.value) || "",
            ).trim(),
          },
          representativeContact: {
            name: editorContactName ? editorContactName.value : "",
            role: editorContactRole ? editorContactRole.value : "",
            email: editorContactEmail ? editorContactEmail.value : "",
          },
        };
        postToMap("ecva-editor-update-submission", {
          countryId: target.countryId,
          submissionId: target.submissionId,
          fields: updatedFields,
        });
        if (editorReviewWizardEnabled) {
          const nextStatus =
            requestedFinalStatus === "archived" ? "archived" : "pending";
          const inbox = getCountryInbox(target.countryId);
          const existingSubmission = inbox.find(
            (item) => String(item && item.id ? item.id : "") === String(target.submissionId),
          );
          const normalizedCountryId = normalizeManageCountryCode(target.countryId);
          const pillarId =
            String(target.pillarId || (existingSubmission && existingSubmission.pillarId) || "")
              .trim()
              .toLowerCase() || "resources";
          if (nextStatus === "archived") {
            const normalizedItem = {
              ...(existingSubmission && typeof existingSubmission === "object"
                ? existingSubmission
                : {}),
              countryId: normalizedCountryId,
              id: String(target.submissionId),
              pillarId,
              status: "archived",
              ...updatedFields,
            };
            postToMap("ecva-editor-add-entry", {
              countryId: normalizedCountryId,
              pillarId,
              entry: buildEntryFromArticleSubmission(normalizedItem),
            });
          }
          updateSubmissionStatus(normalizedCountryId, target.submissionId, nextStatus);
        }
        closeEditorModal();
        return;
      }

      if (editorMode === "representative" && target.type === "representative") {
        let image = representativeImagePath;
        let sourceImage =
          representativeSourceImagePath || representativeCropSource || "";
        const cropNow = normalizeCropFrame();
        const cropChanged = !cropEquals(
          cropNow,
          representativeInitial && representativeInitial.crop,
        );
        const hasNewLocalImage =
          representativeCropSource.startsWith("data:image/");
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
            const reason = error && error.message ? ` (${error.message})` : "";
            showToast(`Image upload failed${reason}`, true);
            return;
          }
        } else if (
          shouldRegenerateImage &&
          sourceImage &&
          representativeCropSource
        ) {
          try {
            image = await uploadRepresentativeImageData(
              await makeCroppedDataUrl(),
              representativeCropFileName,
            );
          } catch (error) {
            const reason = error && error.message ? String(error.message) : "";
            if (reason.includes("canvas_tainted")) {
              showToast(
                "Image crop blocked by browser security. Re-upload image and save again.",
                true,
              );
            } else {
              showToast(
                `Image crop failed${reason ? ` (${reason})` : ""}.`,
                true,
              );
            }
            return;
          }
        }

        const representative = {
          name: editorRepName ? editorRepName.value : "",
          title: editorRepTitle ? editorRepTitle.value : "",
          organisation: editorRepOrganisation
            ? editorRepOrganisation.value
            : "",
          image,
          sourceImage,
          crop: cropNow,
        };

        if (target.action === "add") {
          postToMap("ecva-editor-add-representative", {
            countryId: target.countryId,
            representative,
          });
        } else {
          postToMap("ecva-editor-update-representative", {
            countryId: target.countryId,
            representativeIndex: target.representativeIndex,
            representative,
          });
        }
      }
      if (
        editorMode === "representative" &&
        target.type === "submission-representative"
      ) {
        let image = representativeImagePath;
        let sourceImage =
          representativeSourceImagePath || representativeCropSource || "";
        const cropNow = normalizeCropFrame();
        const cropChanged = !cropEquals(
          cropNow,
          representativeInitial && representativeInitial.crop,
        );
        const hasNewLocalImage =
          representativeCropSource.startsWith("data:image/");
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
            const reason = error && error.message ? ` (${error.message})` : "";
            showToast(`Image upload failed${reason}`, true);
            return;
          }
        } else if (
          shouldRegenerateImage &&
          sourceImage &&
          representativeCropSource
        ) {
          try {
            image = await uploadRepresentativeImageData(
              await makeCroppedDataUrl(),
              representativeCropFileName,
            );
          } catch (error) {
            const reason = error && error.message ? String(error.message) : "";
            if (reason.includes("canvas_tainted")) {
              showToast(
                "Image crop blocked by browser security. Re-upload image and save again.",
                true,
              );
            } else {
              showToast(
                `Image crop failed${reason ? ` (${reason})` : ""}.`,
                true,
              );
            }
            return;
          }
        }
        const name = editorRepName ? editorRepName.value : "";
        const title = editorRepTitle ? editorRepTitle.value : "";
        const organisation = editorRepOrganisation
          ? editorRepOrganisation.value
          : "";
        postToMap("ecva-editor-update-submission", {
          countryId: target.countryId,
          submissionId: target.submissionId,
          fields: {
            title: name,
            description: [title, organisation].filter(Boolean).join(" • "),
            representativeDraft: {
              name,
              title,
              organisation,
              image,
              sourceImage,
              crop: cropNow,
            },
          },
        });
        closeEditorModal();
        return;
      }
      closeEditorModal();
    });
  }

  if (editorRemoveBtn) {
    editorRemoveBtn.addEventListener("click", () => {
      if (!editorTarget) return;
      const isPublishedRepresentative =
        editorMode === "representative" &&
        editorTarget.type === "representative" &&
        Number.isInteger(editorTarget.representativeIndex);
      const isSubmissionRepresentative =
        editorMode === "representative" &&
        editorTarget.type === "submission-representative" &&
        String(editorTarget.submissionId || "").trim() &&
        String(editorTarget.countryId || "").trim();
      const isPublishedEntry =
        editorMode === "entry" &&
        editorTarget.type === "entry" &&
        String(editorTarget.countryId || "").trim() &&
        String(editorTarget.pillarId || "").trim() &&
        Number.isInteger(editorTarget.entryIndex);
      const isSubmissionArticle =
        editorMode === "entry" &&
        editorTarget.type === "submission-article" &&
        String(editorTarget.submissionId || "").trim() &&
        String(editorTarget.countryId || "").trim();
      if (
        !isPublishedRepresentative &&
        !isSubmissionRepresentative &&
        !isPublishedEntry &&
        !isSubmissionArticle
      )
        return;
      if (!editorRemoveBtn.classList.contains("is-confirm")) {
        editorRemoveBtn.classList.add("is-confirm");
        editorRemoveBtn.setAttribute(
          "aria-label",
          isSubmissionRepresentative || isSubmissionArticle || isPublishedEntry
            ? "Confirm delete entry permanently"
            : "Confirm remove representative",
        );
        editorRemoveBtn.setAttribute(
          "title",
          isSubmissionRepresentative || isSubmissionArticle || isPublishedEntry
            ? "Confirm delete entry permanently"
            : "Confirm remove representative",
        );
        if (removeConfirmTimer) {
          window.clearTimeout(removeConfirmTimer);
        }
        removeConfirmTimer = window.setTimeout(() => {
          resetEditorRemoveState();
        }, 4000);
        return;
      }
      if (isSubmissionRepresentative || isSubmissionArticle) {
        postToMap("ecva-editor-delete-submission", {
          countryId: editorTarget.countryId,
          submissionId: String(editorTarget.submissionId),
        });
      } else if (isPublishedEntry) {
        postToMap("ecva-editor-remove-entry", {
          countryId: editorTarget.countryId,
          pillarId: editorTarget.pillarId,
          entryIndex: editorTarget.entryIndex,
        });
      } else {
        postToMap("ecva-editor-remove-representative", {
          countryId: editorTarget.countryId,
          representativeIndex: editorTarget.representativeIndex,
        });
      }
      resetEditorRemoveState();
      closeEditorModal();
    });
  }

  if (editorRepImageFile) {
    editorRepImageFile.addEventListener("change", () => {
      const file = editorRepImageFile.files && editorRepImageFile.files[0];
      if (!file) return;
      representativeCropFileName = file.name || "representative-image.png";
      const reader = new FileReader();
      reader.onerror = () => {
        showToast("Could not read image file.", true);
      };
      reader.onload = () => {
        representativeSourceImagePath = "";
        setCropPreviewImage(String(reader.result || ""), null);
      };
      reader.readAsDataURL(file);
    });
  }

  if (editorCropFrame) {
    editorCropFrame.addEventListener("pointerdown", (event) => {
      if (!(event.target instanceof Element)) return;
      const isHandle = event.target === editorCropHandle;
      if (!representativeCrop) return;
      cropPointerState = {
        mode: isHandle ? "resize" : "move",
        startX: event.clientX,
        startY: event.clientY,
        startFrame: { ...representativeCrop },
      };
      editorCropFrame.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    editorCropFrame.addEventListener("pointermove", (event) => {
      if (!cropPointerState || !representativeCrop) return;
      const dx = event.clientX - cropPointerState.startX;
      const dy = event.clientY - cropPointerState.startY;
      if (cropPointerState.mode === "move") {
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
          cy: start.cy + (nextW / ratio - start.h) / 2,
          w: nextW,
        });
      }
      applyCropFrameUI();
      event.preventDefault();
    });
    const endPointer = (event) => {
      if (
        cropPointerState &&
        editorCropFrame.hasPointerCapture(event.pointerId)
      ) {
        editorCropFrame.releasePointerCapture(event.pointerId);
      }
      cropPointerState = null;
    };
    editorCropFrame.addEventListener("pointerup", endPointer);
    editorCropFrame.addEventListener("pointercancel", endPointer);
  }

  window.addEventListener("resize", () => {
    if (!representativeCropSource) return;
    const cropNorm = normalizeCropFrame();
    setCropPreviewImage(representativeCropSource, cropNorm);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (document.getElementById("ecva-reset-code-confirm")) {
      closeResetCodeConfirm();
      return;
    }
    if (
      labelManageModal &&
      labelManageModal.classList.contains("is-visible")
    ) {
      closeLabelManageModal();
      return;
    }
    if (editorModal && editorModal.classList.contains("is-visible")) {
      closeEditorModal();
      return;
    }
    if (manageRoot && manageRoot.classList.contains("is-visible")) {
      closeManage();
      return;
    }
    if (adminHub && adminHub.classList.contains("is-visible")) {
      closeHub();
    }
  });

  mapFrame.addEventListener("load", () => {
    loadPersistedEditorState();
  });

  if (mapFrame.contentWindow) {
    loadPersistedEditorState();
  }
})();
