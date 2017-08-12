'use strict';

var proxy = {
  onchanges: [],
  set: (info, callback = function() {}) => {
    chrome.proxy.settings.set({
      value: {
        mode: 'pac_script',
        pacScript: {
          url: chrome.runtime.getURL('data/pac/chrome.js')
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
/*  browser.proxy.onProxyError.addListener(error => {
    console.error(`Proxy error: ${error.message}`);
  });*/
  const register = browser.proxy.register || browser.proxy.registerProxyScript;
  register('data/pac/firefox.js');

  proxy.set = (info, callback = function() {}) => {
    browser.runtime.sendMessage({
      method: 'register-proxy',
      proxy: 'SOCKS ' + info['socks-host'] + ':' + info['socks-port']
    }, {toProxyScript: true}, () => {
      proxy.onchanges.forEach(c => c(true));
      callback();
    });
  };
  proxy.reset = (callback = function() {}) => {
    browser.runtime.sendMessage({
      method: 'register-proxy',
      proxy: 'DIRECT'
    }, {toProxyScript: true}, () => {
      proxy.onchanges.forEach(c => c(false));
      callback();
    });
  };
}
