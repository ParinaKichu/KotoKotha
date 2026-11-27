// ── Admin Panel Logic (admin.html) ──
// Moderation dashboard: review pending posts, approve, unpublish, edit, delete.
// Helpers (el, timeAgo, createStars, populateCategories/Divisions/Districts)
// come from app.js, which is loaded before this file.
//
// SECURITY MODEL
//  - Login is real Supabase Auth (email + password). There is no password
//    stored in this repo.
//  - Only users listed in the `admins` table pass is_admin(). Row Level
//    Security enforces this on the server, so hiding buttons here is only
//    for convenience — the database is what actually protects the data.
//  - Only the public anon key is used. NEVER put a service_role key in this repo.
//  - The admin session lives in sessionStorage under its own key, so the
//    public pages (which use the default storage) never see it and keep
//    showing visitors only approved posts. Closing the tab logs you out.
//  - All user text is inserted with textContent, never innerHTML.

var adminClient = null;
var adminPosts  = [];
var adminTab    = 'pending';
var editingId   = null;
var flashTimer  = null;

// ═══════════════════════════════════════════
//  SUPABASE CLIENT (separate from db.js)
// ═══════════════════════════════════════════

function getAdminClient() {
    if (adminClient) return adminClient;

    if (typeof supabase === 'undefined') {
        throw new Error('Could not load the Supabase library. Check your internet connection and try again.');
    }

    adminClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            storage: window.sessionStorage,
            storageKey: 'kotokotha-admin-auth',
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false
        }
    });
    return adminClient;
}

// ═══════════════════════════════════════════
//  SMALL UI HELPERS
// ═══════════════════════════════════════════

// Show a message box inside the element with the given id.
// type is 'error' or 'success'. Success messages fade after 5 seconds.
function flash(targetId, type, message) {
    var box = document.getElementById(targetId);
    box.innerHTML = ''; // safe — clearing our own structure
    box.appendChild(el('div', type === 'error' ? 'error-message' : 'success-message', message));

    clearTimeout(flashTimer);
    if (type !== 'error') {
        flashTimer = setTimeout(function () { box.innerHTML = ''; }, 5000);
    }
}

function clearFlash(targetId) {
    document.getElementById(targetId).innerHTML = '';
}

// Switch between the login screen and the dashboard
function showView(name) {
    document.getElementById('loginView').hidden = (name !== 'login');
    document.getElementById('dashView').hidden  = (name !== 'dash');
    document.getElementById('logoutBtn').hidden = (name !== 'dash');
}

// ═══════════════════════════════════════════
//  LOGIN / LOGOUT
// ═══════════════════════════════════════════

// After a session exists, confirm the account is really an admin
async function enterDashboard() {
    var client = getAdminClient();
    var check = await client.rpc('is_admin');

    if (check.error) {
        await client.auth.signOut();
        showView('login');
        flash('loginMessage', 'error',
            'Admin setup is incomplete. Run supabase/admin.sql in the Supabase SQL Editor. (' + check.error.message + ')');
        return;
    }

    if (check.data !== true) {
        await client.auth.signOut();
        showView('login');
        flash('loginMessage', 'error', 'This account is not an admin.');
        return;
    }

    clearFlash('loginMessage');
    showView('dash');
    await loadAdminPosts();
}

async function handleLogin(e) {
    e.preventDefault();
    clearFlash('loginMessage');

    var email    = document.getElementById('adminEmail').value.trim();
    var password = document.getElementById('adminPassword').value;
    var btn      = document.getElementById('loginBtn');

    btn.disabled = true;
    btn.textContent = 'Logging in…';

    try {
        var result = await getAdminClient().auth.signInWithPassword({ email: email, password: password });
        if (result.error) {
            // Same wording for every failure so we never reveal which part was wrong
            flash('loginMessage', 'error', 'Invalid email or password.');
        } else {
            document.getElementById('adminPassword').value = '';
            await enterDashboard();
        }
    } catch (err) {
        flash('loginMessage', 'error', err.message);
    }

    btn.disabled = false;
    btn.textContent = 'Log in';
}

async function handleLogout() {
    try {
        await getAdminClient().auth.signOut();
    } catch (err) {
        // Even if sign-out fails remotely, drop everything local
    }
    adminPosts = [];
    document.getElementById('adminList').innerHTML = '';
    showView('login');
}

// ═══════════════════════════════════════════
//  LOAD + FILTER POSTS
// ═══════════════════════════════════════════

async function loadAdminPosts() {
    var list = document.getElementById('adminList');
    list.innerHTML = '';
    list.appendChild(el('p', 'loading', 'Loading posts…'));

    try {
        var result = await getAdminClient()
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1000);
        if (result.error) throw result.error;
        adminPosts = result.data;
        renderAdmin();
    } catch (err) {
        list.innerHTML = '';
        flash('adminMessage', 'error', 'Could not load posts: ' + err.message);
    }
}

// Posts matching the current tab + search box
function visiblePosts() {
    var term = document.getElementById('adminSearch').value.trim().toLowerCase();

    return adminPosts.filter(function (p) {
        if (adminTab === 'pending' && p.approved)  return false;
        if (adminTab === 'live'    && !p.approved) return false;
        if (!term) return true;

        var haystack = (p.title + ' ' + p.institution + ' ' + p.body + ' ' + p.district + ' ' + p.category).toLowerCase();
        return haystack.indexOf(term) !== -1;
    });
}

function updateCounts() {
    var pending = adminPosts.filter(function (p) { return !p.approved; }).length;
    document.getElementById('countPending').textContent = pending;
    document.getElementById('countLive').textContent    = adminPosts.length - pending;
    document.getElementById('countAll').textContent     = adminPosts.length;
}

// ═══════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════

function renderAdmin() {
    updateCounts();

    var list  = document.getElementById('adminList');
    var posts = visiblePosts();
    list.innerHTML = ''; // safe — clearing our own structure

    if (posts.length === 0) {
        var msg = adminTab === 'pending' ? 'Nothing waiting for review. 🎉' : 'No posts found.';
        list.appendChild(el('p', 'empty-message', msg));
        return;
    }

    posts.forEach(function (post) {
        list.appendChild(buildAdminCard(post));
    });
}

function buildAdminCard(post) {
    var card = el('div', 'admin-card ' + (post.approved ? 'is-live' : 'is-pending'));

    // Head: status + category + stars
    var head = el('div', 'admin-card-head');
    head.appendChild(el('span', 'status-badge ' + (post.approved ? 'status-live' : 'status-pending'),
        post.approved ? 'Live' : 'Pending'));
    head.appendChild(el('span', 'badge', post.category));
    head.appendChild(el('span', 'stars', createStars(post.rating)));
    card.appendChild(head);

    card.appendChild(el('h3', null, post.title));
    card.appendChild(el('p', 'admin-meta',
        post.institution + ' · ' + post.division + ', ' + post.district + ' · ' +
        new Date(post.created_at).toLocaleString('en-GB') + ' (' + timeAgo(post.created_at) + ')'));

    // Full text — moderators need to read everything
    card.appendChild(el('p', 'admin-body', post.body));

    // Actions
    var actions = el('div', 'admin-actions');

    if (post.approved) {
        var hideBtn = el('button', 'btn btn-secondary btn-sm', 'Unpublish');
        hideBtn.addEventListener('click', function () { handleSetApproved(post, false, hideBtn); });
        actions.appendChild(hideBtn);
    } else {
        var approveBtn = el('button', 'btn btn-primary btn-sm', 'Approve');
        approveBtn.addEventListener('click', function () { handleSetApproved(post, true, approveBtn); });
        actions.appendChild(approveBtn);
    }

    var editBtn = el('button', 'btn btn-secondary btn-sm', 'Edit');
    editBtn.addEventListener('click', function () { openEdit(post); });
    actions.appendChild(editBtn);

    if (post.approved) {
        var viewLink = el('a', 'btn btn-secondary btn-sm', 'View');
        viewLink.href = 'post.html?id=' + encodeURIComponent(post.id);
        viewLink.target = '_blank';
        viewLink.rel = 'noopener';
        actions.appendChild(viewLink);
    }

    var delBtn = el('button', 'btn btn-danger btn-sm', 'Delete');
    delBtn.addEventListener('click', function () { handleDelete(post, delBtn); });
    actions.appendChild(delBtn);

    actions.appendChild(el('span', 'admin-votes', '▲ ' + post.upvotes + '   ▼ ' + post.downvotes));

    card.appendChild(actions);
    return card;
}

// ═══════════════════════════════════════════
//  WRITE OPERATIONS
//  RLS silently skips rows you are not allowed to touch (no error),
//  so we ask for the changed rows back and treat "0 rows" as a failure.
// ═══════════════════════════════════════════

async function updatePost(id, changes) {
    var result = await getAdminClient()
        .from('posts')
        .update(changes)
        .eq('id', id)
        .select();
    if (result.error) throw result.error;
    if (!result.data || result.data.length === 0) {
        throw new Error('Nothing was updated. Make sure your account is listed in the admins table.');
    }
    return result.data[0];
}

async function removePost(id) {
    var result = await getAdminClient()
        .from('posts')
        .delete()
        .eq('id', id)
        .select('id');
    if (result.error) throw result.error;
    if (!result.data || result.data.length === 0) {
        throw new Error('Nothing was deleted. Make sure your account is listed in the admins table.');
    }
}

// Replace one post in the local list after it changed
function replaceLocal(updated) {
    for (var i = 0; i < adminPosts.length; i++) {
        if (adminPosts[i].id === updated.id) {
            adminPosts[i] = updated;
            return;
        }
    }
}

async function handleSetApproved(post, value, btn) {
    btn.disabled = true;
    try {
        var updated = await updatePost(post.id, { approved: value });
        replaceLocal(updated);
        renderAdmin();
        flash('adminMessage', 'success', value ? 'Post approved and now live.' : 'Post unpublished.');
    } catch (err) {
        btn.disabled = false;
        flash('adminMessage', 'error', err.message);
    }
}

async function handleDelete(post, btn) {
    if (!window.confirm('Permanently delete "' + post.title + '"? This cannot be undone.')) return;

    btn.disabled = true;
    try {
        await removePost(post.id);
        adminPosts = adminPosts.filter(function (p) { return p.id !== post.id; });
        renderAdmin();
        flash('adminMessage', 'success', 'Post deleted.');
    } catch (err) {
        btn.disabled = false;
        flash('adminMessage', 'error', err.message);
    }
}

// ═══════════════════════════════════════════
//  EDIT MODAL
// ═══════════════════════════════════════════

// Make sure a <select> can show a value even if it is not in the normal list
function ensureOption(select, value) {
    for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value === value) return;
    }
    var opt = document.createElement('option');
    opt.value = value;
    opt.textContent = value;
    select.appendChild(opt);
}

function openEdit(post) {
    editingId = post.id;
    clearFlash('editMessage');

    document.getElementById('editTitle').value       = post.title;
    document.getElementById('editInstitution').value = post.institution;
    document.getElementById('editBody').value        = post.body;
    document.getElementById('editRating').value      = String(post.rating);

    var category = document.getElementById('editCategory');
    ensureOption(category, post.category);
    category.value = post.category;

    var division = document.getElementById('editDivision');
    var district = document.getElementById('editDistrict');
    ensureOption(division, post.division);
    division.value = post.division;
    populateDistricts(district, post.division, 'Select district');
    ensureOption(district, post.district);
    district.value = post.district;

    document.getElementById('editModal').hidden = false;
    document.getElementById('editTitle').focus();
}

function closeEdit() {
    editingId = null;
    document.getElementById('editModal').hidden = true;
}

async function handleEditSave(e) {
    e.preventDefault();
    clearFlash('editMessage');

    var changes = {
        title:       document.getElementById('editTitle').value.trim(),
        category:    document.getElementById('editCategory').value,
        institution: document.getElementById('editInstitution').value.trim(),
        division:    document.getElementById('editDivision').value,
        district:    document.getElementById('editDistrict').value,
        rating:      parseInt(document.getElementById('editRating').value, 10),
        body:        document.getElementById('editBody').value.trim()
    };

    // Same rules as the public submit form
    if (!changes.title)       { flash('editMessage', 'error', 'Title cannot be empty.'); return; }
    if (!changes.institution) { flash('editMessage', 'error', 'Institution cannot be empty.'); return; }
    if (!changes.district)    { flash('editMessage', 'error', 'Please select a district.'); return; }
    if (changes.body.length < 30) { flash('editMessage', 'error', 'The experience must be at least 30 characters.'); return; }

    var btn = document.getElementById('editSave');
    btn.disabled = true;
    btn.textContent = 'Saving…';

    try {
        var updated = await updatePost(editingId, changes);
        replaceLocal(updated);
        closeEdit();
        renderAdmin();
        flash('adminMessage', 'success', 'Changes saved.');
    } catch (err) {
        flash('editMessage', 'error', err.message);
    }

    btn.disabled = false;
    btn.textContent = 'Save changes';
}

// ═══════════════════════════════════════════
//  START
// ═══════════════════════════════════════════

async function initAdmin() {
    var loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    // Fill the edit form's dropdowns once
    populateCategories(document.getElementById('editCategory'));
    populateDivisions(document.getElementById('editDivision'));
    document.getElementById('editDivision').addEventListener('change', function () {
        populateDistricts(document.getElementById('editDistrict'), this.value, 'Select district');
    });

    // Events
    loginForm.addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('refreshBtn').addEventListener('click', loadAdminPosts);
    document.getElementById('editForm').addEventListener('submit', handleEditSave);
    document.getElementById('editCancel').addEventListener('click', closeEdit);

    // Click on the dark backdrop (outside the box) closes the modal
    document.getElementById('editModal').addEventListener('click', function (e) {
        if (e.target === this) closeEdit();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !document.getElementById('editModal').hidden) closeEdit();
    });

    // Tabs
    document.getElementById('tabs').addEventListener('click', function (e) {
        var tab = e.target.closest('.tab');
        if (!tab) return;
        adminTab = tab.dataset.tab;
        var tabs = document.querySelectorAll('#tabs .tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].classList.toggle('active', tabs[i] === tab);
        }
        renderAdmin();
    });

    // Debounced search (client-side, so it is instant on a few hundred posts)
    var searchTimer;
    document.getElementById('adminSearch').addEventListener('input', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(renderAdmin, 200);
    });

    // If the session ends elsewhere (expired / signed out), go back to login
    try {
        getAdminClient().auth.onAuthStateChange(function (event) {
            if (event === 'SIGNED_OUT') {
                adminPosts = [];
                showView('login');
            }
        });

        // Already signed in on this tab? Skip the login form.
        var session = await getAdminClient().auth.getSession();
        if (session.data && session.data.session) {
            await enterDashboard();
        } else {
            showView('login');
        }
    } catch (err) {
        showView('login');
        flash('loginMessage', 'error', err.message);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    if (document.body.dataset.page === 'admin') initAdmin();
});
