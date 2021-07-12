'use strict';

const toast = document.getElementById('toast');

if (/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)) {
  document.getElementById('directory').placeholder = 'e.g.: /Users/me/Downloads/mac';
}

function save() {
  chrome.storage.local.set({
    'directory': document.getElementById('directory').value,
    'webrtc': document.getElementById('webrtc').value,
    'policy.webrtc': Number(document.getElementById('policy.webrtc').value)
  }, () => {
    toast.textContent = 'Options saved.';
    setTimeout(() => toast.textContent = '', 750);
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

const links = window.links = (d = document) => {
  for (const a of [...d.querySelectorAll('[data-href]')]) {
    if (a.hasAttribute('href') === false) {
      a.href = chrome.runtime.getManifest().homepage_url + '#' + a.dataset.href;
    }
  }
};
document.addEventListener('DOMContentLoaded', () => links());

// reset
document.getElementById('reset').addEventListener('click', e => {
  if (e.detail === 1) {
    toast.textContent = 'Double-click to reset!';
    window.setTimeout(() => toast.textContent = '', 750);
  }
  else {
    localStorage.clear();
    chrome.storage.local.clear(() => {
      chrome.runtime.reload();
      window.close();
    });
  }
});
// support
document.getElementById('support').addEventListener('click', () => chrome.tabs.create({
  url: chrome.runtime.getManifest().homepage_url + '?rd=donate'
}));
