
(function () {
  "use strict";

  const CONFIG = Object.freeze({
    // Informasi aplikasi
    APP_NAME: "MSAvk",
    APP_VERSION: "0.2.0",

    // Target Minecraft
    MINECRAFT_VERSION: "1.26.60",

    // Penyimpanan lokal
    STORAGE_KEY: "msavk_world_data_v1",

    // Pengaturan dunia
    DEFAULT_DIMENSION: "overworld",

    DIMENSIONS: [
      "overworld",
      "nether",
      "end"
    ],

    // Status sementara engine
    ENGINE_STATUS: {
      structureFinder: "unverified",
      featureFinder: "planned",
      strongholdTriangulation: "manual"
    },

    // Pengaturan pencarian
    SEARCH: {
      DEFAULT_RADIUS: 1000,
      MAX_RESULTS: 100
    }
  });

  // Daftarkan konfigurasi ke aplikasi
  window.MSAvk = window.MSAvk || {};
  window.MSAvk.Config = CONFIG;

})();
