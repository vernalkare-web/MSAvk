
(function () {
  "use strict";

  // Konversi derajat ke radian
  function toRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  // Validasi satu titik pengamatan
  function validateObservation(observation) {
    if (!observation) return false;

    const { x, z, angle } = observation;

    return (
      Number.isFinite(Number(x)) &&
      Number.isFinite(Number(z)) &&
      Number.isFinite(Number(angle)) &&
      Number(angle) >= 0 &&
      Number(angle) < 360
    );
  }

  // Menghitung perpotongan dua garis arah
  function calculate(first, second) {
    if (
      !validateObservation(first) ||
      !validateObservation(second)
    ) {
      return {
        success: false,
        message: "Data pengamatan tidak valid."
      };
    }

    const x1 = Number(first.x);
    const z1 = Number(first.z);
    const a1 = toRadians(Number(first.angle));

    const x2 = Number(second.x);
    const z2 = Number(second.z);
    const a2 = toRadians(Number(second.angle));

    // Minecraft:
    // 0° = Utara
    // 90° = Timur
    // 180° = Selatan
    // 270° = Barat

    const dx1 = Math.sin(a1);
    const dz1 = -Math.cos(a1);

    const dx2 = Math.sin(a2);
    const dz2 = -Math.cos(a2);

    // Determinan untuk mengetahui apakah garis hampir sejajar
    const determinant = dx1 * dz2 - dz1 * dx2;

    if (Math.abs(determinant) < 0.001) {
      return {
        success: false,
        message: "Kedua arah terlalu sejajar. Ambil pengamatan baru dengan arah yang lebih berbeda."
      };
    }

    // Menghitung jarak parameter pada garis pertama
    const differenceX = x2 - x1;
    const differenceZ = z2 - z1;

    const t = (
      differenceX * dz2 -
      differenceZ * dx2
    ) / determinant;

    const u = (
      differenceX * dz1 -
      differenceZ * dx1
    ) / determinant;

    // Titik perpotongan
    const targetX = x1 + t * dx1;
    const targetZ = z1 + t * dz1;

    // Jarak dari masing-masing titik pengamatan
    const distance1 = Math.hypot(
      targetX - x1,
      targetZ - z1
    );

    const distance2 = Math.hypot(
      targetX - x2,
      targetZ - z2
    );

    // Sudut perpotongan efektif
    const dot = dx1 * dx2 + dz1 * dz2;

    const crossingAngle = Math.acos(
      Math.max(-1, Math.min(1, dot))
    ) * 180 / Math.PI;

    return {
      success: true,

      coordinates: {
        x: targetX,
        z: targetZ
      },

      roundedCoordinates: {
        x: Math.round(targetX),
        z: Math.round(targetZ)
      },

      distance1,
      distance2,
      crossingAngle,

      forward1: t >= 0,
      forward2: u >= 0,

      confidence: getConfidence(crossingAngle),

      message:
        t < 0 || u < 0
          ? "Perpotongan berada di belakang salah satu arah pengamatan. Periksa kembali sudut."
          : "Perhitungan berhasil."
    };
  }

  // Penilaian kualitas sudut perpotongan
  function getConfidence(angle) {
    if (angle < 10) return "poor";
    if (angle < 25) return "low";
    if (angle < 45) return "medium";
    if (angle <= 135) return "good";

    return "low";
  }

  // Menghitung jarak horizontal dua koordinat
  function calculateDistance(first, second) {
    return Math.hypot(
      Number(second.x) - Number(first.x),
      Number(second.z) - Number(first.z)
    );
  }

  // Ekspor modul
  window.MSAvk = window.MSAvk || {};

  window.MSAvk.Triangulation = {
    calculate,
    calculateDistance,
    validateObservation,
    getConfidence
  };

})();
