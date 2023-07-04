/* global $ */// dom.js
/* global deepEqual */// toolbox.js
/* global msg */
'use strict';

const router = {
  buffer: (history.state || {}).buffer || [],
  watchers: [],

  getSearch(key) {
    return new URLSearchParams(location.search).get(key);
  },

  /** When showing the UI, `showHide` function must resolve only when the UI is closed */
  makeToggle(hashId, showHide, deps) {
    const hash = '#' + hashId;
    const selector = '.' + hashId;
    router.watch({hash}, async state => {
      const el = $(selector);
      if (!state === !el) return;
      if (state && deps) await require(deps);
      await showHide(state, el, selector);
      if (state) router.updateHash('');
    });
    return router.updateHash.bind(router, hash);
  },

  push(url) {
    const state = history.state || {};
    state.buffer = router.buffer;
    history.pushState(state, null, url);
  },

  update(replace) {
    const {buffer} = router;
    if (!buffer.length) {
      buffer.push(location.href);
    } else if (buffer[buffer.length - 1] === location.href) {
      return;
    } else if (replace) {
      buffer[buffer.length - 1] = location.href;
    } else if (buffer.length > 1 && buffer[buffer.length - 2] === location.href) {
      buffer.pop();
    } else {
      buffer.push(location.href);
    }
    for (const {options, callback} of router.watchers) {
      let state;
      if (options.hash) {
        state = options.hash === location.hash;
      } else if (options.search) {
        const search = new URLSearchParams(location.search);
        state = options.search.map(key => search.get(key));
      }
      if (!deepEqual(state, options.currentState)) {
        options.currentState = state;
        callback(state);
      }
    }
  },

  /**
   * @param {string} hash - empty string removes the hash
   */
  updateHash(hash) {
    const {buffer} = router;
    if (buffer.length > 1) {
      if (!hash && !buffer[buffer.length - 2].includes('#') ||
          hash && buffer[buffer.length - 2].endsWith(hash)) {
        history.back();
        return;
      }
    }
    if (!hash) {
      hash = ' ';
    }
    router.push(hash);
    router.update();
  },

  /**
   * @param {Object|string} what - an object or a single key
   * @param {string} [value] - for `key` mode
   */
  updateSearch(what, value) {
    const u = new URL(location);
    const entries = typeof what === 'object' ? Object.entries(what) : [[what, value]];
    for (const [key, val] of entries) {
      u.searchParams[val ? 'set' : 'delete'](key, val);
    }
    history.replaceState(history.state, null, `${u}`);
    router.update(true);
  },

  watch(options, callback) {
    /* Watch search params or hash and get notified on change.

     options: {search?: Array<key: String>, hash?: String}
     callback: (Array<value: String | null> | Boolean) => void

     `hash` should always start with '#'.
     When watching search params, callback receives a list of values.
     When watching hash, callback receives a boolean.
     */
    router.watchers.push({options, callback});
  },
};

document.on('DOMContentLoaded', () => router.update());
window.on('popstate', () => router.update());
window.on('hashchange', () => router.update());
msg.on(e => {
  if (e.method === 'pushState' && e.url !== location.href) {
    router.push(e.url);
    router.update();
    return true;
  }
});
