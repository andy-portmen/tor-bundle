/* globals EventEmitter */
'use strict';

var ui = new EventEmitter();
ui.cache = {
  status: 'disconnected',
  ip: '0.0.0.0',
  country: '-',
  proxy: 'default'
};

ui.on('title', obj => {
  ui.cache = Object.assign(ui.cache, obj);

  chrome.browserAction.setTitle({
    title: `Tor Browser (${ui.cache.status})

IP: ${ui.cache.ip}
Country: ${ui.cache.country}
Proxy: ${ui.cache.proxy}`
  });
});
ui.on('title', obj => {
  if (obj.status) {
    let active = obj.status === 'connected';
    chrome.browserAction.setIcon({
      path: {
        16: '/data/icons/' + (active ? 'enabled/' : '') + '16.png',
        32: '/data/icons/' + (active ? 'enabled/' : '') + '32.png',
        64: '/data/icons/' + (active ? 'enabled/' : '') + '64.png',
      }
    });
  }
});

ui.notification = function (message) {
  chrome.notifications.create({
    type: 'basic',
    title: 'Tor Protector',
    message,
    iconUrl: '/data/icons/48.png'
  });
};
