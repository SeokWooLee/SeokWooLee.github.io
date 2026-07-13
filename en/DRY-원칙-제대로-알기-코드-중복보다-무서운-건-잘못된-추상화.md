---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Getting DRY Right: Wrong Abstractions Are Scarier Than Code Duplication"
lang: en
description: "If you do code reviews for a while, you start noticing one scene come up a lot."
header:
  og_image: /assets/images/posts/52ab8398-a81d-4f14-b59a-89c82327e577/1.png
tags:
  - DRY principle
  - code duplication
  - refactoring
  - the pragmatic programmer
  - clean code
  - abstraction
  - software design principles
  - software architecture
  - programming
  - software development
permalink: /en/DRY-원칙-제대로-알기-코드-중복보다-무서운-건-잘못된-추상화/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/DRY-%EC%9B%90%EC%B9%99-%EC%A0%9C%EB%8C%80%EB%A1%9C-%EC%95%8C%EA%B8%B0-%EC%BD%94%EB%93%9C-%EC%A4%91%EB%B3%B5%EB%B3%B4%EB%8B%A4-%EB%AC%B4%EC%84%9C%EC%9A%B4-%EA%B1%B4-%EC%9E%98%EB%AA%BB%EB%90%9C-%EC%B6%94%EC%83%81%ED%99%94/) · **English** · [日本語](/ja/DRY-%EC%9B%90%EC%B9%99-%EC%A0%9C%EB%8C%80%EB%A1%9C-%EC%95%8C%EA%B8%B0-%EC%BD%94%EB%93%9C-%EC%A4%91%EB%B3%B5%EB%B3%B4%EB%8B%A4-%EB%AC%B4%EC%84%9C%EC%9A%B4-%EA%B1%B4-%EC%9E%98%EB%AA%BB%EB%90%9C-%EC%B6%94%EC%83%81%ED%99%94/) · [中文](/zh/DRY-%EC%9B%90%EC%B9%99-%EC%A0%9C%EB%8C%80%EB%A1%9C-%EC%95%8C%EA%B8%B0-%EC%BD%94%EB%93%9C-%EC%A4%91%EB%B3%B5%EB%B3%B4%EB%8B%A4-%EB%AC%B4%EC%84%9C%EC%9A%B4-%EA%B1%B4-%EC%9E%98%EB%AA%BB%EB%90%9C-%EC%B6%94%EC%83%81%ED%99%94/)
{: .notice--info}

If you do code reviews for a while, you start noticing one scene come up a lot.

You go searching to fix a single feature, and nearly identical code turns up in three different places. Fix one, and the other two stay behind as bugs waiting to happen.

Today's topic tackles that problem head-on: the DRY principle. It travels as a pair with the KISS principle we covered last time.

<figure>
  <img src="/assets/images/posts/52ab8398-a81d-4f14-b59a-89c82327e577/1.png" alt="Three copies of the same code means three copies of the bug">
  <figcaption>Three copies of the same code means three copies of the bug</figcaption>
</figure>

DRY stands for "Don't Repeat Yourself." It's the principle that says don't repeat the same knowledge throughout a system.

Andy Hunt and Dave Thomas laid out the concept in their 1999 book *The Pragmatic Programmer*, and the original definition is worth quoting precisely.

> Every piece of knowledge must have a single, unambiguous, authoritative representation within a system.

The word to pay attention to here isn't "code" — it's "knowledge." That's the crux of today's post.

---

## Why Is Copy-Pasting Code a Problem?

Copy-pasting itself isn't a sin. The problem shows up afterward.

When the same logic lives in three places, changing a requirement means hunting down and fixing all three. Miss even one, and that becomes a bug.

```swift
// If shipping fee calculation is scattered across three files
// Cart.swift
let fee = total >= 50000 ? 0 : 3000

// Checkout.swift
let shippingFee = totalPrice >= 50000 ? 0 : 3000

// OrderSummary.swift
let delivery = price >= 50000 ? 0 : 3000
```

Then one day someone asks, "Let's lower the free-shipping threshold to 30,000 won." Now you have to track down all three files. Since each uses different variable names, search terms differ too, and you're bound to miss one.

```swift
// Consolidate the knowledge into one place
// Shipping.swift
enum ShippingPolicy {
    static let freeShippingThreshold = 50000
    static let fee = 3000

    static func shippingFee(for total: Int) -> Int {
        total >= freeShippingThreshold ? 0 : fee
    }
}
```

Now when the policy changes, you only need to touch one spot. That's DRY.

---

## It's Duplication of 'Knowledge,' Not Code

Here's where a lot of people stumble once. They read DRY as "merge together any code that looks similar."

What DRY calls duplication isn't about how the code looks — it's about duplicated knowledge, meaning duplicated business rules.

This distinction matters because the world is full of code that merely happens to look alike.

| Situation | Is it duplication? |
|------|-----------|
| Shipping fee logic in three places | Real duplication (same knowledge) |
| Signup validation and event-entry validation happen to look similar | False duplication (different knowledge) |
| The constant 3000 shows up separately in shipping fee and points-earning thresholds | False duplication (different meaning) |

Signup validation and event-entry validation might both currently require "name mandatory, phone number 11 digits," making the code look identical — but the two rules change for entirely different reasons. Merge them into one, and changing the event rule can break signup.

<figure>
  <img src="/assets/images/posts/52ab8398-a81d-4f14-b59a-89c82327e577/2.png" alt="Looking alike doesn't mean it's the same knowledge">
  <figcaption>Looking alike doesn't mean it's the same knowledge</figcaption>
</figure>

---

## Premature Abstraction Costs More Than Duplication

That's why you often hear this in the community these days: "prefer duplication over the wrong abstraction." It's a line from Sandi Metz, the well-known Ruby developer.

Force two similar-looking pieces of code together, and here's what tends to happen:

1. You create a shared function
2. One side's requirements change, so you add an optional parameter
3. The other side changes too, so you add an if-branch
4. Before long, it's a function with five parameters that nobody understands

At that point, two separate copy-pasted versions would have been better.

<figure>
  <img src="/assets/images/posts/52ab8398-a81d-4f14-b59a-89c82327e577/4-1783847956412.png" alt="How a forced-together function falls apart in four steps">
  <figcaption>How a forced-together function falls apart in four steps</figcaption>
</figure>

That's why the "Rule of Three" gets used a lot in practice. When the same pattern shows up twice, you leave it alone; only when it appears a third time do you abstract it. By the third repetition, you can actually tell whether it's genuinely the same knowledge or just coincidence.

---

## The Test I Apply

When I spot duplication, I ask myself one question:

> Do these two pieces of code change for the same reason?

If they change for the same reason, it's real duplication — merge them. If they change for different reasons, leave them be, no matter how similar they look.

<figure>
  <img src="/assets/images/posts/52ab8398-a81d-4f14-b59a-89c82327e577/3.png" alt="One question is all you need before merging">
  <figcaption>One question is all you need before merging</figcaption>
</figure>

---

## Today's Takeaway

Boiled down, the DRY principle comes to this:

- The unit of duplication is knowledge (business rules), not code shape.
- Only merge code that changes for the same reason. Leave coincidentally similar code alone.
- When unsure, use the Rule of Three. Abstracting on the third repetition is not too late.

If KISS says "keep it simple," DRY says "keep knowledge in one place." Both ultimately aim to cut down the cost of change.

You've probably already got some logic in mind that turns up in three places with a single search. That's today's refactoring candidate.
