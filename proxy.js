/* global browser, ui, tor */
'use strict';

const proxy = {
  onchanges: [],
  set: (info, callback = function() {}) => {
    chrome.proxy.settings.set({
      value: {
        mode: 'pac_script',
        pacScript: {
          data: `
            function FindProxyForURL() {
              return 'SOCKS5 ${tor.info['socks-host']}:${tor.info['socks-port']}';
            }
          `
        }
      }
    }, () => {
      proxy.onchanges.forEach(c => c(true));
      callback();
    });
  },
  reset: (callback = function() {}) => {
    chrome.proxy.settings.set({
      value: {
        mode: 'system'
      }
    }, () => {
      proxy.onchanges.forEach(c => c(false));
      callback();
    });
  },
  addListener: (method, callback) => {
    if (method === 'change') {
      proxy.onchanges.push(callback);
    }
  }
};

if (/Firefox/.test(navigator.userAgent)) {
  proxy.set = (info, callback = function() {}) => {
    browser.proxy.settings.set({
      value: {
        proxyType: 'manual',
        socks: `http://${tor.info['socks-host']}:${tor.info['socks-port']}`,
        socksVersion: 5,
        passthrough: '',
        proxyDNS: true
      }
    }, () => {
      const lastError = chrome.runtime.lastError;
      if (lastError) {
        ui.notification(lastError.message);
        tor.emit('stdout', 'WebExtension API [err] ' + lastError.message + '\n');
        tor.disconnect();
        callback();
      }
    });
  };
  proxy.reset = (callback = function() {}) => {
    browser.proxy.settings.clear({}).then(callback);
  };
}
