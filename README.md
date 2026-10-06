# LuxeScents — maintainable vanilla HTML/CSS/JS project

This project keeps the complete LuxeScents storefront and admin application in plain HTML, CSS, and classic JavaScript files. There is no bundler and no HTML partial/fetch layer.

```text
LuxeScents_Modular_Vanilla_v5/
├── index.html                 # storefront entry point
├── admin/
│   └── index.html             # standalone admin entry point
├── css/
│   ├── 00-base.css
│   ├── 01-ui.css
│   ├── 02-app-chrome.css
│   ├── 03-dashboard.css       # admin two-pane independent scrolling
│   ├── 04-admin-theme.css
│   └── 05-settings.css        # shared storefront switch styling
└── js/
    ├── 00-tailwind-config.js
    ├── 01-data.js
    ├── 02-state.js
    ├── 03-storage.js
    ├── 04-utils.js
    ├── 05-navigation.js
    ├── 06-modals.js
    ├── 07-catalog-rendering.js
    ├── 08-search.js
    ├── 09-filters.js
    ├── 10-product-details.js
    ├── 11-wishlist.js
    ├── 12-cart.js
    ├── 13-checkout.js
    ├── 14-orders.js
    ├── 15-account-settings.js
    ├── 16-campaign.js
    ├── 17-dashboard.js
    ├── 18-init-storefront.js
    └── 18-init-admin.js
```

## Admin scrolling

The desktop admin uses two independent scroll containers: the left sidebar scrolls independently so lower navigation actions remain reachable, and the right dashboard content scrolls independently. The document itself does not become the competing vertical scroll surface. On mobile, the drawer is fixed and the background document is locked while it is open.

## Product / catalog management

Products no longer contain catalog fields for fabricated customer feedback values. Product editing is also the place where product categories, collections, and reusable labels are assigned.

Categories and Collections are maintained as compact editable admin lists with description, active/hidden state, ordering controls, and edit/delete actions. Labels are maintained only as label definitions; product assignment is handled from the Product editor.

## Storefront settings

Order Updates, Email Notifications, Sound, and Haptic preferences are persisted. Sound uses Web Audio feedback, Haptic uses the browser vibration API where supported, and Order Updates controls browser notification permission/use. Email Notifications controls the saved preference; actual outbound email requires a backend/email provider.

## Test

From the project root:

```bash
python3 -m http.server 8080
```

Open:

- `http://localhost:8080/` — storefront
- `http://localhost:8080/admin/` — admin
