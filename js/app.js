
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
  const OCRParser = MSAvk.OCRParser;

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
  // 2. ELEMENT HTML
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
      document.getElementById("calculateTriangulation"),

    // OCR SCANNER
    scanHUD: document.getElementById("scanHUD"),
    ocrStatus: document.getElementById("ocrStatus"),
    ocrConfirmation:
      document.getElementById("ocrConfirmation"),

    ocrSeed: document.getElementById("ocrSeed"),
    ocrX: document.getElementById("ocrX"),
    ocrY: document.getElementById("ocrY"),
    ocrZ: document.getElementById("ocrZ"),
    ocrAngle: document.getElementById("ocrAngle"),

    confirmOCR: document.getElementById("confirmOCR"),
    cancelOCR: document.getElementById("cancelOCR")
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

    Event.emit("coordinates:updated", { x, y, z });

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
      "Engine pencarian seed belum terintegrasi. Belum ada koordinat struktur yang dapat ditampilkan.",
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

    container.append(heading, coordinates, details, warning);

    Event.emit("triangulation:completed", result);
  }

  // ==========================================
  // 9. HUD SCANNER
  // ==========================================

  let pendingOCRData = null;

  function setOCRStatus(message, type = "info") {
    if (!elements.ocrStatus) return;

    elements.ocrStatus.textContent = message;
    elements.ocrStatus.className = `scanner-status ${type}`;
  }

  function displayOCRResult(parsed) {
    if (!parsed || !parsed.success || !parsed.data) {
      setOCRStatus(
        parsed?.message || "Data OCR tidak valid.",
        "error"
      );
      return;
    }

    pendingOCRData = parsed.data;

    elements.ocrSeed.value = parsed.data.seed;
    elements.ocrX.value = parsed.data.coordinates.x;
    elements.ocrY.value = parsed.data.coordinates.y;
    elements.ocrZ.value = parsed.data.coordinates.z;
    elements.ocrAngle.value = parsed.data.angle;

    elements.ocrConfirmation.hidden = false;

    setOCRStatus(
      "Data berhasil dibaca. Periksa sebelum konfirmasi.",
      "success"
    );

    Event.emit("ocr:parsed", parsed.data);
  }

  async function scanHUD() {
    if (!OCRParser || typeof OCRParser.parse !== "function") {
      setOCRStatus(
        "OCR Parser belum dimuat. Periksa script ocr-parser.js.",
        "error"
      );
      return;
    }

    pendingOCRData = null;
    elements.ocrConfirmation.hidden = true;

    setOCRStatus("Memeriksa koneksi Android...");

    // Android Bridge belum tersedia:
    // Jangan menganggap screenshot berhasil diambil.
    if (
      !window.MSAvkAndroid ||
      typeof window.MSAvkAndroid.scanHUD !== "function"
    ) {
      setOCRStatus(
        "Android Screen Capture belum terhubung. Tombol Scan belum dapat mengambil layar Minecraft.",
        "warning"
      );
      return;
    }

    try {
      setOCRStatus("Menunggu hasil pemindaian Android...");

      const response = await window.MSAvkAndroid.scanHUD();

      if (!response || typeof response.text !== "string") {
        throw new Error("Android tidak mengembalikan teks OCR.");
      }

      const parsed = OCRParser.parse(response.text);

      displayOCRResult(parsed);

    } catch (error) {
      console.error("HUD Scanner Error:", error);

      setOCRStatus(
        error.message || "Pemindaian gagal.",
        "error"
      );
    }
  }

  function confirmOCR() {
    if (!pendingOCRData) {
      setOCRStatus(
        "Tidak ada hasil OCR untuk dikonfirmasi.",
        "error"
      );
      return;
    }

    const seed = elements.ocrSeed.value.trim();
    const x = Number(elements.ocrX.value);
    const y = Number(elements.ocrY.value);
    const z = Number(elements.ocrZ.value);
    const angle = Number(elements.ocrAngle.value);

    if (
      !seed ||
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      !Number.isFinite(z) ||
      !Number.isFinite(angle) ||
      angle < 0 ||
      angle >= 360
    ) {
      setOCRStatus(
        "Periksa kembali Seed, koordinat, dan Angle.",
        "error"
      );
      return;
    }

    const worldSuccess = State.set({ seed });

    const coordinateSuccess = State.setCoordinates(x, y, z);

    if (!worldSuccess || !coordinateSuccess) {
      setOCRStatus(
        "Gagal menyimpan data hasil OCR.",
        "error"
      );
      return;
    }

    // Sinkronisasi tampilan dashboard
    elements.worldSeed.value = seed;
    elements.playerX.value = x;
    elements.playerY.value = y;
    elements.playerZ.value = z;

    // Simpan angle sebagai data event.
    // Belum ditambahkan ke struktur State.
    Event.emit("angle:updated", { angle });

    Event.emit("ocr:confirmed", {
      seed,
      coordinates: { x, y, z },
      angle
    });

    elements.ocrConfirmation.hidden = true;
    pendingOCRData = null;

    setOCRStatus(
      "Data HUD berhasil dikonfirmasi dan disimpan.",
      "success"
    );
  }

  function cancelOCR() {
    pendingOCRData = null;

    if (elements.ocrConfirmation) {
      elements.ocrConfirmation.hidden = true;
    }

    setOCRStatus("Hasil pemindaian dibatalkan.", "warning");

    Event.emit("ocr:cancelled");
  }

  // ==========================================
  // 10. FEATURE FINDER
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
  // 11. EVENT LISTENERS
  // ==========================================

  function initializeEvents() {
    if (elements.saveWorld) {
      elements.saveWorld.addEventListener("click", saveWorld);
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

    // HUD Scanner
    if (elements.scanHUD) {
      elements.scanHUD.addEventListener("click", scanHUD);
    }

    if (elements.confirmOCR) {
      elements.confirmOCR.addEventListener(
        "click",
        confirmOCR
      );
    }

    if (elements.cancelOCR) {
      elements.cancelOCR.addEventListener(
        "click",
        cancelOCR
      );
    }

    // Sinkronisasi dimensi
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
  // 12. STATE LISTENER
  // ==========================================

  State.subscribe(function (data) {
    Event.emit("state:updated", data);
  });

  // ==========================================
  // 13. INISIALISASI APLIKASI
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
