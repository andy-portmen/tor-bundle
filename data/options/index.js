'use strict';

function save() {
  chrome.storage.local.set({
    'directory': document.getElementById('directory').value,
    'webrtc': document.getElementById('webrtc').value,
    'policy.webrtc': Number(document.getElementById('policy.webrtc').value)
  }, () => {
    const status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(() => status.textContent = '', 750);
  });
}

function restore() {
  chrome.storage.local.get({
    'directory': '',
    'webrtc': /Firefox/.test(navigator.userAgent) ? 3 : 2,
    'policy.webrtc': 0
  }, prefs => {
    document.getElementById('webrtc').value = prefs.webrtc;
    document.getElementById('directory').value = prefs.directory;
    document.getElementById('policy.webrtc').value = prefs['policy.webrtc'];
  });
}
document.addEventListener('DOMContentLoaded', restore);
document.getElementById('save').addEventListener('click', save);
if (/Firefox/.test(navigator.userAgent) === false) {
  document.querySelector('[value="3"]').disabled = true;
}
