/* globals EventEmitter */
'use strict';

const ui = new EventEmitter();
ui.cache = {
  status: 'disconnected',
  ip: '0.0.0.0',
  country: '-',
  proxy: 'default'
};

ui.on('title', obj => {
  ui.cache = Object.assign(ui.cache, obj);

  chrome.action.setTitle({
    title: `Tor Browser (${ui.cache.status})

IP: ${ui.cache.ip}
Country: ${ui.cache.country}
Proxy: ${ui.cache.proxy}`
  });
});
ui.on('title', obj => {
  if (obj.status) {
    const active = obj.status === 'connected';
    chrome.action.setIcon({
      path: {
        16: '/data/icons/' + (active ? 'enabled/' : '') + '16.png',
        19: '/data/icons/' + (active ? 'enabled/' : '') + '19.png',
        32: '/data/icons/' + (active ? 'enabled/' : '') + '32.png',
        38: '/data/icons/' + (active ? 'enabled/' : '') + '38.png',
        48: '/data/icons/' + (active ? 'enabled/' : '') + '48.png',
        64: '/data/icons/' + (active ? 'enabled/' : '') + '64.png'
      }
    });
  }
});

ui.notification = function(message) {
  chrome.notifications.create({
    type: 'basic',
    title: chrome.runtime.getManifest().name,
    message,
    iconUrl: '/data/icons/48.png'
  });
};
