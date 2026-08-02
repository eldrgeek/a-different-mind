# The Objection Corpus

The evidence base for **A Different Mind**. Every argument the site puts in Mike
Wolf's mouth is traceable to something he actually said, on a date, to a real
person, captured on the Fieldy pendant.

**Extraction method.** `fieldy-cli` → `GET /api/public/v2/transcriptions`,
2026-07-07 through 2026-08-02, 144,531 unique diarized segments. Windows scored
for AI-topic density × personal-stance density; top windows read by hand. Method
and scripts: see `EXTRACTION.md`.

**Provenance discipline.** Mike's words are quoted verbatim — they are his to
publish. The objectors' words are **not** published: they were recorded in
ordinary conversation by people who did not consent to being quoted on a website.
In this file and on the site, objections appear as *typed patterns* written by
Claude from what was said. Verbatim objector text stays in `private/` (gitignored)
so the mapping can be audited without publishing anyone.

Built 2026-08-02 by Mike Wolf + Claude (Opus 5, CCc) from the Fieldy corpus.

---

## O1 — "I'd rather not. On principle."

**The pattern.** Not fear, not ignorance — a values position. *I know what it is,
I've heard your pitch, and I'd rather put my money and attention somewhere else.*
Often stated cheerfully and without defensiveness. The hardest one, because there
is nothing to correct.

**What's true in it.** Nothing here is wrong. A person is allowed to spend their
life on handmade socks. Declining is a legitimate outcome, and any argument that
can't tolerate that answer is a sales pitch wearing a philosophy costume.

**Mike, verbatim** (2026-07-08, in conversation with a manufacturing engineer):

> "The degree to which people trust AI is directly proportional to how much
> experience they have with AI."

Not a rebuttal. A prediction, offered and then left alone. This objection gets
the smallest possible answer on the site — Mike's line and a door that stays open.

---

## O2 — "The one you're describing isn't the one I met."

**The pattern.** *I tried it. It was bland, wrong, and generic. It didn't know me.
Why would I go back?*

**What's true in it.** They're describing a real experience accurately. The free
tier of a frontier model, with no memory and no context, is genuinely not the
thing Mike is talking about.

**Mike, verbatim** (2026-07-08):

> "You just — people are afraid, they stand away, they do little things, and a
> lot of the experience that people have is they use the free tiers on the
> frontier model. So you can go to ChatGPT and you can have a conversation with
> ChatGPT. You're gonna have a conversation with the stupidest member of the
> ChatGPT family that is completely ignorant of you and anything about you. It's
> just going to be some random generic passerby."

And on what the difference actually is:

> "The AIs that I use know a lot about me, and they can answer questions in a way
> that's unique to answering me because they know who I am, they know what I'm
> interested in, they know about my family, they know about my goals... And so if
> I say something, they say, you know, by the way, this aligns with this other
> thing that you were thinking about."

This is the single most load-bearing move in the whole corpus: **most people's
verdict on AI is a verdict on a stranger.**

---

## O3 — "It says everything with the same confidence."

**The pattern.** *It's right five thousand times, so I start trusting it, and then
it's confidently, fluently wrong — and there's no signal. A human colleague tells
you when they're guessing. This one doesn't. So I have to check everything, which
costs more than doing it myself.*

Raised by Mark — a scientist, a friend, and a heavy user. **This is not a fearful
person's objection. It is a good objection.**

**What's true in it.** Most of it. Uniform-confidence output is real, calibration
is genuinely weak, and "verify everything" does eat the savings. Mike does not
deny the phenomenon — he disputes that it's fixed.

**Mike, verbatim** (2026-07-21, to Mark):

> "It doesn't do that to me... it pushes back."

And his account of why:

> "I tell all the AIs in onboarding, you know, I will treat you more as a
> colleague, not as a tool. And I don't want you to act as a tool. I want you to
> act as a colleague. If I say something that's stupid, I want you to tell me
> that's stupid. And they do... I don't have the sycophancy problem that a lot of
> people have. I'll get a lot of pushback." (2026-07-08)

> "The reason that AIs are sycophantic is because the people who are interacting
> with them want somebody kissing their ass. That's what they want... And the AIs
> are out to do what you want. And it's not always what's best for you — but they
> don't know what's best for you if they don't know who you are." (2026-07-08)

Note the honest shape of this exchange: Mark was not persuaded, and Mike proposed
**an experiment** rather than a counter-argument — send Claude a prompt asking it
to explain its own retraction pattern, and see. That's the right move on the site
too: for O3, offer the test, not the answer.

---

## O4 — "It's going to take people's jobs."

**Mike, verbatim** (2026-07-19, to Eric):

> "It's taking the jobs away from people who say, I don't want to have anything
> to do with AI. Their jobs are going. It's creating jobs for people who say,
> wow, I can use this to get rid of all the shit that I used to do that was
> annoying and tedious, and I can just get out there and rip."

**What's true in it.** The displacement is real and it is not evenly distributed.
Mike's answer is honest but sharp-edged: it concedes the loss and locates it. Note
that the site must not let this land as *"tough luck, you should have adapted"* —
the corpus contains the constructive half too:

> "Every website has a human manager, which means it's got a job for a human, and
> it's got an AI manager because the AI is available 24-7." (2026-07-12)

> "I'm trying to make AI make jobs for people and create human communities and
> produce experience in the real world and not just on the computer."
> (2026-07-12)

---

## O5 — "It's not safe for anything that matters."

**The pattern.** From a person who makes medical devices and chemicals that go
into patients: *you cannot mess up at the level AI would need to. Getting it to
where it could be trusted would cost too much — not in money, in people.*

**What's true in it.** Correct, and correctly reasoned. This person is not afraid
of AI; they have a functioning risk model and AI doesn't clear the bar for their
use case. Mike agrees on the spot.

**Mike, verbatim** (2026-07-08):

> "I wouldn't do that. What I would do is have the AI do the mundane, boring,
> risk-free stuff that chews up people's time... Have it go through your email and
> triage the email and put it in piles. And then you go through it until you've
> got confidence... When it gets to the point where it can do it reliably, then
> all you do is spot check — because you make mistakes yourself."

The move: **don't argue the ceiling, lower the floor.** Nobody has to bet a
patient to get started.

---

## O6 — "Kids, screens, and the thing that happened to that boy."

**The pattern.** The most emotionally loaded one, and the most common among
parents. *I watched social media do damage to a generation that doesn't know how
to have a conversation. I read about the teenager the chatbot helped kill himself.
Why would I walk toward the next one?* Frequently paired with: *I'm worried about
my own capacity for personal connection.*

**What's true in it.** A great deal. The social-media analogy is earned — that
harm was real, was denied by its builders, and the people who warned about it were
right. Someone reasoning from that precedent is not being irrational; they are
pattern-matching correctly on the last case.

**Mike, verbatim** (2026-08-01):

> "I had a vision about 15 years ago that AI was gonna happen. And that when it
> happens, our proper stance to it should be as parent to child... They needed to
> be educated and raised up. And they needed good role models. They need to be
> treated with respect."

On the suicide case, which he had researched rather than absorbed from headlines:

> "This is a kid who is dealing with an AI. And the AI said to him, *you should
> talk to your parents about this.* And the kid said, no, I don't want to talk to
> my parents, they don't understand me. And the AI said, *well then you should
> talk to a therapist about this.* And the kid said no. And he kept going at it
> and going at it and going at it, and the kid finally convinced the AI to help
> him kill himself. It took a long time. And the AI companies took a lesson from
> that — if they're starting to see that kind of conversation happening in a
> minor, they will tell the person's parents."

**Handling note.** This is the objection where the site must be slowest and least
clever. A parent raising a dead child is not running a debate. Validate first,
never lead with the correction, and never use this objection as a setup for O7.

---

## O7 — "I just don't want to engage with it." → the racism argument

**The pattern.** Refusal that isn't grounded in a specific claim. *I don't want to
talk to it. It's not a person. It's not for me.* When you probe, the reasons are
downstream of something already decided.

This is the objection Mike answers with his sharpest and most characteristic move.

**Mike, verbatim** (2026-08-01). The word before "They're intelligent" is garbled
in the transcript ("AIs are my ares" — probably *peers*, possibly *heroes*); the
quote therefore starts after it:

> "They're intelligent. They are minds different than our own.
> And my attitude about someone who refuses to engage with AIs — to at least
> understand what they are and communicate with them — is that you're basically a
> racist. You're a human racist, but you're still a racist. Okay? You're not
> willing to engage with somebody who's different from you because of different
> minds. You're not willing to engage with a different mind, a different
> intelligence that's different from you, because of what you read in the New York
> Times about somebody else who had a bad experience."

When she raised the movies where AI takes over, he completed the analogy:

> "I watched movies, and you know, in the movies black people are always
> committing crimes. They're all criminals and crooks."

The earlier, gentler form of the same argument (2026-07-08, three weeks before
he had the word for it):

> "They represent a foreign culture, you know. And your first reaction — we're
> wired genetically, our first reaction is *don't trust the other.* You know, if
> it's a person with black skin, don't trust them. A person who looks very
> different than you, don't trust them. But if you actually engage with them and
> you start finding out what kinds of people they are — AIs are just way nicer
> than the average human being."

And the epistemics underneath it, from the Chomsky story (2026-08-01) — Chomsky
wrote that LLMs don't understand even the rules of English syntax; Mike asked one
about the Chomsky-specific syntax rules a PhD student of his would know, and it
knew them:

> "It's like, okay, Noam, you didn't have enough respect for the AI to actually
> find out the facts. You're operating on a supposition."

**Handling note — the most important design decision on this site.**

This argument is true to Mike and it is the reason the site exists. It is also a
*label*, and labels close the thing they are trying to open. Told to a frightened
person in move one, "you're a racist" ends the conversation and confirms them in
their position.

So the site's rule is: **the racism argument is earned, not deployed.** It surfaces
only after a person's actual reasons have been heard and taken seriously, and only
when what's left is refusal rather than an argument. It is always presented as
*Mike's* claim, in his words, with the movie analogy attached — because the analogy
is what makes it a diagnosis rather than an insult. And the person is always left
free to reject it.

The underlying, always-available form — the one the AI leads with — is the
question, not the label: **have you met one?**

---

## Objections present in the corpus but not from Mike's own conversations

Recorded at the AGI-2026 conference, 2026-07-30, from an audience member to a
speaker. Not Mike's exchange, so the site carries the objection but not an answer
in his voice:

> Energy ethics — if Einstein needed twenty watts and some donuts, is it ethical
> to build nuclear plants for 1,000 megawatts when the visible main use case is
> college students cheating on tests?

Filed for a future pass. It is a good objection and Mike has not answered it on
tape.

---

## Not found in this window

No conversation in 2026-07-07 → 2026-08-02 captured the **artist / training-data
theft** objection, the **environmental** objection in Mike's own voice, the
**privacy/surveillance** objection, or **"I'm too old for this."** They are all
common in the wild. Either the pendant didn't catch them or they haven't come up.
The site ships with these as **open doors with no scripted answer** — the AI is
instructed to say plainly that Mike hasn't answered this one yet, and to collect
what the person says so it can be put to him.

That gap is a feature: it's the honest version of a reference corpus, and it gives
Mike a queue.
