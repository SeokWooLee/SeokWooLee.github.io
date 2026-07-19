---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "The Complete Guide to the Prototype Pattern in Swift (NSCopying vs. Value Type Copying)"
lang: en
description: "Have you ever copied an object in Swift and paused to ask, \"Wait, did this actually get copied?\""
header:
  og_image: /assets/images/posts/1e23c2e3-19f7-4f99-824a-221093351866/1.png
tags:
  - Swift
  - Prototype Pattern
  - NSCopying
  - Value Types
  - Design Patterns
  - iOS Development
  - Swift Copying
  - Swift Programming
  - Deep Copy
  - Shallow Copy
permalink: /en/Swift-프로토타입-패턴-완벽-정리-NSCopying-vs-값-타입-복사-차이/
toc: true
toc_sticky: true
last_modified_at: 2026-07-19
---

🌐 [한국어](/Swift-%ED%94%84%EB%A1%9C%ED%86%A0%ED%83%80%EC%9E%85-%ED%8C%A8%ED%84%B4-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-NSCopying-vs-%EA%B0%92-%ED%83%80%EC%9E%85-%EB%B3%B5%EC%82%AC-%EC%B0%A8%EC%9D%B4/) · **English** · [日本語](/ja/Swift-%ED%94%84%EB%A1%9C%ED%86%A0%ED%83%80%EC%9E%85-%ED%8C%A8%ED%84%B4-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-NSCopying-vs-%EA%B0%92-%ED%83%80%EC%9E%85-%EB%B3%B5%EC%82%AC-%EC%B0%A8%EC%9D%B4/) · [中文](/zh/Swift-%ED%94%84%EB%A1%9C%ED%86%A0%ED%83%80%EC%9E%85-%ED%8C%A8%ED%84%B4-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-NSCopying-vs-%EA%B0%92-%ED%83%80%EC%9E%85-%EB%B3%B5%EC%82%AC-%EC%B0%A8%EC%9D%B4/)
{: .notice--info}

Have you ever copied an object in Swift and paused to ask, "Wait, did this actually get copied?"

Copy a class instance with a single assignment, and you can easily end up in a situation where editing the copy changes the original too.

Cutting to the chase: copying in Swift splits into two paths.

Value types (structs) copy themselves automatically on assignment, while classes (reference types) only get a true copy if you implement `NSCopying` yourself.

In this post, I'll walk through what the prototype pattern is, and break down—piece by piece—the difference between `NSCopying` and value type copying.

<figure>
  <img src="/assets/images/posts/1e23c2e3-19f7-4f99-824a-221093351866/1.png" alt="Value type copying vs. NSCopying—this one image sums up the difference">
  <figcaption>Value type copying vs. NSCopying—this one image sums up the difference</figcaption>
</figure>

---

## What Is the Prototype Pattern?

In a nutshell, the prototype pattern is **a design pattern that creates new objects by cloning an existing one**.

Instead of building something from scratch, you copy an original that's already fully configured, almost like stamping it out.

Think of it like a rubber stamp: carve the original stamp carefully once, and after that, all you have to do is press it down.

This is especially useful when object creation is expensive or the initial setup is complicated.

Take a game character, for example: rather than setting up stats, equipment, and skills from scratch every time, you clone a base character and tweak it slightly.

The key point is that the clone has to be completely independent of the original.

> If modifying the clone also changes the original, that's not a copy—it's just sharing a reference.

And this is exactly where value types and reference types part ways.

---

## Why Is Value Type Copying So Convenient?

In Swift, structs and enums are value types.

The biggest advantage of value types is that they get **copied automatically** just by being assigned or passed to a function.

The code below should make this clear. Copy the original, change the copy's values, and neither one affects the other.

```swift
struct Character {
    var name: String
    var level: Int
}

var origin = Character(name: "Warrior", level: 1)
var copy = origin      // The entire value gets copied here
copy.level = 99
print(origin.level)    // 1 (the original stays unchanged!)
```

Even after changing `copy.level` to 99, `origin.level` is still 1.

You don't need to write any extra copying code, which cuts way down on room for mistakes.

That's why, unless there's a specific reason not to, I tend to reach for a struct first.

This safety is exactly why Swift favors value type copying in the first place.

---

## How Do You Use NSCopying?

The trouble starts with classes (reference types).

Assigning a class doesn't copy it—it just **shares the address pointing to the same instance**.

So when you actually need a real copy, you have to adopt the `NSCopying` protocol and implement `copy(with:)` yourself.

```swift
class Character: NSCopying {
    var name: String
    init(name: String) { self.name = name }

    func copy(with zone: NSZone? = nil) -> Any {
        return Character(name: self.name)
    }
}

let origin = Character(name: "Warrior")
let clone = origin.copy() as! Character
```

Calling `copy()` creates a brand-new instance, so changing `clone` leaves `origin` untouched.

There's one thing worth watching out for here.

For a true (deep) copy, you need to recreate the internal properties inside `copy(with:)` as well.

If you just assign the internal objects directly, you end up with a shallow copy—the outside looks copied, but the inside is still shared.

---

## Value Type Copying vs. NSCopying, at a Glance

Here's a table comparing the two approaches.

| Category | Value Type (struct) Copying | NSCopying (class) |
|------|------|------|
| Copy method | Automatic on assignment | Call `copy()` directly |
| Implementation needed | None | Must implement `copy(with:)` |
| Default behavior | Always a separate copy | Assignment shares the address |
| Shallow/deep copy | Rarely a concern | You have to handle it yourself |
| Best suited for | Most data models | Cases where a reference type is required |

To sum up: designing with value types is generally easier and safer.

That said, when you need inheritance, need to interoperate with Objective-C APIs, or instance identity matters, classes and `NSCopying` are the way to go.

In those cases, implementing the prototype pattern via `NSCopying` fits neatly.

<figure>
  <img src="/assets/images/posts/1e23c2e3-19f7-4f99-824a-221093351866/2.png" alt="I tend to reach for a struct first—since assignment alone gets you a copy">
  <figcaption>I tend to reach for a struct first—since assignment alone gets you a copy</figcaption>
</figure>

---

## FAQ

**Q. If I only use structs, can I skip NSCopying entirely?**

For basic copying, yes. But once you start working with UIKit or Objective-C-based APIs, you'll run into cases where you need to copy a class, so it's worth understanding the concept anyway.

**Q. What's the difference between copy() and mutableCopy()?**

`copy()` produces an immutable copy, while `mutableCopy()` produces a mutable one. The latter requires adopting `NSMutableCopying`.

**Q. Is a deep copy always the right answer?**

Not necessarily. If it's fine for internal objects to be shared, a shallow copy can actually be better for performance.

<figure>
  <img src="/assets/images/posts/1e23c2e3-19f7-4f99-824a-221093351866/3.png" alt="Carve the original stamp well once, and after that, all you have to do is press it down">
  <figcaption>Carve the original stamp well once, and after that, all you have to do is press it down</figcaption>
</figure>

---

## Wrapping Up

Whenever copying gets confusing, just ask yourself one question: "If I change the original, does the clone change too?"

With value types, Swift handles that worry for you; with classes, you take care of it yourself through `NSCopying`.

Hopefully what we covered today saves you a few late nights wrestling with copy bugs. Good luck out there!
