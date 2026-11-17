// TravelMate Agent - In-Page Content Script (Runs on redbus.in)
// Official Custom Robot Identity: "BUS BOOKING BOT / I BOOK BUSES!"
// Professional Blue (#00b4d8), Scarlet Red (#ef233c), Yellow (#ffd166), Obsidian (#090a0f)

(function () {
  'use strict';

  if (window.__TRAVELMATE_AGENT_INJECTED__) {
    return;
  }
  window.__TRAVELMATE_AGENT_INJECTED__ = true;

  // 1. Asset Helpers for Custom Agent Identity
  function getAgentHeadLogoUrl() {
    // Official custom 3D Robot Assistant (full character with holographic tablet & wheels)
    return chrome.runtime.getURL('assets/agent-full.png');
  }

  function getAgentFullLogoUrl() {
    return chrome.runtime.getURL('assets/agent-full.png');
  }

  function getAgentSquareLogoUrl() {
    return chrome.runtime.getURL('assets/agent-logo.png');
  }

  function getAgentLogoMarkup() {
    const logoUrl = getAgentHeadLogoUrl();
    return `
      <div class="travelmate-agent-logo-wrap">
        <img class="travelmate-agent-logo" src="${logoUrl}" alt="Bus Booking Bot" />
      </div>
    `;
  }

  // ==========================================================================
  // 2. STAGE 1: Full-Screen Center Activation Overlay
  // ==========================================================================
  async function showStage1ActivationOverlay(sourceCity = 'Departure', destinationCity = 'Destination') {
    let overlay = document.getElementById('tm-activation-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'tm-activation-overlay';
      document.body.appendChild(overlay);
    }

    const fullLogo = getAgentFullLogoUrl();

    overlay.innerHTML = `
      <div class="tm-activation-card">
        <div class="tm-radar-rings">
          <div class="tm-radar-ring ring-1"></div>
          <div class="tm-radar-ring ring-2"></div>
          <div class="tm-radar-ring ring-3"></div>
        </div>
        <div class="tm-agent-hero-avatar">
          <img class="tm-agent-img-full" src="${fullLogo}" alt="Bus Booking Bot" />
        </div>
        <div class="tm-activation-marquee">BUS BOOKING BOT • I BOOK BUSES!</div>
        <h2 class="tm-activation-title">Your AI Agent is getting things ready...</h2>
        <div class="tm-activation-status">
          <div class="tm-status-spinner"></div>
          <span>Preparing route: <strong>${sourceCity} ➔ ${destinationCity}</strong></span>
        </div>
      </div>
    `;

    // Trigger smooth entrance
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });

    // Hold stage 1 entrance animation for 1.5 seconds, then smoothly transition into floating assistant
    await new Promise((r) => setTimeout(r, 1500));

    overlay.classList.remove('active');
    await new Promise((r) => setTimeout(r, 350));
    overlay.remove();

    // Smoothly show floating companion widget
    showFloatingCompanion(`Ready to book: <strong>${sourceCity} ➔ ${destinationCity}</strong>`, 1);
  }

  // ==========================================================================
  // 3. Floating Agent Status Widget (Compact, Draggable, Glassmorphic)
  // ==========================================================================
  let companionDragging = false;
  let companionOffsetX = 0;
  let companionOffsetY = 0;

  function showFloatingCompanion(statusHtml, progressStep = 1) {
    let companion = document.getElementById('travelmate-agent-companion');
    const headLogo = getAgentHeadLogoUrl();

    if (!companion) {
      companion = document.createElement('div');
      companion.id = 'travelmate-agent-companion';
      companion.title = 'TravelMate AI Agent Status (Drag to move, click to open panel)';

      companion.innerHTML = `
        <span class="tm-companion-grip" title="Drag to reposition">⋮⋮</span>
        <div class="tm-companion-logo-box">
          <div class="tm-companion-halo"></div>
          <div class="tm-companion-radar-sweep"></div>
          <img class="tm-companion-logo" src="${headLogo}" alt="Bus Booking Bot" />
        </div>
        <div class="tm-companion-body">
          <div class="tm-companion-status-row">
            <span class="tm-companion-action-text" id="tmCompanionAction">${statusHtml}</span>
          </div>
          <div class="tm-companion-progress-row">
            <div class="tm-progress-dots" id="tmProgressDots">
              <span class="dot ${progressStep >= 1 ? (progressStep > 1 ? 'completed' : 'active') : ''}"></span>
              <span class="dot ${progressStep >= 2 ? (progressStep > 2 ? 'completed' : 'active') : ''}"></span>
              <span class="dot ${progressStep >= 3 ? (progressStep > 3 ? 'completed' : 'active') : ''}"></span>
              <span class="dot ${progressStep >= 4 ? (progressStep > 4 ? 'completed' : 'active') : ''}"></span>
            </div>
            <span class="tm-progress-label" id="tmProgressLabel">${getProgressText(progressStep)}</span>
          </div>
        </div>
        <div class="tm-companion-controls">
          <button class="tm-btn-min" id="tmCompanionMinBtn" title="Minimize / Expand">−</button>
          <button class="tm-btn-close" id="tmCompanionCloseBtn" title="Close status widget">×</button>
        </div>
      `;

      document.body.appendChild(companion);

      // Minimize / Expand Toggle
      const minBtn = companion.querySelector('#tmCompanionMinBtn');
      if (minBtn) {
        minBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          companion.classList.toggle('minimized');
          minBtn.textContent = companion.classList.contains('minimized') ? '+' : '−';
        });
      }

      // Close Button
      const closeBtn = companion.querySelector('#tmCompanionCloseBtn');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          companion.style.display = 'none';
        });
      }

      // Click to open side panel
      companion.addEventListener('click', (e) => {
        if (e.target.closest('.tm-companion-controls') || e.target.closest('.tm-companion-grip')) return;
        chrome.runtime.sendMessage({ action: 'OPEN_SIDE_PANEL' });
      });

      // Draggable Pointer Logic
      companion.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button')) return;
        companionDragging = true;
        const rect = companion.getBoundingClientRect();
        companionOffsetX = e.clientX - rect.left;
        companionOffsetY = e.clientY - rect.top;
        companion.setPointerCapture(e.pointerId);
      });

      companion.addEventListener('pointermove', (e) => {
        if (!companionDragging) return;
        const maxX = window.innerWidth - (companion.offsetWidth || 260) - 12;
        const maxY = window.innerHeight - (companion.offsetHeight || 60) - 12;
        const newX = Math.min(maxX, Math.max(12, e.clientX - companionOffsetX));
        const newY = Math.min(maxY, Math.max(12, e.clientY - companionOffsetY));
        companion.style.left = `${newX}px`;
        companion.style.top = `${newY}px`;
        companion.style.right = 'auto';
        companion.style.bottom = 'auto';
      });

      companion.addEventListener('pointerup', () => { companionDragging = false; });
      companion.addEventListener('pointerleave', () => { companionDragging = false; });
    } else {
      companion.style.display = 'flex';
      const actionEl = companion.querySelector('#tmCompanionAction');
      if (actionEl) actionEl.innerHTML = statusHtml;

      const dotsEl = companion.querySelector('#tmProgressDots');
      if (dotsEl) {
        dotsEl.innerHTML = `
          <span class="dot ${progressStep >= 1 ? (progressStep > 1 ? 'completed' : 'active') : ''}"></span>
          <span class="dot ${progressStep >= 2 ? (progressStep > 2 ? 'completed' : 'active') : ''}"></span>
          <span class="dot ${progressStep >= 3 ? (progressStep > 3 ? 'completed' : 'active') : ''}"></span>
          <span class="dot ${progressStep >= 4 ? (progressStep > 4 ? 'completed' : 'active') : ''}"></span>
        `;
      }

      const labelEl = companion.querySelector('#tmProgressLabel');
      if (labelEl) labelEl.textContent = getProgressText(progressStep);
    }
  }

  function getProgressText(step) {
    switch (step) {
      case 1:
        return 'Step 1/4 • Departure City';
      case 2:
        return 'Step 2/4 • Destination & Date';
      case 3:
        return 'Step 3/4 • Searching Buses';
      case 4:
        return 'Step 4/4 • Bus & Seats';
      default:
        return 'Step 1/4 • Booking Route';
    }
  }

  // ==========================================================================
  // 4. Dynamic Floating Target Pointer (Hovers over the active element)
  // ==========================================================================
  async function moveTargetPointerTo(element, bubbleText = 'Processing...') {
    if (!element) return;
    let pointer = document.getElementById('travelmate-target-pointer');
    const headLogo = getAgentHeadLogoUrl();

    if (!pointer) {
      pointer = document.createElement('div');
      pointer.id = 'travelmate-target-pointer';
      pointer.innerHTML = `
        <div class="tm-pointer-avatar-wrap">
          <img class="tm-pointer-avatar" src="${headLogo}" alt="Agent Pointer" />
        </div>
        <div class="tm-pointer-bubble" id="tmPointerBubble">${bubbleText}</div>
      `;
      document.body.appendChild(pointer);
    } else {
      const bubble = pointer.querySelector('#tmPointerBubble');
      if (bubble) bubble.innerHTML = bubbleText;
      pointer.style.display = 'flex';
    }

    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await new Promise((r) => setTimeout(r, 200));

    const rect = element.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Position pointer slightly above and horizontally aligned with the field
    const targetTop = rect.top + scrollY - 14;
    const targetLeft = Math.max(16, rect.left + scrollX + 16);

    pointer.style.top = `${targetTop}px`;
    pointer.style.left = `${targetLeft}px`;
  }

  function hideTargetPointer(delayMs = 600) {
    setTimeout(() => {
      const pointer = document.getElementById('travelmate-target-pointer');
      if (pointer) {
        pointer.style.opacity = '0';
        pointer.style.transform = 'translateY(-120%) scale(0.9)';
        setTimeout(() => {
          if (pointer) pointer.remove();
        }, 300);
      }
    }, delayMs);
  }

  // ==========================================================================
  // 5. Extract Route Info from URL
  // ==========================================================================
  function extractCurrentRouteInfo() {
    const url = window.location.href;
    const info = {
      url,
      source: '',
      destination: '',
      date: '',
      isResultsPage: url.includes('/bus-tickets/'),
    };

    const routeMatch = url.match(/\/bus-tickets\/([a-z0-9-]+)-to-([a-z0-9-]+)/i);
    if (routeMatch) {
      info.source = routeMatch[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      info.destination = routeMatch[2].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }

    const dateMatch = url.match(/[?&](?:onward|doj)=([^&]+)/i);
    if (dateMatch) {
      info.date = decodeURIComponent(dateMatch[1]);
    }

    return info;
  }

  // ==========================================================================
  // 6. Find All Bus Card DOM Elements
  // ==========================================================================
  function getBusCardElements() {
    const selectors = [
      'li.tupleWrapper',
      'li[class*="tupleWrapper"]',
      'div.tupleWrapper',
      'div[class*="tupleWrapper"]',
      '[class*="tupleWrapper"]',
      'li[class*="Tuple"]',
      'div[class*="Tuple"]',
      'li[aria-label*="Departs"]',
      'li[aria-label*="Seats"]',
      'li[aria-label*="Price"]',
      'div[class*="bus-item"]',
      'div[class*="search-bus-tuple"]',
      'div.bus-item',
      '.bus-item',
      'ul.bus-items > li'
    ];

    const found = new Set();
    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => found.add(el));
    });

    // Also collect cards directly by leaf View Seats buttons
    const viewButtons = Array.from(document.querySelectorAll('button, [role="button"], div, a')).filter((el) => {
      const t = (el.innerText || el.textContent || '').trim().toLowerCase();
      return (t === 'view seats' || t === 'hide seats' || t.includes('view seats')) && el.children.length <= 1;
    });

    viewButtons.forEach((btn) => {
      const card = btn.closest('li, [class*="tuple"], [class*="bus-item"], [class*="busCard"], [class*="card"], [class*="item"]');
      if (card) found.add(card);
    });

    return Array.from(found);
  }

  // Extract real bus photos from JSON state scripts if embedded by RedBus
  function extractPageBusDataMap() {
    const map = {};
    try {
      const scripts = Array.from(document.querySelectorAll('script[type="application/json"], script:not([src])'));
      for (const s of scripts) {
        const txt = s.textContent || '';
        if (txt.includes('operatorName') || txt.includes('travels') || txt.includes('busImages') || txt.includes('photos')) {
          const busMatches = txt.matchAll(/"(?:operatorName|travelsName|operator)"\s*:\s*"([^"]+)"[\s\S]*?"(?:busImages|photos|images)"\s*:\s*\[([^\]]+)\]/g);
          for (const m of busMatches) {
            const op = m[1].toLowerCase().trim();
            const imgs = m[2].match(/https?:\/\/[^",\s]+/g);
            if (imgs && imgs.length > 0) {
              const valid = imgs.find((img) => !img.endsWith('.svg') && !img.includes('logo') && !img.includes('icon'));
              if (valid) map[op] = valid;
            }
          }
        }
      }
    } catch (e) {}
    return map;
  }

  // ==========================================================================
  // 7. Scrape Live Buses from RedBus DOM
  // ==========================================================================
  function scrapePageBuses() {
    const cards = getBusCardElements();
    const buses = [];
    const seenOperators = new Set();
    const pagePhotoMap = extractPageBusDataMap();

    cards.forEach((card, index) => {
      try {
        const ariaLabel = card.getAttribute('aria-label') || '';
        const innerText = card.innerText || '';
        const combined = `${ariaLabel} ${innerText}`.replace(/\s+/g, ' ');

        // Operator name
        let operator = '';
        const travelsEl = card.querySelector('.travels, [class*="travels"], [class*="operator"], h3, strong');
        if (travelsEl && travelsEl.textContent.trim().length > 2) {
          operator = travelsEl.textContent.trim();
        } else if (ariaLabel) {
          const parts = ariaLabel.split(',');
          if (parts.length > 0 && parts[0].trim().length > 2) {
            operator = parts[0].trim();
          }
        }

        if (!operator) {
          const firstLine = (innerText.split('\n')[0] || '').trim();
          if (firstLine.length > 2 && !/^\d/.test(firstLine)) {
            operator = firstLine;
          }
        }

        if (!operator || operator.length < 2) return;

        const opKey = operator.toLowerCase();
        if (seenOperators.has(opKey)) return;
        seenOperators.add(opKey);

        const agentId = `rb-bus-${index}-${opKey.replace(/[^a-z0-9]/g, '')}`;
        card.setAttribute('data-rb-agent-id', agentId);

        // Departure time
        const dpMatch = combined.match(/\b([012]?\d:[0-5]\d)\b/);
        const departure = dpMatch ? dpMatch[1] : '21:30';

        // Arrival time
        const arrMatch = combined.match(/(?:arrival at|arr|->|to)\s*([012]?\d:[0-5]\d)/i);
        const arrival = arrMatch ? arrMatch[1] : '06:00';

        // Fare
        let fare = 749;
        const fareMatch = combined.match(/(?:INR|Rs\.?|₹)\s*(\d{3,5})/i);
        if (fareMatch) {
          fare = parseInt(fareMatch[1], 10);
        } else {
          const numMatch = combined.match(/\b([5-9]\d{2}|1\d{3}|2\d{3})\b/);
          if (numMatch) fare = parseInt(numMatch[1], 10);
        }

        // Rating
        let rating = 4.8;
        const ratingMatch = combined.match(/\b([345]\.\d)\b/);
        if (ratingMatch) {
          rating = parseFloat(ratingMatch[1]);
        }

        // Total Reviews
        let reviews = 850;
        const revMatch = combined.match(/(\d{2,5})\s*(?:ratings?|reviews?)/i);
        if (revMatch) {
          reviews = parseInt(revMatch[1], 10);
        }

        // Bus type
        let busType = 'AC Sleeper (2+1)';
        const typeMatch = combined.match(/(Bharat\s*Benz|Volvo|Scania|Mercedes|AC\s*Sleeper|A\/C\s*Sleeper|Non-AC|Sleeper|Seater)/i);
        if (typeMatch) {
          busType = typeMatch[0];
          if (!busType.toLowerCase().includes('sleeper') && !busType.toLowerCase().includes('seater')) {
            busType += ' Sleeper';
          }
        }

        const isPrimo = /primo/i.test(combined);

        // Extract authentic RedBus bus photo showcased by this travels operator
        let photo = '';
        const allImgs = Array.from(card.querySelectorAll('img, [style*="background-image"], [data-src], [data-original], [data-img]'));
        for (const el of allImgs) {
          let src = '';
          if (el.tagName === 'IMG') {
            src = el.currentSrc || el.src || el.getAttribute('data-src') || el.getAttribute('data-original') || el.getAttribute('data-lazy') || el.getAttribute('srcset') || '';
            if (src.includes(' ')) src = src.split(' ')[0];
          } else {
            const style = el.getAttribute('style') || '';
            const match = style.match(/url\(['"]?(https?:\/\/[^'")]+)['"]?\)/i);
            if (match) src = match[1];
            else src = el.getAttribute('data-src') || el.getAttribute('data-original') || el.getAttribute('data-img') || '';
          }

          if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
            const lower = src.toLowerCase();
            if (!lower.endsWith('.svg') && !lower.includes('brandlogo') && !lower.includes('logo') && !lower.includes('rating') && !lower.includes('star') && !lower.includes('icon') && !lower.includes('pin') && !lower.includes('avatar') && !lower.includes('qr')) {
              photo = src;
              break;
            }
          }
        }

        if (!photo) {
          for (const [key, pUrl] of Object.entries(pagePhotoMap)) {
            if (opKey.includes(key) || key.includes(opKey)) {
              photo = pUrl;
              break;
            }
          }
        }

        buses.push({
          agentId,
          operator,
          departure,
          arrival,
          fare,
          rating,
          reviews,
          busType,
          isPrimo,
          photo,
        });
      } catch (err) {
        // Skip malformed
      }
    });

    return buses;
  }

  // ==========================================================================
  // 8. STAGE 5: Highlight and Click "View Seats" on Specific Travel Operator
  // ==========================================================================
  async function highlightAndSelectBus(targetOperator, agentId) {
    showFloatingCompanion('Analyzing available buses...', 4);

    const cards = getBusCardElements();
    let targetCard = null;

    if (agentId) {
      targetCard = document.querySelector(`[data-rb-agent-id="${agentId}"]`);
    }

    if (!targetCard && targetOperator) {
      const stopWords = new Set(['travels', 'transports', 'transport', 'pvt', 'ltd', 'bus', 'lines', 'tours', 'roadways']);
      const tokens = targetOperator
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .split(/\s+/)
        .filter((w) => w && !stopWords.has(w));

      let highestScore = 0;

      for (const card of cards) {
        const aria = (card.getAttribute('aria-label') || '').toLowerCase();
        const text = (card.innerText || '').toLowerCase();
        const combined = `${aria} ${text}`;

        let matchCount = 0;
        for (const token of tokens) {
          if (combined.includes(token)) {
            matchCount++;
          }
        }

        if (matchCount > highestScore) {
          highestScore = matchCount;
          targetCard = card;
        }
      }
    }

    if (!targetCard && cards.length > 0) {
      targetCard = cards[0];
    }

    let viewSeatsBtn = null;

    if (targetCard) {
      // Remove previous highlights
      document.querySelectorAll('.rb-ai-highlighted-bus').forEach((el) => {
        el.classList.remove('rb-ai-highlighted-bus');
        const tag = el.querySelector('.rb-ai-tag');
        if (tag) tag.remove();
      });

      // Add glowing highlight & badge to target card
      targetCard.classList.add('rb-ai-highlighted-bus');
      const tag = document.createElement('div');
      tag.className = 'rb-ai-tag';
      tag.innerHTML = `<span>✦ TravelMate AI #1 Pick: ${targetOperator || 'Best Bus'}</span>`;
      targetCard.appendChild(tag);

      // Smooth scroll directly to the selected bus
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Move target pointer to selected bus
      await moveTargetPointerTo(targetCard, 'Analyzing available buses...');
      await new Promise((r) => setTimeout(r, 450));

      // Look inside targetCard for the button
      const allInner = Array.from(targetCard.querySelectorAll('button, div, [role="button"], a, span'));
      for (const el of allInner) {
        const txt = (el.innerText || el.textContent || '').trim().toLowerCase();
        if (txt === 'view seats' || txt === 'hide seats' || txt === 'select seat' || txt === 'select seats' ||
            (txt.includes('view seats') && txt.length < 25) || (txt.includes('hide seats') && txt.length < 25)) {
          if (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button' || el.classList.contains('button') || el.children.length === 0) {
            viewSeatsBtn = el;
            break;
          } else if (!viewSeatsBtn) {
            viewSeatsBtn = el;
          }
        }
      }
    }

    if (!viewSeatsBtn) {
      const allPageButtons = Array.from(document.querySelectorAll('button, div, [role="button"], a, span')).filter((el) => {
        const txt = (el.innerText || el.textContent || '').trim().toLowerCase();
        return (txt === 'view seats' || txt === 'hide seats' || (txt.includes('view seats') && txt.length < 25));
      });

      if (allPageButtons.length > 0) {
        if (targetOperator) {
          const opTokens = targetOperator.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter(w => w.length > 2);
          for (const btn of allPageButtons) {
            const ancestor = btn.closest('li, [class*="tuple"], [class*="bus"], div.row-sec, section') || btn.parentElement?.parentElement;
            if (ancestor) {
              const text = (ancestor.innerText || '').toLowerCase();
              if (opTokens.some(tok => text.includes(tok))) {
                viewSeatsBtn = btn;
                targetCard = ancestor;
                break;
              }
            }
          }
        }
        if (!viewSeatsBtn) {
          viewSeatsBtn = allPageButtons[0];
          targetCard = viewSeatsBtn.closest('li, [class*="tuple"], [class*="bus"], div.row-sec, section') || viewSeatsBtn.parentElement;
        }
      }
    }

    // Helper to test if seat layout is currently rendered open on screen
    const isSeatLayoutOpen = (scope) => {
      const container = scope || targetCard || document;
      return !!(
        container.querySelector(
          '.seat-layout, [class*="seat-layout" i], [class*="SeatLayout" i], canvas, [class*="slContainer" i], [class*="seatContainer" i], [class*="seat-container" i], [class*="seatPlan" i], [class*="seat-map" i], div.seat-wrapper'
        ) ||
        document.querySelector('.slContainer, .seat-layout, [class*="SeatLayout" i], canvas')
      );
    };

    // If seats are already open on this card, don't re-toggle!
    if (isSeatLayoutOpen(targetCard)) {
      showFloatingCompanion('Seats already open • Pick your berth', 4);
      hideTargetPointer(1200);
      return { success: true, alreadyOpen: true, operator: targetOperator };
    }

    // Identify the best single click target
    let clickTarget = viewSeatsBtn;

    // Check for explicit RedBus desktop button
    const explicitBtn = targetCard ? targetCard.querySelector(
      'button.view-seats, button[class*="view-seats" i], button[class*="viewSeats" i], [class*="view-seats" i], [class*="viewSeats" i], [class*="seat-btn" i]'
    ) : null;
    if (explicitBtn) {
      clickTarget = explicitBtn;
    } else if (!clickTarget && targetCard) {
      // Responsive / split-screen mode: fare section or card tuple
      clickTarget = targetCard.querySelector('[class*="fare" i], [class*="price" i], [class*="seat" i]') || targetCard;
    }

    if (!clickTarget) {
      clickTarget = targetCard;
    }

    if (!clickTarget) {
      return { success: false, error: 'Could not find bus card or seat button on page' };
    }

    // Update status to "Bus selected successfully"
    showFloatingCompanion('Bus selected successfully • Opening seats...', 4);
    if (targetCard) {
      await moveTargetPointerTo(targetCard, 'Bus selected successfully! Auto-opening seats...');
    }

    // Scroll element into view BOTH vertically and horizontally
    try {
      clickTarget.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
    } catch (e) {
      clickTarget.scrollIntoView(true);
    }
    await new Promise((r) => setTimeout(r, 200));

    const triggerClick = (targetEl) => {
      if (!targetEl) return;
      const rect = targetEl.getBoundingClientRect();
      const clientX = rect.left > 0 && rect.left < window.innerWidth ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const clientY = rect.top > 0 && rect.top < window.innerHeight ? rect.top + rect.height / 2 : window.innerHeight / 2;

      const eventInit = {
        bubbles: true,
        cancelable: true,
        composed: true,
        view: window,
        clientX,
        clientY,
        screenX: clientX,
        screenY: clientY,
        pointerId: 1,
        isPrimary: true,
        pointerType: 'mouse',
      };

      // Dispatch mousedown and mouseup (WITHOUT dispatching a duplicate synthetic click)
      ['pointerover', 'mouseover', 'pointerdown', 'mousedown', 'pointerup', 'mouseup'].forEach((type) => {
        const isPointer = type.startsWith('pointer');
        const isDown = type.includes('down');
        const isUp = type.includes('up');
        const detail = isDown || isUp ? 1 : 0;
        const buttons = isDown ? 1 : 0;
        const init = { ...eventInit, detail, buttons };
        const evt = isPointer ? new PointerEvent(type, init) : new MouseEvent(type, init);
        targetEl.dispatchEvent(evt);
      });

      // Dispatch EXACTLY ONE click event via native click (prevents double-click toggle)
      if (typeof targetEl.click === 'function') {
        targetEl.click();
      } else {
        targetEl.dispatchEvent(new MouseEvent('click', { ...eventInit, detail: 1, buttons: 0 }));
      }
    };

    // Execute ONE targeted click on the primary button
    triggerClick(clickTarget);

    // If clickTarget is an inner span/label, also click its button parent if present
    const parentClickable = clickTarget.closest('button, [role="button"], .button, [class*="view-seats" i], [class*="viewSeats" i]');
    if (parentClickable && parentClickable !== clickTarget && typeof parentClickable.click === 'function') {
      parentClickable.click();
    }

    // Poll up to 3.5s for RedBus asynchronous seat layout API to load & render
    let pollCount = 0;
    const pollInterval = setInterval(() => {
      pollCount++;
      const isOpen = isSeatLayoutOpen(targetCard) || isSeatLayoutOpen(document);
      if (isOpen) {
        clearInterval(pollInterval);
        showFloatingCompanion('Seats open • Select your preferred berth', 4);
        const layoutEl = document.querySelector('.seat-layout, [class*="seat-layout" i], [class*="SeatLayout" i], canvas, [class*="slContainer" i], [class*="seatContainer" i]');
        if (layoutEl) layoutEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // If still not open after 1.8s (pollCount 6), execute ONE gentle fallback click on the tuple/card
      if (pollCount === 6) {
        const fallbackTarget = targetCard.querySelector('[class*="fare" i], [class*="price" i], [class*="tuple" i], .tuple') || targetCard;
        if (fallbackTarget && fallbackTarget !== clickTarget && fallbackTarget !== parentClickable) {
          if (typeof fallbackTarget.click === 'function') fallbackTarget.click();
        }
      }

      if (pollCount >= 12) {
        clearInterval(pollInterval);
      }
    }, 300);

    hideTargetPointer(2200);

    // Poll for real bus photos inside expanded layout
    let extractedPhoto = '';
    const pollForPhotos = () => {
      try {
        const targetScope = targetCard || document;
        const candidateImgs = Array.from(targetScope.querySelectorAll('img, [style*="background-image"], [data-src]'));
        const foundPhotos = [];

        for (const img of candidateImgs) {
          let src = '';
          if (img.tagName === 'IMG') {
            src = img.currentSrc || img.src || img.getAttribute('data-src') || '';
          } else {
            const style = img.getAttribute('style') || '';
            const m = style.match(/url\(['"]?(https?:\/\/[^'")]+)['"]?\)/i);
            if (m) src = m[1];
          }

          if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
            const lower = src.toLowerCase();
            if (
              !lower.endsWith('.svg') &&
              !lower.includes('logo') &&
              !lower.includes('rating') &&
              !lower.includes('star') &&
              !lower.includes('icon') &&
              !lower.includes('pin') &&
              !lower.includes('avatar') &&
              !lower.includes('qr')
            ) {
              foundPhotos.push(src);
              if (!extractedPhoto) extractedPhoto = src;
            }
          }
        }

        if (foundPhotos.length > 0) {
          chrome.runtime.sendMessage({
            action: 'BUS_PHOTOS_UPDATED',
            operator: targetOperator,
            photos: foundPhotos
          }).catch(() => {});
        }
      } catch (e) {}
    };

    setTimeout(pollForPhotos, 500);
    setTimeout(pollForPhotos, 1200);
    setTimeout(pollForPhotos, 2500);

    return { success: true, opened: true, operator: targetOperator, photo: extractedPhoto };
  }

  // ==========================================================================
  // 9. Auto-Fill Passenger Details on RedBus Checkout/Seat screen
  // ==========================================================================
  function autoFillPassenger(profile = {}) {
    const name = profile.passenger_name || 'Rajesh Kumar';
    const age = String(profile.passenger_age || '28');
    const gender = (profile.passenger_gender || 'Male').toLowerCase();
    const phone = (profile.passenger_phone || '9876543210').replace(/^\+91/, '').trim();
    const email = profile.passenger_email || 'rajesh@example.com';
    const state = profile.state_name || 'Tamil Nadu';

    let filledCount = 0;

    function triggerInputEvents(input, val) {
      if (!input) return;
      input.focus();
      input.value = val;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.blur();
      filledCount++;
    }

    const nameInput = document.querySelector('input[placeholder*="Name" i], input[name*="name" i], input[id*="name" i]');
    if (nameInput) triggerInputEvents(nameInput, name);

    const ageInput = document.querySelector('input[placeholder*="Age" i], input[name*="age" i], input[id*="age" i]');
    if (ageInput) triggerInputEvents(ageInput, age);

    const genderRadios = Array.from(document.querySelectorAll('input[type="radio"], [role="radio"], button, label, span'));
    for (const gEl of genderRadios) {
      const text = (gEl.innerText || gEl.getAttribute('aria-label') || gEl.value || '').toLowerCase().trim();
      if (text === gender || text.startsWith(gender)) {
        gEl.click();
        filledCount++;
        break;
      }
    }

    const phoneInput = document.querySelector('input[placeholder*="Mobile" i], input[placeholder*="Phone" i], input[name*="mobile" i], input[type="tel"]');
    if (phoneInput) triggerInputEvents(phoneInput, phone);

    const emailInput = document.querySelector('input[placeholder*="Email" i], input[name*="email" i], input[type="email"]');
    if (emailInput) triggerInputEvents(emailInput, email);

    const stateInput = document.querySelector('input[placeholder*="State" i], select[name*="state" i], input[name*="state" i]');
    if (stateInput) triggerInputEvents(stateInput, state);

    return { success: filledCount > 0, filledCount };
  }

  let autoFillObserver = null;
  let autoFillCompleted = false;

  function startAutoFillWatcher(profile = {}) {
    if (autoFillObserver) autoFillObserver.disconnect();
    autoFillCompleted = false;

    const existingInput = document.querySelector('input[placeholder*="Name" i], input[name*="name" i], input[id*="name" i]');
    if (existingInput && existingInput.offsetParent !== null) {
      const res = autoFillPassenger(profile);
      if (res && res.success) {
        autoFillCompleted = true;
        chrome.runtime.sendMessage({
          action: 'PASSENGER_AUTO_FILLED',
          filledCount: res.filledCount,
          name: profile.passenger_name || 'Passenger',
        }).catch(() => {});
        return;
      }
    }

    autoFillObserver = new MutationObserver(() => {
      if (autoFillCompleted) return;
      const nameInput = document.querySelector('input[placeholder*="Name" i], input[name*="name" i], input[id*="name" i]');
      if (nameInput && nameInput.offsetParent !== null) {
        const res = autoFillPassenger(profile);
        if (res && res.success) {
          autoFillCompleted = true;
          if (autoFillObserver) autoFillObserver.disconnect();
          chrome.runtime.sendMessage({
            action: 'PASSENGER_AUTO_FILLED',
            filledCount: res.filledCount,
            name: profile.passenger_name || 'Passenger',
          }).catch(() => {});
        }
      }
    });

    autoFillObserver.observe(document.body, { childList: true, subtree: true });
  }

  // ==========================================================================
  // 10. In-Page Autonomous Search: STAGE 1 through STAGE 4
  // ==========================================================================
  function setNativeInputValue(element, value) {
    if (!element) return;
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value);
    } else if (valueSetter) {
      valueSetter.call(element, value);
    } else {
      element.value = value;
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function humanTypeText(element, text, delayMs = 75) {
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.classList.add('tm-ai-field-focus');
    element.focus();
    await new Promise((r) => setTimeout(r, 200));

    setNativeInputValue(element, '');
    let current = '';

    for (const char of text) {
      current += char;
      setNativeInputValue(element, current);
      element.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
      element.dispatchEvent(new KeyboardEvent('keypress', { key: char, bubbles: true }));
      element.dispatchEvent(new KeyboardEvent('keyup', { key: char, bubbles: true }));
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  async function pickFirstMatchingSuggestion(cityName, inputElement) {
    const targetNorm = cityName.toLowerCase().trim();
    const selectors = [
      'ul.sc-dnqmqq li',
      '.autoFill li',
      '[class*="autoFill"] li',
      '[class*="suggestion"] li',
      'div[class*="listHeader"]',
      'li[class*="selected"]',
      '[role="listbox"] [role="option"]',
      'div[class*="placeHolderName"]',
      '[class*="searchCategory"]',
      'li'
    ];

    let matchedItem = null;
    const startTime = Date.now();

    // Poll for RedBus autocomplete suggestions to appear in DOM
    while (Date.now() - startTime < 2200) {
      for (const sel of selectors) {
        const candidates = Array.from(document.querySelectorAll(sel));
        for (const el of candidates) {
          if (el.offsetParent === null) continue;
          const txt = (el.innerText || el.textContent || '').toLowerCase().trim();
          if (txt.includes(targetNorm) && txt.length < 80) {
            matchedItem = el;
            break;
          }
        }
        if (matchedItem) break;
      }
      if (matchedItem) break;
      await new Promise((r) => setTimeout(r, 150));
    }

    if (!matchedItem) {
      const firstSuggest = document.querySelector('.autoFill li, ul.sc-dnqmqq li, [class*="autoFill"] li, [role="option"]');
      if (firstSuggest && firstSuggest.offsetParent !== null) {
        matchedItem = firstSuggest;
      }
    }

    if (matchedItem) {
      matchedItem.classList.add('tm-ai-suggest-focus');
      await new Promise((r) => setTimeout(r, 250));
      ['mouseenter', 'mousedown', 'mouseup', 'click'].forEach((evtType) => {
        matchedItem.dispatchEvent(new MouseEvent(evtType, { bubbles: true, cancelable: true, view: window }));
      });
      if (typeof matchedItem.click === 'function') matchedItem.click();
      await new Promise((r) => setTimeout(r, 200));
      matchedItem.classList.remove('tm-ai-suggest-focus');
    }

    // Also dispatch ArrowDown and Enter keydown to commit choice in React state
    if (inputElement) {
      ['keydown', 'keyup'].forEach((evtType) => {
        inputElement.dispatchEvent(new KeyboardEvent(evtType, { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, which: 40, bubbles: true }));
        inputElement.dispatchEvent(new KeyboardEvent(evtType, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
      });
    }

    return !!matchedItem;
  }

  async function performAutonomousHomeSearch(data) {
    const { sourceCity, destinationCity, dateInfo } = data;

    // ----------------------------------------------------
    // STAGE 1: Agent Activation
    // ----------------------------------------------------
    await showStage1ActivationOverlay(sourceCity, destinationCity);

    // ----------------------------------------------------
    // STAGE 2: Typing From and To Locations
    // ----------------------------------------------------
    // 2a. Departure City
    showFloatingCompanion(`Entering departure city: <strong>${sourceCity}</strong>...`, 1);
    const srcInput = document.querySelector('#srcinput, input#src, input[placeholder*="From" i], input[id*="src" i], [aria-label*="From" i]');
    if (srcInput) {
      await moveTargetPointerTo(srcInput, 'Entering departure city...');
      await humanTypeText(srcInput, sourceCity, 75);
      await pickFirstMatchingSuggestion(sourceCity, srcInput);
      srcInput.classList.remove('tm-ai-field-focus');
    }
    await new Promise((r) => setTimeout(r, 400));

    // 2b. Destination City
    showFloatingCompanion(`Entering destination: <strong>${destinationCity}</strong>...`, 2);
    const destInput = document.querySelector('#destinput, input#dest, input[placeholder*="To" i], input[id*="dest" i], [aria-label*="To" i]');
    if (destInput) {
      await moveTargetPointerTo(destInput, 'Entering destination...');
      await humanTypeText(destInput, destinationCity, 75);
      await pickFirstMatchingSuggestion(destinationCity, destInput);
      destInput.classList.remove('tm-ai-field-focus');
    }
    await new Promise((r) => setTimeout(r, 450));

    // ----------------------------------------------------
    // STAGE 3: Date Selection
    // ----------------------------------------------------
    const friendlyDate = dateInfo?.friendly || dateInfo?.formattedDoj || 'Travel Date';
    showFloatingCompanion(`Selecting journey date: <strong>${friendlyDate}</strong>...`, 2);

    const calTrigger = document.querySelector('#onwardCal, div[id*="onward" i], div[class*="date_picker" i], div[class*="calendar" i], [aria-label*="Date" i], span[class*="date" i]');
    if (calTrigger) {
      await moveTargetPointerTo(calTrigger, 'Selecting journey date...');
      calTrigger.classList.add('tm-ai-field-focus');
      await new Promise((r) => setTimeout(r, 250));
      calTrigger.click();
      await new Promise((r) => setTimeout(r, 550));
      calTrigger.classList.remove('tm-ai-field-focus');

      const targetMonthShort = (dateInfo?.monthShort || 'Nov').toLowerCase();
      const targetDay = String(dateInfo?.day || 16);

      const calPopup = document.querySelector('div[class*="DatePicker"], div[class*="calendar"], div[class*="DayNavigator"], div[class*="monthYear"], div[role="dialog"]');
      if (calPopup) {
        const calText = (calPopup.innerText || '').toLowerCase();
        if (!calText.includes(targetMonthShort)) {
          const nextBtn = calPopup.querySelector('div[class*="next" i], [aria-label*="next" i], svg[class*="next" i], i[class*="right" i], button[class*="next" i], [class*="DayNavigator"] > div:last-child');
          if (nextBtn) {
            nextBtn.click();
            await new Promise((r) => setTimeout(r, 350));
          }
        }

        const dayCandidates = Array.from(calPopup.querySelectorAll('span[class*="DayTiles"], div[class*="DayTiles"], span.day, td.day, div[role="gridcell"], span[class*="day_"], span, div'));
        let targetCell = null;
        for (const cell of dayCandidates) {
          const txt = cell.textContent.trim();
          const cls = (cell.className || '').toString().toLowerCase();
          if (txt === targetDay && !cls.includes('disab') && !cls.includes('past') && !cls.includes('header')) {
            targetCell = cell;
            break;
          }
        }

        if (targetCell) {
          targetCell.classList.add('tm-ai-date-highlight');
          await moveTargetPointerTo(targetCell, 'Selecting journey date...');
          await new Promise((r) => setTimeout(r, 400));
          ['mouseenter', 'mousedown', 'mouseup', 'click'].forEach((type) => {
            targetCell.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
          });
          if (typeof targetCell.click === 'function') targetCell.click();

          // Show success indicator
          const bubble = document.querySelector('#tmPointerBubble');
          if (bubble) bubble.innerHTML = '✓ Date confirmed';
          await new Promise((r) => setTimeout(r, 450));
          targetCell.classList.remove('tm-ai-date-highlight');
        }
      }
    }
    await new Promise((r) => setTimeout(r, 400));

    // ----------------------------------------------------
    // STAGE 4: Bus Search
    // ----------------------------------------------------
    showFloatingCompanion('Searching available buses...', 3);
    const searchBtn = document.querySelector('#search_button, button[id*="search" i], button.search_btn, [class*="searchBtn" i], button[class*="search" i], div[role="button"][id*="search" i]');
    if (searchBtn) {
      await moveTargetPointerTo(searchBtn, 'Searching available buses...');
      searchBtn.classList.add('tm-ai-btn-pulse');
      await new Promise((r) => setTimeout(r, 400));
      searchBtn.click();
      await new Promise((r) => setTimeout(r, 300));
      searchBtn.classList.remove('tm-ai-btn-pulse');
    }

    showFloatingCompanion('Buses found! Analyzing live inventory...', 3);
    hideTargetPointer(1500);

    return { success: true };
  }

  // ==========================================================================
  // 11. Message Router
  // ==========================================================================
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'PING') {
      sendResponse({ pong: true, url: window.location.href });
      return true;
    }

    if (request.action === 'GET_PAGE_INFO') {
      sendResponse(extractCurrentRouteInfo());
      return true;
    }

    if (request.action === 'AUTONOMOUS_HOME_SEARCH') {
      performAutonomousHomeSearch(request).then((res) => {
        sendResponse(res);
      }).catch((err) => {
        sendResponse({ success: false, error: err.message });
      });
      return true;
    }

    if (request.action === 'SCAN_PAGE_BUSES') {
      const buses = scrapePageBuses();
      sendResponse({ success: true, count: buses.length, buses });
      return true;
    }

    if (request.action === 'HIGHLIGHT_AND_SELECT_BUS') {
      highlightAndSelectBus(request.operator, request.agentId).then((res) => {
        sendResponse(res);
      }).catch((err) => {
        sendResponse({ success: false, error: err.message });
      });
      return true;
    }

    if (request.action === 'AUTO_FILL_PASSENGER') {
      const res = autoFillPassenger(request.profile);
      sendResponse(res);
      return true;
    }

    if (request.action === 'START_AUTO_FILL_WATCHER') {
      startAutoFillWatcher(request.profile);
      sendResponse({ success: true });
      return true;
    }

    return false;
  });

  // 12. Auto-Recover from broken / "Oops!! No buses found" states caused by stale or bad numeric city IDs
  function autoRecoverCorruptedSearchRoute() {
    const url = window.location.href;
    if (!url.includes('/bus-tickets/')) return;

    const hasCorruptParams = url.includes('undefined') ||
      url.includes('fromCityId=') ||
      url.includes('toCityId=');

    if (hasCorruptParams) {
      const checkAndRecover = () => {
        const bodyText = (document.body ? document.body.innerText : '') || '';
        const isNoBuses = bodyText.includes('Oops!!') || bodyText.includes('No buses found') || bodyText.includes('No routes available');
        if (isNoBuses) {
          const routeMatch = url.match(/\/bus-tickets\/([a-z0-9-]+)-to-([a-z0-9-]+)/i);
          if (routeMatch) {
            const srcSlug = routeMatch[1];
            const destSlug = routeMatch[2];
            const dateMatch = url.match(/[?&](?:onward|doj)=([^&]+)/i);
            const doj = dateMatch ? decodeURIComponent(dateMatch[1]) : '';
            const cleanUrl = `https://www.redbus.in/bus-tickets/${srcSlug}-to-${destSlug}?${doj ? 'doj=' + encodeURIComponent(doj) + '&' : ''}ref=home`;
            console.log('[TravelMate] Auto-recovering from corrupted city IDs to canonical RedBus route:', cleanUrl);
            window.location.replace(cleanUrl);
          }
        }
      };
      setTimeout(checkAndRecover, 500);
      setTimeout(checkAndRecover, 1800);
    }
  }

  // Automatically show the floating assistant companion when RedBus is loaded
  function initOnPageReady() {
    const route = extractCurrentRouteInfo();
    const initialStatus = route.isResultsPage
      ? 'TravelMate Agent Active • Live Bus Inventory'
      : 'TravelMate Agent Ready • Ask to book';
    showFloatingCompanion(initialStatus, route.isResultsPage ? 3 : 1);
    autoRecoverCorruptedSearchRoute();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOnPageReady);
  } else {
    initOnPageReady();
  }
})();
