
/* ==========================================
   MSAvk - Structure Registry
   Core v0.2
   Minecraft Bedrock Structure Database
========================================== */

(function () {
    "use strict";

    const structures = [

        // ==================================
        // OVERWORLD - VILLAGE
        // ==================================

        {
            id: "village",
            name: "Village",
            dimension: "overworld",
            category: "village",
            icon: "🏘️",
            description: "Tempat tinggal penduduk desa.",
            engine: "unverified"
        },

        // ==================================
        // OVERWORLD - TEMPLES
        // ==================================

        {
            id: "desert_pyramid",
            name: "Desert Temple",
            dimension: "overworld",
            category: "temple",
            icon: "🏜️",
            description: "Piramida gurun dengan ruang harta.",
            engine: "unverified"
        },

        {
            id: "jungle_temple",
            name: "Jungle Temple",
            dimension: "overworld",
            category: "temple",
            icon: "🌴",
            description: "Kuil tersembunyi di hutan rimba.",
            engine: "unverified"
        },

        {
            id: "igloo",
            name: "Igloo",
            dimension: "overworld",
            category: "temple",
            icon: "❄️",
            description: "Bangunan kecil di biome bersalju.",
            engine: "unverified"
        },

        // ==================================
        // OVERWORLD - LOOT
        // ==================================

        {
            id: "shipwreck",
            name: "Shipwreck",
            dimension: "overworld",
            category: "loot",
            icon: "🚢",
            description: "Kapal karam yang dapat menyimpan loot.",
            engine: "unverified"
        },

        {
            id: "buried_treasure",
            name: "Buried Treasure",
            dimension: "overworld",
            category: "loot",
            icon: "💎",
            description: "Peti harta yang terkubur.",
            engine: "unverified"
        },

        {
            id: "ocean_ruins",
            name: "Ocean Ruins",
            dimension: "overworld",
            category: "loot",
            icon: "🌊",
            description: "Reruntuhan bawah laut.",
            engine: "unverified"
        },

        {
            id: "ruined_portal",
            name: "Ruined Portal",
            dimension: "overworld",
            category: "loot",
            icon: "🟣",
            description: "Portal Nether yang rusak.",
            engine: "unverified"
        },

        // ==================================
        // OVERWORLD - SPECIAL
        // ==================================

        {
            id: "stronghold",
            name: "Stronghold",
            dimension: "overworld",
            category: "special",
            icon: "🏰",
            description: "Benteng bawah tanah dengan End Portal.",
            engine: "unverified"
        },

        {
            id: "woodland_mansion",
            name: "Woodland Mansion",
            dimension: "overworld",
            category: "special",
            icon: "🏚️",
            description: "Bangunan besar di Dark Forest.",
            engine: "unverified"
        },

        {
            id: "ocean_monument",
            name: "Ocean Monument",
            dimension: "overworld",
            category: "special",
            icon: "🗿",
            description: "Monumen besar di lautan.",
            engine: "unverified"
        },

        {
            id: "pillager_outpost",
            name: "Pillager Outpost",
            dimension: "overworld",
            category: "special",
            icon: "🏹",
            description: "Pos penjagaan Pillager.",
            engine: "unverified"
        },

        {
            id: "witch_hut",
            name: "Witch Hut",
            dimension: "overworld",
            category: "special",
            icon: "🧙",
            description: "Gubuk Witch di Swamp.",
            engine: "unverified"
        },

        {
            id: "ancient_city",
            name: "Ancient City",
            dimension: "overworld",
            category: "special",
            icon: "🏛️",
            description: "Kota kuno di Deep Dark.",
            engine: "unverified"
        },

        {
            id: "trail_ruins",
            name: "Trail Ruins",
            dimension: "overworld",
            category: "special",
            icon: "🧱",
            description: "Reruntuhan arkeologi bawah tanah.",
            engine: "unverified"
        },

        {
            id: "trial_chambers",
            name: "Trial Chambers",
            dimension: "overworld",
            category: "special",
            icon: "⚔️",
            description: "Ruang tantangan bawah tanah.",
            engine: "unverified"
        },

        {
            id: "mineshaft",
            name: "Mineshaft",
            dimension: "overworld",
            category: "special",
            icon: "⛏️",
            description: "Terowongan tambang bawah tanah.",
            engine: "unverified"
        },

        {
            id: "fossil",
            name: "Fossil",
            dimension: "overworld",
            category: "special",
            icon: "🦴",
            description: "Fosil yang terbentuk di bawah tanah.",
            engine: "unverified"
        },

        // ==================================
        // NETHER
        // ==================================

        {
            id: "nether_fortress",
            name: "Nether Fortress",
            dimension: "nether",
            category: "special",
            icon: "🔥",
            description: "Benteng Nether dengan Blaze Spawner.",
            engine: "unverified"
        },

        {
            id: "bastion_remnant",
            name: "Bastion Remnant",
            dimension: "nether",
            category: "loot",
            icon: "🐗",
            description: "Benteng Piglin dengan loot berharga.",
            engine: "unverified"
        },

        {
            id: "nether_ruined_portal",
            name: "Ruined Portal",
            dimension: "nether",
            category: "loot",
            icon: "🟣",
            description: "Portal rusak di Nether.",
            engine: "unverified"
        },

        // ==================================
        // END
        // ==================================

        {
            id: "end_city",
            name: "End City",
            dimension: "end",
            category: "special",
            icon: "🏙️",
            description: "Kota End dengan kemungkinan menemukan Elytra.",
            engine: "unverified"
        },

        {
            id: "end_gateway",
            name: "End Gateway",
            dimension: "end",
            category: "special",
            icon: "🌀",
            description: "Gerbang menuju pulau-pulau luar End.",
            engine: "unverified"
        }

    ];

    // ==================================
    // REGISTRY API
    // ==================================

    const registry = {

        getAll() {
            return [...structures];
        },

        getById(id) {
            return structures.find(item => item.id === id) || null;
        },

        getByDimension(dimension) {
            return structures.filter(
                item => item.dimension === dimension
            );
        },

        getByCategory(category) {
            if (category === "all") {
                return this.getAll();
            }

            return structures.filter(
                item => item.category === category
            );
        },

        search(keyword) {
            const query = keyword.toLowerCase().trim();

            return structures.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.id.toLowerCase().includes(query)
            );
        },

        getCount() {
            return structures.length;
        }

    };

    // ==================================
    // GLOBAL EXPORT
    // ==================================

    window.MSAvk = window.MSAvk || {};
    window.MSAvk.StructureRegistry = registry;

})();
