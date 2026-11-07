(function () {
  "use strict";

  const config = window.MSAvk.Config;

  if (!config) {
    console.error("MSAvk Config belum dimuat!");
    return;
  }

  const STORAGE_KEY = config.STORAGE_KEY;

  // Data dunia default
  function getDefaultData() {
    return {
      seed: "",
      gameVersion: config.MINECRAFT_VERSION,
      dimension: config.DEFAULT_DIMENSION,

      coordinates: {
        x: 0,
        y: 64,
        z: 0
      },

      hasCoordinates: false,
      updatedAt: null
    };
  }

  // Mengambil data dari localStorage
  function load() {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);

      if (!savedData) {
        return getDefaultData();
      }

      const parsedData = JSON.parse(savedData);

      return {
        ...getDefaultData(),
        ...parsedData,

        coordinates: {
          ...getDefaultData().coordinates,
          ...(parsedData.coordinates || {})
        }
      };

    } catch (error) {
      console.error("Gagal membaca data MSAvk:", error);
      return getDefaultData();
    }
  }

  // Menyimpan data ke localStorage
  function save(data) {
    try {
      const currentData = load();

      const newData = {
        ...currentData,
        ...data,

        coordinates: {
          ...currentData.coordinates,
          ...(data.coordinates || {})
        },

        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(newData)
      );

      return true;

    } catch (error) {
      console.error("Gagal menyimpan data MSAvk:", error);
      return false;
    }
  }

  // Menghapus data dunia tersimpan
  function clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;

    } catch (error) {
      console.error("Gagal menghapus data MSAvk:", error);
      return false;
    }
  }

  // Mengembalikan data awal
  function reset() {
    return save(getDefaultData());
  }

  // Ekspor fungsi
  window.MSAvk = window.MSAvk || {};

  window.MSAvk.Storage = {
    load,
    save,
    clear,
    reset,
    getDefaultData
  };

})();
