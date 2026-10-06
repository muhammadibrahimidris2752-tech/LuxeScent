        // =====================================================================
        // ADMIN DASHBOARD
        // =====================================================================
        let activeDashboardTab = 'overview';
        let activeDashboardCategory = null;

        function initDashboard() {
            switchDashboardTab(activeDashboardTab || 'overview');
        }

        function switchDashboardTab(tab) {
            activeDashboardTab = tab;
            const pageTitle = document.getElementById('admin-page-title');
            const tabTitles = {
                overview: 'Dashboard',
                catalog: 'Products',
                categories: 'Categories',
                labels: 'Labels',
                promotions: 'Promotions',
                zones: 'Delivery Zones',
                orders: 'Orders',
                customers: 'Customers',
                analytics: 'Analytics',
                settings: 'Settings'
            };
            if (pageTitle) pageTitle.innerText = tabTitles[tab] || 'Dashboard';
            document.querySelectorAll('.dash-side-btn').forEach(function (btn) {
                btn.setAttribute('aria-selected', btn.dataset.tab === tab ? 'true' : 'false');
            });
            document.querySelectorAll('.dash-panel').forEach(function (panel) {
                panel.classList.toggle('hidden', panel.id !== 'dash-panel-' + tab);
            });
            toggleDashboardSidebar(false);

            if (tab === 'overview') renderDashboardOverview();
            if (tab === 'catalog') renderDashboardCatalog();
            if (tab === 'categories') renderDashboardCategories();
            if (tab === 'labels') renderDashboardLabels();
            if (tab === 'promotions') renderDashboardPromotions();
            if (tab === 'zones') renderDashboardZones();
            if (tab === 'orders') renderDashboardOrders();
            if (tab === 'customers') renderDashboardCustomers();
            if (tab === 'analytics') renderDashboardAnalytics();
            if (tab === 'settings') renderDashboardSettings();
        }

        function toggleDashboardSidebar(force) {
            const sidebar = document.getElementById('dashboard-sidebar');
            const backdrop = document.getElementById('dashboard-drawer-backdrop');
            if (!sidebar || !backdrop) return;

            const open = typeof force === 'boolean' ? force : !sidebar.classList.contains('open');
            sidebar.classList.toggle('open', open);
            backdrop.classList.toggle('open', open);

            if (window.innerWidth < 768) {
                document.body.style.overflow = open ? 'hidden' : '';
            }
        }

        function adminLogout() {
            toggleDashboardSidebar(false);
            document.body.style.overflow = '';
            showToast('Signed out of the admin area');
        }

        function renderDashboardOverview() {
            const productStat = document.getElementById('dash-stat-products');
            const categoryStat = document.getElementById('dash-stat-categories');
            const promoStat = document.getElementById('dash-stat-promos');
            const orderStat = document.getElementById('dash-stat-orders');
            if (productStat) productStat.innerText = products.length;
            if (categoryStat) categoryStat.innerText = CATEGORY_CONFIG.length;
            if (promoStat) promoStat.innerText = promotions.filter(function (p) { return p.enabled; }).length;
            if (orderStat) orderStat.innerText = orders.length;
        }

        function dashboardFilterChipHTML(key, label, active) {
            return '<button type="button" class="px-4 py-2 rounded-full text-sm font-semibold transition ' +
                (active ? 'bg-luxe-dark text-white' : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-600') +
                '" onclick="selectDashboardCategory(\'' + escapeHtml(key) + '\')">' + escapeHtml(label) + '</button>';
        }

        function renderDashboardCatalog() {
            const chipWrap = document.getElementById('dash-category-chips');
            if (chipWrap) {
                const options = [{ key: 'All', label: 'All Products' }]
                    .concat(CATEGORY_CONFIG.map(function (c) { return { key: c.key, label: c.label }; }))
                    .concat(COLLECTION_CONFIG.map(function (c) { return { key: c.key, label: c.label }; }));
                chipWrap.innerHTML = options.map(function (o) {
                    return dashboardFilterChipHTML(o.key, o.label, activeDashboardCategory === o.key || (!activeDashboardCategory && o.key === 'All'));
                }).join('');
            }

            const searchInput = document.getElementById('dash-product-search');
            const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            let list = products.slice();
            if (activeDashboardCategory && activeDashboardCategory !== 'All') {
                list = list.filter(function (p) { return productMatchesTarget(p, activeDashboardCategory); });
            }
            if (query) {
                list = list.filter(function (p) {
                    return p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query);
                });
            }

            const listContainer = document.getElementById('dash-catalog-list');
            if (!listContainer) return;
            if (!list.length) {
                listContainer.innerHTML = '<div class="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center"><p class="text-sm text-gray-400">' +
                    (query ? 'No products match your search.' : 'No products yet.') + '</p></div>';
                return;
            }

            listContainer.innerHTML =
                '<div class="admin-data-list">' +
                '<div class="admin-data-header admin-product-grid"><span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span>Labels</span><span>Actions</span></div>' +
                list.map(function (p) {
                    const eff = getEffectiveProduct(p.id);
                    const labelNames = (p.labels || []).map(function (key) {
                        const label = getLabelByKey(key);
                        return label ? label.label : key;
                    });
                    const chips = labelNames.length
                        ? labelNames.map(function (name) { return '<span class="inline-flex px-2 py-1 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-semibold text-gray-500">' + escapeHtml(name) + '</span>'; }).join('')
                        : '<span class="text-xs text-gray-400">—</span>';
                    return '<div class="admin-data-row admin-product-grid">' +
                        '<div class="flex items-center gap-3 min-w-0">' +
                            '<div class="w-11 h-11 ' + escapeHtml(p.bgColor || 'bg-gray-100') + ' rounded-xl p-1.5 flex items-center justify-center flex-shrink-0"><img src="' + escapeHtml(p.image) + '" onerror="this.onerror=null;this.src=\'' + FALLBACK_IMAGE + '\'" class="w-full h-full object-contain mix-blend-multiply" alt="' + escapeHtml(p.name) + '"></div>' +
                            '<div class="min-w-0"><p class="font-bold text-sm truncate">' + escapeHtml(p.name) + '</p><p class="text-xs text-gray-400 truncate">' + escapeHtml(p.brand) + '</p></div>' +
                        '</div>' +
                        '<div class="text-sm text-gray-600 truncate">' + escapeHtml((p.categories || [p.category || '—']).join(', ')) + '</div>' +
                        '<div class="text-sm font-semibold">' + formatMoney(p.price) + '</div>' +
                        '<div><span class="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ' + (p.inStock ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500') + '">' + (p.inStock ? 'In Stock' : 'Sold Out') + '</span></div>' +
                        '<div class="flex flex-wrap items-center gap-1.5">' + chips + '</div>' +
                        '<div class="flex items-center gap-2">' +
                            '<label class="inline-flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer"><input type="checkbox" class="accent-luxe-dark w-4 h-4" ' + (eff.featured ? 'checked' : '') + ' onchange="toggleFeatured(\'' + escapeHtml(p.id) + '\', this.checked)">Featured</label>' +
                            '<button type="button" onclick="openProductAdminModal(\'' + escapeHtml(p.id) + '\')" class="px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs font-semibold">Edit</button>' +
                            '<button type="button" onclick="deleteProductAdmin(\'' + escapeHtml(p.id) + '\')" class="px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 text-xs font-semibold">Delete</button>' +
                        '</div>' +
                    '</div>';
                }).join('') +
                '</div>';
        }

        function selectDashboardCategory(key) {
            activeDashboardCategory = key === 'All' ? null : key;
            renderDashboardCatalog();
        }

        function toggleFeatured(productId, isFeatured) {
            if (!catalogOverrides[productId]) catalogOverrides[productId] = {};
            catalogOverrides[productId].featured = !!isFeatured;
            persistCatalogOverrides();
            showToast(isFeatured ? 'Product marked as featured' : 'Product removed from featured');
            renderDashboardCatalog();
        }

        function renderPicker(containerId, options, selected, emptyText) {
            const container = document.getElementById(containerId);
            if (!container) return;
            const selectedSet = new Set(Array.isArray(selected) ? selected : []);
            if (!options.length) {
                container.innerHTML = '<p class="w-full text-xs text-gray-400 py-2">' + escapeHtml(emptyText || 'Nothing available yet.') + '</p>';
                return;
            }
            container.innerHTML = options.map(function (opt) {
                const active = selectedSet.has(opt.key);
                return '<button type="button" class="admin-picker-option" data-picker-value="' + escapeHtml(opt.key) + '" aria-pressed="' + (active ? 'true' : 'false') + '" onclick="toggleAdminPickerOption(this)">' + escapeHtml(opt.label) + '</button>';
            }).join('');
        }

        function toggleAdminPickerOption(button) {
            const active = button.getAttribute('aria-pressed') === 'true';
            button.setAttribute('aria-pressed', active ? 'false' : 'true');
        }

        function getPickerValues(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return [];
            return Array.from(container.querySelectorAll('[data-picker-value][aria-pressed="true"]')).map(function (el) {
                return el.dataset.pickerValue;
            });
        }

        function renderProductPickers(product) {
            renderPicker('product-admin-categories-picker', CATEGORY_CONFIG.filter(function (c) { return c.active !== false; }), product ? product.categories : [], 'Create a category first.');
            renderPicker('product-admin-collections-picker', COLLECTION_CONFIG.filter(function (c) { return c.active !== false; }), product ? product.collections : [], 'Create a collection first.');
            renderPicker('product-admin-labels-picker', LABEL_CONFIG, product ? product.labels : [], 'Create a label first.');
        }

        function openProductAdminModal(productId) {
            const product = productId ? products.find(function (p) { return p.id === productId; }) : null;
            document.getElementById('product-admin-heading').innerText = product ? 'Edit Product' : 'Add Product';
            document.getElementById('product-admin-id').value = product ? product.id : '';
            document.getElementById('product-admin-name').value = product ? product.name : '';
            document.getElementById('product-admin-brand').value = product ? product.brand : '';
            document.getElementById('product-admin-price').value = product ? product.price : '';
            document.getElementById('product-admin-image').value = product ? product.image : '';
            document.getElementById('product-admin-bg').value = product ? product.bgColor : 'bg-gray-100';
            document.getElementById('product-admin-sizes').value = product ? (product.sizes || []).join(', ') : '100ml';
            document.getElementById('product-admin-tags').value = product ? (product.tags || []).join(', ') : '';
            document.getElementById('product-admin-desc').value = product ? product.desc : '';
            document.getElementById('product-admin-stock').checked = product ? !!product.inStock : true;
            renderProductPickers(product);
            openModal('modal-product-admin');
        }

        function saveProductAdminForm() {
            const id = document.getElementById('product-admin-id').value.trim();
            const name = document.getElementById('product-admin-name').value.trim();
            const brand = document.getElementById('product-admin-brand').value.trim();
            const price = Number(document.getElementById('product-admin-price').value);
            const image = document.getElementById('product-admin-image').value.trim() || FALLBACK_IMAGE;
            const bgColor = document.getElementById('product-admin-bg').value.trim() || 'bg-gray-100';
            const sizes = document.getElementById('product-admin-sizes').value.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
            const categories = getPickerValues('product-admin-categories-picker');
            const collections = getPickerValues('product-admin-collections-picker');
            const labels = getPickerValues('product-admin-labels-picker');
            const tags = document.getElementById('product-admin-tags').value.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
            const desc = document.getElementById('product-admin-desc').value.trim();
            const inStock = document.getElementById('product-admin-stock').checked;

            if (!name || !brand || !Number.isFinite(price) || price < 0) {
                showToast('Enter a name, brand, and valid price');
                return;
            }
            if (!categories.length) {
                showToast('Select at least one category');
                return;
            }
            if (!sizes.length) {
                showToast('Add at least one size');
                return;
            }

            const normalized = {
                id: id || 'p-' + Date.now(),
                name: name,
                brand: brand,
                price: price,
                image: image,
                bgColor: bgColor,
                category: categories[0],
                tags: tags,
                desc: desc || 'A carefully selected fragrance from LuxeScents.',
                sizes: sizes,
                inStock: inStock,
                categories: categories,
                collections: collections,
                labels: labels
            };

            const existingIndex = products.findIndex(function (p) { return p.id === normalized.id; });
            if (existingIndex >= 0) products[existingIndex] = normalized;
            else products.push(normalized);

            persistProducts();
            closeModal('modal-product-admin');
            renderDashboardCatalog();
            renderDashboardOverview();
            showToast(existingIndex >= 0 ? 'Product updated' : 'Product added');
        }

        function deleteProductAdmin(productId) {
            const product = products.find(function (p) { return p.id === productId; });
            if (!product) return;
            if (!confirm('Delete "' + product.name + '" from the catalog?')) return;
            products = products.filter(function (p) { return p.id !== productId; });
            delete catalogOverrides[productId];
            persistProducts();
            persistCatalogOverrides();
            cart = cart.filter(function (item) { return item.product && item.product.id !== productId; });
            persistCart();
            renderDashboardCatalog();
            renderDashboardOverview();
            showToast('Product deleted');
        }

        // =====================================================================
        // CATEGORIES
        // =====================================================================
        function renderDashboardCategories() {
            const list = document.getElementById('dash-categories-grid');
            if (!list) return;
            const search = (document.getElementById('dash-category-search') || {}).value || '';
            const query = search.trim().toLowerCase();
            const categories = CATEGORY_CONFIG.filter(function (c) {
                return !query || c.label.toLowerCase().includes(query) || (c.description || '').toLowerCase().includes(query);
            });

            list.innerHTML =
                '<div class="admin-data-list">' +
                '<div class="admin-data-header admin-category-grid"><span>Category</span><span>Description</span><span>Status</span><span>Order</span><span>Actions</span></div>' +
                (categories.length ? categories.map(function (c) {
                    const index = CATEGORY_CONFIG.findIndex(function (x) { return x.key === c.key; });
                    const count = products.filter(function (p) { return (p.categories || []).includes(c.key); }).length;
                    return '<div class="admin-data-row admin-category-grid">' +
                        '<div class="flex items-center gap-3 min-w-0"><div class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">' + escapeHtml(c.label.charAt(0).toUpperCase()) + '</div><div class="min-w-0"><p class="font-bold text-sm truncate">' + escapeHtml(c.label) + '</p><p class="text-xs text-gray-400">' + count + ' product' + (count === 1 ? '' : 's') + '</p></div></div>' +
                        '<div class="text-sm text-gray-500 truncate">' + escapeHtml(c.description || '—') + '</div>' +
                        '<div><button type="button" onclick="toggleCategoryActive(\'' + escapeHtml(c.key) + '\')" class="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ' + (c.active !== false ? 'border-green-400 text-green-600 bg-green-50' : 'border-gray-200 text-gray-400 bg-gray-50') + '">' + (c.active !== false ? 'Active — Hide' : 'Hidden — Show') + '</button></div>' +
                        '<div class="flex items-center gap-1"><button type="button" onclick="moveCategory(\'' + escapeHtml(c.key) + '\',-1)" class="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-50" aria-label="Move category up" ' + (index === 0 ? 'disabled' : '') + '><i class="fas fa-arrow-up text-[10px]"></i></button><button type="button" onclick="moveCategory(\'' + escapeHtml(c.key) + '\',1)" class="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-50" aria-label="Move category down" ' + (index === CATEGORY_CONFIG.length - 1 ? 'disabled' : '') + '><i class="fas fa-arrow-down text-[10px]"></i></button></div>' +
                        '<div class="flex items-center gap-2"><button type="button" onclick="openCategoryModal(\'' + escapeHtml(c.key) + '\')" class="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold hover:bg-gray-50">Edit</button><button type="button" onclick="deleteCategoryAdmin(\'' + escapeHtml(c.key) + '\')" class="px-3 py-2 rounded-lg border border-red-400 text-red-500 text-xs font-semibold hover:bg-red-50">Delete</button></div>' +
                    '</div>';
                }).join('') : '<div class="p-8 text-center text-sm text-gray-400">No categories match your search.</div>') +
                '</div>' +
                '<div class="text-xs text-gray-400 mt-3">Categories define where products can be browsed. Product membership is managed in the product editor.</div>';

            renderDashboardCollections();
        }

        function openCategoryModal(categoryKey) {
            const category = categoryKey ? CATEGORY_CONFIG.find(function (c) { return c.key === categoryKey; }) : null;
            document.getElementById('category-admin-heading').innerText = category ? 'Edit Category' : 'Add Category';
            document.getElementById('category-admin-key').value = category ? category.key : '';
            document.getElementById('category-admin-name').value = category ? category.label : '';
            document.getElementById('category-admin-description').value = category ? (category.description || '') : '';
            document.getElementById('category-admin-active').checked = category ? category.active !== false : true;
            openModal('modal-category-admin');
        }

        function saveCategoryAdminForm() {
            const key = document.getElementById('category-admin-key').value.trim();
            const label = document.getElementById('category-admin-name').value.trim();
            const description = document.getElementById('category-admin-description').value.trim();
            const active = document.getElementById('category-admin-active').checked;
            if (!label) { showToast('Enter a category name'); return; }
            if (key) {
                const category = CATEGORY_CONFIG.find(function (c) { return c.key === key; });
                if (category) Object.assign(category, { label: label, description: description, active: active });
            } else {
                const newKey = makeConfigKey(label);
                if (CATEGORY_CONFIG.some(function (c) { return c.key === newKey; })) { showToast('A category with that name already exists'); return; }
                CATEGORY_CONFIG.push({ key: newKey, label: label, description: description, active: active });
            }
            persistCategories();
            closeModal('modal-category-admin');
            renderDashboardCategories();
            showToast('Category saved');
        }

        function toggleCategoryActive(key) {
            const category = CATEGORY_CONFIG.find(function (c) { return c.key === key; });
            if (!category) return;
            category.active = category.active === false;
            persistCategories();
            renderDashboardCategories();
            showToast(category.active ? 'Category shown' : 'Category hidden');
        }

        function moveCategory(key, direction) {
            const index = CATEGORY_CONFIG.findIndex(function (c) { return c.key === key; });
            const target = index + direction;
            if (index < 0 || target < 0 || target >= CATEGORY_CONFIG.length) return;
            const item = CATEGORY_CONFIG.splice(index, 1)[0];
            CATEGORY_CONFIG.splice(target, 0, item);
            persistCategories();
            renderDashboardCategories();
        }

        function deleteCategoryAdmin(key) {
            if (CATEGORY_CONFIG.length <= 1) { showToast('Keep at least one category'); return; }
            const category = CATEGORY_CONFIG.find(function (c) { return c.key === key; });
            if (!category) return;
            if (!confirm('Delete category "' + category.label + '"? Products using it will lose that category.')) return;
            CATEGORY_CONFIG = CATEGORY_CONFIG.filter(function (c) { return c.key !== key; });
            products.forEach(function (p) {
                p.categories = (p.categories || []).filter(function (c) { return c !== key; });
                if (!p.categories.length && CATEGORY_CONFIG[0]) p.categories = [CATEGORY_CONFIG[0].key];
                p.category = p.categories[0] || '';
            });
            promotions.forEach(function (promo) { promo.targets = promo.targets.filter(function (target) { return target !== key; }); });
            persistCategories();
            persistProducts();
            persistPromotions();
            renderDashboardCategories();
            renderDashboardCatalog();
            showToast('Category deleted');
        }

        // =====================================================================
        // COLLECTIONS
        // =====================================================================
        function renderDashboardCollections() {
            const list = document.getElementById('dash-collections-grid');
            if (!list) return;
            list.innerHTML =
                '<div class="admin-data-list">' +
                '<div class="admin-data-header admin-collection-grid"><span>Collection</span><span>Description</span><span>Status</span><span>Order</span><span>Actions</span></div>' +
                (COLLECTION_CONFIG.length ? COLLECTION_CONFIG.map(function (c, index) {
                    const count = products.filter(function (p) { return (p.collections || []).includes(c.key); }).length;
                    return '<div class="admin-data-row admin-collection-grid">' +
                        '<div class="flex items-center gap-3 min-w-0"><div class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0"><i class="fas fa-layer-group text-[10px]"></i></div><div class="min-w-0"><p class="font-bold text-sm truncate">' + escapeHtml(c.label) + '</p><p class="text-xs text-gray-400">' + count + ' product' + (count === 1 ? '' : 's') + '</p></div></div>' +
                        '<div class="text-sm text-gray-500 truncate">' + escapeHtml(c.description || '—') + '</div>' +
                        '<div><button type="button" onclick="toggleCollectionActive(\'' + escapeHtml(c.key) + '\')" class="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ' + (c.active !== false ? 'border-green-400 text-green-600 bg-green-50' : 'border-gray-200 text-gray-400 bg-gray-50') + '">' + (c.active !== false ? 'Active — Hide' : 'Hidden — Show') + '</button></div>' +
                        '<div class="flex items-center gap-1"><button type="button" onclick="moveCollection(\'' + escapeHtml(c.key) + '\',-1)" class="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-50" ' + (index === 0 ? 'disabled' : '') + '><i class="fas fa-arrow-up text-[10px]"></i></button><button type="button" onclick="moveCollection(\'' + escapeHtml(c.key) + '\',1)" class="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-50" ' + (index === COLLECTION_CONFIG.length - 1 ? 'disabled' : '') + '><i class="fas fa-arrow-down text-[10px]"></i></button></div>' +
                        '<div class="flex items-center gap-2"><button type="button" onclick="openCollectionModal(\'' + escapeHtml(c.key) + '\')" class="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold hover:bg-gray-50">Edit</button><button type="button" onclick="deleteCollectionAdmin(\'' + escapeHtml(c.key) + '\')" class="px-3 py-2 rounded-lg border border-red-400 text-red-500 text-xs font-semibold hover:bg-red-50">Delete</button></div>' +
                    '</div>';
                }).join('') : '<div class="p-8 text-center text-sm text-gray-400">No collections yet.</div>') +
                '</div>';
        }

        function makeConfigKey(label) {
            return label.trim().replace(/&/g, 'and').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-') || ('item-' + Date.now());
        }

        function openCollectionModal(collectionKey) {
            const collection = collectionKey ? COLLECTION_CONFIG.find(function (c) { return c.key === collectionKey; }) : null;
            document.getElementById('collection-admin-heading').innerText = collection ? 'Edit Collection' : 'Add Collection';
            document.getElementById('collection-admin-key').value = collection ? collection.key : '';
            document.getElementById('collection-admin-name').value = collection ? collection.label : '';
            document.getElementById('collection-admin-description').value = collection ? (collection.description || '') : '';
            document.getElementById('collection-admin-active').checked = collection ? collection.active !== false : true;
            openModal('modal-collection-admin');
        }

        function saveCollectionAdminForm() {
            const key = document.getElementById('collection-admin-key').value.trim();
            const label = document.getElementById('collection-admin-name').value.trim();
            const description = document.getElementById('collection-admin-description').value.trim();
            const active = document.getElementById('collection-admin-active').checked;
            if (!label) { showToast('Enter a collection name'); return; }
            if (key) {
                const collection = COLLECTION_CONFIG.find(function (c) { return c.key === key; });
                if (collection) Object.assign(collection, { label: label, description: description, active: active });
            } else {
                const newKey = makeConfigKey(label);
                if (COLLECTION_CONFIG.some(function (c) { return c.key === newKey; })) { showToast('A collection with that name already exists'); return; }
                COLLECTION_CONFIG.push({ key: newKey, label: label, description: description, active: active });
            }
            persistCollections();
            closeModal('modal-collection-admin');
            renderDashboardCollections();
            renderDashboardCatalog();
            showToast('Collection saved');
        }

        function toggleCollectionActive(key) {
            const collection = COLLECTION_CONFIG.find(function (c) { return c.key === key; });
            if (!collection) return;
            collection.active = collection.active === false;
            persistCollections();
            renderDashboardCollections();
            renderDashboardCatalog();
            showToast(collection.active ? 'Collection shown' : 'Collection hidden');
        }

        function moveCollection(key, direction) {
            const index = COLLECTION_CONFIG.findIndex(function (c) { return c.key === key; });
            const target = index + direction;
            if (index < 0 || target < 0 || target >= COLLECTION_CONFIG.length) return;
            const item = COLLECTION_CONFIG.splice(index, 1)[0];
            COLLECTION_CONFIG.splice(target, 0, item);
            persistCollections();
            renderDashboardCollections();
        }

        function deleteCollectionAdmin(key) {
            if (COLLECTION_CONFIG.length <= 1) { showToast('Keep at least one collection'); return; }
            const collection = COLLECTION_CONFIG.find(function (c) { return c.key === key; });
            if (!collection) return;
            if (!confirm('Delete collection "' + collection.label + '"? Product memberships and promotion targets using it will be removed.')) return;
            COLLECTION_CONFIG = COLLECTION_CONFIG.filter(function (c) { return c.key !== key; });
            products.forEach(function (p) { p.collections = (p.collections || []).filter(function (c) { return c !== key; }); });
            promotions.forEach(function (promo) { promo.targets = promo.targets.filter(function (target) { return target !== key; }); });
            persistCollections();
            persistProducts();
            persistPromotions();
            renderDashboardCollections();
            renderDashboardPromotions();
            renderDashboardCatalog();
            showToast('Collection deleted');
        }

        // =====================================================================
        // LABELS — definitions only. Product assignment lives in Products > Edit.
        // =====================================================================
        function renderDashboardLabels() {
            const list = document.getElementById('dash-labels-list');
            if (!list) return;
            list.innerHTML =
                '<div class="admin-data-list">' +
                '<div class="admin-data-header admin-label-grid"><span>Label</span><span>Products</span><span>Actions</span></div>' +
                (LABEL_CONFIG.length ? LABEL_CONFIG.map(function (label) {
                    const count = products.filter(function (p) { return (p.labels || []).includes(label.key); }).length;
                    return '<div class="admin-data-row admin-label-grid">' +
                        '<div class="flex items-center gap-3 min-w-0"><div class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 flex-shrink-0"><i class="fas fa-bookmark text-xs"></i></div><p class="font-bold text-sm truncate">' + escapeHtml(label.label) + '</p></div>' +
                        '<div class="text-sm text-gray-500">' + count + ' product' + (count === 1 ? '' : 's') + '</div>' +
                        '<div class="flex items-center gap-2"><button type="button" onclick="openLabelModal(\'' + escapeHtml(label.key) + '\')" class="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold hover:bg-gray-50">Edit</button><button type="button" onclick="deleteLabelAdmin(\'' + escapeHtml(label.key) + '\')" class="px-3 py-2 rounded-lg border border-red-400 text-red-500 text-xs font-semibold hover:bg-red-50">Delete</button></div>' +
                    '</div>';
                }).join('') : '<div class="p-8 text-center text-sm text-gray-400">No labels yet.</div>') +
                '</div>';
        }

        function openLabelModal(labelKey) {
            const label = labelKey ? LABEL_CONFIG.find(function (x) { return x.key === labelKey; }) : null;
            document.getElementById('label-admin-heading').innerText = label ? 'Edit Label' : 'Add Label';
            document.getElementById('label-admin-key').value = label ? label.key : '';
            document.getElementById('label-admin-name').value = label ? label.label : '';
            openModal('modal-label-admin');
        }

        function saveLabelAdminForm() {
            const key = document.getElementById('label-admin-key').value.trim();
            const label = document.getElementById('label-admin-name').value.trim();
            if (!label) { showToast('Enter a label name'); return; }
            if (key) {
                const target = LABEL_CONFIG.find(function (x) { return x.key === key; });
                if (target) target.label = label;
            } else {
                const newKey = makeConfigKey(label);
                if (LABEL_CONFIG.some(function (x) { return x.key === newKey; })) { showToast('A label with that name already exists'); return; }
                LABEL_CONFIG.push({ key: newKey, label: label });
            }
            persistLabels();
            closeModal('modal-label-admin');
            renderDashboardLabels();
            renderDashboardCatalog();
            showToast('Label saved');
        }

        function deleteLabelAdmin(key) {
            const label = LABEL_CONFIG.find(function (x) { return x.key === key; });
            if (!label) return;
            if (!confirm('Delete label "' + label.label + '"? It will be removed from every product using it.')) return;
            LABEL_CONFIG = LABEL_CONFIG.filter(function (x) { return x.key !== key; });
            products.forEach(function (p) { p.labels = (p.labels || []).filter(function (x) { return x !== key; }); });
            persistLabels();
            persistProducts();
            renderDashboardLabels();
            renderDashboardCatalog();
            showToast('Label deleted');
        }

        // =====================================================================
        // PROMOTIONS
        // =====================================================================
        function renderDashboardPromotions() {
            const list = document.getElementById('dash-promotions-list');
            if (!list) return;
            if (!promotions.length) {
                list.innerHTML = '<p class="text-sm text-gray-400 py-8 text-center">No promotions yet. Create one to get started.</p>';
                return;
            }
            list.innerHTML = promotions.map(function (promo) {
                return '<div class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">' +
                    '<div class="flex justify-between items-start gap-3 mb-3"><div class="min-w-0"><p class="font-bold text-base md:text-lg truncate">' + escapeHtml(promo.title) + '</p><p class="text-xs md:text-sm text-gray-500 truncate">' + escapeHtml(promo.badge || '') + '</p></div><label class="flex items-center gap-2 text-xs md:text-sm flex-shrink-0 cursor-pointer"><input type="checkbox" class="accent-luxe-dark w-4 h-4" ' + (promo.enabled ? 'checked' : '') + ' onchange="togglePromotionEnabled(\'' + escapeHtml(promo.id) + '\', this.checked)"> Enabled</label></div>' +
                    '<div class="flex flex-wrap gap-1.5 mb-4">' + (promo.targets || []).map(function (t) { return '<span class="px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-md text-[10px] md:text-xs font-medium text-gray-600">' + escapeHtml(getTargetLabel(t)) + '</span>'; }).join('') + '</div>' +
                    '<div class="flex gap-2"><button type="button" onclick="openPromotionModal(\'' + escapeHtml(promo.id) + '\')" class="flex-1 bg-gray-50 hover:bg-gray-100 text-luxe-dark py-2.5 rounded-xl text-sm font-semibold transition">Edit</button><button type="button" onclick="deletePromotion(\'' + escapeHtml(promo.id) + '\')" class="flex-1 bg-red-50 hover:bg-red-100 text-red-500 py-2.5 rounded-xl text-sm font-semibold transition">Delete</button></div>' +
                '</div>';
            }).join('');
        }

        function openPromotionModal(promoId) {
            const promo = promoId ? promotions.find(function (p) { return p.id === promoId; }) : null;
            document.getElementById('promo-modal-heading').innerText = promo ? 'Edit Promotion' : 'New Promotion';
            document.getElementById('promo-form-id').value = promo ? promo.id : '';
            document.getElementById('promo-form-title').value = promo ? promo.title : '';
            document.getElementById('promo-form-badge').value = promo ? promo.badge : '';
            document.getElementById('promo-form-subtitle').value = promo ? promo.subtitle : '';
            document.getElementById('promo-form-enabled').checked = promo ? !!promo.enabled : true;
            const targets = promo ? promo.targets || [] : [];
            const allOptions = CATEGORY_CONFIG.filter(function (c) { return c.active !== false; }).concat(COLLECTION_CONFIG.filter(function (c) { return c.active !== false; }));
            document.getElementById('promo-form-targets').innerHTML = allOptions.map(function (opt) {
                const active = targets.includes(opt.key);
                return '<button type="button" class="promo-target-chip px-4 py-2 rounded-full text-sm transition ' + (active ? 'bg-luxe-dark text-white' : 'border border-luxe-border hover:bg-gray-50') + '" data-value="' + escapeHtml(opt.key) + '" aria-pressed="' + (active ? 'true' : 'false') + '" onclick="togglePromoTargetChip(this)">' + escapeHtml(opt.label) + '</button>';
            }).join('');
            openModal('modal-promotion');
        }

        function togglePromoTargetChip(el) {
            const active = el.getAttribute('aria-pressed') === 'true';
            el.setAttribute('aria-pressed', active ? 'false' : 'true');
            el.className = 'promo-target-chip px-4 py-2 rounded-full text-sm transition ' + (active ? 'border border-luxe-border hover:bg-gray-50' : 'bg-luxe-dark text-white');
        }

        function savePromotionForm() {
            const id = document.getElementById('promo-form-id').value.trim();
            const title = document.getElementById('promo-form-title').value.trim();
            const badge = document.getElementById('promo-form-badge').value.trim();
            const subtitle = document.getElementById('promo-form-subtitle').value.trim();
            const enabled = document.getElementById('promo-form-enabled').checked;
            const targets = Array.from(document.querySelectorAll('.promo-target-chip[aria-pressed="true"]')).map(function (el) { return el.dataset.value; });
            if (!title) { showToast('Please give the promotion a title'); return; }
            if (!targets.length) { showToast('Select at least one target category or collection'); return; }

            if (id) {
                const promo = promotions.find(function (p) { return p.id === id; });
                if (promo) Object.assign(promo, { title: title, badge: badge || 'Limited Edition', subtitle: subtitle, enabled: enabled, targets: targets });
            } else {
                promotions.push({ id: 'promo-' + Date.now(), title: title, badge: badge || 'Limited Edition', subtitle: subtitle, targets: targets, enabled: enabled });
            }
            persistPromotions();
            closeModal('modal-promotion');
            renderDashboardPromotions();
            renderDashboardOverview();
            showToast('Promotion saved');
        }

        function togglePromotionEnabled(promoId, enabled) {
            const promo = promotions.find(function (p) { return p.id === promoId; });
            if (!promo) return;
            promo.enabled = !!enabled;
            persistPromotions();
            renderDashboardOverview();
        }

        function deletePromotion(promoId) {
            promotions = promotions.filter(function (p) { return p.id !== promoId; });
            persistPromotions();
            renderDashboardPromotions();
            renderDashboardOverview();
            showToast('Promotion deleted');
        }

        // --- Delivery Zones ---
        function renderDashboardZones() {
            const list = document.getElementById('dash-zones-list');
            if (deliveryZones.length === 0) {
                list.innerHTML = '<p class="text-sm text-gray-400 py-8 text-center">No delivery zones yet.</p>';
                return;
            }
            list.innerHTML = deliveryZones.map(function (zone) {
                return `
                    <div class="flex items-center justify-between gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                        <div class="min-w-0">
                            <p class="font-bold text-sm md:text-base">${escapeHtml(zone.name)}</p>
                            <p class="text-xs md:text-sm text-gray-500">${formatMoney(zone.fee)} delivery fee</p>
                        </div>
                        <div class="flex items-center gap-2 flex-shrink-0">
                            <span class="text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${zone.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}">${zone.active ? 'Active' : 'Inactive'}</span>
                            <button onclick="openZoneForm('${zone.id}')" aria-label="Edit zone" class="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"><i class="fas fa-pen text-xs"></i></button>
                            <button onclick="deleteZone('${zone.id}')" aria-label="Delete zone" class="w-8 h-8 rounded-full bg-gray-50 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-500 transition"><i class="fas fa-trash text-xs"></i></button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function openZoneForm(zoneId) {
            const form = document.getElementById('zone-form');
            form.classList.remove('hidden');
            if (zoneId) {
                const zone = deliveryZones.find(function (z) { return z.id === zoneId; });
                if (!zone) return;
                document.getElementById('zone-form-id').value = zone.id;
                document.getElementById('zone-form-name').value = zone.name;
                document.getElementById('zone-form-fee').value = zone.fee;
                document.getElementById('zone-form-active').checked = zone.active;
            } else {
                document.getElementById('zone-form-id').value = '';
                document.getElementById('zone-form-name').value = '';
                document.getElementById('zone-form-fee').value = '';
                document.getElementById('zone-form-active').checked = true;
            }
            form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        function closeZoneForm() {
            document.getElementById('zone-form').classList.add('hidden');
        }

        function saveZoneForm() {
            const name = document.getElementById('zone-form-name').value.trim();
            const fee = parseFloat(document.getElementById('zone-form-fee').value);
            const active = document.getElementById('zone-form-active').checked;
            if (!name || isNaN(fee) || fee < 0) {
                showToast('Enter a zone name and a valid fee');
                return;
            }
            const id = document.getElementById('zone-form-id').value;
            if (id) {
                const zone = deliveryZones.find(function (z) { return z.id === id; });
                if (zone) Object.assign(zone, { name: name, fee: fee, active: active });
            } else {
                deliveryZones.push({ id: 'zone-' + Date.now(), name: name, fee: fee, active: active });
            }
            persistDeliveryZones();
            closeZoneForm();
            renderDashboardZones();
            showToast('Delivery zone saved');
        }

        function deleteZone(zoneId) {
            deliveryZones = deliveryZones.filter(function (z) { return z.id !== zoneId; });
            persistDeliveryZones();
            renderDashboardZones();
            showToast('Delivery zone removed');
        }

        // --- Orders (connects to the real persisted order system) ---
        const ORDER_STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

        function renderDashboardOrders() {
            const list = document.getElementById('dash-orders-list');
            if (orders.length === 0) {
                list.innerHTML = '<p class="text-sm text-gray-400 py-8 text-center">No orders placed yet. Orders created at checkout will show up here.</p>';
                return;
            }
            list.innerHTML = orders.map(function (order) {
                const count = order.items.reduce(function (sum, it) { return sum + it.quantity; }, 0);
                const c = order.customer || {};
                const customerName = (c.firstName + ' ' + c.lastName).trim() || 'Guest';
                const options = ORDER_STATUSES.map(function (s) {
                    return `<option value="${s}" ${order.status === s ? 'selected' : ''}>${s}</option>`;
                }).join('');
                return `
                    <div class="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 shadow-sm">
                        <div class="flex flex-wrap items-start justify-between gap-3 mb-1">
                            <div class="min-w-0">
                                <p class="font-bold text-sm md:text-base">#${escapeHtml(order.number)}</p>
                                <p class="text-xs md:text-sm text-gray-500">${escapeHtml(customerName)} &middot; ${new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} &middot; ${count} item${count === 1 ? '' : 's'}</p>
                            </div>
                            <p class="font-bold text-sm md:text-base flex-shrink-0">${formatMoney(order.total)}</p>
                        </div>
                        <div class="flex items-center gap-2 mt-3">
                            <label for="order-status-${order.id}" class="text-xs text-gray-500">Status</label>
                            <select id="order-status-${order.id}" onchange="updateOrderStatus('${order.id}', this.value)" class="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs md:text-sm focus:outline-none focus:border-luxe-dark transition">
                                ${options}
                            </select>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function updateOrderStatus(orderId, status) {
            const order = orders.find(function (o) { return o.id === orderId; });
            if (!order) return;
            order.status = status;
            persistOrders();
            showToast('Order #' + order.number + ' marked ' + status);
            sendOrderNotification('LuxeScents Order Update', '#' + order.number + ' is now ' + status + '.');
        }

        // --- Customers (derived from orders; no separate fake database) ---
        function renderDashboardCustomers() {
            const list = document.getElementById('dash-customers-list');
            if (orders.length === 0) {
                list.innerHTML = '<p class="text-sm text-gray-400 py-8 text-center">No customers yet &mdash; they appear here once orders are placed.</p>';
                return;
            }
            const byKey = {};
            orders.forEach(function (order) {
                const c = order.customer || {};
                const key = c.phone || (c.firstName + c.lastName) || order.id;
                if (!byKey[key]) {
                    byKey[key] = {
                        name: (c.firstName + ' ' + c.lastName).trim() || 'Guest',
                        phone: c.phone || '—',
                        city: c.city || '',
                        state: c.state || '',
                        orderCount: 0,
                        totalSpent: 0
                    };
                }
                byKey[key].orderCount += 1;
                byKey[key].totalSpent += order.total;
            });
            const customers = Object.keys(byKey).map(function (k) { return byKey[k]; }).sort(function (a, b) { return b.totalSpent - a.totalSpent; });

            list.innerHTML = customers.map(function (c) {
                return `
                    <div class="flex items-center justify-between gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                        <div class="flex items-center gap-3 min-w-0">
                            <div class="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 flex-shrink-0"><i class="fas fa-user text-sm"></i></div>
                            <div class="min-w-0">
                                <p class="font-bold text-sm md:text-base truncate">${escapeHtml(c.name)}</p>
                                <p class="text-xs md:text-sm text-gray-500 truncate">${escapeHtml(c.phone)}${c.city ? ' &middot; ' + escapeHtml(c.city) + ', ' + escapeHtml(c.state) : ''}</p>
                            </div>
                        </div>
                        <div class="text-right flex-shrink-0">
                            <p class="font-bold text-sm md:text-base">${formatMoney(c.totalSpent)}</p>
                            <p class="text-xs text-gray-400">${c.orderCount} order${c.orderCount === 1 ? '' : 's'}</p>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // --- Analytics (entirely derived from real local orders/products) ---
        function renderDashboardAnalytics() {
            document.getElementById('an-total-orders').innerText = orders.length;
            const revenue = orders.reduce(function (sum, o) { return sum + o.total; }, 0);
            document.getElementById('an-revenue').innerText = formatMoney(revenue);
            const unitsSold = orders.reduce(function (sum, o) {
                return sum + o.items.reduce(function (s, it) { return s + it.quantity; }, 0);
            }, 0);
            document.getElementById('an-products-sold').innerText = unitsSold;

            const uniqueCustomers = {};
            orders.forEach(function (o) {
                const c = o.customer || {};
                uniqueCustomers[c.phone || (c.firstName + c.lastName) || o.id] = true;
            });
            document.getElementById('an-customers').innerText = Object.keys(uniqueCustomers).length;

            const qtyByProduct = {};
            orders.forEach(function (o) {
                o.items.forEach(function (it) {
                    qtyByProduct[it.productId] = (qtyByProduct[it.productId] || 0) + it.quantity;
                });
            });
            const topProducts = Object.keys(qtyByProduct)
                .map(function (id) { return { product: products.find(function (p) { return p.id === id; }), qty: qtyByProduct[id] }; })
                .filter(function (row) { return row.product; })
                .sort(function (a, b) { return b.qty - a.qty; })
                .slice(0, 5);

            const bestEl = document.getElementById('an-bestsellers');
            bestEl.innerHTML = topProducts.length === 0
                ? '<p class="text-sm text-gray-400 py-4">No sales yet.</p>'
                : topProducts.map(function (row) {
                    return `
                        <div class="flex items-center justify-between gap-3">
                            <span class="text-sm truncate">${escapeHtml(row.product.name)}</span>
                            <span class="text-sm font-bold text-gray-500 flex-shrink-0">${row.qty} sold</span>
                        </div>
                    `;
                }).join('');

            const statusCounts = {};
            orders.forEach(function (o) { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
            const statusEl = document.getElementById('an-status-breakdown');
            const statusKeys = Object.keys(statusCounts);
            statusEl.innerHTML = statusKeys.length === 0
                ? '<p class="text-sm text-gray-400 py-4">No orders yet.</p>'
                : statusKeys.map(function (status) {
                    return `
                        <div class="flex items-center justify-between gap-3">
                            <span class="text-sm">${escapeHtml(status)}</span>
                            <span class="text-sm font-bold text-gray-500">${statusCounts[status]}</span>
                        </div>
                    `;
                }).join('');
        }

        // --- Admin Settings (feeds the About Us / Refund & Returns copy) ---
        function renderDashboardSettings() {
            document.getElementById('admin-support-email').value = adminSettings.supportEmail || '';
            document.getElementById('admin-support-phone').value = adminSettings.supportPhone || '';
            document.getElementById('admin-return-window').value = adminSettings.returnWindowDays;
        }

        function saveAdminSettings() {
            adminSettings.supportEmail = document.getElementById('admin-support-email').value.trim();
            adminSettings.supportPhone = document.getElementById('admin-support-phone').value.trim();
            adminSettings.returnWindowDays = parseInt(document.getElementById('admin-return-window').value, 10) || 0;
            persistAdminSettings();
            showToast('Settings saved');
        }

        // =====================================================================
        // BOOT / INIT
