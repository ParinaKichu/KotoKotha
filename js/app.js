// ── KotoKotha App Logic ──
// This file runs the right code depending on which page is loaded.
// Each HTML page sets data-page="..." on its <body> tag.

// ── Disclaimer ──
// Stored once here so it can be changed in one place.
// It is injected into the footer of every page by initDisclaimer().
var DISCLAIMER_TEXT = 'Disclaimer: KotoKotha is a platform for anonymous personal experiences. Posts reflect the views of their authors, are not verified by KotoKotha, and do not amount to a final legal judgment. KotoKotha is not a court or an enforcement authority.';

// ── Category list ──
// These must match the values stored in the database exactly.
var CATEGORIES = [
    'Hospital', 'Education', 'Government Office', 'Utility',
    'Bank', 'Transport', 'Internet/Telecom', 'Other'
];

// ═══════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════

// Shortcut: create an HTML element with an optional class and text.
// Using textContent (not innerHTML) keeps user-written text safe.
function el(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined && text !== null) element.textContent = text;
    return element;
}

// Turn a rating number (1-5) into a star string like "★★★☆☆"
function createStars(rating) {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

// Turn a date string into a friendly "2 days ago" format
function timeAgo(dateStr) {
    var now = new Date();
    var date = new Date(dateStr);
    var seconds = Math.floor((now - date) / 1000);

    if (seconds < 60)    return 'just now';
    var minutes = Math.floor(seconds / 60);
    if (minutes < 60)    return minutes + (minutes === 1 ? ' minute ago' : ' minutes ago');
    var hours = Math.floor(minutes / 60);
    if (hours < 24)      return hours + (hours === 1 ? ' hour ago' : ' hours ago');
    var days = Math.floor(hours / 24);
    if (days < 30)       return days + (days === 1 ? ' day ago' : ' days ago');
    var months = Math.floor(days / 30);
    if (months < 12)     return months + (months === 1 ? ' month ago' : ' months ago');
    var years = Math.floor(months / 12);
    return years + (years === 1 ? ' year ago' : ' years ago');
}

// Show a red error box inside a container
function showError(message, container) {
    container.prepend(el('div', 'error-message', message));
}

// Show a green success box inside a container
function showSuccess(message, container) {
    container.prepend(el('div', 'success-message', message));
}

// Fill a <select> dropdown with category options
function populateCategories(select) {
    CATEGORIES.forEach(function (cat) {
        var opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
}

// Fill a <select> dropdown with division options
function populateDivisions(select) {
    Object.keys(LOCATIONS).forEach(function (div) {
        var opt = document.createElement('option');
        opt.value = div;
        opt.textContent = div;
        select.appendChild(opt);
    });
}

// Fill a <select> with districts that belong to the chosen division
// defaultLabel controls what the first "(none selected)" option says
function populateDistricts(select, division, defaultLabel) {
    select.innerHTML = ''; // safe — no user data
    var def = document.createElement('option');
    def.value = '';
    def.textContent = defaultLabel || 'All Districts';
    select.appendChild(def);

    if (division && LOCATIONS[division]) {
        LOCATIONS[division].forEach(function (dist) {
            var opt = document.createElement('option');
            opt.value = dist;
            opt.textContent = dist;
            select.appendChild(opt);
        });
    }
}

// ═══════════════════════════════════════════
//  RENDER POST CARDS
//  SECURITY: every piece of user text goes
//  through textContent, never innerHTML.
// ═══════════════════════════════════════════

function renderCards(posts, container) {
    container.innerHTML = ''; // safe — clearing our own structure

    if (posts.length === 0) {
        container.appendChild(el('p', 'empty-message', 'No posts found.'));
        return;
    }

    posts.forEach(function (post) {
        var card = el('div', 'card');

        // -- Header: category badge + star rating --
        var header = el('div', 'card-header');
        header.appendChild(el('span', 'badge', post.category));
        header.appendChild(el('span', 'stars', createStars(post.rating)));
        card.appendChild(header);

        // -- Title (clickable link to full post) --
        var title = el('h3', 'card-title');
        var link = document.createElement('a');
        link.href = 'post.html?id=' + post.id;
        link.textContent = post.title; // textContent = safe
        title.appendChild(link);
        card.appendChild(title);

        // -- Institution + location --
        card.appendChild(
            el('p', 'card-meta', post.institution + ' · ' + post.division + ', ' + post.district)
        );

        // -- Body preview (first 150 chars) --
        var preview = post.body.length > 150
            ? post.body.substring(0, 150) + '…'
            : post.body;
        card.appendChild(el('p', 'card-body', preview));

        // -- Footer: vote counts + time --
        var footer = el('div', 'card-footer');
        var votes = el('div', 'votes');
        votes.appendChild(el('span', 'vote-up', '▲ ' + post.upvotes));
        votes.appendChild(el('span', 'vote-down', '▼ ' + post.downvotes));
        footer.appendChild(votes);
        footer.appendChild(el('span', 'time', timeAgo(post.created_at)));
        card.appendChild(footer);

        container.appendChild(card);
    });
}

// ═══════════════════════════════════════════
//  MOBILE MENU TOGGLE
// ═══════════════════════════════════════════

function initMobileMenu() {
    var btn = document.getElementById('menuBtn');
    var nav = document.getElementById('navLinks');
    if (btn && nav) {
        btn.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }
}

// ═══════════════════════════════════════════
//  THEME TOGGLE (dark / light)
//  The initial theme is applied by an inline
//  script in <head> (before CSS paints).
//  This function only wires up the toggle button.
// ═══════════════════════════════════════════

function initThemeToggle() {
    var btn = document.getElementById('themeBtn');
    if (!btn) return;

    // Set the button icon to match the current theme
    function updateIcon() {
        var theme = document.documentElement.getAttribute('data-theme');
        btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    updateIcon();

    btn.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('kotokotha_theme', next);
        updateIcon();
    });
}

// ═══════════════════════════════════════════
//  FOOTER DISCLAIMER
//  Injects the disclaimer text into the
//  footer on every page from the single
//  DISCLAIMER_TEXT constant above.
// ═══════════════════════════════════════════

function initDisclaimer() {
    var target = document.getElementById('footerDisclaimer');
    if (target) {
        target.textContent = DISCLAIMER_TEXT;
    }
}

// ═══════════════════════════════════════════
//  PAGE: HOME  (index.html)
//  Shows intro text + 6 latest posts
// ═══════════════════════════════════════════

async function initHome() {
    var container = document.getElementById('latestPosts');
    if (!container) return;

    container.appendChild(el('p', 'loading', 'Loading latest posts…'));

    try {
        var posts = await getLatest(6);
        renderCards(posts, container);
    } catch (err) {
        container.innerHTML = '';
        showError(err.message, container);
    }
}

// ═══════════════════════════════════════════
//  PAGE: ALL POSTS  (posts.html)
//  Filters + search + sort
// ═══════════════════════════════════════════

async function initPosts() {
    var container      = document.getElementById('postsContainer');
    var categoryFilter = document.getElementById('categoryFilter');
    var divisionFilter = document.getElementById('divisionFilter');
    var districtFilter = document.getElementById('districtFilter');
    var searchBox      = document.getElementById('searchBox');
    var sortSelect     = document.getElementById('sortSelect');
    if (!container) return;

    // Fill dropdowns with options
    populateCategories(categoryFilter);
    populateDivisions(divisionFilter);

    // When division changes → update districts and reload
    divisionFilter.addEventListener('change', function () {
        populateDistricts(districtFilter, divisionFilter.value, 'All Districts');
        loadPosts();
    });

    // Reload when any other filter changes
    categoryFilter.addEventListener('change', loadPosts);
    districtFilter.addEventListener('change', loadPosts);
    sortSelect.addEventListener('change', loadPosts);

    // Debounced search — waits 400 ms after typing stops
    var searchTimer;
    searchBox.addEventListener('input', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(loadPosts, 400);
    });

    // Load posts using current filter values
    async function loadPosts() {
        container.innerHTML = '';
        container.appendChild(el('p', 'loading', 'Loading…'));

        try {
            var posts = await getPosts({
                category: categoryFilter.value,
                division: divisionFilter.value,
                district: districtFilter.value,
                search:   searchBox.value.trim(),
                sort:     sortSelect.value
            });
            renderCards(posts, container);
        } catch (err) {
            container.innerHTML = '';
            showError(err.message, container);
        }
    }

    loadPosts(); // initial load
}

// ═══════════════════════════════════════════
//  PAGE: SINGLE POST  (post.html?id=...)
//  Full post + vote buttons
// ═══════════════════════════════════════════

async function initPost() {
    var container = document.getElementById('postContainer');
    if (!container) return;

    // Read the post ID from the URL query string
    var params = new URLSearchParams(window.location.search);
    var postId = params.get('id');

    if (!postId) {
        showError('No post ID provided. Go back to All Posts.', container);
        return;
    }

    container.appendChild(el('p', 'loading', 'Loading post…'));

    try {
        var post = await getPost(postId);
        renderFullPost(post, container);
    } catch (err) {
        container.innerHTML = '';
        showError(err.message, container);
    }
}

// Render the full post view (single-post page)
function renderFullPost(post, container) {
    container.innerHTML = '';
    var article = el('div', 'post-full');

    // Category badge
    article.appendChild(el('span', 'badge', post.category));

    // Title
    article.appendChild(el('h1', null, post.title));

    // Stars
    article.appendChild(el('div', 'stars', createStars(post.rating)));

    // Institution
    article.appendChild(el('p', 'post-meta', '🏛 ' + post.institution));

    // Location
    article.appendChild(el('p', 'post-meta', '📍 ' + post.division + ', ' + post.district));

    // Full body text
    article.appendChild(el('p', 'post-body', post.body));

    // Date
    var dateStr = new Date(post.created_at).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
    article.appendChild(el('p', 'post-date', 'Posted ' + dateStr + ' (' + timeAgo(post.created_at) + ')'));

    // ── Vote buttons ──
    var voteDiv = el('div', 'vote-buttons');
    var upBtn   = el('button', 'vote-btn', '▲ Upvote (' + post.upvotes + ')');
    var downBtn = el('button', 'vote-btn', '▼ Downvote (' + post.downvotes + ')');

    // Check if this browser already voted
    var existingVote = getVote(post.id);

    if (existingVote) {
        // Already voted — disable both, highlight the chosen one
        upBtn.disabled   = true;
        downBtn.disabled = true;
        if (existingVote === 'up')   upBtn.classList.add('voted');
        if (existingVote === 'down') downBtn.classList.add('voted');
    } else {
        // Not yet voted — attach click handlers
        upBtn.addEventListener('click', async function () {
            try {
                await votePost(post.id, 'up');
                post.upvotes++;
                upBtn.textContent = '▲ Upvote (' + post.upvotes + ')';
                upBtn.classList.add('voted');
                upBtn.disabled   = true;
                downBtn.disabled = true;
            } catch (err) {
                alert(err.message);
            }
        });

        downBtn.addEventListener('click', async function () {
            try {
                await votePost(post.id, 'down');
                post.downvotes++;
                downBtn.textContent = '▼ Downvote (' + post.downvotes + ')';
                downBtn.classList.add('voted');
                upBtn.disabled   = true;
                downBtn.disabled = true;
            } catch (err) {
                alert(err.message);
            }
        });
    }

    voteDiv.appendChild(upBtn);
    voteDiv.appendChild(downBtn);
    article.appendChild(voteDiv);

    // (Disclaimer is now in the footer of every page, not here)

    container.appendChild(article);
}

// ═══════════════════════════════════════════
//  PAGE: TOP POSTS  (top.html)
//  Ranked by (upvotes − downvotes)
// ═══════════════════════════════════════════

async function initTop() {
    var container = document.getElementById('topContainer');
    if (!container) return;

    container.appendChild(el('p', 'loading', 'Loading top posts…'));

    try {
        var posts = await getTop();
        renderCards(posts, container);
    } catch (err) {
        container.innerHTML = '';
        showError(err.message, container);
    }
}

// ═══════════════════════════════════════════
//  PAGE: SUBMIT  (submit.html)
//  Experience submission form
// ═══════════════════════════════════════════

function initSubmit() {
    var form           = document.getElementById('submitForm');
    var categorySelect = document.getElementById('category');
    var divisionSelect = document.getElementById('division');
    var districtSelect = document.getElementById('district');
    var starInput      = document.getElementById('starInput');
    var ratingInput    = document.getElementById('rating');
    var bodyInput      = document.getElementById('body');
    var charCount      = document.getElementById('charCount');
    var messageDiv     = document.getElementById('formMessage');
    if (!form) return;

    // Fill dropdowns
    populateCategories(categorySelect);
    populateDivisions(divisionSelect);

    // When division changes → fill district dropdown
    divisionSelect.addEventListener('change', function () {
        populateDistricts(districtSelect, divisionSelect.value, 'Select district');
    });

    // ── Star rating: click a star to set rating ──
    var stars = starInput.querySelectorAll('span');
    stars.forEach(function (star) {
        star.addEventListener('click', function () {
            var value = parseInt(star.dataset.value);
            ratingInput.value = value;
            // Fill all stars up to the clicked one
            stars.forEach(function (s) {
                if (parseInt(s.dataset.value) <= value) {
                    s.textContent = '★';
                    s.classList.add('active');
                } else {
                    s.textContent = '☆';
                    s.classList.remove('active');
                }
            });
        });
    });

    // ── Character counter for the body ──
    bodyInput.addEventListener('input', function () {
        var len = bodyInput.value.length;
        if (len < 30) {
            charCount.textContent = (30 - len) + ' more characters needed';
        } else {
            charCount.textContent = len + ' characters ✓';
        }
    });

    // ── Handle form submission ──
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        messageDiv.innerHTML = '';

        // Gather and validate each field
        var title       = document.getElementById('title').value.trim();
        var category    = categorySelect.value;
        var institution = document.getElementById('institution').value.trim();
        var division    = divisionSelect.value;
        var district    = districtSelect.value;
        var rating      = parseInt(ratingInput.value);
        var body        = bodyInput.value.trim();

        if (!title)                              { showError('Please enter a title.', messageDiv); return; }
        if (!category)                           { showError('Please select a category.', messageDiv); return; }
        if (!institution)                        { showError('Please enter the institution name.', messageDiv); return; }
        if (!division)                           { showError('Please select a division.', messageDiv); return; }
        if (!district)                           { showError('Please select a district.', messageDiv); return; }
        if (!rating || rating < 1 || rating > 5) { showError('Please select a rating (1–5 stars).', messageDiv); return; }
        if (body.length < 30)                    { showError('Your experience must be at least 30 characters.', messageDiv); return; }

        // Disable the button while submitting
        var submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting…';

        try {
            await createPost({ title: title, category: category, institution: institution, division: division, district: district, rating: rating, body: body });
            // Hide the form, show thank-you message
            form.style.display = 'none';
            showSuccess(
                'Thank you! Your post will appear on the site after review.',
                messageDiv
            );
        } catch (err) {
            showError('Something went wrong: ' + err.message, messageDiv);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Your Experience';
        }
    });
}

// ═══════════════════════════════════════════
//  START — runs when the page is ready
// ═══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function () {
    // These run on EVERY page
    initMobileMenu();
    initThemeToggle();
    initDisclaimer();

    // Run page-specific logic based on the data-page attribute
    var page = document.body.dataset.page;
    if (page === 'home')   initHome();
    if (page === 'posts')  initPosts();
    if (page === 'post')   initPost();
    if (page === 'top')    initTop();
    if (page === 'submit') initSubmit();
});
