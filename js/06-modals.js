        // MODALS / SHEETS
        // =====================================================================
        function openModal(modalId) {
            document.getElementById(modalId).classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
            document.body.style.overflow = '';
        }

        // =====================================================================
        // TOAST
        // =====================================================================
        function showToast(msg) {
            const toast = document.getElementById('toast');
            toast.innerText = msg;
            toast.classList.remove('hidden');
            toast.classList.add('opacity-100');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 2500);
        }

        // =====================================================================
        // CATALOG HELPERS
