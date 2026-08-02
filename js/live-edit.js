/* soma-live-edit — Tier 2, vanilla.
 *
 * SOMA App Standard §17 (admin edits copy in place) + §17a (the reviewer gets
 * three answers: take it, drop it, revise it).
 *
 * The React reference implementation lives in PlayMaker. This is the same
 * contract for a site with no component tree. Two decisions inherited from
 * SOMA/standards/soma-live-edit/README.md and deliberately not relitigated:
 *
 *   1. Match by STRING, never by DOM selector. The key is
 *      (app, route, original_text, occurrence). `main > div:nth-child(3)` dies
 *      at the next refactor; the sentence a human read does not — and the
 *      sentence is exactly what a build worker greps for.
 *   2. Re-apply on every DOM mutation. This page rewrites itself constantly
 *      (staged flow, streaming conversation), and an override that applies
 *      once is an override that vanishes.
 *
 * Storage is the shared `copy_overrides` table, which was already multi-app:
 * its RLS is `is_app_admin(app)` and canonical rows are world-readable. No
 * migration was needed to adopt it here.
 */
(function (global) {
  'use strict';

  var APP = 'a-different-mind';

  // Never touch: the conversation (that's people talking, not site copy),
  // form controls, code, or anything explicitly marked as user content.
  var SKIP_SELECTOR = [
    '#thread', '#input', 'textarea', 'input', 'select', 'button.send',
    'script', 'style', 'noscript', 'code', 'pre',
    '[data-user-content]', '[data-no-edit]',
    '#le-panel', '#le-bar'
  ].join(',');

  var overrides = [];      // canonical, applied to everyone
  var drafts = [];         // admin-only, shown in the review panel
  var isAdmin = false;
  var editing = false;
  var applied = new WeakMap();   // textNode -> original string, so we can revert

  function client() {
    return global.SomaAuth && global.SomaAuth.getClient
      ? global.SomaAuth.getClient() : null;
  }

  // Route normalization: ids and uuids collapse to :id so an edit made on one
  // record's page isn't keyed to that record. This site has no record pages
  // yet, but inheriting the rule costs nothing and removes a future trap.
  function route() {
    return (location.pathname || '/')
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
      .replace(/\/\d+/g, '/:id')
      .replace(/\/index\.html$/, '/')
      .replace(/\.html$/, '')
      .replace(/^$/, '/') || '/';
  }

  function norm(s) {
    return (s || '').replace(/\s+/g, ' ').trim();
  }

  /* Walk every editable text node in document order. Returns
   * [{node, text, occurrence}] where occurrence is the Nth identical string. */
  function walk() {
    var out = [];
    var counts = Object.create(null);
    var tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!norm(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        var el = n.parentElement;
        if (!el || el.closest(SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = tw.nextNode())) {
      // The original is whatever we first saw here — not the current value,
      // which may already carry an override.
      var text = applied.has(n) ? applied.get(n) : norm(n.nodeValue);
      var k = counts[text] || 0;
      counts[text] = k + 1;
      out.push({ node: n, text: text, occurrence: k });
    }
    return out;
  }

  function apply() {
    if (!overrides.length) return;
    var r = route();
    var nodes = walk();
    for (var i = 0; i < nodes.length; i++) {
      var item = nodes[i];
      for (var j = 0; j < overrides.length; j++) {
        var o = overrides[j];
        if (o.route !== r) continue;
        if (o.original_text !== item.text) continue;
        if ((o.occurrence || 0) !== item.occurrence) continue;
        if (norm(item.node.nodeValue) === norm(o.new_text)) break; // already applied
        if (!applied.has(item.node)) applied.set(item.node, item.text);
        item.node.nodeValue = o.new_text;
        break;
      }
    }
  }

  var applyQueued = false;
  function scheduleApply() {
    if (applyQueued) return;
    applyQueued = true;
    // setTimeout, NOT requestAnimationFrame. rAF is paused in a hidden or
    // background tab, so a page opened in one (a link opened in a new tab —
    // i.e. how an invite link usually gets opened) would fetch its overrides
    // and then never apply them until the tab was focused. Caught in test.
    setTimeout(function () {
      applyQueued = false;
      try { apply(); } catch (e) { /* never let an override break the page */ }
    }, 0);
  }

  function loadCanonical() {
    var c = client();
    if (!c) return Promise.resolve();
    return c.from('copy_overrides')
      .select('route,original_text,new_text,occurrence')
      .eq('app', APP).eq('status', 'canonical')
      .then(function (res) {
        if (!res.error && res.data) { overrides = res.data; scheduleApply(); }
      });
  }

  function loadDrafts() {
    var c = client();
    if (!c || !isAdmin) return Promise.resolve();
    return c.from('copy_overrides')
      .select('id,route,original_text,new_text,occurrence,status,created_at')
      .eq('app', APP).in('status', ['draft', 'canonical'])
      .order('created_at', { ascending: false })
      .then(function (res) {
        if (!res.error && res.data) drafts = res.data;
      });
  }

  /* ── admin gate ───────────────────────────────────────────────────────────
   * Ask the DB the same question RLS asks. Per ADOPT.md step 3: no client-side
   * email allow-list fallback — a UI that thinks you're an admin while RLS
   * disagrees just shows you an editor where every save fails. */
  function checkAdmin() {
    var c = client();
    if (!c) return Promise.resolve(false);
    return c.rpc('is_app_admin', { target_app: APP })
      .then(function (res) { return !res.error && res.data === true; })
      .catch(function () { return false; });
  }

  /* ── editing ──────────────────────────────────────────────────────────── */

  function startEdit(el, item) {
    if (el.isContentEditable) return;
    var before = item.text;
    el.setAttribute('data-le-editing', '1');
    el.contentEditable = 'true';
    el.focus();

    function finish(save) {
      el.contentEditable = 'false';
      el.removeAttribute('data-le-editing');
      var after = norm(el.textContent);
      el.removeEventListener('blur', onBlur);
      el.removeEventListener('keydown', onKey);
      if (!save || after === before || !after) { el.textContent = item.node.nodeValue; return; }
      saveOverride(before, after, item.occurrence, el);
    }
    function onBlur() { finish(true); }
    function onKey(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); finish(true); el.blur(); }
      if (e.key === 'Escape') { e.preventDefault(); finish(false); el.blur(); }
    }
    el.addEventListener('blur', onBlur);
    el.addEventListener('keydown', onKey);
  }

  function saveOverride(original, next, occurrence, el) {
    var c = client();
    if (!c) return;
    c.auth.getUser().then(function (u) {
      var uid = u && u.data && u.data.user ? u.data.user.id : null;
      return c.from('copy_overrides').insert({
        app: APP,
        route: route(),
        original_text: original,
        new_text: next,
        occurrence: occurrence || 0,
        element_tag: el ? el.tagName.toLowerCase() : null,
        page_title: document.title,
        sample_url: location.href,
        status: 'draft',
        created_by: uid
      });
    }).then(function (res) {
      toast(res && res.error ? ('Save failed: ' + res.error.message) : 'Saved as draft');
      return loadDrafts().then(renderPanel);
    });
  }

  function onClick(e) {
    if (!editing) return;
    var el = e.target;
    if (!el || el.closest(SKIP_SELECTOR)) return;
    // Find the text node inside this element
    var nodes = walk();
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].node.parentElement === el) {
        e.preventDefault();
        e.stopPropagation();
        startEdit(el, nodes[i]);
        return;
      }
    }
  }

  /* ── §17a review: three answers, not two ─────────────────────────────── */

  function setStatus(row, status) {
    var c = client();
    if (!c) return;
    // R4: retired is never promotable. Enforced here and by nothing else in
    // this build, so it is not decorative.
    if (row.status === 'retired') { toast('Retired rows are not promotable.'); return; }
    var patch = { status: status, updated_at: new Date().toISOString() };
    if (status === 'canonical') patch.canonical_at = new Date().toISOString();
    c.from('copy_overrides').update(patch).eq('id', row.id).then(function (res) {
      toast(res.error ? ('Failed: ' + res.error.message) : ('Now ' + status));
      return Promise.all([loadCanonical(), loadDrafts()]).then(renderPanel);
    });
  }

  function dropRow(row) {
    var c = client();
    if (!c) return;
    c.from('copy_overrides').delete().eq('id', row.id).then(function (res) {
      toast(res.error ? ('Failed: ' + res.error.message) : 'Dropped');
      // A dropped canonical must stop being served, so revert live text too.
      return Promise.all([loadCanonical(), loadDrafts()]).then(function () {
        location.reload();
      });
    });
  }

  // R1/R2: the reviewer can rewrite, and only new_text moves.
  function reviseRow(row, next) {
    var c = client();
    if (!c || !next || next === row.new_text) return;
    c.from('copy_overrides').update({ new_text: next, updated_at: new Date().toISOString() })
      .eq('id', row.id).then(function (res) {
        toast(res.error ? ('Failed: ' + res.error.message) : 'Revised');
        return Promise.all([loadCanonical(), loadDrafts()]).then(renderPanel);
      });
  }

  /* ── chrome ───────────────────────────────────────────────────────────── */

  function toast(msg) {
    var t = document.getElementById('le-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'le-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.className = 'show';
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.className = ''; }, 2600);
  }

  function renderPanel() {
    var p = document.getElementById('le-panel');
    if (!p) return;
    if (!drafts.length) {
      p.innerHTML = '<h3>Live edits</h3><p class="le-none">No edits yet. ' +
        'Turn on Edit copy, click any sentence, type, press Enter.</p>';
      return;
    }
    p.innerHTML = '<h3>Live edits</h3>';
    drafts.forEach(function (row) {
      var d = document.createElement('div');
      d.className = 'le-row le-' + row.status;
      var was = document.createElement('div');
      was.className = 'le-was';
      was.textContent = row.original_text;
      var now = document.createElement('textarea');
      now.className = 'le-now';
      now.value = row.new_text;
      now.rows = 2;
      var meta = document.createElement('div');
      meta.className = 'le-meta';
      meta.textContent = row.status + ' · ' + row.route;

      var bar = document.createElement('div');
      bar.className = 'le-actions';

      // Three answers (§17a): take, drop, revise.
      if (row.status !== 'canonical') {
        var take = document.createElement('button');
        take.textContent = 'Publish';
        take.title = 'Serve this to every visitor now';
        take.onclick = function () { setStatus(row, 'canonical'); };
        bar.appendChild(take);
      }
      var rev = document.createElement('button');
      rev.textContent = row.status === 'canonical' ? 'Save & republish' : 'Revise';
      rev.onclick = function () { reviseRow(row, now.value.trim()); };
      bar.appendChild(rev);

      var drop = document.createElement('button');
      drop.className = 'le-drop';
      drop.textContent = 'Drop';
      drop.onclick = function () { dropRow(row); };
      bar.appendChild(drop);

      d.appendChild(meta); d.appendChild(was); d.appendChild(now); d.appendChild(bar);
      p.appendChild(d);
    });
  }

  function mountBar() {
    if (document.getElementById('le-bar')) return;
    var bar = document.createElement('div');
    bar.id = 'le-bar';
    bar.innerHTML =
      '<button id="le-toggle">Edit copy</button>' +
      '<button id="le-review">Review</button>';
    document.body.appendChild(bar);

    var panel = document.createElement('div');
    panel.id = 'le-panel';
    panel.hidden = true;
    document.body.appendChild(panel);

    document.getElementById('le-toggle').onclick = function () {
      editing = !editing;
      this.classList.toggle('on', editing);
      document.body.classList.toggle('le-editing', editing);
      this.textContent = editing ? 'Editing — click a sentence' : 'Edit copy';
    };
    document.getElementById('le-review').onclick = function () {
      panel.hidden = !panel.hidden;
      if (!panel.hidden) loadDrafts().then(renderPanel);
    };
    document.addEventListener('click', onClick, true);
  }

  /* SomaAuth.init() builds its Supabase client asynchronously, so calling
   * getClient() on the same tick returns null and every load below silently
   * no-ops — the failure mode is an override that exists in the database and
   * never appears on the page. Wait for the client instead of assuming it. */
  function whenClient(fn, tries) {
    tries = tries == null ? 100 : tries;   // ~5s at 50ms
    if (client()) return fn();
    if (tries <= 0) return;
    setTimeout(function () { whenClient(fn, tries - 1); }, 50);
  }

  function init() {
    new MutationObserver(scheduleApply)
      .observe(document.body, { childList: true, subtree: true, characterData: true });

    whenClient(function () {
      // Canonical overrides are public — apply them for every visitor, signed
      // in or not, before we know anything about admin status.
      loadCanonical();

      checkAdmin().then(function (ok) {
        isAdmin = ok;
        if (!ok) return;
        mountBar();
        return loadDrafts().then(renderPanel);
      });
    });
  }

  global.SomaLiveEdit = { init: init, apply: apply, route: route, _walk: walk };
})(window);
