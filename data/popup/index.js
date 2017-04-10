'use strict';

var elements = {
  log: document.getElementById('log'),
  template: document.querySelector('#log template'),
  webrtc: document.getElementById('prefs.webrtc')
};

function log (msg) {
  function single (msg) {
    let node = document.importNode(elements.template.content, true);
    let parts = /(.*)\[(err|warn|notice)\] (.*)/.exec(msg);
    if (parts) {
      node.querySelector('span:nth-child(1)').textContent = parts[1];
      node.querySelector('span:nth-child(2)').textContent = parts[2];
      node.querySelector('span:nth-child(3)').textContent = parts[3];
    }
    else {
      node = document.createElement('span');
      node.classList.add('log');
      node.textContent = msg;
    }

    elements.log.appendChild(node);
    elements.log.scrollTop = elements.log.scrollHeight;
  }
  msg.split('\n').filter(m => m.trim()).forEach(single);
}

function status (s) {
  document.body.dataset.status = s;
  document.querySelector('[data-cmd="connection"]').src =
    s === 'disconnected' ? 'off.png' : 'on.png';
}

window.addEventListener('load', () => {
  chrome.runtime.getBackgroundPage(b => {
    log(b.tor.info.stdout);
    status(b.tor.info.status);
  });
});

chrome.runtime.onMessage.addListener(request => {
  if (request.cmd === 'event' && request.id === 'stdout') {
    log(request.data);
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
  else if (cmd === 'connection') {
    chrome.runtime.sendMessage({
      method: 'popup-action',
      cmd,
      action: document.body.dataset.status === 'disconnected' ? 'connect' : 'disconnect'
    });
  }
});
