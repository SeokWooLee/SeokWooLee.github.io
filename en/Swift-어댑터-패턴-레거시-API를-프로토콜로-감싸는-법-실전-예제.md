---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "The Swift Adapter Pattern: How to Wrap Legacy APIs in a Protocol (A Practical Example)"
lang: en
description: "Have you ever felt stuck with legacy API code — you can't delete it, but you can't keep using it as-is either?"
header:
  og_image: /assets/images/posts/3b1d42e6-5160-4f01-904f-89f82dbb29bc/1.png
tags:
  - Swift
  - AdapterPattern
  - DesignPatterns
  - iOSDevelopment
  - LegacyRefactoring
  - ProtocolOrientedProgramming
  - SwiftProtocols
  - iOSDeveloper
  - CodeRefactoring
permalink: /en/Swift-어댑터-패턴-레거시-API를-프로토콜로-감싸는-법-실전-예제/
toc: true
toc_sticky: true
last_modified_at: 2026-07-16
---

🌐 [한국어](/Swift-%EC%96%B4%EB%8C%91%ED%84%B0-%ED%8C%A8%ED%84%B4-%EB%A0%88%EA%B1%B0%EC%8B%9C-API%EB%A5%BC-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%EB%A1%9C-%EA%B0%90%EC%8B%B8%EB%8A%94-%EB%B2%95-%EC%8B%A4%EC%A0%84-%EC%98%88%EC%A0%9C/) · **English** · [日本語](/ja/Swift-%EC%96%B4%EB%8C%91%ED%84%B0-%ED%8C%A8%ED%84%B4-%EB%A0%88%EA%B1%B0%EC%8B%9C-API%EB%A5%BC-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%EB%A1%9C-%EA%B0%90%EC%8B%B8%EB%8A%94-%EB%B2%95-%EC%8B%A4%EC%A0%84-%EC%98%88%EC%A0%9C/) · [中文](/zh/Swift-%EC%96%B4%EB%8C%91%ED%84%B0-%ED%8C%A8%ED%84%B4-%EB%A0%88%EA%B1%B0%EC%8B%9C-API%EB%A5%BC-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%EB%A1%9C-%EA%B0%90%EC%8B%B8%EB%8A%94-%EB%B2%95-%EC%8B%A4%EC%A0%84-%EC%98%88%EC%A0%9C/)
{: .notice--info}

Have you ever felt stuck with legacy API code — you can't delete it, but you can't keep using it as-is either?

Hooking up an old networking module to a new screen is a wall everyone runs into eventually.

The short answer: the cleanest fix is to wrap the legacy API in a protocol (an interface) and put an adapter in between.

The adapter pattern works by slotting a "converter" between two interfaces that don't quite fit each other.

Today, let's walk through how to apply this in Swift, following the exact flow of putting it into practice.

<figure>
  <img src="/assets/images/posts/3b1d42e6-5160-4f01-904f-89f82dbb29bc/1.png" alt="The Swift adapter pattern: putting a converter between legacy and new code">
  <figcaption>The Swift adapter pattern: putting a converter between legacy and new code</figcaption>
</figure>

---

## Three Things You'll Take Away From This Post

For anyone short on time, here's the summary up front.

1. Define, as a protocol, the shape the new code actually wants
2. Build an adapter type that converts the legacy API to match that protocol
3. Make your screens and view models depend only on the protocol, never on the legacy code directly

Sticking to just these three points dramatically shrinks the blast radius the next time you need to swap out the API entirely.

Once a codebase switches to this structure, writing tests becomes noticeably easier.

---

## Why Do You Need the Swift Adapter Pattern?

Legacy APIs usually don't come in the shape you want.

They're callback-based, have messy parameters, or return ambiguous types.

> When new code has to bend itself around the quirks of an old API, the whole codebase shakes the day that old API finally goes away.

That's why you put an adapter in the middle.

Say an old module looks something like this.

```swift
// A legacy API that's awkward to touch (callback-based)
class LegacyUserAPI {
    func fetch(id: Int,
               done: @escaping (NSDictionary?) -> Void) {
        // Old networking call...
    }
}
```

If you drag `NSDictionary` all the way up to the screen layer, replacing this API later means tearing apart your screen code too.

At a glance, it's just not something you want to attach directly.

---

## How to Wrap a Legacy API in a Protocol (3 Steps)

The actual wrapping process is simpler than it sounds.

**Step 1: Define the shape you want as a protocol.**

Write down, first, the form the new code would ideally call.

```swift
// The clean interface the new code wants
protocol UserRepository {
    func user(id: Int) async throws -> User
}
```

We swapped the callback for `async/await`, and `NSDictionary` for a `User` type.

**Step 2: Let the adapter conform the legacy code to this protocol.**

All the messy conversion logic gets locked inside the adapter.

```swift
// Adapter that converts legacy code into the new protocol
struct LegacyUserAdapter: UserRepository {
    let legacy = LegacyUserAPI()
    func user(id: Int) async throws -> User {
        try await withCheckedThrowingContinuation { cont in
            legacy.fetch(id: id) { dict in
                cont.resume(returning: User(dict))
            }
        }
    }
}
```

`withCheckedThrowingContinuation`, which turns a callback into `async`, is doing the heavy lifting here.

**Step 3: Have the screen depend only on the protocol.**

The view model doesn't need to know `LegacyUserAPI` exists at all — it only needs to know `UserRepository`.

This confines the legacy code to exactly one place: the adapter.

<figure>
  <img src="/assets/images/posts/3b1d42e6-5160-4f01-904f-89f82dbb29bc/4-1783847742177.png" alt="Legacy code hides behind the adapter, while the screen only sees the protocol">
  <figcaption>Legacy code hides behind the adapter, while the screen only sees the protocol</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/3b1d42e6-5160-4f01-904f-89f82dbb29bc/2.png" alt="The screen layer only needs to know this one clean protocol">
  <figcaption>The screen layer only needs to know this one clean protocol</figcaption>
</figure>

---

## What Changes When You Use an Adapter? (Direct Calls vs. Adapter)

Here's a table comparing calling the legacy API directly versus going through an adapter.

| Item | Direct legacy call | Wrapped in an adapter |
| --- | --- | --- |
| Scope of changes when swapping APIs | Entire screen | Just the adapter |
| Unit testing | Difficult | Easy, via mocks |
| Readability of new code | Low | High |
| Upfront effort | Less | Slightly more |

It's true that the upfront effort goes up a little.

But that cost is well worth paying.

For testing, you just hand in a single fake object that implements `UserRepository`, and you can verify your screen logic without ever touching the network.

This also means development can start even before the real API exists yet.

<figure>
  <img src="/assets/images/posts/3b1d42e6-5160-4f01-904f-89f82dbb29bc/3.png" alt="Remember this three-box structure and you're halfway there">
  <figcaption>Remember this three-box structure and you're halfway there</figcaption>
</figure>

---

## FAQ

**Q. Should the adapter be a struct or a class?**

If it holds no state, a `struct` is enough.

If it needs to keep hold of the legacy object or share a reference, use a `class`.

**Q. What's the difference between the adapter pattern and the facade pattern?**

An adapter's purpose is to "match an interface."

A facade's purpose is to "present several complex things as one simple thing" — a slightly different direction.

**Q. How should I name the protocol?**

Don't just carry over the legacy name — name it after the role the new code actually wants.

Think `UserRepository`, not `LegacyUserAPI`.

---

Instead of forcing yourself to delete legacy code outright, start by quietly isolating it behind a protocol and an adapter.

Once the old code is confined to a single spot, every refactor after that gets a lot easier. Try wrapping the messiest API in your own project first and see how it feels.
