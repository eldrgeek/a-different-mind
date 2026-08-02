# A Different Mind

**Live: https://a-different-mind.netlify.app**

A page for people who don't use AI and don't want to. A visitor picks the
objection that sounds like them — or writes their own — and talks to a host that
carries Mike Wolf's actual arguments, quoted, as his.

The host is instructed not to win.

> A person who leaves still declining AI, but feeling heard and respected, is a
> SUCCESS. A person who agrees because you wore them down is a FAILURE.
> — the system prompt, `netlify/functions/converse.js`

## Where the arguments come from

Not invented. Extracted from **144,531 diarized transcript segments** of Mike's
real conversations, 2026-07-07 → 2026-08-02, captured on the Fieldy pendant and
pulled with [`fieldy-cli`](../fieldy-cli). Windows were scored for AI-topic
density × personal-stance density; the top windows were read by hand.

Seven objection patterns came back with Mike's replies attached. See
[CORPUS.md](CORPUS.md) for every one, its date, what's true in it, and the
handling notes.

## Three decisions worth knowing before you edit this

**1. The sharpest argument is withheld by design.** Mike's claim that refusing to
engage with a non-human mind is a kind of racism is the reason this site exists.
It is also a *label*, and labels close the thing they're trying to open. The host
may only reach for it after the person's real reasons have been heard and when
what's left is refusal rather than an argument — and then it must stop and let
them reject it. The always-available form is the question, not the label: *have
you met one?*

**2. Four objections ship with no answer, on purpose.** Training-data theft, the
energy cost, privacy, and "I'm too old for this" are common in the wild and Mike
has not answered any of them on tape. The host says so plainly rather than
improvising in his voice. That gap is his queue.

**3. Objectors are never quoted.** Mike's words are verbatim — his to publish.
The people arguing back were recorded in ordinary conversation and did not
consent to a website, so their objections appear only as rewritten patterns.
Verbatim objector text and the audit mapping live in `private/`, which is
gitignored.

## Layout

```
index.html                       the page — doors, conversation UI, no build step
netlify/functions/converse.js    the host; system prompt is the real artifact here
CORPUS.md                        every argument + provenance + handling notes
llms.txt                         for AI readers
vendor/soma-feedback/            SOMA feedback chip (standard §8)
private/                         gitignored — objector verbatim + extraction scripts
```

Zero npm dependencies. Static publish, one serverless function.

## Running it

Needs `ANTHROPIC_API_KEY` in the Netlify site env. Per
`_estate/KEY-REFRESH-LEDGER.md` the live key is fingerprint `48a2ee43a65f`,
sourced from `~/.hermes/.env` — **not** the copy still sitting in
`silicon-children`'s env, which is the dead pre-07-26 key.

```bash
netlify deploy --prod --dir=.
python3 ~/Projects/SOMA/tools/ship/soma-ship-check.py https://a-different-mind.netlify.app
```

`git push origin main` auto-deploys.

## Editing the copy (SOMA §17 / §17a)

Sign in as an admin. A small **Edit copy** bar appears bottom-left.

1. **Edit copy** → click any sentence → type → **Enter**. Saved as a draft.
2. **Review** → each draft gets three answers, not two: **Publish** (serve it to
   everyone now), **Revise** (rewrite it right there — this is §17a's whole
   point), **Drop**.
3. Published rows are read by *every* visitor, signed in or not, before the page
   knows anything about who they are.

Storage is the shared `copy_overrides` table. It already was multi-app — RLS is
`is_app_admin(app)` and canonical rows are world-readable — so this adopted it
instead of forking a second one. **No migration was needed.**

Matched on `(app, route, original_text, occurrence)`, never a DOM selector. The
conversation thread is excluded from editing entirely: that's people talking,
not site copy.

## Invites

Signed in → footer → **Make an invite** → link + QR. It carries your name.

Without a name it still works and the arriving visitor is told, honestly, that
*"someone who didn't want to say who they were invited you here."* An anonymous
caller **cannot** claim someone else's name — the RPC drops any name it's handed
when `auth.uid()` is null. Verified.

Table: `site_invites`, RLS on with zero policies; both paths go through
`site_invite_create` / `site_invite_lookup`. The anon key can mint and read one
invite but cannot enumerate them.

## Known gaps and one judgment call

- **One line on the hosts page is mine, not Mike's.** His copy says one host
  "might be a human — or it might be an AI… you decide." Right now it is always
  an AI; the takeover path isn't built. Shipping that ambiguity to an audience
  selected for suspicion, with no caveat, seemed like the worst possible thing
  to be caught doing — so there's a short honesty note under How It Works
  (`#honesty-note`). **If Mike disagrees, it's one click to delete with the live
  editor.** The better fix is to build the takeover and make the line true.
- **The admin editor's write path is unverified.** Everything readable was tested
  live; saving a draft needs a real admin session, which needs Mike's login. The
  insert payload was validated against the real table separately.
- **Google sign-in will fail until the origin is registered** on GIS client
  `1072944905499-vm2v2i…`. Mike's console. Magic-link sign-in works now.
- **SOMA Auth allow-list is at 1948/2048 bytes** — 100 bytes of headroom for the
  whole estate. The next app to adopt SOMA Auth may not fit.
- **No demo video** (§7 wants a Lessig-style soma-cut film).
- **Other humans still can't add their own voices.** Mike asked for this — other
  people making similar points alongside him. Not built. Needs a decision from
  him first: curated or open?

---

Built 2026-08-02 by Mike Wolf + Claude (Opus 5, CCc).
