        // Shared logic for matching products against a category/collection
        // key, used by category tiles, search-adjacent filtering, campaign
        // quick-chips, the dashboard catalog browser, and promotion targeting
        // — so "what belongs to Gifts/Men/Valentine" is defined in one place.
        // =====================================================================
        function getEffectiveProduct(productId) {
            const base = products.find(p => p.id === productId);
            if (!base) return null;
            const override = catalogOverrides[productId] || {};
            return Object.assign({}, base, {
                featured: !!override.featured,
                labels: Array.isArray(base.labels) ? base.labels : []
            });
        }

        function getCollectionByKey(key) {
            return COLLECTION_CONFIG.find(c => c.key === key) || null;
        }

        function getLabelByKey(key) {
            return LABEL_CONFIG.find(label => label.key === key) || null;
        }

        function getTargetLabel(key) {
            const category = CATEGORY_CONFIG.find(c => c.key === key);
            if (category) return category.label;
            const collection = getCollectionByKey(key);
            if (collection) return collection.label;
            return TARGET_LABELS[key] || key;
        }

        function isProductNew(product) {
            // This catalog has no real "date added" field, so the last two
            // entries are treated as the newest arrivals — a simple, honest
            // proxy rather than a fabricated timestamp.
            const idx = products.findIndex(p => p.id === product.id);
            return idx >= products.length - 2;
        }

        function getActivePromotionsForProduct(product) {
            return promotions.filter(promo => promo.enabled && promo.targets.some(t => productMatchesTarget(product, t)));
        }

        function productMatchesTarget(product, key) {
            if (!key || key === 'All') return true;
            if (key === 'Best') key = 'Bestseller';
            if (key === 'New') return isProductNew(product);
            if (key === 'SpecialOffers') return getActivePromotionsForProduct(product).length > 0;
            if (getCollectionByKey(key)) {
                const collection = getCollectionByKey(key);
                return collection.active !== false && Array.isArray(product.collections) && product.collections.includes(key);
            }
            return product.categories.includes(key); // Women / Men / Unisex / Oud
        }

        // =====================================================================
        // PRODUCT VISUALS / CARD RENDERING
        // One card template reused everywhere a product appears (home, shop,
        // search, wishlist, campaign) so the same product always shows the
        // same image, name and price.
        // =====================================================================
        function getHomeFeaturedProducts() {
            const featuredIds = Object.keys(catalogOverrides).filter(id => catalogOverrides[id] && catalogOverrides[id].featured);
            if (featuredIds.length > 0) {
                const featured = products.filter(p => featuredIds.includes(p.id));
                if (featured.length > 0) return featured.slice(0, 8);
            }
            return products.slice(0, 4); // default until the dashboard curates featured picks
        }

        function getCartQuantity(productId) {
            const item = cart.find(entry => entry.product.id === productId);
            return item ? item.quantity : 0;
        }

        function renderCardCartControl(product) {
            if (!product.inStock) {
                return `<span class="bg-gray-100 text-gray-400 px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold cursor-not-allowed">Sold Out</span>`;
            }
            const quantity = getCartQuantity(product.id);
            if (quantity === 0) {
                return `<button onclick="addToCartFromCard('${product.id}', event)" class="bg-luxe-dark text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold hover:bg-black transition" aria-label="Add ${escapeHtml(product.name)} to cart">+</button>`;
            }
            return `
                <div class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-2 py-1" onclick="event.stopPropagation()">
                    <button onclick="changeCartQuantity('${product.id}', -1, event)" aria-label="Decrease ${escapeHtml(product.name)} quantity" class="w-6 h-6 flex items-center justify-center text-gray-700 hover:bg-gray-200 rounded-full">−</button>
                    <span class="text-xs md:text-sm font-bold min-w-[1rem] text-center">${quantity}</span>
                    <button onclick="changeCartQuantity('${product.id}', 1, event)" aria-label="Increase ${escapeHtml(product.name)} quantity" class="w-6 h-6 flex items-center justify-center text-gray-700 hover:bg-gray-200 rounded-full">+</button>
                </div>`;
        }

        function createProductCardHTML(product) {
            const isLiked = wishlist.includes(product.id);
            return `
                <div class="flex flex-col relative group">
                    <button onclick="toggleWishlist('${product.id}', event)" aria-label="${isLiked ? 'Remove' : 'Add'} ${escapeHtml(product.name)} ${isLiked ? 'from' : 'to'} wishlist" class="absolute top-3 right-3 z-10 w-9 h-9 md:w-10 md:h-10 bg-white shadow-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                        <i class="${isLiked ? 'fas text-red-500' : 'far text-gray-400'} fa-heart md:text-lg transition-colors wish-icon-${product.id}"></i>
                    </button>
                    <div class="h-48 md:h-72 ${product.bgColor} rounded-2xl md:rounded-3xl mb-4 flex items-center justify-center p-6 cursor-pointer overflow-hidden relative shadow-inner" onclick="openProductDetails('${product.id}')">
                        <img src="${product.image}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'" class="h-full object-contain mix-blend-multiply drop-shadow-xl transform group-hover:scale-110 transition-transform duration-500" alt="${escapeHtml(product.name)}">
                        <div class="absolute inset-0 bg-black bg-opacity-5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div class="px-2 cursor-pointer" onclick="openProductDetails('${product.id}')">
                        ${((product.labels || []).slice(0, 3)).map(label => `<span class="inline-flex mr-1 mb-2 px-2 py-1 rounded-full bg-gray-50 border border-gray-100 text-[9px] md:text-[10px] font-semibold text-gray-500">${escapeHtml((getLabelByKey(label) || {}).label || label)}</span>`).join('')}
                        <p class="text-xs md:text-sm text-luxe-gold font-bold uppercase tracking-wide mb-1 truncate">${escapeHtml(product.brand)}</p>
                        <h3 class="font-serif font-bold text-base md:text-xl leading-tight mb-2 group-hover:text-luxe-gold transition-colors truncate" title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</h3>
                        <div class="flex justify-between items-center gap-2">
                            <div class="font-bold text-base md:text-lg truncate">${formatMoney(product.price)}</div>
                            <div class="shrink-0">${renderCardCartControl(product)}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderProductGrid(containerId, items) {
            const container = document.getElementById(containerId);
            if (!container) return;
            container.innerHTML = items.map(p => createProductCardHTML(p)).join('');

            if (containerId === 'product-listing-grid') {
                document.getElementById('listing-count').innerText = items.length;
            }
        }

        // =====================================================================
        // SEARCH
