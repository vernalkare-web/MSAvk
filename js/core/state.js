(function () {
  "use strict";

  const Storage = window.MSAvk.Storage;

  if (!Storage) {
    console.error("MSAvk Storage belum dimuat!");
    return;
  }

  // Data aplikasi saat ini
  let state = Storage.load();

  // Daftar listener perubahan state
  const listeners = new Set();

  // Membuat salinan data agar tidak mengubah state langsung
  function getState() {
    return JSON.parse(JSON.stringify(state));
  }

  // Memberi tahu semua modul bahwa data berubah
  function notify() {
    const currentState = getState();

    listeners.forEach(function (listener) {
      try {
        listener(currentState);
      } catch (error) {
        console.error("State listener error:", error);
      }
    });
  }

  // Memperbarui data aplikasi
  function setState(updates, persist = true) {
    if (!updates || typeof updates !== "object") {
      return false;
    }

    state = {
      ...state,
      ...updates,

      coordinates: {
        ...state.coordinates,
        ...(updates.coordinates || {})
      }
    };

    if (persist) {
      const saved = Storage.save(state);

      if (!saved) {
        console.warn("State berubah, tetapi penyimpanan gagal.");
      }
    }

    notify();
    return true;
  }

  // Memperbarui seed dunia
  function setSeed(seed) {
    return setState({
      seed: String(seed).trim()
    });
  }

  // Memperbarui versi Minecraft
  function setGameVersion(version) {
    return setState({
      gameVersion: String(version)
    });
  }

  // Memperbarui dimensi
  function setDimension(dimension) {
    const allowedDimensions =
      window.MSAvk.Config.DIMENSIONS;

    if (!allowedDimensions.includes(dimension)) {
      console.warn("Dimensi tidak valid:", dimension);
      return false;
    }

    return setState({ dimension });
  }

  // Memperbarui koordinat pemain
  function setCoordinates(x, y, z) {
    const coordinates = {
      x: Number(x),
      y: Number(y),
      z: Number(z)
    };

    if (
      !Number.isFinite(coordinates.x) ||
      !Number.isFinite(coordinates.y) ||
      !Number.isFinite(coordinates.z)
    ) {
      console.warn("Koordinat tidak valid!");
      return false;
    }

    return setState({
      coordinates,
      hasCoordinates: true
    });
  }

  // Berlangganan perubahan data
  function subscribe(listener) {
    if (typeof listener !== "function") {
      return function () {};
    }

    listeners.add(listener);

    // Mengembalikan fungsi untuk berhenti berlangganan
    return function unsubscribe() {
      listeners.delete(listener);
    };
  }

  // Mengembalikan data ke kondisi awal
  function resetState() {
    Storage.clear();
    state = Storage.getDefaultData();
    notify();
  }

  // Ekspor API State
  window.MSAvk = window.MSAvk || {};

  window.MSAvk.State = {
    get: getState,
    set: setState,
    setSeed,
    setGameVersion,
    setDimension,
    setCoordinates,
    subscribe,
    reset: resetState
  };

})();
