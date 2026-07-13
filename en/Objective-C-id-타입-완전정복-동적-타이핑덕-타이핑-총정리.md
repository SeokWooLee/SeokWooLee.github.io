---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "A Complete Guide to Objective-C's id Type (Dynamic Typing and Duck Typing Explained)"
lang: en
description: "If you're new to Objective-C, there's a good chance you've paused for a moment at the id type."
header:
  og_image: /assets/images/posts/985ef22b-6988-47cb-adf2-a9d803086c51/1.png
tags:
  - Objective-C
  - id type
  - dynamic typing
  - duck typing
  - iOS development
  - Cocoa framework
  - runtime
  - learn programming
  - objc
permalink: /en/Objective-C-id-타입-완전정복-동적-타이핑덕-타이핑-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-14
---

🌐 [한국어](/Objective-C-id-%ED%83%80%EC%9E%85-%EC%99%84%EC%A0%84%EC%A0%95%EB%B3%B5-%EB%8F%99%EC%A0%81-%ED%83%80%EC%9D%B4%ED%95%91%EB%8D%95-%ED%83%80%EC%9D%B4%ED%95%91-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · **English** · [日本語](/ja/Objective-C-id-%ED%83%80%EC%9E%85-%EC%99%84%EC%A0%84%EC%A0%95%EB%B3%B5-%EB%8F%99%EC%A0%81-%ED%83%80%EC%9D%B4%ED%95%91%EB%8D%95-%ED%83%80%EC%9D%B4%ED%95%91-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [中文](/zh/Objective-C-id-%ED%83%80%EC%9E%85-%EC%99%84%EC%A0%84%EC%A0%95%EB%B3%B5-%EB%8F%99%EC%A0%81-%ED%83%80%EC%9D%B4%ED%95%91%EB%8D%95-%ED%83%80%EC%9D%B4%ED%95%91-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
{: .notice--info}

If you're new to Objective-C, there's a good chance you've paused for a moment at the `id` type.

"What kind of type even is this? Why does it compile no matter what object I stuff into it?" is a natural question to ask.

Here's the short answer: `id` is a "universal pointer that can point to any object," and it's the very thing that underpins Objective-C's dynamic typing and duck typing.

In this post, we'll break down exactly what the `id` type is, how dynamic typing and duck typing actually play out in real code, and when you should reach for it — and when you should be careful.

<figure>
  <img src="/assets/images/posts/985ef22b-6988-47cb-adf2-a9d803086c51/1.png" alt="Everything about dynamic typing and duck typing starts right here with the id type">
  <figcaption>Everything about dynamic typing and duck typing starts right here with the id type</figcaption>
</figure>

## So what exactly is the id type?

In short, `id` is "a pointer to an arbitrary Objective-C object."

Without pinning down a specific class like `NSString *` or `NSArray *`, it can hold any object at all.

Actually, once you look under the hood, `id` turns out to be simpler than it sounds. Internally, it's defined like this:

```objc
// objc.h internal definition (summarized)
typedef struct objc_object {
    Class isa;  // pointer to the class this object belongs to
} *id;
```

In other words, `id` is a pointer to a struct that holds a single pointer called `isa`.

<figure>
  <img src="/assets/images/posts/985ef22b-6988-47cb-adf2-a9d803086c51/4-1783847906422.png" alt="Turns out the id type is really just a pointer holding a single isa">
  <figcaption>Turns out the id type is really just a pointer holding a single isa</figcaption>
</figure>

That `isa` field acts as a name tag, telling the runtime "I'm an instance of this particular class."

Here's a fun detail: since `id` is already a pointer, you write `id obj`, not `id *obj` with an asterisk.

This is easy to mix up when you compare it to something like `NSString *str`.

---

## How dynamic typing actually works

Dynamic typing is the idea that an object's real type is determined at runtime, not at compile time.

What class an object stored in `id` actually belongs to gets resolved the moment the program runs, by checking its `isa` pointer.

That's what makes code like this possible:

```objc
id obj = @"Hello";           // right now it's an NSString
NSLog(@"%@", [obj class]);   // prints: __NSCFConstantString
obj = @[@1, @2, @3];         // now it becomes an NSArray
NSLog(@"%@", [obj class]);   // prints: __NSArrayI
```

The same `obj` variable starts out as a string and then becomes an array.

The compiler doesn't stop you, because it defers the actual type check to runtime.

The same logic applies when sending messages. When you call `[obj length]`, the compiler has no way of knowing at compile time whether `obj` will actually respond to `length`.

At runtime, the system looks up `obj`'s class at that exact moment, finds the matching method, and executes it. This is called message dispatch.

Here's the comparison in a nutshell:

- Static typing: the compiler pins down and checks the type ahead of time
- Dynamic typing: the actual object is examined and resolved while the program is running

> In Objective-C, `id` and dynamic typing are the product of a single philosophy: "put it in first, and ask what it really is when you actually run it."

---

## What duck typing actually means

There's a spot where a lot of people get tripped up. Duck typing often gets lumped together as simply "skipping type checks."

But the original phrase behind it goes like this:

"If it walks like a duck and quacks like a duck, then it's a duck."

What matters isn't which class an object belongs to — it's whether it can respond to a given message.

In Objective-C, you can check this directly with `respondsToSelector:`.

```objc
// It doesn't matter what class this is — as long as it responds to this method, call it
if ([obj respondsToSelector:@selector(quack)]) {
    [obj quack];  // if it can quack like a duck, treat it as a duck
}
```

Here, it makes no difference whether `obj` is a `Duck` class or a `Robot` class.

As long as it responds to the `quack` message, our code treats it as a "duck."

This is a different flavor of polymorphism than the inheritance-based kind.

Even classes with no relationship to each other, that don't share a common parent class, can be handled identically as long as they share the same method name.

This flexibility is exactly what makes core Cocoa design patterns like delegation and target-action possible in the first place.

<figure>
  <img src="/assets/images/posts/985ef22b-6988-47cb-adf2-a9d803086c51/2.png" alt="There's something fun about the idea that just responding to a method makes you a duck">
  <figcaption>There's something fun about the idea that just responding to a method makes you a duck</figcaption>
</figure>

---

## id is convenient, but risky — when to be careful

`id`'s freedom comes with a price.

Since the compiler barely does any type checking, sending a message the object can't respond to will still compile fine — and then crash your app at runtime.

That's the infamous `unrecognized selector sent to instance` crash.

So in practice, developers tend to follow these guidelines:

- If the type is known for certain, use a concrete class (`NSString *`, etc.) instead of `id`
- If you really do need `id`, guard the call with `respondsToSelector:` beforehand
- Define a delegate protocol to document "this object responds to this message"

With `instancetype` and generics (`NSArray<NSString *> *`) now available, careless use of `id` has become far less common.

Still, deep in framework internals and runtime-level code, `id` keeps beating like a heart.

<figure>
  <img src="/assets/images/posts/985ef22b-6988-47cb-adf2-a9d803086c51/3.png" alt="This red log message is the face you meet most often when id goes wrong">
  <figcaption>This red log message is the face you meet most often when id goes wrong</figcaption>
</figure>

---

To sum up: `id` is the type that embodies Objective-C's dynamic nature, and dynamic typing and duck typing both trace back to a single underlying philosophy — judging an object by its behavior, not its class.

It might look unfamiliar and even risky at first, but once you understand the principle behind it, the design of the Cocoa frameworks starts to make a lot more sense.

Hopefully `id` feels a little less intimidating now than when you started reading. Happy Objective-C studying!
