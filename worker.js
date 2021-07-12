/* globals Tor, proxy, privacy, ui */
'use strict';

self.importScripts('EventEmitter.js', 'tor.js', 'proxy.js', 'privacy.js', 'ui.js');

const prefs = {
  'webrtc': /Firefox/.test(navigator.userAgent) ? 3 : 2,
  // 0: turn on when tor is active and turn off when tor is disabled;
  // 1: turn on when browser starts and do not turn off when tor is disabled
  // -1: ignore changing
  'policy.webrtc': 0,
  'policy.proxy': 0,
  'auto-run': false,
  'directory': null
};

const tor = new Tor({
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
    if (prefs['policy.proxy'] === 0) {
      proxy.set(tor.info);
    }
    if (prefs['policy.webrtc'] === 0) {
      privacy.set(prefs.webrtc);
    }
  }
  else if (s === 'disconnected') {
    if (prefs['policy.proxy'] === 0) {
      proxy.reset();
    }
    if (prefs['policy.webrtc'] === 0) {
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
  Object.assign(prefs, p);

  // directory
  tor.directory = p.directory;
  // auto run?
  if (prefs['auto-run']) {
    tor.refresh();
  }
  // if (prefs.policy.proxy === 1) {
  //   privacy.set(prefs.proxy);
  // }
  if (prefs['policy.webrtc'] === 1) {
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

chrome.runtime.onMessage.addListener((request, sender, response) => {
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
  else if (request.method === 'popup-report') {
    response({
      stdout: tor.info.stdout,
      status: tor.info.status
    });
  }
});

// pref updates
chrome.storage.onChanged.addListener(ps => {
  Object.keys(ps).forEach(p => {
    prefs[p] = ps[p].newValue;
    if (p === 'directory') {
      tor.directory = ps.directory.newValue;
    }
  });
});

/* FAQs & Feedback */
{
  const {management, runtime: {onInstalled, setUninstallURL, getManifest}, storage, tabs} = chrome;
  if (navigator.webdriver !== true) {
    const page = getManifest().homepage_url;
    const {name, version} = getManifest();
    onInstalled.addListener(({reason, previousVersion}) => {
      management.getSelf(({installType}) => installType === 'normal' && storage.local.get({
        'faqs': true,
        'last-update': 0
      }, prefs => {
        if (reason === 'install' || (prefs.faqs && reason === 'update')) {
          const doUpdate = (Date.now() - prefs['last-update']) / 1000 / 60 / 60 / 24 > 45;
          if (doUpdate && previousVersion !== version) {
            tabs.query({active: true, currentWindow: true}, tbs => tabs.create({
              url: page + '?version=' + version + (previousVersion ? '&p=' + previousVersion : '') + '&type=' + reason,
              active: reason === 'install',
              ...(tbs && tbs.length && {index: tbs[0].index + 1})
            }));
            storage.local.set({'last-update': Date.now()});
          }
        }
      }));
    });
    setUninstallURL(page + '?rd=feedback&name=' + encodeURIComponent(name) + '&version=' + version);
  }
}
