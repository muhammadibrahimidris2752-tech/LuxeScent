// Standalone admin boot
window.addEventListener('load', function () {
    loadPersistedState();
    initDashboard();

    document.querySelectorAll('.modal').forEach(function (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                this.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(function (modal) {
                modal.classList.remove('active');
            });
            document.body.style.overflow = '';
        }
    });
});
