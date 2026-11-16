// ── Database Layer ──
// This is the ONLY file that talks to Supabase.
// All other files call these functions instead of touching the database directly.
// The Supabase client is created lazily (only when first needed) so that
// pages that don't need data (About, Privacy, Terms) never trigger errors.

var _client = null;

// ── Create (or return) the Supabase client ──
function getClient() {
    if (_client) return _client;

    // Make sure the CDN script loaded
    if (typeof supabase === 'undefined') {
        throw new Error(
            'Could not load the Supabase library. Please check your internet connection and try again.'
        );
    }

    // Make sure the developer pasted real keys
    if (
        SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE' ||
        SUPABASE_KEY === 'YOUR_SUPABASE_ANON_KEY_HERE'
    ) {
        throw new Error(
            'Supabase is not configured yet. Open js/config.js and paste your project URL and anon key.'
        );
    }

    _client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    return _client;
}

// ── Fetch posts with optional filters ──
// Parameters (all optional):
//   category  – exact match on the category column
//   division  – exact match on the division column
//   district  – exact match on the district column
//   search    – partial match on title, body, or institution
//   sort      – 'newest' (default) or 'upvotes'
async function getPosts(filters) {
    filters = filters || {};
    var client = getClient();
    var query = client.from('posts').select('*');

    if (filters.category) query = query.eq('category', filters.category);
    if (filters.division) query = query.eq('division', filters.division);
    if (filters.district) query = query.eq('district', filters.district);

    // Search across title, body, and institution name
    if (filters.search) {
        query = query.or(
            'title.ilike.%' + filters.search + '%,' +
            'body.ilike.%' + filters.search + '%,' +
            'institution.ilike.%' + filters.search + '%'
        );
    }

    // Sort order
    if (filters.sort === 'upvotes') {
        query = query.order('upvotes', { ascending: false });
    } else {
        query = query.order('created_at', { ascending: false });
    }

    var result = await query;
    if (result.error) throw result.error;
    return result.data;
}

// ── Fetch a single post by its UUID ──
async function getPost(id) {
    var client = getClient();
    var result = await client
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();
    if (result.error) throw result.error;
    return result.data;
}

// ── Fetch the latest n approved posts ──
async function getLatest(n) {
    n = n || 6;
    var client = getClient();
    var result = await client
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(n);
    if (result.error) throw result.error;
    return result.data;
}

// ── Fetch all approved posts ranked by net votes (upvotes − downvotes) ──
// We fetch everything and sort on the client side because the database
// does not have a computed column for net votes.
async function getTop() {
    var client = getClient();
    var result = await client.from('posts').select('*');
    if (result.error) throw result.error;
    // Sort descending by (upvotes - downvotes)
    return result.data.sort(function (a, b) {
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    });
}

// ── Submit a new post ──
// Important: we do NOT chain .select() after .insert().
// RLS hides unapproved rows from anonymous users, so trying to read
// the just-inserted row back would fail with a "no rows returned" error.
async function createPost(data) {
    var client = getClient();
    var result = await client.from('posts').insert({
        title:       data.title,
        category:    data.category,
        institution: data.institution,
        division:    data.division,
        district:    data.district,
        rating:      data.rating,
        body:        data.body,
        // These three are enforced by the RLS INSERT policy.
        // We set them explicitly so there is no ambiguity.
        approved:  false,
        upvotes:   0,
        downvotes: 0
    });
    if (result.error) throw result.error;
}

// ── Vote on a post ──
// Calls the database function vote_post(post_id, direction).
// Each browser can vote once per post; the vote is remembered in localStorage.
async function votePost(id, direction) {
    var client = getClient();

    // Check if this browser already voted on this post
    var votes = JSON.parse(localStorage.getItem('kotokotha_votes') || '{}');
    if (votes[id]) {
        throw new Error('You have already voted on this post.');
    }

    // Call the server-side function
    var result = await client.rpc('vote_post', {
        post_id:   id,
        direction: direction
    });
    if (result.error) throw result.error;

    // Remember the vote so we don't allow a second one
    votes[id] = direction;
    localStorage.setItem('kotokotha_votes', JSON.stringify(votes));
}

// ── Check whether this browser already voted on a post ──
// Returns 'up', 'down', or null
function getVote(id) {
    var votes = JSON.parse(localStorage.getItem('kotokotha_votes') || '{}');
    return votes[id] || null;
}
