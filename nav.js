(function () {
    const base = document.currentScript.src.replace('nav.js', '');

    const links = [
        { label: 'Home',    href: base + 'index.html' },
        // { label: 'Books',   href: base + 'books/' },
        { label: 'About',   href: base + 'about/' },
        // { label: 'News',    href: base + 'news/' },
        { label: 'Contact', href: base + 'contact/', hidden: true }
    ];

    function buildNavHTML() {
        const navItems = links.filter(function (link) {
            return !link.hidden;
        }).map(function (link) {
            const active = window.location.href.indexOf(link.href) !== -1 ? ' class="active"' : '';
            return '<li><a href="' + link.href + '"' + active + '>' + link.label + '</a></li>';
        }).join('');

        return '<nav>' +
            '<a href="' + base + 'index.html" class="nav-logo">' +
                '<img src="' + base + 'Images/Quiet Lane Publishing.png" alt="Quiet Lane Publishing">' +
            '</a>' +
            '<ul class="nav-links">' + navItems + '</ul>' +
        '</nav>';
    }

    // Inject nav into placeholder
    const placeholder = document.getElementById('nav-placeholder');
    if (placeholder) placeholder.outerHTML = buildNavHTML();

    function updateActiveLink() {
        document.querySelectorAll('.nav-links a').forEach(function (a) {
            if (window.location.href.indexOf(a.getAttribute('href')) !== -1) {
                a.classList.add('active');
            } else {
                a.classList.remove('active');
            }
        });
    }

    function loadPageContent(url) {
        fetch(url)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newContent = doc.getElementById('page-content');
                const currentContent = document.getElementById('page-content');
                if (newContent && currentContent) {
                    currentContent.innerHTML = newContent.innerHTML;
                }
                document.title = doc.title;
                updateActiveLink();
                window.scrollTo(0, 0);
            })
            .catch(function () {
                // Fall back to normal navigation if fetch fails (e.g. file://)
                window.location.href = url;
            });
    }

    // Intercept all nav link clicks (including the logo)
    document.addEventListener('click', function (e) {
        const a = e.target.closest('nav a');
        if (a) {
            e.preventDefault();
            const targetUrl = a.href;
            const indexUrl = base + 'index.html';
            const onIndex = window.location.href === indexUrl || window.location.href === base;
            const goingToSubpage = targetUrl !== indexUrl;

            if (targetUrl === indexUrl && !onIndex) {
                // Subpage → Home: pop the stack so back button behaves naturally
                window.history.back();
                // popstate handler will call loadPageContent automatically
            } else if (onIndex && goingToSubpage) {
                // Index → subpage: push so back button returns to index
                window.history.pushState(null, '', targetUrl);
                loadPageContent(targetUrl);
            } else {
                // Subpage → subpage, or Home → Home: replace
                window.history.replaceState(null, '', targetUrl);
                loadPageContent(targetUrl);
            }
        }
    });

    // Handle browser back / forward buttons
    window.addEventListener('popstate', function () {
        loadPageContent(window.location.href);
    });
}());
