# The premise, reconsidered

Mike, 2026-08-02: *"The more I think about it, the more I think that it's all about
trust… I'm willing to completely redo the premise if your research — or your thinking —
tells us that we should."*

It does. Here's the evidence, then the recommendation.

---

## 1. What the corpus actually says

Three findings from the 144,531 segments, 2026-07-07 → 08-02.

### Argument does not convert. Observably.

I searched the whole corpus for genuine concession moments — someone conceding ground
with AI as the live topic. Filtering out discourse-marker noise and Mike's own
"I'll give you an example" tic, there are **about six** in 144,531 segments.

And the strongest ones retreat inside the same breath:

> "That sounds interesting, and I'd be interested to use it, especially in my
> manufacturing work, **but** in order to get it to that point, a lot of issues would be
> caused…"

> "I'd be interested in that, **but** I'm not interested in paying for it… I'd rather
> spend my money on quality yarn."

> "I'll give you that I've seen way too many stories of people getting way too
> emotionally invested…" *(concedes, then re-objects)*

This is the highest-bandwidth persuasion channel that exists: Mike, in person, warm,
funny, well-informed, talking to people who like him, over four weeks, relentlessly.
Conversion rate approximately zero.

**A website is strictly worse than that channel.** No relationship, no warmth, no body,
no reciprocity, no ability to read the room. So the current premise — *present Mike's
counterarguments really well* — is optimizing a channel the data says doesn't work, and
doing it with less than Mike has in a kitchen.

That is the finding that should drive everything else.

### The one thing that moved someone was lowering the floor, not winning

The manufacturing engineer moved exactly once. Not when Mike explained the fleet, not on
the foreign-culture argument, not on trust-follows-experience. Here:

> "I wouldn't do that either. What I would do is have the AI do the mundane, boring,
> risk-free stuff that chews up people's time. Have it go through your email and triage
> it into piles. And then you go through it until you've got confidence."

She went from *"the bubble is about to pop"* to *"I'd be interested to use it."* Then
retreated on cost. But the movement was real, and it came from a **concrete, small,
reversible, low-stakes first action** — not from any claim about what AI is.

### The competence fear is absent from the corpus — and that is evidence *for* Mike's hunch, not against

I searched hard for *"I don't know what I'm doing and something bad will happen."*
**Zero hits** as an AI objection. Every match was noise.

Don't read that as falsification. Look at who is in this corpus: founders, scientists, a
PhD engineer, a manufacturing engineer, artists, Mark. **Articulate people who state
reasons.** And consider what it costs to say *"I feel out of my depth"* to a
seventy-year-old software guy who is visibly thrilled about AI. That admission is
status-expensive. What people say instead is *"I'd rather spend my money on yarn"* —
which is dignified, unanswerable, and ends the conversation without exposing anyone.

So: **the objections in the data are the socially safe ones.** They may be perfectly
sincere and still be the presentable version. The fear Mike is pointing at is invisible
*by construction* — the people who have it don't say it, and they especially don't say it
to him.

The corpus cannot confirm his hypothesis. Its shape supports it. I'd act on it.

---

## 2. Trust is three things, and one of them cuts against another

"How can you trust an AI" collapses three different problems with three different
remedies. Designing against the merged version will produce something that solves none.

| | The question | What it costs to answer |
|---|---|---|
| **Epistemic** | Can I believe what it tells me? | A *better* model. Mark's objection; hallucination; confident wrongness. |
| **Relational** | Will it treat me well, or work me? | Time, and a relationship with memory. Sycophancy; the boy who died; manipulation. |
| **Institutional** | Do I trust whoever is behind it? | Not being them. Training-data theft, energy, surveillance, "too much money at stake." |

**The tension Mike should see before choosing a hosted model:** self-hosting buys
institutional trust *at the direct cost of epistemic trust*. `mistral:latest` on the VPS
is more private, more ours, beholden to nobody — and measurably more likely to be wrong
than a frontier model. If the target user's core fear is *"something bad will happen
because I don't know what I'm doing,"* a weaker model makes bad things **more** likely.

**But the tension dissolves if the first contact is genuinely stakeless.** If nothing can
break, nothing is sent anywhere, there's no account and no bill, then epistemic accuracy
barely matters and institutional trust matters enormously. A hosted model is **right for
a first conversation and wrong for a second one.**

That's a real design principle, not a compromise: *start on our metal, graduate to a
frontier model once they want something done.* And say that out loud to them — "we
started you on the small one that lives on our own server, because nothing you say here
leaves it" is the single most trust-building sentence available, and it happens to be
true.

Good news: this is mostly built. `soma-infer` answers 200 at
`vpsmikewolf.duckdns.org/infer/ask`, and Ollama is active on the VPS with `mistral`.

---

## 3. The ranking Mike asked for

Not by loudness. By **tractability** — how much a single small accompanied experience can
move it — crossed with whether the holder is actually reachable.

### Tier A — lead with these. The objection is about an *experience*, so an experience answers it.

1. **"I don't know what I'm doing and I'm worried something bad will happen."**
   Unstated in the corpus, probably dominant in the world, and the highest-leverage item
   on the list **because nothing has to be argued.** It is answered entirely by a
   stakeless, accompanied first contact. You don't win it; you make it not apply.

2. **"I tried it. It was generic and it was wrong."**
   Mike's strongest card and the one place his corpus is genuinely persuasive — *you met
   the stupidest member of the family, and it had never heard of you.* Also not an
   argument: it's a rematch. Answerable by one better meeting.

### Tier B — reachable, but only after you concede first.

3. **"Not reliable enough for anything that matters."**
   Empirically the only objection that produced observable movement. Lower the floor;
   never argue the ceiling.

4. **"It sounds as certain when it's wrong as when it's right."**
   Mark's. Mike argued this one directly and *lost* — Mark was unmoved. But Mike's
   instinct there was right: he offered an **experiment** rather than a rebuttal. Hand
   them the test, not the answer.

### Tier C — do not recruit here.

5. **Jobs, training-data theft, energy, surveillance.** Mike has no recorded answer to
   three of the four. More importantly these aren't confusions — they're **positions**,
   often correct ones. Someone holding them isn't unconvinced; they're opposed on values.
   Respect that and leave them alone. Recruiting against a person's ethics is how you
   earn the reputation the whole project is trying to avoid.

6. **"I just don't want to talk to a machine."** The loudest and least movable. This is
   also where the racism argument lives — and its correct audience is *someone already in
   relationship with Mike who can absorb it*, never a stranger on a website.

**The current site leads with Tier C and treats Tier A as absent.** That's backwards, and
it's the direct consequence of building from the objections people *say* rather than the
ones that stop them.

---

## 4. Recommended premise

> **Not a debate. A first contact — stakeless, hosted on our own metal, accompanied by
> someone who already has their trust — and an honest ask for their help.**

Four changes, in order of importance:

**1. Reframe from defense to recruitment.** Mike's own words are the strongest thing in
this whole thread:

> *AI won't be ignored — there's too much power and money at stake. Which might make you
> feel helpless. But we believe we have a way to bend the arc by getting people like you
> involved. First we need to help you feel comfortable, and build trust.*

That's the premise. It is the **only** frame in which the visitor's wariness is an asset
instead of a deficit being corrected. It also fixes something quietly dishonest about the
current site: a page that insists it isn't trying to convince you, while being built
entirely out of counterarguments, *is* trying to convince you. The recruitment frame
doesn't have to pretend, because it's true.

It also changes the success metric from *did they concede* — which the data says
essentially never happens — to *did they contribute*, which is achievable on day one.

**2. Invite-only, and the inviter stays in the room.** Nobody trusts an AI on day one.
They already trust whoever sent them. **Trust is transferred, not argued**, and the invite
mechanism is therefore the actual product — the AI is downstream of it.

One correction to Mike's sketch: the inviter shouldn't administer a questionnaire. Being
interviewed about your objections by a friend who has already decided you're wrong is not
a warm opening. Make it a **pair**: the inviter is *present* for the first conversation
and is on the hook for how it goes. That turns a referral into an accompanied first visit,
which is what the trust transfer actually requires.

**3. First contact runs on our model, and we say so.** Stakeless by construction: no
account, nothing stored, nothing sent to a company, nothing to break. *"This one lives on
our server. Nothing you say here leaves it."* True, checkable, and it answers the
institutional third of trust outright — which is the third that money and power make
permanent.

**4. End with an ask, not a verdict.** They should leave with something *we* wanted from
them and got. Their objection, in their words, added to what we're building against. That
is a contribution, not a conversion, and it's the thing that makes the recruitment frame
honest rather than a rhetorical device.

---

## 5. What survives

Almost all of the machinery, none of the framing.

**Keep:** the invite + QR (it becomes central), identity-optional auth, live edit, the
ranking interaction (ranked issues are the raw material the inviter and the host both
need), the corpus itself, `soma-infer`, the arcade design.

**Change:** the landing frame, from *"which of these objections is yours"* to the appeal
for help. The host's job, from *carry Mike's counterarguments* to *be a stakeless first
AI experience that ends in an ask.* The model, to ours for first contact.

**Retire:** the objection-rebuttal structure as the spine of the site. The corpus stops
being the script and becomes what it should always have been — **evidence that Mike has
actually listened to people who disagree with him**, available to read, not deployed at
anyone.

---

## 6. What I need from Mike

1. **Go or no-go on the reframe.** This throws away the current spine. I think it's right
   and I think the data supports it, but it's your call, not mine.
2. **Who is the first invite for?** The design should be built against one real person you
   would actually send this to this week. Name them and the whole thing gets sharper.
3. **Curated or open** on other humans adding their voices — still outstanding from the
   original ask, and it matters more under the recruitment frame than it did before.

---

*Written 2026-08-02 by Claude (Opus 5, CCc) from the Fieldy corpus, at Mike Wolf's
invitation to redo the premise.*
