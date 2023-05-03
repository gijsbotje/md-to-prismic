#!/usr/bin/env node

require = require('esm')(module /*, options*/);
import('../src/index.js').then(module => {
  module.default();
});