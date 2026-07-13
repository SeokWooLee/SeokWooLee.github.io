---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "The Principle of Least Astonishment: Why getUser Shouldn't Send an Email"
lang: en
description: "I once ran into a function like this during a code review."
header:
  og_image: /assets/images/posts/08667efa-56be-42a8-ba9a-412b0165801d/1.png
tags:
  - principle of least astonishment
  - POLA
  - naming conventions
  - side effects
  - code review
  - API design
  - clean code
  - software design principles
  - readability
  - programming best practices
permalink: /en/최소-놀람의-원칙-getUser가-메일을-보내면-안-되는-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/%EC%B5%9C%EC%86%8C-%EB%86%80%EB%9E%8C%EC%9D%98-%EC%9B%90%EC%B9%99-getUser%EA%B0%80-%EB%A9%94%EC%9D%BC%EC%9D%84-%EB%B3%B4%EB%82%B4%EB%A9%B4-%EC%95%88-%EB%90%98%EB%8A%94-%EC%9D%B4%EC%9C%A0/) · **English** · [日本語](/ja/%EC%B5%9C%EC%86%8C-%EB%86%80%EB%9E%8C%EC%9D%98-%EC%9B%90%EC%B9%99-getUser%EA%B0%80-%EB%A9%94%EC%9D%BC%EC%9D%84-%EB%B3%B4%EB%82%B4%EB%A9%B4-%EC%95%88-%EB%90%98%EB%8A%94-%EC%9D%B4%EC%9C%A0/) · [中文](/zh/%EC%B5%9C%EC%86%8C-%EB%86%80%EB%9E%8C%EC%9D%98-%EC%9B%90%EC%B9%99-getUser%EA%B0%80-%EB%A9%94%EC%9D%BC%EC%9D%84-%EB%B3%B4%EB%82%B4%EB%A9%B4-%EC%95%88-%EB%90%98%EB%8A%94-%EC%9D%B4%EC%9C%A0/)
{: .notice--info}

I once ran into a function like this during a code review.

It was called `getUser()`, but when I opened it up, it turned out to fetch the user, update their last-seen timestamp, refresh a cache, and even send a notification email if the account was dormant.

What if someone had seen the name, assumed "it's just a getter, so it must be safe," and called it inside a loop? Users would have gotten flooded with emails.

Today's principle is the one that catches code like this: the Principle of Least Astonishment. This continues the series on development principles I've been writing — KISS, DRY, YAGNI, SOLID — and this one has a fun name to start with.

<figure>
  <img src="/assets/images/posts/08667efa-56be-42a8-ba9a-412b0165801d/1.png" alt="A jack-in-the-box popping out of your code — never a welcome surprise">
  <figcaption>A jack-in-the-box popping out of your code — never a welcome surprise</figcaption>
</figure>

The Principle of Least Astonishment (POLA) says this:

> Code should behave the way the person reading it expects. If a design surprises the user, rethink that design.

It's an old principle that came out of systems design in the 1960s and 70s, but it's a general-purpose idea that applies just as much to UI design and API design as it does to everyday code.

---

## Why is astonishment a cost?

In programming, "astonishment" isn't an emotional problem — it's a cost problem.

When developers read code, they form hypotheses based on names and conventions as they go: `getUser` will just fetch data, `isValid` will return a boolean, and so on. When the code behaves the way the hypothesis predicts, it reads smoothly.

But the moment a hypothesis breaks, you have to stop reading and dive into the function to check what it actually does. Once a codebase has even ten functions like this, a kind of distrust sets in — "I can't trust names in this code" — and from then on you end up opening every function just to read it. Your reading speed gets cut in half.

The worst case is when someone doesn't even bother to check, writes code based on the assumed behavior, and it causes an outage — like the email flood above.

---

## Scenes where astonishment jumps out of the code

Let me lay out the patterns I've actually run into.

**1. A function whose name doesn't match its behavior**

```swift
// The name says "get," but it changes state internally
func getUser(id: Int) -> User {
    let user = db.find(id)
    user.lastSeenAt = Date()  // Surprise 1: side effect
    db.save(user)
    if user.isDormant {
        mailer.send(to: user.email, message: "Reactivation notice")  // Surprise 2: external call
    }
    return user
}
```

A write operation hiding inside a getter is the classic case of astonishment. `get` should only read; if it changes state, it needs a name like `update` or `touch`.

**2. Return values that betray convention**

If, within the same codebase, one function returns nil when it can't find something, another throws an exception, and yet another returns an empty object, then every caller has to gamble each time. It's important to pick one behavior and stick to it consistently.

**3. Silent failure**

```swift
func parseConfig(_ json: Data) -> Config {
    guard let config = try? JSONDecoder().decode(Config.self, from: json) else {
        return Config()  // Surprise: config is broken, but it silently returns an empty config as if nothing happened
    }
    return config
}
```

If a config file is broken and the code quietly falls back to defaults, the user is left suffering much later, wondering "why isn't my setting being applied?" Failing loudly is less astonishing than failing silently.

<figure>
  <img src="/assets/images/posts/08667efa-56be-42a8-ba9a-412b0165801d/2.png" alt="When the name and the behavior don't match, the reader pays for it">
  <figcaption>When the name and the behavior don't match, the reader pays for it</figcaption>
</figure>

---

## Tips for writing less astonishing code

Here's what I try to stick to.

| Tip | Description |
|------|------|
| The name is a contract | Do only what the name promises; if you need to do more, rename it |
| Follow convention | Don't deviate from the existing style of the language, framework, or team without a reason |
| Surface side effects | Make it obvious in the name when a function changes state |
| If you must surprise, document it | If unusual behavior is truly unavoidable, call it out loudly with comments and docs |

The second one is the most powerful. A boring, standard approach beats a clever, personal one every time, when you look at the team as a whole. That's exactly the same point I made in the KISS post — a plain loop beats a slick one-liner that looks impressive.

<figure>
  <img src="/assets/images/posts/08667efa-56be-42a8-ba9a-412b0165801d/3.png" alt="Boring, predictable code wins in the end">
  <figcaption>Boring, predictable code wins in the end</figcaption>
</figure>

---

## Wrapping up

There are three things to remember about the Principle of Least Astonishment.

- Code should behave the way names and conventions lead people to expect. Code that breaks those expectations is a breeding ground for bugs.
- Don't hide side effects inside getters, and don't let failures pass silently.
- Boring, predictable code beats clever code, on a team.

If I had to pick one single measure of good code, this would be it: code that doesn't surprise the person reading it.

If you've recently read some code and thought, "wait, why does this behave like this?" — that's exactly the scene of this principle being broken.
