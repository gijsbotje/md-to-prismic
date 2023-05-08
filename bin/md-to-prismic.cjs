#!/usr/bin/env node

require = require('esm')(module /*, options*/);
import('../src/cli.js').then(module => {
  module.default();
});