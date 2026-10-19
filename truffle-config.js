// ZOMBIENEXUS Truffle config (CommonJS).
// development = Ganache on 7545 (npm run chain), test = throwaway Ganache on 8545 (npm test).
// solc 0.4.25 is the local solc-js package, so compiling needs no download.
const path = require('path');

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '1337',
    },
    test: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
    },
  },

  mocha: {
    timeout: 100000,
  },

  compilers: {
    solc: {
      version: path.join(__dirname, 'node_modules', 'solc', 'soljson.js'),
    },
  },
};
