/**
 * Taste Restaurant - Premium Digital Menu Web App
 * Real-time sync with Firestore for menu data and analytics.
 */

import { db, isFirebaseReady } from "./firebase-config.js?v=3";
import { 
    doc, 
    collection, 
    onSnapshot, 
    updateDoc, 
    increment, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================================================
// 1. Default display data (used only when Firestore has no data yet)
// ==========================================================================
const fallbackRestaurant = {
    name: { en: "Taste Restaurant", ar: "مطعم تيست" },
    slogan: { en: "Fresh & Delicious Every Day", ar: "طازج ولذيذ كل يوم" },
    whatsappNumber: "+970599123456",
    logoUrl: "assets/logo.svg",
    colors: { bg: "#0A0A0A", surface: "#121212", gold: "#D4AF37" },
    workingHours: { en: "Saturday - Friday (12:00 PM - 12:00 AM)", ar: "السبت - الجمعة (12:00 ظهراً - 12:00 ليلاً)" },
    currency: { en: "JD", ar: "دينار" },
    address: { en: "Ramallah, Palestine", ar: "رام الله، فلسطين" },
    subscription: { status: "active" }
};

const fallbackCategories = [
    { id: "burgers", name: { en: "Burgers", ar: "البرغر" }, orderIndex: 0 },
    { id: "pizza", name: { en: "Pizza", ar: "البيتزا" }, orderIndex: 1 },
    { id: "drinks", name: { en: "Drinks", ar: "المشروبات" }, orderIndex: 2 },
    { id: "desserts", name: { en: "Desserts", ar: "الحلويات" }, orderIndex: 3 }
];

const fallbackItems = [
    {
        id: "truffle-burger",
        categoryId: "burgers",
        price: 8.0,
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
        name: { en: "Truffle Burger", ar: "برغر الترفل" },
        description: { en: "Juicy Angus beef, premium black truffle aioli, melted Swiss cheese, and caramelized onions on a toasted brioche bun.", ar: "لحم أنجوس مشوي، صلصة الترافل الأسود الفاخرة، جبن سويسري ذائب، وبصل مكرمل في خبز البريوش الطازج." },
        tags: { en: ["Premium", "Chef Special"], ar: ["فاخر", "مميز"] },
        isAvailable: true
    },
    {
        id: "cheese-burger",
        categoryId: "burgers",
        price: 7.0,
        imageUrl: "https://images.unsplash.com/photo-1550547660-9454987c1f0f?auto=format&fit=crop&w=600&q=80",
        name: { en: "Cheese Burger", ar: "برغر الجبن" },
        description: { en: "Premium beef patty, melting cheddar cheese, fresh crisp lettuce, vine-ripened tomatoes, and our signature special sauce.", ar: "شريحة لحم بقري فاخر، جبنة شيدر ذائبة، خس طازج، طماطم، وصلصة تيست الخاصة." },
        tags: { en: ["Classic"], ar: ["كلاسيكي"] },
        isAvailable: true
    },
    {
        id: "margherita-pizza",
        categoryId: "pizza",
        price: 9.0,
        imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80",
        name: { en: "Margherita Pizza", ar: "بيتزا مارغريتا" },
        description: { en: "Artisan pizza crust topped with rich tomato sauce, fresh buffalo mozzarella, aromatic fresh basil leaves, and a drizzle of extra virgin olive oil.", ar: "عجينة البيتزا الحرفية تعلوها صلصة الطماطم الغنية، جبنة الموزاريلا الطازجة، أوراق الريحان العطرية ورشة من زيت الزيتون البكر." },
        tags: { en: ["Vegetarian", "Artisan"], ar: ["نباتي", "حرفية"] },
        isAvailable: true
    },
    {
        id: "pepperoni-pizza",
        categoryId: "pizza",
        price: 10.0,
        imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80",
        name: { en: "Pepperoni Pizza", ar: "بيتزا بيبروني" },
        description: { en: "Classic Italian crust loaded with premium spicy beef pepperoni, mozzarella cheese, fresh oregano, and an optional touch of hot honey.", ar: "عجينة إيطالية كلاسيكية مغطاة بقطع البيبروني البقري الحار، جبنة الموزاريلا، الأوريغانو الطازج مع لمسة عسل حار اختيارية." },
        tags: { en: ["Spicy"], ar: ["حار"] },
        isAvailable: true
    },
    {
        id: "golden-mojito",
        categoryId: "drinks",
        price: 3.0,
        imageUrl: "https://images.unsplash.com/photo-1551538827-9b03706baf00?auto=format&fit=crop&w=600&q=80",
        name: { en: "Golden Mojito", ar: "موهيتو ذهبي" },
        description: { en: "A refreshing blend of fresh lime, wild mint, sparkling club soda, and edible 24K gold flakes for a touch of luxury.", ar: "مزيج منعش من الليمون الأخضر، النعناع البري، صودا فوارة ورقاقات الذهب عيار 24 القابلة للأكل لمسة من الفخامة." },
        tags: { en: ["Signature", "Cold"], ar: ["توقيعنا", "بارد"] },
        isAvailable: true
    },
    {
        id: "orange-juice",
        categoryId: "drinks",
        price: 2.5,
        imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80",
        name: { en: "Fresh Orange Juice", ar: "عصير برتقال طازج" },
        description: { en: "100% freshly squeezed sweet oranges, served chilled on ice. Packed with Vitamin C and natural energy.", ar: "عصير برتقال طبيعي 100% معصور طازجاً، يقدم مبرداً مع الثلج. غني بفيتامين سي والطاقة الطبيعية." },
        tags: { en: ["Fresh"], ar: ["طازج"] },
        isAvailable: true
    },
    {
        id: "kunafa-cheesecake",
        categoryId: "desserts",
        price: 5.0,
        imageUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&q=80",
        name: { en: "Pistachio Kunafa Cheesecake", ar: "تشيز كيك الكنافة بالفستق" },
        description: { en: "An exquisite fusion of creamy New York cheesecake layered with crispy, golden Arabic kunafa, topped with rich pistachio sauce.", ar: "اندماج فاخر بين التشيز كيك الكريمي الغني وعجينة الكنافة الذهبية المقرمشة، مغطاة بصلصة الفستق الحلبي الفاخرة." },
        tags: { en: ["Best Seller", "Fusion"], ar: ["الأكثر مبيعاً", "مبتكر"] },
        isAvailable: true
    },
    {
        id: "lava-cake",
        categoryId: "desserts",
        price: 4.0,
        imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
        name: { en: "Chocolate Lava Cake", ar: "كيك الشوكولاتة البركانية" },
        description: { en: "Warm chocolate cake with a molten, liquid chocolate center, lightly dusted with cocoa and served with premium vanilla ice cream.", ar: "كيك الشوكولاتة الدافئ مع قلب من الشوكولاتة السائلة الذائبة، مرشوش بالكاكاو ويقدم مع آيس كريم الفانيليا الفاخر." },
        tags: { en: ["Warm"], ar: ["دافئ"] },
        isAvailable: true
    }
];

// ==========================================================================
// 2. Translations Dictionary
// ==========================================================================
const translations = {
    en: {
        title: "Taste Restaurant - Premium Digital Menu",
        slogan: "Fresh & Delicious Every Day",
        searchPlaceholder: "Search menu items...",
        catAll: "All Menu",
        itemsFound: "items found",
        noItemsTitle: "No items found",
        noItemsDesc: "Try searching for something else or browse other categories.",
        cartTitle: "Your Order List",
        cartEmpty: "Your order is empty. Add delicious items from the menu!",
        cartTotal: "Total Amount",
        sendWhatsAppOrder: "Send Order via WhatsApp",
        workingHoursTitle: "Opening Hours",
        daysWeek: "Saturday - Friday",
        hoursWeek: "12:00 PM - 12:00 AM",
        contactTitle: "Contact Us",
        address: "Ramallah, Palestine",
        scanMenuTitle: "Scan Our Menu",
        scanMenuDesc: "Share this menu with family & friends by scanning this QR Code.",
        copyright: "All rights reserved. Designed for excellence.",
        footerSlogan: "A luxury culinary experience crafted with passion and premium ingredients.",
        orderNow: "Order Now",
        addToOrder: "Add to Order",
        currency: "JD",
        itemAdded: "Item added to your order!",
        singleOrderText: "Hello, I would like to order: 1 x {item} ({price} {currency}). Please confirm.",
        menuOfflineTitle: "Menu Temporarily Offline",
        menuOfflineDesc: "This digital menu is temporarily unavailable. Please contact the restaurant administration.",
        outOfStock: "Out of Stock"
    },
    ar: {
        title: "مطعم تيست - قائمة الطعام الرقمية المميزة",
        slogan: "طازج ولذيذ كل يوم",
        searchPlaceholder: "ابحث عن طبق...",
        catAll: "القائمة الكاملة",
        itemsFound: "أطباق متوفرة",
        noItemsTitle: "لم يتم العثور على أطباق",
        noItemsDesc: "حاول البحث عن شيء آخر أو تصفح فئات أخرى.",
        cartTitle: "تفاصيل طلبك",
        cartEmpty: "سلة طلبك فارغة حالياً. أضف أطباقاً شهية من القائمة!",
        cartTotal: "المجموع الإجمالي",
        sendWhatsAppOrder: "إرسال الطلب عبر الواتساب",
        workingHoursTitle: "أوقات العمل",
        daysWeek: "السبت - الجمعة",
        hoursWeek: "12:00 ظهراً - 12:00 ليلاً",
        contactTitle: "اتصل بنا",
        address: "رام الله، فلسطين",
        scanMenuTitle: "امسح القائمة الرقمية",
        scanMenuDesc: "شارك هذه القائمة مع العائلة والأصدقاء عبر مسح هذا الكود.",
        copyright: "جميع الحقوق محفوظة. صُمم بتميز لراحتكم.",
        footerSlogan: "تجربة طهي فاخرة معدة بشغف ومن أجود المكونات الطازجة.",
        orderNow: "اطلب الآن",
        addToOrder: "أضف للطلب",
        currency: "دينار",
        itemAdded: "تمت إضافة الطبق لطلبك!",
        singleOrderText: "مرحباً، أود طلب: 1 x {item} بسعر ({price} {currency}). يرجى تأكيد الطلب.",
        menuOfflineTitle: "قائمة الطعام متوقفة مؤقتاً",
        menuOfflineDesc: "هذه القائمة متوقفة حالياً عن العمل. يرجى مراجعة إدارة المطعم.",
        outOfStock: "غير متوفر"
    }
};

// ==========================================================================
// 3. Dynamic State Variables
// ==========================================================================
let currentLanguage = "en";
let currentCategory = "all";
let searchQuery = "";
let cart = [];

// Restaurant config data loaded from DB (or fallback)
let restaurantConfig = { ...fallbackRestaurant };
let categoriesList = [ ...fallbackCategories ];
let menuItemsList = [ ...fallbackItems ];
let activeRestaurantId = "taste";

// DOM Elements
const screenLoader = document.getElementById("screen-loader");
const expiredScreen = document.getElementById("expired-screen");
const menuGrid = document.getElementById("menu-grid");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("menu-search");
const searchClear = document.getElementById("search-clear");
const categoryBtnsBar = document.getElementById("dynamic-categories-bar");
const currentCategoryTitle = document.getElementById("current-category-title");
const itemsCountDisplay = document.getElementById("items-count");
const langToggle = document.getElementById("lang-toggle");
const themeToggle = document.getElementById("theme-toggle");
const THEME_STORAGE_KEY = "theme";

// Cart DOM Elements
const cartToggle = document.getElementById("cart-toggle");
const cartDrawer = document.getElementById("cart-drawer");
const cartClose = document.getElementById("cart-close");
const cartItemsContainer = document.getElementById("cart-items");
const cartEmptyState = document.getElementById("cart-empty-state");
const cartTotalValue = document.getElementById("cart-total-value");
const cartCountBadge = document.getElementById("cart-count");
const whatsappCheckoutBtn = document.getElementById("whatsapp-checkout");
const floatingWhatsappBtn = document.getElementById("floating-whatsapp-btn");
const floatingCartBadge = document.getElementById("floating-cart-badge");

// QR Code DOM Element
const qrCodeImg = document.getElementById("qr-code-img");

// ==========================================================================
// 4. Initialisation
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const rParam = urlParams.get("r");
    if (rParam && rParam.trim() !== "") {
        activeRestaurantId = rParam.toLowerCase().trim();
    }

    const savedLanguage = localStorage.getItem("tasteMenuLang");
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
        currentLanguage = savedLanguage;
    } else {
        const browserLang = navigator.language.substring(0, 2);
        currentLanguage = browserLang === "ar" ? "ar" : "en";
    }

    loadCartFromStorage();
    initTheme();

    if (!isFirebaseReady || !db) {
        console.error("Firestore unavailable. Check firebase-config.js.");
        applyRestaurantConfig(fallbackRestaurant);
        applyCategories(fallbackCategories);
        applyMenuItems(fallbackItems);
        hideLoader();
    } else {
        syncWithFirestore();
    }

    setupEventListeners();
    setupQrCode();
});

// Setup dynamic QR code pointing to active URL
function setupQrCode() {
    let currentUrl = window.location.href;
    if (currentUrl.includes("127.0.0.1") || currentUrl.includes("localhost") || currentUrl.startsWith("file:///")) {
        // Fallback for clean QR codes locally
        currentUrl = `https://taste-restaurant.github.io/?r=${activeRestaurantId}`;
    }
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=d4af37&bgcolor=060606&data=${encodeURIComponent(currentUrl)}`;
    if (qrCodeImg) {
        qrCodeImg.src = qrApiUrl;
    }
}

// Hide full-screen load curtain
function hideLoader() {
    if (screenLoader && !screenLoader.classList.contains("fade-out")) {
        screenLoader.classList.add("fade-out");
    }
}

// ==========================================================================
// 5. Firebase Sync Engine
// ==========================================================================
function syncWithFirestore() {
    const restaurantDocRef = doc(db, "restaurants", activeRestaurantId);
    
    // 1. Sync Restaurant Settings
    onSnapshot(restaurantDocRef, (snapshot) => {
        if (!snapshot.exists()) {
            console.warn(`Restaurant "${activeRestaurantId}" not found in Firestore. Loading local template...`);
            applyRestaurantConfig(fallbackRestaurant);
            hideLoader();
            return;
        }

        const data = snapshot.data();
        
        // Subscription check
        if (data.subscription && data.subscription.status === "expired") {
            showExpiredScreen();
            hideLoader();
            return;
        }

        applyRestaurantConfig(data);
        
        // Increment views once per session
        triggerPageViewTracker();
        hideLoader();
    }, (error) => {
        console.error("Firestore sync error (settings):", error);
        applyRestaurantConfig(fallbackRestaurant);
        hideLoader();
    });

    // 2. Sync Categories (Ordered by orderIndex)
    const categoriesQuery = query(
        collection(db, "restaurants", activeRestaurantId, "categories"),
        orderBy("orderIndex", "asc")
    );
    
    onSnapshot(categoriesQuery, (snapshot) => {
        const fetchedCats = [];
        snapshot.forEach(docSnap => {
            fetchedCats.push({ id: docSnap.id, ...docSnap.data() });
        });

        if (fetchedCats.length > 0) {
            applyCategories(fetchedCats);
        } else {
            applyCategories(fallbackCategories);
        }
    }, (error) => {
        console.error("Firestore sync error (categories):", error);
        applyCategories(fallbackCategories);
    });

    // 3. Sync Menu Items (Ordered by orderIndex)
    const itemsQuery = query(
        collection(db, "restaurants", activeRestaurantId, "menu_items"),
        orderBy("orderIndex", "asc")
    );

    onSnapshot(itemsQuery, (snapshot) => {
        const fetchedItems = [];
        snapshot.forEach(docSnap => {
            fetchedItems.push({ id: docSnap.id, ...docSnap.data() });
        });

        if (fetchedItems.length > 0) {
            applyMenuItems(fetchedItems);
        } else {
            applyMenuItems(fallbackItems);
        }
    }, (error) => {
        console.error("Firestore sync error (items):", error);
        applyMenuItems(fallbackItems);
    });
}

// Show subscription expiry screen block
function showExpiredScreen() {
    if (expiredScreen) {
        expiredScreen.classList.remove("hidden");
    }
}

// Increment overall restaurant views counter once per session
function triggerPageViewTracker() {
    if (!db) return;
    const viewFlagKey = `tasteMenuViewsTracked_${activeRestaurantId}`;
    if (!sessionStorage.getItem(viewFlagKey)) {
        updateDoc(doc(db, "restaurants", activeRestaurantId), {
            "analytics.views": increment(1)
        }).then(() => {
            sessionStorage.setItem(viewFlagKey, "true");
        }).catch(err => console.error("Error updating views log:", err));
    }
}

// Increment WhatsApp checkout clicks
function triggerWhatsAppClicksTracker() {
    if (!db) return;
    updateDoc(doc(db, "restaurants", activeRestaurantId), {
        "analytics.whatsappOrders": increment(1)
    }).catch(err => console.error("Error updating analytics:", err));
}

// Increment specific menu item clicks
function triggerItemOrderClickTracker(itemId) {
    if (!db) return;
    const itemRef = doc(db, "restaurants", activeRestaurantId, "menu_items", itemId);
    updateDoc(itemRef, {
        "orderClicks": increment(1),
        "views": increment(1) // increment views alongside clicks
    }).catch(err => console.error("Error updating item analytics:", err));
}

// ==========================================================================
// 6. Data Binder Controllers
// ==========================================================================
function applyRestaurantConfig(data) {
    restaurantConfig = data;

    // Apply dynamic brand colors (respects light/dark mode)
    applyDynamicThemeColors();

    // Refresh translation templates
    applyLanguage(currentLanguage);
}

function applyDynamicThemeColors() {
    const colors = restaurantConfig.colors || {};
    const dynamicStyle = document.getElementById("dynamic-theme-colors");
    if (!dynamicStyle) return;

    const isLight = document.body.classList.contains("light");

    if (isLight) {
        if (!colors.gold) {
            dynamicStyle.innerHTML = "";
            return;
        }
        dynamicStyle.innerHTML = `
            html.light, body.light {
                --primary: ${colors.gold};
                --gold: ${colors.gold};
                --gold-dark: ${colors.goldDark || '#7a5610'};
                --gold-light: ${colors.goldLight || 'rgba(156, 111, 19, 0.12)'};
            }
        `;
        return;
    }

    if (colors.bg && colors.gold) {
        dynamicStyle.innerHTML = `
            html.dark, body.dark {
                --background: ${colors.bg};
                --surface: ${colors.surface || '#1a1a1a'};
                --primary: ${colors.gold};
                --bg-color: ${colors.bg};
                --surface-color: ${colors.surface || '#1a1a1a'};
                --surface-card: ${colors.surfaceCard || colors.surface || '#1a1a1a'};
                --gold: ${colors.gold};
                --gold-dark: ${colors.goldDark || '#aa8c2c'};
                --gold-light: ${colors.goldLight || 'rgba(212, 175, 55, 0.15)'};
                --gold-hover: ${colors.goldHover || '#F5D36C'};
            }
        `;
    } else {
        dynamicStyle.innerHTML = "";
    }
}

function applyCategories(cats) {
    categoriesList = cats;
    renderCategoriesBar();
    updateCategoryTitleText();
}

function applyMenuItems(items) {
    menuItemsList = items;
    renderMenuItems();
}

// ==========================================================================
// 7. Theme Manager
// ==========================================================================
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "dark";
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    const resolvedTheme = theme === "light" ? "light" : "dark";
    document.documentElement.classList.remove("dark", "light");
    document.body.classList.remove("dark", "light");
    document.documentElement.classList.add(resolvedTheme);
    document.body.classList.add(resolvedTheme);
    localStorage.setItem(THEME_STORAGE_KEY, resolvedTheme);
    applyDynamicThemeColors();
    updateThemeToggleIcon(resolvedTheme);
}

function toggleTheme() {
    const isLight = document.body.classList.contains("light");
    applyTheme(isLight ? "dark" : "light");
}

function updateThemeToggleIcon(theme) {
    const icon = document.querySelector("#theme-toggle .theme-icon");
    if (!icon) return;
    icon.textContent = theme === "light" ? "🌙" : "☀️";
}

// ==========================================================================
// 8. Dynamic Translation Manager
// ==========================================================================
function applyLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem("tasteMenuLang", lang);

    // Apply page direction
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    
    // Header title
    document.title = restaurantConfig.name[lang] || restaurantConfig.name.en;

    // Toggle button globe label
    const langTextEl = langToggle.querySelector(".lang-text");
    if (langTextEl) {
        langTextEl.textContent = lang === "en" ? "العربية" : "English";
    }
    langToggle.setAttribute("data-tooltip", lang === "en" ? "التحويل للعربية" : "Switch to English");

    // Dynamic brand text
    const brandNameEl = document.getElementById("nav-brand-name");
    const logoImgEl = document.getElementById("nav-logo-img");
    if (brandNameEl) brandNameEl.textContent = restaurantConfig.name[lang] || restaurantConfig.name.en;
    if (logoImgEl && restaurantConfig.logoUrl) logoImgEl.src = restaurantConfig.logoUrl;

    // Hero details
    const heroName = document.getElementById("hero-restaurant-name");
    const heroSlogan = document.getElementById("hero-restaurant-slogan");
    const heroLogo = document.getElementById("hero-logo-img");
    if (heroName) heroName.textContent = restaurantConfig.name[lang] || restaurantConfig.name.en;
    if (heroSlogan) heroSlogan.textContent = restaurantConfig.slogan[lang] || restaurantConfig.slogan.en;
    if (heroLogo && restaurantConfig.logoUrl) heroLogo.src = restaurantConfig.logoUrl;

    // Footer details
    const footerLogo = document.getElementById("footer-logo-img");
    const footerName = document.getElementById("footer-restaurant-name");
    const footerSlogan = document.getElementById("footer-restaurant-slogan");
    const footerCopyrightName = document.getElementById("footer-copyright-name");
    
    const footerHours = document.getElementById("footer-hours-val");
    const footerPhone = document.getElementById("footer-phone-val");
    const footerEmail = document.getElementById("footer-email-val");
    const footerAddress = document.getElementById("footer-address-val");

    if (footerLogo && restaurantConfig.logoUrl) footerLogo.src = restaurantConfig.logoUrl;
    if (footerName) footerName.textContent = restaurantConfig.name[lang] || restaurantConfig.name.en;
    if (footerSlogan) footerSlogan.textContent = restaurantConfig.slogan[lang] || restaurantConfig.slogan.en;
    if (footerCopyrightName) footerCopyrightName.textContent = restaurantConfig.name[lang] || restaurantConfig.name.en;
    
    if (footerHours) footerHours.textContent = restaurantConfig.workingHours[lang] || restaurantConfig.workingHours.en;
    if (footerPhone) footerPhone.textContent = restaurantConfig.whatsappNumber;
    if (footerEmail) footerEmail.textContent = restaurantConfig.email || "info@tasterestaurant.com";
    if (footerAddress) footerAddress.textContent = restaurantConfig.address[lang] || restaurantConfig.address.en;

    // Scan DOM for elements with translation tags
    document.querySelectorAll("[data-translate]").forEach(elem => {
        const key = elem.getAttribute("data-translate");
        if (translations[lang][key]) {
            elem.textContent = translations[lang][key];
        }
    });

    // Update Input Placeholders
    document.querySelectorAll("[data-translate-placeholder]").forEach(elem => {
        const key = elem.getAttribute("data-translate-placeholder");
        if (translations[lang][key]) {
            elem.setAttribute("placeholder", translations[lang][key]);
        }
    });

    // Update active category text
    updateCategoryTitleText();

    // Re-render items
    renderMenuItems();

    // Re-render cart with dynamic language labels
    renderCart();
}

function updateCategoryTitleText() {
    if (!currentCategoryTitle) return;
    
    if (currentCategory === "all") {
        currentCategoryTitle.textContent = translations[currentLanguage].catAll;
    } else {
        const activeCat = categoriesList.find(c => c.id === currentCategory);
        if (activeCat) {
            currentCategoryTitle.textContent = activeCat.name[currentLanguage] || activeCat.name.en;
        } else {
            currentCategoryTitle.textContent = translations[currentLanguage].catAll;
        }
    }
}

// Toggle language hook
function toggleLanguage() {
    const nextLang = currentLanguage === "en" ? "ar" : "en";
    applyLanguage(nextLang);
}

// ==========================================================================
// 8. Category UI Renderer
// ==========================================================================
function renderCategoriesBar() {
    if (!categoryBtnsBar) return;
    categoryBtnsBar.innerHTML = "";
    
    const lang = currentLanguage;
    
    categoriesList.forEach(cat => {
        const btn = document.createElement("button");
        btn.className = `category-btn ${currentCategory === cat.id ? 'active' : ''}`;
        btn.setAttribute("data-category", cat.id);
        
        // Match icon dynamically if possible or use standard dot/chevron icon
        let iconHtml = '<i class="fa-solid fa-circle-dot"></i>';
        
        // Basic match mappings
        const idLower = cat.id.toLowerCase();
        if (idLower.includes("burger")) iconHtml = '<i class="fa-solid fa-hamburger"></i>';
        else if (idLower.includes("pizz")) iconHtml = '<i class="fa-solid fa-pizza-slice"></i>';
        else if (idLower.includes("drink") || idLower.includes("bever")) iconHtml = '<i class="fa-solid fa-glass-water"></i>';
        else if (idLower.includes("dessert") || idLower.includes("sweet")) iconHtml = '<i class="fa-solid fa-ice-cream"></i>';
        
        btn.innerHTML = `
            ${iconHtml}
            <span>${cat.name[lang] || cat.name.en}</span>
        `;
        
        btn.addEventListener("click", handleCategorySelect);
        categoryBtnsBar.appendChild(btn);
    });
}

function handleCategorySelect(e) {
    const btn = e.currentTarget;
    const category = btn.getAttribute("data-category");

    triggerButtonPressEffect(btn);
    
    // Update active class styles across all buttons (including the main "All" button)
    document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    
    currentCategory = category;
    updateCategoryTitleText();
    renderMenuItems();

    // Scroll to grid smoothly
    const offset = 140;
    const element = document.querySelector(".menu-main");
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - offset;
    
    window.scrollTo({
         top: offsetPosition,
         behavior: "smooth"
    });
}

// ==========================================================================
// 9. Menu UI Grid Renderer
// ==========================================================================
function renderMenuItems() {
    if (!menuGrid) return;
    menuGrid.innerHTML = "";
    
    const lang = currentLanguage;
    const currencySymbol = restaurantConfig.currency[lang] || restaurantConfig.currency.en || translations[lang].currency;
    
    // Filter Items by category and query
    const filteredItems = menuItemsList.filter(item => {
        // Category check
        const matchesCategory = currentCategory === "all" || item.categoryId === currentCategory;
        
        // Search query check
        const searchLower = searchQuery.toLowerCase().trim();
        if (!searchLower) return matchesCategory;

        const nameEN = (item.name.en || "").toLowerCase();
        const nameAR = item.name.ar || "";
        const descEN = (item.description.en || "").toLowerCase();
        const descAR = item.description.ar || "";
        
        const matchesSearch = nameEN.includes(searchLower) || 
                              nameAR.includes(searchLower) ||
                              descEN.includes(searchLower) ||
                              descAR.includes(searchLower);
                              
        return matchesCategory && matchesSearch;
    });

    // Toggle Empty State
    if (filteredItems.length === 0) {
        emptyState.classList.remove("hidden");
        menuGrid.classList.add("hidden");
        itemsCountDisplay.textContent = "0";
    } else {
        emptyState.classList.add("hidden");
        menuGrid.classList.remove("hidden");
        itemsCountDisplay.textContent = filteredItems.length;
    }

    // Build Cards
    filteredItems.forEach((item, index) => {
        const card = document.createElement("div");
        
        // Manage stock status class
        const isOutOfStock = item.isAvailable === false;
        card.className = `menu-card animate-slide-up ${isOutOfStock ? 'out-of-stock' : ''}`;
        card.style.animationDelay = `${index * 0.05}s`;
        
        // Tags rendering
        let tagsHtml = "";
        if (item.tags && item.tags[lang]) {
            item.tags[lang].forEach(tag => {
                if (tag.trim() !== "") {
                    tagsHtml += `<span class="tag-badge">${tag}</span>`;
                }
            });
        }

        // Out of stock badge
        const stockBadge = isOutOfStock ? 
            `<span class="out-of-stock-badge">${translations[lang].outOfStock}</span>` : "";

        // Add to Cart disables if out of stock
        const actionDisabled = isOutOfStock ? "disabled" : "";

        card.innerHTML = `
            <div class="card-img-container">
                <img src="${item.imageUrl || ''}" alt="${item.name[lang]}" class="menu-card-img skeleton" onload="this.classList.remove('skeleton')">
                <span class="card-price-badge">${Number(item.price).toFixed(2)} ${currencySymbol}</span>
                ${stockBadge}
            </div>
            <div class="card-info">
                <div class="card-title-row">
                    <h3 class="card-title">${item.name[lang] || item.name.en}</h3>
                </div>
                <p class="card-description">${item.description[lang] || item.description.en || ""}</p>
                <div class="card-tags-row">${tagsHtml}</div>
                <div class="card-actions">
                    <button type="button" class="btn btn-primary" onclick="directWhatsAppOrder('${item.id}', this)" ${actionDisabled}>
                        <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
                        <span>${translations[lang].orderNow}</span>
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="addToCart('${item.id}', this)" ${actionDisabled}>
                        <i class="fa-solid fa-cart-plus" aria-hidden="true"></i>
                        <span>${translations[lang].addToOrder}</span>
                    </button>
                </div>
            </div>
        `;
        menuGrid.appendChild(card);
    });
}

// ==========================================================================
// 10. Search Input Management
// ==========================================================================
function handleSearch(e) {
    searchQuery = e.target.value;
    if (searchQuery.length > 0) {
        searchClear.classList.add("show");
    } else {
        searchClear.classList.remove("show");
    }
    renderMenuItems();
}

function clearSearch() {
    searchInput.value = "";
    searchQuery = "";
    searchClear.classList.remove("show");
    renderMenuItems();
    searchInput.focus();
}

// ==========================================================================
// 11. Shopping Cart Drawer Manager
// ==========================================================================
window.addToCart = function(itemId, buttonEl) {
    const item = menuItemsList.find(i => i.id === itemId);
    if (!item || item.isAvailable === false) return;

    triggerButtonPressEffect(buttonEl);
    
    // Check item existence
    const cartItem = cart.find(i => i.id === itemId);
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            quantity: 1
        });
    }
    
    saveCartToStorage();
    renderCart();
    
    // Bounce badges
    animateBadge(cartCountBadge);
    animateBadge(floatingCartBadge);

    // Toast
    showToast(translations[currentLanguage].itemAdded);
};

function animateBadge(badge) {
    badge.style.transform = "scale(1.4)";
    setTimeout(() => {
        badge.style.transform = "scale(1)";
    }, 200);
}

function triggerButtonPressEffect(button) {
    if (!button) return;
    button.classList.remove("button-press");
    void button.offsetWidth;
    button.classList.add("button-press");
    setTimeout(() => button.classList.remove("button-press"), 200);
}

// Toast
function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;
    
    Object.assign(toast.style, {
        position: "fixed",
        bottom: "100px",
        left: "50%",
        transform: "translateX(-50%) translateY(20px)",
        backgroundColor: "rgba(212, 175, 55, 0.95)",
        color: "#0A0A0A",
        padding: "12px 24px",
        borderRadius: "30px",
        fontWeight: "700",
        fontSize: "0.9rem",
        zIndex: "999",
        boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
        opacity: "0",
        transition: "all var(--transition-normal)",
        pointerEvents: "none"
    });
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(-50%) translateY(0)";
    }, 50);
    
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(-20px)";
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2500);
}

window.changeQuantity = function(itemId, amount) {
    const cartItem = cart.find(i => i.id === itemId);
    if (!cartItem) return;
    
    cartItem.quantity += amount;
    
    if (cartItem.quantity <= 0) {
        removeFromCart(itemId);
    } else {
        saveCartToStorage();
        renderCart();
    }
};

window.removeFromCart = function(itemId) {
    cart = cart.filter(i => i.id !== itemId);
    saveCartToStorage();
    renderCart();
};

function renderCart() {
    const lang = currentLanguage;
    const currencySymbol = restaurantConfig.currency[lang] || restaurantConfig.currency.en || translations[lang].currency;
    
    if (cart.length === 0) {
        cartItemsContainer.classList.add("hidden");
        cartEmptyState.classList.remove("hidden");
        cartTotalValue.textContent = `0.00 ${currencySymbol}`;
        cartCountBadge.textContent = "0";
        floatingCartBadge.textContent = "0";
        floatingCartBadge.classList.add("hidden");
    } else {
        cartItemsContainer.classList.remove("hidden");
        cartEmptyState.classList.add("hidden");
        cartItemsContainer.innerHTML = "";
        
        let total = 0;
        let totalItemsCount = 0;
        
        cart.forEach(cartItem => {
            const item = menuItemsList.find(i => i.id === cartItem.id);
            if (!item) return;
            
            const itemTotal = item.price * cartItem.quantity;
            total += itemTotal;
            totalItemsCount += cartItem.quantity;
            
            const cartItemEl = document.createElement("div");
            cartItemEl.className = "cart-item";
            
            cartItemEl.innerHTML = `
                <img src="${item.imageUrl || ''}" alt="${item.name[lang] || item.name.en}" class="cart-item-img">
                <div class="cart-item-info">
                    <div>
                        <h4 class="cart-item-title">${item.name[lang] || item.name.en}</h4>
                        <span class="cart-item-price">${Number(item.price).toFixed(2)} ${currencySymbol}</span>
                    </div>
                    <div class="cart-item-controls">
                        <div class="quantity-controller">
                            <button class="btn-qty" onclick="changeQuantity('${item.id}', -1)" aria-label="Decrease quantity">
                                <i class="fa-solid fa-minus"></i>
                            </button>
                            <span class="qty-val">${cartItem.quantity}</span>
                            <button class="btn-qty" onclick="changeQuantity('${item.id}', 1)" aria-label="Increase quantity">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </div>
                        <button class="btn-cart-remove" onclick="removeFromCart('${item.id}')" aria-label="Remove item">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemEl);
        });
        
        cartTotalValue.textContent = `${total.toFixed(2)} ${currencySymbol}`;
        cartCountBadge.textContent = totalItemsCount;
        floatingCartBadge.textContent = totalItemsCount;
        floatingCartBadge.classList.remove("hidden");
    }
}

// Storage helpers
function saveCartToStorage() {
    localStorage.setItem(`tasteMenuCart_${activeRestaurantId}`, JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem(`tasteMenuCart_${activeRestaurantId}`);
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            renderCart();
        } catch (e) {
            cart = [];
        }
    }
}

// ==========================================================================
// 12. Quick Direct Single-Item Order
// ==========================================================================
window.directWhatsAppOrder = function(itemId, buttonEl) {
    const item = menuItemsList.find(i => i.id === itemId);
    if (!item) return;

    triggerButtonPressEffect(buttonEl);
    
    const lang = currentLanguage;
    const phone = restaurantConfig.whatsappNumber || translations[lang].whatsappNumber;
    const currencySymbol = restaurantConfig.currency[lang] || restaurantConfig.currency.en || translations[lang].currency;
    
    // Log item ordered click
    triggerItemOrderClickTracker(itemId);
    triggerWhatsAppClicksTracker();

    let text = translations[lang].singleOrderText
        .replace("{item}", item.name[lang] || item.name.en)
        .replace("{price}", Number(item.price).toFixed(2))
        .replace("{currency}", currencySymbol);
        
    const waUrl = `https://wa.me/${phone.replace(/\+/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
};

// Checkout entire cart
function checkoutCartToWhatsApp() {
    if (cart.length === 0) return;
    
    const lang = currentLanguage;
    const phone = restaurantConfig.whatsappNumber || translations[lang].whatsappNumber;
    const currencySymbol = restaurantConfig.currency[lang] || restaurantConfig.currency.en || translations[lang].currency;
    
    triggerWhatsAppClicksTracker();

    let text = "";
    
    if (lang === "en") {
        text += `👑 *${restaurantConfig.name.en} - Digital Order*\n`;
        text += "--------------------------------------\n";
        text += "Hello, I would like to place the following order:\n\n";
        
        let total = 0;
        cart.forEach(cartItem => {
            const item = menuItemsList.find(i => i.id === cartItem.id);
            if (item) {
                const subtotal = item.price * cartItem.quantity;
                total += subtotal;
                triggerItemOrderClickTracker(item.id); // log click for each item in checkout
                text += `▪️ *${cartItem.quantity} x ${item.name.en}* - (${Number(item.price).toFixed(2)} ${currencySymbol})\n`;
            }
        });
        
        text += "\n--------------------------------------\n";
        text += `💰 *Total Amount:* ${total.toFixed(2)} ${currencySymbol}\n`;
        text += "📍 *Type:* Delivery / Pickup (Please confirm)\n";
        text += "Please confirm and estimate preparation time. Thanks!";
    } else {
        text += `👑 *${restaurantConfig.name.ar || restaurantConfig.name.en} - طلب جديد*\n`;
        text += "--------------------------------------\n";
        text += "مرحباً، أود تسجيل طلب المأكولات التالي:\n\n";
        
        let total = 0;
        cart.forEach(cartItem => {
            const item = menuItemsList.find(i => i.id === cartItem.id);
            if (item) {
                const subtotal = item.price * cartItem.quantity;
                total += subtotal;
                triggerItemOrderClickTracker(item.id);
                text += `▪️ *${cartItem.quantity} x ${item.name.ar || item.name.en}* - (${Number(item.price).toFixed(2)} ${currencySymbol})\n`;
            }
        });
        
        text += "\n--------------------------------------\n";
        text += `💰 *المجموع الإجمالي:* ${total.toFixed(2)} ${currencySymbol}\n`;
        text += "📍 *نوع الطلب:* توصيل / استلام (الرجاء التأكيد)\n";
        text += "يرجى تأكيد الطلب وتحديد الوقت المقدر للتحضير. شكراً لكم!";
    }
    
    const waUrl = `https://wa.me/${phone.replace(/\+/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
}

// ==========================================================================
// 13. Event Listeners Setup
// ==========================================================================
function setupEventListeners() {
    themeToggle?.addEventListener("click", (event) => {
        triggerButtonPressEffect(event.currentTarget);
        toggleTheme();
    });

    langToggle.addEventListener("click", (event) => {
        triggerButtonPressEffect(event.currentTarget);
        toggleLanguage();
    });

    // Setup main category "All" button
    const catAllBtn = document.querySelector(".category-btn[data-category='all']");
    if (catAllBtn) {
        catAllBtn.addEventListener("click", handleCategorySelect);
    }

    searchInput.addEventListener("input", handleSearch);
    searchClear.addEventListener("click", (event) => {
        triggerButtonPressEffect(event.currentTarget);
        clearSearch();
    });

    // Cart Sidebar sliders
    const openCartDrawer = () => {
        cartDrawer.classList.add("active");
        document.body.style.overflow = "hidden";
    };
    
    const closeCartDrawer = () => {
        cartDrawer.classList.remove("active");
        document.body.style.overflow = "";
    };

    cartToggle.addEventListener("click", (event) => {
        triggerButtonPressEffect(event.currentTarget);
        openCartDrawer();
    });
    cartClose.addEventListener("click", (event) => {
        triggerButtonPressEffect(event.currentTarget);
        closeCartDrawer();
    });
    document.querySelector(".cart-overlay").addEventListener("click", closeCartDrawer);

    // Floating Button action
    floatingWhatsappBtn.addEventListener("click", (event) => {
        triggerButtonPressEffect(event.currentTarget);
        if (cart.length > 0) {
            openCartDrawer();
        } else {
            const lang = currentLanguage;
            const phone = restaurantConfig.whatsappNumber || translations[lang].whatsappNumber;
            const greetText = lang === "en" ? 
                `Hello! I am browsing your digital menu. Can you help me?` : 
                `مرحباً! أتصفح قائمتكم الرقمية حالياً، هل يمكنك مساعدتي؟`;
            window.open(`https://wa.me/${phone.replace(/\+/g, '')}?text=${encodeURIComponent(greetText)}`, "_blank");
        }
    });

    whatsappCheckoutBtn.addEventListener("click", (event) => {
        triggerButtonPressEffect(event.currentTarget);
        checkoutCartToWhatsApp();
    });
}
