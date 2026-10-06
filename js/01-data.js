        // =====================================================================
        // DATA: PRODUCT CATALOG
        // Single source of truth for every product. Every screen (home, shop,
        // search, cart, checkout, orders, wishlist, dashboard) renders from
        // this array (or from `getEffectiveProduct()`, which merges in the
        // admin catalog overrides) so a product's image/name/price is
        // never duplicated or redefined elsewhere.
        //
        // `category`/`tags` are the original fields (kept for backward
        // compatibility with existing display code, e.g. the cart line's
        // "size • category" text). `categories` (plural) is the new field
        // used for browsing/filtering and can include more than one value
        // (e.g. an Oud fragrance is reasonably browsable under both "Oud" and
        // "Men"). `collections` groups products into merchandising sections
        // (Best Sellers, Gift Sets, Valentine) that promotions can target.
        // =====================================================================
        let products = [
            {
                id: 'p1', name: 'Yara', brand: 'Lattafa', price: 45000,
                image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=600&q=80',
                bgColor: 'bg-pink-100', category: 'Women', tags: ['Women', 'Floral', 'Fresh'],
                desc: 'A captivating fragrance with a blend of sweet, floral and woody notes. Perfect for everyday elegance. Experience the allure of vanilla intertwined with exotic orchids.',
                sizes: ['100ml', '50ml'], inStock: true,
                categories: ['Women'], collections: ['Bestseller', 'Valentine'], labels: []
            },
            {
                id: 'p2', name: 'Miss Dior', brand: 'Dior', price: 120000,
                image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80',
                bgColor: 'bg-gray-100', category: 'Women', tags: ['Women', 'Rose', 'Classic'],
                desc: 'The scent of a million roses. A luxurious and timeless piece that defines sophistication. Awaken your senses with the velvet touch of Grasse rose and sensual musk.',
                sizes: ['100ml'], inStock: true,
                categories: ['Women'], collections: ['Gifts', 'Valentine'], labels: []
            },
            {
                id: 'p3', name: 'Good Girl', brand: 'Carolina Herrera', price: 110000,
                image: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?auto=format&fit=crop&w=600&q=80',
                bgColor: 'bg-blue-50', category: 'Women', tags: ['Women', 'Bold', 'Evening'],
                desc: 'A daring yet sophisticated fragrance inspired by Carolina Herrera\'s unique vision of the duality of the modern woman. Sweet jasmine meets rich cocoa and tonka.',
                sizes: ['80ml', '50ml'], inStock: true,
                categories: ['Women'], collections: ['Bestseller'], labels: []
            },
            {
                id: 'p4', name: 'Libre', brand: 'YSL', price: 130000,
                image: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=600&q=80',
                bgColor: 'bg-amber-50', category: 'Women', tags: ['Women', 'Lavender', 'Warm'],
                desc: 'The fragrance of freedom, a statement fragrance for those who live by their own rules. A reinvention of the floral perfume, it combines lavender essence from France with the sensuality of Moroccan orange blossom.',
                sizes: ['90ml', '50ml'], inStock: true,
                categories: ['Women'], collections: ['Gifts'], labels: []
            },
            {
                id: 'p5', name: 'Baccarat Rouge 540', brand: 'Maison Francis Kurkdjian', price: 250000,
                image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
                bgColor: 'bg-red-50', category: 'Unisex', tags: ['Unisex', 'Amber', 'Woody'],
                desc: 'Luminous and sophisticated, Baccarat Rouge 540 lays on the skin like an amber floral and woody breeze. A poetic alchemy where the aerial notes of jasmine and the radiance of saffron carry mineral facets of ambergris and woody tones of a freshly cut cedar wood.',
                sizes: ['70ml'], inStock: true,
                categories: ['Unisex', 'Women', 'Men'], collections: ['Bestseller', 'Gifts'], labels: []
            },
            {
                id: 'p6', name: 'Oud Wood', brand: 'Tom Ford', price: 180000,
                image: 'https://images.unsplash.com/photo-1622618991746-fe6004db3a47?auto=format&fit=crop&w=600&q=80',
                bgColor: 'bg-stone-100', category: 'Oud', tags: ['Men', 'Woody', 'Spicy'],
                desc: 'Rare. Exotic. Distinctive. One of the most rare, precious, and expensive ingredients in a perfumer\'s arsenal. Exotic rose wood and cardamom give way to a smoky blend of rare oud wood, sandalwood and vetiver.',
                sizes: ['100ml', '50ml'], inStock: false,
                categories: ['Oud', 'Men'], collections: [], labels: []
            }
        ];

        // =====================================================================
        // DATA: CATEGORIES & COLLECTIONS CONFIG
        // Drives the dashboard's category browser and the promotion editor's
        // target picker, so both stay in sync with a single list instead of
        // duplicating category names throughout the HTML.
        // =====================================================================
        let CATEGORY_CONFIG = [
            { key: 'Women', label: 'Women' },
            { key: 'Men', label: 'Men' },
            { key: 'Unisex', label: 'Unisex' },
            { key: 'Oud', label: 'Oud & Arabic' }
        ];
        let COLLECTION_CONFIG = [
            { key: 'Gifts', label: 'Gift Sets' },
            { key: 'Bestseller', label: 'Best Sellers' },
            { key: 'Valentine', label: 'Valentine' },
            { key: 'New', label: 'New Arrivals' }
        ];
        let LABEL_CONFIG = [
            { key: 'BestSeller', label: 'Best Seller' },
            { key: 'Luxury', label: 'Luxury' },
            { key: 'New', label: 'New' }
        ];
        // Sentence-form labels (e.g. for "Women's Fragrances") plus legacy aliases
        // ('Best' is the value already used by the existing "Best Sellers" tile).
        const TARGET_LABELS = {
            Women: "Women's", Men: "Men's", Unisex: 'Unisex', Oud: 'Oud & Arabic',
            Gifts: 'Gift Sets', Bestseller: 'Best Sellers', Best: 'Best Sellers',
            Valentine: 'Valentine', New: 'New Arrivals', SpecialOffers: 'Special Offers'
        };
        const PRICE_MAX_SENTINEL = 999999999;
        const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80';

        // Exact class strings for each filter-chip group's selected/unselected
        // state, matched to what's authored in the HTML so JS never drifts
        // from the visual design when it toggles selection.
        const CHIP_BASE = {
            category: 'chip-filter chip-category px-4 py-2 rounded-full text-sm transition',
            price: 'chip-filter chip-price px-4 py-2 rounded-full text-sm transition'
        };
        const CHIP_VARIANT = {
            category: { selected: 'bg-luxe-dark text-white hover:bg-black', unselected: 'border border-luxe-border hover:bg-gray-50' },
            price: { selected: 'bg-gray-100 border-gray-300 border font-medium', unselected: 'border border-luxe-border hover:bg-gray-50' }
        };

        // =====================================================================
        // DATA: PROMOTIONS (seed data)
        // Seeded to reproduce exactly the Valentine's Collection copy that was
        // previously hardcoded in the Collections view, so default visual
        // output is unchanged. The dashboard can edit, disable, or add more.
        // =====================================================================
        const DEFAULT_PROMOTIONS = [
            {
                id: 'promo-valentine',
                title: "Valentine's Collection",
                subtitle: 'Curated special scents designed to make your most intimate moments unforgettable.',
                badge: 'Limited Edition',
                targets: ['Valentine', 'Gifts', 'Women'],
                enabled: true
            }
        ];

        // =====================================================================
