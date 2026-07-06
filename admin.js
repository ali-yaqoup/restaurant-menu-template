import { auth, db, storage, initError, isFirebaseReady } from './firebase-config.js';
import { getAuthErrorMessage, getFirestoreErrorMessage } from './firebase-errors.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import {
  getDownloadURL,
  ref,
  uploadBytes
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

const UI_PREFS_KEY = 'taste-admin-ui-prefs';
const DEFAULT_RESTAURANT_ID = 'taste';
const DEFAULT_RESTAURANT = {
  name: { en: 'Taste Restaurant', ar: 'مطعم تيست' },
  slogan: { en: 'Fresh & Delicious Every Day', ar: 'طازج ولذيذ كل يوم' },
  whatsappNumber: '+970599123456',
  email: 'info@tasterestaurant.com',
  workingHours: { en: 'Saturday - Friday (12:00 PM - 12:00 AM)', ar: 'السبت - الجمعة (12:00 ظهراً - 12:00 ليلاً)' },
  currency: { en: 'JD', ar: 'دينار' },
  address: { en: 'Ramallah, Palestine', ar: 'رام الله، فلسطين' },
  logoUrl: 'assets/logo.svg',
  colors: { bg: '#0A0A0A', surface: '#121212', gold: '#D4AF37' },
  subscription: { status: 'trial' },
  analytics: { views: 0, whatsappOrders: 0 },
  customDomain: '',
  accessControl: { role: 'super_admin' },
  darkMode: true
};

const DEFAULT_CATEGORIES = [
  { id: 'burgers', name: { en: 'Burgers', ar: 'البرغر' }, orderIndex: 0 },
  { id: 'pizza', name: { en: 'Pizza', ar: 'البيتزا' }, orderIndex: 1 },
  { id: 'drinks', name: { en: 'Drinks', ar: 'المشروبات' }, orderIndex: 2 },
  { id: 'desserts', name: { en: 'Desserts', ar: 'الحلويات' }, orderIndex: 3 }
];

const DEFAULT_ITEMS = [
  {
    id: 'truffle-burger',
    categoryId: 'burgers',
    price: 8,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    name: { en: 'Truffle Burger', ar: 'برغر الترفل' },
    description: { en: 'Premium beef with truffle aioli.', ar: 'لحم فاخر وصلصة ترافل.' },
    tags: { en: ['Premium', 'Chef Special'], ar: ['فاخر', 'مميز'] },
    isAvailable: true,
    orderIndex: 0,
    views: 12,
    orderClicks: 5
  },
  {
    id: 'cheese-burger',
    categoryId: 'burgers',
    price: 7,
    image: 'https://images.unsplash.com/photo-1550547660-9454987c1f0f?auto=format&fit=crop&w=600&q=80',
    name: { en: 'Cheese Burger', ar: 'برغر الجبن' },
    description: { en: 'Classic smash burger with cheddar.', ar: 'برغر كلاسيكي بالجبنة.' },
    tags: { en: ['Classic'], ar: ['كلاسيكي'] },
    isAvailable: true,
    orderIndex: 1,
    views: 8,
    orderClicks: 3
  },
  {
    id: 'margherita-pizza',
    categoryId: 'pizza',
    price: 9,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
    name: { en: 'Margherita Pizza', ar: 'بيتزا مارغريتا' },
    description: { en: 'Tomato, mozzarella, basil.', ar: 'طماطم وموزاريلا وريحان.' },
    tags: { en: ['Vegetarian'], ar: ['نباتي'] },
    isAvailable: true,
    orderIndex: 2,
    views: 15,
    orderClicks: 6
  }
];

const state = {
  restaurantId: DEFAULT_RESTAURANT_ID,
  restaurantConfig: structuredClone(DEFAULT_RESTAURANT),
  categories: structuredClone(DEFAULT_CATEGORIES),
  menuItems: structuredClone(DEFAULT_ITEMS),
  currentRole: null,
  currentUser: null,
  darkMode: true,
  pendingImage: null,
  pendingImageTarget: 'logo',
  cropper: null,
  confirmCallback: null,
  dragId: null,
  currentItemId: null,
  currentCategoryId: null,
  firestoreUnsubscribers: []
};

const elements = {
  loader: document.getElementById('admin-loader'),
  loginContainer: document.getElementById('login-container'),
  dashboardContainer: document.getElementById('dashboard-container'),
  loginForm: document.getElementById('login-form'),
  loginError: document.getElementById('login-error'),
  logoutBtn: document.getElementById('logout-btn'),
  userEmailDisplay: document.getElementById('user-email-display'),
  adminUserRole: document.getElementById('admin-user-role'),
  sidebarBrandName: document.getElementById('sidebar-brand-name'),
  sidebarLogo: document.getElementById('sidebar-logo'),
  navItems: Array.from(document.querySelectorAll('.nav-item')),
  tabs: Array.from(document.querySelectorAll('.tab-content')),
  sidebar: document.getElementById('admin-sidebar'),
  sidebarToggle: document.getElementById('sidebar-toggle'),
  sidebarClose: document.getElementById('sidebar-close'),
  settingsForm: document.getElementById('settings-form'),
  itemForm: document.getElementById('item-form'),
  categoryForm: document.getElementById('category-form'),
  itemsTableBody: document.getElementById('items-table-body'),
  categoriesTableBody: document.getElementById('categories-table-body'),
  popularItemsList: document.getElementById('popular-items-list'),
  statViews: document.getElementById('stat-total-views'),
  statOrders: document.getElementById('stat-total-orders'),
  statActiveItems: document.getElementById('stat-active-items'),
  statSubscription: document.getElementById('stat-subscription-status'),
  adminQrImg: document.getElementById('admin-qr-img'),
  viewLiveMenuBtn: document.getElementById('view-live-menu-btn'),
  settingsLogoPreview: document.getElementById('settings-logo-preview'),
  settingsLogoInput: document.getElementById('settings-logo-input'),
  itemImgPreview: document.getElementById('item-img-preview'),
  itemImageInput: document.getElementById('item-image-input'),
  itemModalTitle: document.getElementById('item-modal-title'),
  categoryModalTitle: document.getElementById('category-modal-title'),
  itemEditId: document.getElementById('item-edit-id'),
  categoryEditId: document.getElementById('category-edit-id'),
  categoryOrderIndex: document.getElementById('category-order-index'),
  itemCategorySelect: document.getElementById('item-category'),
  itemsCategoryFilter: document.getElementById('items-category-filter'),
  itemAvailable: document.getElementById('item-available'),
  cropperModal: document.getElementById('modal-cropper'),
  cropperTarget: document.getElementById('cropper-target-img'),
  cropSaveBtn: document.getElementById('btn-crop-save'),
  confirmModal: document.getElementById('modal-confirm'),
  confirmTitle: document.getElementById('confirm-title'),
  confirmMessage: document.getElementById('confirm-message'),
  confirmActionBtn: document.getElementById('confirm-action-btn'),
  confirmCancelBtn: document.getElementById('confirm-cancel-btn'),
  btnExportJson: document.getElementById('btn-export-json'),
  importJsonInput: document.getElementById('import-json-input'),
  btnBackup: document.getElementById('btn-db-backup'),
  settingsNameEn: document.getElementById('settings-name-en'),
  settingsNameAr: document.getElementById('settings-name-ar'),
  settingsSloganEn: document.getElementById('settings-slogan-en'),
  settingsSloganAr: document.getElementById('settings-slogan-ar'),
  settingsWhatsapp: document.getElementById('settings-whatsapp'),
  itemNameEn: document.getElementById('item-name-en'),
  itemNameAr: document.getElementById('item-name-ar'),
  itemDescEn: document.getElementById('item-desc-en'),
  itemDescAr: document.getElementById('item-desc-ar'),
  itemPrice: document.getElementById('item-price'),
  itemTagsEn: document.getElementById('item-tags-en'),
  itemTagsAr: document.getElementById('item-tags-ar'),
  categoryIdVal: document.getElementById('category-id-val'),
  categoryNameEn: document.getElementById('category-name-en'),
  categoryNameAr: document.getElementById('category-name-ar'),
  settingsEmail: document.getElementById('settings-email'),
  settingsHoursEn: document.getElementById('settings-hours-en'),
  settingsHoursAr: document.getElementById('settings-hours-ar'),
  settingsCurrencyEn: document.getElementById('settings-currency-en'),
  settingsCurrencyAr: document.getElementById('settings-currency-ar'),
  settingsAddressEn: document.getElementById('settings-address-en'),
  settingsAddressAr: document.getElementById('settings-address-ar'),
  settingsColorBg: document.getElementById('settings-color-bg'),
  settingsColorSurface: document.getElementById('settings-color-surface'),
  settingsColorGold: document.getElementById('settings-color-gold'),
  settingsSubscriptionStatus: document.getElementById('settings-subscription-status'),
  settingsPortalRole: document.getElementById('settings-portal-role'),
  settingsCustomDomain: document.getElementById('settings-custom-domain'),
  settingsDarkMode: document.getElementById('settings-dark-mode')
};

function init() {
  bindEvents();
  loadUiPreferences();
  applyTheme();

  if (!isFirebaseReady) {
    showLogin();
    showLoginError(
      initError
        ? `Firebase failed to initialize: ${initError.message}`
        : 'Firebase is not configured. Check firebase-config.js.'
    );
    return;
  }

  onAuthStateChanged(auth, handleAuthStateChange);
}

async function handleAuthStateChange(user) {
  if (!user) {
    state.currentUser = null;
    state.currentRole = null;
    teardownFirestoreListeners();
    showLogin();
    return;
  }

  elements.loader.classList.remove('hidden');
  try {
    await loadUserProfile(user);
    state.currentUser = user;
    showDashboard(user);
    syncFromFirestore();
  } catch (error) {
    console.error('Auth profile load failed:', error);
    showLogin();
    showLoginError(error.message || getFirestoreErrorMessage(error));
    try {
      await signOut(auth);
    } catch (signOutError) {
      console.error('Sign out after profile failure:', signOutError);
    }
  }
}

async function loadUserProfile(user) {
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    throw new Error(
      'Admin profile not found. Create a users/' + user.uid + ' document in Firestore with role and restaurantId.'
    );
  }

  const profile = snapshot.data();
  const role = profile.role;
  const restaurantId = profile.restaurantId;

  if (!role) {
    throw new Error('Your user profile is missing a role field.');
  }

  if (!restaurantId) {
    throw new Error('Your user profile is missing a restaurantId field.');
  }

  state.currentRole = role;
  state.restaurantId = restaurantId;
  return profile;
}

function teardownFirestoreListeners() {
  state.firestoreUnsubscribers.forEach((unsubscribe) => {
    try {
      unsubscribe();
    } catch (error) {
      console.warn('Listener teardown error:', error);
    }
  });
  state.firestoreUnsubscribers = [];
}

function bindEvents() {
  elements.loginForm.addEventListener('submit', handleLogin);
  elements.logoutBtn.addEventListener('click', handleLogout);
  elements.settingsForm.addEventListener('submit', handleSettingsSave);
  elements.itemForm.addEventListener('submit', handleItemSave);
  elements.categoryForm.addEventListener('submit', handleCategorySave);
  elements.settingsLogoInput.addEventListener('change', (event) => handleImageSelection(event, 'logo'));
  elements.itemImageInput.addEventListener('change', (event) => handleImageSelection(event, 'item'));
  elements.cropSaveBtn.addEventListener('click', applyCropAndOptimize);
  elements.btnExportJson.addEventListener('click', exportMenuJson);
  elements.importJsonInput.addEventListener('change', importMenuJson);
  elements.btnBackup.addEventListener('click', createLiveBackup);
  elements.confirmCancelBtn.addEventListener('click', closeConfirmModal);
  elements.confirmActionBtn.addEventListener('click', runConfirmAction);
  elements.sidebarToggle.addEventListener('click', toggleSidebar);
  elements.sidebarClose.addEventListener('click', toggleSidebar);
  elements.navItems.forEach((button) => button.addEventListener('click', () => switchTab(button.dataset.tab)));
  elements.itemsCategoryFilter.addEventListener('change', renderTables);
  elements.settingsDarkMode?.addEventListener('change', (event) => {
    state.darkMode = event.target.checked;
    applyTheme();
    persistUiPreferences();
  });

  document.querySelectorAll('[data-action="delete-category"]').forEach((button) => button.addEventListener('click', () => {}));
  window.openAddCategoryModal = openAddCategoryModal;
  window.closeCategoryModal = closeCategoryModal;
  window.openAddItemModal = openAddItemModal;
  window.closeItemModal = closeItemModal;
  window.closeCropperModal = closeCropperModal;
  window.deleteCategory = deleteCategory;
  window.deleteItem = deleteItem;
  window.toggleItemAvailability = toggleItemAvailability;
  window.duplicateItem = duplicateItem;
  window.editItem = editItem;
  window.editCategory = editCategory;

  const toolbar = document.createElement('button');
  toolbar.id = 'theme-toggle-btn';
  toolbar.className = 'theme-toggle-btn';
  toolbar.innerHTML = '<i class="fa-solid fa-moon"></i><span>Toggle theme</span>';
  toolbar.addEventListener('click', () => {
    state.darkMode = !state.darkMode;
    applyTheme();
    persistUiPreferences();
  });
  const footer = document.querySelector('.sidebar-footer');
  footer?.prepend(toolbar);

  elements.viewLiveMenuBtn.addEventListener('click', () => {
    const baseUrl = state.restaurantConfig.customDomain?.trim() || window.location.origin;
    window.open(`${baseUrl}${baseUrl.includes('?') ? '&' : '?'}r=${state.restaurantId}`);
  });
}

function loadUiPreferences() {
  try {
    const saved = localStorage.getItem(UI_PREFS_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved);
    state.darkMode = parsed.darkMode ?? true;
  } catch (error) {
    console.warn('Could not restore UI preferences', error);
  }
}

function persistUiPreferences() {
  localStorage.setItem(UI_PREFS_KEY, JSON.stringify({ darkMode: state.darkMode }));
}

function showLoginError(message) {
  elements.loginError.textContent = message;
  elements.loginError.classList.remove('hidden');
}

function hideLoginError() {
  elements.loginError.textContent = '';
  elements.loginError.classList.add('hidden');
}

function setLoginLoading(isLoading) {
  const submitBtn = elements.loginForm.querySelector('button[type="submit"]');
  if (!submitBtn) return;
  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle('is-loading', isLoading);
}

function showLogin() {
  elements.loginContainer.classList.remove('hidden');
  elements.dashboardContainer.classList.add('hidden');
  elements.loader.classList.add('hidden');
}

function showDashboard(user) {
  elements.loginContainer.classList.add('hidden');
  elements.dashboardContainer.classList.remove('hidden');
  elements.loader.classList.add('hidden');
  hideLoginError();

  elements.userEmailDisplay.textContent = user.email || '';
  const roleLabel =
    state.currentRole === 'super_admin'
      ? 'Super Admin'
      : state.currentRole === 'restaurant_admin' || state.currentRole === 'admin'
        ? 'Restaurant Admin'
        : 'Staff Editor';
  elements.adminUserRole.textContent = roleLabel;

  populateSettingsForm();
  renderCategoryOptions();
  renderTables();
  renderOverview();
  renderQrCode();
  renderAdminBrand();
  updatePermissionAwareUi();
}

function renderAdminBrand() {
  elements.sidebarBrandName.textContent = state.restaurantConfig.name?.en || 'Taste Console';
  elements.sidebarLogo.src = state.restaurantConfig.logoUrl || 'assets/logo.svg';
}

function updatePermissionAwareUi() {
  const canManage =
    state.currentRole === 'super_admin' ||
    state.currentRole === 'restaurant_admin' ||
    state.currentRole === 'admin';
  const canDelete = canManage;
  document.querySelectorAll('[data-deleteable]').forEach((element) => {
    element.classList.toggle('hidden', !canDelete);
  });

  document.querySelectorAll('.nav-item').forEach((item) => {
    const tab = item.dataset.tab;
    if (tab === 'tab-settings' && state.currentRole === 'staff_editor') {
      item.classList.add('hidden');
    }
  });

  if (state.currentRole === 'staff_editor') {
    document.querySelectorAll('[data-staff-lock]').forEach((element) => element.classList.add('hidden'));
  }

  if (!canManage) {
    elements.btnBackup.classList.add('hidden');
    elements.btnExportJson.classList.add('hidden');
  } else {
    elements.btnBackup.classList.remove('hidden');
    elements.btnExportJson.classList.remove('hidden');
  }
}

async function handleLogin(event) {
  event.preventDefault();

  if (!isFirebaseReady) {
    showLoginError('Firebase is not available. Check firebase-config.js.');
    return;
  }

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  hideLoginError();
  setLoginLoading(true);

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Login failed:', error);
    showLoginError(getAuthErrorMessage(error));
  } finally {
    setLoginLoading(false);
  }
}

async function handleLogout() {
  try {
    teardownFirestoreListeners();
    await signOut(auth);
  } catch (error) {
    console.error('Logout failed:', error);
    showLoginError(getAuthErrorMessage(error));
  }
}

function assertAuthenticated() {
  if (!auth?.currentUser) {
    throw new Error('You must be signed in to perform this action.');
  }
}

function switchTab(tabId) {
  elements.navItems.forEach((item) => item.classList.toggle('active', item.dataset.tab === tabId));
  elements.tabs.forEach((tab) => tab.classList.toggle('active', tab.id === tabId));
}

function toggleSidebar() {
  elements.sidebar.classList.toggle('open');
}

function populateSettingsForm() {
  const config = state.restaurantConfig;
  elements.settingsNameEn.value = config.name?.en || '';
  elements.settingsNameAr.value = config.name?.ar || '';
  elements.settingsSloganEn.value = config.slogan?.en || '';
  elements.settingsSloganAr.value = config.slogan?.ar || '';
  elements.settingsWhatsapp.value = config.whatsappNumber || '';
  elements.settingsEmail.value = config.email || '';
  elements.settingsHoursEn.value = config.workingHours?.en || '';
  elements.settingsHoursAr.value = config.workingHours?.ar || '';
  elements.settingsCurrencyEn.value = config.currency?.en || '';
  elements.settingsCurrencyAr.value = config.currency?.ar || '';
  elements.settingsAddressEn.value = config.address?.en || '';
  elements.settingsAddressAr.value = config.address?.ar || '';
  elements.settingsColorBg.value = config.colors?.bg || '#0A0A0A';
  elements.settingsColorSurface.value = config.colors?.surface || '#121212';
  elements.settingsColorGold.value = config.colors?.gold || '#D4AF37';
  elements.settingsSubscriptionStatus.value = config.subscription?.status || 'trial';
  elements.settingsPortalRole.value = config.accessControl?.role || state.currentRole || 'super_admin';
  elements.settingsCustomDomain.value = config.customDomain || '';
  elements.settingsDarkMode.checked = state.darkMode;
  elements.settingsLogoPreview.src = config.logoUrl || 'assets/logo.svg';
}

function renderCategoryOptions() {
  elements.itemCategorySelect.innerHTML = '<option value="">Select a category</option>';
  elements.itemsCategoryFilter.innerHTML = '<option value="all">Filter by Category: All</option>';
  state.categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name?.en || category.id;
    elements.itemCategorySelect.appendChild(option.cloneNode(true));
    elements.itemsCategoryFilter.appendChild(option.cloneNode(true));
  });
}

function renderTables() {
  renderCategoriesTable();
  renderItemsTable();
}

function renderCategoriesTable() {
  elements.categoriesTableBody.innerHTML = '';
  state.categories
    .slice()
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
    .forEach((category) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><i class="fa-solid fa-grip-lines drag-handle" title="Drag to reorder"></i></td>
        <td>${escapeHtml(category.id)}</td>
        <td>${escapeHtml(category.name?.en || '')}</td>
        <td>${escapeHtml(category.name?.ar || '')}</td>
        <td>
          <div class="table-actions">
            <button type="button" class="btn-admin-secondary" onclick="editCategory('${category.id}')"><i class="fa-solid fa-pen"></i></button>
            <button type="button" class="btn-admin-danger" data-deleteable onclick="deleteCategory('${category.id}')"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>`;
      row.setAttribute('draggable', 'true');
      row.dataset.id = category.id;
      row.addEventListener('dragstart', () => { state.dragId = category.id; });
      row.addEventListener('dragover', (event) => event.preventDefault());
      row.addEventListener('drop', () => handleCategoryDrop(category.id));
      elements.categoriesTableBody.appendChild(row);
    });
}

function renderItemsTable() {
  const filter = elements.itemsCategoryFilter.value;
  elements.itemsTableBody.innerHTML = '';
  const filteredItems = state.menuItems.filter((item) => filter === 'all' || item.categoryId === filter);
  filteredItems
    .slice()
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
    .forEach((item) => {
      const categoryName = state.categories.find((category) => category.id === item.categoryId)?.name?.en || 'Uncategorized';
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><i class="fa-solid fa-grip-lines drag-handle" title="Drag to reorder"></i></td>
        <td><img src="${escapeAttr(item.imageUrl || item.image || 'assets/logo.svg')}" alt="item" class="avatar-preview" onerror="this.src='assets/logo.svg'" /></td>
        <td>${escapeHtml(item.name?.en || '')}</td>
        <td>${escapeHtml(item.name?.ar || '')}</td>
        <td>${escapeHtml(categoryName)}</td>
        <td>${Number(item.price || 0).toFixed(2)}</td>
        <td><span class="status-pill ${item.isAvailable === false ? 'out-stock' : 'in-stock'}">${item.isAvailable === false ? 'Out of Stock' : 'In Stock'}</span></td>
        <td>
          <div class="table-actions">
            <button type="button" class="btn-admin-secondary" onclick="editItem('${item.id}')"><i class="fa-solid fa-pen"></i></button>
            <button type="button" class="btn-admin-secondary" onclick="duplicateItem('${item.id}')"><i class="fa-solid fa-copy"></i></button>
            <button type="button" class="btn-admin-secondary" onclick="toggleItemAvailability('${item.id}')"><i class="fa-solid fa-toggle-on"></i></button>
            <button type="button" class="btn-admin-danger" data-deleteable onclick="deleteItem('${item.id}')"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>`;
      row.setAttribute('draggable', 'true');
      row.dataset.id = item.id;
      row.addEventListener('dragstart', () => { state.dragId = item.id; });
      row.addEventListener('dragover', (event) => event.preventDefault());
      row.addEventListener('drop', () => handleItemDrop(item.id));
      elements.itemsTableBody.appendChild(row);
    });
}

function renderOverview() {
  const availableItems = state.menuItems.filter((item) => item.isAvailable !== false).length;
  elements.statViews.textContent = String(state.restaurantConfig.analytics?.views || 0);
  elements.statOrders.textContent = String(state.restaurantConfig.analytics?.whatsappOrders || 0);
  elements.statActiveItems.textContent = String(availableItems);
  const subscription = state.restaurantConfig.subscription?.status || 'trial';
  elements.statSubscription.textContent = capitalize(subscription);
  elements.statSubscription.className = `status-badge-${subscription === 'expired' ? 'expired' : subscription === 'active' ? 'active' : 'trial'}`;

  const sortedItems = state.menuItems.slice().sort((a, b) => (b.orderClicks || 0) - (a.orderClicks || 0));
  elements.popularItemsList.innerHTML = '';
  sortedItems.slice(0, 5).forEach((item) => {
    const category = state.categories.find((entry) => entry.id === item.categoryId);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(item.name?.en || '')}</td>
      <td>${escapeHtml(category?.name?.en || 'Uncategorized')}</td>
      <td>${Number(item.price || 0).toFixed(2)}</td>
      <td>${item.orderClicks || 0}</td>
      <td>${item.views || 0}</td>`;
    elements.popularItemsList.appendChild(row);
  });
}

function renderQrCode() {
  const baseUrl = state.restaurantConfig.customDomain?.trim() || window.location.origin;
  const target = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}r=${state.restaurantId}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(target)}`;
  elements.adminQrImg.src = qrApiUrl;
  elements.viewLiveMenuBtn.href = target;
}

async function handleSettingsSave(event) {
  event.preventDefault();
  if (state.currentRole === 'staff_editor') {
    alert('Staff editors cannot change restaurant settings.');
    return;
  }
  const config = state.restaurantConfig;
  config.name = {
    en: sanitizeInput(elements.settingsNameEn.value),
    ar: sanitizeInput(elements.settingsNameAr.value)
  };
  config.slogan = {
    en: sanitizeInput(elements.settingsSloganEn.value),
    ar: sanitizeInput(elements.settingsSloganAr.value)
  };
  config.whatsappNumber = sanitizeInput(elements.settingsWhatsapp.value);
  config.email = sanitizeInput(elements.settingsEmail.value);
  config.workingHours = {
    en: sanitizeInput(elements.settingsHoursEn.value),
    ar: sanitizeInput(elements.settingsHoursAr.value)
  };
  config.currency = {
    en: sanitizeInput(elements.settingsCurrencyEn.value),
    ar: sanitizeInput(elements.settingsCurrencyAr.value)
  };
  config.address = {
    en: sanitizeInput(elements.settingsAddressEn.value),
    ar: sanitizeInput(elements.settingsAddressAr.value)
  };
  config.colors = {
    bg: elements.settingsColorBg.value,
    surface: elements.settingsColorSurface.value,
    gold: elements.settingsColorGold.value
  };
  config.subscription = { status: elements.settingsSubscriptionStatus.value };
  config.accessControl = { role: elements.settingsPortalRole.value };
  config.customDomain = sanitizeInput(elements.settingsCustomDomain.value);
  config.darkMode = state.darkMode;
  const pendingLogo = state.pendingImageTarget === 'logo' ? state.pendingImage : null;
  if (pendingLogo?.url) {
    config.logoUrl = await persistImageAsset(pendingLogo, 'logos', 'logo');
  }
  state.restaurantConfig = config;
  applyTheme();
  renderOverview();
  renderAdminBrand();
  renderQrCode();
  populateSettingsForm();
  if (pendingLogo?.url) {
    state.pendingImage = null;
    elements.settingsLogoInput.value = '';
  }
  try {
    assertAuthenticated();
    await saveRestaurantToFirestore();
    alert('Restaurant settings saved.');
  } catch (error) {
    console.error('Restaurant settings save failed:', error);
    alert(getFirestoreErrorMessage(error));
  }
}

async function handleItemSave(event) {
  event.preventDefault();
  const canManage =
    state.currentRole === 'super_admin' ||
    state.currentRole === 'restaurant_admin' ||
    state.currentRole === 'admin';
  if (!canManage) {
    alert('Only admins can edit menu items.');
    return;
  }

  const isEditing = Boolean(elements.itemEditId.value);
  const existingItem = isEditing
    ? state.menuItems.find((item) => item.id === elements.itemEditId.value)
    : null;
  const itemId = elements.itemEditId.value || `${createSlug(elements.itemNameEn.value)}-${Date.now()}`;

  let imageUrl = elements.itemImgPreview.src;
  if (state.pendingImage?.url) {
    imageUrl = await persistImageAsset(state.pendingImage, 'items', itemId);
  }

  const itemPayload = {
    id: itemId,
    categoryId: elements.itemCategorySelect.value,
    price: Number(elements.itemPrice.value || 0),
    name: {
      en: sanitizeInput(elements.itemNameEn.value),
      ar: sanitizeInput(elements.itemNameAr.value)
    },
    description: {
      en: sanitizeInput(elements.itemDescEn.value),
      ar: sanitizeInput(elements.itemDescAr.value)
    },
    tags: {
      en: splitTags(elements.itemTagsEn.value),
      ar: splitTags(elements.itemTagsAr.value)
    },
    isAvailable: elements.itemAvailable.checked,
    image: imageUrl,
    imageUrl,
    orderIndex: existingItem?.orderIndex ?? state.menuItems.length,
    views: existingItem?.views ?? 0,
    orderClicks: existingItem?.orderClicks ?? 0
  };

  if (isEditing) {
    const index = state.menuItems.findIndex((item) => item.id === elements.itemEditId.value);
    if (index >= 0) {
      state.menuItems[index] = { ...state.menuItems[index], ...itemPayload, id: elements.itemEditId.value };
    }
  } else {
    state.menuItems.push(itemPayload);
  }

  state.pendingImage = null;
  elements.itemImageInput.value = '';
  renderTables();
  renderOverview();
  try {
    assertAuthenticated();
    await saveMenuDataToFirestore();
    closeItemModal();
    alert('Menu item saved.');
  } catch (error) {
    console.error('Menu item save failed:', error);
    alert(getFirestoreErrorMessage(error));
  }
}

async function handleCategorySave(event) {
  event.preventDefault();
  const canManage =
    state.currentRole === 'super_admin' ||
    state.currentRole === 'restaurant_admin' ||
    state.currentRole === 'admin';
  if (!canManage) {
    alert('Only admins can edit categories.');
    return;
  }
  const categoryId = sanitizeSlug(elements.categoryIdVal.value);
  const categoryPayload = {
    id: categoryId,
    name: {
      en: sanitizeInput(elements.categoryNameEn.value),
      ar: sanitizeInput(elements.categoryNameAr.value)
    },
    orderIndex: Number(elements.categoryOrderIndex.value || state.categories.length)
  };

  if (elements.categoryEditId.value) {
    const index = state.categories.findIndex((entry) => entry.id === elements.categoryEditId.value);
    if (index >= 0) {
      state.categories[index] = { ...state.categories[index], ...categoryPayload, id: elements.categoryEditId.value };
    }
  } else {
    state.categories.push(categoryPayload);
  }

  renderCategoryOptions();
  renderTables();
  try {
    assertAuthenticated();
    await saveMenuDataToFirestore();
    closeCategoryModal();
    alert('Category saved.');
  } catch (error) {
    console.error('Category save failed:', error);
    alert(getFirestoreErrorMessage(error));
  }
}

function openAddCategoryModal() {
  elements.categoryForm.reset();
  elements.categoryEditId.value = '';
  elements.categoryIdVal.readOnly = false;
  elements.categoryOrderIndex.value = String(state.categories.length);
  elements.categoryModalTitle.textContent = 'Add Category';
  document.getElementById('modal-category').classList.add('active');
}

function closeCategoryModal() {
  document.getElementById('modal-category').classList.remove('active');
}

function openAddItemModal() {
  elements.itemForm.reset();
  elements.itemEditId.value = '';
  elements.itemAvailable.checked = true;
  elements.itemModalTitle.textContent = 'Add Menu Item';
  elements.itemImgPreview.src = 'assets/logo.svg';
  state.pendingImage = null;
  document.getElementById('modal-item').classList.add('active');
}

function closeItemModal() {
  document.getElementById('modal-item').classList.remove('active');
}

function editCategory(categoryId) {
  const category = state.categories.find((entry) => entry.id === categoryId);
  if (!category) return;
  elements.categoryEditId.value = category.id;
  elements.categoryIdVal.value = category.id;
  elements.categoryIdVal.readOnly = true;
  elements.categoryNameEn.value = category.name?.en || '';
  elements.categoryNameAr.value = category.name?.ar || '';
  elements.categoryOrderIndex.value = String(category.orderIndex || 0);
  elements.categoryModalTitle.textContent = 'Edit Category';
  document.getElementById('modal-category').classList.add('active');
}

function editItem(itemId) {
  const item = state.menuItems.find((entry) => entry.id === itemId);
  if (!item) return;
  elements.itemEditId.value = item.id;
  elements.itemNameEn.value = item.name?.en || '';
  elements.itemNameAr.value = item.name?.ar || '';
  elements.itemDescEn.value = item.description?.en || '';
  elements.itemDescAr.value = item.description?.ar || '';
  elements.itemCategorySelect.value = item.categoryId || '';
  elements.itemPrice.value = item.price || 0;
  elements.itemAvailable.checked = item.isAvailable !== false;
  elements.itemTagsEn.value = (item.tags?.en || []).join(', ');
  elements.itemTagsAr.value = (item.tags?.ar || []).join(', ');
  elements.itemImgPreview.src = item.imageUrl || item.image || 'assets/logo.svg';
  elements.itemModalTitle.textContent = 'Edit Menu Item';
  state.pendingImage = null;
  document.getElementById('modal-item').classList.add('active');
}

function handleImageSelection(event, target) {
  const file = event.target.files?.[0];
  if (!file) return;
  state.pendingImageTarget = target;
  const reader = new FileReader();
  reader.onload = async () => {
    const optimized = await optimizeImage(reader.result, file.type);
    state.pendingImage = { file, url: optimized, name: file.name };
    if (target === 'logo') {
      elements.settingsLogoPreview.src = optimized;
    } else {
      elements.itemImgPreview.src = optimized;
    }
    document.getElementById('modal-cropper').classList.add('active');
    elements.cropperTarget.src = optimized;
    if (state.cropper) {
      state.cropper.replace(optimized);
    } else {
      state.cropper = new window.Cropper(elements.cropperTarget, { aspectRatio: target === 'logo' ? 1 : 4 / 3, viewMode: 1, autoCropArea: 1 });
    }
  };
  reader.readAsDataURL(file);
}

function closeCropperModal() {
  document.getElementById('modal-cropper').classList.remove('active');
}

async function applyCropAndOptimize() {
  if (!state.cropper) return;
  const cropSize = state.pendingImageTarget === 'logo'
    ? { width: 800, height: 800 }
    : { width: 1200, height: 800 };
  const canvas = state.cropper.getCroppedCanvas(cropSize);
  const imageDataUrl = canvas.toDataURL('image/webp', 0.82);
  state.pendingImage = { ...state.pendingImage, url: imageDataUrl };
  if (state.pendingImageTarget === 'logo') {
    elements.settingsLogoPreview.src = imageDataUrl;
  } else {
    elements.itemImgPreview.src = imageDataUrl;
  }
  closeCropperModal();
}

async function optimizeImage(dataUrl, mimeType) {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  const maxWidth = 1600;
  const scale = Math.min(1, maxWidth / img.width);
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const context = canvas.getContext('2d');
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL(mimeType?.includes('png') ? 'image/png' : 'image/webp', 0.82);
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });
}

async function persistImageAsset(imagePayload, folder, filenamePrefix) {
  if (!imagePayload?.url) return '';
  assertAuthenticated();
  if (!storage) {
    throw new Error('Firebase Storage is not available.');
  }

  const response = await fetch(imagePayload.url);
  const blob = await response.blob();
  const extension = getImageExtension(blob.type);
  const storagePath = `restaurants/${state.restaurantId}/${folder}/${filenamePrefix}-${Date.now()}.${extension}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, blob, { contentType: blob.type || 'image/webp' });
  return getDownloadURL(storageRef);
}

function getImageExtension(mimeType) {
  if (mimeType?.includes('png')) return 'png';
  if (mimeType?.includes('jpeg') || mimeType?.includes('jpg')) return 'jpg';
  return 'webp';
}

function deleteCategory(categoryId) {
  const canManage =
    state.currentRole === 'super_admin' ||
    state.currentRole === 'restaurant_admin' ||
    state.currentRole === 'admin';
  if (!canManage) {
    alert('Only admins can delete categories.');
    return;
  }
  openConfirmModal('Delete category?', 'This will remove the category and any linked items.', async () => {
    const removedItems = state.menuItems.filter((item) => item.categoryId === categoryId);
    state.categories = state.categories.filter((entry) => entry.id !== categoryId);
    state.menuItems = state.menuItems.filter((item) => item.categoryId !== categoryId);
    renderCategoryOptions();
    renderTables();
    renderOverview();
    try {
      assertAuthenticated();
      await deleteDoc(doc(db, 'restaurants', state.restaurantId, 'categories', categoryId));
      await Promise.all(
        removedItems.map((item) =>
          deleteDoc(doc(db, 'restaurants', state.restaurantId, 'menu_items', item.id))
        )
      );
      await saveMenuDataToFirestore();
    } catch (error) {
      console.error('Category delete failed:', error);
      alert(getFirestoreErrorMessage(error));
    }
  });
}

function deleteItem(itemId) {
  const canManage =
    state.currentRole === 'super_admin' ||
    state.currentRole === 'restaurant_admin' ||
    state.currentRole === 'admin';
  if (!canManage) {
    alert('Only admins can delete menu items.');
    return;
  }
  openConfirmModal('Delete item?', 'This action permanently removes the item from the menu.', async () => {
    state.menuItems = state.menuItems.filter((item) => item.id !== itemId);
    renderTables();
    renderOverview();
    try {
      assertAuthenticated();
      await deleteDoc(doc(db, 'restaurants', state.restaurantId, 'menu_items', itemId));
      await saveMenuDataToFirestore();
    } catch (error) {
      console.error('Item delete failed:', error);
      alert(getFirestoreErrorMessage(error));
    }
  });
}

async function toggleItemAvailability(itemId) {
  const item = state.menuItems.find((entry) => entry.id === itemId);
  if (!item) return;
  item.isAvailable = !item.isAvailable;
  renderTables();
  renderOverview();
  try {
    assertAuthenticated();
    await saveMenuDataToFirestore();
  } catch (error) {
    item.isAvailable = !item.isAvailable;
    renderTables();
    renderOverview();
    console.error('Availability toggle failed:', error);
    alert(getFirestoreErrorMessage(error));
  }
}

async function duplicateItem(itemId) {
  const item = state.menuItems.find((entry) => entry.id === itemId);
  if (!item) return;
  const copy = {
    ...item,
    id: `${item.id}-copy-${Date.now()}`,
    name: { ...item.name, en: `${item.name?.en || 'Copy'} (Copy)`, ar: `${item.name?.ar || 'نسخة'} (نسخة)` },
    orderIndex: state.menuItems.length,
    views: 0,
    orderClicks: 0
  };
  state.menuItems.push(copy);
  renderTables();
  renderOverview();
  try {
    assertAuthenticated();
    await saveMenuDataToFirestore();
  } catch (error) {
    state.menuItems = state.menuItems.filter((entry) => entry.id !== copy.id);
    renderTables();
    renderOverview();
    console.error('Duplicate item failed:', error);
    alert(getFirestoreErrorMessage(error));
  }
}

async function handleCategoryDrop(targetId) {
  if (!state.dragId || state.dragId === targetId) return;
  const fromIndex = state.categories.findIndex((entry) => entry.id === state.dragId);
  const toIndex = state.categories.findIndex((entry) => entry.id === targetId);
  if (fromIndex < 0 || toIndex < 0) return;
  const previous = state.categories.map((entry) => ({ ...entry }));
  const [moved] = state.categories.splice(fromIndex, 1);
  state.categories.splice(toIndex, 0, moved);
  state.categories = state.categories.map((entry, index) => ({ ...entry, orderIndex: index }));
  renderTables();
  try {
    assertAuthenticated();
    await saveMenuDataToFirestore();
  } catch (error) {
    state.categories = previous;
    renderTables();
    console.error('Category reorder failed:', error);
    alert(getFirestoreErrorMessage(error));
  }
}

async function handleItemDrop(targetId) {
  if (!state.dragId || state.dragId === targetId) return;
  const fromIndex = state.menuItems.findIndex((entry) => entry.id === state.dragId);
  const toIndex = state.menuItems.findIndex((entry) => entry.id === targetId);
  if (fromIndex < 0 || toIndex < 0) return;
  const previous = state.menuItems.map((entry) => ({ ...entry }));
  const [moved] = state.menuItems.splice(fromIndex, 1);
  state.menuItems.splice(toIndex, 0, moved);
  state.menuItems = state.menuItems.map((entry, index) => ({ ...entry, orderIndex: index }));
  renderTables();
  renderOverview();
  try {
    assertAuthenticated();
    await saveMenuDataToFirestore();
  } catch (error) {
    state.menuItems = previous;
    renderTables();
    renderOverview();
    console.error('Item reorder failed:', error);
    alert(getFirestoreErrorMessage(error));
  }
}

function exportMenuJson() {
  const payload = {
    restaurant: state.restaurantConfig,
    categories: state.categories,
    menuItems: state.menuItems
  };
  const data = JSON.stringify(payload, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${state.restaurantId}-menu.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importMenuJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(reader.result);
      state.restaurantConfig = { ...state.restaurantConfig, ...(parsed.restaurant || {}) };
      state.categories = parsed.categories || [];
      state.menuItems = parsed.menuItems || [];
      renderCategoryOptions();
      renderTables();
      renderOverview();
      populateSettingsForm();
      assertAuthenticated();
      await saveMenuDataToFirestore();
      alert('Menu import complete.');
    } catch (error) {
      console.error('Menu import failed:', error);
      alert(error instanceof SyntaxError ? 'The selected file is not a valid menu JSON export.' : getFirestoreErrorMessage(error));
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

async function createLiveBackup() {
  try {
    assertAuthenticated();
    const backupRef = doc(collection(db, 'restaurants', state.restaurantId, 'backups'));
    await setDoc(backupRef, {
      restaurant: state.restaurantConfig,
      categories: state.categories,
      menuItems: state.menuItems,
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp()
    });
    alert('Backup saved to Firestore.');
  } catch (error) {
    console.error('Backup failed:', error);
    alert(getFirestoreErrorMessage(error));
  }
}

async function saveRestaurantToFirestore() {
  const restaurantRef = doc(db, 'restaurants', state.restaurantId);
  await setDoc(restaurantRef, state.restaurantConfig, { merge: true });
}

async function saveMenuDataToFirestore() {
  const batch = writeBatch(db);
  const restaurantRef = doc(db, 'restaurants', state.restaurantId);
  batch.set(
    restaurantRef,
    {
      ...state.restaurantConfig,
      analytics: state.restaurantConfig.analytics || { views: 0, whatsappOrders: 0 }
    },
    { merge: true }
  );

  const categoriesRef = collection(db, 'restaurants', state.restaurantId, 'categories');
  const itemsRef = collection(db, 'restaurants', state.restaurantId, 'menu_items');

  const [existingCategoriesSnap, existingItemsSnap] = await Promise.all([
    getDocs(categoriesRef),
    getDocs(itemsRef)
  ]);

  const activeCategoryIds = new Set(state.categories.map((category) => category.id));
  const activeItemIds = new Set(state.menuItems.map((item) => item.id));

  existingCategoriesSnap.forEach((docSnap) => {
    if (!activeCategoryIds.has(docSnap.id)) {
      batch.delete(doc(categoriesRef, docSnap.id));
    }
  });

  existingItemsSnap.forEach((docSnap) => {
    if (!activeItemIds.has(docSnap.id)) {
      batch.delete(doc(itemsRef, docSnap.id));
    }
  });

  state.categories.forEach((category, index) => {
    batch.set(doc(categoriesRef, category.id), { ...category, orderIndex: index });
  });

  state.menuItems.forEach((item, index) => {
    batch.set(doc(itemsRef, item.id), { ...item, orderIndex: index });
  });

  await batch.commit();
}

async function seedFirestoreIfEmpty() {
  const restaurantRef = doc(db, 'restaurants', state.restaurantId);
  const restaurantSnap = await getDocs(collection(db, 'restaurants', state.restaurantId, 'categories'));
  if (!restaurantSnap.empty) return;

  await setDoc(restaurantRef, state.restaurantConfig);
  await saveMenuDataToFirestore();
}

function syncFromFirestore() {
  teardownFirestoreListeners();

  const restaurantRef = doc(db, 'restaurants', state.restaurantId);
  state.firestoreUnsubscribers.push(
    onSnapshot(
      restaurantRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          state.restaurantConfig = { ...structuredClone(DEFAULT_RESTAURANT), ...snapshot.data() };
          populateSettingsForm();
          renderAdminBrand();
          renderOverview();
          renderQrCode();
          updatePermissionAwareUi();
        } else {
          try {
            await seedFirestoreIfEmpty();
          } catch (error) {
            console.error('Failed to seed Firestore:', error);
            alert(getFirestoreErrorMessage(error));
          }
        }
      },
      (error) => {
        console.error('Restaurant sync error:', error);
        alert(getFirestoreErrorMessage(error));
      }
    )
  );

  const categoriesQuery = query(
    collection(db, 'restaurants', state.restaurantId, 'categories'),
    orderBy('orderIndex', 'asc')
  );
  state.firestoreUnsubscribers.push(
    onSnapshot(
      categoriesQuery,
      (snapshot) => {
        state.categories = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data()
        }));
        renderCategoryOptions();
        renderTables();
      },
      (error) => console.error('Categories sync error:', error)
    )
  );

  const itemsQuery = query(
    collection(db, 'restaurants', state.restaurantId, 'menu_items'),
    orderBy('orderIndex', 'asc')
  );
  state.firestoreUnsubscribers.push(
    onSnapshot(
      itemsQuery,
      (snapshot) => {
        state.menuItems = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data()
        }));
        renderTables();
        renderOverview();
      },
      (error) => console.error('Menu items sync error:', error)
    )
  );
}

function applyTheme() {
  document.body.classList.toggle('admin-light', !state.darkMode);
  document.documentElement.style.setProperty('--admin-bg', state.darkMode ? '#060606' : '#f5efe2');
  document.documentElement.style.setProperty('--admin-surface', state.darkMode ? '#111111' : '#fffaf2');
  document.documentElement.style.setProperty('--admin-surface-2', state.darkMode ? '#171717' : '#f2e7cf');
  document.documentElement.style.setProperty('--admin-text', state.darkMode ? '#f7f2e8' : '#16110b');
  document.documentElement.style.setProperty('--admin-muted', state.darkMode ? '#a7a7a7' : '#654f33');
  document.documentElement.style.setProperty('--admin-gold', state.darkMode ? '#d4af37' : '#9c6f13');
}

function openConfirmModal(title, message, callback) {
  elements.confirmTitle.textContent = title;
  elements.confirmMessage.textContent = message;
  state.confirmCallback = callback;
  elements.confirmModal.classList.add('active');
}

function closeConfirmModal() {
  elements.confirmModal.classList.remove('active');
  state.confirmCallback = null;
}

function runConfirmAction() {
  if (typeof state.confirmCallback === 'function') {
    state.confirmCallback();
  }
  closeConfirmModal();
}

function sanitizeInput(value) {
  return String(value || '').replace(/<[^>]*>/g, '').trim();
}

function sanitizeSlug(value) {
  return sanitizeInput(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function splitTags(value) {
  return sanitizeInput(value).split(',').map((item) => item.trim()).filter(Boolean);
}

function createSlug(value) {
  return sanitizeSlug(value || 'item');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function capitalize(value) {
  return String(value || '').charAt(0).toUpperCase() + String(value || '').slice(1);
}

window.addEventListener('DOMContentLoaded', init);
