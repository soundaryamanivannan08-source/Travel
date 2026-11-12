# Wanderlust — Curated Luxury Travel & Hotel Booking Platform

A modern, responsive, high-performance travel booking home page created with pure **HTML5, CSS3, and Vanilla JavaScript**. Features rich interactive UI, live search filters, persistent LocalStorage wishlist, dynamic price calculations, and AOS (Animate On Scroll) animations.

---

## 📁 Project Structure

```
travel booking/
│
├── index.html              # Main semantic HTML5 markup & layout
├── css/
│   └── style.css           # Modern CSS3 stylesheet (Design tokens, Flexbox/Grid, Animations)
├── js/
│   ├── data.js             # Sample datasets (Destinations, Hotels, Offers, Reviews, Guides)
│   └── main.js             # Application logic, filters, validation, wishlist, modals, slider
├── assets/                 # Local assets folder
└── README.md               # Documentation & feature overview
```

---

## 🌟 Key Features & Sections

### 1. Header & Navigation
- **Sticky Glassmorphism Header:** Frosted glass effect with blur and subtle border on scroll.
- **Navigation Links:** Smooth scrolling to all core sections (*Destinations, Stays, Offers, Why Us, Reviews, Guides*).
- **Interactive Wishlist Counter:** Live badge counter with bounce micro-animation displaying saved hotels.
- **Multi-Currency Selector:** Dynamic currency converter supporting USD ($), EUR (€), GBP (£), JPY (¥), and AUD (A$).
- **Mobile Drawer Navigation:** Responsive slide-over drawer with backdrop blur for mobile and tablet devices.

### 2. Hero Section & Interactive Search Console
- **Destination Autocomplete:** Instant autocomplete dropdown suggesting top destinations and starting rates as you type.
- **Date Validation:**
  - Prevents selection of past dates.
  - Enforces Check-Out date to be strictly after Check-In date.
  - Automatically calculates and displays the duration in nights.
- **Guest & Room Stepper Popover:** Custom increment/decrement counters for Adults, Children, and Suites.
- **Live Price Estimation Preview:** Real-time preview of the estimated total stay cost right inside the search console.
- **Trending Shortcut Tags:** One-click shortcuts for Bali, Maldives, Paris, Swiss Alps, Santorini, and Japan.

### 3. Key Metrics & Trust Banner
- Live count metrics: **500+** Luxury Destinations, **10,000+** Handpicked Stays, **4.95/5** Average Rating, and **2.4M+** Travelers.

### 4. Popular Destinations (8 Curated Worldwide Locations)
- Filterable category pills: *All Destinations, Beach & Islands, World Metropolises, Mountain & Nature, Cultural Heritage*.
- Interactive destination cards featuring ratings, starting prices, and direct filter hot-links into hotel listings.

### 5. Special Promotional Offers (4 Exclusive Deals)
- Limited-time discounts: **SUMMERESCAPE25** (25% off), **LUXE30VIP** (30% off), **EARLYBIRD15** (15% off), **WEEKENDHONEY20** (20% off).
- **One-Click Coupon Copy:** Copies promo code to clipboard with visual feedback button state and toast notification.

### 6. Featured Hotels & Filter Engine (12 Luxury Stays)
- **Live Text Search:** Searches hotel name, city, destination, and country in real-time.
- **Destination Filter:** Dropdown to isolate specific regions.
- **Price Range Slider:** Drag slider to filter properties up to $700/night with live price readout.
- **Star & Guest Rating Filters:** Quick pills for All, 4.8+ ★, 4.9+ ★, and 5.0 ★ Exceptional.
- **Amenity Filters:** Multi-select chips for *Pool, Spa, Breakfast, Beachfront, Free WiFi*.
- **Sorting Options:** *Recommended, Price: Low to High, Price: High to Low, Top Rating, Most Reviewed*.
- **Interactive Hotel Cards:** Wishlist heart toggle, star ratings, review count, amenity tags, original vs. discounted rates, "Details", and "Book Now" buttons.

### 7. Why Choose Us (The Wanderlust Promise)
- Best Price Guarantee, 24/7 Global Concierge, Handpicked Luxury Quality Audit, and Free 48-Hour Cancellation.

### 8. Customer Testimonials Slider (6 Verified Reviews)
- Carousel with previous/next navigation buttons, active dot indicators, auto-play with pause-on-hover, verified traveler badges, and trip destination badges.

### 9. Travel Editorial & Inspiration Guides
- 3 curated articles with read times, categories, and cover imagery.

### 10. Newsletter Subscription
- Real-time regex email validation, feedback notifications, and LocalStorage persistence.

### 11. Interactive Modals & Drawers
- **Wishlist Slide-Out Drawer:** Shows all saved hotels from LocalStorage, allows deleting individual items, clearing all, or proceeding directly to book.
- **Dynamic Booking & Estimation Modal:**
  - Real-time calculation: `(Nightly Rate × Nights × Rooms) + Extra Guest Fee + 12% Hospitality Tax - Coupon Discount`.
  - Promo code validation against available offers.
  - Submits reservation and saves to LocalStorage (`wanderlust_bookings`).

### 12. Polish & Micro-Interactions
- **AOS (Animate On Scroll):** Elegant fade-up, zoom-in, and staggered card delays.
- **Floating Toast Notification System:** Slide-in alert widget for user feedback.
- **Back to Top Button:** Smooth scroll back to header when scrolled down.

---

## 🚀 How to Run the Project

1. Simply double-click or open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).
2. Alternatively, run a local development server (e.g. VS Code Live Server or Python `python -m http.server 8000`).
