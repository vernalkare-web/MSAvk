
(function () {
  "use strict";

  // ==========================================
  // 1. MEMERIKSA MODUL
  // ==========================================

  const MSAvk = window.MSAvk;

  if (!MSAvk) {
    console.error("MSAvk belum diinisialisasi!");
    return;
  }

  const Config = MSAvk.Config;
  const State = MSAvk.State;
  const Event = MSAvk.Event;
  const Storage = MSAvk.Storage;
  const StructureList = MSAvk.StructureList;
  const Triangulation = MSAvk.Triangulation;

  if (
    !Config ||
    !State ||
    !Event ||
    !Storage ||
    !StructureList ||
    !Triangulation
  ) {
    console.error("Salah satu modul MSAvk belum dimuat!");
    return;
  }

  // ==========================================
  // 2. MENGAMBIL ELEMENT HTML
  // ==========================================

  const elements = {
    worldSeed: document.getElementById("worldSeed"),
    gameVersion: document.getElementById("gameVersion"),
    dimension: document.getElementById("dimension"),
    saveWorld: document.getElementById("saveWorld"),

    playerX: document.getElementById("playerX"),
    playerY: document.getElementById("playerY"),
    playerZ: document.getElementById("playerZ"),
    saveCoordinates: document.getElementById("saveCoordinates"),

    structureDimension:
      document.getElementById("structureDimension"),

    structureCount:
      document.getElementById("structureCount"),

    selectedCount:
      document.getElementById("selectedCount"),

    structureList:
      document.getElementById("structureList"),

    findStructures:
      document.getElementById("findStructures"),

    finderResults:
      document.getElementById("finderResults"),

    triangulationResults:
      document.getElementById("triangulationResults"),

    eye1X: document.getElementById("eye1X"),
    eye1Z: document.getElementById("eye1Z"),
    eye1Angle: document.getElementById("eye1Angle"),

    eye2X: document.getElementById("eye2X"),
    eye2Z: document.getElementById("eye2Z"),
    eye2Angle: document.getElementById("eye2Angle"),

    calculateTriangulation:
      document.getElementById("calculateTriangulation")
  };

  // ==========================================
  // 3. UTILITAS
  // ==========================================

  function showMessage(container, message, type = "info") {
    if (!container) return;

    const box = document.createElement("div");

    box.className = `result-message ${type}`;
    box.textContent = message;

    container.replaceChildren(box);
  }

  function createResultItem(label, value) {
    const item = document.createElement("div");
    item.className = "result-item";

    const title = document.createElement("span");
    title.textContent = label;

    const content = document.createElement("strong");
    content.textContent = String(value);

    item.append(title, content);

    return item;
  }

  function formatCoordinate(value) {
    return Number(value).toFixed(2);
  }

  function readNumber(input) {
    if (!input || input.value.trim() === "") {
      return NaN;
    }

    return Number(input.value);
  }

  // ==========================================
  // 4. MEMUAT DATA TERSIMPAN
  // ==========================================

  function loadDashboard() {
    const data = State.get();

    if (elements.worldSeed) {
      elements.worldSeed.value = data.seed || "";
    }

    if (elements.gameVersion) {
      elements.gameVersion.value =
        data.gameVersion || Config.MINECRAFT_VERSION;
    }

    if (elements.dimension) {
      elements.dimension.value =
        data.dimension || Config.DEFAULT_DIMENSION;
    }

    if (elements.playerX) {
      elements.playerX.value = data.coordinates.x;
    }

    if (elements.playerY) {
      elements.playerY.value = data.coordinates.y;
    }

    if (elements.playerZ) {
      elements.playerZ.value = data.coordinates.z;
    }

    if (elements.structureDimension) {
      elements.structureDimension.value =
        data.dimension || Config.DEFAULT_DIMENSION;
    }
  }

  // ==========================================
  // 5. MENYIMPAN DATA DUNIA
  // ==========================================

  function saveWorld() {
    const seed = elements.worldSeed.value.trim();
    const version = elements.gameVersion.value;
    const dimension = elements.dimension.value;

    if (!Config.DIMENSIONS.includes(dimension)) {
      showMessage(
        elements.finderResults,
        "Dimensi tidak valid.",
        "error"
      );
      return;
    }

    const success = State.set({
      seed,
      gameVersion: version,
      dimension
    });

    if (!success) {
      showMessage(
        elements.finderResults,
        "Gagal memperbarui data dunia.",
        "error"
      );
      return;
    }

    if (elements.structureDimension) {
      elements.structureDimension.value = dimension;
    }

    Event.emit("world:updated", State.get());
    Event.emit("seed:changed", { seed });
    Event.emit("dimension:changed", { dimension });

    showMessage(
      elements.finderResults,
      "Data dunia berhasil disimpan.",
      "success"
    );
  }

  // ==========================================
  // 6. MENYIMPAN KOORDINAT PEMAIN
  // ==========================================

  function saveCoordinates() {
    const x = readNumber(elements.playerX);
    const y = readNumber(elements.playerY);
    const z = readNumber(elements.playerZ);

    if (
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      !Number.isFinite(z)
    ) {
      showMessage(
        elements.finderResults,
        "Masukkan koordinat X, Y, dan Z yang valid.",
        "error"
      );
      return;
    }

    const success = State.setCoordinates(x, y, z);

    if (!success) {
      showMessage(
        elements.finderResults,
        "Koordinat gagal disimpan.",
        "error"
      );
      return;
    }

    Event.emit("coordinates:updated", {
      x,
      y,
      z
    });

    showMessage(
      elements.finderResults,
      `Koordinat tersimpan: X ${x}, Y ${y}, Z ${z}.`,
      "success"
    );
  }

  // ==========================================
  // 7. STRUCTURE FINDER
  // ==========================================

  function findStructures() {
    const selected = StructureList.getSelected();

    if (selected.length === 0) {
      showMessage(
        elements.finderResults,
        "Pilih setidaknya satu struktur terlebih dahulu.",
        "warning"
      );
      return;
    }

    const world = State.get();

    if (!world.seed) {
      showMessage(
        elements.finderResults,
        "Masukkan dan simpan seed dunia terlebih dahulu.",
        "warning"
      );
      return;
    }

    Event.emit("search:started", {
      seed: world.seed,
      dimension: elements.structureDimension.value,
      structures: selected
    });

    showMessage(
      elements.finderResults,
      "Struktur sudah dipilih, tetapi engine pencarian seed belum terintegrasi. Belum ada koordinat struktur yang dapat ditampilkan.",
      "warning"
    );
  }

  // ==========================================
  // 8. STRONGHOLD TRIANGULATION
  // ==========================================

  function calculateTriangulation() {
    const first = {
      x: readNumber(elements.eye1X),
      z: readNumber(elements.eye1Z),
      angle: readNumber(elements.eye1Angle)
    };

    const second = {
      x: readNumber(elements.eye2X),
      z: readNumber(elements.eye2Z),
      angle: readNumber(elements.eye2Angle)
    };

    const result = Triangulation.calculate(first, second);

    if (!result.success) {
      showMessage(
        elements.triangulationResults,
        result.message,
        "error"
      );
      return;
    }

    const container = elements.triangulationResults;

    if (!container) return;

    container.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = "Hasil Triangulasi";

    const coordinates = document.createElement("div");
    coordinates.className = "triangulation-coordinate";

    coordinates.append(
      createResultItem(
        "Target X",
        formatCoordinate(result.coordinates.x)
      ),
      createResultItem(
        "Target Z",
        formatCoordinate(result.coordinates.z)
      )
    );

    const details = document.createElement("div");
    details.className = "triangulation-details";

    details.append(
      createResultItem(
        "Jarak pengamatan 1",
        `${formatCoordinate(result.distance1)} blok`
      ),
      createResultItem(
        "Jarak pengamatan 2",
        `${formatCoordinate(result.distance2)} blok`
      ),
      createResultItem(
        "Sudut perpotongan",
        `${formatCoordinate(result.crossingAngle)}°`
      ),
      createResultItem(
        "Kualitas sudut",
        result.confidence
      )
    );

    const warning = document.createElement("p");
    warning.textContent = result.message;

    container.append(
      heading,
      coordinates,
      details,
      warning
    );

    Event.emit("triangulation:completed", result);
  }

  // ==========================================
  // 9. FEATURE FINDER
  // ==========================================

  function initializeFeatureFinder() {
    const featureButtons = document.querySelectorAll(
      "[data-feature]"
    );

    featureButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const feature = button.dataset.feature;

        const featureNames = {
          "lava-pool": "Lava Pool",
          "surface-lava": "Surface Lava",
          "biome": "Biome Finder",
          "cave": "Cave Finder"
        };

        const name = featureNames[feature] || feature;

        showMessage(
          elements.finderResults,
          `${name} belum tersedia. Modul deteksi fitur medan belum diimplementasikan.`,
          "warning"
        );
      });
    });
  }

  // ==========================================
  // 10. EVENT LISTENERS
  // ==========================================

  function initializeEvents() {
    if (elements.saveWorld) {
      elements.saveWorld.addEventListener(
        "click",
        saveWorld
      );
    }

    if (elements.saveCoordinates) {
      elements.saveCoordinates.addEventListener(
        "click",
        saveCoordinates
      );
    }

    if (elements.findStructures) {
      elements.findStructures.addEventListener(
        "click",
        findStructures
      );
    }

    if (elements.calculateTriangulation) {
      elements.calculateTriangulation.addEventListener(
        "click",
        calculateTriangulation
      );
    }

    // Menyamakan pilihan dimensi dunia dan Structure Finder
    if (elements.dimension && elements.structureDimension) {
      elements.dimension.addEventListener("change", function () {
        elements.structureDimension.value =
          elements.dimension.value;
      });

      elements.structureDimension.addEventListener(
        "change",
        function () {
          elements.dimension.value =
            elements.structureDimension.value;
        }
      );
    }

    initializeFeatureFinder();
  }

  // ==========================================
  // 11. MENDENGARKAN PERUBAHAN STATE
  // ==========================================

  State.subscribe(function (data) {
    Event.emit("state:updated", data);
  });

  // ==========================================
  // 12. INISIALISASI APLIKASI
  // ==========================================

  function initialize() {
    loadDashboard();
    initializeEvents();

    console.log(
      `${Config.APP_NAME} v${Config.APP_VERSION} berhasil dimuat.`
    );

    Event.emit("app:ready", State.get());
  }

  initialize();

})();
