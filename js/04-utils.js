        // UTILITY FUNCTIONS
        // =====================================================================
        const formatMoney = (amount) => '₦ ' + Math.round(amount).toLocaleString('en-NG');

        function escapeHtml(str) {
            if (str === null || str === undefined) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function generateOrderNumber() {
            return 'LS' + Math.floor(100000 + Math.random() * 900000);
        }

        // =====================================================================
        // NAVIGATION / ROUTING
