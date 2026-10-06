        // LOCAL STORAGE
        // Cart/orders persist only product IDs + quantity/size (never a copy
        // of the product itself), then rejoin against the live `products`
        // array when read back. That keeps the catalog the single source of
        // truth for names/prices/images everywhere, including order history.
        // =====================================================================
        const STORAGE_KEYS = {
            cart: 'luxe_cart_v1',
            wishlist: 'luxe_wishlist_v1',
            orders: 'luxe_orders_v1',
            promotions: 'luxe_promotions_v1',
            overrides: 'luxe_catalog_overrides_v1',
            profile: 'luxe_profile_v1',
            addresses: 'luxe_addresses_v1',
            settings: 'luxe_settings_v1',
            deliveryZones: 'luxe_delivery_zones_v1',
            adminSettings: 'luxe_admin_settings_v1',
            products: 'luxe_products_v1',
            categories: 'luxe_categories_v1',
            collections: 'luxe_collections_v1',
            labels: 'luxe_labels_v1'
        };

        function loadJSON(key, fallback) {
            try {
                const raw = localStorage.getItem(key);
                if (!raw) return fallback;
                const parsed = JSON.parse(raw);
                return (parsed === null || parsed === undefined) ? fallback : parsed;
            } catch (e) {
                console.warn('Could not read local storage key', key, e);
                return fallback;
            }
        }

        function saveJSON(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.warn('Could not save local storage key', key, e);
            }
        }

        function persistCart() { saveJSON(STORAGE_KEYS.cart, cart.map(item => ({ productId: item.product.id, quantity: item.quantity, size: item.size }))); }
        function persistWishlist() { saveJSON(STORAGE_KEYS.wishlist, wishlist); }
        function persistOrders() { saveJSON(STORAGE_KEYS.orders, orders); }
        function persistPromotions() { saveJSON(STORAGE_KEYS.promotions, promotions); }
        function persistCatalogOverrides() { saveJSON(STORAGE_KEYS.overrides, catalogOverrides); }
        function persistProfile() { saveJSON(STORAGE_KEYS.profile, profile); }
        function persistAddresses() { saveJSON(STORAGE_KEYS.addresses, addresses); }
        function persistSettings() { saveJSON(STORAGE_KEYS.settings, appSettings); }
        function persistDeliveryZones() { saveJSON(STORAGE_KEYS.deliveryZones, deliveryZones); }
        function persistAdminSettings() { saveJSON(STORAGE_KEYS.adminSettings, adminSettings); }
        function persistProducts() { saveJSON(STORAGE_KEYS.products, products); }
        function persistCategories() { saveJSON(STORAGE_KEYS.categories, CATEGORY_CONFIG); }
        function persistCollections() { saveJSON(STORAGE_KEYS.collections, COLLECTION_CONFIG); }
        function persistLabels() { saveJSON(STORAGE_KEYS.labels, LABEL_CONFIG); }

        function normalizeProductRecord(product) {
            const source = product || {};
            return {
                id: source.id,
                name: source.name || '',
                brand: source.brand || '',
                price: Number(source.price) || 0,
                image: source.image || FALLBACK_IMAGE,
                bgColor: source.bgColor || 'bg-gray-100',
                category: source.category || (Array.isArray(source.categories) && source.categories[0]) || '',
                tags: Array.isArray(source.tags) ? source.tags : [],
                desc: source.desc || '',
                sizes: Array.isArray(source.sizes) && source.sizes.length ? source.sizes : ['100ml'],
                inStock: source.inStock !== false,
                categories: Array.isArray(source.categories) ? source.categories.filter(Boolean) : [],
                collections: Array.isArray(source.collections) ? source.collections.filter(Boolean) : [],
                labels: Array.isArray(source.labels) ? source.labels.filter(Boolean) : []
            };
        }

        function normalizeProducts(list) {
            return (Array.isArray(list) ? list : []).map(normalizeProductRecord).filter(p => p.id && p.name);
        }

        function loadPersistedState() {
            const savedProducts = loadJSON(STORAGE_KEYS.products, null);
            if (Array.isArray(savedProducts) && savedProducts.length > 0) products = normalizeProducts(savedProducts);
            else products = normalizeProducts(products);
            const savedCategories = loadJSON(STORAGE_KEYS.categories, null);
            if (Array.isArray(savedCategories) && savedCategories.length > 0) CATEGORY_CONFIG = savedCategories;
            const savedCollections = loadJSON(STORAGE_KEYS.collections, null);
            if (Array.isArray(savedCollections) && savedCollections.length > 0) COLLECTION_CONFIG = savedCollections;
            const savedLabels = loadJSON(STORAGE_KEYS.labels, null);
            if (Array.isArray(savedLabels)) LABEL_CONFIG = savedLabels;

            const savedCartRefs = loadJSON(STORAGE_KEYS.cart, []);
            cart = savedCartRefs
                .map(ref => {
                    const product = products.find(p => p.id === ref.productId);
                    if (!product) return null; // product no longer in catalog; skip gracefully
                    return { product, quantity: ref.quantity, size: ref.size || product.sizes[0] };
                })
                .filter(Boolean);

            // Default wishlist matches the default starting state for first-time visitors
            wishlist = loadJSON(STORAGE_KEYS.wishlist, ['p1', 'p4']).filter(id => products.some(p => p.id === id));
            orders = loadJSON(STORAGE_KEYS.orders, []);
            promotions = loadJSON(STORAGE_KEYS.promotions, null) || JSON.parse(JSON.stringify(DEFAULT_PROMOTIONS));
            catalogOverrides = loadJSON(STORAGE_KEYS.overrides, {});
            products.forEach(function (product) {
                const legacy = catalogOverrides[product.id];
                if ((!Array.isArray(product.labels) || product.labels.length === 0) && legacy && Array.isArray(legacy.labels)) {
                    product.labels = legacy.labels.filter(function (key) { return LABEL_CONFIG.some(function (label) { return label.key === key; }); });
                }
                if (legacy && Object.prototype.hasOwnProperty.call(legacy, 'labels')) delete legacy.labels;
            });
            products = normalizeProducts(products);

            profile = Object.assign({}, profile, loadJSON(STORAGE_KEYS.profile, {}));
            addresses = loadJSON(STORAGE_KEYS.addresses, []);
            appSettings = Object.assign({}, appSettings, loadJSON(STORAGE_KEYS.settings, {}));
            deliveryZones = loadJSON(STORAGE_KEYS.deliveryZones, null) || JSON.parse(JSON.stringify(DEFAULT_DELIVERY_ZONES));
            adminSettings = Object.assign({}, adminSettings, loadJSON(STORAGE_KEYS.adminSettings, {}));
        }

        // =====================================================================
