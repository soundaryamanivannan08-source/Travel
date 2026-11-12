/**
 * WANDERLUST LUXURY TRAVEL - MAIN JAVASCRIPT
 * Pure Vanilla JavaScript: State Management, Dynamic Rendering, Filters, Date Validation, Wishlist, Slider, Modals
 */

document.addEventListener('DOMContentLoaded', () => {
  // ------------------------------------------------------------------
  // 1. Application State & Storage
  // ------------------------------------------------------------------
  const state = {
    currency: 'USD',
    rates: { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 155, AUD: 1.52 },
    currencySymbols: { USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$' },
    
    // Search params
    searchQuery: '',
    selectedDestination: 'all',
    destFilterCategory: 'all',
    
    // Dates
    checkInDate: '',
    checkOutDate: '',
    nights: 1,
    
    // Guests & Rooms
    adults: 2,
    children: 0,
    rooms: 1,
    
    // Hotel Filters
    hotelSearchText: '',
    hotelDestination: 'all',
    maxPrice: 700,
    minRating: 0,
    selectedAmenities: new Set(),
    sortBy: 'recommended',
    
    // Wishlist (Set of hotel IDs)
    wishlist: new Set(JSON.parse(localStorage.getItem('wanderlust_wishlist') || '[]')),
    
    // Active Hotel for Modal Booking
    activeHotel: null,
    appliedCoupon: null,
    
    // Testimonial slider
    currentTestimonialIndex: 0,
    testimonialTimer: null
  };

  // ------------------------------------------------------------------
  // 2. DOM Elements Cache
  // ------------------------------------------------------------------
  const header = document.getElementById('mainHeader');
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const mobileNavClose = document.getElementById('mobileNavClose');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');
  
  // Hero Search inputs
  const heroDestInput = document.getElementById('heroDestInput');
  const heroAutocomplete = document.getElementById('heroAutocomplete');
  const heroCheckIn = document.getElementById('heroCheckIn');
  const heroCheckOut = document.getElementById('heroCheckOut');
  const heroGuestTrigger = document.getElementById('heroGuestTrigger');
  const heroGuestPopover = document.getElementById('heroGuestPopover');
  const heroGuestDisplay = document.getElementById('heroGuestDisplay');
  const heroSearchBtn = document.getElementById('heroSearchBtn');
  const searchNightsTag = document.getElementById('searchNightsTag');
  const heroEstimateBox = document.getElementById('heroEstimatePrice');
  
  // Containers
  const destinationsGrid = document.getElementById('destinationsGrid');
  const destinationPillsContainer = document.getElementById('destinationPills');
  const hotelsGrid = document.getElementById('hotelsGrid');
  const offersGrid = document.getElementById('offersGrid');
  const testimonialsTrack = document.getElementById('testimonialsTrack');
  const sliderDotsContainer = document.getElementById('sliderDots');
  const travelTipsGrid = document.getElementById('travelTipsGrid');
  
  // Hotel Filter Elements
  const hotelSearchInput = document.getElementById('hotelSearchInput');
  const hotelDestSelect = document.getElementById('hotelDestSelect');
  const priceSlider = document.getElementById('priceSlider');
  const priceSliderValue = document.getElementById('priceSliderValue');
  const hotelSortSelect = document.getElementById('hotelSortSelect');
  const btnResetFilters = document.getElementById('btnResetFilters');
  const resultsCountEl = document.getElementById('resultsCount');
  
  // Wishlist Drawer Elements
  const btnWishlistNav = document.getElementById('btnWishlistNav');
  const wishlistBadge = document.getElementById('wishlistBadge');
  const wishlistDrawer = document.getElementById('wishlistDrawer');
  const wishlistCloseBtn = document.getElementById('wishlistCloseBtn');
  const wishlistItemsContainer = document.getElementById('wishlistItemsContainer');
  const wishlistCountText = document.getElementById('wishlistCountText');
  const btnClearWishlist = document.getElementById('btnClearWishlist');
  
  // Booking Modal Elements
  const bookingModal = document.getElementById('bookingModal');
  const bookingModalClose = document.getElementById('bookingModalClose');
  const bookingHotelThumb = document.getElementById('bookingHotelThumb');
  const bookingHotelTitle = document.getElementById('bookingHotelTitle');
  const bookingHotelLoc = document.getElementById('bookingHotelLoc');
  const bookingHotelRate = document.getElementById('bookingHotelRate');
  const bookingCheckIn = document.getElementById('bookingCheckIn');
  const bookingCheckOut = document.getElementById('bookingCheckOut');
  const bookingGuests = document.getElementById('bookingGuests');
  const bookingRooms = document.getElementById('bookingRooms');
  const bookingForm = document.getElementById('bookingReservationForm');
  const couponCodeInput = document.getElementById('couponCodeInput');
  const btnApplyCoupon = document.getElementById('btnApplyCoupon');
  const couponFeedback = document.getElementById('couponFeedback');
  
  // Booking breakdown elements
  const bkdBaseRate = document.getElementById('bkdBaseRate');
  const bkdNights = document.getElementById('bkdNights');
  const bkdStayTotal = document.getElementById('bkdStayTotal');
  const bkdTaxes = document.getElementById('bkdTaxes');
  const bkdDiscountRow = document.getElementById('bkdDiscountRow');
  const bkdDiscountAmount = document.getElementById('bkdDiscountAmount');
  const bkdFinalTotal = document.getElementById('bkdFinalTotal');
  
  // Newsletter Elements
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterEmail = document.getElementById('newsletterEmail');
  const newsletterFeedback = document.getElementById('newsletterFeedback');
  
  // Toast & Back to Top
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  const backToTopBtn = document.getElementById('backToTopBtn');
  const currencySelector = document.getElementById('currencySelector');

  // ------------------------------------------------------------------
  // 3. Currency & Pricing Helpers
  // ------------------------------------------------------------------
  function formatCurrency(amountUSD) {
    const rate = state.rates[state.currency] || 1;
    const symbol = state.currencySymbols[state.currency] || '$';
    const converted = Math.round(amountUSD * rate);
    return `${symbol}${converted.toLocaleString()}`;
  }

  function showToast(message, type = 'info') {
    if (!toastNotification || !toastMessage) return;
    toastMessage.textContent = message;
    toastNotification.className = `toast-notification show ${type}`;
    
    // Icon selection
    const icon = toastNotification.querySelector('i');
    if (icon) {
      if (type === 'success') icon.className = 'fa-solid fa-circle-check';
      else if (type === 'warning') icon.className = 'fa-solid fa-triangle-exclamation';
      else icon.className = 'fa-solid fa-circle-info';
    }

    setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 3800);
  }

  // ------------------------------------------------------------------
  // 4. Date Validation & Night Calculation
  // ------------------------------------------------------------------
  function initDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 3);

    const checkInString = today.toISOString().split('T')[0];
    const checkOutString = tomorrow.toISOString().split('T')[0];

    // Set min dates to prevent past selection
    if (heroCheckIn) {
      heroCheckIn.min = checkInString;
      heroCheckIn.value = checkInString;
      state.checkInDate = checkInString;
    }
    if (heroCheckOut) {
      heroCheckOut.min = checkInString;
      heroCheckOut.value = checkOutString;
      state.checkOutDate = checkOutString;
    }

    updateNightsCount();

    if (heroCheckIn) {
      heroCheckIn.addEventListener('change', (e) => {
        state.checkInDate = e.target.value;
        // Check-out must be at least 1 day after check-in
        const cin = new Date(state.checkInDate);
        cin.setDate(cin.getDate() + 1);
        const minOut = cin.toISOString().split('T')[0];
        heroCheckOut.min = minOut;

        if (new Date(state.checkOutDate) <= new Date(state.checkInDate)) {
          state.checkOutDate = minOut;
          heroCheckOut.value = minOut;
          showToast('Check-out date updated automatically to follow check-in.', 'info');
        }
        updateNightsCount();
      });
    }

    if (heroCheckOut) {
      heroCheckOut.addEventListener('change', (e) => {
        if (new Date(e.target.value) <= new Date(state.checkInDate)) {
          showToast('Check-out must be at least 1 day after check-in', 'warning');
          const cin = new Date(state.checkInDate);
          cin.setDate(cin.getDate() + 1);
          const minOut = cin.toISOString().split('T')[0];
          heroCheckOut.value = minOut;
          state.checkOutDate = minOut;
        } else {
          state.checkOutDate = e.target.value;
        }
        updateNightsCount();
      });
    }
  }

  function updateNightsCount() {
    if (!state.checkInDate || !state.checkOutDate) return;
    const start = new Date(state.checkInDate);
    const end = new Date(state.checkOutDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    state.nights = diffDays;

    if (searchNightsTag) {
      searchNightsTag.textContent = `${diffDays} night${diffDays > 1 ? 's' : ''}`;
    }

    // Update dynamic estimation preview
    updateHeroEstimationPreview();
  }

  function updateHeroEstimationPreview() {
    if (!heroEstimateBox) return;
    const avgRate = 220; // Average sample rate
    const estTotal = (avgRate * state.nights * state.rooms) + (state.adults > 2 ? (state.adults - 2) * 35 * state.nights : 0);
    heroEstimateBox.innerHTML = `<span>${formatCurrency(estTotal)}</span> for ${state.nights}N · ${state.rooms}R`;
  }

  // ------------------------------------------------------------------
  // 5. Guest & Room Selection Stepper
  // ------------------------------------------------------------------
  function updateGuestDisplay() {
    const text = `${state.adults} Adult${state.adults > 1 ? 's' : ''} · ${state.children} Child${state.children === 1 ? '' : 'ren'} · ${state.rooms} Room${state.rooms > 1 ? 's' : ''}`;
    if (heroGuestDisplay) heroGuestDisplay.textContent = text;
    updateHeroEstimationPreview();
  }

  function initGuestControls() {
    if (heroGuestTrigger) {
      heroGuestTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        heroGuestPopover.classList.toggle('show');
      });
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (heroGuestPopover && !heroGuestPopover.contains(e.target) && !heroGuestTrigger.contains(e.target)) {
        heroGuestPopover.classList.remove('show');
      }
      if (heroAutocomplete && !heroAutocomplete.contains(e.target) && !heroDestInput.contains(e.target)) {
        heroAutocomplete.classList.remove('show');
      }
    });

    // Steppers inside popover
    document.querySelectorAll('.guest-stepper').forEach(stepper => {
      const type = stepper.dataset.type; // adults, children, rooms
      const countEl = stepper.querySelector('.step-count');
      const btnMinus = stepper.querySelector('.btn-step-minus');
      const btnPlus = stepper.querySelector('.btn-step-plus');

      btnMinus.addEventListener('click', (e) => {
        e.stopPropagation();
        if (type === 'adults' && state.adults > 1) state.adults--;
        if (type === 'children' && state.children > 0) state.children--;
        if (type === 'rooms' && state.rooms > 1) state.rooms--;
        countEl.textContent = state[type];
        btnMinus.disabled = (type === 'adults' || type === 'rooms') ? state[type] <= 1 : state[type] <= 0;
        updateGuestDisplay();
      });

      btnPlus.addEventListener('click', (e) => {
        e.stopPropagation();
        if (type === 'adults' && state.adults < 12) state.adults++;
        if (type === 'children' && state.children < 8) state.children++;
        if (type === 'rooms' && state.rooms < 6) state.rooms++;
        countEl.textContent = state[type];
        btnMinus.disabled = false;
        updateGuestDisplay();
      });
    });
  }

  // ------------------------------------------------------------------
  // 6. Destination Autocomplete & Hero Search
  // ------------------------------------------------------------------
  function initHeroSearch() {
    if (!heroDestInput || !heroAutocomplete) return;

    heroDestInput.addEventListener('input', (e) => {
      const val = e.target.value.toLowerCase().trim();
      if (!val) {
        heroAutocomplete.classList.remove('show');
        return;
      }

      const matches = sampleDestinations.filter(d => 
        d.name.toLowerCase().includes(val) || 
        d.country.toLowerCase().includes(val) || 
        d.tag.toLowerCase().includes(val)
      );

      if (matches.length > 0) {
        heroAutocomplete.innerHTML = matches.map(d => `
          <div class="autocomplete-item" data-name="${d.name}">
            <div class="autocomplete-icon"><i class="fa-solid fa-location-dot"></i></div>
            <div>
              <div class="autocomplete-text">${d.name}, ${d.country}</div>
              <div class="autocomplete-sub">${d.tag} · From ${formatCurrency(d.startingPrice)}/night</div>
            </div>
          </div>
        `).join('');
        heroAutocomplete.classList.add('show');
      } else {
        heroAutocomplete.innerHTML = `
          <div class="autocomplete-item" style="cursor: default; opacity: 0.7;">
            <div class="autocomplete-text">No matching destinations found</div>
          </div>
        `;
        heroAutocomplete.classList.add('show');
      }
    });

    heroAutocomplete.addEventListener('click', (e) => {
      const item = e.target.closest('.autocomplete-item');
      if (item && item.dataset.name) {
        heroDestInput.value = item.dataset.name;
        state.selectedDestination = item.dataset.name;
        heroAutocomplete.classList.remove('show');
      }
    });

    if (heroSearchBtn) {
      heroSearchBtn.addEventListener('click', () => {
        const query = heroDestInput ? heroDestInput.value.trim() : '';

        // Validation 1: Destination required
        if (!query) {
          showToast('Please enter a destination to search (e.g. Bali, Paris, Maldives).', 'warning');
          if (heroDestInput) heroDestInput.focus();
          return;
        }

        // Validation 2: Check-in & Check-out dates
        if (heroCheckIn && heroCheckOut) {
          if (!heroCheckIn.value || !heroCheckOut.value) {
            showToast('Please select valid check-in and check-out dates.', 'warning');
            return;
          }
          const cin = new Date(heroCheckIn.value);
          const cout = new Date(heroCheckOut.value);
          if (cout <= cin) {
            showToast('Check-out date must be after check-in date.', 'warning');
            return;
          }
        }

        showToast(`Searching luxury stays in "${query}"... Redirecting...`, 'info');
        setTimeout(() => {
          window.location.href = '404.html';
        }, 450);
      });
    }

    if (heroDestInput) {
      heroDestInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (heroSearchBtn) heroSearchBtn.click();
        }
      });
    }

    // Quick tag buttons in Hero -> Redirect to 404.html
    document.querySelectorAll('.quick-tag-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '404.html';
      });
    });

    // Handle incoming URL search queries (e.g. from 404 page)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const destParam = urlParams.get('dest');
      if (destParam) {
        const trimmed = destParam.trim();
        if (heroDestInput) heroDestInput.value = trimmed;
        if (hotelSearchInput) hotelSearchInput.value = trimmed;
        state.hotelSearchText = trimmed;
        applyHotelFilters();
        setTimeout(() => {
          const target = document.getElementById('hotelsSection');
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        }, 600);
      }
    } catch (e) {
      // Ignore URL search parsing error
    }
  }

  // ------------------------------------------------------------------
  // 7. Render Popular Destinations & Category Filter
  // ------------------------------------------------------------------
  function renderDestinations() {
    if (!destinationsGrid) return;

    const filtered = state.destFilterCategory === 'all'
      ? sampleDestinations
      : sampleDestinations.filter(d => d.category === state.destFilterCategory);

    destinationsGrid.innerHTML = filtered.map((d, index) => `
      <div class="destination-card" data-aos="fade-up" data-aos-delay="${(index % 4) * 100}" data-dest-name="${d.name}">
        <img class="destination-card-img" src="${d.image}" alt="${d.name}, ${d.country}" loading="lazy">
        <div class="destination-card-overlay">
          <div class="destination-card-top">
            <span class="destination-tag-badge">${d.tag}</span>
            <span class="destination-rating-badge"><i class="fa-solid fa-star"></i> ${d.rating}</span>
          </div>
          <div class="destination-card-bottom">
            <div class="dest-country">${d.country}</div>
            <h3 class="dest-name">${d.name}</h3>
            <div class="dest-details-row">
              <div class="dest-price-from">Starts <span>${formatCurrency(d.startingPrice)}</span> /nt</div>
              <button class="dest-explore-btn btn-explore-dest" data-dest="${d.name}">
                Explore ${d.hotelsCount}+ Stays <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Attach click events on destination cards to redirect to 404.html
    document.querySelectorAll('.btn-explore-dest').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '404.html';
      });
    });

    document.querySelectorAll('.destination-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '404.html';
      });
    });
  }

  function initDestinationPills() {
    if (!destinationPillsContainer) return;
    destinationPillsContainer.querySelectorAll('.dest-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '404.html';
      });
    });
  }

  // ------------------------------------------------------------------
  // 8. Render Special Promotional Offers & Coupon Copying
  // ------------------------------------------------------------------
  function renderPromotionalOffers() {
    if (!offersGrid) return;

    offersGrid.innerHTML = samplePromotionalOffers.map((offer, index) => `
      <div class="offer-card" data-aos="fade-up" data-aos-delay="${index * 120}">
        <div class="offer-header-banner" style="background: ${offer.bgGradient}">
          <img src="${offer.image}" alt="${offer.title}" loading="lazy">
          <span class="offer-badge-floating"><i class="fa-solid fa-fire"></i> ${offer.tag}</span>
          <span class="offer-discount-ribbon">${offer.discountPercent}% OFF</span>
        </div>
        <div class="offer-body">
          <h3 class="offer-title">${offer.title}</h3>
          <div class="offer-subtitle">${offer.subtitle}</div>
          <p class="offer-desc">${offer.description}</p>
          
          <div class="offer-coupon-box">
            <span class="coupon-code-text" id="code-${offer.id}">${offer.code}</span>
            <button class="btn-copy-coupon" data-code="${offer.code}">
              <i class="fa-regular fa-copy"></i> <span>Copy Code</span>
            </button>
          </div>

          <div class="offer-validity">
            <i class="fa-regular fa-clock"></i> Valid until ${offer.validUntil} (Min ${offer.minNights} night${offer.minNights > 1 ? 's' : ''})
          </div>
        </div>
      </div>
    `).join('');

    // Attach listeners -> redirect to 404.html
    document.querySelectorAll('.btn-copy-coupon').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '404.html';
      });
    });
  }

  // ------------------------------------------------------------------
  // 9. Featured Hotels Filtering & Rendering
  // ------------------------------------------------------------------
  function applyHotelFilters() {
    let list = [...sampleHotels];

    // 1. Text Search (title, destination, city, country)
    if (state.hotelSearchText) {
      const q = state.hotelSearchText.toLowerCase().trim();
      list = list.filter(h => 
        h.name.toLowerCase().includes(q) ||
        h.destination.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.country.toLowerCase().includes(q)
      );
    }

    // 2. Destination Dropdown
    if (state.hotelDestination !== 'all') {
      list = list.filter(h => h.destinationId === state.hotelDestination);
    }

    // 3. Price Filter (<= maxPrice)
    list = list.filter(h => h.pricePerNight <= state.maxPrice);

    // 4. Rating Filter
    if (state.minRating > 0) {
      list = list.filter(h => h.guestRating >= state.minRating);
    }

    // 5. Selected Amenities
    if (state.selectedAmenities.size > 0) {
      list = list.filter(h => {
        for (const amenity of state.selectedAmenities) {
          const hasAmenity = h.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()));
          if (!hasAmenity) return false;
        }
        return true;
      });
    }

    // 6. Sorting
    if (state.sortBy === 'price-low') {
      list.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (state.sortBy === 'price-high') {
      list.sort((a, b) => b.pricePerNight - a.pricePerNight);
    } else if (state.sortBy === 'rating') {
      list.sort((a, b) => b.guestRating - a.guestRating);
    } else if (state.sortBy === 'reviews') {
      list.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    renderHotels(list);
  }

  function renderHotels(hotelsList) {
    if (!hotelsGrid) return;

    if (resultsCountEl) {
      resultsCountEl.innerHTML = `Showing <strong>${hotelsList.length}</strong> of <strong>${sampleHotels.length}</strong> handpicked stays`;
    }

    if (hotelsList.length === 0) {
      hotelsGrid.innerHTML = `
        <div class="hotels-empty-state" data-aos="fade-up">
          <i class="fa-solid fa-hotel"></i>
          <h3>No hotels found matching your criteria</h3>
          <p>Try adjusting your price range, ratings, or clearing some selected amenities.</p>
          <button class="btn btn-primary btn-sm" id="btnEmptyReset">Reset All Filters</button>
        </div>
      `;
      const btn = document.getElementById('btnEmptyReset');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = '404.html';
        });
      }
      return;
    }

    hotelsGrid.innerHTML = hotelsList.map((hotel, index) => {
      const isSaved = state.wishlist.has(hotel.id);
      return `
        <div class="hotel-card" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
          <div class="hotel-card-media">
            <img class="hotel-card-img" src="${hotel.image}" alt="${hotel.name}" loading="lazy">
            <span class="hotel-badge-corner badge badge-${hotel.badgeType || 'luxury'}">${hotel.badge}</span>
            <button class="btn-wishlist-toggle ${isSaved ? 'active' : ''}" data-id="${hotel.id}" title="${isSaved ? 'Remove from wishlist' : 'Save to wishlist'}">
              <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </button>
            <div class="hotel-rating-overlay">
              <i class="fa-solid fa-star"></i>
              <span>${hotel.guestRating}</span>
              <small>(${hotel.reviewsCount} reviews)</small>
            </div>
          </div>

          <div class="hotel-card-body">
            <div class="hotel-location">
              <i class="fa-solid fa-location-dot"></i>
              <span>${hotel.city}, ${hotel.country}</span>
            </div>
            <h3 class="hotel-title" title="${hotel.name}">${hotel.name}</h3>
            <p class="hotel-description">${hotel.description}</p>

            <div class="hotel-amenities-list">
              ${hotel.amenities.slice(0, 3).map(a => `<span class="hotel-amenity-tag">${a}</span>`).join('')}
              ${hotel.amenities.length > 3 ? `<span class="hotel-amenity-tag">+${hotel.amenities.length - 3} more</span>` : ''}
            </div>

            <div class="hotel-card-footer">
              <div class="hotel-price-block">
                <div class="hotel-price-row">
                  <span class="hotel-price-value">${formatCurrency(hotel.pricePerNight)}</span>
                  <span class="hotel-price-old">${formatCurrency(hotel.originalPrice)}</span>
                </div>
                <span class="hotel-price-night">per night · taxes excl.</span>
              </div>
              <div class="hotel-action-buttons">
                <button class="btn btn-secondary btn-sm btn-quick-view" data-id="${hotel.id}">
                  Details
                </button>
                <button class="btn btn-primary btn-sm btn-book-hotel" data-id="${hotel.id}">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach Wishlist toggle listeners
    document.querySelectorAll('.btn-wishlist-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleWishlist(btn.dataset.id);
      });
    });

    // Attach Details button to redirect to 404.html
    document.querySelectorAll('.btn-quick-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '404.html';
      });
    });

    // Attach Booking listener -> opens modal with form that validates before redirecting to 404
    document.querySelectorAll('.btn-book-hotel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const hotelId = btn.dataset.id;
        openBookingModal(hotelId);
      });
    });
  }

  function initHotelFilterControls() {
    // Populate Destination select dropdown
    if (hotelDestSelect) {
      hotelDestSelect.innerHTML = `<option value="all">All Destinations</option>` +
        sampleDestinations.map(d => `<option value="${d.id}">${d.name}, ${d.country}</option>`).join('');
      
      hotelDestSelect.addEventListener('change', (e) => {
        state.hotelDestination = e.target.value;
        applyHotelFilters();
      });
    }

    // Text search input
    if (hotelSearchInput) {
      hotelSearchInput.addEventListener('input', (e) => {
        state.hotelSearchText = e.target.value;
        applyHotelFilters();
      });
    }

    // Price range slider
    if (priceSlider && priceSliderValue) {
      priceSlider.addEventListener('input', (e) => {
        state.maxPrice = Number(e.target.value);
        priceSliderValue.textContent = formatCurrency(state.maxPrice);
        applyHotelFilters();
      });
    }

    // Star rating filter buttons -> Redirect to 404.html
    document.querySelectorAll('.rating-pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '404.html';
      });
    });

    // Amenity toggles -> Redirect to 404.html
    document.querySelectorAll('.amenity-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '404.html';
      });
    });

    // Sorting
    if (hotelSortSelect) {
      hotelSortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        applyHotelFilters();
      });
    }

    // Reset button -> Redirect to 404.html
    if (btnResetFilters) {
      btnResetFilters.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '404.html';
      });
    }
  }

  function resetAllHotelFilters() {
    state.hotelSearchText = '';
    state.hotelDestination = 'all';
    state.maxPrice = 700;
    state.minRating = 0;
    state.selectedAmenities.clear();
    state.sortBy = 'recommended';

    if (hotelSearchInput) hotelSearchInput.value = '';
    if (hotelDestSelect) hotelDestSelect.value = 'all';
    if (priceSlider) {
      priceSlider.value = 700;
      priceSliderValue.textContent = formatCurrency(700);
    }
    if (hotelSortSelect) hotelSortSelect.value = 'recommended';

    document.querySelectorAll('.rating-pill-btn').forEach(b => b.classList.remove('active'));
    const defaultRatingBtn = document.querySelector('.rating-pill-btn[data-rating="0"]');
    if (defaultRatingBtn) defaultRatingBtn.classList.add('active');

    document.querySelectorAll('.amenity-chip').forEach(c => c.classList.remove('active'));

    applyHotelFilters();
    showToast('Hotel filters reset to default', 'info');
  }

  // ------------------------------------------------------------------
  // 10. Wishlist Functionality (LocalStorage)
  // ------------------------------------------------------------------
  function updateWishlistBadge() {
    const count = state.wishlist.size;
    if (wishlistBadge) {
      wishlistBadge.textContent = count;
      wishlistBadge.classList.add('bump');
      setTimeout(() => wishlistBadge.classList.remove('bump'), 400);
    }
    const mobileWishlistBadge = document.getElementById('mobileWishlistBadge');
    if (mobileWishlistBadge) {
      mobileWishlistBadge.textContent = count;
    }

    if (wishlistCountText) {
      wishlistCountText.textContent = `${count} Saved Stay${count === 1 ? '' : 's'}`;
    }
  }

  function toggleWishlist(hotelId) {
    const hotel = sampleHotels.find(h => h.id === hotelId);
    if (!hotel) return;

    if (state.wishlist.has(hotelId)) {
      state.wishlist.delete(hotelId);
      showToast(`Removed "${hotel.name}" from your wishlist.`, 'warning');
    } else {
      state.wishlist.add(hotelId);
      showToast(`Added "${hotel.name}" to your wishlist!`, 'success');
    }

    // Persist to LocalStorage
    localStorage.setItem('wanderlust_wishlist', JSON.stringify(Array.from(state.wishlist)));

    updateWishlistBadge();
    applyHotelFilters(); // Re-render heart buttons on cards
    renderWishlistDrawer();
  }

  function renderWishlistDrawer() {
    if (!wishlistItemsContainer) return;
    const savedHotels = sampleHotels.filter(h => state.wishlist.has(h.id));

    if (savedHotels.length === 0) {
      wishlistItemsContainer.innerHTML = `
        <div style="text-align: center; padding: 40px 10px; color: var(--slate-400);">
          <i class="fa-regular fa-heart" style="font-size: 2.5rem; margin-bottom: 12px; color: var(--slate-300);"></i>
          <h4 style="color: var(--dark-800); margin-bottom: 6px;">Your Wishlist is Empty</h4>
          <p style="font-size: 0.85rem;">Click the heart icon on any hotel card to save your favorite stays for later.</p>
        </div>
      `;
      return;
    }

    wishlistItemsContainer.innerHTML = savedHotels.map(h => `
      <div class="wishlist-item-card">
        <img class="wishlist-item-img" src="${h.image}" alt="${h.name}">
        <div class="wishlist-item-info">
          <div>
            <h4 class="wishlist-item-title">${h.name}</h4>
            <div class="wishlist-item-loc">${h.city}, ${h.country}</div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px;">
            <span class="wishlist-item-price">${formatCurrency(h.pricePerNight)}<small style="font-size: 0.7rem; color: var(--slate-500); font-weight: 500;">/nt</small></span>
            <button class="btn btn-primary btn-sm btn-book-from-wishlist" data-id="${h.id}" style="padding: 4px 10px; font-size: 0.78rem;">
              Book
            </button>
          </div>
        </div>
        <button class="btn-remove-wishlist" data-id="${h.id}" title="Remove item">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `).join('');

    // Attach book & remove listeners inside drawer
    wishlistItemsContainer.querySelectorAll('.btn-remove-wishlist').forEach(btn => {
      btn.addEventListener('click', () => toggleWishlist(btn.dataset.id));
    });

    wishlistItemsContainer.querySelectorAll('.btn-book-from-wishlist').forEach(btn => {
      btn.addEventListener('click', () => {
        closeWishlistDrawer();
        openBookingModal(btn.dataset.id);
      });
    });
  }

  function openWishlistDrawer() {
    renderWishlistDrawer();
    wishlistDrawer.classList.add('open');
    mobileNavBackdrop.classList.add('active');
    document.documentElement.classList.add('drawer-open');
    document.body.classList.add('drawer-open');
    document.body.style.overflow = 'hidden';
  }

  function closeWishlistDrawer() {
    wishlistDrawer.classList.remove('open');
    mobileNavBackdrop.classList.remove('active');
    document.documentElement.classList.remove('drawer-open');
    document.body.classList.remove('drawer-open');
    document.body.style.overflow = '';
  }

  function initWishlistDrawer() {
    if (btnWishlistNav) btnWishlistNav.addEventListener('click', openWishlistDrawer);
    const mobileDrawerWishlist = document.getElementById('mobileDrawerWishlist');
    if (mobileDrawerWishlist) {
      mobileDrawerWishlist.addEventListener('click', () => {
        closeMobileMenu();
        setTimeout(openWishlistDrawer, 150);
      });
    }
    if (wishlistCloseBtn) wishlistCloseBtn.addEventListener('click', closeWishlistDrawer);
    if (btnClearWishlist) {
      btnClearWishlist.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '404.html';
      });
    }
  }

  // ------------------------------------------------------------------
  // 11. Dynamic Booking Modal & Price Estimation
  // ------------------------------------------------------------------
  function openBookingModal(hotelId) {
    const hotel = sampleHotels.find(h => h.id === hotelId);
    if (!hotel) return;

    state.activeHotel = hotel;
    state.appliedCoupon = null;
    if (couponFeedback) couponFeedback.textContent = '';
    if (couponCodeInput) couponCodeInput.value = '';

    // Populate Modal Info
    if (bookingHotelThumb) bookingHotelThumb.src = hotel.image;
    if (bookingHotelTitle) bookingHotelTitle.textContent = hotel.name;
    if (bookingHotelLoc) bookingHotelLoc.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${hotel.address || hotel.city + ', ' + hotel.country}`;
    if (bookingHotelRate) bookingHotelRate.innerHTML = `<i class="fa-solid fa-star" style="color: #facc15;"></i> ${hotel.guestRating} (${hotel.reviewsCount} verified reviews)`;

    // Sync dates from search bar or default
    if (bookingCheckIn) bookingCheckIn.value = state.checkInDate;
    if (bookingCheckOut) bookingCheckOut.value = state.checkOutDate;
    if (bookingGuests) bookingGuests.value = state.adults;
    if (bookingRooms) bookingRooms.value = state.rooms;

    recalculateBookingPrice();

    bookingModal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeBookingModal() {
    bookingModal.classList.remove('show');
    document.body.style.overflow = '';
  }

  function recalculateBookingPrice() {
    if (!state.activeHotel) return;

    const cin = bookingCheckIn ? new Date(bookingCheckIn.value) : new Date();
    const cout = bookingCheckOut ? new Date(bookingCheckOut.value) : new Date(cin.getTime() + 86400000);
    const nights = Math.max(1, Math.ceil((cout - cin) / (1000 * 60 * 60 * 24)));
    const rooms = bookingRooms ? Number(bookingRooms.value) : 1;
    const guests = bookingGuests ? Number(bookingGuests.value) : 2;

    const nightlyRate = state.activeHotel.pricePerNight;
    const staySubtotal = nightlyRate * nights * rooms;
    
    // Extra guest surcharge ($30/night if > 2 guests per room)
    const extraGuests = Math.max(0, guests - (rooms * 2));
    const extraGuestFee = extraGuests * 30 * nights;

    const preTaxTotal = staySubtotal + extraGuestFee;
    const taxesAndFees = Math.round(preTaxTotal * 0.12); // 12% standard hospitality tax
    
    // Apply coupon discount if any
    let discountAmount = 0;
    if (state.appliedCoupon) {
      discountAmount = Math.round((preTaxTotal * state.appliedCoupon.discountPercent) / 100);
    }

    const finalTotal = preTaxTotal + taxesAndFees - discountAmount;

    // Update Modal DOM Breakdown
    if (bkdBaseRate) bkdBaseRate.textContent = formatCurrency(nightlyRate);
    if (bkdNights) bkdNights.textContent = `${nights} night${nights > 1 ? 's' : ''} × ${rooms} room${rooms > 1 ? 's' : ''}`;
    if (bkdStayTotal) bkdStayTotal.textContent = formatCurrency(staySubtotal + extraGuestFee);
    if (bkdTaxes) bkdTaxes.textContent = formatCurrency(taxesAndFees);

    if (bkdDiscountRow && bkdDiscountAmount) {
      if (state.appliedCoupon) {
        bkdDiscountRow.style.display = 'flex';
        bkdDiscountAmount.textContent = `-${formatCurrency(discountAmount)} (${state.appliedCoupon.discountPercent}% off)`;
      } else {
        bkdDiscountRow.style.display = 'none';
      }
    }

    if (bkdFinalTotal) bkdFinalTotal.textContent = formatCurrency(finalTotal);
  }

  function initBookingModalControls() {
    if (bookingModalClose) bookingModalClose.addEventListener('click', closeBookingModal);

    // Modal backdrop click
    if (bookingModal) {
      bookingModal.addEventListener('click', (e) => {
        if (e.target === bookingModal) closeBookingModal();
      });
    }

    // Modal live changes
    [bookingCheckIn, bookingCheckOut, bookingGuests, bookingRooms].forEach(el => {
      if (el) {
        el.addEventListener('change', () => {
          if (bookingCheckIn && bookingCheckOut) {
            if (new Date(bookingCheckOut.value) <= new Date(bookingCheckIn.value)) {
              showToast('Check-out must be after check-in date', 'warning');
              const d = new Date(bookingCheckIn.value);
              d.setDate(d.getDate() + 1);
              bookingCheckOut.value = d.toISOString().split('T')[0];
            }
          }
          recalculateBookingPrice();
        });
      }
    });

    // Coupon Code in Modal
    if (btnApplyCoupon && couponCodeInput) {
      btnApplyCoupon.addEventListener('click', () => {
        const inputCode = couponCodeInput.value.trim().toUpperCase();
        if (!inputCode) {
          couponFeedback.className = 'newsletter-feedback error';
          couponFeedback.textContent = 'Please enter a coupon code.';
          return;
        }

        // Code provided: validate then redirect to 404
        couponFeedback.className = 'newsletter-feedback success';
        couponFeedback.textContent = `Validating code "${inputCode}"...`;
        showToast(`Checking promo code "${inputCode}"... Redirecting...`, 'info');
        setTimeout(() => {
          window.location.href = '404.html';
        }, 450);
      });
    }

    // Booking form confirmation with strict validation then 404 redirection
    if (bookingForm) {
      bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const guestName = document.getElementById('bookingGuestName').value.trim();
        const guestEmail = document.getElementById('bookingGuestEmail').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!guestName || !guestEmail) {
          showToast('Please fill in your name and email to confirm reservation', 'warning');
          return;
        }

        if (!emailRegex.test(guestEmail)) {
          showToast('Please provide a valid email format (e.g. name@domain.com)', 'warning');
          return;
        }

        if (bookingCheckIn && bookingCheckOut) {
          if (new Date(bookingCheckOut.value) <= new Date(bookingCheckIn.value)) {
            showToast('Check-out must be after check-in date', 'warning');
            return;
          }
        }

        // Save reservation in LocalStorage
        const reservation = {
          id: 'RES-' + Math.floor(100000 + Math.random() * 900000),
          hotelName: state.activeHotel ? state.activeHotel.name : 'Luxury Sanctuary',
          checkIn: bookingCheckIn ? bookingCheckIn.value : '',
          checkOut: bookingCheckOut ? bookingCheckOut.value : '',
          totalPaid: bkdFinalTotal ? bkdFinalTotal.textContent : '',
          guestName,
          guestEmail,
          bookingDate: new Date().toISOString()
        };

        const existingRes = JSON.parse(localStorage.getItem('wanderlust_bookings') || '[]');
        existingRes.push(reservation);
        localStorage.setItem('wanderlust_bookings', JSON.stringify(existingRes));

        showToast(`🎉 Reservation confirmed for ${guestName}! Redirecting...`, 'success');

        setTimeout(() => {
          closeBookingModal();
          bookingForm.reset();
          window.location.href = '404.html';
        }, 550);
      });
    }
  }

  // ------------------------------------------------------------------
  // 12. Testimonials Carousel Slider
  // ------------------------------------------------------------------
  function renderTestimonials() {
    if (!testimonialsTrack || !sliderDotsContainer) return;

    testimonialsTrack.innerHTML = sampleTestimonials.map(t => `
      <div class="testimonial-slide">
        <div class="testimonial-card-inner">
          <div class="testimonial-stars">
            ${'<i class="fa-solid fa-star"></i>'.repeat(t.rating)}
          </div>
          <h3 class="testimonial-quote-headline">"${t.title}"</h3>
          <p class="testimonial-comment-text">${t.comment}</p>
          <div class="testimonial-author-row">
            <div class="testimonial-author-profile">
              <img class="testimonial-avatar" src="${t.avatar}" alt="${t.name}">
              <div>
                <h4 class="testimonial-name">${t.name}</h4>
                <div class="testimonial-role">${t.role} · ${t.location}</div>
              </div>
            </div>
            <div class="testimonial-visited-badge">
              <i class="fa-solid fa-location-dot"></i> Stayed in ${t.destinationVisited}
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Create Dots
    sliderDotsContainer.innerHTML = sampleTestimonials.map((_, i) => `
      <span class="slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>
    `).join('');

    sliderDotsContainer.querySelectorAll('.slider-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        goToTestimonialSlide(Number(dot.dataset.index));
      });
    });

    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        goToTestimonialSlide(state.currentTestimonialIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        goToTestimonialSlide(state.currentTestimonialIndex + 1);
      });
    }

    startTestimonialAutoplay();

    // Pause on hover
    const wrapper = document.querySelector('.testimonial-slider-container');
    if (wrapper) {
      wrapper.addEventListener('mouseenter', stopTestimonialAutoplay);
      wrapper.addEventListener('mouseleave', startTestimonialAutoplay);
    }
  }

  function goToTestimonialSlide(index) {
    const total = sampleTestimonials.length;
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;

    state.currentTestimonialIndex = index;
    if (testimonialsTrack) {
      testimonialsTrack.style.transform = `translateX(-${index * 100}%)`;
    }

    if (sliderDotsContainer) {
      sliderDotsContainer.querySelectorAll('.slider-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }
  }

  function startTestimonialAutoplay() {
    stopTestimonialAutoplay();
    state.testimonialTimer = setInterval(() => {
      goToTestimonialSlide(state.currentTestimonialIndex + 1);
    }, 5500);
  }

  function stopTestimonialAutoplay() {
    if (state.testimonialTimer) {
      clearInterval(state.testimonialTimer);
      state.testimonialTimer = null;
    }
  }

  // ------------------------------------------------------------------
  // 13. Travel Inspiration Tips Rendering
  // ------------------------------------------------------------------
  function renderTravelTips() {
    if (!travelTipsGrid) return;

    travelTipsGrid.innerHTML = sampleTravelTips.map((tip, index) => `
      <div class="travel-tip-card" data-aos="fade-up" data-aos-delay="${index * 140}">
        <div class="travel-tip-media">
          <img src="${tip.image}" alt="${tip.title}" loading="lazy">
          <span class="travel-tip-category">${tip.category}</span>
        </div>
        <div class="travel-tip-body">
          <div class="travel-tip-meta">
            <span><i class="fa-regular fa-calendar"></i> ${tip.date}</span>
            <span>·</span>
            <span><i class="fa-regular fa-clock"></i> ${tip.readTime}</span>
          </div>
          <h3 class="travel-tip-title">${tip.title}</h3>
          <p class="travel-tip-excerpt">${tip.excerpt}</p>
          <a href="404.html" class="travel-tip-readmore">
            Read Full Guide <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </div>
    `).join('');

    // Attach click events on travel tip cards to redirect to 404.html
    document.querySelectorAll('.travel-tip-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '404.html';
      });
    });
  }

  // ------------------------------------------------------------------
  // 14. Newsletter Validation & Persistence -> 404 Redirection
  // ------------------------------------------------------------------
  function initNewsletter() {
    if (!newsletterForm || !newsletterEmail) return;

    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterEmail.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email) {
        newsletterFeedback.className = 'newsletter-feedback error';
        newsletterFeedback.textContent = 'Please enter your email address.';
        return;
      }

      if (!emailRegex.test(email)) {
        newsletterFeedback.className = 'newsletter-feedback error';
        newsletterFeedback.textContent = 'Please provide a valid email format (e.g., name@domain.com).';
        return;
      }

      // Store in LocalStorage
      const subscribers = JSON.parse(localStorage.getItem('wanderlust_subscribers') || '[]');
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('wanderlust_subscribers', JSON.stringify(subscribers));
      }

      newsletterFeedback.className = 'newsletter-feedback success';
      newsletterFeedback.textContent = '🎉 Thank you! Check your inbox for your 15% welcome voucher.';
      showToast('Subscribed! Redirecting to exclusive portal...', 'success');

      setTimeout(() => {
        newsletterEmail.value = '';
        window.location.href = '404.html';
      }, 500);
    });
  }

  // ------------------------------------------------------------------
  // 15. Header Scroll Effect & Navigation
  // ------------------------------------------------------------------
  function initHeaderAndNav() {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
        if (backToTopBtn) backToTopBtn.classList.add('show');
      } else {
        header.classList.remove('scrolled');
        if (backToTopBtn) backToTopBtn.classList.remove('show');
      }
    });

    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Mobile Navigation Drawer Toggle & Background Scroll Lock
    function openMobileMenu() {
      if (!mobileNavDrawer) return;
      mobileNavDrawer.classList.add('active');
      if (mobileNavBackdrop) mobileNavBackdrop.classList.add('active');
      document.documentElement.classList.add('drawer-open');
      document.body.classList.add('drawer-open');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
      if (!mobileNavDrawer) return;
      mobileNavDrawer.classList.remove('active');
      if (mobileNavBackdrop) mobileNavBackdrop.classList.remove('active');
      document.documentElement.classList.remove('drawer-open');
      document.body.classList.remove('drawer-open');
      document.body.style.overflow = '';
      closeWishlistDrawer();
    }

    if (mobileNavToggle) {
      mobileNavToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (mobileNavDrawer && mobileNavDrawer.classList.contains('active')) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });
    }

    if (mobileNavClose) mobileNavClose.addEventListener('click', closeMobileMenu);
    
    if (mobileNavBackdrop) {
      mobileNavBackdrop.addEventListener('click', closeMobileMenu);
      // Prevent background touch scrolling on mobile devices
      mobileNavBackdrop.addEventListener('touchmove', (e) => {
        e.preventDefault();
      }, { passive: false });
    }

    // Close mobile menu on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNavDrawer && mobileNavDrawer.classList.contains('active')) {
        closeMobileMenu();
      }
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        closeMobileMenu();
        if (href && href.startsWith('#') && href !== '#loginModal' && href.length > 1) {
          const targetEl = document.querySelector(href);
          if (targetEl) {
            e.preventDefault();
            setTimeout(() => {
              targetEl.scrollIntoView({ behavior: 'smooth' });
            }, 120);
          }
        }
      });
    });

    // Currency Switcher
    if (currencySelector) {
      currencySelector.addEventListener('change', (e) => {
        state.currency = e.target.value;
        renderDestinations();
        applyHotelFilters();
        renderWishlistDrawer();
        updateHeroEstimationPreview();
        showToast(`Currency switched to ${state.currency}`, 'info');
      });
    }

    // Scrollspy for active nav link
    const navSections = [
      { id: 'heroSection', name: 'Home' },
      { id: 'aboutSection', name: 'About' },
      { id: 'servicesSection', name: 'Service' },
      { id: 'blogSection', name: 'Blog' },
      { id: 'contactSection', name: 'Contact' }
    ];

    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 140;
      navSections.forEach(sec => {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            document.querySelectorAll('.nav-link').forEach(link => {
              if (link.getAttribute('href') === `#${sec.id}`) {
                link.classList.add('active');
              } else if (!link.classList.contains('btn-open-login')) {
                link.classList.remove('active');
              }
            });
          }
        }
      });
    });
  }

  // ------------------------------------------------------------------
  // 16. Contact Form Logic
  // ------------------------------------------------------------------
  function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const contactName = document.getElementById('contactName');
    const contactEmail = document.getElementById('contactEmail');
    const contactSubject = document.getElementById('contactSubject');
    const contactMessage = document.getElementById('contactMessage');
    const contactFeedback = document.getElementById('contactFeedback');

    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = contactName.value.trim();
      const email = contactEmail.value.trim();
      const message = contactMessage.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name || !email || !message) {
        contactFeedback.className = 'contact-feedback error';
        contactFeedback.textContent = 'Please fill out all required fields.';
        return;
      }

      if (!emailRegex.test(email)) {
        contactFeedback.className = 'contact-feedback error';
        contactFeedback.textContent = 'Please provide a valid email address.';
        return;
      }

      // Store in LocalStorage
      const inquiry = {
        id: 'INQ-' + Date.now(),
        name,
        email,
        subject: contactSubject ? contactSubject.value : 'General',
        message,
        date: new Date().toISOString()
      };

      const existingInquiries = JSON.parse(localStorage.getItem('wanderlust_inquiries') || '[]');
      existingInquiries.push(inquiry);
      localStorage.setItem('wanderlust_inquiries', JSON.stringify(existingInquiries));

      contactFeedback.className = 'contact-feedback success';
      contactFeedback.innerHTML = `<i class="fa-solid fa-circle-check"></i> Thank you ${name}! Your inquiry has been dispatched to our VIP concierge team.`;
      showToast(`Inquiry sent! Redirecting to confirmation page...`, 'success');

      setTimeout(() => {
        contactForm.reset();
        window.location.href = '404.html';
      }, 600);
    });
  }

  // ------------------------------------------------------------------
  // 17. Authentication & Login Modal Logic
  // ------------------------------------------------------------------
  function initAuthModal() {
    const loginModal = document.getElementById('loginModal');
    const loginModalClose = document.getElementById('loginModalClose');
    const tabSignIn = document.getElementById('tabSignIn');
    const tabSignUp = document.getElementById('tabSignUp');
    const authNameField = document.getElementById('authNameField');
    const authName = document.getElementById('authName');
    const authEmail = document.getElementById('authEmail');
    const authPassword = document.getElementById('authPassword');
    const authPasswordToggle = document.getElementById('authPasswordToggle');
    const btnAuthSubmit = document.getElementById('btnAuthSubmit');
    const authFeedback = document.getElementById('authFeedback');
    const loginForm = document.getElementById('loginForm');
    const navLoginBtn = document.getElementById('navLoginBtn');

    let authMode = 'signin'; // 'signin' or 'signup'

    // Open Modal Triggers
    document.querySelectorAll('.btn-open-login').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openLoginModal();
      });
    });

    function openLoginModal() {
      if (!loginModal) return;
      loginModal.classList.add('show');
      document.body.style.overflow = 'hidden';
      if (authFeedback) authFeedback.textContent = '';
    }

    function closeLoginModal() {
      if (!loginModal) return;
      loginModal.classList.remove('show');
      document.body.style.overflow = '';
    }

    if (loginModalClose) loginModalClose.addEventListener('click', closeLoginModal);
    if (loginModal) {
      loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) closeLoginModal();
      });
    }

    // Switch between Sign In and Sign Up tabs
    if (tabSignIn && tabSignUp) {
      tabSignIn.addEventListener('click', () => {
        authMode = 'signin';
        tabSignIn.classList.add('active');
        tabSignUp.classList.remove('active');
        if (authNameField) authNameField.style.display = 'none';
        if (btnAuthSubmit) btnAuthSubmit.innerHTML = `<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In to Account`;
        if (authFeedback) authFeedback.textContent = '';
      });

      tabSignUp.addEventListener('click', () => {
        authMode = 'signup';
        tabSignUp.classList.add('active');
        tabSignIn.classList.remove('active');
        if (authNameField) authNameField.style.display = 'block';
        if (btnAuthSubmit) btnAuthSubmit.innerHTML = `<i class="fa-solid fa-user-plus"></i> Create Free Account`;
        if (authFeedback) authFeedback.textContent = '';
      });
    }

    // Password visibility toggle
    if (authPasswordToggle && authPassword) {
      authPasswordToggle.addEventListener('click', () => {
        const isPwd = authPassword.type === 'password';
        authPassword.type = isPwd ? 'text' : 'password';
        authPasswordToggle.className = isPwd ? 'fa-regular fa-eye-slash auth-password-toggle' : 'fa-regular fa-eye auth-password-toggle';
      });
    }

    // Handle Form Submit
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = authEmail.value.trim();
        const password = authPassword.value;
        const name = authName ? authName.value.trim() : '';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !password) {
          authFeedback.className = 'auth-feedback error';
          authFeedback.textContent = 'Please fill out all fields.';
          return;
        }

        if (!emailRegex.test(email)) {
          authFeedback.className = 'auth-feedback error';
          authFeedback.textContent = 'Please provide a valid email format (e.g., name@domain.com).';
          return;
        }

        if (password.length < 6) {
          authFeedback.className = 'auth-feedback error';
          authFeedback.textContent = 'Password must be at least 6 characters.';
          return;
        }

        if (authMode === 'signup' && !name) {
          authFeedback.className = 'auth-feedback error';
          authFeedback.textContent = 'Please enter your full name.';
          return;
        }

        const displayName = authMode === 'signup' && name ? name : email.split('@')[0];
        setUserSession(displayName, email);
        authFeedback.className = 'auth-feedback success';
        authFeedback.textContent = `Welcome, ${displayName}! Redirecting...`;
        showToast(`🎉 Welcome to Wanderlust, ${displayName}! Redirecting...`, 'success');

        setTimeout(() => {
          closeLoginModal();
          loginForm.reset();
          window.location.href = '404.html';
        }, 550);
      });
    }

    // Social Login Buttons -> Redirect to 404.html
    document.querySelectorAll('.btn-social-login').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '404.html';
      });
    });

    function setUserSession(name, email) {
      const user = { name, email, loggedInAt: new Date().toISOString() };
      localStorage.setItem('wanderlust_user', JSON.stringify(user));
      updateNavUserUI(user);
    }

    function updateNavUserUI(user) {
      if (!navLoginBtn) return;
      if (user && user.name) {
        navLoginBtn.innerHTML = `
          <i class="fa-solid fa-circle-user" style="color: #38bdf8;"></i>
          <span>${user.name.split(' ')[0]}</span>
        `;
        navLoginBtn.title = `Signed in as ${user.name} (Click to Sign Out)`;
        navLoginBtn.onclick = (e) => {
          e.preventDefault();
          if (confirm(`Signed in as ${user.name}. Would you like to sign out?`)) {
            localStorage.removeItem('wanderlust_user');
            navLoginBtn.innerHTML = `<i class="fa-solid fa-user"></i> Login`;
            navLoginBtn.title = 'Login';
            navLoginBtn.onclick = null;
            showToast('You have been signed out.', 'info');
          }
        };
      }
    }

    // Check existing session
    const savedUser = JSON.parse(localStorage.getItem('wanderlust_user') || 'null');
    if (savedUser) {
      updateNavUserUI(savedUser);
    }
  }

  // ------------------------------------------------------------------
  // 18. Initialize Everything & AOS Animations
  // ------------------------------------------------------------------
  initDates();
  initGuestControls();
  initHeroSearch();
  initDestinationPills();
  initHotelFilterControls();
  initWishlistDrawer();
  initBookingModalControls();
  initNewsletter();
  initContactForm();
  initAuthModal();
  initHeaderAndNav();

  // Initial renders
  renderDestinations();
  applyHotelFilters();
  renderPromotionalOffers();
  renderTestimonials();
  renderTravelTips();
  updateWishlistBadge();

  // ------------------------------------------------------------------
  // 19. Preloader Animation Controller
  // ------------------------------------------------------------------
  function initPreloader() {
    const preloader = document.getElementById('preloader');
    const preloaderBar = document.getElementById('preloaderBar');
    if (!preloader) return;

    let progress = 15;
    if (preloaderBar) preloaderBar.style.width = '15%';

    const progressInterval = setInterval(() => {
      if (progress < 90) {
        progress += Math.floor(Math.random() * 15) + 8;
        if (progress > 90) progress = 90;
        if (preloaderBar) preloaderBar.style.width = `${progress}%`;
      }
    }, 100);

    let finished = false;
    const finishPreloader = () => {
      if (finished) return;
      finished = true;
      clearInterval(progressInterval);
      if (preloaderBar) preloaderBar.style.width = '100%';

      setTimeout(() => {
        preloader.classList.add('fade-out');
        document.body.classList.remove('preloader-active');

        // Re-calculate AOS after preloader vanishes so animations trigger accurately
        if (typeof AOS !== 'undefined') {
          AOS.refresh();
        }
      }, 350);
    };

    if (document.readyState === 'complete') {
      setTimeout(finishPreloader, 400);
    } else {
      window.addEventListener('load', () => {
        setTimeout(finishPreloader, 350);
      });
      // Safety fallback: dismiss within 1.8s in case network assets stall
      setTimeout(finishPreloader, 1800);
    }
  }

  // Initialize AOS (Animate on Scroll)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 30,
      disable: window.innerWidth < 768
    });
  }

  initPreloader();

  // ------------------------------------------------------------------
  // 20. Global 404 Redirection Handler for Non-Nav, Non-Footer Elements
  // ------------------------------------------------------------------
  function initGlobal404Redirection() {
    document.addEventListener('click', (e) => {
      const el = e.target.closest('a, button, .destination-card, .quick-tag-btn, .dest-filter-btn, .btn-copy-coupon, .rating-pill-btn, .amenity-chip, .travel-tip-card');
      if (!el) return;

      // 1. EXCEPTIONS: Header & Mobile Drawer Navigation
      if (
        el.closest('header') ||
        el.closest('.mobile-nav-drawer') ||
        el.classList.contains('mobile-nav-link') ||
        el.classList.contains('nav-link') ||
        el.classList.contains('logo') ||
        el.closest('.logo')
      ) {
        return;
      }

      // 2. EXCEPTIONS: Footer
      if (el.closest('footer') || el.classList.contains('footer-link') || el.classList.contains('social-link')) {
        return;
      }

      // 3. EXCEPTIONS: Modal UI controls & steppers & slider & back-to-top
      if (
        el.id === 'loginModalClose' ||
        el.id === 'bookingModalClose' ||
        el.id === 'wishlistCloseBtn' ||
        el.classList.contains('modal-close-btn') ||
        el.id === 'tabSignIn' ||
        el.id === 'tabSignUp' ||
        el.id === 'authPasswordToggle' ||
        el.id === 'heroGuestTrigger' ||
        el.closest('#heroGuestTrigger') ||
        el.classList.contains('step-btn') ||
        el.closest('.guest-stepper') ||
        el.id === 'sliderPrev' ||
        el.id === 'sliderNext' ||
        el.classList.contains('slider-dot') ||
        el.id === 'backToTopBtn' ||
        el.classList.contains('back-to-top')
      ) {
        return;
      }

      // 4. EXCEPTIONS: Modal open triggers and wishlist drawer book button
      if (
        el.classList.contains('btn-open-login') ||
        el.id === 'navLoginBtn' ||
        el.id === 'btnWishlistNav' ||
        el.classList.contains('btn-book-hotel') ||
        el.classList.contains('btn-book-from-wishlist')
      ) {
        return;
      }

      // 5. EXCEPTIONS: Wishlist toggle heart button
      if (el.classList.contains('btn-wishlist-toggle')) {
        return;
      }

      // 6. EXCEPTIONS: Form submit buttons (they validate first, then redirect)
      if (
        el.type === 'submit' ||
        el.id === 'heroSearchBtn' ||
        el.id === 'btnApplyCoupon' ||
        el.id === 'btnAuthSubmit'
      ) {
        return;
      }

      // 7. ALL OTHER LINKS AND BUTTONS: Redirect to 404
      e.preventDefault();
      e.stopPropagation();
      window.location.href = '404.html';
    }, true);
  }

  initGlobal404Redirection();
});

