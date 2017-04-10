'use strict';

var proxy = {
  onchanges: [],
  current: {
    value: {
      mode: 'system'
    }
  },
  set: (info, callback = function () {}) => {
    let rule = {
      host: info['socks-host'],
      port: info['socks-port'],
      scheme: 'socks5'
    };
    chrome.proxy.settings.get({}, o => {
      proxy.current = {
        value: o.value
      };
      console.log(proxy.current);

      chrome.proxy.settings.set({
        value: {
          mode: 'fixed_servers',
          rules: {
            proxyForHttp: rule,
            proxyForHttps: rule,
            proxyForFtp: rule,
            fallbackProxy: rule
          }
        }
      }, () => {
        proxy.onchanges.forEach(c => c(true));
        callback();
      });
    });
  },
  reset: (callback = function () {}) => {
    chrome.proxy.settings.set(proxy.current, () => {
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
