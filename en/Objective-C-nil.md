---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-C nil vs Java null: Why Do They Behave So Differently?"
lang: en
description: "There's one thing that trips up developers the moment they start working with iOS."
header:
  og_image: /assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/1-1783736148637.png
categories:
  - iOS
tags:
  - ObjectiveC
  - nil
  - iOSDevelopment
  - NullPointerException
  - objcmsgSend
  - SwiftOptionals
  - Programming
  - Runtime
  - LearningToCode
  - Coding
permalink: /en/Objective-C-nil/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/Objective-C-nil/) · **English** · [日本語](/ja/Objective-C-nil/) · [中文](/zh/Objective-C-nil/)
{: .notice--info}

There's one thing that trips up developers the moment they start working with iOS.

In Java or C++, calling something on a nil (null) object kills the app instantly. That's the infamous NullPointerException.

But in Objective-C, sending a message to nil just... stays quiet. No crash, no error.

The first time you see it, you think "wait, isn't this a bug?" But actually, the language was deliberately designed to work this way.

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/1-1783736148637.png" alt="Objective-C nil messages fail silently instead of throwing exceptions">
  <figcaption>Objective-C nil messages fail silently instead of throwing exceptions</figcaption>
</figure>

To cut to the conclusion: in Objective-C, sending a message to nil does nothing and simply returns 0 (or nil).

This isn't the language turning a blind eye to mistakes — it's an intentional safety mechanism built into the language itself.

Today let's look at why this behavior is possible, and how to think about it in a productive way.

---

## Why doesn't sending a message to nil crash?

The key lies in how Objective-C sends messages.

When you write code like `[object doSomething]`, the compiler translates it into a function call: `objc_msgSend(object, @selector(doSomething))`.

Rather than calling the method directly, this is a structure where you ask the runtime, "please pass this message along to this object."

And that `objc_msgSend` function checks, right at the start, whether the receiving object is nil.

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/4-1783847973933.png" alt="Where objc_msgSend quietly swallows nil">
  <figcaption>Where objc_msgSend quietly swallows nil</figcaption>
</figure>

If the receiver is nil?

> It doesn't bother looking for the method — it just returns 0 on the spot and quietly finishes.

In other words, nil acts like something that "swallows" the message. Since it never arrives anywhere, there's nothing that can crash.

```objc
// If the receiver is nil, no method lookup happens — 0 is returned immediately
NSString *name = nil;
NSUInteger len = [name length];  // No crash, len == 0
```

---

## So how is this different from a NullPointerException?

This is where a lot of people get confused, so here's a table to break it down.

| | Objective-C (nil) | Java (null) |
|------|-------------------|-------------|
| Calling a method on null | Ignored, returns 0/nil | Throws NullPointerException |
| App behavior | Doesn't crash, keeps running | Crashes with an exception |
| Who handles it | The runtime (objc_msgSend) | JVM exception handling |

In Java, the moment you touch a null reference, it throws an exception — essentially saying "there's no such object."

The Objective-C runtime, on the other hand, treats nil as a perfectly normal value.

That's why developers coming from Java tend to find this difference a bit unsettling for a while after switching to Objective-C.

The return value also varies a bit by type. Object types return nil, numeric types return 0, and structs come back filled with zeroed-out values.

---

## Is not crashing always a good thing?

Honestly, it's a double-edged sword.

The upside is clear: you don't have to litter your code with nil checks everywhere.

For example, if an array turns out to be nil, asking it for `count` just returns 0 without breaking the flow.

But that very convenience can also become a trap.

Bugs don't surface as crashes — they get buried silently.

When data isn't showing up on screen and you're stuck debugging for a while, it's often because some object turned out to be nil somewhere along the way, and every message sent to it was quietly ignored.

If it had crashed, you'd have found it right away. But because it fails silently, tracking down the cause takes much longer.

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/2.png" alt="Try it yourself and you'll quickly see it really doesn't crash">
  <figcaption>Try it yourself and you'll quickly see it really doesn't crash</figcaption>
</figure>

That's why it's important to develop the habit of distinguishing between places where nil is acceptable to flow through, and places where a value absolutely must be present.

---

## How should you handle this in practice?

Here are a few approaches worth keeping in mind.

1. Explicitly check for nil at critical branch points (`if (object == nil)`)
2. Mark methods that might return nil, whether through comments or naming conventions
3. Use `NSAssert` to catch unexpected nils during development

Things look quite different once you move over to Swift.

Swift pins down the possibility of nil directly in the type system through the concept of Optionals.

Any value that could be nil has to be marked with a question mark, and unwrapping it forces you to handle the nil case safely.

In a sense, Swift takes Objective-C's "quietly move on" approach and flips it into "surface it up front."

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/3.png" alt="Put side by side with Swift, the design philosophy difference stands out">
  <figcaption>Put side by side with Swift, the design philosophy difference stands out</figcaption>
</figure>

---

The fact that Objective-C doesn't crash on nil messages isn't a bug — it's a design philosophy.

As convenient as it is, it also hides silent bugs along with it. Once you understand *why* it doesn't crash, you can actually write sturdier code because of it.

If you've ever run into a mysterious blank screen in your iOS code, it's worth checking whether nil is quietly slipping through somewhere in the middle. Chances are, that's exactly what's happening.
