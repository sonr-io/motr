// Setup localStorage polyfill for Node.js child processes
// This file is required via NODE_OPTIONS to make localStorage available globally

// Create a minimal localStorage implementation
const storage = {};

const localStoragePolyfill = {
  getItem: function(key) {
    return storage[key] || null;
  },
  setItem: function(key, value) {
    storage[key] = String(value);
  },
  removeItem: function(key) {
    delete storage[key];
  },
  clear: function() {
    for (const key in storage) {
      delete storage[key];
    }
  },
  get length() {
    return Object.keys(storage).length;
  },
  key: function(index) {
    const keys = Object.keys(storage);
    return keys[index] || null;
  }
};

// Set up global localStorage
if (typeof global.localStorage === 'undefined') {
  global.localStorage = localStoragePolyfill;
}
