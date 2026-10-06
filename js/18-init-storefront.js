// Storefront boot / DOM event setup
window.addEventListener('load', function () {
    loadPersistedState();
    syncDynamicCategoryFilterOptions();
    if (appSettings.orderUpdates) requestBrowserNotifications();

    renderProductGrid('home-featured-grid', getHomeFeaturedProducts());
    renderCampaignView();
    updateCartBadges();
    syncFilterModalUI();

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
        if ((e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.classList.contains('chip-campaign')) {
            e.preventDefault();
            selectCampaignChip(document.activeElement);
        }
    });
});
