---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift Classes vs. Structs: The Complete Guide (Value Types vs. Reference Types)"
lang: en
description: "If you've spent any time developing in Swift, there's a moment that always makes you pause."
header:
  og_image: /assets/images/posts/fe489e5e-2d4d-4964-a5de-3e49b17a9c86/1.png
tags:
  - Swift
  - Swift programming
  - structs
  - classes
  - value types
  - reference types
  - iOS development
  - Swift syntax
  - learn programming
  - coding tips
permalink: /en/Swift-클래스와-구조체-차이-총정리-값-타입참조-타입/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/Swift-%ED%81%B4%EB%9E%98%EC%8A%A4%EC%99%80-%EA%B5%AC%EC%A1%B0%EC%B2%B4-%EC%B0%A8%EC%9D%B4-%EC%B4%9D%EC%A0%95%EB%A6%AC-%EA%B0%92-%ED%83%80%EC%9E%85%EC%B0%B8%EC%A1%B0-%ED%83%80%EC%9E%85/) · **English** · [日本語](/ja/Swift-%ED%81%B4%EB%9E%98%EC%8A%A4%EC%99%80-%EA%B5%AC%EC%A1%B0%EC%B2%B4-%EC%B0%A8%EC%9D%B4-%EC%B4%9D%EC%A0%95%EB%A6%AC-%EA%B0%92-%ED%83%80%EC%9E%85%EC%B0%B8%EC%A1%B0-%ED%83%80%EC%9E%85/) · [中文](/zh/Swift-%ED%81%B4%EB%9E%98%EC%8A%A4%EC%99%80-%EA%B5%AC%EC%A1%B0%EC%B2%B4-%EC%B0%A8%EC%9D%B4-%EC%B4%9D%EC%A0%95%EB%A6%AC-%EA%B0%92-%ED%83%80%EC%9E%85%EC%B0%B8%EC%A1%B0-%ED%83%80%EC%9E%85/)
{: .notice--info}

If you've spent any time developing in Swift, there's a moment that always makes you pause.

"Should I make this a class or a struct?"

When I first started learning Swift, I just picked between the two based on gut feeling. It wasn't until I ran into a strange bug that I actually sat down and studied the difference properly.

Let me give you the bottom line first.

> Unless you have a specific reason not to, reach for a struct first.
>
> Use a class only when you truly need "a single piece of state that's shared."

Apple's own official guidelines take the same position. Today, I'll walk you through exactly why, step by step.

<figure>
  <img src="/assets/images/posts/fe489e5e-2d4d-4964-a5de-3e49b17a9c86/1.png" alt="Value types vs. reference types — this one image sums it up">
  <figcaption>Value types vs. reference types — this one image sums it up</figcaption>
</figure>

---

## The Key Takeaways First (3 Points)

For those short on time, here's the summary up front.

1. **Structs are value types.** Copy one, and you get a completely separate value.
2. **Classes are reference types.** Copy one, and both copies still point to the same instance.
3. When in doubt, **default to struct** — reach for class only when you need inheritance or shared state.

Remember just these three lines, and you're already halfway there.

---

## What's the Actual Difference Between Value Types and Reference Types?

Describing it in words only gets you so far. Code makes it click instantly.

First, the struct. The moment you copy it, the two become completely unrelated.

```swift
struct Point { var x = 0 }

var a = Point()
var b = a      // the value is copied
b.x = 10

print(a.x, b.x)
// Output: 0 10
```

Even though `b` changed, `a` stayed the same. Each one holds its own independent value.

Now the class. It looks like nearly identical code, but the result is different.

```swift
class Box { var x = 0 }

let a = Box()
let b = a      // the reference is copied (same object)
b.x = 10

print(a.x, b.x)
// Output: 10 10
```

We only changed `b`, yet `a` also became 10.

That's because they both point to the same instance. This is exactly the kind of bug that tripped me up.

<figure>
  <img src="/assets/images/posts/fe489e5e-2d4d-4964-a5de-3e49b17a9c86/2.png" alt="Copy or share? The arrows tell you everything">
  <figcaption>Copy or share? The arrows tell you everything</figcaption>
</figure>

---

## So When Do You Use Which? (Decision Criteria)

When making this call in real projects, this is the table I keep in mind.

| Situation | Choice |
|------|------|
| Simple data-holding model | Struct |
| Want copies to stay independent of each other | Struct |
| Inheritance is required | Class |
| Same instance needs to be shared across multiple places | Class |
| Needs to interoperate with Objective-C | Class |

Breaking it down a bit further:

- If something represents **a value itself** — like a coordinate, a color, or a size — a struct is the natural fit.
- If **multiple places need to observe a single shared state** — like a screen controller or a network manager — a class is the right call.
- This is also why Apple's SwiftUI builds Views as structs. They stay lightweight and predictable.

For reference, `Array`, `String`, and `Dictionary` in the Swift standard library are all structs. That alone tells you value types are the default mindset in Swift.

<figure>
  <img src="/assets/images/posts/fe489e5e-2d4d-4964-a5de-3e49b17a9c86/3.png" alt="This is the first question I always ask myself">
  <figcaption>This is the first question I always ask myself</figcaption>
</figure>

---

## Why Struct Is the Recommended Default

Value types are easy to reason about.

You never have to worry about a value you passed somewhere getting secretly changed elsewhere. Pass it into a function, and the original stays safe.

They're also easier to work with in multithreaded environments. With no shared state, there's less room for data races.

Classes, on the other hand, are powerful but require care. When the same instance is being held onto in multiple places, it becomes hard to track down where a value actually changed.

That's why building the habit of "struct by default, class only when necessary" cuts down on bugs significantly.

---

## When to Use Each — and When to Avoid It

Here's a condensed version of the decision criteria to close things out.

- **Use a struct**: for data-centric models, when you need independent copies, when thread safety matters
- **Use a class**: when you need inheritance, when a single instance must be shared, when identity itself is meaningful
- **Avoid**: reaching for class out of habit for a simple model, or forcing a struct into a situation that actually needs sharing

---

### How This Comes Up in Interviews

**Q. What's the biggest difference between a struct and a class?**

A struct is a value type, and a class is a reference type. Copy a struct and you get a fully independent value, but copy a class and both copies still point to the same instance. Also, only classes support inheritance and can have a deinitializer (deinit).

**Q. Why does Swift recommend using structs?**

Because value types have no shared state, they produce fewer side effects and are more predictable. There's no risk of the original being changed unintentionally, and they're safer in multithreaded environments — which helps reduce bugs.

---

At first, I assumed the two were just a syntax difference, but the deeper I dug, the more it turned out to be a design question.

Once you internalize today's criteria, you'll hesitate a lot less on your next project. Just start by asking: value, or shared? That one question gets you most of the way there.
