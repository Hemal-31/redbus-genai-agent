// TravelMate Agent - Microphone Permission Handler
// Manifest V3 Extension Tab for Native Chrome Permission Prompt

const btn = document.getElementById('requestMicBtn');
const btnLabel = document.getElementById('btnLabel');
const statusMsg = document.getElementById('statusMsg');
const unblockGuide = document.getElementById('unblockGuide');
const copySettingsBtn = document.getElementById('copySettingsBtn');
const visualizer = document.getElementById('liveVisualizer');
const vbars = visualizer.querySelectorAll('.vbar');

let audioCtx = null;
let animFrameId = null;

async function askMicPermission() {
  statusMsg.className = 'status-msg';
  statusMsg.textContent = 'Requesting Chrome microphone permission...';
  unblockGuide.classList.remove('active');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    statusMsg.className = 'status-msg success';
    statusMsg.textContent = '✅ Microphone permission granted! Testing voice input...';
    btnLabel.textContent = '✅ Microphone Active';
    btn.style.background = '#22c55e';
    visualizer.classList.add('active');

    // Create simple audio meter to show live input
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 32;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      function updateMeter() {
        analyser.getByteFrequencyData(dataArray);
        for (let i = 0; i < vbars.length; i++) {
          const val = dataArray[i] || 0;
          const h = Math.max(6, Math.min(32, (val / 255) * 36));
          vbars[i].style.height = `${h}px`;
        }
        animFrameId = requestAnimationFrame(updateMeter);
      }
      updateMeter();
    } catch (e) {
      console.log('Visualizer notice:', e);
    }

    // Notify sidepanel
    try {
      chrome.runtime.sendMessage({ action: 'MIC_PERMISSION_GRANTED' });
    } catch (e) {}

    // Close tab after 1.8s
    setTimeout(() => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (audioCtx) {
        try { audioCtx.close(); } catch (e) {}
      }
      stream.getTracks().forEach((track) => track.stop());
      window.close();
    }, 1800);
  } catch (err) {
    console.log('Microphone permission notice:', err);
    statusMsg.className = 'status-msg error';
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      statusMsg.innerHTML = '⚠️ Chrome has not granted microphone access to this extension yet.';
      btnLabel.textContent = '🔄 Test Microphone Again';
      unblockGuide.classList.add('active');
    } else {
      statusMsg.textContent = `⚠️ Error: ${err.message || 'Microphone unavailable'}`;
    }
  }
}

btn.addEventListener('click', askMicPermission);

if (copySettingsBtn) {
  copySettingsBtn.addEventListener('click', async () => {
    const extId = chrome.runtime.id;
    const directUrl = `chrome://settings/content/siteDetails?site=chrome-extension%3A%2F%2F${extId}`;
    try {
      await navigator.clipboard.writeText(directUrl);
      copySettingsBtn.textContent = '✅ Copied Direct URL!';
      setTimeout(() => {
        copySettingsBtn.textContent = '📋 Copy Direct Settings URL';
      }, 2500);
    } catch (e) {
      prompt('Copy and paste this URL in a new Chrome tab:', directUrl);
    }
  });
}
