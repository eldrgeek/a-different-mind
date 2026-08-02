/* A Different Mind — flow, identity, invites, speech.
 *
 * Four stages: pick → rank → hosts → conversation. The pick stage is the
 * FIRST thing on the page by deliberate design (Mike's call): a wary visitor
 * gets an interaction, not a wall of persuasion. Everything explanatory —
 * who made this, how it works — is available but deferred until they've said
 * what's pushing them away.
 */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var SITE = location.origin;
  var APP = 'a-different-mind';

  var LABELS = {
    principle: "I'd rather spend my time and money elsewhere",
    tried:     "I tried it — generic and wrong",
    confidence:"It's as certain when wrong as when right",
    jobs:      "It's taking people's jobs",
    safety:    "Not reliable enough for anything that matters",
    kids:      "What screens did to a generation of kids",
    refuse:    "I don't want to talk to a machine",
    theft:     "Built on work taken from artists and writers",
    energy:    "The energy and water can't be worth it",
    privacy:   "One more thing harvesting everything about me",
    old:       "Too old for this, tired of being told I'll be left behind",
    own:       "In their own words"
  };

  // Objections Mike has no recorded answer for. The host is told to say so
  // rather than improvise in his voice — see CORPUS.md.
  var UNANSWERED = { theft: 1, energy: 1, privacy: 1, old: 1 };

  var picked = [];       // ordered list of keys
  var ownText = '';
  var messages = [];
  var busy = false;
  var inviterName = null;
  var wasInvited = false;

  /* ── stages ───────────────────────────────────────────────────────────── */
  function show(id) {
    ['stage-pick', 'stage-rank', 'stage-hosts', 'stage-convo'].forEach(function (s) {
      $(s).classList.toggle('on', s === id);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function checked() {
    return Array.prototype.slice
      .call(document.querySelectorAll('#picks input:checked'))
      .map(function (i) { return i.value; });
  }

  /* Cap at five. Mike checked all eleven, then had a list too long to sort —
   * which is the failure mode: an unranked pile is the same as no answer.
   * Five is enough to have a real conversation about and short enough to
   * actually order. The free-text box counts toward the five. */
  var MAX_PICKS = 5;

  function slotsUsed() {
    return checked().length + ($('own-text').value.trim() ? 1 : 0);
  }

  function refreshNext() {
    ownText = $('own-text').value.trim();
    var used = slotsUsed();
    var full = used >= MAX_PICKS;

    // Lock the unchecked boxes at the cap rather than silently ignoring a
    // click — a checkbox that does nothing when you click it reads as broken.
    document.querySelectorAll('#picks input').forEach(function (i) {
      i.disabled = full && !i.checked;
      i.closest('label').classList.toggle('locked', i.disabled);
    });
    $('own-text').disabled = full && !ownText;

    $('counter').textContent = used + ' of ' + MAX_PICKS;
    $('counter').classList.toggle('full', full);
    $('to-rank').disabled = !used;
    $('pick-hint').textContent = !used
      ? 'Pick at least one, or write your own.'
      : (full ? "That's five. Uncheck one if you'd rather swap it out." : '');
  }

  document.querySelectorAll('#picks input').forEach(function (i) {
    i.addEventListener('change', refreshNext);
  });
  $('own-text').addEventListener('input', refreshNext);

  /* ── ranking ──────────────────────────────────────────────────────────── */
  function labelFor(key) { return key === 'own' ? ownText : LABELS[key]; }

  function renderRanked() {
    var ol = $('ranked');
    ol.innerHTML = '';
    picked.forEach(function (key) {
      var li = document.createElement('li');
      li.setAttribute('data-key', key);
      li.tabIndex = 0;
      li.setAttribute('role', 'listitem');
      li.setAttribute('aria-label', labelFor(key) + ' — drag to reorder, or use arrow keys');

      var grip = document.createElement('span');
      grip.className = 'grip';
      grip.setAttribute('aria-hidden', 'true');
      grip.textContent = '⠿';
      li.appendChild(grip);

      var txt = document.createElement('span');
      txt.className = 'txt';
      txt.setAttribute('data-no-edit', '');   // visitor's own words, not site copy
      txt.textContent = labelFor(key);
      li.appendChild(txt);

      ol.appendChild(li);
    });
  }

  function announce(key) {
    var i = picked.indexOf(key);
    $('rank-live').textContent = labelFor(key) + ' — now ' + (i + 1) + ' of ' + picked.length;
  }

  function move(from, to) {
    if (to < 0 || to >= picked.length || from === to) return;
    var key = picked.splice(from, 1)[0];
    picked.splice(to, 0, key);
    renderRanked();
    var el = document.querySelector('#ranked li[data-key="' + key + '"]');
    if (el) el.focus();
    announce(key);
  }

  /* Drag with POINTER events, not HTML5 drag-and-drop. Native DnD does not
   * fire on touch at all, and a good half of the people this page is for will
   * open it on a phone from a text message. Pointer events cover mouse, touch
   * and pen with one path. Keyboard reordering stays available because
   * dragging is not accessible on its own. */
  var drag = null;

  $('ranked').addEventListener('pointerdown', function (e) {
    var li = e.target.closest('li');
    if (!li) return;
    drag = { li: li, key: li.getAttribute('data-key'), startY: e.clientY, moved: false };
    li.setPointerCapture(e.pointerId);
    li.classList.add('dragging');
  });

  $('ranked').addEventListener('pointermove', function (e) {
    if (!drag) return;
    if (!drag.moved && Math.abs(e.clientY - drag.startY) < 4) return;  // ignore a plain tap
    drag.moved = true;
    e.preventDefault();

    var rows = Array.prototype.slice.call($('ranked').children);
    var over = rows.find(function (r) {
      if (r === drag.li) return false;
      var b = r.getBoundingClientRect();
      return e.clientY >= b.top && e.clientY <= b.bottom;
    });
    if (!over) return;

    var from = rows.indexOf(drag.li);
    var to = rows.indexOf(over);
    // Move in the DOM only; `picked` is committed on pointerup so a drag that
    // is abandoned mid-flight cannot leave the model half-reordered.
    $('ranked').insertBefore(drag.li, from < to ? over.nextSibling : over);
  });

  function endDrag(e) {
    if (!drag) return;
    var li = drag.li, key = drag.key, moved = drag.moved;
    li.classList.remove('dragging');
    try { li.releasePointerCapture(e.pointerId); } catch (_) {}
    drag = null;
    if (!moved) { li.focus(); return; }
    picked = Array.prototype.slice.call($('ranked').children)
      .map(function (r) { return r.getAttribute('data-key'); });
    renderRanked();
    var el = document.querySelector('#ranked li[data-key="' + key + '"]');
    if (el) el.focus();
    announce(key);
  }
  $('ranked').addEventListener('pointerup', endDrag);
  $('ranked').addEventListener('pointercancel', endDrag);

  $('ranked').addEventListener('keydown', function (e) {
    var li = e.target.closest('li');
    if (!li) return;
    var i = picked.indexOf(li.getAttribute('data-key'));
    if (e.key === 'ArrowUp')   { e.preventDefault(); move(i, i - 1); }
    if (e.key === 'ArrowDown') { e.preventDefault(); move(i, i + 1); }
    if (e.key === 'Home')      { e.preventDefault(); move(i, 0); }
    if (e.key === 'End')       { e.preventDefault(); move(i, picked.length - 1); }
  });

  $('to-rank').addEventListener('click', function () {
    picked = checked();
    if (ownText) picked.push('own');
    renderRanked();
    show('stage-rank');
  });
  $('back-to-pick').addEventListener('click', function () { show('stage-pick'); });
  $('to-hosts').addEventListener('click', function () { show('stage-hosts'); });
  $('back-to-rank').addEventListener('click', function () { show('stage-rank'); });

  /* ── conversation ─────────────────────────────────────────────────────── */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function add(role, text) {
    var w = el('div', 'msg ' + (role === 'user' ? 'you' : 'host'));
    w.appendChild(el('div', 'who', role === 'user' ? 'YOU' : 'HOST'));
    String(text).split(/\n\n+/).forEach(function (p) {
      if (p.trim()) w.appendChild(el('p', null, p.trim()));
    });
    $('thread').appendChild(w);
    w.scrollIntoView({ behavior: 'smooth', block: 'end' });
    return w;
  }

  function opener() {
    var top = picked[0];
    var label = top === 'own' ? ownText : LABELS[top];
    var rest = picked.length - 1;

    if (!top) {
      return "Go ahead — what's pushing you away? Say it however it actually sits in your head, not the tidy version.";
    }
    if (top === 'own') {
      return 'You wrote: "' + ownText + '"\n\nSay more about that. I want the version you\'d tell a friend, not the version you\'d defend in an argument.';
    }
    var lines = {
      principle: "You put that first — you'd rather spend your time and money elsewhere. That's a real position and I'm not going to argue you out of it. What would you rather be spending it on? I'm curious, not setting up a pitch.",
      tried:     "Top of your list: you tried it and it was generic and wrong. What did you try, and what did you ask it? Mike's whole answer to this one hinges on which thing you actually met.",
      confidence:"Top of your list: it sounds just as certain when it's wrong. That's the objection Mike gets from the smartest people he knows, and he doesn't have a clean rebuttal. What happened — did it get something wrong on you?",
      jobs:      "Jobs first. Whose job? I'd rather talk about the actual one you're thinking of than the general argument.",
      safety:    "Reliability first. What do you work on? This one depends completely on the domain, and Mike mostly agrees with the people who raise it.",
      kids:      "You put the kids first. That's not a paranoid read — that's someone who watched it happen and drew the obvious conclusion. Tell me what you saw.",
      refuse:    "Top of the list: you don't want to talk to a machine. Okay. That's allowed and I'm not going to poke at it. Is it the talking-to-a-machine part specifically, or something underneath that?",
      theft:     "Theft first. I'll tell you up front that Mike has no recorded answer to this one, so I won't be putting words in his mouth. But I want to hear yours. Where does it bite hardest for you?",
      energy:    "Energy first. Mike hasn't answered this one on record, so I'm not going to invent a position for him. Tell me how you weigh it and I'll be straight about where he's silent.",
      privacy:   "Privacy first. Another one Mike hasn't answered on tape — I'll say so rather than improvise. What's the specific thing you don't want harvested?",
      old:       "You put that first, and I want to say: being told you'll be left behind is a lousy way to be recruited to anything. Mike hasn't answered this one on record either. What does 'too old for this' actually feel like from inside?"
    };
    var line = lines[top] || "Let's start there.";
    if (rest > 0) {
      line += '\n\n(You flagged ' + rest + ' other' + (rest > 1 ? 's' : '') +
        '. We\'ll get to them if you want — no rush.)';
    }
    return line;
  }

  function startConvo() {
    show('stage-convo');
    if (messages.length) return;
    var o = opener();
    add('assistant', o);
    messages.push({ role: 'assistant', content: o });
    speak(o);
    $('input').focus();
  }

  $('to-convo').addEventListener('click', startConvo);

  function setBusy(v) {
    busy = v;
    $('send').disabled = v;
    $('input').disabled = v;
  }

  $('input').addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 192) + 'px';
  });
  $('input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('form').requestSubmit(); }
  });

  $('form').addEventListener('submit', async function (e) {
    e.preventDefault();
    if (busy) return;
    var text = $('input').value.trim();
    if (!text) return;

    add('user', text);
    messages.push({ role: 'user', content: text });
    $('input').value = '';
    $('input').style.height = 'auto';
    setBusy(true);

    var pending = add('assistant', '…');
    pending.querySelector('p').className = 'thinking';

    try {
      var res = await fetch('/.netlify/functions/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
          door: picked[0] || 'other',
          ranked: picked,
          own: ownText,
          unanswered: picked.filter(function (k) { return UNANSWERED[k]; }),
          invitedBy: wasInvited ? (inviterName || '__anonymous__') : null
        })
      });
      var data = await res.json();
      pending.remove();
      if (!res.ok || data.error) {
        add('assistant', 'Something broke on my end — not your problem. Try again in a moment?')
          .querySelector('p').className = 'err';
        console.error(data.error);
      } else {
        add('assistant', data.reply);
        messages.push({ role: 'assistant', content: data.reply });
        speak(data.reply);
      }
    } catch (err) {
      pending.remove();
      add('assistant', "I couldn't reach the host. Check your connection and try again?")
        .querySelector('p').className = 'err';
      console.error(err);
    } finally {
      setBusy(false);
      $('input').focus();
    }
  });

  $('restart').addEventListener('click', function () {
    messages = []; picked = []; ownText = '';
    $('thread').innerHTML = '';
    document.querySelectorAll('#picks input').forEach(function (i) {
      i.checked = false; i.disabled = false;
    });
    $('own-text').value = '';
    $('own-text').disabled = false;
    refreshNext();
    stopSpeaking();
    show('stage-pick');
  });

  /* ── speech out (browser-native; no key, no third party) ───────────────── */
  var ttsOn = false;
  function stopSpeaking() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }
  function speak(text) {
    if (!ttsOn || !window.speechSynthesis) return;
    stopSpeaking();
    var u = new SpeechSynthesisUtterance(String(text).slice(0, 4000));
    u.rate = 1.02; u.pitch = 1;
    window.speechSynthesis.speak(u);
  }
  $('opt-tts').addEventListener('change', function () {
    ttsOn = this.checked;
    if (!ttsOn) stopSpeaking();
  });
  if (!window.speechSynthesis) {
    $('opt-tts').closest('label').style.display = 'none';
  }

  /* ── speech in ────────────────────────────────────────────────────────── */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var rec = null, listening = false;

  if (!SR) {
    $('opt-stt').closest('label').style.display = 'none';
  }

  $('opt-stt').addEventListener('change', function () {
    $('mic').hidden = !this.checked;
  });

  $('mic').addEventListener('click', function () {
    if (!SR) return;
    if (listening) { rec && rec.stop(); return; }
    rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.continuous = true;
    var base = $('input').value;
    rec.onstart = function () { listening = true; $('mic').classList.add('live'); };
    rec.onend = function () { listening = false; $('mic').classList.remove('live'); };
    rec.onerror = function () { listening = false; $('mic').classList.remove('live'); };
    rec.onresult = function (e) {
      var s = '';
      for (var i = e.resultIndex; i < e.results.length; i++) s += e.results[i][0].transcript;
      $('input').value = (base ? base + ' ' : '') + s;
    };
    rec.start();
  });

  /* ── identity (optional, always) ──────────────────────────────────────── */
  var currentUser = null;

  function renderAuth() {
    var inn = !!currentUser;
    $('signin-link').hidden = inn;
    $('signout-link').hidden = !inn;
    $('whoami').hidden = !inn;
    $('invite-panel').hidden = !inn;
    if (inn) {
      $('signin-panel').hidden = true;
      $('whoami').textContent = currentUser.email || 'signed in';
      if (!$('inviter-name').value) {
        var m = currentUser.user_metadata || {};
        $('inviter-name').value = m.full_name || m.name ||
          (currentUser.email ? currentUser.email.split('@')[0] : '');
      }
    }
  }

  if (window.SomaAuth) {
    SomaAuth.onAuthStateChange(function (evt, session) {
      currentUser = session && session.user ? session.user : null;
      renderAuth();
    });
    SomaAuth.init();
    if (window.SomaLiveEdit) SomaLiveEdit.init();
  }

  $('signin-link').addEventListener('click', function () {
    $('signin-panel').hidden = !$('signin-panel').hidden;
    if (!$('signin-panel').hidden) $('email-input').focus();
  });
  $('signout-link').addEventListener('click', function () { SomaAuth.signOut(); });

  $('magic-btn').addEventListener('click', function () {
    var email = $('email-input').value.trim();
    if (!email) { $('signin-status').textContent = 'Enter your email first.'; return; }
    $('signin-status').textContent = 'Sending…';
    SomaAuth.signInWithOtp(email, {
      emailRedirectTo: SITE + '/',
      data: { site_name: 'A Different Mind' }
    }).then(function (r) {
      $('signin-status').textContent = r.error
        ? 'Could not send the link: ' + r.error.message
        : 'Check your email — the link brings you back here.';
    });
  });

  $('google-btn').addEventListener('click', function () {
    SomaAuth.signInWithOAuth('google', { redirectTo: SITE + '/' });
  });

  /* ── invites ──────────────────────────────────────────────────────────── */
  $('create-invite-btn').addEventListener('click', function () {
    var name = $('inviter-name').value.trim();
    $('invite-status').textContent = 'Creating…';
    SomaAuth.getClient().rpc('site_invite_create', { p_app: APP, p_name: name || null })
      .then(function (res) {
        if (res.error) {
          $('invite-status').textContent = 'Could not create the invite: ' + res.error.message;
          return;
        }
        var url = SITE + '/?inv=' + res.data;
        $('invite-status').textContent = name
          ? 'Ready. This invite says ' + name + ' sent it.'
          : 'Ready — but with no name on it, they\'ll be told someone who didn\'t want to say who they were invited them. Add your name if you\'d rather it carried weight.';
        $('qr-wrap').hidden = false;
        $('invite-url').textContent = url;
        try {
          QRCode.toCanvas($('qr-canvas'), url, { width: 200, margin: 1 }, function (err) {
            if (err) {
              $('qr-canvas').hidden = true;
              $('invite-status').textContent += ' (QR could not render — the link works.)';
            }
          });
        } catch (e) {
          $('qr-canvas').hidden = true;
        }
        $('copy-invite-btn').onclick = function () {
          var b = this;
          navigator.clipboard.writeText(url).then(function () {
            b.textContent = 'Copied ✓';
            setTimeout(function () { b.textContent = 'Copy link'; }, 1500);
          });
        };
      });
  });

  /* ── invited arrival ──────────────────────────────────────────────────── */
  var token = new URLSearchParams(location.search).get('inv');
  if (token) {
    wasInvited = true;
    var wait = setInterval(function () {
      var c = window.SomaAuth && SomaAuth.getClient();
      if (!c) return;
      clearInterval(wait);
      c.rpc('site_invite_lookup', { p_app: APP, p_token: token }).then(function (res) {
        var b = $('invited');
        b.hidden = false;
        b.setAttribute('data-no-edit', '');
        if (res.error || !res.data || !res.data.length) {
          b.textContent = "That invite link isn't one we recognize — it may be mistyped or withdrawn. " +
            "Everything here works without it.";
          wasInvited = false;
          return;
        }
        var name = res.data[0].inviter_name;
        b.innerHTML = '';
        if (name) {
          inviterName = name;
          var s = document.createElement('strong');
          s.textContent = name;
          b.appendChild(s);
          b.appendChild(document.createTextNode(
            ' invited you here. Which means they had their reasons — and probably a specific ' +
            'conversation with you in mind. You can ask them. In the meantime: what would you ' +
            'have told them?'));
        } else {
          b.appendChild(document.createTextNode(
            'Someone who didn\'t want to say who they were invited you here. ' +
            'Make of that what you like — it might be shyness, it might be that they ' +
            'thought the argument should stand on its own. Either way, you\'re under no ' +
            'obligation to anybody.'));
        }
      });
    }, 50);
  }

  refreshNext();
})();
