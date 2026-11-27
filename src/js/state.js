// state.js – Zentraler App-State mit Event-Bus

const _state = {
  children: [],
  settings: { currency: '€' },
  adminAuthenticated: false,
};

const _listeners = {};

/**
 * Aktuellen State (flache Kopie) zurückgeben
 */
export function getState() {
  return { ..._state };
}

/**
 * State aktualisieren und Subscriber benachrichtigen
 * @param {Partial<typeof _state>} partial
 */
export function setState(partial) {
  Object.assign(_state, partial);
  for (const key of Object.keys(partial)) {
    if (_listeners[key]) {
      _listeners[key].forEach(fn => fn(_state[key]));
    }
  }
}

/**
 * Auf State-Änderungen eines Keys reagieren
 * @param {string} key
 * @param {Function} fn
 * @returns {Function} Unsubscribe-Funktion
 */
export function subscribe(key, fn) {
  if (!_listeners[key]) _listeners[key] = [];
  _listeners[key].push(fn);
  return () => {
    _listeners[key] = _listeners[key].filter(l => l !== fn);
  };
}
