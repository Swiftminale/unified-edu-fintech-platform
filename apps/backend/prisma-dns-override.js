const dns = require('dns');

const overrides = {
  'cdn.npmmirror.com': '112.124.140.165',
  'npmmirror.com': '112.124.140.165',
  'binaries.prisma.sh': '104.20.43.103',
  'binaries-failover.prisma.sh': '104.20.43.103',
  'r2.prisma.sh': '104.20.43.103'
};

const originalLookup = dns.lookup;
dns.lookup = function(hostname, options, callback) {
  let cb = callback;
  let opts = options;
  if (typeof options === 'function') {
    cb = options;
    opts = {};
  }
  if (overrides[hostname]) {
    const ip = overrides[hostname];
    if (opts && opts.all) {
      return cb(null, [{ address: ip, family: 4 }]);
    }
    return cb(null, ip, 4);
  }
  return originalLookup(hostname, options, callback);
};
