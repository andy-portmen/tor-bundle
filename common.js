/* globals Tor, proxy, privacy, ui */
'use strict';

var prefs = {
  webrtc: 2,
  policy: {
    'proxy': 0, // 0: turn on when tor is active and turn off when tor is disabled; 1: turn on when browser starts and do not turn off when tor is disabled
    'webrtc': 0, // 0: turn on when tor is active and turn off when tor is disabled; 1: turn on when browser starts and do not turn off when tor is disabled
  },
  'auto-run': false,
  'directory': null
};
chrome.storage.onChanged.addListener(ps => {
  Object.keys(ps).forEach(p => prefs[p] = ps[p].newValue);
});

var tor = new Tor({
  directory: ''
});

// get external IP address
tor.on('status', status => {
  ui.emit('title', {status});
  if (status === 'connected') {
    tor.getIP();
  }
});

// Set proxy
tor.on('status', s => {
  if (s === 'connected') {
    proxy.set(tor.info);
    privacy.set(prefs.webrtc);
  }
  else if (s === 'disconnected') {
    if (prefs.policy.proxy === 0) {
      proxy.reset();
    }
    if (prefs.policy.webrtc === 0) {
      privacy.reset();
    }
  }
});
// ip changes
tor.on('ip', ip => ui.emit('title', {ip}));
//
proxy.addListener('change', bol => ui.emit('title', {
  proxy: bol ? 'SOCKS' : 'default'
}));
chrome.storage.local.get(prefs, p => {
  prefs = p;
  // directory
  tor.directory = p.directory;
  // auto run?
  if (prefs['auto-run']) {
    tor.refresh();
  }
  if (prefs.policy.proxy === 1) {
    privacy.set(prefs.proxy);
  }
  if (prefs.policy.webrtc === 1) {
    privacy.set(prefs.webrtc);
  }
});
// logs
proxy.addListener('change', s => {
  tor.emit('stdout', `Proxy status is "${s}"`);
});
privacy.addListener('change', (type, state) => {
  tor.emit('stdout', `Protection: module -> ${type}, status -> ${state}`);
});

chrome.runtime.onMessage.addListener(request => {
  if (request.method === 'popup-command') {
    if (request.cmd) {
      tor.command(request.cmd);
    }
  }
  else if (request.method === 'popup-action') {
    if (request.cmd === 'connection') {
      if (request.action === 'disconnect') {
        tor.disconnect();
      }
      else {
        if (prefs.directory) {
          tor.refresh();
        }
        else {
          ui.notification('Tor Bundle path is not set in the options page');
          chrome.runtime.openOptionsPage();
        }
      }
    }
  }
});
