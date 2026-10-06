        // Filters the central catalog by name, brand, category and tags.
        // Results render inline on the Discover screen, reusing the same
        // card grid pattern used everywhere else.
        // =====================================================================
        function getSearchMatches(query) {
            const q = query.trim().toLowerCase();
            if (!q) return [];
            return products.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.brand.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                p.tags.some(t => t.toLowerCase().includes(q))
            );
        }

        function handleSearchInput(value) {
            searchQuery = value;
            const clearBtn = document.getElementById('catalog-search-clear');
            const browse = document.getElementById('categories-browse-section');
            const results = document.getElementById('categories-search-results');
            const trimmed = value.trim();

            if (!trimmed) {
                clearBtn.classList.add('hidden');
                browse.classList.remove('hidden');
                results.classList.add('hidden');
                return;
            }

            clearBtn.classList.remove('hidden');
            browse.classList.add('hidden');
            results.classList.remove('hidden');

            const matches = getSearchMatches(trimmed);
            document.getElementById('search-results-query').innerText = trimmed;
            document.getElementById('search-results-count').innerText = matches.length;

            const empty = document.getElementById('search-results-empty');
            if (matches.length === 0) {
                document.getElementById('search-results-grid').innerHTML = '';
                empty.classList.remove('hidden'); empty.classList.add('flex');
            } else {
                empty.classList.add('hidden'); empty.classList.remove('flex');
                renderProductGrid('search-results-grid', matches);
            }
        }

        function clearSearchInput() {
            const input = document.getElementById('catalog-search-input');
            input.value = '';
            handleSearchInput('');
            input.focus();
        }

        function resetSearchUI() {
            const input = document.getElementById('catalog-search-input');
            if (input) input.value = '';
            searchQuery = '';
            const clearBtn = document.getElementById('catalog-search-clear');
            const browse = document.getElementById('categories-browse-section');
            const results = document.getElementById('categories-search-results');
            if (clearBtn) clearBtn.classList.add('hidden');
            if (browse) browse.classList.remove('hidden');
            if (results) results.classList.add('hidden');
        }

        // =====================================================================
        // FILTERING & SORTING
