---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-C nil vs Java null: Why They Behave Differently"
lang: en
description: "This was the thing that threw me off the most when I first touched iOS as a developer."
header:
  og_image: /assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/1-1783736148637.png
categories:
  - iOS
tags:
  - ObjectiveC
  - nil
  - iOS development
  - NullPointerException
  - objc_msgSend
  - Swift Optionals
  - programming
  - runtime
  - learning to code
  - coding
permalink: /en/Objective-C-nil/
toc: true
toc_sticky: true
last_modified_at: 2026-07-11
---

🌐 [한국어](/Objective-C-nil/) · **English** · [日本語](/ja/Objective-C-nil/) · [中文](/zh/Objective-C-nil/)
{: .notice--info}

This was the thing that threw me off the most when I first touched iOS as a developer.

In Java or C++, if you call something on a nil (null) object, the app crashes instantly. That famous NullPointerException.

But in Objective-C, sending a message to nil is silent. No crash, no error.

At first I thought, "Wait, isn't this a bug?" But it turns out the language was deliberately designed this way.

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/1-1783736148637.png" alt="An Objective-C nil message quietly passes through instead of throwing an exception">
  <figcaption>An Objective-C nil message quietly passes through instead of throwing an exception</figcaption>
</figure>

To cut to the chase: in Objective-C, sending a message to nil does nothing and simply returns 0 (or nil).

This isn't the language turning a blind eye to mistakes — it's an intentional safety mechanism built in at the language level.

Today I want to talk about why this behavior is possible, and how to think about it.

---

## Why doesn't sending a message to nil crash?

The key lies in how Objective-C sends messages.

When we write code like `[object doSomething]`, the compiler turns this into a function call: `objc_msgSend(object, @selector(doSomething))`.

Rather than calling the method directly, it's structured as asking the runtime, "Please deliver this message to this object."

And this `objc_msgSend` function checks, right at the start, whether the receiving object is nil.

What happens if the receiver is nil?

> It doesn't bother looking for the method — it immediately returns 0 on the spot and quietly finishes.

In other words, nil is essentially "something that swallows messages." Since the message never arrives anywhere, there's nothing that can crash.

```objc
// If the receiver is nil, it doesn't look for the method and immediately returns 0
NSString *name = nil;
NSUInteger len = [name length];  // No crash, len == 0
```

---

## So how is this different from NullPointerException?

This is a point a lot of people find confusing, so I put together a table.

| | Objective-C (nil) | Java (null) |
|------|-------------------|-------------|
| Calling a method on null | Ignored, returns 0/nil | Throws NullPointerException |
| App behavior | Doesn't crash, keeps running | Crashes with an exception |
| Handled by | The runtime (objc_msgSend) | JVM exception handling |

In Java, the moment you access a null reference, it throws an exception essentially saying, "There's no such object."

Objective-C's runtime, on the other hand, treats nil as a perfectly normal value.

That's why Java developers coming over to Objective-C tend to find this difference a bit disorienting for a while.

The return value also varies a bit depending on the type. For object types you get nil, for numeric types you get 0, and for structs you get a value filled with zeros.

---

## Is not crashing always a good thing?

Honestly, it's a double-edged sword.

The upside is clear: you don't have to plaster nil checks everywhere in your code.

For example, if an array is empty and returns nil, and you ask it for `count`, you just get 0 back — the flow doesn't break.

But that very same trait can become a trap.

Bugs don't surface as crashes — they quietly get buried.

I once spent ages stuck on why data wasn't showing up on screen, only to discover that some object along the way was nil, silently swallowing all the messages sent to it.

If it had crashed, I would've found it right away. But because it just quietly moved on, tracking down the cause took much longer.

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/2.png" alt="Run it yourself and you'll see right away — it really doesn't crash">
  <figcaption>Run it yourself and you'll see right away — it really doesn't crash</figcaption>
</figure>

So it's important to develop the habit of distinguishing between places where nil is acceptable to flow through, and places where a value absolutely must exist.

---

## How should you handle this in practice?

Let me lay out a few approaches I use.

1. Explicitly check for nil at critical branch points (`if (object == nil)`)
2. Mark methods that might return nil with a comment or naming convention
3. If you suspect an unexpected nil, catch it during development with `NSAssert`

Things get interesting once you move over to Swift, too.

Swift bakes the possibility of nil directly into the type system through the concept of Optionals.

Any value that could be nil must be marked with a question mark, and unwrapping it is enforced to be handled safely.

In a sense, Swift takes Objective-C's "quietly move on" approach and flips it into "surface it upfront."

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/3.png" alt="Line it up next to Swift and the difference in design philosophy becomes clear">
  <figcaption>Line it up next to Swift and the difference in design philosophy becomes clear</figcaption>
</figure>

---

The fact that Objective-C doesn't crash on a nil message isn't a bug — it's a philosophy.

The convenience comes with the cost of hiding silent bugs, but once you understand "why doesn't this crash," you can actually write more solid code.

If you're currently staring at an unexplained blank screen in your iOS code, take a moment to check whether nil is quietly slipping through somewhere along the way. It'll probably help.
