        // =====================================================================
        function addToCartFromCard(productId, event) {
            if (event) event.stopPropagation();
            const product = products.find(entry => entry.id === productId);
            if (!product) return;
            if (!product.inStock) { showToast('This product is currently out of stock'); return; }
            const existing = cart.find(item => item.product.id === productId);
            if (existing) existing.quantity += 1;
            else cart.push({ product, quantity: 1, size: product.sizes[0] });
            persistCart();
            updateCartBadges();
            refreshCartControls();
            showToast(`${product.name} added to cart`);
        }

        function changeCartQuantity(productId, delta, event) {
            if (event) event.stopPropagation();
            const index = cart.findIndex(item => item.product.id === productId);
            if (index === -1) return;
            updateQuantity(index, delta);
        }

        function refreshCartControls() {
            renderProductGrid('home-featured-grid', getHomeFeaturedProducts());
            renderCampaignGrid();
            renderProductListing();
            if (searchQuery.trim()) { handleSearchInput(searchQuery); }
            renderWishlist();
            if (activeProduct) updateProductDetailQuantityUI();
        }

        function addToCart(productId, size) {
            const product = products.find(p => p.id === productId);
            if (!product) return;
            if (!product.inStock) { showToast('This product is currently out of stock'); return; }

            const chosenSize = size || product.sizes[0];
            const existing = cart.find(item => item.product.id === productId);
            if (existing) {
                existing.quantity += 1;
                existing.size = chosenSize; // reflect the size most recently chosen on the product page
            } else {
                cart.push({ product: product, quantity: 1, size: chosenSize });
            }

            persistCart();
            updateCartBadges();
            renderSummary();
            refreshCartControls();

            // Setup success modal
            document.getElementById('success-img').src = product.image;
            document.getElementById('success-title').innerText = product.name;
            document.getElementById('success-desc').innerText = `${formatMoney(product.price)} - ${chosenSize}`;

            openModal('modal-cart-success');
        }

        function updateQuantity(index, delta) {
            if (!cart[index]) return;
            cart[index].quantity += delta;
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
            persistCart();
            updateCartBadges();
            renderCart();
            renderSummary();
            refreshCartControls();
        }

        function clearCart() {
            cart = [];
            persistCart();
            updateCartBadges();
            renderCart();
            renderSummary();
            refreshCartControls();
        }

        function updateCartBadges() {
            const count = cart.reduce((sum, item) => sum + item.quantity, 0);
            document.querySelectorAll('.cart-badge').forEach(badge => {
                badge.innerText = count;
                if (count > 0) badge.classList.remove('hidden');
                else badge.classList.add('hidden');
            });
            document.getElementById('cart-header-count').innerText = count;
        }

        function calculateSubtotal() {
            return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        }

        function renderCart() {
            const container = document.getElementById('cart-items-container');
            const emptyState = document.getElementById('cart-empty-state');
            const footer = document.getElementById('cart-footer');

            if (cart.length === 0) {
                container.innerHTML = '';
                emptyState.classList.remove('hidden');
                emptyState.classList.add('flex');
                footer.classList.add('hidden');
            } else {
                emptyState.classList.add('hidden');
                emptyState.classList.remove('flex');
                footer.classList.remove('hidden');

                container.innerHTML = cart.map((item, index) => `
                    <div class="flex gap-4 md:gap-8 p-4 md:p-6 mb-4 md:mb-6 bg-white border border-gray-100 rounded-2xl md:rounded-3xl shadow-sm relative group hover:shadow-md transition">
                        <button onclick="updateQuantity(${index}, -99)" class="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition" aria-label="Remove ${escapeHtml(item.product.name)} from cart"><i class="fas fa-trash-alt text-sm md:text-base"></i></button>
                        <div class="w-24 h-28 md:w-36 md:h-40 ${item.product.bgColor} rounded-xl md:rounded-2xl p-2 md:p-4 flex-shrink-0 flex items-center justify-center shadow-inner cursor-pointer" onclick="openProductDetails('${item.product.id}')">
                            <img src="${item.product.image}" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'" class="w-full h-full object-contain mix-blend-multiply drop-shadow-md group-hover:scale-110 transition-transform">
                        </div>
                        <div class="flex flex-col flex-1 py-1 md:py-3 justify-between">
                            <div class="pr-8 md:pr-12 cursor-pointer" onclick="openProductDetails('${item.product.id}')">
                                <h3 class="font-serif font-bold text-base md:text-xl lg:text-2xl mb-1">${item.product.name}</h3>
                                <p class="text-xs md:text-sm text-luxe-gold font-bold uppercase tracking-wider mb-2">${item.product.brand}</p>
                                <p class="text-xs md:text-sm text-gray-500 hidden md:block line-clamp-2">${item.product.desc}</p>
                                <p class="text-xs md:text-sm text-gray-500 mt-2 bg-gray-50 inline-block px-2 py-1 rounded">${item.size} • ${item.product.category}</p>
                            </div>
                            <div class="flex justify-between items-end mt-4">
                                <div class="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 md:px-4 md:py-2">
                                    <button onclick="updateQuantity(${index}, -1)" aria-label="Decrease quantity" class="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-full transition"><i class="fas fa-minus text-xs"></i></button>
                                    <span class="text-sm md:text-base font-bold w-4 md:w-6 text-center">${item.quantity}</span>
                                    <button onclick="updateQuantity(${index}, 1)" aria-label="Increase quantity" class="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-full transition"><i class="fas fa-plus text-xs"></i></button>
                                </div>
                                <span class="font-bold text-base md:text-xl lg:text-2xl">${formatMoney(item.product.price * item.quantity)}</span>
                            </div>
                        </div>
                    </div>
                `).join('');

                document.getElementById('cart-subtotal').innerText = formatMoney(calculateSubtotal());
            }
        }

        // =====================================================================
        // CHECKOUT
