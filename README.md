# Taste Restaurant - Premium Digital Menu

A luxurious, high-performance, and mobile-first responsive digital menu designed for upscale restaurants. Built entirely with vanilla **HTML5**, **CSS3**, and **JavaScript (ES6)**, it is lightweight, fast-loading, and completely ready for **GitHub Pages** deployment.

---

## Key Features

- 👑 **Luxury Aesthetic**: Sophisticated dark theme (`#0A0A0A`) with rich, warm gold accents (`#D4AF37`), subtle glows, and thin borders.
- 📱 **Mobile-First Responsive Layout**: Optimized for smartphone browsers when scanned via QR codes.
- 🌐 **Instant Bilingual Support**: Live toggle between English and Arabic without any page reloads, including full Right-to-Left (RTL) flipping.
- 🔍 **Bilingual Search Bar**: Instant query matching that handles both English and Arabic product names, descriptions, and categories.
- 🛍️ **Multi-Item WhatsApp Shopping Cart**: A slide-out cart drawer where customers can add multiple items, control quantities, see calculation totals, and send a beautifully formatted checkout message to the restaurant.
- ⚡ **Direct WhatsApp Order**: Direct single-click ordering from the food item card for instant single-dish queries.
- 🔗 **Dynamic QR Code Generator**: Renders a dynamic, gold-themed QR code in the footer pointing to the site's current deployment URL.
- 🎭 **Micro-Animations**: Elegant entrance slides, scaling, and hover effects that enhance user engagement.

---

## File Structure

```text
/
├── assets/                  # AI-generated food photography & logo
│   ├── logo.png             # Golden brand logo
│   ├── truffle_burger.png   # Truffle Burger image
│   ├── cheese_burger.png    # Cheese Burger image
│   ├── margherita_pizza.png # Margherita Pizza image
│   ├── pepperoni_pizza.png  # Pepperoni Pizza image
│   └── golden_mojito.png    # Golden Mojito image
├── index.html               # Semantic HTML structure & translation targets
├── styles.css               # Design system, glassmorphism, responsive grids, RTL adjustments
├── app.js                   # Menu database, translation strings, cart logic, WhatsApp encoders
└── README.md                # Deployment and customization documentation
```

---

## Customization Guide

### 1. Updating the WhatsApp Phone Number
To change the phone number where orders are received:
1. Open [app.js](file:///c:/Users/easy%20life/Desktop/menu/app.js).
2. Locate the static dictionary: `translations.en` and `translations.ar`.
3. Modify the `whatsappNumber` property to your restaurant's WhatsApp phone number (with the international country code, e.g., `+970599123456` or `+966500000000` without spaces, hyphens, or leading double zeros):
   ```javascript
   whatsappNumber: "+970599123456"
   ```

### 2. Modifying Menu Items
To add, edit, or remove menu items:
1. Open [app.js](file:///c:/Users/easy%20life/Desktop/menu/app.js).
2. Edit the `menuItems` array. Each object supports:
   - `id`: Unique identifier (string).
   - `category`: Matches one of the categories (`burgers`, `pizza`, `drinks`, `desserts`).
   - `price`: Double value (in JD or your configured currency).
   - `image`: Relative path to asset or online URL.
   - `name`: English (`en`) and Arabic (`ar`) translations.
   - `description`: English (`en`) and Arabic (`ar`) descriptions.
   - `tags`: Badge tags shown on top of cards.

### 3. Changing Currency
To change the currency notation:
1. Open [app.js](file:///c:/Users/easy%20life/Desktop/menu/app.js).
2. Change the `currency` property in the `translations` object for both `en` (e.g., `USD` or `SR`) and `ar` (e.g., `دولار` or `ر.س`).

---

## Deployment to GitHub Pages

Since this website is built with pure static files (HTML/CSS/JS), it can be hosted for free on GitHub Pages:

### Step 1: Initialize Git Local Repository
Open your terminal in the project directory and run:
```bash
git init
git add .
git commit -m "Initial commit of Taste Restaurant digital menu"
```

### Step 2: Push to GitHub
1. Create a new repository on GitHub (e.g., `taste-menu`).
2. Link your local repo to GitHub and push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/taste-menu.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Enable GitHub Pages
1. Go to your repository settings on GitHub.
2. In the sidebar, select **Pages** (under the "Code and automation" section).
3. Under **Build and deployment**, set the source to **Deploy from a branch**.
4. Select the `main` branch and folder `/ (root)`, then click **Save**.
5. After a few minutes, your site will be live at `https://YOUR_USERNAME.github.io/taste-menu/`!
6. The QR code at the bottom of the webpage will automatically update to point to your live URL.
