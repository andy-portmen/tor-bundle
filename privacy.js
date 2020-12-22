'use strict';

const privacy = {
  onchanges: [],
  modes: {
    0: 'default_public_and_private_interfaces',
    1: 'default_public_interface_only',
    2: 'disable_non_proxied_udp',
    3: 'proxy_only'
  },
  current: {
    value: 'default'
  },
  set(mode = 2, callback = function() {}) {
    chrome.privacy.network.webRTCIPHandlingPolicy.get({}, o => {
      privacy.current = {
        value: o.value
      };

      chrome.privacy.network.webRTCIPHandlingPolicy.set({
        value: privacy.modes[mode]
      }, () => {
        privacy.onchanges.forEach(c => c('webrtc', privacy.modes[mode]));
        callback();
      });
    });
  },
  reset(callback = function() {}) {
    chrome.privacy.network.webRTCIPHandlingPolicy.set(privacy.current, () => {
      privacy.onchanges.forEach(c => c('webrtc', false));
      callback();
    });
  },
  addListener(method, callback) {
    if (method === 'change') {
      privacy.onchanges.push(callback);
    }
  }
};
