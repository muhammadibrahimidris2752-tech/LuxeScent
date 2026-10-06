        // =====================================================================
        function openProductDetails(productId) {
            activeProduct = products.find(p => p.id === productId);
            if (!activeProduct) return;
            selectedDetailSize = activeProduct.sizes[0];
            selectedDetailQuantity = 1;
            updateProductDetailQuantityUI();
            triggerHaptic();

            document.getElementById('pd-image-bg').className = `relative h-[55vh] md:h-auto md:flex-1 md:rounded-3xl overflow-hidden shadow-inner ${activeProduct.bgColor} md:min-h-[500px] lg:min-h-[600px]`;
            const pdImage = document.getElementById('pd-image');
            pdImage.src = activeProduct.image;
            pdImage.alt = activeProduct.name;
            document.getElementById('pd-title').innerText = activeProduct.name;
            document.getElementById('pd-brand').innerText = activeProduct.brand;
            document.getElementById('pd-price').innerText = formatMoney(activeProduct.price);

            document.getElementById('pd-desc').innerText = activeProduct.desc;

            // Tags — previously hardcoded to "Women / Floral / Fresh" for every product
            const detailTags = (activeProduct.tags || []).map(tag => `<span class="px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-md text-xs md:text-sm font-medium text-gray-600">${escapeHtml(tag)}</span>`);
            const detailLabels = (activeProduct.labels || []).map(key => {
                const label = typeof getLabelByKey === 'function' ? getLabelByKey(key) : null;
                return `<span class="px-4 py-1.5 bg-luxe-dark text-white rounded-md text-xs md:text-sm font-semibold">${escapeHtml(label ? label.label : key)}</span>`;
            });
            document.getElementById('pd-tags').innerHTML = detailLabels.concat(detailTags).join('');

            // Sizes — previously hardcoded to "100ml / 50ml" buttons that did nothing
            renderDetailSizes();

            // Stock badge — previously always showed "In Stock", even for sold-out items
            renderDetailStockBadge();

            // Wishlist buttons (mobile/desktop)
            const wishBtns = [document.getElementById('pd-wishlist-btn-mobile'), document.getElementById('pd-wishlist-btn-desk')];
            wishBtns.forEach(btn => {
                if (btn) {
                    const liked = wishlist.includes(activeProduct.id);
                    btn.innerHTML = `<i class="${liked ? 'fas text-red-500' : 'far text-gray-400'} fa-heart text-lg md:text-xl wish-icon-${activeProduct.id}"></i>`;
                    btn.setAttribute('aria-label', liked ? 'Remove from wishlist' : 'Add to wishlist');
                    btn.onclick = (e) => { toggleWishlist(activeProduct.id, e); };
                }
            });

            const addBtn = document.getElementById('pd-add-cart-btn');
            const buyBtn = document.getElementById('pd-buy-now-btn');
            addBtn.onclick = () => addSelectedProductToCart(false);
            buyBtn.onclick = () => addSelectedProductToCart(true);
            [addBtn, buyBtn].forEach(btn => {
                btn.disabled = !activeProduct.inStock;
                btn.classList.toggle('opacity-50', !activeProduct.inStock);
                btn.classList.toggle('cursor-not-allowed', !activeProduct.inStock);
            });
            addBtn.innerText = activeProduct.inStock ? 'Add to Cart' : 'Out of Stock';
            buyBtn.innerText = activeProduct.inStock ? 'Buy Now' : 'Out of Stock';

            // Share modal setup
            document.getElementById('share-img').src = activeProduct.image;
            document.getElementById('share-title').innerText = activeProduct.name;
            document.getElementById('share-price').innerText = formatMoney(activeProduct.price);

            navigateTo('view-product-details');
        }

        function updateProductDetailQuantityUI() {
            const value = document.getElementById('pd-qty-value'), minus = document.getElementById('pd-qty-minus'), plus = document.getElementById('pd-qty-plus');
            if (value) value.innerText = selectedDetailQuantity;
            if (minus) { minus.disabled = selectedDetailQuantity <= 1; minus.classList.toggle('opacity-40', selectedDetailQuantity <= 1); }
            if (plus) { plus.disabled = selectedDetailQuantity >= 99; plus.classList.toggle('opacity-40', selectedDetailQuantity >= 99); }
        }
        function changeProductDetailQuantity(delta) {
            selectedDetailQuantity = Math.max(1, Math.min(99, selectedDetailQuantity + delta));
            updateProductDetailQuantityUI();
            if (appSettings.haptic) triggerHaptic();
        }
        function addSelectedProductToCart(buyNow) {
            if (!activeProduct || !activeProduct.inStock) return;
            const chosenSize = selectedDetailSize || activeProduct.sizes[0];
            const existing = cart.find(item => item.product.id === activeProduct.id);
            if (existing) { existing.quantity += selectedDetailQuantity; existing.size = chosenSize; }
            else cart.push({ product: activeProduct, quantity: selectedDetailQuantity, size: chosenSize });
            persistCart(); updateCartBadges(); renderSummary(); refreshCartControls();
            if (buyNow) { navigateTo('view-checkout'); showToast('Ready for checkout'); }
            else {
                document.getElementById('success-img').src = activeProduct.image;
                document.getElementById('success-title').innerText = activeProduct.name;
                document.getElementById('success-desc').innerText = `${formatMoney(activeProduct.price)} - ${chosenSize} · Qty ${selectedDetailQuantity}`;
                openModal('modal-cart-success');
            }
            selectedDetailQuantity = 1; updateProductDetailQuantityUI();
        }

        function renderDetailSizes() {
            const container = document.getElementById('pd-sizes');
            container.innerHTML = activeProduct.sizes.map(size => {
                const active = size === selectedDetailSize;
                const cls = active
                    ? 'flex-1 md:flex-none px-6 py-3 bg-luxe-dark text-white rounded-xl text-sm md:text-base font-semibold border border-luxe-dark transition'
                    : 'flex-1 md:flex-none px-6 py-3 bg-white text-luxe-dark border border-gray-300 hover:border-gray-500 rounded-xl text-sm md:text-base font-semibold transition';
                return `<button type="button" class="${cls}" aria-pressed="${active}" onclick="selectDetailSize('${escapeHtml(size)}')">${escapeHtml(size)}</button>`;
            }).join('');
        }

        function selectDetailSize(size) {
            selectedDetailSize = size;
            renderDetailSizes();
        }

        function renderDetailStockBadge() {
            const badge = document.getElementById('pd-stock-badge');
            if (activeProduct.inStock) {
                badge.className = 'flex items-center gap-2 text-sm md:text-base text-green-600 mb-6 font-medium bg-green-50 w-max px-4 py-2 rounded-lg';
                badge.innerHTML = '<i class="fas fa-circle text-[8px] animate-pulse"></i> In Stock &amp; Ready to Ship';
            } else {
                badge.className = 'flex items-center gap-2 text-sm md:text-base text-red-600 mb-6 font-medium bg-red-50 w-max px-4 py-2 rounded-lg';
                badge.innerHTML = '<i class="fas fa-circle text-[8px]"></i> Currently Out of Stock';
            }
        }

        // =====================================================================
        // WISHLIST
