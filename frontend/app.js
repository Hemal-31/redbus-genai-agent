const chatWindow = document.getElementById('chatWindow');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const voiceBtn = document.getElementById('voiceBtn');
const quickActions = document.getElementById('quickActions');
const planSummary = document.getElementById('planSummary');
const telemetryList = document.getElementById('telemetryList');
const couponList = document.getElementById('couponList');
const executeBtn = document.getElementById('executeBtn');
const telemetryStatus = document.getElementById('telemetryStatus');
const stepper = document.getElementById('stepper');
const otpBanner = document.getElementById('otpBanner');

const stepLabels = [
  'Open RedBus',
  'From',
  'To',
  'Date',
  'Women Toggle',
  'Search',
  'Filters',
  'Best Bus',
  'Seat',
  'Details + OTP',
  'Payment Page',
];

const stepKeyMap = {
  STEP_1_OPEN_RED_BUS: 0,
  STEP_2_SELECT_FROM_CITY: 1,
  STEP_3_SELECT_TO_CITY: 2,
  STEP_4_SELECT_DATE: 3,
  STEP_5_BOOKING_FOR_WOMEN: 4,
  STEP_6_SEARCH_BUSES: 5,
  STEP_7_FILTERS_AND_SORT: 6,
  STEP_8_SELECT_BEST_BUS: 7,
  STEP_9_SELECT_SEAT: 8,
  STEP_10_PASSENGER_DETAILS_AND_OTP: 9,
  STEP_11_WAIT_FOR_OTP_PAYMENT: 10,
};

let currentPlan = null;
let recognition = null;
let profileCaptureState = { active: false, index: 0 };
let pendingTripQuery = '';

const PROFILE_FIELDS = [
  { key: 'passenger_name', label: 'What is your full name?', placeholder: 'Enter your full name' },
  { key: 'passenger_age', label: 'What is your age?', placeholder: 'Enter age' },
  { key: 'passenger_gender', label: 'What is your gender?', placeholder: 'Male / Female / Other' },
  { key: 'passenger_phone', label: 'What is your mobile number?', placeholder: '10-digit mobile number' },
  { key: 'passenger_email', label: 'What is your email address?', placeholder: 'name@example.com' },
  { key: 'boarding_point', label: 'What is your preferred boarding point?', placeholder: 'e.g. Main Bus Stand' },
  { key: 'dropping_point', label: 'What is your preferred dropping point?', placeholder: 'e.g. City Center' },
  { key: 'state_name', label: 'Which state do you reside in?', placeholder: 'e.g. Maharashtra, Tamil Nadu' },
];

const TRAVELER_STORAGE_KEY = 'redbus_traveler_profile';
const SEAT_PREFERENCE_CHOICES = [
  { label: 'Window', value: 'WINDOW' },
  { label: 'Aisle', value: 'AISLE' },
  { label: 'Front', value: 'FRONT' },
  { label: 'Center', value: 'CENTER' },
  { label: 'Back', value: 'BACK' },
  { label: 'Any Seat', value: 'ANY' },
];

function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  const match = document.cookie.split('; ').find((cookie) => cookie.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : '';
}

function loadTravelerProfile() {
  try {
    const raw = localStorage.getItem(TRAVELER_STORAGE_KEY) || getCookie(TRAVELER_STORAGE_KEY) || '{}';
    return { ...JSON.parse(raw) };
  } catch (error) {
    return {};
  }
}

function saveTravelerProfile(profile) {
  const payload = JSON.stringify(profile);
  try {
    localStorage.setItem(TRAVELER_STORAGE_KEY, payload);
  } catch (error) {
    // Ignore if storage is unavailable.
  }
  setCookie(TRAVELER_STORAGE_KEY, payload);
}

function extractTravelerDetails(text) {
  const lowerText = (text || '').toLowerCase();
  const details = {};

  const nameMatch = text.match(/(?:my name is|name is|traveler name|passenger name)[\s:]+([a-zA-Z][a-zA-Z .'-]+)/i);
  if (nameMatch) details.passenger_name = nameMatch[1].trim();

  const ageMatch = text.match(/(?:age|years old)[\s:]+(\d{1,2})/i);
  if (ageMatch) details.passenger_age = Number(ageMatch[1]);

  const genderMatch = text.match(/(?:gender|traveller gender|traveler gender)[\s:]+(male|female|other)/i);
  if (genderMatch) details.passenger_gender = genderMatch[1].charAt(0).toUpperCase() + genderMatch[1].slice(1).toLowerCase();

  const phoneMatch = text.match(/(?:phone|mobile|contact)[\s:]+(?:\+?91\s*)?(\d{10}|\+?\d{12})/i);
  if (phoneMatch) details.passenger_phone = phoneMatch[0].replace(/^.*?(?:phone|mobile|contact)\s*[: ]\s*/i, '').trim();

  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (emailMatch) details.passenger_email = emailMatch[0];

  const stateMatch = text.match(/(?:state|city state)[\s:]+([a-zA-Z ]+)/i);
  if (stateMatch) details.state_name = stateMatch[1].trim();

  const boardingMatch = text.match(/(?:boarding point|board point|board at)[\s:]+([a-zA-Z0-9 ,.-]+)/i);
  if (boardingMatch) details.boarding_point = boardingMatch[1].trim();

  const dropMatch = text.match(/(?:dropping point|drop point|drop at|dropping at)[\s:]+([a-zA-Z0-9 ,.-]+)/i);
  if (dropMatch) details.dropping_point = dropMatch[1].trim();

  // Bus category
  if (lowerText.includes('sleeper')) details.bus_category = 'SLEEPER';
  else if (lowerText.includes('seater')) details.bus_category = 'SEATER';

  // Seat position
  if (lowerText.includes('window')) details.seat_preference = 'WINDOW';
  else if (lowerText.includes('aisle')) details.seat_preference = 'AISLE';
  else if (lowerText.includes('front')) details.seat_preference = 'FRONT';
  else if (lowerText.includes('back') || lowerText.includes('rear')) details.seat_preference = 'BACK';
  else if (lowerText.includes('center') || lowerText.includes('middle')) details.seat_preference = 'CENTER';

  if (lowerText.includes('timing') && lowerText.includes('cost')) details.travel_preference = 'BALANCED';
  if (lowerText.includes('timing') && !lowerText.includes('cost')) details.travel_preference = 'TIMING';
  if (lowerText.includes('cheap') || lowerText.includes('cost') || lowerText.includes('budget')) details.travel_preference = 'CHEAPEST';
  if (lowerText.includes('rating') || lowerText.includes('review')) details.travel_preference = 'TOP_RATED';

  return details;
}

function appendMessage(role, text) {
  const message = document.createElement('div');
  message.className = `message ${role}`;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  message.appendChild(bubble);
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function appendChoicePrompt(message, choices) {
  const messageNode = document.createElement('div');
  messageNode.className = 'message bot';
  const bubble = document.createElement('div');
  bubble.className = 'bubble profile-bubble';
  bubble.innerHTML = `
    <div class="profile-question">${message}</div>
    <div class="profile-actions">
      ${choices.map((choice) => `
        <button class="profile-choice" data-profile-choice="${choice.value}">${choice.label}</button>
      `).join('')}
    </div>
  `;
  messageNode.appendChild(bubble);
  chatWindow.appendChild(messageNode);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function renderBusComparisonCard(topBuses, reason) {
  if (!topBuses || topBuses.length === 0) return;

  const SAFE_UNBRANDED_FALLBACK = 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/FR/ML/JWvK7y.jpeg';

  const REDBUS_FALLBACK_PHOTOS = [
    'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/FR/ML/JWvK7y.jpeg',
    'https://s3-ap-southeast-1.amazonaws.com/rb-plus/VI/APP/IND/WM/25748/TN37ET9009/SI/ML/felVTW.jpeg',
    'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/17707/4/FR/ML/7KDfoE.jpeg',
    'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/SI/ML/l4rtPc.jpeg',
    'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/ST/ML/4BTfpr.jpeg',
    'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/ST/ML/RHOL1i.jpeg',
  ];

  const OPERATOR_PHOTO_MAP = {
    'svt': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/FR/ML/JWvK7y.jpeg',
    'surya': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/VI/APP/IND/WM/25748/TN37ET9009/SI/ML/felVTW.jpeg',
    'manoj': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/SI/ML/l4rtPc.jpeg',
    'delta': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/17707/4/FR/ML/7KDfoE.jpeg',
    'thamarai': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/ST/ML/4BTfpr.jpeg',
    'intrcity': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/17707/4/FR/ML/7KDfoE.jpeg',
    'smartbus': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/17707/4/FR/ML/7KDfoE.jpeg',
    'kpn': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/FR/ML/JWvK7y.jpeg',
    'orange': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/VI/APP/IND/WM/25748/TN37ET9009/SI/ML/felVTW.jpeg',
    'city travels': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/ST/ML/RHOL1i.jpeg',
    'v bus': 'https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/33625/1097/FR/ML/qKQhgm.jpeg',
  };

  function getBusPhotoUrl(bus, idx) {
    const op = ((bus && bus.operator) || '').toLowerCase();
    for (const [key, p] of Object.entries(OPERATOR_PHOTO_MAP)) {
      if (op.includes(key)) return p;
    }
    if (bus && bus.image_url && (bus.image_url.startsWith('http://') || bus.image_url.startsWith('https://')) && !bus.image_url.includes('33625')) {
      return bus.image_url;
    }
    return REDBUS_FALLBACK_PHOTOS[idx % REDBUS_FALLBACK_PHOTOS.length];
  }

  const messageNode = document.createElement('div');
  messageNode.className = 'message bot';
  const bubble = document.createElement('div');
  bubble.className = 'bubble bus-analysis-bubble';

  const bestBus = topBuses[0];
  const bestBusImg = getBusPhotoUrl(bestBus, 0);

  const busCardsHtml = topBuses.map((b, idx) => {
    const medal = idx === 0 ? '🥇 #1 Best' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`;
    const isWinner = idx === 0 ? 'winner-card-highlight' : '';
    const imgUrl = getBusPhotoUrl(b, idx);
    const highlights = (b.highlights || []).slice(0, 3).map((h) => `<span class="highlight-pill">${h}</span>`).join(' ');

    return `
      <div class="bus-rank-card ${isWinner}">
        <div class="bus-card-media">
          <img class="bus-card-img" src="${imgUrl}" onerror="this.onerror=null;this.src='https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/FR/ML/JWvK7y.jpeg';" alt="${b.operator}" />
          <span class="bus-rank-badge ${idx === 0 ? 'gold' : ''}">${medal}</span>
          <span class="verified-photo-badge" title="Original RedBus vehicle photo">📷 RedBus</span>
        </div>
        <div class="bus-card-content">
          <div class="bus-card-header">
            <h5 class="bus-operator-name">${b.operator}</h5>
            <span class="bus-fare-badge">₹${Math.round(Number(b.price || 0))}</span>
          </div>
          <div class="bus-type-sub">${b.bus_type || 'AC Bus'}</div>
          <div class="bus-card-timing">
            <span>⏰ <strong>${b.departure || '--:--'}</strong> → <strong>${b.arrival || '--:--'}</strong></span>
            <span class="text-muted">(${b.duration || ''})</span>
          </div>
          <div class="bus-card-rating">
            <span class="rating-stars">⭐ <strong>${b.rating || '4.5'}</strong>/5</span>
            <span class="text-muted">(${Number(b.reviews_count || 0).toLocaleString()} reviews)</span>
          </div>
          <div class="bus-card-amenities">
            ${highlights}
          </div>
        </div>
      </div>
    `;
  }).join('');

  const formattedReason = (reason || `Selected as #1 with highest satisfaction rating (${bestBus.rating}/5) and optimal schedule.`)
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  const galleryList = (bestBus.gallery && bestBus.gallery.length > 0) ? bestBus.gallery : [bestBusImg];
  const galleryThumbsHtml = galleryList.length > 1 ? `
    <div class="chosen-gallery-row">
      ${galleryList.slice(0, 5).map((thumbUrl, tIdx) => `
        <img class="chosen-gallery-thumb ${tIdx === 0 ? 'active' : ''}" src="${thumbUrl}" alt="View ${tIdx + 1}" onclick="document.getElementById('mainWinnerBusImg').src='${thumbUrl}'; document.querySelectorAll('.chosen-gallery-thumb').forEach(t => t.classList.remove('active')); this.classList.add('active');" title="Click to view photo ${tIdx + 1}" />
      `).join('')}
    </div>
  ` : '';

  bubble.innerHTML = `
    <div class="analysis-header">
      <span class="analysis-badge">🤖 AI Route Analysis</span>
      <h4 class="analysis-title">I have analyzed all the buses on this route!</h4>
      <p class="analysis-sub">Here are the <strong>Top 5 best buses</strong> with original RedBus photos, ratings, and reviews:</p>
    </div>

    <div class="top-buses-grid">
      ${busCardsHtml}
    </div>

    <div class="chosen-winner-container">
      <div class="chosen-header">
        <span class="trophy-icon">🏆</span>
        <strong>And I have chosen the best bus for you, which is this:</strong>
      </div>
      <div class="chosen-bus-card">
        <div class="chosen-bus-media">
          <img id="mainWinnerBusImg" class="chosen-bus-img" src="${bestBusImg}" onerror="this.onerror=null;this.src='https://s3-ap-southeast-1.amazonaws.com/rb-plus/BI/APP/IND/WM/35668/4/FR/ML/JWvK7y.jpeg';" alt="${bestBus.operator}" />
          <span class="chosen-badge">🌟 #1 BEST CHOICE</span>
          <span class="verified-photo-badge" title="Original RedBus vehicle photo">📷 Original RedBus Photo</span>
        </div>
        <div class="chosen-bus-details">
          <div class="chosen-bus-title-row">
            <h4 class="chosen-operator">${bestBus.operator}</h4>
            <span class="chosen-fare">₹${Math.round(Number(bestBus.price || 0))}</span>
          </div>
          <div class="chosen-bus-type">${bestBus.bus_type || 'AC Luxury Sleeper'}</div>
          <div class="chosen-meta-row">
            <span>⏰ <strong>${bestBus.departure || '--:--'}</strong> → <strong>${bestBus.arrival || '--:--'}</strong> (${bestBus.duration || ''})</span>
            <span>⭐ <strong>${bestBus.rating || '4.8'}/5</strong> (${Number(bestBus.reviews_count || 0).toLocaleString()} reviews)</span>
          </div>
          ${galleryThumbsHtml}
          <div class="why-chosen-box">
            <div class="why-chosen-title">💡 <strong>Why I Chose This Bus:</strong></div>
            <div class="why-chosen-text">${formattedReason}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="user-instruction-box">
      <div class="instruction-title">👉 Next Step in Live Browser:</div>
      <p class="instruction-body">
        I have expanded the seat layout for <strong>${bestBus.operator}</strong> in your live browser.<br>
        Please <strong>click your seat</strong> and <strong>select your Boarding & Dropping points</strong>. I will automatically take over and fill your passenger & contact details!
      </p>
    </div>
  `;

  messageNode.appendChild(bubble);
  chatWindow.appendChild(messageNode);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function renderPlan(plan) {
  currentPlan = plan;
  const coupons = (plan.candidate_coupons || []).map((code) => `<li>${code}</li>`).join('');
  const traveler = loadTravelerProfile();
  const merged = {
    ...traveler,
    ...plan,
    travel_date: plan.travel_date || traveler.travel_date,
    source_city: plan.source_city || traveler.source_city,
    destination_city: plan.destination_city || traveler.destination_city,
  };
  let friendlyDate = merged.travel_date;
  if (merged.travel_date && /^\d{4}-\d{2}-\d{2}$/.test(merged.travel_date)) {
    const [y, m, d] = merged.travel_date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    friendlyDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }
  planSummary.innerHTML = `
    <strong>${merged.source_city}</strong> → <strong>${merged.destination_city}</strong><br>
    Travel date: <strong style="color: #4ade80;">${friendlyDate} (${merged.travel_date})</strong><br>
    Bus Selection: <strong>Autonomous (AI ranks Top 5 travels)</strong><br>
    Seat & Board/Drop: <strong>User selects in live browser</strong><br>
    Passenger details: <strong>AI Agent auto-fills on checkout</strong><br>
    Passenger: <strong>${merged.passenger_name || 'Will collect on booking'}</strong> (${merged.passenger_age || 'N/A'}, ${merged.passenger_gender || 'N/A'})<br>
    Contact: <strong>${merged.passenger_phone || 'Will collect on booking'}</strong> / <strong>${merged.passenger_email || 'N/A'}</strong><br>
    State: <strong>${merged.state_name || 'Tamil Nadu'}</strong><br>
    Coupon shortlist: <ul>${coupons || '<li>None</li>'}</ul>
  `;
}

function renderStepProgress(items = []) {
  const completed = new Set();
  items.forEach((item) => {
    const idx = stepKeyMap[item.step];
    if (typeof idx === 'number') {
      completed.add(idx);
    }
  });

  stepper.innerHTML = stepLabels
    .map((label, index) => {
      const done = completed.has(index);
      return `
        <div class="step-item ${done ? 'done' : ''}">
          <div class="step-dot">${index + 1}</div>
          <div class="step-label">${label}</div>
        </div>
      `;
    })
    .join('');

  if (completed.has(9) || completed.has(10)) {
    otpBanner.classList.remove('hidden');
  } else {
    otpBanner.classList.add('hidden');
  }
}

function renderTelemetry(items) {
  if (!items || items.length === 0) {
    telemetryList.innerHTML = '<li class="empty-item">Waiting for execution logs...</li>';
    telemetryStatus.textContent = 'Idle';
    telemetryStatus.className = 'status-pill idle';
    renderStepProgress([]);
    return;
  }

  telemetryList.innerHTML = items
    .slice(-8)
    .reverse()
    .map((item) => `
      <li class="telemetry-item">
        <span class="step-badge">${item.step}</span>
        <span>${item.message}</span>
      </li>
    `)
    .join('');

  const last = items.at(-1);
  const label = last.step.includes('OTP') || last.step.includes('PAYMENT') ? 'OTP / Payment' : last.step.includes('SEAT') ? 'Selecting seat' : last.step.includes('SEARCH') ? 'Searching buses' : 'Running';
  telemetryStatus.textContent = label;
  telemetryStatus.className = last.step.includes('PAYMENT') || last.step.includes('OTP') ? 'status-pill idle' : 'status-pill online';
  renderStepProgress(items);
}

function renderCoupons(codes) {
  if (!codes || codes.length === 0) {
    couponList.innerHTML = '<div class="coupon-empty">No coupons retrieved yet.</div>';
    return;
  }

  couponList.innerHTML = codes
    .map((code) => `
      <div class="coupon-item">
        <span class="coupon-code">${code}</span>
        <span class="coupon-meta">RAG match</span>
      </div>
    `)
    .join('');
}

function showTypingBubble(message = 'Checking availability and building the route plan...') {
  const messageNode = document.createElement('div');
  messageNode.className = 'message bot typing-message';
  messageNode.innerHTML = `
    <div class="bubble typing-bubble">
      <span>${message}</span>
      <span class="typing-dots" aria-label="loading"><span></span><span></span><span></span></span>
    </div>
  `;
  chatWindow.appendChild(messageNode);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return messageNode;
}

async function sendPrompt(inputText) {
  const text = (inputText || userInput.value || '').trim();
  if (!text) return;

  appendMessage('user', text);
  userInput.value = '';

  const travelerInfo = extractTravelerDetails(text);
  const profile = { ...loadTravelerProfile(), ...travelerInfo };
  saveTravelerProfile(profile);

  // If a plan is already active and the user is asking a follow-up question (e.g. "when i will reach banglore"):
  const lowerText = text.toLowerCase();
  const isFollowUp = currentPlan && (
    lowerText.includes('reach') || lowerText.includes('arrival') || lowerText.includes('arrive') || lowerText.includes('when') ||
    lowerText.includes('duration') || lowerText.includes('how long') || lowerText.includes('time') ||
    lowerText.includes('board') || lowerText.includes('pickup') || lowerText.includes('drop') || lowerText.includes('stop') ||
    lowerText.includes('toilet') || lowerText.includes('washroom') || lowerText.includes('restroom') ||
    lowerText.includes('luggage') || lowerText.includes('bag') || lowerText.includes('cancel') || lowerText.includes('refund') ||
    lowerText.includes('why') || lowerText.includes('reason') || lowerText.includes('amenities')
  ) && !lowerText.includes(' to ') && !lowerText.includes('from ');

  if (isFollowUp) {
    const chatBubble = showTypingBubble('Checking your bus schedule and trip details...');
    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          plan: currentPlan,
          selected_bus: {
            operator: currentPlan.selected_bus_name || 'IntrCity SmartBus',
            departure: '22:30',
            arrival: '05:45',
            duration: '7h 15m'
          }
        })
      });
      const data = await resp.json();
      chatBubble.remove();
      if (data && data.reply) {
        appendMessage('bot', data.reply);
        return;
      }
    } catch (e) {
      chatBubble.remove();
    }
  }

  // If a plan is already active and the user is just responding with preferences (e.g. "sleeper window"):
  if (currentPlan && (travelerInfo.bus_category || travelerInfo.seat_preference) && !text.toLowerCase().includes(' to ') && !text.toLowerCase().includes('from ')) {
    if (travelerInfo.bus_category) currentPlan.bus_category = travelerInfo.bus_category;
    if (travelerInfo.seat_preference) currentPlan.seat_preference = travelerInfo.seat_preference;
    renderPlan(currentPlan);
    appendMessage('bot', `Updated! Looking for a **${currentPlan.bus_category}** bus with **${currentPlan.seat_preference}** seat for ${currentPlan.source_city} → ${currentPlan.destination_city}. Click "Launch Auto-Booking" when ready.`);
    return;
  }

  const typingBubble = showTypingBubble('Checking availability and building the route plan...');

  try {
    const travelerProfile = loadTravelerProfile();
    const response = await fetch('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: text, profile: travelerProfile }),
    });

    const data = await response.json();
    if (data.status === 'needs_input') {
      typingBubble.remove();
      appendMessage('bot', data.message || 'Please specify the source and destination cities for your trip.');
      return;
    }

    const plan = data.plan;
    if (!plan) {
      typingBubble.remove();
      appendMessage('bot', 'I could not build a route plan from that request. Please try again with a source, destination, and date.');
      return;
    }

    const mergedPlan = {
      ...profile,
      ...plan,
      travel_date: plan.travel_date,
      source_city: plan.source_city,
      destination_city: plan.destination_city,
      travel_preference: profile.travel_preference || plan.travel_preference || 'BALANCED',
      seat_preference: profile.seat_preference || plan.seat_preference || 'ANY',
      bus_category: profile.bus_category || plan.bus_category || 'ANY',
      boarding_point: profile.boarding_point || plan.boarding_point || '',
      dropping_point: profile.dropping_point || plan.dropping_point || '',
      passenger_name: profile.passenger_name || plan.passenger_name,
      passenger_phone: profile.passenger_phone || plan.passenger_phone,
      passenger_email: profile.passenger_email || plan.passenger_email,
      passenger_age: profile.passenger_age || plan.passenger_age,
      passenger_gender: profile.passenger_gender || plan.passenger_gender,
      state_name: profile.state_name || plan.state_name || '',
    };

    renderPlan(mergedPlan);
    renderCoupons(mergedPlan.candidate_coupons || []);
    typingBubble.remove();

    appendMessage('bot', mergedPlan.agent_reply || `Planned route from ${mergedPlan.source_city} to ${mergedPlan.destination_city}.`);

    // Seamless UX: Automatically launch autonomous search & comparison as soon as route is identified!
    if (mergedPlan.source_city && mergedPlan.destination_city) {
      appendMessage('bot', `🚀 Starting live autonomous comparison across all travel operators for **${mergedPlan.source_city} → ${mergedPlan.destination_city}** on **${mergedPlan.travel_date}**...`);
      executeBooking();
    }
  } catch (error) {
    typingBubble.remove();
    appendMessage('bot', 'The planner is temporarily unavailable. Please try again.');
  }
}

let currentAnalysisKey = '';

async function executeBooking() {
  if (!currentPlan || !currentPlan.source_city || !currentPlan.destination_city) {
    appendMessage('bot', 'Please provide your route (source and destination cities) before launching auto-booking.');
    return;
  }

  currentAnalysisKey = '';
  executeBtn.disabled = true;
  executeBtn.textContent = 'Comparing & Booking...';
  const typingBubble = showTypingBubble(`Scanning all travels for ${currentPlan.source_city} → ${currentPlan.destination_city}. The AI agent will rank the top 5 buses and open your seat layout...`);

  try {
    const travelerProfile = loadTravelerProfile();
    const mergedPlan = {
      ...travelerProfile,
      ...currentPlan,
      travel_date: currentPlan.travel_date,
      source_city: currentPlan.source_city,
      destination_city: currentPlan.destination_city,
      bus_category: currentPlan.bus_category || travelerProfile.bus_category || 'ANY',
      seat_preference: currentPlan.seat_preference || travelerProfile.seat_preference || 'ANY',
      boarding_point: travelerProfile.boarding_point || currentPlan.boarding_point || '',
      dropping_point: travelerProfile.dropping_point || currentPlan.dropping_point || '',
      passenger_name: travelerProfile.passenger_name || currentPlan.passenger_name,
      passenger_phone: travelerProfile.passenger_phone || currentPlan.passenger_phone,
      passenger_email: travelerProfile.passenger_email || currentPlan.passenger_email,
      passenger_age: travelerProfile.passenger_age || currentPlan.passenger_age,
      passenger_gender: travelerProfile.passenger_gender || currentPlan.passenger_gender,
      state_name: travelerProfile.state_name || currentPlan.state_name || '',
    };

    const response = await fetch('/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `${mergedPlan.source_city} to ${mergedPlan.destination_city} ${mergedPlan.travel_date}`,
        plan: mergedPlan,
        profile: travelerProfile,
      }),
    });
    const data = await response.json();
    typingBubble.remove();
    if (data.status === 'queued') {
      appendMessage('bot', data.message || 'Auto-booking has started in the background.');
    } else if (data.status === 'stopped_before_payment') {
      appendMessage('bot', `The agent reached the payment gate. Best coupon: ${data.selected_coupon || 'N/A'}.`);
    } else if (data.status === 'error') {
      appendMessage('bot', `Automation encountered an issue: ${data.error || 'unknown error'}.`);
    } else {
      appendMessage('bot', 'The booking flow completed or paused as expected.');
    }
  } catch (error) {
    typingBubble.remove();
    appendMessage('bot', `The launch request failed: ${error.message}`);
  }

  executeBtn.disabled = false;
  executeBtn.textContent = 'Launch Auto-Booking';
}

async function pollTelemetry() {
  try {
    const response = await fetch('/api/telemetry');
    const data = await response.json();
    renderTelemetry(data.telemetry || []);

    const newAnalysisKey = (data.top_buses || []).map((b) => `${b.operator}_${b.departure}_${b.price}_${b.image_url || ''}`).join('|');
    if (data.top_buses && data.top_buses.length > 0 && newAnalysisKey && newAnalysisKey !== currentAnalysisKey) {
      currentAnalysisKey = newAnalysisKey;
      renderBusComparisonCard(data.top_buses, data.selected_bus_reason);
    }
  } catch (error) {
    renderTelemetry([]);
  }
}

chatWindow.addEventListener('click', (event) => {
  // Handle preference button click
  const prefBtn = event.target.closest('.pref-btn');
  if (prefBtn) {
    const prefType = prefBtn.dataset.prefType;
    const prefVal = prefBtn.dataset.prefVal;

    const parentGroup = prefBtn.closest('.pref-options');
    if (parentGroup) {
      parentGroup.querySelectorAll('.pref-btn').forEach((b) => b.classList.remove('active'));
    }
    prefBtn.classList.add('active');

    const profile = loadTravelerProfile();
    if (prefType === 'bus') {
      if (currentPlan) currentPlan.bus_category = prefVal;
      profile.bus_category = prefVal;
      saveTravelerProfile(profile);
      if (currentPlan) renderPlan(currentPlan);
      appendMessage('bot', `Selected bus category: **${prefVal}**. You can now launch auto-booking!`);
    } else if (prefType === 'seat') {
      if (currentPlan) currentPlan.seat_preference = prefVal;
      profile.seat_preference = prefVal;
      saveTravelerProfile(profile);
      if (currentPlan) renderPlan(currentPlan);
      appendMessage('bot', `Selected seat preference: **${prefVal}**. You can now launch auto-booking!`);
    }
    return;
  }

  const choice = event.target.closest('[data-profile-choice]');
  if (choice) {
    const choiceValue = choice.dataset.profileChoice;
    const profile = loadTravelerProfile();
    profile.seat_preference = choiceValue;
    saveTravelerProfile(profile);
    if (currentPlan) {
      currentPlan.seat_preference = choiceValue;
      renderPlan(currentPlan);
    }
    const currentPrompt = choice.closest('.message.bot');
    if (currentPrompt) currentPrompt.remove();
    appendMessage('bot', `Preference updated to **${choiceValue}**.`);
    return;
  }
});

sendBtn.addEventListener('click', () => sendPrompt(userInput.value));
userInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendPrompt(userInput.value);
  }
});

quickActions.addEventListener('click', (event) => {
  const button = event.target.closest('.chip');
  if (!button) return;
  sendPrompt(button.dataset.prompt);
});

executeBtn.addEventListener('click', executeBooking);

if ('webkitSpeechRecognition' in window) {
  const SpeechRecognition = window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
  };

  recognition.onerror = () => {
    appendMessage('bot', 'Voice input could not be processed. Please type your booking request.');
  };
}

voiceBtn.addEventListener('click', () => {
  if (!recognition) {
    appendMessage('bot', 'Speech recognition is not supported in this browser.');
    return;
  }
  recognition.start();
});

setInterval(pollTelemetry, 1500);
pollTelemetry();
