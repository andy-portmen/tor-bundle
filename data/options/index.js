'use strict';

function save () {
  let directory = document.getElementById('directory').value;
  chrome.storage.local.set({
    directory
  }, () => {
    let status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(() => status.textContent = '', 750);
  });
}

function restore () {
  chrome.storage.local.get({
    directory: '',
  }, (prefs) => {
    document.getElementById('directory').value = prefs.directory;
  });
}
document.addEventListener('DOMContentLoaded', restore);
document.getElementById('save').addEventListener('click', save);
