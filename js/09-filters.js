        // Backs the category tiles, the Filter & Sort modal, and the listing
        // page's empty state. `filterState.category` doubles as "which
        // category or collection is currently in view" for both tile
        // navigation and the modal's category chips.
        // =====================================================================
        function sortProducts(list, sortKey) {
            const arr = list.slice();
            switch (sortKey) {
                case 'price-asc': arr.sort((a, b) => a.price - b.price); break;
                case 'price-desc': arr.sort((a, b) => b.price - a.price); break;
                case 'newest': arr.reverse(); break; // catalog order proxy for recency — see isProductNew()
                case 'featured':
                default:
                    arr.sort((a, b) => {
                        const af = getEffectiveProduct(a.id)?.featured ? 1 : 0;
                        const bf = getEffectiveProduct(b.id)?.featured ? 1 : 0;
                        return bf - af;
                    });
                    break;
            }
            return arr;
        }

        function getFilteredListingProducts() {
            let list = products.slice();
            if (filterState.category) {
                list = list.filter(p => productMatchesTarget(p, filterState.category));
            }
            list = list.filter(p => p.price >= filterState.priceMin && p.price <= filterState.priceMax);
            if (filterState.showInStock && !filterState.showOutOfStock) {
                list = list.filter(p => p.inStock);
            } else if (filterState.showOutOfStock && !filterState.showInStock) {
                list = list.filter(p => !p.inStock);
            }
            // both checked, or both unchecked -> no stock-based filtering
            return sortProducts(list, filterState.sort);
        }

        function updateListingTitle() {
            const key = filterState.category;
            const titleEl = document.getElementById('listing-title');
            if (!key) { titleEl.innerText = 'All Fragrances'; return; }
            const isCategory = CATEGORY_CONFIG.some(c => c.key === key);
            if (isCategory) {
                const possessive = (key === 'Women' || key === 'Men') ? `${key}'s` : (TARGET_LABELS[key] || key);
                titleEl.innerText = `${possessive} Fragrances`;
            } else {
                titleEl.innerText = TARGET_LABELS[key] || key;
            }
        }

        function renderProductListing() {
            const list = getFilteredListingProducts();
            const emptyState = document.getElementById('listing-empty-state');
            if (list.length === 0) {
                document.getElementById('product-listing-grid').innerHTML = '';
                document.getElementById('listing-count').innerText = 0;
                emptyState.classList.remove('hidden'); emptyState.classList.add('flex');
            } else {
                emptyState.classList.add('hidden'); emptyState.classList.remove('flex');
                renderProductGrid('product-listing-grid', list);
            }
        }

        function openFilterModal() {
            syncFilterModalUI();
            openModal('modal-filter');
        }

        function selectFilterChip(el, group) {
            const selector = group === 'category' ? '.chip-category' : '.chip-price';
            document.querySelectorAll(selector).forEach(btn => {
                const isTarget = btn === el;
                btn.setAttribute('aria-pressed', isTarget ? 'true' : 'false');
                btn.className = `${CHIP_BASE[group]} ${isTarget ? CHIP_VARIANT[group].selected : CHIP_VARIANT[group].unselected}`;
            });
        }

        function updateAvailabilityFilter() {
            // Intentionally a no-op: checkbox state is read directly from the DOM
            // by readFilterModalIntoState() when "Apply Filters" is clicked, so
            // there is nothing to compute on every individual toggle.
        }

        function readFilterModalIntoState() {
            const catChip = document.querySelector('.chip-category[aria-pressed="true"]');
            filterState.category = (catChip && catChip.dataset.value !== 'All') ? catChip.dataset.value : null;

            const priceChip = document.querySelector('.chip-price[aria-pressed="true"]');
            filterState.priceMin = priceChip ? Number(priceChip.dataset.min) : 0;
            filterState.priceMax = priceChip ? Number(priceChip.dataset.max) : PRICE_MAX_SENTINEL;

            filterState.showInStock = document.getElementById('filter-chk-instock').checked;
            filterState.showOutOfStock = document.getElementById('filter-chk-outofstock').checked;

            const sortRadio = document.querySelector('input[name="sort"]:checked');
            filterState.sort = sortRadio ? sortRadio.value : 'featured';

            updateListingTitle();
        }

        function applyProductFilters() {
            readFilterModalIntoState();
            renderProductListing();
            closeModal('modal-filter');
        }

        function resetProductFilters() {
            filterState = { category: null, priceMin: 0, priceMax: PRICE_MAX_SENTINEL, showInStock: true, showOutOfStock: false, sort: 'featured' };
            syncFilterModalUI();
            updateListingTitle();
            renderProductListing();
        }

        function syncDynamicCategoryFilterOptions() {
            const wrap = document.querySelector('#modal-filter .chip-category')?.parentElement;
            if (!wrap) return;
            wrap.innerHTML = `<button type="button" class="chip-filter chip-category px-4 py-2 bg-luxe-dark text-white rounded-full text-sm hover:bg-black transition" data-value="All" onclick="selectFilterChip(this, 'category')" aria-pressed="true">All</button>` +
                CATEGORY_CONFIG.filter(c => c.active !== false).map(c => `<button type="button" class="chip-filter chip-category px-4 py-2 border border-luxe-border rounded-full text-sm hover:bg-gray-50 transition" data-value="${escapeHtml(c.key)}" onclick="selectFilterChip(this, 'category')" aria-pressed="false">${escapeHtml(c.label)}</button>`).join('');
        }

        function syncFilterModalUI() {
            document.querySelectorAll('.chip-category').forEach(btn => {
                const matches = (filterState.category === null && btn.dataset.value === 'All') || btn.dataset.value === filterState.category;
                btn.setAttribute('aria-pressed', matches ? 'true' : 'false');
                btn.className = `${CHIP_BASE.category} ${matches ? CHIP_VARIANT.category.selected : CHIP_VARIANT.category.unselected}`;
            });
            document.querySelectorAll('.chip-price').forEach(btn => {
                const matches = Number(btn.dataset.min) === filterState.priceMin && Number(btn.dataset.max) === filterState.priceMax;
                btn.setAttribute('aria-pressed', matches ? 'true' : 'false');
                btn.className = `${CHIP_BASE.price} ${matches ? CHIP_VARIANT.price.selected : CHIP_VARIANT.price.unselected}`;
            });
            const inStockBox = document.getElementById('filter-chk-instock');
            const outStockBox = document.getElementById('filter-chk-outofstock');
            if (inStockBox) inStockBox.checked = filterState.showInStock;
            if (outStockBox) outStockBox.checked = filterState.showOutOfStock;
            document.querySelectorAll('input[name="sort"]').forEach(radio => {
                radio.checked = (radio.value === filterState.sort);
            });
        }

        // =====================================================================
        // PRODUCT DETAILS
