
(function () {
  "use strict";

  // Tempat menyimpan seluruh event dan listener
  const events = new Map();

  // Memanggil semua listener dari suatu event
  function emit(eventName, data = null) {
    const listeners = events.get(eventName);

    if (!listeners) return;

    listeners.forEach(function (listener) {
      try {
        listener(data);
      } catch (error) {
        console.error(
          `MSAvk Event Error (${eventName}):`,
          error
        );
      }
    });
  }

  // Mendaftarkan listener baru
  function on(eventName, callback) {
    if (
      typeof eventName !== "string" ||
      typeof callback !== "function"
    ) {
      return function () {};
    }

    if (!events.has(eventName)) {
      events.set(eventName, new Set());
    }

    events.get(eventName).add(callback);

    // Mengembalikan fungsi untuk berhenti mendengarkan
    return function unsubscribe() {
      off(eventName, callback);
    };
  }

  // Menghapus listener
  function off(eventName, callback) {
    const listeners = events.get(eventName);

    if (!listeners) return;

    listeners.delete(callback);

    if (listeners.size === 0) {
      events.delete(eventName);
    }
  }

  // Listener yang hanya berjalan sekali
  function once(eventName, callback) {
    let unsubscribe;

    const wrapper = function (data) {
      unsubscribe();
      callback(data);
    };

    unsubscribe = on(eventName, wrapper);

    return unsubscribe;
  }

  // Menghapus seluruh listener dari suatu event
  function clear(eventName) {
    if (eventName) {
      events.delete(eventName);
    } else {
      events.clear();
    }
  }

  // Ekspor Event System
  window.MSAvk = window.MSAvk || {};

  window.MSAvk.Event = {
    on,
    off,
    emit,
    once,
    clear
  };

})();
