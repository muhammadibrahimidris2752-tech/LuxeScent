        // =====================================================================
        function toggleWishlist(productId, event) {
            if (event) event.stopPropagation();
            const index = wishlist.indexOf(productId);
            if (index > -1) {
                wishlist.splice(index, 1);
                showToast('Removed from wishlist');
            } else {
                wishlist.push(productId);
                showToast('Added to wishlist');
            }
            persistWishlist();

            // Update icons globally (this also covers the product-details page's
            // wishlist buttons, since their inner <i> carries the same class)
            document.querySelectorAll(`.wish-icon-${productId}`).forEach(icon => {
                icon.className = `${wishlist.includes(productId) ? 'fas text-red-500' : 'far text-gray-400'} fa-heart md:text-lg transition-colors wish-icon-${productId}`;
            });
            if (activeProduct && activeProduct.id === productId) {
                const liked = wishlist.includes(productId);
                ['pd-wishlist-btn-mobile', 'pd-wishlist-btn-desk'].forEach(id => {
                    const btn = document.getElementById(id);
                    if (btn) btn.setAttribute('aria-label', liked ? 'Remove from wishlist' : 'Add to wishlist');
                });
            }

            if (historyStack[historyStack.length - 1] === 'view-wishlist') {
                renderWishlist();
            }
        }

        function clearWishlist() {
            wishlist = [];
            persistWishlist();
            renderWishlist();
            document.querySelectorAll('.fa-heart').forEach(icon => {
                if (icon.classList.contains('fas') && icon.classList.contains('text-red-500')) {
                    icon.classList.replace('fas', 'far');
                    icon.classList.replace('text-red-500', 'text-gray-400');
                }
            });
        }

        function renderWishlist() {
            const container = document.getElementById('wishlist-grid');
            const emptyState = document.getElementById('wishlist-empty');

            if (wishlist.length === 0) {
                container.innerHTML = '';
                emptyState.classList.remove('hidden');
                emptyState.classList.add('flex');
            } else {
                emptyState.classList.add('hidden');
                emptyState.classList.remove('flex');

                const wItems = products.filter(p => wishlist.includes(p.id));
                container.innerHTML = wItems.map(p => createProductCardHTML(p)).join('');
            }
        }

        // =====================================================================
        // CART
