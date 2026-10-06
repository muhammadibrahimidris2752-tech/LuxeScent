        // The Collections view renders whichever promotion is enabled (falling
        // back to the Valentine seed) instead of a hardcoded banner, and the
        // four quick-filter chips now actually filter the grid below.
        // =====================================================================
        function getActivePromotion() {
            return promotions.find(p => p.enabled) || promotions[0] || DEFAULT_PROMOTIONS[0];
        }

        function renderCampaignView() {
            const promo = getActivePromotion();
            document.getElementById('campaign-badge').innerText = promo.badge;
            document.getElementById('campaign-title').innerText = promo.title;
            document.getElementById('campaign-subtitle').innerText = promo.subtitle;

            const wrap = document.getElementById('campaign-filter-chips');
            if (wrap) {
                const iconFor = function (key) {
                    if (key === 'Bestseller') return 'fa-award';
                    if (key === 'Gifts') return 'fa-gift';
                    if (key === 'New') return 'fa-sparkles';
                    if (key === 'SpecialOffers') return 'fa-tag';
                    return 'fa-layer-group';
                };
                const items = COLLECTION_CONFIG.filter(function (collection) { return collection.active !== false; })
                    .map(function (collection) { return { key: collection.key, label: collection.label }; })
                    .concat([{ key: 'SpecialOffers', label: 'Special Offers' }]);
                wrap.innerHTML = items.map(function (item) {
                    return `<button onclick=\"selectCampaignChip(this)\" class=\"chip-campaign px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold border border-gray-200 hover:border-luxe-dark hover:text-luxe-dark transition flex items-center gap-2\" data-collection=\"${escapeHtml(item.key)}\"><span class=\"chip-campaign-icon w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center\"><i class=\"fas ${iconFor(item.key)} text-[9px]\"></i></span>${escapeHtml(item.label)}</button>`;
                }).join('');
            }

            activeCampaignFilter = null;
            renderCampaignGrid();
        }

        function renderCampaignGrid() {
            const promo = getActivePromotion();
            let list;
            let heading = 'Romantic Picks';

            if (activeCampaignFilter) {
                list = products.filter(p => productMatchesTarget(p, activeCampaignFilter));
                heading = getTargetLabel(activeCampaignFilter) || heading;
            } else {
                list = products.filter(p => promo.targets.some(t => productMatchesTarget(p, t)));
            }

            document.getElementById('campaign-grid-heading').innerText = heading;
            const empty = document.getElementById('campaign-empty-state');
            if (list.length === 0) {
                document.getElementById('campaign-grid').innerHTML = '';
                empty.classList.remove('hidden'); empty.classList.add('flex');
            } else {
                empty.classList.add('hidden'); empty.classList.remove('flex');
                renderProductGrid('campaign-grid', list);
            }
        }

        function selectCampaignChip(el) {
            const wasActive = el.classList.contains('chip-campaign-active');
            document.querySelectorAll('.chip-campaign').forEach(chip => {
                chip.classList.remove('chip-campaign-active');
                const icon = chip.querySelector('.chip-campaign-icon');
                if (icon) icon.classList.remove('bg-red-200', 'ring-2', 'ring-red-400');
            });
            if (wasActive) {
                activeCampaignFilter = null;
            } else {
                el.classList.add('chip-campaign-active');
                const icon = el.querySelector('.chip-campaign-icon');
                if (icon) icon.classList.add('bg-red-200', 'ring-2', 'ring-red-400');
                activeCampaignFilter = el.dataset.collection;
            }
            renderCampaignGrid();
        }

        // =====================================================================
        // DASHBOARD / ADMIN
