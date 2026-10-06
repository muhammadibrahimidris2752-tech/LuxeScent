        // =====================================================================
        function navigateTo(viewId, param = null, fromHistory = false) {
            const currentView = historyStack[historyStack.length - 1];
            const targetView = document.getElementById(viewId);
            // Re-entering the listing view with a *new* category/collection param should
            // always re-filter, even if the listing view is already active (e.g. switching
            // categories without leaving the page) — everything else keeps the original
            // same-view no-op guard to avoid redundant renders and history-stack churn.
            const forceRevisit = viewId === 'view-product-listing' && param !== null;
            if (!targetView || (currentView === viewId && !fromHistory && !forceRevisit)) return;

            document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
            targetView.classList.add('active');

            if (!fromHistory && currentView !== viewId) {
                historyStack.push(viewId);
            }

            // Update mobile bottom nav active state
            document.querySelectorAll('.nav-mob-btn').forEach(btn => {
                btn.classList.remove('text-luxe-dark');
                btn.classList.add('text-gray-400');
                if (btn.dataset.target === viewId) {
                    btn.classList.remove('text-gray-400');
                    btn.classList.add('text-luxe-dark');
                }
            });

            // Update desktop top nav active state
            document.querySelectorAll('.nav-desk-btn').forEach(btn => {
                btn.classList.remove('text-luxe-dark');
                btn.classList.add('text-gray-400');
                if (btn.dataset.target === viewId) {
                    btn.classList.remove('text-gray-400');
                    btn.classList.add('text-luxe-dark');
                }
            });

            // Toggle bottom nav visibility for specific screens (mobile only logic)
            const hideNavScreens = ['view-product-details', 'view-checkout', 'view-order-summary', 'view-order-confirmation', 'view-cart'];
            if (hideNavScreens.includes(viewId)) {
                document.getElementById('bottom-nav').classList.add('hidden');
                document.getElementById('bottom-nav').classList.remove('md:hidden');
            } else {
                document.getElementById('bottom-nav').classList.remove('hidden');
                document.getElementById('bottom-nav').classList.add('md:hidden');
            }

            // View specific logic
            if (viewId === 'view-product-listing') {
                if (param) { filterState.category = param; }
                updateListingTitle();
                syncFilterModalUI();
                renderProductListing();
            } else if (viewId === 'view-cart') {
                renderCart();
            } else if (viewId === 'view-wishlist') {
                renderWishlist();
            } else if (viewId === 'view-order-summary') {
                renderSummary();
            } else if (viewId === 'view-campaign') {
                renderCampaignView();
            } else if (viewId === 'view-order-tracking') {
                renderOrderTracking(param);
            } else if (viewId === 'view-categories') {
                resetSearchUI();
            } else if (viewId === 'view-account') {
                renderAccountScreen();
            } else if (viewId === 'view-order-history') {
                renderOrderHistory();
            }

            // Scroll to top of app-container
            window.scrollTo(0, 0);
            document.getElementById('app-container').scrollTop = 0;
            const view = document.getElementById(viewId);
            if (view) view.scrollTop = 0;
        }

        function goBack() {
            if (historyStack.length > 1) {
                historyStack.pop();
                navigateTo(historyStack[historyStack.length - 1], null, true);
            } else {
                historyStack = ['view-home'];
                navigateTo('view-home', null, true);
            }
        }

        function resetToHome() {
            cart = [];
            persistCart();
            updateCartBadges();
            historyStack = ['view-home'];
            navigateTo('view-home', null, true);
        }

        // =====================================================================
