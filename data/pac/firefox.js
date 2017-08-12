var proxy = 'DIRECT';

function FindProxyForURL (url, host) {
  return proxy;
}

browser.runtime.onMessage.addListener(request => {
  if (request.method === 'register-proxy') {
    proxy = request.proxy;
  }
});
