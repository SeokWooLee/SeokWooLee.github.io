---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-C nil vs. Java null: Why Do They Behave So Differently?"
lang: en
description: "This was the thing that threw me off the most when I first started working with iOS as a developer."
header:
  og_image: /assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/1-1783736148637.png
categories:
  - iOS
tags:
  - Objective-C
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
last_modified_at: 2026-07-12
---

🌐 [한국어](/Objective-C-nil/) · **English** · [日本語](/ja/Objective-C-nil/) · [中文](/zh/Objective-C-nil/)
{: .notice--info}

This was the thing that threw me off the most when I first started working with iOS as a developer.

In Java or C++, if you try to call something on a nil (null) object, the app crashes immediately. That's the infamous NullPointerException.

But in Objective-C, sending a message to nil is completely silent. No crash, no error.

At first I thought, "Isn't this a bug?" But it turns out the language was deliberately designed to work this way.

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/1-1783736148637.png" alt="In Objective-C, a nil message quietly passes instead of throwing an exception">
  <figcaption>In Objective-C, a nil message quietly passes instead of throwing an exception</figcaption>
</figure>

To cut to the chase: in Objective-C, sending a message to nil does nothing and simply returns 0 (or nil).

This isn't the language turning a blind eye to mistakes — it's a safety mechanism built in on purpose at the language level.

Today I want to talk about why this behavior is even possible, and how we should think about it.

---

## Why doesn't sending a message to nil crash the app?

The key lies in how Objective-C sends messages.

When we write code like `[object doSomething]`, the compiler translates it into a function call: `objc_msgSend(object, @selector(doSomething))`.

Rather than calling the method directly, this structure asks the runtime, "Please pass this message along to this object."

And this `objc_msgSend` function first checks whether the receiving object is nil.

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/4-1783847973933.png" alt="The moment objc_msgSend quietly swallows a nil">
  <figcaption>The moment objc_msgSend quietly swallows a nil</figcaption>
</figure>

If the receiving object is nil?

> It doesn't bother looking for the method — it just returns 0 right then and there, quietly, and ends.

In other words, nil acts like something that "swallows the message." Since the message never arrives anywhere, there's nothing that can crash.

```objc
// If the receiver is nil, the method lookup is skipped and 0 is returned immediately
NSString *name = nil;
NSUInteger len = [name length];  // No crash, len == 0
```

---

## So how is this different from NullPointerException?

Since this trips a lot of people up, I put together a table.

| Category | Objective-C (nil) | Java (null) |
|------|-------------------|-------------|
| Calling a method on null | Ignored, returns 0/nil | Throws NullPointerException |
| App behavior | Doesn't crash, keeps running | Crashes with an exception |
| Who handles it | The runtime (objc_msgSend) | JVM exception handling |

In Java, the moment you access a null reference, it throws an exception saying, essentially, "there's no such object."

Objective-C's runtime, on the other hand, treats nil as a perfectly normal value.

That's why Java developers moving to Objective-C tend to feel a bit uneasy about this difference for a while.

The return value also varies slightly depending on the type. For object types you get nil, for numeric types you get 0, and for structs you get a value filled with zeros.

---

## Is not crashing always a good thing?

Honestly, it's a double-edged sword.

The upside is clear: you don't have to litter your code with nil checks everywhere.

For example, if an array turns out to be nil because it's empty, asking it for `count` just returns 0, so your flow doesn't get interrupted.

But that very same trait can also become a trap.

Bugs don't show up as crashes — they just quietly get buried.

I once spent ages puzzled over why some data wasn't showing up on screen, only to discover that an object somewhere in the middle was nil, so all the messages sent to it were being silently ignored.

If it had actually crashed, I would have found it right away — but because it failed silently, tracking down the cause took much longer.

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/2.png" alt="Try it yourself and you'll quickly confirm it really doesn't crash">
  <figcaption>Try it yourself and you'll quickly confirm it really doesn't crash</figcaption>
</figure>

That's why it's important to develop the habit of distinguishing places where nil is acceptable to flow through from places where a value absolutely must exist.

---

## How should you handle this in practice?

Here are a few approaches I use.

1. Explicitly check for nil at important branch points (`if (object == nil)`)
2. Mark methods that might return nil, either in comments or through naming
3. Use `NSAssert` to catch unexpected nil values during development

Things get even more interesting once you move to Swift.

Swift nails down the possibility of nil right into the type system through the concept of Optionals.

Any value that might be nil has to be marked with a question mark, and unwrapping it is enforced to be handled safely.

In a sense, Swift takes Objective-C's "quietly let it pass" approach and turns it into "surface it up front."

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/3.png" alt="Put side by side with Swift, the design philosophy difference really stands out">
  <figcaption>Put side by side with Swift, the design philosophy difference really stands out</figcaption>
</figure>

---

The fact that Objective-C doesn't crash on nil messages isn't a bug — it's a philosophy.

As convenient as it is, it also hides quiet bugs along with it. But once you understand "why doesn't this crash," you end up writing sturdier code because of it.

If you're ever staring at a mysteriously blank screen in your iOS code, take a moment to check whether a nil is quietly slipping through somewhere in between. It'll almost certainly help.
