        // =====================================================================
        function renderSummary() {
            const container = document.getElementById('summary-items');
            container.innerHTML = cart.map(item => `
                <div class="flex justify-between items-center text-sm md:text-base p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 md:w-20 md:h-20 ${item.product.bgColor} rounded-xl flex items-center justify-center p-2 shadow-inner">
                            <img src="${item.product.image}" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'" class="h-full object-contain mix-blend-multiply">
                        </div>
                        <div>
                            <span class="font-bold block text-sm md:text-base text-luxe-dark">${item.product.name}</span>
                            <span class="text-gray-500 text-xs md:text-sm block mb-1">${item.size} • ${item.product.brand}</span>
                            <div class="inline-flex items-center gap-2 mt-1 bg-gray-50 border border-gray-200 rounded-full px-2 py-1">
                                <button onclick="changeCartQuantity('${item.product.id}', -1, event)" aria-label="Decrease ${item.product.name} quantity" class="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded-full">−</button>
                                <span class="text-gray-600 text-xs md:text-sm font-semibold min-w-[1rem] text-center">${item.quantity}</span>
                                <button onclick="changeCartQuantity('${item.product.id}', 1, event)" aria-label="Increase ${item.product.name} quantity" class="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded-full">+</button>
                            </div>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="font-bold block text-sm md:text-lg">${formatMoney(item.product.price * item.quantity)}</span>
                    </div>
                </div>
            `).join('');

            const sub = calculateSubtotal();
            const delivery = cart.length > 0 ? 3000 : 0;
            const total = sub + delivery;
            document.getElementById('summary-subtotal').innerText = formatMoney(sub);
            document.getElementById('summary-total').innerText = formatMoney(total);
        }

        function placeOrder() {
            if (cart.length === 0) {
                showToast('Your cart is empty');
                return;
            }

            const sub = calculateSubtotal();
            const delivery = 3000;
            const total = sub + delivery;

            const order = {
                id: 'order-' + Date.now(),
                number: generateOrderNumber(),
                date: new Date().toISOString(),
                items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity, size: item.size })),
                subtotal: sub,
                delivery: delivery,
                total: total,
                status: 'Processing',
                customer: {
                    firstName: document.getElementById('co-first-name').value.trim(),
                    lastName: document.getElementById('co-last-name').value.trim(),
                    phone: document.getElementById('co-phone').value.trim(),
                    street: document.getElementById('co-street').value.trim(),
                    state: document.getElementById('co-state').value,
                    city: document.getElementById('co-city').value.trim(),
                    note: document.getElementById('co-note').value.trim()
                }
            };

            showToast('Processing order securely...');
            setTimeout(() => {
                orders.unshift(order); // newest first
                persistOrders();

                document.getElementById('conf-total').innerText = formatMoney(order.total);
                document.getElementById('conf-order-number').innerText = '#' + order.number;

                cart = [];
                persistCart();
                updateCartBadges();
                renderCart();
                refreshCartControls();
                sendOrderNotification('LuxeScents Order Placed', '#' + order.number + ' is now Processing.');

                navigateTo('view-order-confirmation');
            }, 1200);
        }

        function getLatestOrder() {
            return orders.length > 0 ? orders[0] : null;
        }

        function renderOrderTracking(orderId = null) {
            const order = orderId ? (orders.find(o => o.id === orderId) || getLatestOrder()) : getLatestOrder();
            const content = document.getElementById('order-tracking-content');
            const empty = document.getElementById('order-tracking-empty');

            if (!order) {
                content.classList.add('hidden');
                empty.classList.remove('hidden'); empty.classList.add('flex');
                return;
            }
            content.classList.remove('hidden');
            empty.classList.add('hidden'); empty.classList.remove('flex');

            document.getElementById('track-order-number').innerText = '#' + order.number;
            document.getElementById('track-status-badge').innerText = order.status;
            document.getElementById('track-order-date').innerText = new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            document.getElementById('track-total').innerText = formatMoney(order.total);
            document.getElementById('track-count').innerText = order.items.reduce((sum, it) => sum + it.quantity, 0);

            document.getElementById('track-items').innerHTML = order.items.map(it => {
                const product = products.find(p => p.id === it.productId);
                if (!product) return '';
                return `
                    <div class="flex justify-between items-center text-sm md:text-base p-4 border border-gray-100 rounded-2xl bg-white">
                        <div class="flex items-center gap-4">
                            <div class="w-14 h-14 md:w-16 md:h-16 ${product.bgColor} rounded-xl p-2 shadow-inner">
                                <img src="${product.image}" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'" class="w-full h-full object-contain mix-blend-multiply">
                            </div>
                            <div>
                                <span class="font-bold block text-sm md:text-base">${product.name}</span>
                                <span class="text-gray-500 text-xs md:text-sm">${it.size} • Qty: ${it.quantity}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="font-bold block text-sm md:text-base">${formatMoney(product.price * it.quantity)}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // =====================================================================
        // ACCOUNT / SETTINGS (new)
