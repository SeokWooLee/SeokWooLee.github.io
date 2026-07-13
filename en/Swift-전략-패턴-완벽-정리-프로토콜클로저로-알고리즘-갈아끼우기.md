---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "A Complete Guide to the Swift Strategy Pattern (Swapping Algorithms with Protocols and Closures)"
lang: en
description: "Have you ever run into code where the if-else chain kept growing longer with every new payment method?"
header:
  og_image: /assets/images/posts/6191441f-b80b-4db0-8367-ca763cbfb2ce/1.png
tags:
  - Swift
  - strategy pattern
  - design patterns
  - protocols
  - closures
  - iOS development
  - Swift programming
  - refactoring
  - object-oriented programming
  - Swift design patterns
permalink: /en/Swift-전략-패턴-완벽-정리-프로토콜클로저로-알고리즘-갈아끼우기/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/Swift-%EC%A0%84%EB%9E%B5-%ED%8C%A8%ED%84%B4-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%ED%81%B4%EB%A1%9C%EC%A0%80%EB%A1%9C-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EA%B0%88%EC%95%84%EB%81%BC%EC%9A%B0%EA%B8%B0/) · **English** · [日本語](/ja/Swift-%EC%A0%84%EB%9E%B5-%ED%8C%A8%ED%84%B4-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%ED%81%B4%EB%A1%9C%EC%A0%80%EB%A1%9C-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EA%B0%88%EC%95%84%EB%81%BC%EC%9A%B0%EA%B8%B0/) · [中文](/zh/Swift-%EC%A0%84%EB%9E%B5-%ED%8C%A8%ED%84%B4-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%ED%81%B4%EB%A1%9C%EC%A0%80%EB%A1%9C-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EA%B0%88%EC%95%84%EB%81%BC%EC%9A%B0%EA%B8%B0/)
{: .notice--info}

Have you ever run into code where the if-else chain kept growing longer with every new payment method?

When sorting options, discount calculations, and filtering logic start tangling together inside one giant switch statement, touching that code gets scarier and scarier.

This is exactly where the Swift strategy pattern comes in handy.

Today I'll walk through, from a practical standpoint, how to swap algorithms in and out like interchangeable parts using protocols and closures.

<figure>
  <img src="/assets/images/posts/6191441f-b80b-4db0-8367-ca763cbfb2ce/1.png" alt="The Swift strategy pattern, in the end, is really about swapping algorithms in and out like interchangeable parts">
  <figcaption>The Swift strategy pattern, in the end, is really about swapping algorithms in and out like interchangeable parts</figcaption>
</figure>

Let's start with the core idea.

> The strategy pattern separates "what to do" from "how to do it," making it possible to swap out an algorithm from the outside.

In Swift, you can implement this in two ways: protocols (the heavier approach) or closures (the lighter approach).

Let's go through each one below.

---

## What Is the Strategy Pattern? A Quick 3-Line Summary

Before diving into complex theory, let's lay out the skeleton first.

1. Group the interchangeable algorithms under one common spec (a protocol)
2. Turn the actual behavior into individual strategy objects or closures
3. The calling code only needs to know the spec — it doesn't need to know the details

Think of it like swapping weapons on a game character.

The character only needs to know how to "attack," and whatever weapon is equipped — a sword, a bow, or magic — handles the rest on its own.

You swap out the weapon without touching the character's code at all.

That "swapping" is really the whole essence of the strategy pattern.

---

## Implementing It with Protocols (The Textbook Approach)

Let's start with the most textbook-standard approach: protocols.

Take discount calculation as an example — a situation where you have several different calculation methods, like regular members, VIP members, and coupon application.

Below is code defining the common spec every strategy must follow, along with one actual strategy.

```swift
// The common spec every discount strategy must follow
protocol DiscountStrategy {
    func discount(for price: Int) -> Int
}

// VIP strategy: 20% off
struct VIPDiscount: DiscountStrategy {
    func discount(for price: Int) -> Int { price * 20 / 100 }
}
```

Now let's look at the code that holds and uses this strategy.

The object using it doesn't care which strategy gets passed in.

<figure>
  <img src="/assets/images/posts/6191441f-b80b-4db0-8367-ca763cbfb2ce/3-1783847844763.png" alt="Checkout only knows the spec — it has no idea what's inside">
  <figcaption>Checkout only knows the spec — it has no idea what's inside</figcaption>
</figure>

```swift
struct Checkout {
    var strategy: DiscountStrategy   // A slot where the strategy can be swapped

    func finalPrice(_ price: Int) -> Int {
        price - strategy.discount(for: price)
    }
}

// Swap in the strategy at checkout time
let cart = Checkout(strategy: VIPDiscount())
```

Even if a new discount policy comes along, `Checkout` never needs to be touched.

All you need is one new struct that conforms to `DiscountStrategy`, and you're done.

Extending functionality without touching existing code — that's the biggest advantage you feel in practice.

---

## Implementing It with Closures (The Swift-Native Way)

But when a strategy is simple, creating a struct every single time feels like overkill.

Wrapping even trivial logic entirely in protocols tends to make the code more verbose than it needs to be.

This is where closures in Swift feel much lighter and more natural.

```swift
struct Checkout {
    // Receive the strategy itself as a function
    var discount: (Int) -> Int

    func finalPrice(_ price: Int) -> Int {
        price - discount(price)
    }
}

// Define the strategy inline, right on the spot
let cart = Checkout(discount: { $0 * 20 / 100 })
```

You can write the logic directly at the point where it's passed in, with no separate type declaration.

For lightweight algorithm swaps like sort criteria, filter conditions, or simple transformations, this approach is far cleaner.

<figure>
  <img src="/assets/images/posts/6191441f-b80b-4db0-8367-ca763cbfb2ce/2.png" alt="Turns out sorted(by:) has been the strategy pattern we've used every day, all along">
  <figcaption>Turns out sorted(by:) has been the strategy pattern we've used every day, all along</figcaption>
</figure>

In fact, the standard library's `sorted(by:)` is itself this exact closure-based strategy pattern.

The sorting skeleton stays fixed, while only the comparison criteria get swapped out via a closure.

So really, we've been using this pattern every day already.

---

## Protocols vs. Closures: When to Use Which?

Here's a table summarizing the criteria commonly used to choose between the two in practice.

| Criteria | Protocol Approach | Closure Approach |
|------|--------------|------------|
| Best suited for | Complex strategies, ones holding state | Short, simple strategies |
| Reusability | Easy to reuse across multiple places | Better for one-off use |
| Amount of code | Requires type declaration, more code | Defined inline, less code |
| Testing | Easy to verify as an individual type | Simple to verify the logic alone |
| Readability | Intent is clear from the name | Clear when short, confusing when long |

Here's the rule of thumb worth applying:

If a strategy holds internal state, gets reused across multiple screens, or needs its intent made clear through a name, protocols are the better fit.

On the other hand, if it's just a one- or two-line piece of logic being swapped in and out on the fly, closures are the answer.

Mixing both is completely fine too. It's common to use protocols for major policies and closures for fine-grained options.

---

## Frequently Asked Questions (Q&A)

**Q. How is the strategy pattern different from inheritance (overriding)?**

Inheritance ties behavior to a parent class, locking it in at compile time.

The strategy pattern, by contrast, lets you freely swap strategies at runtime, without being bound to a class hierarchy.

**Q. How is this different from handling things with a switch statement on an enum?**

With switch, every new case means opening up and modifying existing code.

With the strategy pattern, you only need to "add" a new strategy, which reduces how often existing code needs to be touched.

---

In the end, the strategy pattern comes down to one core idea: pulling the part that changes out to the outside so it's easy to swap.

If you apply the two approaches covered today — protocols and closures — depending on the situation, you should be able to escape that tiresome if-else hell for good. Give it a try by refactoring a small piece of code first!
