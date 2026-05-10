// ============================================================
//  NutriFlow – Central JavaScript Logic
//  Fake database: localStorage  |  Maps: Google Maps API
// ============================================================

// ── ⚠️  REPLACE THIS WITH YOUR ACTUAL GOOGLE MAPS API KEY ──
const GOOGLE_MAPS_API_KEY = "";

// ── Delhi fallback coordinates (used when geolocation denied) ──
const DELHI_CENTER = { lat: 28.6139, lng: 77.2090 };

// ── Demo listing coordinates (realistic Delhi locations) ────
const DEMO_COORDS = [
  { lat: 28.4744, lng: 77.0266 }, // Sector 14, Dwarka
  { lat: 28.6315, lng: 77.2167 }, // Connaught Place
  { lat: 28.5672, lng: 77.2433 }, // Lajpat Nagar
  { lat: 28.5355, lng: 77.3910 }, // Noida Sector 18
  { lat: 28.7041, lng: 77.1025 }, // Rohini
];

// ════════════════════════════════════════════════════════════
//  SEED DEMO DATA
// ════════════════════════════════════════════════════════════
(function seedDemoData() {
  if (!localStorage.getItem("nf_seeded")) {
    const demoListings = [
      {
        id: "L001",
        restaurant: "Green Garden Restaurant",
        foodName: "Rice & Dal",
        quantity: "25 kg",
        foodType: "Veg",
        location: "Sector 14, Dwarka, Delhi",
        contact: "9876543210",
        expiry: getTomorrowDate(),
        status: "pending",
        mealsEstimate: 50,
        timestamp: Date.now() - 3600000,
        latitude: 28.4744,
        longitude: 77.0266,
      },
      {
        id: "L002",
        restaurant: "Spice Route Cafe",
        foodName: "Mixed Vegetables",
        quantity: "15 kg",
        foodType: "Veg",
        location: "Connaught Place, Delhi",
        contact: "9123456789",
        expiry: getTodayDate(),
        status: "accepted",
        mealsEstimate: 30,
        timestamp: Date.now() - 7200000,
        acceptedBy: "Hope Foundation NGO",
        latitude: 28.6315,
        longitude: 77.2167,
      },
      {
        id: "L003",
        restaurant: "The Biryani House",
        foodName: "Chicken Biryani",
        quantity: "10 kg",
        foodType: "Non-Veg",
        location: "Lajpat Nagar, Delhi",
        contact: "9988776655",
        expiry: getTomorrowDate(),
        status: "completed",
        mealsEstimate: 20,
        timestamp: Date.now() - 86400000,
        acceptedBy: "Smile Foundation",
        latitude: 28.5672,
        longitude: 77.2433,
      },
      {
        id: "L004",
        restaurant: "Punjabi Dhaba",
        foodName: "Chole Bhature",
        quantity: "20 kg",
        foodType: "Veg",
        location: "Rohini Sector 10, Delhi",
        contact: "9811223344",
        expiry: getTomorrowDate(),
        status: "pending",
        mealsEstimate: 40,
        timestamp: Date.now() - 1800000,
        latitude: 28.7041,
        longitude: 77.1025,
      },
      {
        id: "L005",
        restaurant: "Andhra Kitchen",
        foodName: "Hyderabadi Pulao",
        quantity: "18 kg",
        foodType: "Veg",
        location: "Noida Sector 18, UP",
        contact: "9900112233",
        expiry: getTomorrowDate(),
        status: "pending",
        mealsEstimate: 36,
        timestamp: Date.now() - 900000,
        latitude: 28.5355,
        longitude: 77.3910,
      },
    ];

    const demoNotifications = [
      {
        id: "N001",
        message: "Hope Foundation NGO accepted your food listing 'Rice & Dal'",
        time: "2 hours ago",
        read: false,
        type: "accepted",
      },
      {
        id: "N002",
        message: "You helped serve 30 meals through Spice Route Cafe listing!",
        time: "Yesterday",
        read: true,
        type: "impact",
      },
      {
        id: "N003",
        message: "New food available: Rice & Dal (25 kg) at Sector 14",
        time: "3 hours ago",
        read: false,
        type: "new",
      },
      {
        id: "N004",
        message: "Pickup confirmed for Spice Route Cafe – Mixed Vegetables",
        time: "5 hours ago",
        read: true,
        type: "pickup",
      },
    ];

    localStorage.setItem("nf_listings", JSON.stringify(demoListings));
    localStorage.setItem("nf_notifications", JSON.stringify(demoNotifications));
    localStorage.setItem("nf_seeded", "true");
  }
})();

// ════════════════════════════════════════════════════════════
//  UTILITY HELPERS
// ════════════════════════════════════════════════════════════
function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}
function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}
function generateId() {
  return "L" + Date.now().toString().slice(-6);
}
function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.floor(h / 24)} day(s) ago`;
}
function isExpiringSoon(dateStr) {
  const expiry = new Date(dateStr);
  const today = new Date();
  const diff = (expiry - today) / (1000 * 60 * 60 * 24);
  return diff <= 1;
}

// ════════════════════════════════════════════════════════════
//  LOCALSTORAGE HELPERS
// ════════════════════════════════════════════════════════════
function getListings() {
  return JSON.parse(localStorage.getItem("nf_listings") || "[]");
}
function saveListings(listings) {
  localStorage.setItem("nf_listings", JSON.stringify(listings));
}
function getNotifications() {
  return JSON.parse(localStorage.getItem("nf_notifications") || "[]");
}
function saveNotifications(notifs) {
  localStorage.setItem("nf_notifications", JSON.stringify(notifs));
}
function addNotification(message, type) {
  const notifs = getNotifications();
  notifs.unshift({
    id: "N" + Date.now(),
    message,
    time: "Just now",
    read: false,
    type,
  });
  saveNotifications(notifs);
}

// ── Status badge HTML ─────────────────────────────────────
function statusBadge(status) {
  const map = {
    pending:      '<span class="badge-pending">⏳ Pending</span>',
    accepted:     '<span class="badge-accepted">✅ Accepted</span>',
    completed:    '<span class="badge-completed">🏆 Completed</span>',
    "in-progress":'<span class="badge-inprogress">🚚 In Progress</span>',
  };
  return map[status] || '<span class="badge-pending">⏳ Pending</span>';
}

// ════════════════════════════════════════════════════════════
//  RESTAURANT DASHBOARD  (non-map logic)
// ════════════════════════════════════════════════════════════
function initRestaurantDashboard() {
  if (!document.getElementById("restaurantDash")) return;

  renderRestaurantStats();
  renderMyListings();
  renderRestaurantNotifications();

  const expiryInput = document.getElementById("expiry");
  if (expiryInput) expiryInput.min = getTodayDate();

  const form = document.getElementById("addFoodForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      handleAddFood();
    });
  }
}

function handleAddFood() {
  const foodName  = document.getElementById("foodName").value.trim();
  const quantity  = document.getElementById("quantity").value.trim();
  const unit      = document.getElementById("unit").value;
  const foodType  = document.getElementById("foodType").value;
  const location  = document.getElementById("location").value.trim();
  const contact   = document.getElementById("contact").value.trim();
  const expiry    = document.getElementById("expiry").value;

  // Read lat/lng from hidden inputs set by the map picker
  const latInput  = document.getElementById("pickedLat");
  const lngInput  = document.getElementById("pickedLng");
  const latitude  = latInput  ? parseFloat(latInput.value)  || null : null;
  const longitude = lngInput  ? parseFloat(lngInput.value) || null : null;

  if (!foodName || !quantity || !location || !contact || !expiry) {
    showToast("Please fill all required fields.", "error");
    return;
  }

  const listing = {
    id: generateId(),
    restaurant: "My Restaurant",
    foodName,
    quantity: `${quantity} ${unit}`,
    foodType,
    location,
    contact,
    expiry,
    status: "pending",
    mealsEstimate: Math.round(parseFloat(quantity) * 2),
    timestamp: Date.now(),
    latitude,
    longitude,
  };

  const listings = getListings();
  listings.unshift(listing);
  saveListings(listings);

  addNotification(`Your listing '${foodName}' has been posted successfully!`, "new");
  showToast("Food listing added successfully! 🎉", "success");

  document.getElementById("addFoodForm").reset();
  document.getElementById("expiry").min = getTodayDate();

  // Reset map picker
  if (window._restaurantMapState) {
    window._restaurantMapState.pickedLat = null;
    window._restaurantMapState.pickedLng = null;
    if (latInput) latInput.value = "";
    if (lngInput) lngInput.value = "";
    const coordDisplay = document.getElementById("coordDisplay");
    if (coordDisplay) coordDisplay.textContent = "No location selected yet";
  }

  renderMyListings();
  renderRestaurantStats();
  renderRestaurantNotifications();

  // Scroll to listings
  const myListingsEl = document.getElementById("my-listings");
  if (myListingsEl) myListingsEl.scrollIntoView({ behavior: "smooth" });
}

function renderMyListings() {
  const container = document.getElementById("listingsContainer");
  if (!container) return;
  const listings = getListings().filter((l) => l.restaurant === "My Restaurant");

  if (listings.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🍽️</div>
        <p>No food listings yet.</p>
        <p class="empty-sub">Add your first listing using the form above!</p>
      </div>`;
    return;
  }

  container.innerHTML = listings.map((l) => `
    <div class="card listing-card" data-id="${l.id}">
      <div class="card-header-row">
        <div>
          <h3 class="card-title">${l.foodName}</h3>
          <p class="card-subtitle">${l.quantity} · ${l.foodType}</p>
        </div>
        <div class="card-badges">
          ${statusBadge(l.status)}
          ${isExpiringSoon(l.expiry) ? '<span class="badge-expiring">🔥 Expiring Soon</span>' : ""}
        </div>
      </div>
      <div class="card-meta">
        <span>📍 ${l.location}</span>
        <span>📅 Expires: ${l.expiry}</span>
        <span>📞 ${l.contact}</span>
        ${l.latitude ? `<span>🌐 ${l.latitude.toFixed(4)}, ${l.longitude.toFixed(4)}</span>` : ""}
      </div>
      ${l.acceptedBy ? `<p class="accepted-by">Accepted by: <strong>${l.acceptedBy}</strong></p>` : ""}
      <div class="card-footer-row">
        <span class="meals-count">🥗 ~${l.mealsEstimate} meals estimated</span>
        <span class="time-ago">${timeAgo(l.timestamp)}</span>
      </div>
    </div>`).join("");
}

function renderRestaurantStats() {
  const listings   = getListings().filter((l) => l.restaurant === "My Restaurant");
  const totalMeals = listings.reduce((s, l) => s + (l.mealsEstimate || 0), 0);
  const completed  = listings.filter((l) => l.status === "completed").length;
  const pending    = listings.filter((l) => l.status === "pending").length;
  const accepted   = listings.filter((l) => l.status === "accepted").length;

  const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  ["statMeals", "statMeals2"].forEach((id) => set(id, totalMeals));
  ["statCompleted", "statCompleted2"].forEach((id) => set(id, completed));
  ["statPending", "statPending2"].forEach((id) => set(id, pending));
  set("statAccepted",    accepted);
  set("impactMeals",     totalMeals);
  set("impactListings",  listings.length);
  set("impactCompleted", completed);
  set("impactPending",   pending);
}

function renderRestaurantNotifications() {
  const container = document.getElementById("notifContainer");
  if (!container) return;
  const notifs = getNotifications().slice(0, 5);

  if (notifs.length === 0) {
    container.innerHTML = '<p class="empty-sub">No notifications yet.</p>';
    return;
  }

  container.innerHTML = notifs.map((n) => `
    <div class="notif-item ${n.read ? "notif-read" : "notif-unread"}">
      <div class="notif-icon">${
        n.type === "accepted" ? "✅" : n.type === "impact" ? "🏆" : n.type === "pickup" ? "🚚" : "🔔"
      }</div>
      <div class="notif-body">
        <p>${n.message}</p>
        <span class="notif-time">${n.time}</span>
      </div>
      ${!n.read ? '<span class="notif-dot"></span>' : ""}
    </div>`).join("");
}

// ════════════════════════════════════════════════════════════
//  NGO DASHBOARD  (non-map logic)
// ════════════════════════════════════════════════════════════
function initNGODashboard() {
  if (!document.getElementById("ngoDash")) return;
  renderAvailableFood();
  renderMyPickups();
  renderNGONotifications();
  renderNGOStats();
}

function renderAvailableFood() {
  const container = document.getElementById("availableFoodContainer");
  if (!container) return;
  const listings  = getListings().filter((l) => l.status === "pending");
  const distances = ["1.2 km", "2.4 km", "3.1 km", "0.8 km", "4.5 km"];

  if (listings.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🍽️</div>
        <p>No food available right now.</p>
        <p class="empty-sub">Check back soon – restaurants update listings throughout the day.</p>
      </div>`;
    return;
  }

  container.innerHTML = listings.map((l, i) => `
    <div class="card food-card" data-id="${l.id}">
      <div class="card-header-row">
        <div>
          <h3 class="card-title">${l.foodName}</h3>
          <p class="card-subtitle">${l.restaurant}</p>
        </div>
        <div class="card-badges">
          <span class="badge-type-${l.foodType === "Veg" ? "veg" : "nonveg"}">${l.foodType === "Veg" ? "🟢 Veg" : "🔴 Non-Veg"}</span>
          ${isExpiringSoon(l.expiry) ? '<span class="badge-expiring">🔥 Expiring Soon</span>' : ""}
        </div>
      </div>
      <div class="card-meta">
        <span>📦 ${l.quantity}</span>
        <span>📍 ${l.location}</span>
        <span>📏 ${distances[i % distances.length]} away</span>
        <span>📅 Expires: ${l.expiry}</span>
        <span>📞 ${l.contact}</span>
      </div>
      <div class="card-footer-row">
        <span class="meals-count">🥗 ~${l.mealsEstimate} meals</span>
        <button class="btn-accept" onclick="acceptFood('${l.id}')">🤝 Accept Pickup</button>
      </div>
    </div>`).join("");
}

function acceptFood(id) {
  const listings = getListings();
  const idx = listings.findIndex((l) => l.id === id);
  if (idx === -1) return;

  showConfirmPopup(listings[idx].foodName, function () {
    listings[idx].status    = "accepted";
    listings[idx].acceptedBy = "Hope Foundation NGO";
    saveListings(listings);

    addNotification(
      `You accepted pickup for '${listings[idx].foodName}' from ${listings[idx].restaurant}`,
      "accepted"
    );
    addNotification(
      `Hope Foundation NGO accepted your listing '${listings[idx].foodName}'`,
      "accepted"
    );

    showToast(`Pickup accepted for ${listings[idx].foodName}! 🚚`, "success");
    renderAvailableFood();
    renderMyPickups();
    renderNGONotifications();
    renderNGOStats();

    // Refresh NGO map markers if map is active
    if (window._ngoMapState && window._ngoMapState.map) {
      renderNearbyFoodMarkers(window._ngoMapState.currentFilter || "all");
    }
  });
}

function showConfirmPopup(foodName, onConfirm) {
  const overlay   = document.getElementById("confirmOverlay");
  const foodNameEl = document.getElementById("popupFoodName");
  if (!overlay) return;
  if (foodNameEl) foodNameEl.textContent = foodName;

  overlay.classList.add("active");

  document.getElementById("confirmYes").onclick = function () {
    overlay.classList.remove("active");
    onConfirm();
  };
  document.getElementById("confirmNo").onclick = function () {
    overlay.classList.remove("active");
  };
}

function renderMyPickups() {
  const container = document.getElementById("myPickupsContainer");
  if (!container) return;
  const listings = getListings().filter((l) => l.acceptedBy === "Hope Foundation NGO");

  if (listings.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        <p>No pickups yet.</p>
        <p class="empty-sub">Accept available food to see your pickups here.</p>
      </div>`;
    return;
  }

  container.innerHTML = listings.map((l) => `
    <div class="card pickup-card">
      <div class="card-header-row">
        <div>
          <h3 class="card-title">${l.foodName}</h3>
          <p class="card-subtitle">${l.restaurant}</p>
        </div>
        ${statusBadge(l.status)}
      </div>
      <div class="card-meta">
        <span>📦 ${l.quantity}</span>
        <span>📍 ${l.location}</span>
        <span>📞 ${l.contact}</span>
      </div>
      <div class="card-footer-row">
        <span class="meals-count">🥗 ~${l.mealsEstimate} meals</span>
        ${l.status === "accepted"    ? `<button class="btn-progress" onclick="markInProgress('${l.id}')">🚚 In Progress</button>` : ""}
        ${l.status === "in-progress" ? `<button class="btn-complete" onclick="markCompleted('${l.id}')">✅ Complete</button>` : ""}
        ${l.status === "completed"   ? `<span class="text-xs font-semibold" style="color:#059669;">✅ Successfully distributed</span>` : ""}
      </div>
    </div>`).join("");
}

function markInProgress(id) {
  const listings = getListings();
  const idx = listings.findIndex((l) => l.id === id);
  if (idx === -1) return;
  listings[idx].status = "in-progress";
  saveListings(listings);
  addNotification(`Pickup for '${listings[idx].foodName}' is now In Progress 🚚`, "pickup");
  showToast("Status updated to In Progress!", "success");
  renderMyPickups();
  renderNGOStats();
}

function markCompleted(id) {
  const listings = getListings();
  const idx = listings.findIndex((l) => l.id === id);
  if (idx === -1) return;
  listings[idx].status = "completed";
  saveListings(listings);
  addNotification(
    `Pickup completed for '${listings[idx].foodName}'! 🏆 You helped serve ${listings[idx].mealsEstimate} meals!`,
    "impact"
  );
  showToast(`Amazing! You helped serve ${listings[idx].mealsEstimate} meals! 🏆`, "success");
  renderMyPickups();
  renderNGOStats();
}

function renderNGONotifications() {
  const container = document.getElementById("ngoNotifContainer");
  if (!container) return;
  const notifs = getNotifications().slice(0, 6);

  if (notifs.length === 0) {
    container.innerHTML = '<p class="empty-sub">No notifications yet.</p>';
    return;
  }

  container.innerHTML = notifs.map((n) => `
    <div class="notif-item ${n.read ? "notif-read" : "notif-unread"}">
      <div class="notif-icon">${
        n.type === "accepted" ? "✅" : n.type === "impact" ? "🏆" : n.type === "pickup" ? "🚚" : "🔔"
      }</div>
      <div class="notif-body">
        <p>${n.message}</p>
        <span class="notif-time">${n.time}</span>
      </div>
      ${!n.read ? '<span class="notif-dot"></span>' : ""}
    </div>`).join("");
}

function renderNGOStats() {
  const listings   = getListings();
  const myPickups  = listings.filter((l) => l.acceptedBy === "Hope Foundation NGO");
  const completed  = myPickups.filter((l) => l.status === "completed");
  const totalMeals = completed.reduce((s, l) => s + (l.mealsEstimate || 0), 0);
  const available  = listings.filter((l) => l.status === "pending").length;

  const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  set("ngoStatMeals",   totalMeals);
  set("ngoStatPickups", myPickups.length);
  set("ngoStatAvailable", available);
  set("ngoImpactMeals", totalMeals);
}

// ════════════════════════════════════════════════════════════
//  GOOGLE MAPS CUSTOM STYLES (NutriFlow green theme)
// ════════════════════════════════════════════════════════════
const NF_MAP_STYLES = [
  { elementType: "geometry",            stylers: [{ color: "#f3f9f7" }] },
  { elementType: "labels.text.stroke",  stylers: [{ color: "#f3f9f7" }] },
  { elementType: "labels.text.fill",    stylers: [{ color: "#3d5a52" }] },
  { featureType: "administrative",       elementType: "geometry.stroke", stylers: [{ color: "#c8ddd8" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#6b8c84" }] },
  { featureType: "poi",                  elementType: "geometry",          stylers: [{ color: "#daeae5" }] },
  { featureType: "poi",                  elementType: "labels.text.fill",  stylers: [{ color: "#4f7c6e" }] },
  { featureType: "poi.park",             elementType: "geometry",          stylers: [{ color: "#c8e6e0" }] },
  { featureType: "poi.park",             elementType: "labels.text.fill",  stylers: [{ color: "#4f7c6e" }] },
  { featureType: "road",                 elementType: "geometry",          stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial",        elementType: "labels.text.fill",  stylers: [{ color: "#6b8c84" }] },
  { featureType: "road.highway",         elementType: "geometry",          stylers: [{ color: "#e8f2ef" }] },
  { featureType: "road.highway",         elementType: "labels.text.fill",  stylers: [{ color: "#4f7c6e" }] },
  { featureType: "road.local",           elementType: "labels.text.fill",  stylers: [{ color: "#6b8c84" }] },
  { featureType: "transit.line",         elementType: "geometry",          stylers: [{ color: "#d4e8e2" }] },
  { featureType: "transit.station",      elementType: "geometry",          stylers: [{ color: "#daeae5" }] },
  { featureType: "water",                elementType: "geometry",          stylers: [{ color: "#b2d8cf" }] },
  { featureType: "water",                elementType: "labels.text.fill",  stylers: [{ color: "#4f7c6e" }] },
];

// ════════════════════════════════════════════════════════════
//  GOOGLE MAPS – RESTAURANT (Location Picker)
//  Called as the Maps API callback from restaurant.html
// ════════════════════════════════════════════════════════════
function initRestaurantMap() {
  const mapEl = document.getElementById("restaurantMapPicker");
  if (!mapEl) return;

  // State object to hold map references
  window._restaurantMapState = {
    map: null,
    marker: null,
    autocomplete: null,
    geocoder: null,
    pickedLat: null,
    pickedLng: null,
  };
  const S = window._restaurantMapState;

  S.geocoder = new google.maps.Geocoder();

  function buildMap(center) {
    S.map = new google.maps.Map(mapEl, {
      center,
      zoom: 13,
      styles: NF_MAP_STYLES,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
    });

    // Draggable marker
    S.marker = new google.maps.Marker({
      position: center,
      map: S.map,
      draggable: true,
      animation: google.maps.Animation.DROP,
      title: "Drag me to set pickup location",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "#2f5d50",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 3,
        scale: 11,
      },
    });

    // Click on map → move marker + reverse geocode
    S.map.addListener("click", (e) => {
      placeMarker(e.latLng);
    });

    // Drag marker → reverse geocode on drag end
    S.marker.addListener("dragend", (e) => {
      reverseGeocodeLocation(e.latLng);
      savePickedCoords(e.latLng.lat(), e.latLng.lng());
    });

    // Initial coords
    savePickedCoords(center.lat, center.lng);
    reverseGeocodeLocation(new google.maps.LatLng(center.lat, center.lng));
  }

  function placeMarker(latLng) {
    S.marker.setPosition(latLng);
    S.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(() => S.marker.setAnimation(null), 1400);
    reverseGeocodeLocation(latLng);
    savePickedCoords(latLng.lat(), latLng.lng());
    S.map.panTo(latLng);
  }

  function savePickedCoords(lat, lng) {
    S.pickedLat = lat;
    S.pickedLng = lng;
    const latEl = document.getElementById("pickedLat");
    const lngEl = document.getElementById("pickedLng");
    if (latEl) latEl.value = lat;
    if (lngEl) lngEl.value = lng;

    const coordDisplay = document.getElementById("coordDisplay");
    if (coordDisplay) {
      coordDisplay.innerHTML =
        `<span style="color:#2f5d50;font-weight:600;">📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}</span>`;
    }
  }

  // ── Places Autocomplete search box ─────────────────
  const searchInput = document.getElementById("mapSearchInput");
  if (searchInput) {
    // We build the map first, then attach autocomplete after
    const waitForMap = setInterval(() => {
      if (S.map) {
        clearInterval(waitForMap);
        S.autocomplete = new google.maps.places.Autocomplete(searchInput, {
          componentRestrictions: { country: "in" },
          fields: ["geometry", "formatted_address", "name"],
        });
        S.autocomplete.bindTo("bounds", S.map);

        S.autocomplete.addListener("place_changed", () => {
          const place = S.autocomplete.getPlace();
          if (!place.geometry || !place.geometry.location) return;

          S.map.setCenter(place.geometry.location);
          S.map.setZoom(16);
          placeMarker(place.geometry.location);

          // Fill main location input with place name/address
          const locationInput = document.getElementById("location");
          if (locationInput) {
            locationInput.value = place.formatted_address || place.name || "";
          }
        });
      }
    }, 100);
  }

  // ── "Use My Current Location" button ───────────────
  const geoBtn = document.getElementById("useMyLocationBtn");
  if (geoBtn) {
    geoBtn.addEventListener("click", () => {
      geoBtn.textContent = "⏳ Locating…";
      geoBtn.disabled = true;

      if (!navigator.geolocation) {
        showToast("Geolocation not supported by your browser.", "error");
        geoBtn.textContent = "📍 Use My Location";
        geoBtn.disabled = false;
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
          S.map.setCenter(latLng);
          S.map.setZoom(15);
          placeMarker(latLng);
          geoBtn.textContent = "✅ Location Set";
          setTimeout(() => {
            geoBtn.textContent = "📍 Use My Location";
            geoBtn.disabled = false;
          }, 2000);
        },
        () => {
          showToast("Location access denied. Please click on the map to set location.", "error");
          geoBtn.textContent = "📍 Use My Location";
          geoBtn.disabled = false;
        },
        { timeout: 8000 }
      );
    });
  }

  // ── Try geolocation first, fall back to Delhi ──────
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        buildMap({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        buildMap(DELHI_CENTER);
      },
      { timeout: 6000 }
    );
  } else {
    buildMap(DELHI_CENTER);
  }
}

// ════════════════════════════════════════════════════════════
//  reverseGeocodeLocation
//  Fills the "Pickup Location" input from a LatLng
// ════════════════════════════════════════════════════════════
function reverseGeocodeLocation(latLng) {
  const S = window._restaurantMapState;
  if (!S || !S.geocoder) return;

  S.geocoder.geocode({ location: latLng }, (results, status) => {
    if (status === "OK" && results[0]) {
      const address = results[0].formatted_address;
      const locationInput = document.getElementById("location");
      if (locationInput) locationInput.value = address;

      const addrDisplay = document.getElementById("reversedAddress");
      if (addrDisplay) {
        addrDisplay.textContent = address;
        addrDisplay.style.display = "block";
      }
    }
  });
}

// ════════════════════════════════════════════════════════════
//  GOOGLE MAPS – NGO (Nearby Food Map)
//  Called as the Maps API callback from ngo.html
// ════════════════════════════════════════════════════════════
function initNGOMap() {
  const mapEl = document.getElementById("ngoMapContainer");
  if (!mapEl) return;

  window._ngoMapState = {
    map: null,
    markers: [],
    directionsService: null,
    directionsRenderer: null,
    infoWindow: null,
    userLocation: null,
    currentFilter: "all",
  };
  const S = window._ngoMapState;

  S.directionsService  = new google.maps.DirectionsService();
  S.directionsRenderer = new google.maps.DirectionsRenderer({
    suppressMarkers: false,
    polylineOptions: {
      strokeColor: "#2f5d50",
      strokeWeight: 5,
      strokeOpacity: 0.85,
    },
  });
  S.infoWindow = new google.maps.InfoWindow({ maxWidth: 320 });

  function buildNGOMap(center) {
    S.userLocation = center;

    S.map = new google.maps.Map(mapEl, {
      center,
      zoom: 12,
      styles: NF_MAP_STYLES,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
    });

    S.directionsRenderer.setMap(S.map);

    // NGO location marker (blue)
    new google.maps.Marker({
      position: center,
      map: S.map,
      title: "Your Location (Hope Foundation)",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "#1d4ed8",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 3,
        scale: 11,
      },
      zIndex: 999,
    });

    // User location label
    new google.maps.InfoWindow({
      content: `<div style="font-family:'Poppins',sans-serif;font-size:.78rem;font-weight:700;color:#1d4ed8;padding:2px 4px;">📍 You are here</div>`,
    }).open({ anchor: S.map.data, map: S.map, shouldFocus: false });

    renderNearbyFoodMarkers("all");
    updateMapStats();
  }

  // Start with geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => buildNGOMap({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      ()    => buildNGOMap(DELHI_CENTER),
      { timeout: 6000 }
    );
  } else {
    buildNGOMap(DELHI_CENTER);
  }
}

// ════════════════════════════════════════════════════════════
//  renderNearbyFoodMarkers
//  Plots custom markers for all pending listings on NGO map
// ════════════════════════════════════════════════════════════
function renderNearbyFoodMarkers(filter) {
  const S = window._ngoMapState;
  if (!S || !S.map) return;

  S.currentFilter = filter;

  // Clear existing markers
  S.markers.forEach((m) => m.setMap(null));
  S.markers = [];
  S.infoWindow.close();

  // Clear directions
  S.directionsRenderer.setDirections({ routes: [] });

  const listings = getListings().filter((l) => l.status === "pending" && l.latitude && l.longitude);

  const userLoc = S.userLocation;
  let count = 0;

  listings.forEach((listing) => {
    const dist = calculateDistance(
      userLoc.lat, userLoc.lng,
      listing.latitude, listing.longitude
    );

    // Apply distance filter
    if (filter === "5km"  && dist > 5)  return;
    if (filter === "10km" && dist > 10) return;

    count++;

    // Custom SVG marker
    const isVeg = listing.foodType === "Veg";
    const markerColor = isVeg ? "#2f5d50" : "#b91c1c";

    const svgMarker = {
      url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
        <svg width="44" height="56" viewBox="0 0 44 56" xmlns="http://www.w3.org/2000/svg">
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
          </filter>
          <path d="M22 0C9.85 0 0 9.85 0 22C0 38.5 22 56 22 56C22 56 44 38.5 44 22C44 9.85 34.15 0 22 0Z"
                fill="${markerColor}" filter="url(#shadow)"/>
          <circle cx="22" cy="22" r="14" fill="white"/>
          <text x="22" y="28" text-anchor="middle" font-size="16">${isVeg ? "🥗" : "🍗"}</text>
        </svg>`),
      scaledSize: new google.maps.Size(44, 56),
      anchor: new google.maps.Point(22, 56),
    };

    const marker = new google.maps.Marker({
      position: { lat: listing.latitude, lng: listing.longitude },
      map: S.map,
      title: listing.foodName,
      icon: svgMarker,
      animation: google.maps.Animation.DROP,
    });

    // Build info window content
    const expiringSoon = isExpiringSoon(listing.expiry);
    const infoContent = `
      <div style="font-family:'Poppins',sans-serif;padding:4px 2px;min-width:240px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:10px;">
          <div>
            <h3 style="font-size:.95rem;font-weight:700;color:#1a2e28;margin:0 0 2px;">${listing.foodName}</h3>
            <p style="font-size:.78rem;color:#6b8c84;margin:0;">🏪 ${listing.restaurant}</p>
          </div>
          <span style="background:${isVeg ? "#d1fae5" : "#fee2e2"};color:${isVeg ? "#065f46" : "#991b1b"};
                       font-size:.68rem;font-weight:700;padding:3px 8px;border-radius:50px;white-space:nowrap;">
            ${isVeg ? "🟢 Veg" : "🔴 Non-Veg"}
          </span>
        </div>
        <div style="background:#f3f9f7;border-radius:8px;padding:8px 10px;margin-bottom:10px;font-size:.78rem;color:#3d5a52;display:grid;grid-template-columns:1fr 1fr;gap:4px;">
          <span>📦 ${listing.quantity}</span>
          <span>📏 ${dist.toFixed(1)} km away</span>
          <span>📅 ${listing.expiry}</span>
          <span>📞 ${listing.contact}</span>
        </div>
        ${expiringSoon ? `<div style="background:#fee2e2;color:#991b1b;font-size:.72rem;font-weight:700;padding:4px 10px;border-radius:6px;margin-bottom:8px;">🔥 Expiring Soon!</div>` : ""}
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button onclick="acceptFoodFromMap('${listing.id}')"
                  style="flex:1;background:#2f5d50;color:#fff;border:none;padding:7px 12px;
                         border-radius:50px;font-family:'Poppins',sans-serif;font-size:.78rem;
                         font-weight:700;cursor:pointer;transition:background .2s;">
            🤝 Accept
          </button>
          <button onclick="getDirections(${listing.latitude},${listing.longitude})"
                  style="flex:1;background:#f3f9f7;color:#2f5d50;border:2px solid #2f5d50;
                         padding:7px 12px;border-radius:50px;font-family:'Poppins',sans-serif;
                         font-size:.78rem;font-weight:700;cursor:pointer;transition:all .2s;">
            🗺️ Directions
          </button>
        </div>
      </div>`;

    marker.addListener("click", () => {
      S.infoWindow.setContent(infoContent);
      S.infoWindow.open(S.map, marker);

      // Smooth pan + zoom to marker
      S.map.panTo(marker.getPosition());
      if (S.map.getZoom() < 14) S.map.setZoom(14);
    });

    S.markers.push(marker);
  });

  // Update visible count badge
  const badge = document.getElementById("mapMarkerCount");
  if (badge) badge.textContent = `${count} listing${count !== 1 ? "s" : ""} on map`;

  // Fit map bounds to show all markers + user
  if (S.markers.length > 0) {
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(userLoc);
    S.markers.forEach((m) => bounds.extend(m.getPosition()));
    S.map.fitBounds(bounds, { top: 60, right: 40, bottom: 60, left: 40 });
  }
}

// Accept from info window button
function acceptFoodFromMap(id) {
  const S = window._ngoMapState;
  if (S) S.infoWindow.close();
  acceptFood(id);
}

// ════════════════════════════════════════════════════════════
//  getDirections
//  Draws a route from NGO location to the listing
// ════════════════════════════════════════════════════════════
function getDirections(destLat, destLng) {
  const S = window._ngoMapState;
  if (!S || !S.map) return;

  S.infoWindow.close();

  const origin      = S.userLocation;
  const destination = { lat: destLat, lng: destLng };

  // Show loading toast
  showToast("Calculating route…", "success");

  S.directionsService.route(
    {
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === "OK") {
        S.directionsRenderer.setDirections(result);
        S.map.setZoom(13);

        // Show route summary
        const leg = result.routes[0].legs[0];
        showToast(`Route: ${leg.distance.text} · ${leg.duration.text}`, "success");

        // Show clear route button
        const clearBtn = document.getElementById("clearRouteBtn");
        if (clearBtn) clearBtn.style.display = "flex";
      } else {
        showToast("Directions unavailable for this route. Try opening in Google Maps.", "error");
      }
    }
  );
}

// ════════════════════════════════════════════════════════════
//  calculateDistance  (Haversine formula – returns km)
// ════════════════════════════════════════════════════════════
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R    = 6371; // Earth radius km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function toRad(deg) { return (deg * Math.PI) / 180; }

// ── Update stats bar on NGO map ──────────────────────────
function updateMapStats() {
  const S = window._ngoMapState;
  if (!S || !S.userLocation) return;

  const listings = getListings().filter((l) => l.status === "pending" && l.latitude);
  const within5  = listings.filter((l) => calculateDistance(S.userLocation.lat, S.userLocation.lng, l.latitude, l.longitude) <= 5).length;
  const within10 = listings.filter((l) => calculateDistance(S.userLocation.lat, S.userLocation.lng, l.latitude, l.longitude) <= 10).length;

  const el5  = document.getElementById("mapCount5");
  const el10 = document.getElementById("mapCount10");
  if (el5)  el5.textContent  = within5;
  if (el10) el10.textContent = within10;
}

// ════════════════════════════════════════════════════════════
//  TOAST
// ════════════════════════════════════════════════════════════
function showToast(message, type = "success") {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("toast-show"), 10);
  setTimeout(() => {
    toast.classList.remove("toast-show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ════════════════════════════════════════════════════════════
//  SHARED UI HELPERS
// ════════════════════════════════════════════════════════════
function initMobileMenu() {
  const btn  = document.getElementById("mobileMenuBtn");
  const menu = document.getElementById("mobileMenu");
  if (btn && menu) {
    btn.addEventListener("click", () => menu.classList.toggle("hidden"));
  }
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
        const menu = document.getElementById("mobileMenu");
        if (menu) menu.classList.add("hidden");
      }
    });
  });
}

function animateCounters() {
  const counters  = document.querySelectorAll("[data-count]");
  const observer  = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el    = entry.target;
          const target = parseInt(el.dataset.count);
          let current  = 0;
          const step   = Math.ceil(target / 60);
          const timer  = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = current + (el.dataset.suffix || "");
            if (current >= target) clearInterval(timer);
          }, 25);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((c) => observer.observe(c));
}

function initNavbarScroll() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("navbar-scrolled", window.scrollY > 50);
  });
}

function initTabs() {
  document.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      const group  = btn.dataset.group || "default";
      document.querySelectorAll(`[data-tab][data-group="${group}"]`).forEach((b) => b.classList.remove("tab-active"));
      document.querySelectorAll(`[data-panel][data-group="${group}"]`).forEach((p) => p.classList.add("hidden"));
      btn.classList.add("tab-active");
      const panel = document.querySelector(`[data-panel="${target}"][data-group="${group}"]`);
      if (panel) panel.classList.remove("hidden");
    });
  });
}

// ════════════════════════════════════════════════════════════
//  INIT ON DOM READY
// ════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initSmoothScroll();
  animateCounters();
  initNavbarScroll();
  initTabs();
  initRestaurantDashboard();
  initNGODashboard();
});
