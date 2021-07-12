'use strict';

const elements = {
  log: document.getElementById('log'),
  template: document.querySelector('#log template'),
  webrtc: document.getElementById('prefs.webrtc')
};

function log(msg = '', type = '') {
  console.log(msg, type);
  function single(msg) {
    let node = document.importNode(elements.template.content, true);
    node = document.createElement('span');
    node.classList.add('log');
    if (msg.indexOf('[notice]') !== -1) {
      node.classList.add('notice');
    }
    if (msg.indexOf('[warn]') !== -1) {
      node.classList.add('warn');
    }
    if (msg.indexOf('[err]') !== -1 || type === 'error') {
      node.classList.add('err');
    }
    node.textContent = msg.replace(/↵/g, '\n');

    elements.log.appendChild(node);
    elements.log.scrollTop = elements.log.scrollHeight;
  }
  console.log(msg);
  msg.split('\n').filter(m => m.trim()).forEach(single);
}

function status(s) {
  document.body.dataset.status = s;
  document.querySelector('[data-cmd="connection"]').src =
    s === 'disconnected' ? 'off.svg' : 'on.svg';
}

window.addEventListener('load', () => chrome.runtime.sendMessage({
  method: 'popup-report'
}, report => {
  log(report.stdout);
  status(report.status);
}));


chrome.runtime.onMessage.addListener(request => {
  if (request.cmd === 'event' && request.id === 'stdout') {
    log(request.data);
  }
  if (request.cmd === 'event' && request.id === 'stderr') {
    log(request.data, 'error');
  }
  else if (request.cmd === 'event' && request.id === 'status') {
    status(request.data);
  }
});

document.addEventListener('click', e => {
  let cmd = e.target.dataset.rcmd;
  if (cmd) {
    chrome.runtime.sendMessage({
      method: 'popup-command',
      cmd
    });
  }
  cmd = e.target.dataset.cmd;
  if (cmd === 'verify') {
    chrome.tabs.create({
      url: 'https://check.torproject.org/'
    });
  }
  if (cmd === 'address') {
    chrome.tabs.create({
      url: 'https://webbrowsertools.com/ip-address/'
    });
  }
  else if (cmd === 'connection') {
    chrome.runtime.sendMessage({
      method: 'popup-action',
      cmd,
      action: document.body.dataset.status === 'disconnected' ? 'connect' : 'disconnect'
    });
  }
});
