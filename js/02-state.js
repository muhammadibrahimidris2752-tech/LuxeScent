        // STATE
        // =====================================================================
        let cart = [];              // [{ product, quantity, size }] — product is a live reference into `products`
        let wishlist = [];          // [productId]
        let orders = [];            // [{ id, number, date, items:[{productId,quantity,size}], subtotal, delivery, total, status, customer }]
        let promotions = [];        // loaded from storage, falls back to DEFAULT_PROMOTIONS
        let catalogOverrides = {};  // { [productId]: { featured: bool } } — admin catalog controls
        let historyStack = ['view-home'];
        let activeProduct = null;
        let selectedDetailSize = null;
        let selectedDetailQuantity = 1;
        let searchQuery = '';
        let activeCampaignFilter = null; // a collection key, or null to show the active promotion's full picks
        let filterState = { category: null, priceMin: 0, priceMax: PRICE_MAX_SENTINEL, showInStock: true, showOutOfStock: false, sort: 'featured' };

        // --- Account / Settings state (new) ---
        let profile = { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', phone: '+234 801 234 5678' };
        let addresses = [];         // [{ id, label, fullName, phone, street, city, state, isDefault }]
        let appSettings = { orderUpdates: true, emailNotifications: true, sound: true, haptic: true };
        let editingAddressId = null; // null = "add new" when the address form modal is open

        // --- Admin dashboard state (new) ---
        let deliveryZones = [];     // [{ id, name, fee, active }]
        let adminSettings = { supportEmail: 'support@luxescents.com', supportPhone: '+234 801 234 5678', returnWindowDays: 7 };
        const DEFAULT_DELIVERY_ZONES = [
            { id: 'zone-lagos', name: 'Lagos', fee: 3000, active: true },
            { id: 'zone-abuja', name: 'Abuja', fee: 3000, active: true },
            { id: 'zone-kano', name: 'Kano', fee: 3000, active: true }
        ];

        // =====================================================================
