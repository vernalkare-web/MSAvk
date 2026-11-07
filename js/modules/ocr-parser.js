
(function () {
  "use strict";

  const REQUIRED_FIELDS = [
    "seed",
    "x",
    "y",
    "z",
    "angle"
  ];

  // ==========================================
  // 1. NORMALISASI TEKS OCR
  // ==========================================

  function normalizeText(text) {
    return String(text || "")
      .replace(/[−–—]/g, "-")
      .replace(/\s+/g, " ")
      .trim();
  }

  // ==========================================
  // 2. MENGAMBIL NILAI BERDASARKAN LABEL
  // ==========================================

  function extractValue(text, label) {
    const pattern = new RegExp(
      "(?:^|[/,\\s])" +
      label +
      "\\s*[:=]\\s*(-?\\d+(?:\\.\\d+)?)",
      "i"
    );

    const match = text.match(pattern);

    return match ? match[1] : null;
  }

  // ==========================================
  // 3. PARSING HUD
  // ==========================================

  function parse(text) {
    const normalized = normalizeText(text);

    const seedMatch = normalized.match(
      /(?:^|[/\s])SEED\s*[:=]?\s*(-?\d+)/i
    );

    const seed = seedMatch ? seedMatch[1] : null;

    const x = extractValue(normalized, "X");
    const y = extractValue(normalized, "Y");
    const z = extractValue(normalized, "Z");
    const angle = extractValue(normalized, "ANGLE");

    const raw = { seed, x, y, z, angle };

    const missing = REQUIRED_FIELDS.filter(
      field => raw[field] === null
    );

    if (missing.length > 0) {
      return {
        success: false,
        data: null,
        missing,
        message: "Data HUD belum lengkap."
      };
    }

    const coordinates = {
      x: Number(x),
      y: Number(y),
      z: Number(z)
    };

    const angleValue = Number(angle);

    if (
      !Number.isFinite(coordinates.x) ||
      !Number.isFinite(coordinates.y) ||
      !Number.isFinite(coordinates.z) ||
      !Number.isFinite(angleValue) ||
      angleValue < 0 ||
      angleValue >= 360
    ) {
      return {
        success: false,
        data: null,
        missing: [],
        message: "Koordinat atau angle tidak valid."
      };
    }

    return {
      success: true,
      data: {
        seed: String(seed),
        coordinates,
        angle: angleValue
      },
      missing: [],
      message: "Data HUD berhasil dibaca."
    };
  }

  // ==========================================
  // 4. EXPORT MODULE
  // ==========================================

  window.MSAvk = window.MSAvk || {};

  window.MSAvk.OCRParser = {
    parse
  };

})();
