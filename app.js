/**
 * Taste Restaurant - Premium Digital Menu Web App
 * Features: Bilingual Toggle (EN/AR RTL), Search Filter, Category Navigation, Cart Drawer, WhatsApp Order
 */

// 1. Menu Items Database
const menuItems = [
    {
        id: "truffle-burger",
        category: "burgers",
        price: 8.0,
        image: "assets/truffle_burger.png",
        name: {
            en: "Truffle Burger",
            ar: "برغر الترفل"
        },
        description: {
            en: "Juicy Angus beef, premium black truffle aioli, melted Swiss cheese, and caramelized onions on a toasted brioche bun.",
            ar: "لحم أنجوس مشوي، صلصة الترافل الأسود الفاخرة، جبن سويسري ذائب، وبصل مكرمل في خبز البريوش الطازج."
        },
        tags: {
            en: ["Premium", "Chef's Special"],
            ar: ["فاخر", "مميز"]
        }
    },
    {
        id: "cheese-burger",
        category: "burgers",
        price: 7.0,
        image: "assets/cheese_burger.png",
        name: {
            en: "Cheese Burger",
            ar: "برغر الجبن"
        },
        description: {
            en: "Premium beef patty, melting cheddar cheese, fresh crisp lettuce, vine-ripened tomatoes, and our signature special sauce.",
            ar: "شريحة لحم بقري فاخر، جبنة شيدر ذائبة، خس طازج، طماطم، وصلصة تيست الخاصة."
        },
        tags: {
            en: ["Classic"],
            ar: ["كلاسيكي"]
        }
    },
    {
        id: "margherita-pizza",
        category: "pizza",
        price: 9.0,
        image: "assets/margherita_pizza.png",
        name: {
            en: "Margherita Pizza",
            ar: "بيتزا مارغريتا"
        },
        description: {
            en: "Artisan pizza crust topped with rich tomato sauce, fresh buffalo mozzarella, aromatic fresh basil leaves, and a drizzle of extra virgin olive oil.",
            ar: "عجينة البيتزا الحرفية تعلوها صلصة الطماطم الغنية، جبنة الموزاريلا الطازجة، أوراق الريحان العطرية ورشة من زيت الزيتون البكر."
        },
        tags: {
            en: ["Vegetarian", "Artisan"],
            ar: ["نباتي", "حرفية"]
        }
    },
    {
        id: "pepperoni-pizza",
        category: "pizza",
        price: 10.0,
        image: "assets/pepperoni_pizza.png",
        name: {
            en: "Pepperoni Pizza",
            ar: "بيتزا بيبروني"
        },
        description: {
            en: "Classic Italian crust loaded with premium spicy beef pepperoni, mozzarella cheese, fresh oregano, and an optional touch of hot honey.",
            ar: "عجينة إيطالية كلاسيكية مغطاة بقطع البيبروني البقري الحار، جبنة الموزاريلا، الأوريغانو الطازج مع لمسة عسل حار اختيارية."
        },
        tags: {
            en: ["Spicy"],
            ar: ["حار"]
        }
    },
    {
        id: "golden-mojito",
        category: "drinks",
        price: 3.0,
        image: "assets/golden_mojito.png",
        name: {
            en: "Golden Mojito",
            ar: "موهيتو ذهبي"
        },
        description: {
            en: "A refreshing blend of fresh lime, wild mint, sparkling club soda, and edible 24K gold flakes for a touch of luxury.",
            ar: "مزيج منعش من الليمون الأخضر، النعناع البري، صودا فوارة ورقاقات الذهب عيار 24 القابلة للأكل لمسة من الفخامة."
        },
        tags: {
            en: ["Signature", "Cold"],
            ar: ["توقيعنا", "بارد"]
        }
    },
    {
        id: "orange-juice",
        category: "drinks",
        price: 2.5,
        image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80",
        name: {
            en: "Fresh Orange Juice",
            ar: "عصير برتقال طازج"
        },
        description: {
            en: "100% freshly squeezed sweet oranges, served chilled on ice. Packed with Vitamin C and natural energy.",
            ar: "عصير برتقال طبيعي 100% معصور طازجاً، يقدم مبرداً مع الثلج. غني بفيتامين سي والطاقة الطبيعية."
        },
        tags: {
            en: ["Fresh", "Cold"],
            ar: ["طازج", "بارد"]
        }
    },
    {
        id: "kunafa-cheesecake",
        category: "desserts",
        price: 5.0,
        image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&q=80",
        name: {
            en: "Pistachio Kunafa Cheesecake",
            ar: "تشيز كيك الكنافة بالفستق"
        },
        description: {
            en: "An exquisite fusion of creamy New York cheesecake layered with crispy, golden Arabic kunafa, topped with rich pistachio sauce.",
            ar: "اندماج فاخر بين التشيز كيك الكريمي الغني وعجينة الكنافة الذهبية المقرمشة، مغطاة بصلصة الفستق الحلبي الفاخرة."
        },
        tags: {
            en: ["Best Seller", "Fusion"],
            ar: ["الأكثر مبيعاً", "مبتكر"]
        }
    },
    {
        id: "lava-cake",
        category: "desserts",
        price: 4.0,
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
        name: {
            en: "Chocolate Lava Cake",
            ar: "كيك الشوكولاتة البركانية"
        },
        description: {
            en: "Warm chocolate cake with a molten, liquid chocolate center, lightly dusted with cocoa and served with premium vanilla ice cream.",
            ar: "كيك الشوكولاتة الدافئ مع قلب من الشوكولاتة السائلة الذائبة، مرشوش بالكاكاو ويقدم مع آيس كريم الفانيليا الفاخر."
        },
        tags: {
            en: ["Warm", "Sweet"],
            ar: ["دافئ", "حلو"]
        }
    }
];

// 2. Bilingual Static Translations Dictionary
const translations = {
    en: {
        title: "Taste Restaurant - Premium Digital Menu",
        slogan: "Fresh & Delicious Every Day",
        searchPlaceholder: "Search menu items...",
        catAll: "All Menu",
        catBurgers: "Burgers",
        catPizza: "Pizza",
        catDrinks: "Drinks",
        catDesserts: "Desserts",
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
        singleOrderText: "Hello Taste Restaurant, I would like to order: 1 x {item} ({price} JD). Please confirm.",
        whatsappNumber: "+970599123456"
    },
    ar: {
        title: "مطعم تيست - قائمة الطعام الرقمية المميزة",
        slogan: "طازج ولذيذ كل يوم",
        searchPlaceholder: "ابحث عن طبق...",
        catAll: "القائمة الكاملة",
        catBurgers: "البرغر",
        catPizza: "البيتزا",
        catDrinks: "المشروبات",
        catDesserts: "الحلويات",
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
        singleOrderText: "مرحباً مطعم تيست، أود طلب: 1 x {item} بسعر ({price} دينار). يرجى تأكيد الطلب.",
        whatsappNumber: "+970599123456"
    }
};

// 3. Application State
let currentLanguage = "en";
let currentCategory = "all";
let searchQuery = "";
let cart = [];

// DOM Elements
const menuGrid = document.getElementById("menu-grid");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("menu-search");
const searchClear = document.getElementById("search-clear");
const categoryBtns = document.querySelectorAll(".category-btn");
const currentCategoryTitle = document.getElementById("current-category-title");
const itemsCountDisplay = document.getElementById("items-count");
const langToggle = document.getElementById("lang-toggle");

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

// Initialize Website
document.addEventListener("DOMContentLoaded", () => {
    // Check local storage for language preference
    const savedLanguage = localStorage.getItem("tasteMenuLang");
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
        currentLanguage = savedLanguage;
    } else {
        // Auto detect browser language
        const browserLang = navigator.language.substring(0, 2);
        currentLanguage = browserLang === "ar" ? "ar" : "en";
    }

    // Set Initial Language UI
    applyLanguage(currentLanguage);
    
    // Load Cart from localStorage
    loadCartFromStorage();
    
    // Setup Listeners
    setupEventListeners();
    
    // Setup dynamic QR code
    setupQrCode();
});

// Setup QR code generation using free dynamic QR API
function setupQrCode() {
    let currentUrl = window.location.href;
    
    // Fallback if running on local file system or local server
    if (currentUrl.includes("127.0.0.1") || currentUrl.includes("localhost") || currentUrl.startsWith("file:///")) {
        currentUrl = "https://taste-restaurant.github.io/";
    }
    
    // Generate URL: d4af37 (gold color), 0A0A0A (dark background matching footer)
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=d4af37&bgcolor=060606&data=${encodeURIComponent(currentUrl)}`;
    if (qrCodeImg) {
        qrCodeImg.src = qrApiUrl;
    }
}

// 4. Translate/Language Manager
function applyLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem("tasteMenuLang", lang);

    // Update HTML Tag attributes
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    
    // Update Title tag
    document.title = translations[lang].title;

    // Toggle Button Styles & Texts
    const langTextEl = langToggle.querySelector(".lang-text");
    if (langTextEl) {
        langTextEl.textContent = lang === "en" ? "العربية" : "English";
    }
    langToggle.setAttribute("data-tooltip", lang === "en" ? "التحويل للعربية" : "Switch to English");

    // Scan DOM for elements with translation tags
    document.querySelectorAll("[data-translate]").forEach(elem => {
        const key = elem.getAttribute("data-translate");
        if (translations[lang][key]) {
            elem.textContent = translations[lang][key];
        }
    });

    // Update Placeholders
    document.querySelectorAll("[data-translate-placeholder]").forEach(elem => {
        const key = elem.getAttribute("data-translate-placeholder");
        if (translations[lang][key]) {
            elem.setAttribute("placeholder", translations[lang][key]);
        }
    });

    // Translate category active titles dynamically
    updateCategoryTitleText();

    // Render Menu grid items with selected language values
    renderMenuItems();

    // Refresh Cart Rendering to apply dynamic currency translations
    renderCart();
}

function updateCategoryTitleText() {
    if (currentCategoryTitle) {
        const keyMap = {
            all: "catAll",
            burgers: "catBurgers",
            pizza: "catPizza",
            drinks: "catDrinks",
            desserts: "catDesserts"
        };
        const key = keyMap[currentCategory];
        currentCategoryTitle.textContent = translations[currentLanguage][key];
    }
}

// Toggle language event handler
function toggleLanguage() {
    const nextLang = currentLanguage === "en" ? "ar" : "en";
    applyLanguage(nextLang);
}

// 5. Render Menu Items Grid
function renderMenuItems() {
    menuGrid.innerHTML = "";
    
    // Filter Items by category and search query
    const filteredItems = menuItems.filter(item => {
        // Category Filter
        const matchesCategory = currentCategory === "all" || item.category === currentCategory;
        
        // Search Filter
        const searchLower = searchQuery.toLowerCase().trim();
        if (!searchLower) return matchesCategory;

        const nameEN = item.name.en.toLowerCase();
        const nameAR = item.name.ar;
        const descEN = item.description.en.toLowerCase();
        const descAR = item.description.ar;
        
        const matchesSearch = nameEN.includes(searchLower) || 
                              nameAR.includes(searchLower) ||
                              descEN.includes(searchLower) ||
                              descAR.includes(searchLower);
                              
        return matchesCategory && matchesSearch;
    });

    // Show/Hide Empty State
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
        card.className = "menu-card animate-slide-up";
        card.style.animationDelay = `${index * 0.05}s`;
        
        const lang = currentLanguage;
        const currencySymbol = translations[lang].currency;
        
        // Render custom tags
        let tagsHtml = "";
        if (item.tags && item.tags[lang]) {
            item.tags[lang].forEach(tag => {
                tagsHtml += `<span class="tag-badge">${tag}</span>`;
            });
        }

        card.innerHTML = `
            <div class="card-img-container">
                <img src="${item.image}" alt="${item.name[lang]}" class="menu-card-img skeleton" onload="this.classList.remove('skeleton')">
                <span class="card-price-badge">${item.price} ${currencySymbol}</span>
            </div>
            <div class="card-info">
                <div class="card-title-row">
                    <h3 class="card-title">${item.name[lang]}</h3>
                </div>
                <p class="card-description">${item.description[lang]}</p>
                <div class="card-actions">
                    <button class="btn-card-order btn-primary-gold" onclick="addToCart('${item.id}')">
                        <i class="fa-solid fa-cart-plus"></i>
                        <span>${translations[lang].addToOrder}</span>
                    </button>
                    <button class="btn-card-order btn-secondary-whatsapp" onclick="directWhatsAppOrder('${item.id}')">
                        <i class="fa-brands fa-whatsapp"></i>
                        <span>${translations[lang].orderNow}</span>
                    </button>
                </div>
            </div>
        `;
        menuGrid.appendChild(card);
    });
}

// 6. Category Selection Manager
function handleCategorySelect(e) {
    const btn = e.currentTarget;
    const category = btn.getAttribute("data-category");
    
    // Update active class
    categoryBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    
    // Set category state and reload
    currentCategory = category;
    updateCategoryTitleText();
    renderMenuItems();

    // Scroll to menu section header smoothly
    const offset = 140;
    const element = document.querySelector(".menu-main");
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - offset;
    
    window.scrollTo({
         top: offsetPosition,
         behavior: "smooth"
    });
}

// 7. Search Matching Manager
function handleSearch(e) {
    searchQuery = e.target.value;
    
    // Toggle Search Clear Button visibility
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

// 8. Shopping Cart Manager & WhatsApp Compiler
window.addToCart = function(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;
    
    // Check if item is already in cart
    const cartItem = cart.find(i => i.id === itemId);
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            quantity: 1
        });
    }
    
    // Save Cart, render cart, update badges
    saveCartToStorage();
    renderCart();
    
    // Animate cart badges
    animateBadge(cartCountBadge);
    animateBadge(floatingCartBadge);

    // Show temporary toast notification for item added
    showToast(translations[currentLanguage].itemAdded);
};

function animateBadge(badge) {
    badge.style.transform = "scale(1.4)";
    setTimeout(() => {
        badge.style.transform = "scale(1)";
    }, 200);
}

// Show standard elegant toast alert
function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;
    
    // CSS for dynamic Toast insertion
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
    
    // Trigger transition
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(-50%) translateY(0)";
    }, 50);
    
    // Fade out and remove
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
    
    // If quantity is zero or less, remove item
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
    const currencySymbol = translations[lang].currency;
    
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
            const item = menuItems.find(i => i.id === cartItem.id);
            if (!item) return;
            
            const itemTotal = item.price * cartItem.quantity;
            total += itemTotal;
            totalItemsCount += cartItem.quantity;
            
            const cartItemEl = document.createElement("div");
            cartItemEl.className = "cart-item";
            
            cartItemEl.innerHTML = `
                <img src="${item.image}" alt="${item.name[lang]}" class="cart-item-img">
                <div class="cart-item-info">
                    <div>
                        <h4 class="cart-item-title">${item.name[lang]}</h4>
                        <span class="cart-item-price">${item.price} ${currencySymbol}</span>
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

// LocalStorage helpers
function saveCartToStorage() {
    localStorage.setItem("tasteMenuCart", JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem("tasteMenuCart");
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            renderCart();
        } catch (e) {
            cart = [];
        }
    }
}

// 9. Quick Send Single-Item Order
window.directWhatsAppOrder = function(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;
    
    const lang = currentLanguage;
    const phone = translations[lang].whatsappNumber;
    
    let text = translations[lang].singleOrderText
        .replace("{item}", item.name[lang])
        .replace("{price}", item.price);
        
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
};

// Checkout multi-item cart to WhatsApp
function checkoutCartToWhatsApp() {
    if (cart.length === 0) return;
    
    const lang = currentLanguage;
    const phone = translations[lang].whatsappNumber;
    const currencySymbol = translations[lang].currency;
    
    let text = "";
    
    if (lang === "en") {
        text += "👑 *Taste Restaurant - Digital Order*\n";
        text += "--------------------------------------\n";
        text += "Hello Taste Restaurant, I would like to place the following order:\n\n";
        
        let total = 0;
        cart.forEach(cartItem => {
            const item = menuItems.find(i => i.id === cartItem.id);
            if (item) {
                const subtotal = item.price * cartItem.quantity;
                total += subtotal;
                text += `▪️ *${cartItem.quantity} x ${item.name.en}* - (${item.price} ${currencySymbol})\n`;
            }
        });
        
        text += "\n--------------------------------------\n";
        text += `💰 *Total Amount:* ${total.toFixed(2)} ${currencySymbol}\n`;
        text += "📍 *Type:* Delivery / Pickup (Please confirm)\n";
        text += "Please confirm and estimate preparation time. Thanks!";
    } else {
        text += "👑 *مطعم تيست - طلب جديد*\n";
        text += "--------------------------------------\n";
        text += "مرحباً مطعم تيست، أود تسجيل طلب المأكولات التالي:\n\n";
        
        let total = 0;
        cart.forEach(cartItem => {
            const item = menuItems.find(i => i.id === cartItem.id);
            if (item) {
                const subtotal = item.price * cartItem.quantity;
                total += subtotal;
                text += `▪️ *${cartItem.quantity} x ${item.name.ar}* - (${item.price} ${currencySymbol})\n`;
            }
        });
        
        text += "\n--------------------------------------\n";
        text += `💰 *المجموع الإجمالي:* ${total.toFixed(2)} ${currencySymbol}\n`;
        text += "📍 *نوع الطلب:* توصيل / استلام (الرجاء التأكيد)\n";
        text += "يرجى تأكيد الطلب وتحديد الوقت المقدر للتحضير. شكراً لكم!";
    }
    
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
}

// 10. Core Setup Event Listeners
function setupEventListeners() {
    // Language Toggle
    langToggle.addEventListener("click", toggleLanguage);

    // Category Buttons
    categoryBtns.forEach(btn => {
        btn.addEventListener("click", handleCategorySelect);
    });

    // Search input
    searchInput.addEventListener("input", handleSearch);
    searchClear.addEventListener("click", clearSearch);

    // Cart Drawer Toggle Actions
    const openCartDrawer = () => {
        cartDrawer.classList.add("active");
        document.body.style.overflow = "hidden"; // Prevent background scroll
    };
    
    const closeCartDrawer = () => {
        cartDrawer.classList.remove("active");
        document.body.style.overflow = ""; // Enable background scroll
    };

    cartToggle.addEventListener("click", openCartDrawer);
    cartClose.addEventListener("click", closeCartDrawer);
    document.querySelector(".cart-overlay").addEventListener("click", closeCartDrawer);

    // Floating Button Checkout
    floatingWhatsappBtn.addEventListener("click", () => {
        if (cart.length > 0) {
            openCartDrawer();
        } else {
            // If cart is empty, floating whatsapp button acts as direct line contact
            const lang = currentLanguage;
            const phone = translations[lang].whatsappNumber;
            const greetText = lang === "en" ? 
                "Hello Taste Restaurant! I am browsing your digital menu. Can you help me?" : 
                "مرحباً مطعم تيست! أتصفح قائمتكم الرقمية حالياً، هل يمكنك مساعدتي؟";
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(greetText)}`, "_blank");
        }
    });

    // Final Checkout Cart Trigger
    whatsappCheckoutBtn.addEventListener("click", checkoutCartToWhatsApp);
}
