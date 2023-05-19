#!/usr/bin/env node

require = require('esm')(module /*, options*/);
import('../dist/cli.js').then(module => {
  module.default();
});