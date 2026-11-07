
/* ==========================================
   MSAvk - Structure List UI
   Core v0.2
========================================== */

(function () {
    "use strict";

    const registry = window.MSAvk?.StructureRegistry;

    if (!registry) {
        console.error("MSAvk Structure Registry tidak ditemukan.");
        return;
    }

    const elements = {
        list: document.getElementById("structureList"),
        search: document.getElementById("structureSearch"),
        dimension: document.getElementById("structureDimension"),
        filters: document.getElementById("categoryFilters"),
        count: document.getElementById("structureCount"),
        selected: document.getElementById("selectedCount"),
        selectAll: document.getElementById("selectAll"),
        clear: document.getElementById("clearSelection")
    };

    const state = {
        category: "all",
        selected: new Set()
    };

    const statusLabels = {
        unverified: "Engine belum diverifikasi",
        planned: "Direncanakan",
        supported: "Engine tersedia",
        special: "Deteksi khusus"
    };

    function getFilteredStructures() {
        let data = registry.getAll();

        const keyword = elements.search.value
            .toLowerCase()
            .trim();

        const dimension = elements.dimension.value;

        if (dimension !== "all") {
            data = data.filter(item =>
                item.dimension === dimension
            );
        }

        if (state.category !== "all") {
            data = data.filter(item =>
                item.category === state.category
            );
        }

        if (keyword) {
            data = data.filter(item =>
                item.name.toLowerCase().includes(keyword) ||
                item.description.toLowerCase().includes(keyword) ||
                item.id.toLowerCase().includes(keyword)
            );
        }

        return data;
    }

    function renderStructures() {
        const data = getFilteredStructures();

        elements.list.innerHTML = "";

        elements.count.textContent =
            `${data.length} structures`;

        if (data.length === 0) {
            elements.list.innerHTML = `
                <p class="helper-text">
                    Tidak ada struktur yang ditemukan.
                </p>
            `;

            updateSelectedCount();
            return;
        }

        data.forEach(structure => {
            const card = document.createElement("label");

            card.className = "structure-card";

            if (state.selected.has(structure.id)) {
                card.classList.add("selected");
            }

            const checkbox = document.createElement("input");

            checkbox.type = "checkbox";
            checkbox.checked =
                state.selected.has(structure.id);

            checkbox.dataset.id = structure.id;

            const info = document.createElement("div");
            info.className = "structure-info";

            const name = document.createElement("strong");
            name.textContent =
                `${structure.icon} ${structure.name}`;

            const dimension = document.createElement("small");
            dimension.textContent =
                structure.dimension.toUpperCase();

            const status = document.createElement("span");
            status.className = "structure-status";
            status.textContent =
                statusLabels[structure.engine] ||
                "Status belum diketahui";

            info.append(name, dimension, status);
            card.append(checkbox, info);

            checkbox.addEventListener("change", () => {
                if (checkbox.checked) {
                    state.selected.add(structure.id);
                } else {
                    state.selected.delete(structure.id);
                }

                card.classList.toggle(
                    "selected",
                    checkbox.checked
                );

                updateSelectedCount();
            });

            elements.list.appendChild(card);
        });

        updateSelectedCount();
    }

    function updateSelectedCount() {
        elements.selected.textContent =
            `${state.selected.size} selected`;
    }

    function setCategory(category) {
        state.category = category;

        elements.filters
            .querySelectorAll(".filter-button")
            .forEach(button => {
                button.classList.toggle(
                    "active",
                    button.dataset.category === category
                );
            });

        renderStructures();
    }

    function selectAllVisible() {
        getFilteredStructures().forEach(item => {
            state.selected.add(item.id);
        });

        renderStructures();
    }

    function clearSelection() {
        state.selected.clear();
        renderStructures();
    }

    function getSelectedStructures() {
        return registry.getAll().filter(item =>
            state.selected.has(item.id)
        );
    }

    // SEARCH

    elements.search.addEventListener(
        "input",
        renderStructures
    );

    // DIMENSION FILTER

    elements.dimension.addEventListener(
        "change",
        renderStructures
    );

    // CATEGORY FILTER

    elements.filters.addEventListener("click", event => {
        const button = event.target.closest(
            ".filter-button"
        );

        if (!button) return;

        setCategory(button.dataset.category);
    });

    // SELECT ALL

    elements.selectAll.addEventListener(
        "click",
        selectAllVisible
    );

    // CLEAR SELECTION

    elements.clear.addEventListener(
        "click",
        clearSelection
    );

    // PUBLIC API

    window.MSAvk = window.MSAvk || {};

    window.MSAvk.StructureList = {
        render: renderStructures,
        getSelected: getSelectedStructures,
        clear: clearSelection,
        selectAll: selectAllVisible
    };

    // INITIAL RENDER

    renderStructures();

})();
