        // =====================================================================
        function proceedToOrderSummary() {
            if (cart.length === 0) {
                showToast('Your cart is empty');
                return;
            }

            const fields = [
                { id: 'co-first-name', label: 'First name' },
                { id: 'co-last-name', label: 'Last name' },
                { id: 'co-phone', label: 'Phone number' },
                { id: 'co-street', label: 'Street address' },
                { id: 'co-city', label: 'City' }
            ];
            const errors = [];
            let firstInvalid = null;

            fields.forEach(f => {
                const el = document.getElementById(f.id);
                const valid = el.value.trim().length > 0;
                if (!valid) {
                    el.classList.remove('border-gray-200');
                    el.classList.add('border-red-400');
                    errors.push(f.label);
                    if (!firstInvalid) firstInvalid = el;
                } else {
                    el.classList.remove('border-red-400');
                    el.classList.add('border-gray-200');
                }
            });

            if (errors.length > 0) {
                showToast(`Please fill in: ${errors.join(', ')}`);
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            navigateTo('view-order-summary');
        }

        // =====================================================================
        // ORDER SUMMARY / PLACE ORDER / ORDERS
