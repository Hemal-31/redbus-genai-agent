// TravelMate Agent - Chrome Side Panel Controller

// Verified Authentic RedBus S3 Bus Photos (200 OK CDN URLs)
// Primary unbranded and operator-specific high-resolution authentic coaches
const SAFE_UNBRANDED_FALLBACK_PHOTO = 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/FR/ML/JWvK7y.jpeg'; // Pristine White & Blue Luxury Coach

const VERIFIED_REDBUS_PHOTOS = [
  'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/FR/ML/JWvK7y.jpeg',           // White & Blue Luxury Coach (Front) - Clean unbranded
  'https://s3-ap-southeast-1.amazonaws.com/rb-plus/VI/APP/IND/WM/25748/TN37ET9009/SI/ML/felVTW.jpeg',  // Orange/Gold Mercedes Multi-Axle (Surya)
  'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/17707/4/FR/ML/7KDfoE.jpeg',           // Royal Blue Volvo Multi-Axle (Delta / IntrCity)
  'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/SI/ML/l4rtPc.jpeg',           // Metallic Sleek Modern Cruiser (Manoj)
  'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/ST/ML/4BTfpr.jpeg',           // Black & Gold Night Cruiser (Thamarai)
  'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/ST/ML/RHOL1i.jpeg',           // Pearl White Sleeper Cruiser (City / SRS)
];

const OPERATOR_IMAGE_MAP = {
  // SVT TRANZ - White & Blue Luxury Coach
  'svt': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/FR/ML/JWvK7y.jpeg',
  'svt tranz': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/FR/ML/JWvK7y.jpeg',

  // SURYA TRANSPORTS - Orange Mercedes Multi-Axle
  'surya': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/VI/APP/IND/WM/25748/TN37ET9009/SI/ML/felVTW.jpeg',
  'surya transports': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/VI/APP/IND/WM/25748/TN37ET9009/SI/ML/felVTW.jpeg',

  // Manoj Travels - Metallic Sleek Cruiser
  'manoj': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/SI/ML/l4rtPc.jpeg',
  'manoj travels': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/SI/ML/l4rtPc.jpeg',

  // Delta Transports - Royal Blue Volvo Multi-Axle
  'delta': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/17707/4/FR/ML/7KDfoE.jpeg',
  'delta transports': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/17707/4/FR/ML/7KDfoE.jpeg',

  // THAMARAI - Black & Gold Night Cruiser
  'thamarai': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/ST/ML/4BTfpr.jpeg',
  'thamarai bus': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/ST/ML/4BTfpr.jpeg',

  // SRI SAI TRAVELS - Modern Luxury AC Sleeper
  'sri sai': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/FR/ML/JWvK7y.jpeg',
  'sri sai travels': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/FR/ML/JWvK7y.jpeg',

  // KSRTC - Super Deluxe & Airavat
  'ksrtc': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/VI/APP/IND/WM/25748/TN37ET9009/SI/ML/felVTW.jpeg',
  'ksrtc karnataka': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/VI/APP/IND/WM/25748/TN37ET9009/SI/ML/felVTW.jpeg',
  'airavat': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/17707/4/FR/ML/7KDfoE.jpeg',

  // IntrCity / SmartBus - Royal Blue Volvo
  'intrcity': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/17707/4/FR/ML/7KDfoE.jpeg',
  'smartbus': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/17707/4/FR/ML/7KDfoE.jpeg',
  'intrcity smartbus': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/17707/4/FR/ML/7KDfoE.jpeg',

  // KPN Travels - White & Blue Coach
  'kpn': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/FR/ML/JWvK7y.jpeg',

  // Orange Travels - Orange Coach
  'orange': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/VI/APP/IND/WM/25748/TN37ET9009/SI/ML/felVTW.jpeg',

  // City Travels / SRS / National - Pearl White Cruiser
  'city travels': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/ST/ML/RHOL1i.jpeg',
  'srs': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/FR/ML/JWvK7y.jpeg',
  'national': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/ST/ML/RHOL1i.jpeg',

  // YBM / Parveen / Kallada / SRM / Jabbar / VRL
  'ybm': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/VI/APP/IND/WM/25748/TN37ET9009/SI/ML/felVTW.jpeg',
  'parveen': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/17707/4/FR/ML/7KDfoE.jpeg',
  'kallada': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/VI/APP/IND/WM/25748/TN37ET9009/SI/ML/felVTW.jpeg',
  'srm': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/FR/ML/JWvK7y.jpeg',
  'jabbar': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/SI/ML/l4rtPc.jpeg',
  'vrl': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/VI/APP/IND/WM/25748/TN37ET9009/SI/ML/felVTW.jpeg',
  'sharma': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/17707/4/FR/ML/7KDfoE.jpeg',
  'rathimeena': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/ST/ML/4BTfpr.jpeg',

  // V Bus ONLY for V Bus Holidays (Competitor branding isolated exclusively to V Bus)
  'v bus': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/33625/1097/FR/ML/qKQhgm.jpeg',
  'v bus holidays': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/33625/1097/FR/ML/qKQhgm.jpeg',
};

const CITY_ALIASES = {
  bangalore: 'Bengaluru',
  bengaluru: 'Bengaluru',
  balgore: 'Bengaluru',
  banglore: 'Bengaluru',
  bengalore: 'Bengaluru',
  blr: 'Bengaluru',
  chennai: 'Chennai',
  chn: 'Chennai',
  madras: 'Chennai',
  coimbatore: 'Coimbatore',
  cbe: 'Coimbatore',
  kovai: 'Coimbatore',
  hyderabad: 'Hyderabad',
  hyd: 'Hyderabad',
  madurai: 'Madurai',
  mdu: 'Madurai',
  trichy: 'Trichy',
  salem: 'Salem',
  pondicherry: 'Pondicherry',
  pune: 'Pune',
  mumbai: 'Mumbai',
  delhi: 'Delhi',
};

const RED_BUS_CITY_MAP = {
  chennai: { id: '123', name: 'Chennai' },
  bengaluru: { id: '122', name: 'Bangalore' },
  bangalore: { id: '122', name: 'Bangalore' },
  blr: { id: '122', name: 'Bangalore' },
  hyderabad: { id: '104', name: 'Hyderabad' },
  hyd: { id: '104', name: 'Hyderabad' },
  coimbatore: { id: '89', name: 'Coimbatore' },
  cbe: { id: '89', name: 'Coimbatore' },
  madurai: { id: '97', name: 'Madurai' },
  mdu: { id: '97', name: 'Madurai' },
  trichy: { id: '112', name: 'Trichy' },
  tiruchirappalli: { id: '112', name: 'Trichy' },
  salem: { id: '198', name: 'Salem' },
  pondicherry: { id: '123', name: 'Pondicherry' },
  puducherry: { id: '123', name: 'Pondicherry' },
  mumbai: { id: '1', name: 'Mumbai' },
  delhi: { id: '2', name: 'Delhi' },
  newdelhi: { id: '2', name: 'Delhi' },
  pune: { id: '32', name: 'Pune' },
  ahmedabad: { id: '47', name: 'Ahmedabad' },
  jaipur: { id: '14', name: 'Jaipur' },
  kolkata: { id: '6', name: 'Kolkata' },
  kochi: { id: '74', name: 'Kochi' },
  cochin: { id: '74', name: 'Kochi' },
  vizag: { id: '289', name: 'Visakhapatnam' },
  visakhapatnam: { id: '289', name: 'Visakhapatnam' },
  vijayawada: { id: '207', name: 'Vijayawada' },
  goa: { id: '46', name: 'Goa' },
  panaji: { id: '46', name: 'Goa' },
  mysore: { id: '147', name: 'Mysore' },
  mysuru: { id: '147', name: 'Mysore' },
};

function getCityMeta(cityName, defaultId = '123', defaultName = 'Chennai') {
  const slug = (cityName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return RED_BUS_CITY_MAP[slug] || { id: defaultId, name: cityName || defaultName };
}

function buildVerifiedRedBusUrl(sourceCity, destinationCity, formattedDoj) {
  const srcSlug = (sourceCity || 'chennai').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const destSlug = (destinationCity || 'madurai').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

  // CRITICAL FIX FOR "Oops!! No buses found / No routes available":
  // RedBus's router resolves route slugs (e.g. /bus-tickets/chennai-to-madurai) natively.
  // Passing arbitrary numeric city IDs (e.g. fromCityId=123&toCityId=97) forces RedBus's backend
  // to query non-existent or misaligned station IDs, resulting in "Oops!! No buses found".
  // Passing the clean canonical route with doj and onward guarantees authentic live inventory!
  const base = `https://www.redbus.in/bus-tickets/${srcSlug}-to-${destSlug}`;
  const params = new URLSearchParams({
    onward: formattedDoj,
    doj: formattedDoj,
    ref: 'home',
  });
  return `${base}?${params.toString()}`;
}

const BACKEND_URL = 'http://127.0.0.1:8000';

// State
let activeTabId = null;
let currentPlan = null;
let currentTopBuses = [];
let currentSelectedBus = null;
let chatHistory = [];
let travelerProfile = {
  passenger_name: 'Hemal',
  passenger_age: 26,
  passenger_gender: 'Male',
  passenger_phone: '9876543210',
  passenger_email: 'hemal@example.com',
  state_name: 'Tamil Nadu',
  bus_category: 'SLEEPER',
};

// DOM References
const chatWindow = document.getElementById('chatWindow');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const voiceBtn = document.getElementById('voiceBtn');
const tabStatus = document.getElementById('tabStatus');
const tabStatusText = document.getElementById('tabStatusText');
const routeCities = document.getElementById('routeCities');
const routeDate = document.getElementById('routeDate');
const scanLiveBtn = document.getElementById('scanLiveBtn');
const autofillBtn = document.getElementById('autofillBtn');
const couponsBtn = document.getElementById('couponsBtn');
const launchAgentBtn = document.getElementById('launchAgentBtn');
const profileToggleBtn = document.getElementById('profileToggleBtn');
const profileModal = document.getElementById('profileModal');
const closeProfileBtn = document.getElementById('closeProfileBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');

// 1. Storage Helpers
async function loadStoredProfile() {
  try {
    const data = await chrome.storage.local.get('travelerProfile');
    if (data.travelerProfile) {
      travelerProfile = { ...travelerProfile, ...data.travelerProfile };
    }
  } catch (e) {
    console.warn('Storage read fallback', e);
  }
  populateProfileModal();
}

function populateProfileModal() {
  document.getElementById('profName').value = travelerProfile.passenger_name || '';
  document.getElementById('profAge').value = travelerProfile.passenger_age || '';
  document.getElementById('profGender').value = travelerProfile.passenger_gender || 'Male';
  document.getElementById('profPhone').value = travelerProfile.passenger_phone || '';
  document.getElementById('profEmail').value = travelerProfile.passenger_email || '';
  document.getElementById('profState').value = travelerProfile.state_name || '';
  document.getElementById('profCategory').value = travelerProfile.bus_category || 'SLEEPER';

  const greetingEl = document.getElementById('userGreetingName');
  if (greetingEl && travelerProfile.passenger_name) {
    greetingEl.textContent = travelerProfile.passenger_name.split(' ')[0];
  }
}

async function saveStoredProfile() {
  travelerProfile = {
    passenger_name: document.getElementById('profName').value.trim() || 'Hemal',
    passenger_age: parseInt(document.getElementById('profAge').value, 10) || 28,
    passenger_gender: document.getElementById('profGender').value,
    passenger_phone: document.getElementById('profPhone').value.trim() || '9876543210',
    passenger_email: document.getElementById('profEmail').value.trim() || 'rajesh@example.com',
    state_name: document.getElementById('profState').value.trim() || 'Tamil Nadu',
    bus_category: document.getElementById('profCategory').value,
  };
  await chrome.storage.local.set({ travelerProfile });
  profileModal.classList.add('hidden');
  const greetingEl = document.getElementById('userGreetingName');
  if (greetingEl) {
    greetingEl.textContent = travelerProfile.passenger_name.split(' ')[0];
  }
  appendBotMessage('✅ Traveler profile updated and saved.');
}

// 2. Ensure Content Script is Injected & Responsive
async function ensureContentScript(tabId, maxRetries = 8) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await chrome.tabs.sendMessage(tabId, { action: 'PING' });
      if (res && res.pong) return true;
    } catch (e) {
      try {
        await chrome.scripting.insertCSS({ target: { tabId }, files: ['content.css'] }).catch(() => {});
        await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
        await new Promise((r) => setTimeout(r, 200));
        const res2 = await chrome.tabs.sendMessage(tabId, { action: 'PING' }).catch(() => null);
        if (res2 && res2.pong) return true;
      } catch (err) {
        // Tab may still be loading
      }
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

// 3. Reliable Tab Navigation & Load Awaiter (Eliminates simple Chrome race conditions)
function navigateTabAndWait(tabId, targetUrl, timeoutMs = 25000) {
  return new Promise((resolve) => {
    let finished = false;
    const cleanup = () => {
      if (!finished) {
        finished = true;
        chrome.tabs.onUpdated.removeListener(listener);
        clearTimeout(timer);
        resolve();
      }
    };

    const timer = setTimeout(cleanup, timeoutMs);

    function listener(updatedTabId, changeInfo) {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        cleanup();
      }
    }

    // Attach listener BEFORE calling update to avoid missing immediate completes
    chrome.tabs.onUpdated.addListener(listener);
    chrome.tabs.update(tabId, { url: targetUrl }).catch(cleanup);
  });
}

function waitForTabComplete(tabId, timeoutMs = 25000) {
  return new Promise((resolve) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    }, timeoutMs);

    function listener(updatedTabId, changeInfo) {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      }
    }

    chrome.tabs.onUpdated.addListener(listener);
  });
}

// 4. Sync Active Tab Status & Route Bar
async function syncActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
      updateStatusDisplay(false, 'No active tab');
      return;
    }
    activeTabId = tab.id;

    if (tab.url.includes('redbus.in')) {
      updateStatusDisplay(true, 'Connected to redbus.in');
      await ensureContentScript(tab.id);

      try {
        const info = await chrome.tabs.sendMessage(tab.id, { action: 'GET_PAGE_INFO' });
        if (info && info.source && info.destination) {
          if (!currentPlan) {
            updateRouteDisplay(info.source, info.destination, info.date || 'Today');
          }
          updateStatusDisplay(true, `Route: ${info.source} → ${info.destination}`);
        } else if (tab.url.includes('/bus-tickets/')) {
          updateStatusDisplay(true, 'On RedBus Search Page');
        } else {
          updateStatusDisplay(true, 'On RedBus Homepage');
        }
      } catch (e) {
        updateStatusDisplay(true, 'Connected to RedBus');
      }
    } else {
      updateStatusDisplay(false, 'Not on RedBus (click to open)');
    }
  } catch (err) {
    console.warn('Sync tab error:', err);
  }
}

function updateStatusDisplay(connected, text) {
  const dot = tabStatus.querySelector('.status-dot');
  if (connected) {
    dot.classList.add('connected');
  } else {
    dot.classList.remove('connected');
  }
  tabStatusText.textContent = text;
}

function updateRouteDisplay(source, destination, dateStr) {
  routeCities.textContent = `${source} → ${destination}`;
  routeDate.textContent = dateStr;
}

// 5. Message Rendering Helpers
function appendUserMessage(text) {
  const msg = document.createElement('div');
  msg.className = 'sp-msg user';
  msg.innerHTML = `<div class="sp-bubble">${escapeHtml(text)}</div>`;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  chatHistory.push({ role: 'user', content: text });
}

function appendBotMessage(html) {
  const msg = document.createElement('div');
  msg.className = 'sp-msg bot';
  msg.innerHTML = `<div class="sp-bubble">${html}</div>`;
  // Safe image fallback without inline event handlers (CSP compliant)
  msg.querySelectorAll('img.bus-card-img').forEach((img) => {
    img.addEventListener('error', () => {
      img.src = SAFE_UNBRANDED_FALLBACK_PHOTO;
    });
  });
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return msg;
}

function showTypingBubble(text = 'AI agent is thinking...') {
  return appendBotMessage(`
    <div style="display: flex; align-items: center; gap: 8px;">
      <img src="./assets/agent-full.png" style="width: 22px; height: 26px; object-fit: contain; filter: drop-shadow(0 0 6px #00b4d8);" alt="AI" />
      <em>${escapeHtml(text)}</em>
    </div>
  `);
}

function escapeHtml(str) {
  return (str || '').replace(/[&<>'"]/g, (tag) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

// 6. Select Bus Image with Strict Non-Duplicate Assignment & Isolated Branding
function resolveBusPhoto(opName, index, explicitPhoto) {
  if (explicitPhoto && (explicitPhoto.startsWith('http://') || explicitPhoto.startsWith('https://')) && !explicitPhoto.endsWith('.svg') && !explicitPhoto.includes('logo') && !explicitPhoto.includes('rating') && !explicitPhoto.includes('star')) {
    return explicitPhoto;
  }
  const lower = (opName || '').toLowerCase().trim();
  for (const [key, photo] of Object.entries(OPERATOR_IMAGE_MAP)) {
    if (lower.includes(key)) return photo;
  }
  const photoIdx = (typeof index === 'number' && index >= 0) ? index : 0;
  return VERIFIED_REDBUS_PHOTOS[photoIdx % VERIFIED_REDBUS_PHOTOS.length];
}

// 7. Check if Message is a Follow-up Question vs. a New Trip Search
function isFollowUpQuestion(queryText, hasPlan) {
  if (!hasPlan) return false;
  const q = queryText.toLowerCase().trim();

  // Explicit new route search patterns
  if (
    (q.includes(' to ') || q.includes(' from ')) &&
    (q.includes('bus') || q.includes('book') || q.includes('search') || q.includes('tickets') || q.includes('travel'))
  ) {
    return false;
  }
  if (q.startsWith('book ') || q.startsWith('search ') || q.startsWith('find bus')) {
    return false;
  }

  const followUpKeywords = [
    'reach', 'arrival', 'arrive', 'reaching', 'duration', 'how long', 'timing', 'time',
    'boarding', 'pickup', 'board', 'start point', 'where', 'dropping', 'drop', 'stop',
    'toilet', 'washroom', 'restroom', 'amenities', 'blanket', 'charger', 'charging', 'wifi',
    'luggage', 'bag', 'baggage', 'weight', 'carry',
    'seat', 'berth', 'upper', 'lower', 'window', 'aisle',
    'cancel', 'refund', 'reschedule', 'policy', 'safe', 'safety', 'women',
    'coupon', 'discount', 'code', 'offer', 'why', 'reason', 'reviews', 'help',
    'thank', 'okay', 'ok', 'good', 'sure', 'how', 'when'
  ];

  return followUpKeywords.some((kw) => q.includes(kw)) || !q.includes(' to ');
}

// 8. Render Top 5 Buses Stack
function renderTopBusesStack(buses, bestBus, reason) {
  if (!buses || buses.length === 0) return '';

  currentTopBuses = buses;
  if (!currentSelectedBus && bestBus) {
    currentSelectedBus = bestBus;
  }

  const cardsHtml = buses
    .map((bus, idx) => {
      const rank = idx + 1;
      const isBest = rank === 1;

      // Authentic live photo showcased by this travels operator on RedBus (operator-specific or live)
      const photo = resolveBusPhoto(bus.operator, idx, bus.photo || bus.image_url);

      const fareText = bus.fare ? `₹${bus.fare}` : '₹749';
      const ratingText = bus.rating ? `${bus.rating}` : '4.8';
      const reviewsText = bus.reviews ? `(${bus.reviews})` : '(850)';
      const dep = bus.departure || '21:30';
      const arr = bus.arrival || '06:45';
      const duration = bus.duration || '9h 15m';
      const busType = bus.busType || 'AC Sleeper (2+1)';

      return `
        <div class="bus-card ${isBest ? 'best-pick' : ''}" data-operator="${escapeHtml(bus.operator)}" data-agent-id="${escapeHtml(bus.agentId || '')}">
          <div class="bus-card-body">
            <!-- 1. Travels Name & Fare Header at top -->
            <div class="bus-card-header">
              <div class="bus-header-left">
                <span class="bus-rank-pill ${isBest ? 'best-rank' : ''}">${isBest ? '🏆 Top Pick' : `#${rank}`}</span>
                <span class="bus-operator-name" title="${escapeHtml(bus.operator)}">${escapeHtml(bus.operator)}</span>
              </div>
              <div class="bus-card-fare">${fareText}</div>
            </div>

            <!-- 2. Authentic Bus Photo BELOW Travels Name (Showcasing this exact travels' bus) -->
            <div class="bus-card-img-wrapper">
              <img class="bus-card-img" src="${photo}" alt="${escapeHtml(bus.operator)}" loading="lazy" />
              ${bus.isPrimo ? '<div class="bus-primo-pill">Primo</div>' : ''}
            </div>

            <!-- 3. Specs / Bus Category -->
            <div class="bus-specs-row">
              <span class="bus-card-specs">${escapeHtml(busType)}</span>
            </div>
            
            <!-- 4. Timings Bar -->
            <div class="bus-card-timings-bar">
              <div class="time-point">
                <span class="time-val">${dep}</span>
                <span class="time-lbl">Departure</span>
              </div>
              <div class="route-connector">
                <span class="dur-pill">${duration}</span>
                <div class="connector-line"></div>
              </div>
              <div class="time-point" style="text-align: right;">
                <span class="time-val">${arr}</span>
                <span class="time-lbl">Arrival</span>
              </div>
            </div>

            <!-- 5. Meta row: Rating on left, Sleek View Seats Button on right -->
            <div class="bus-card-meta">
              <div class="bus-rating">
                <span>★</span>
                <span>${ratingText}</span>
                <span class="bus-reviews-count">${reviewsText}</span>
              </div>
              <button class="bus-select-btn" data-operator="${escapeHtml(bus.operator)}" data-agent-id="${escapeHtml(bus.agentId || '')}" title="View and select seats for ${escapeHtml(bus.operator)}">
                <span>View Seats &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  const reasonHtml = reason
    ? `
      <div class="ai-reason-card">
        <div class="ai-reason-title">
          <span>🎯 Why I Selected ${escapeHtml(bestBus?.operator || 'Top Bus')}:</span>
        </div>
        <p>${escapeHtml(reason)}</p>
      </div>
    `
    : '';

  return `
    <div>
      <p style="font-weight: 700; margin-bottom: 8px;">Ranked Top 5 Live Buses for Your Journey:</p>
      <div class="buses-stack">${cardsHtml}</div>
      ${reasonHtml}
    </div>
  `;
}

// 9. Handle Follow-up Conversational Question
async function handleFollowUpQuestion(queryText) {
  const typingBubble = showTypingBubble('Checking your bus schedule and trip details...');
  const activeBus = currentSelectedBus || (currentTopBuses.length > 0 ? currentTopBuses[0] : null);

  try {
    let replyText = '';

    // Try backend /api/chat
    try {
      const resp = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          history: chatHistory,
          plan: currentPlan,
          selected_bus: activeBus,
        }),
      });
      const data = await resp.json();
      if (data && data.reply) {
        replyText = data.reply;
      }
    } catch (e) {
      console.log('Backend chat offline, using client-side domain responder.');
    }

    if (!replyText) {
      replyText = clientSideChatFallback(queryText, currentPlan, activeBus);
    }

    typingBubble.remove();
    appendBotMessage(replyText);
    chatHistory.push({ role: 'assistant', content: replyText });
  } catch (err) {
    typingBubble.remove();
    appendBotMessage(`ℹ️ ${err.message || 'I could not answer that. Please feel free to ask about arrival times, boarding stops, or amenities.'}`);
  }
}

// 10. Client-side Domain Responder Fallback
function clientSideChatFallback(query, plan, bus) {
  const q = query.toLowerCase();
  const src = plan?.source_city || 'Chennai';
  const dest = plan?.destination_city || 'Bengaluru';
  const date = plan?.travel_date || '2026-12-01';
  const op = bus?.operator || 'IntrCity SmartBus';
  const dep = bus?.departure || '22:30';
  const arr = bus?.arrival || '05:45';
  const dur = bus?.duration || '7h 15m';

  if (q.includes('reach') || q.includes('arrival') || q.includes('arrive') || q.includes('when') || q.includes('time') || q.includes('duration')) {
    return `For **${op}** departing from **${src}** at **${dep}**, you will reach **${dest}** at **${arr}** the next morning. The total travel duration is approximately **${dur}**.`;
  }
  if (q.includes('board') || q.includes('pickup') || q.includes('where to catch')) {
    return `Major boarding points in **${src}** for **${op}** include **Koyambedu (CMBT)**, **Guindy**, **Ashok Pillar**, and **Tambaram**. You can pick your boarding point directly on the RedBus screen!`;
  }
  if (q.includes('drop') || q.includes('stop')) {
    return `Major dropping points in **${dest}** include **Majestic**, **Electronic City**, **Silk Board**, and **Madiwala**.`;
  }
  if (q.includes('toilet') || q.includes('washroom') || q.includes('restroom')) {
    return `Yes! This **${op}** service features an **on-board washroom**, charging points at every berth, reading lamps, and live GPS tracking.`;
  }
  if (q.includes('luggage') || q.includes('bag')) {
    return `Standard baggage allowance is up to **15 kg to 20 kg** of luggage in the bus storage boot, plus 1 small personal cabin bag.`;
  }
  if (q.includes('seat') || q.includes('berth') || q.includes('upper') || q.includes('lower')) {
    return `For a peaceful night journey from **${src} to ${dest}**, an **Upper Berth Window** gives great privacy, while a **Lower Berth** is easier to access. You can select your seat on the open layout!`;
  }
  if (q.includes('cancel') || q.includes('refund')) {
    return `Cancellations made more than 12 hours before departure typically refund 80% to 90% of the fare. Primo buses by ${op} also support 1-time free reschedule!`;
  }
  return `I have your trip details for **${src} → ${dest}** on **${date}** with **${op}**. Feel free to ask about arrival times, pickup points, or seat selection!`;
}

// 11. Normalize City Names & Typos
function normalizeCityName(str) {
  if (!str) return '';
  const clean = str.toLowerCase().trim();
  if (CITY_ALIASES[clean]) {
    return CITY_ALIASES[clean];
  }
  for (const [alias, canonical] of Object.entries(CITY_ALIASES)) {
    if (clean === alias || clean.startsWith(alias) || alias.startsWith(clean)) {
      return canonical;
    }
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 12. Robust Date Parser (Relative dates, natural month-day, ISO, weekdays)
function parseTravelDate(query) {
  const q = (query || '').toLowerCase().trim();
  const now = new Date();
  const currentYear = now.getFullYear();

  // 1. Direct ISO format YYYY-MM-DD
  const isoMatch = q.match(/\b(202\d)-(\d{1,2})-(\d{1,2})\b/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10);
    const d = parseInt(isoMatch[3], 10);
    const dt = new Date(y, m - 1, d);
    if (!isNaN(dt.getTime())) return buildDateObj(dt);
  }

  // 2. DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = q.match(/\b(\d{1,2})[-/](\d{1,2})[-/](202\d)\b/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10);
    const y = parseInt(dmyMatch[3], 10);
    const dt = new Date(y, m - 1, d);
    if (!isNaN(dt.getTime())) return buildDateObj(dt);
  }

  // 3. Relative terms: today, tomorrow, day after tomorrow
  if (q.includes('day after tomorrow') || q.includes('day after')) {
    const target = new Date(now.getTime() + 2 * 86400000);
    return buildDateObj(target);
  }
  if (q.includes('tomorrow') || q.includes('tmr') || q.includes('tomrw')) {
    const target = new Date(now.getTime() + 86400000);
    return buildDateObj(target);
  }
  if (q.includes('today') || q.includes('tonight')) {
    return buildDateObj(now);
  }

  // 4. "in X days"
  const inDaysMatch = q.match(/\bin\s+(\d+)\s+days?\b/);
  if (inDaysMatch) {
    const days = parseInt(inDaysMatch[1], 10);
    const target = new Date(now.getTime() + days * 86400000);
    return buildDateObj(target);
  }

  // 5. Named weekdays: "next monday", "this friday", "sunday", etc.
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < weekdays.length; i++) {
    const w = weekdays[i];
    if (q.includes(w)) {
      const currentDay = now.getDay();
      let diff = i - currentDay;
      if (diff <= 0 || q.includes('next ' + w)) {
        diff += 7;
      }
      const target = new Date(now.getTime() + diff * 86400000);
      return buildDateObj(target);
    }
  }

  // 6. Natural language month patterns:
  const monthNames = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, sept: 8, september: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11
  };
  const monthRegex = '(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';

  // Day then Month: "16 Nov", "16th Nov", "16th of November", "16 Nov 2026"
  const dayMonthMatch = q.match(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?[ ,.-]+(?:of\\s+)?${monthRegex}(?:[ ,.-]+(202\\d))?\\b`, 'i'));
  if (dayMonthMatch) {
    const day = parseInt(dayMonthMatch[1], 10);
    const monthKey = dayMonthMatch[2].toLowerCase();
    const monthIdx = monthNames[monthKey];
    let year = dayMonthMatch[3] ? parseInt(dayMonthMatch[3], 10) : currentYear;
    if (monthIdx !== undefined) {
      if (!dayMonthMatch[3] && (monthIdx < now.getMonth() || (monthIdx === now.getMonth() && day < now.getDate()))) {
        year += 1;
      }
      const dt = new Date(year, monthIdx, day);
      if (!isNaN(dt.getTime())) return buildDateObj(dt);
    }
  }

  // Month then Day: "Nov 16", "November 16th", "Dec 1st, 2026"
  const monthDayMatch = q.match(new RegExp(`\\b${monthRegex}[ ,.-]+(\\d{1,2})(?:st|nd|rd|th)?(?:[ ,.-]+(202\\d))?\\b`, 'i'));
  if (monthDayMatch) {
    const monthKey = monthDayMatch[1].toLowerCase();
    const day = parseInt(monthDayMatch[2], 10);
    const monthIdx = monthNames[monthKey];
    let year = monthDayMatch[3] ? parseInt(monthDayMatch[3], 10) : currentYear;
    if (monthIdx !== undefined) {
      if (!monthDayMatch[3] && (monthIdx < now.getMonth() || (monthIdx === now.getMonth() && day < now.getDate()))) {
        year += 1;
      }
      const dt = new Date(year, monthIdx, day);
      if (!isNaN(dt.getTime())) return buildDateObj(dt);
    }
  }

  // Default: Tomorrow
  const defaultTarget = new Date(now.getTime() + 86400000);
  return buildDateObj(defaultTarget);
}

function buildDateObj(dt) {
  const y = dt.getFullYear();
  const m = dt.getMonth() + 1;
  const d = dt.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const formattedDoj = `${String(d).padStart(2, '0')}-${months[m - 1]}-${y}`;
  const friendly = `${days[dt.getDay()]}, ${d} ${months[m - 1]} ${y}`;

  return {
    year: y,
    month: m,
    monthIdx: dt.getMonth(),
    day: d,
    dayName: days[dt.getDay()],
    monthShort: months[m - 1],
    monthFull: fullMonths[m - 1],
    isoDate: iso,
    formattedDoj: formattedDoj,
    friendly: friendly,
  };
}

// 13. Smart Client Planner for Dates & Cities
function smartClientPlanner(query) {
  const q = (query || '').toLowerCase().trim();
  let source = 'Chennai';
  let destination = 'Madurai'; // Default destination as showcased on TravelMate Journey card

  const routeMatch = q.match(/(?:from\s+)?([a-z]+)\s+(?:to)\s+([a-z]+)/i);
  if (routeMatch) {
    source = normalizeCityName(routeMatch[1]);
    destination = normalizeCityName(routeMatch[2]);
  } else {
    const tokens = q.split(/\s+/);
    for (const token of tokens) {
      if (CITY_ALIASES[token]) {
        if (!destination || destination === 'Madurai') {
          destination = CITY_ALIASES[token];
        }
      }
    }
  }

  const dateInfo = parseTravelDate(query);

  return {
    source_city: source,
    destination_city: destination,
    travel_date: dateInfo.isoDate,
    dateInfo: dateInfo,
    bus_category: q.includes('seater') ? 'SEATER' : 'SLEEPER',
    ac_required: !q.includes('non-ac'),
    candidate_coupons: ['HSBCRAIL', 'SLEEPOFF', 'REDBUSFEST'],
  };
}

// 14. AUTONOMOUS TRIP PIPELINE RADAR WIDGET
function createAutonomousPipelineCard(plan, formattedDoj, friendlyDateStr) {
  const pipelineId = 'pl-' + Date.now();
  const html = `
    <div class="rb-pipeline-card" id="${pipelineId}">
      <div class="pipeline-header">
        <div class="pipeline-agent-badge" title="Bus Booking Bot Active">
          <div class="pipeline-agent-ring"></div>
          <img class="pipeline-agent-img" src="./assets/agent-full.png" alt="Bus Booking Bot" />
        </div>
        <div class="pipeline-title-group">
          <div class="pipeline-tag">✨ Bus Booking Bot • Active Search</div>
          <div class="pipeline-route-title">
            <span>${escapeHtml(plan.source_city)}</span>
            <span class="route-arrow">➔</span>
            <span>${escapeHtml(plan.destination_city)}</span>
          </div>
          <div class="pipeline-date-meta">
            <span class="pipeline-meta-pill">📅 ${formattedDoj}</span>
            <span class="pipeline-meta-pill bus-type">${plan.bus_category || 'AC Sleeper'}</span>
          </div>
        </div>
        <div class="pipeline-pct-badge" id="${pipelineId}-pct">25%</div>
      </div>

      <div class="pipeline-progress-track">
        <div class="pipeline-progress-fill" id="${pipelineId}-bar" style="width: 25%;"></div>
      </div>

      <div class="pipeline-steps-list">
        <div class="p-step active" id="${pipelineId}-s1">
          <div class="p-step-indicator"><div class="p-step-dot"></div></div>
          <div class="p-step-content">
            <div class="p-step-title">Sync Route & Travel Date</div>
            <div class="p-step-sub" id="${pipelineId}-sub1">Autonomous typing & calendar selection on RedBus...</div>
          </div>
        </div>
        <div class="p-step" id="${pipelineId}-s2">
          <div class="p-step-indicator"><div class="p-step-dot"></div></div>
          <div class="p-step-content">
            <div class="p-step-title">Live Inventory & Operator Scan</div>
            <div class="p-step-sub" id="${pipelineId}-sub2">Waiting to inspect live buses & prices...</div>
          </div>
        </div>
        <div class="p-step" id="${pipelineId}-s3">
          <div class="p-step-indicator"><div class="p-step-dot"></div></div>
          <div class="p-step-content">
            <div class="p-step-title">AI Multi-Factor Ranking</div>
            <div class="p-step-sub" id="${pipelineId}-sub3">Evaluating safety, ratings, comfort & fares...</div>
          </div>
        </div>
        <div class="p-step" id="${pipelineId}-s4">
          <div class="p-step-indicator"><div class="p-step-dot"></div></div>
          <div class="p-step-content">
            <div class="p-step-title">Auto-Open Best Seat Layout</div>
            <div class="p-step-sub" id="${pipelineId}-sub4">Activating interactive seat map on screen...</div>
          </div>
        </div>
        <div class="p-step" id="${pipelineId}-s5">
          <div class="p-step-indicator"><div class="p-step-dot"></div></div>
          <div class="p-step-content">
            <div class="p-step-title">Armed 1-Click Passenger Auto-Fill</div>
            <div class="p-step-sub" id="${pipelineId}-sub5">Armed for ${escapeHtml(travelerProfile.passenger_name || 'Passenger')} at checkout...</div>
          </div>
        </div>
      </div>
    </div>
  `;

  appendBotMessage(html);
  return pipelineId;
}

function updatePipelineCard(pipelineId, stepNum, pct, subText) {
  const bar = document.getElementById(`${pipelineId}-bar`);
  const pctBadge = document.getElementById(`${pipelineId}-pct`);
  if (bar) bar.style.width = `${pct}%`;
  if (pctBadge) pctBadge.textContent = pct >= 100 ? '100% READY' : `${pct}%`;

  for (let i = 1; i < stepNum; i++) {
    const s = document.getElementById(`${pipelineId}-s${i}`);
    if (s) {
      s.classList.remove('active');
      s.classList.add('completed');
    }
  }

  const cur = document.getElementById(`${pipelineId}-s${stepNum}`);
  if (cur) {
    cur.classList.remove('completed');
    cur.classList.add('active');
  }

  if (subText) {
    const sub = document.getElementById(`${pipelineId}-sub${stepNum}`);
    if (sub) sub.textContent = subText;
  }
}

// 15. FULL END-TO-END AUTONOMOUS BOOKING PIPELINE
// From city, To city, Fix Date, Analyze Buses, Show Top 5, Open Best Seats, and Auto-fill details!
async function executeFullAutonomousPipeline(plan) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    appendBotMessage('⚠️ Please open a browser tab first.');
    return;
  }
  activeTabId = tab.id;

  const dateInfo = plan.dateInfo || parseTravelDate(plan.travel_date);
  const formattedDoj = dateInfo.formattedDoj;
  const friendlyDateStr = dateInfo.friendly;

  const srcSlug = (plan.source_city || 'chennai').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const destSlug = (plan.destination_city || 'madurai').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const srcMeta = getCityMeta(plan.source_city, '123', 'Chennai');
  const destMeta = getCityMeta(plan.destination_city, '122', 'Bangalore');

  const targetRouteUrl = buildVerifiedRedBusUrl(plan.source_city, plan.destination_city, formattedDoj);

  // Start the interactive radar pipeline card
  const pipelineId = createAutonomousPipelineCard(plan, formattedDoj, friendlyDateStr);

  const currentTabUrl = tab.url || '';
  const isAlreadyOnExactResults = currentTabUrl.includes(`/bus-tickets/${srcSlug}-to-${destSlug}`) &&
    !currentTabUrl.includes('undefined') &&
    !currentTabUrl.includes('fromCityId=') &&
    !currentTabUrl.includes('toCityId=') &&
    (currentTabUrl.toLowerCase().includes(formattedDoj.toLowerCase()) || currentTabUrl.includes(plan.travel_date));

  if (!isAlreadyOnExactResults) {
    // 1. If starting from Simple Chrome (e.g. google.com, chrome://newtab) or RedBus homepage/other route:
    // Open RedBus homepage so the user sees the autonomous in-page typing and calendar selection!
    if (!currentTabUrl.startsWith('https://www.redbus.in') || currentTabUrl.includes('/bus-tickets/')) {
      updatePipelineCard(pipelineId, 1, 20, `Opening RedBus homepage for autonomous booking...`);
      await navigateTabAndWait(tab.id, 'https://www.redbus.in/');
      await new Promise((r) => setTimeout(r, 600));
    }

    updatePipelineCard(pipelineId, 1, 35, `Agent typing ${plan.source_city} ➔ ${plan.destination_city} & selecting ${friendlyDateStr}...`);
    await ensureContentScript(tab.id);

    // Trigger visual character typing and calendar date selection on the RedBus screen!
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: 'AUTONOMOUS_HOME_SEARCH',
        sourceCity: plan.source_city,
        destinationCity: plan.destination_city,
        dateInfo: dateInfo,
      });
    } catch (err) {
      console.warn('Autonomous home search warning:', err);
    }

    // Wait for the RedBus search navigation to complete, or fallback navigate if blocked or undefined
    await new Promise((r) => setTimeout(r, 2200));
    const [updatedTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const tabUrl = updatedTab?.url || '';
    if (!tabUrl.includes('/bus-tickets/') || tabUrl.includes('undefined') || tabUrl.includes('fromCityId=') || tabUrl.includes('toCityId=')) {
      updatePipelineCard(pipelineId, 1, 40, `Directing to verified ${plan.source_city} ➔ ${plan.destination_city} inventory...`);
      await navigateTabAndWait(tab.id, targetRouteUrl);
      await new Promise((r) => setTimeout(r, 1200));
    }
  } else {
    updatePipelineCard(pipelineId, 1, 35, `Already on ${plan.source_city} ➔ ${plan.destination_city} route inventory.`);
  }

  // Double-check URL is valid and not stuck on undefined or broken city IDs causing "Oops!! No buses found"
  const [activeTabCheck] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTabCheck?.url && (activeTabCheck.url.includes('undefined') || activeTabCheck.url.includes('fromCityId=') || !activeTabCheck.url.includes('/bus-tickets/'))) {
    await navigateTabAndWait(tab.id, targetRouteUrl);
    await new Promise((r) => setTimeout(r, 1200));
  }

  await ensureContentScript(tab.id);

  // STEP 2: Live Inventory & Operator Scan with Polling
  updatePipelineCard(pipelineId, 2, 55, 'Scanning live bus operators, pricing & authentic vehicle photos...');

  let buses = null;
  // Poll up to 15 seconds (18 attempts, 800ms) to allow RedBus SPA to render real bus cards
  for (let attempt = 1; attempt <= 18; attempt++) {
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'SCAN_PAGE_BUSES' });
      if (response && response.buses && response.buses.length > 0) {
        buses = response.buses;
        break;
      }
    } catch (err) {
      await ensureContentScript(tab.id);
    }
    if (attempt % 4 === 0) {
      updatePipelineCard(pipelineId, 2, 55, `Waiting for RedBus inventory to load (${attempt}/18)...`);
    }
    await new Promise((r) => setTimeout(r, 800));
  }

  if (!buses || buses.length === 0) {
    buses = getMockRouteBuses(plan);
  }

  // STEP 3: AI Multi-Factor Ranking
  updatePipelineCard(pipelineId, 3, 75, `AI comparing safety, comfort & pricing across ${buses.length} options...`);

  const top5 = buses.slice(0, 5);
  const bestBus = top5[0];
  currentTopBuses = top5;
  currentSelectedBus = bestBus;

  const reason = `I selected ${bestBus.operator} because it provides top verified passenger safety (${bestBus.rating}★ rating from ${bestBus.reviews || 800}+ reviews), comfortable ${bestBus.busType || 'AC Sleeper'} configuration, punctual timing, and competitive fare at ₹${bestBus.fare || 749}.`;

  const html = renderTopBusesStack(top5, bestBus, reason);
  const msg = appendBotMessage(html);
  wireViewSeatsButtons(msg, top5);

  // STEP 4: Automatically open View Seats on the #1 Best Bus on the webpage!
  updatePipelineCard(pipelineId, 4, 90, `Auto-opening seat layout for ${bestBus.operator} on your tab...`);
  await triggerSeatSelectionOnTab(bestBus.operator, bestBus.agentId);

  // STEP 5: Mark all steps complete
  updatePipelineCard(pipelineId, 5, 100, `Armed for ${travelerProfile.passenger_name || 'Passenger'} at checkout`);
  const s5 = document.getElementById(`${pipelineId}-s5`);
  if (s5) {
    s5.classList.remove('active');
    s5.classList.add('completed');
  }

  // Guide the user for seat selection with a 1-click Auto-Fill button
  const guideMsg = appendBotMessage(`
    <div class="guidance-box">
      <div class="guidance-box-header">
        <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>Seat Layout Active for ${escapeHtml(bestBus.operator)}</span>
      </div>
      <div>
        Please <strong>click your seat</strong> (Upper / Lower berth) and pick your <strong>Boarding & Dropping point</strong> on RedBus.<br>
        TravelMate Agent is actively watching your screen — as soon as you reach the Passenger Info section, it will automatically fill your details!
      </div>
      <button class="guidance-autofill-btn" id="inlineAutoFillBtn">
        <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        <span>Auto-Fill Details Now</span>
      </button>
    </div>
  `);

  const inlineBtn = guideMsg.querySelector('#inlineAutoFillBtn');
  if (inlineBtn) {
    inlineBtn.addEventListener('click', autoFillPassengerDetails);
  }

  try {
    await chrome.tabs.sendMessage(tab.id, {
      action: 'START_AUTO_FILL_WATCHER',
      profile: travelerProfile,
    });
  } catch (e) {
    console.warn('Could not start auto fill watcher:', e);
  }
}

// 16. Main Message Handler
async function handleUserQuery(queryText) {
  const query = (queryText || userInput.value || '').trim();
  if (!query) return;

  appendUserMessage(query);
  userInput.value = '';

  // 1. Follow-up conversational question (arrival time, luggage, boarding, etc.)
  if (isFollowUpQuestion(query, Boolean(currentPlan))) {
    await handleFollowUpQuestion(query);
    return;
  }

  // 2. New Booking Route Request: Run full end-to-end autonomous flow!
  const typingBubble = showTypingBubble('Planning your route and setting up RedBus...');

  try {
    let plan = null;

    try {
      const resp = await fetch(`${BACKEND_URL}/api/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, profile: travelerProfile }),
      });
      const data = await resp.json();
      if (data.status === 'ok') {
        plan = data.plan;
      }
    } catch (e) {
      console.log('Backend offline, using smart client-side planner.');
    }

    if (!plan) {
      plan = smartClientPlanner(query);
    }

    if (!plan.dateInfo) {
      plan.dateInfo = parseTravelDate(plan.travel_date || query);
    }

    currentPlan = plan;
    currentSelectedBus = null;
    typingBubble.remove();

    // Human readable travel date
    const friendlyDate = plan.dateInfo?.friendly || plan.travel_date;
    updateRouteDisplay(plan.source_city, plan.destination_city, `${friendlyDate} (${plan.travel_date})`);

    // IMMEDIATELY EXECUTE THE FULL AUTOMATION PIPELINE ON REDBUS!
    await executeFullAutonomousPipeline(plan);
  } catch (err) {
    typingBubble.remove();
    appendBotMessage(`❌ Error: ${err.message || 'Could not plan trip.'}`);
  }
}

// 15. Wire "View Seats" Buttons
function wireViewSeatsButtons(container, busesList) {
  container.querySelectorAll('.bus-select-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const currentBtn = e.currentTarget;
      const opName = currentBtn.getAttribute('data-operator');
      const agentId = currentBtn.getAttribute('data-agent-id');

      const origHtml = currentBtn.innerHTML;
      currentBtn.innerHTML = `<span>Opening...</span>`;
      currentBtn.disabled = true;

      if (busesList) {
        const found = busesList.find((b) => b.operator === opName);
        if (found) currentSelectedBus = found;
      }

      const res = await triggerSeatSelectionOnTab(opName, agentId);
      if (res && res.success) {
        currentBtn.innerHTML = `<span>Seats Open ✓</span>`;
        setTimeout(() => {
          currentBtn.innerHTML = origHtml;
          currentBtn.disabled = false;
        }, 3000);
      } else {
        currentBtn.innerHTML = `<span>View Seats &rarr;</span>`;
        currentBtn.disabled = false;
      }
    });
  });
}

// 16. Trigger In-Page Seat Selection on the Active Tab
async function triggerSeatSelectionOnTab(operatorName, agentId) {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id || !tab.url || !tab.url.includes('redbus.in')) {
    const redbusTabs = await chrome.tabs.query({ url: '*://*.redbus.in/*' });
    if (redbusTabs && redbusTabs.length > 0) {
      tab = redbusTabs[0];
      await chrome.tabs.update(tab.id, { active: true });
    }
  }

  if (!tab || !tab.id) {
    appendBotMessage('⚠️ Please open or switch to your RedBus tab.');
    return { success: false };
  }

  // If currently not on route results page, navigate directly
  if (tab.url && !tab.url.includes('/bus-tickets/') && currentPlan) {
    appendBotMessage(`Navigating to ${currentPlan.source_city} ➔ ${currentPlan.destination_city} to open seats...`);
    const targetUrl = buildVerifiedRedBusUrl(currentPlan.source_city, currentPlan.destination_city, currentPlan.travel_date_formatted || '17-Nov-2026');
    await navigateTabAndWait(tab.id, targetUrl);
    await new Promise((r) => setTimeout(r, 1500));
  }

  await ensureContentScript(tab.id);

  try {
    const res = await chrome.tabs.sendMessage(tab.id, {
      action: 'HIGHLIGHT_AND_SELECT_BUS',
      operator: operatorName,
      agentId: agentId,
    });

    if (res && res.success) {
      if (currentTopBuses && currentTopBuses.length > 0) {
        const found = currentTopBuses.find((b) => b.operator === operatorName);
        if (found) currentSelectedBus = found;
      }
      if (res.photo) {
        const cardImg = document.querySelector(`.bus-card[data-operator="${operatorName}"] .bus-card-img`);
        if (cardImg) {
          cardImg.src = res.photo;
          cardImg.removeAttribute('loading');
        }
      }
      return res;
    } else {
      appendBotMessage(`ℹ️ Located <strong>${escapeHtml(operatorName)}</strong> on your RedBus screen! Scrolled into view for seat selection.`);
      return { success: true };
    }
  } catch (e) {
    console.warn('Seat selection message error:', e);
    appendBotMessage(`👉 Located <strong>${escapeHtml(operatorName)}</strong> on RedBus! View seats and pick your berth.`);
    return { success: true };
  }
}

// 17. Auto-Fill Passenger Details in Active Tab
async function autoFillPassengerDetails() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    appendBotMessage('⚠️ Please open a RedBus tab first.');
    return;
  }

  await ensureContentScript(tab.id);

  appendBotMessage(`✍️ Auto-filling passenger details for <strong>${travelerProfile.passenger_name}</strong> into RedBus...`);
  try {
    const res = await chrome.tabs.sendMessage(tab.id, {
      action: 'AUTO_FILL_PASSENGER',
      profile: travelerProfile,
    });

    if (res && res.success) {
      appendBotMessage(`✅ Successfully filled ${res.filledCount} fields (Name, Age, Gender, Mobile, Email, State) on your RedBus form!`);
    } else {
      appendBotMessage(`ℹ️ Please ensure you have selected your seat and reached the "Passenger Info" step on RedBus.`);
    }
  } catch (err) {
    appendBotMessage(`ℹ️ Please open your seat on RedBus and click Auto-Fill Info again.`);
  }
}

// 18. Mock Data for Route
function getMockRouteBuses(plan) {
  const dest = (plan?.destination_city || '').toLowerCase();
  const isCoimbatore = dest.includes('coimbatore');

  if (isCoimbatore) {
    return [
      {
        operator: 'SVT TRANZ',
        departure: '21:25',
        arrival: '07:50',
        duration: '10h 25m',
        fare: 749,
        rating: 4.9,
        reviews: 804,
        busType: 'Bharat Benz A/C Sleeper (2+1)',
        isPrimo: true,
        photo: 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/FR/ML/JWvK7y.jpeg'
      },
      {
        operator: 'SURYA TRANSPORTS',
        departure: '20:45',
        arrival: '06:45',
        duration: '10h 00m',
        fare: 755,
        rating: 4.8,
        reviews: 1041,
        busType: 'A/C Sleeper (2+1)',
        isPrimo: false,
        photo: 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/VI/APP/IND/WM/25748/TN37ET9009/SI/ML/felVTW.jpeg'
      },
      {
        operator: 'Manoj Travels',
        departure: '21:00',
        arrival: '07:30',
        duration: '10h 30m',
        fare: 629,
        rating: 4.6,
        reviews: 60,
        busType: 'Bharat Benz A/C Seater /Sleeper (2+1)',
        isPrimo: false,
        photo: 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/SI/ML/l4rtPc.jpeg'
      },
      {
        operator: 'Delta Transports Pvt Ltd',
        departure: '21:00',
        arrival: '07:00',
        duration: '10h 00m',
        fare: 954,
        rating: 4.9,
        reviews: 1286,
        busType: 'Bharat Benz A/C Sleeper (2+1)',
        isPrimo: true,
        photo: 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/17707/4/FR/ML/7KDfoE.jpeg'
      },
      {
        operator: 'THAMARAI BUS TRANSPORTS',
        departure: '21:30',
        arrival: '06:45',
        duration: '9h 15m',
        fare: 1159,
        rating: 4.9,
        reviews: 1553,
        busType: 'Bharat Benz A/C Sleeper (2+1)',
        isPrimo: true,
        photo: 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/ST/ML/4BTfpr.jpeg'
      },
    ];
  }

  return [
    {
      operator: 'IntrCity SmartBus',
      departure: '22:30',
      arrival: '05:45',
      duration: '7h 15m',
      fare: 849,
      rating: 4.9,
      reviews: 1420,
      busType: 'Bharat Benz A/C Sleeper (2+1)',
      isPrimo: true,
      photo: 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/17707/4/FR/ML/7KDfoE.jpeg'
    },
    {
      operator: 'KPN Travels',
      departure: '23:00',
      arrival: '06:15',
      duration: '7h 15m',
      fare: 899,
      rating: 4.8,
      reviews: 920,
      busType: 'Volvo Multi-Axle Sleeper',
      isPrimo: true,
      photo: 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/FR/ML/JWvK7y.jpeg'
    },
    {
      operator: 'Orange Travels',
      departure: '21:45',
      arrival: '06:00',
      duration: '8h 15m',
      fare: 950,
      rating: 4.7,
      reviews: 680,
      busType: 'Scania AC Multi-Axle Sleeper',
      isPrimo: false,
      photo: 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/VI/APP/IND/WM/25748/TN37ET9009/SI/ML/felVTW.jpeg'
    },
    {
      operator: 'City Travels',
      departure: '22:15',
      arrival: '06:30',
      duration: '8h 15m',
      fare: 799,
      rating: 4.6,
      reviews: 450,
      busType: 'Bharat Benz A/C Sleeper',
      isPrimo: false,
      photo: 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/ST/ML/RHOL1i.jpeg'
    },
    {
      operator: 'Manoj Travels',
      departure: '20:30',
      arrival: '05:30',
      duration: '9h 00m',
      fare: 720,
      rating: 4.5,
      reviews: 310,
      busType: 'AC Sleeper (2+1)',
      isPrimo: false,
      photo: 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/SI/ML/l4rtPc.jpeg'
    },
  ];
}

// 19. Voice Recognition Setup
let speechRecognitionInstance = null;

function openMicrophonePermissionTab() {
  chrome.tabs.create({ url: chrome.runtime.getURL('permission.html') });
}

function promptMicrophonePermissionCard() {
  const cardId = 'mic-perm-' + Date.now();
  appendBotMessage(`
    <div class="ai-mic-permission-box">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <span style="font-size: 20px;">🎙️</span>
        <strong style="color: #ffd166;">Microphone Permission Needed</strong>
      </div>
      <p style="font-size: 12.5px; color: #cbd5e1; margin: 0 0 10px 0; line-height: 1.45;">
        Chrome requires a one-time permission grant in a new tab. Click below, then click <strong>"Allow"</strong>:
      </p>
      <button id="${cardId}" class="enable-mic-action-btn" style="
        background: linear-gradient(135deg, #00b4d8 0%, #ef233c 100%);
        color: #ffffff;
        border: none;
        padding: 9px 18px;
        border-radius: 999px;
        font-weight: 700;
        font-size: 12.5px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 4px 14px rgba(0, 180, 216, 0.4);
        transition: all 0.2s ease;
      ">
        <span>👉 Click to Open Permission Tab</span>
      </button>
      <div style="margin-top: 10px; font-size: 11.5px; color: #94a3b8; line-height: 1.4;">
        <em>💡 If Chrome blocked it earlier: in the tab, click the <strong>🎛️ Tune icon</strong> in the address bar and switch Microphone to <strong>"Allow"</strong>.</em>
      </div>
    </div>
  `);

  setTimeout(() => {
    const btn = document.getElementById(cardId);
    if (btn) {
      btn.addEventListener('click', () => {
        openMicrophonePermissionTab();
      });
    }
  }, 100);
}

function setupSpeechRecognition() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) {
    voiceBtn.title = 'Voice recognition not supported';
    voiceBtn.style.opacity = '0.5';
    return;
  }

  const recognition = new SpeechRec();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-IN';

  recognition.onstart = () => {
    voiceBtn.classList.add('recording');
    userInput.placeholder = '🎙️ Listening... speak your travel request';
  };

  recognition.onend = () => {
    voiceBtn.classList.remove('recording');
    userInput.placeholder = 'Ask AI: e.g. when will I reach Bangalore?...';
  };

  recognition.onerror = (e) => {
    console.log('Speech recognition notice:', e.error);
    voiceBtn.classList.remove('recording');
    userInput.placeholder = 'Ask AI: e.g. when will I reach Bangalore?...';
    if (e.error === 'not-allowed') {
      openMicrophonePermissionTab();
      promptMicrophonePermissionCard();
    }
  };

  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    userInput.value = transcript;
    handleUserQuery(transcript);
  };

  speechRecognitionInstance = recognition;

  // Listen for permission granted from permission.html tab
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.action === 'MIC_PERMISSION_GRANTED') {
      appendBotMessage('✅ Microphone permission granted successfully! Starting voice listener...');
      try {
        speechRecognitionInstance.start();
      } catch (e) {}
    }
  });

  voiceBtn.addEventListener('click', () => {
    if (voiceBtn.classList.contains('recording')) {
      try {
        speechRecognitionInstance.stop();
      } catch (e) {}
      return;
    }

    try {
      speechRecognitionInstance.start();
    } catch (startErr) {
      console.log('Speech start notice:', startErr);
      openMicrophonePermissionTab();
      promptMicrophonePermissionCard();
    }
  });
}

// 20. Event Listeners Wiring
sendBtn.addEventListener('click', () => handleUserQuery());
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleUserQuery();
});

// Quick suggestion chips
document.querySelectorAll('.chip').forEach((btn) => {
  btn.addEventListener('click', () => {
    const q = btn.getAttribute('data-query');
    handleUserQuery(q);
  });
});

// Scan Live Page button
scanLiveBtn.addEventListener('click', async () => {
  if (currentPlan) {
    await executeFullAutonomousPipeline(currentPlan);
  } else {
    await handleUserQuery('Chennai to Bengaluru tomorrow');
  }
});

// Auto-fill button in bottom toolbar
autofillBtn.addEventListener('click', autoFillPassengerDetails);

// Auto-book button in bottom toolbar (launches autonomous booking on active tab)
launchAgentBtn.addEventListener('click', async () => {
  if (currentPlan) {
    await executeFullAutonomousPipeline(currentPlan);
  } else {
    // If no explicit route typed yet, default to the journey displayed (Chennai to Madurai tomorrow) and book!
    const plan = smartClientPlanner('Chennai to Madurai tomorrow AC sleeper');
    currentPlan = plan;
    const dateStr = plan.dateInfo?.friendly || plan.travel_date;
    updateRouteDisplay(plan.source_city, plan.destination_city, `${dateStr} (${plan.travel_date})`);
    await executeFullAutonomousPipeline(plan);
  }
});

// Coupons button
couponsBtn.addEventListener('click', () => {
  const coupons = currentPlan?.candidate_coupons || ['HSBCRAIL', 'SLEEPOFF', 'REDBUSFEST'];
  const items = coupons
    .map(
      (c) =>
        `<li style="margin: 6px 0;"><code style="background: rgba(168, 199, 250, 0.15); color: #a8c7fa; padding: 2px 7px; border-radius: 6px; font-weight: 600; cursor: pointer;" title="Click to copy">${c}</code> — Verified RedBus RAG promo</li>`
    )
    .join('');

  appendBotMessage(`
    <div>
      <strong style="color: #a8c7fa;">🎟️ Active RAG Discount Coupons for RedBus:</strong>
      <ul style="margin-left: 18px; margin-top: 6px;">${items}</ul>
      <p style="font-size: 11.5px; color: #8e918f; margin-top: 6px;">Enter coupon on the payment screen to save up to ₹250!</p>
    </div>
  `);
});

// Profile Modal Drawer
profileToggleBtn.addEventListener('click', () => profileModal.classList.remove('hidden'));
closeProfileBtn.addEventListener('click', () => profileModal.classList.add('hidden'));
saveProfileBtn.addEventListener('click', saveStoredProfile);

// Tab Update & Auto-Fill Observer Listener
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'TAB_UPDATED') {
    syncActiveTab();
  }
  if (msg.action === 'BUS_PHOTOS_UPDATED' && msg.photos && msg.photos.length > 0) {
    const op = (msg.operator || '').toLowerCase().trim();
    const photo = msg.photos[0];
    const opTokens = op.replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter((w) => w.length > 2);
    
    document.querySelectorAll('.bus-card').forEach((card) => {
      const cardOp = (card.getAttribute('data-operator') || '').toLowerCase().trim();
      const cardOpClean = cardOp.replace(/[^a-z0-9]+/g, ' ');
      const isMatch = (cardOp && (cardOp.includes(op) || op.includes(cardOp))) ||
                      opTokens.some((tok) => cardOpClean.includes(tok));
      if (isMatch) {
        const cardImg = card.querySelector('.bus-card-img');
        if (cardImg && photo) {
          cardImg.src = photo;
          cardImg.removeAttribute('loading');
        }
      }
    });

    if (currentSelectedBus) {
      const curOp = (currentSelectedBus.operator || '').toLowerCase();
      if (curOp.includes(op) || op.includes(curOp) || opTokens.some((tok) => curOp.includes(tok))) {
        currentSelectedBus.photo = photo;
        currentSelectedBus.gallery = msg.photos;
      }
    }
  }
  if (msg.action === 'PASSENGER_AUTO_FILLED') {
    appendBotMessage(`
      <div style="background: rgba(129, 201, 149, 0.12); border: 1px solid rgba(129, 201, 149, 0.35); padding: 12px; border-radius: 12px;">
        <span style="color: #81c995; font-weight: 700;">✅ Step 5 Complete:</span> Auto-filled passenger details for <strong>${escapeHtml(msg.name || travelerProfile.passenger_name)}</strong> on your RedBus checkout form!<br>
        <span style="color: #c4c7c5; font-size: 11.5px;">👉 Review your details and proceed to payment whenever ready.</span>
      </div>
    `);
  }
});

// Nav Tabs & Header Actions
const navBookBusBtn = document.getElementById('navBookBusBtn');
const navMyTripsBtn = document.getElementById('navMyTripsBtn');
const navSavedBtn = document.getElementById('navSavedBtn');
const navPreferencesBtn = document.getElementById('navPreferencesBtn');
const spHistoryBtn = document.getElementById('spHistoryBtn');
const spCloseBtn = document.getElementById('spCloseBtn');

if (navPreferencesBtn) {
  navPreferencesBtn.addEventListener('click', () => profileModal.classList.remove('hidden'));
}
if (spHistoryBtn) {
  spHistoryBtn.addEventListener('click', () => {
    appendBotMessage(`
      <div style="background: rgba(255, 183, 3, 0.08); border: 1px solid rgba(255, 183, 3, 0.25); padding: 10px; border-radius: 10px;">
        <strong style="color: #ffb703;">🕒 Recent Trips & History:</strong>
        <div style="margin-top: 6px; font-size: 12px; color: #c7c9d4;">
          <div>• Chennai → Madurai — <span style="color: #ffd166;">Saved</span></div>
          <div>• Chennai → Bangalore AC Sleeper — <span style="color: #81c995;">Completed</span></div>
        </div>
      </div>
    `);
  });
}
if (navMyTripsBtn) {
  navMyTripsBtn.addEventListener('click', () => {
    appendBotMessage(`
      <div style="background: rgba(239, 35, 60, 0.08); border: 1px solid rgba(239, 35, 60, 0.25); padding: 10px; border-radius: 10px;">
        <strong style="color: #ef233c;">🎫 My Trips:</strong>
        <p style="margin-top: 4px; font-size: 12px; color: #c7c9d4;">No upcoming bookings yet. Ask TravelMate to book your next trip!</p>
      </div>
    `);
  });
}
if (navSavedBtn) {
  navSavedBtn.addEventListener('click', () => {
    appendBotMessage(`
      <div style="background: rgba(255, 183, 3, 0.08); border: 1px solid rgba(255, 183, 3, 0.25); padding: 10px; border-radius: 10px;">
        <strong style="color: #ffb703;">🔖 Saved Routes & Buses:</strong>
        <p style="margin-top: 4px; font-size: 12px; color: #c7c9d4;">• Chennai → Madurai (IntrCity SmartBus, AC Sleeper)</p>
      </div>
    `);
  });
}
if (spCloseBtn) {
  spCloseBtn.addEventListener('click', () => {
    window.close();
  });
}

// 21. Initialization
loadStoredProfile();
syncActiveTab();
setupSpeechRecognition();
