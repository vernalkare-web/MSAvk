
(function () {
  "use strict";

  const REQUIRED_FIELDS = [
    "seed",
    "x",
    "y",
    "z",
    "angle"
  ];

  function normalizeText(text) {
    return String(text || "")
      .replace(/[−–—]/g, "-")
      .replace(/,/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function extractValue(text, label) {
    const pattern = new RegExp(
      "(?:^|\\s)" + label +
      "\\s*[:=]\\s*(-?\\d+(?:\\.\\d+)?)",
      "i"
    );

    const match = text.match(pattern);
    return match ? match[1] : null;
  }

  function parse(text) {
    const normalized = normalizeText(text);

    const seed = extractValue(normalized, "SEED");
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
        message: "Ada nilai koordinat atau angle yang tidak valid."
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

  window.MSAvk = window.MSAvk || {};

  window.MSAvk.OCRParser = {
    parse
  };

})();
