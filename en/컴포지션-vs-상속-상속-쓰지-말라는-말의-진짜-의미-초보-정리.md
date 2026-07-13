---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Composition vs. Inheritance: What \"Don't Use Inheritance\" Actually Means (A Beginner's Guide)"
lang: en
description: "If you've spent any time studying object-oriented programming, you've run into this line: \"Favor composition over inheritance.\""
header:
  og_image: /assets/images/posts/f5446abb-6193-4732-8d28-c18476184490/1.png
tags:
  - composition
  - inheritance
  - object-oriented programming
  - OOP
  - design patterns
  - Liskov Substitution Principle
  - code design
  - Java
  - learning to code
  - programming fundamentals
permalink: /en/컴포지션-vs-상속-상속-쓰지-말라는-말의-진짜-의미-초보-정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/%EC%BB%B4%ED%8F%AC%EC%A7%80%EC%85%98-vs-%EC%83%81%EC%86%8D-%EC%83%81%EC%86%8D-%EC%93%B0%EC%A7%80-%EB%A7%90%EB%9D%BC%EB%8A%94-%EB%A7%90%EC%9D%98-%EC%A7%84%EC%A7%9C-%EC%9D%98%EB%AF%B8-%EC%B4%88%EB%B3%B4-%EC%A0%95%EB%A6%AC/) · **English** · [日本語](/ja/%EC%BB%B4%ED%8F%AC%EC%A7%80%EC%85%98-vs-%EC%83%81%EC%86%8D-%EC%83%81%EC%86%8D-%EC%93%B0%EC%A7%80-%EB%A7%90%EB%9D%BC%EB%8A%94-%EB%A7%90%EC%9D%98-%EC%A7%84%EC%A7%9C-%EC%9D%98%EB%AF%B8-%EC%B4%88%EB%B3%B4-%EC%A0%95%EB%A6%AC/)
{: .notice--info}

# Composition vs. Inheritance: What "Don't Use Inheritance" Actually Means

If you've spent any time studying object-oriented programming, you've run into this line: "Favor composition over inheritance."

Let's get straight to the point: this doesn't mean "never use inheritance." It means "don't reach for inheritance just to reuse code." Inheritance is still a perfectly valid tool, but in most situations where you need reuse, composition is the safer choice.

<figure>
  <img src="/assets/images/posts/f5446abb-6193-4732-8d28-c18476184490/1.png" alt="Composition vs. inheritance — the fork in the road shows up right from the start">
  <figcaption>Composition vs. inheritance — the fork in the road shows up right from the start</figcaption>
</figure>

In this post, we'll look at how the two approaches actually diverge in real code, and when you should reach for which.

## What's the Difference Between Inheritance and Composition?

Let's start with a simple distinction.

Inheritance models an "is-a" relationship. A dog is an animal, that kind of thing. The child class inherits the parent class's functionality wholesale.

Composition models a "has-a" relationship. A car has an engine, for example. You embed an object that has the functionality you need inside your class, and delegate work to it.

This makes more sense with code. Here's an example of inheriting functionality:

```swift
// Inheritance: Stack inherits every method from NSMutableArray
class Stack: NSMutableArray {
    func push(_ o: Any) { add(o) }
    func pop() -> Any {
        let o = lastObject!
        removeLastObject()
        return o
    }
}
```

The problem here is that Stack now exposes methods like insert(_:at:) and removeObject(at:) to the outside world — methods it never wanted to offer in the first place.

Here's the same thing rewritten with composition:

```swift
// Composition: delegate only the functionality you need
class Stack {
    private var list: [Any] = []
    func push(_ o: Any) { list.append(o) }
    func pop() -> Any { list.removeLast() }
}
```

The array is tucked away inside, and only the operations we actually want are exposed. What's left is exactly what Stack is supposed to do — nothing more.

<figure>
  <img src="/assets/images/posts/f5446abb-6193-4732-8d28-c18476184490/4-1783847882592.png" alt="Inheritance hands you everything; composition hands you only what you need">
  <figcaption>Inheritance hands you everything; composition hands you only what you need</figcaption>
</figure>

---

## What "Don't Use Inheritance" Really Means

This advice comes from two well-known weaknesses of inheritance.

First, it breaks encapsulation. The child class ends up depending on the parent's internal implementation. If the parent's code changes, a child that was working perfectly fine can suddenly break.

Second, it creates very tight coupling. Parent and child are locked together at compile time, which makes it hard to change the relationship later on.

> Inheritance is a tool for defining types, not a tool for reusing code.

That line is the whole point. The moment you reach for inheritance purely to reuse code, the relationship starts to go sideways.

The classic example is squares and rectangles. Mathematically, a square is a rectangle, so inheriting seems reasonable. But the moment a square inherits a rectangle's ability to "change width and height independently," it stops being a square.

Even when something looks like an is-a relationship, if the behavior can't be fully substituted, inheritance becomes a trap.

---

## So When Is It Okay to Use Inheritance?

Inheritance isn't inherently bad. When all of the following conditions are met, inheritance is actually the cleaner choice.

1. Is it a genuine is-a relationship? Is the child always a kind of the parent?
2. Does it satisfy the Liskov Substitution Principle? Can you swap in the child wherever the parent is expected, with no issues?
3. Was the parent designed with inheritance in mind? Is it documented and open for extension?

If all three hold, go ahead and use inheritance. Extending a framework base class like UIViewController is a typical example.

On the other hand, if even one of these is shaky, reach for composition first.

Here's a quick comparison table.

| Situation | Recommendation |
|------|------|
| A pure is-a relationship with full substitutability | Inheritance |
| Just want to reuse some code | Composition |
| Want to swap behavior at runtime | Composition |
| Need to combine multiple capabilities | Composition |

As you can see, most situations you'll actually run into in practice lean toward composition. The advice to "favor composition" didn't come out of nowhere.

<figure>
  <img src="/assets/images/posts/f5446abb-6193-4732-8d28-c18476184490/2.png" alt="Laid out in a table, it's easy to see at a glance when to use which">
  <figcaption>Laid out in a table, it's easy to see at a glance when to use which</figcaption>
</figure>

---

## How I Make the Call in Practice

When creating a new class, it helps to habitually ask: "Is this a kind of the parent, or do I just want to borrow the parent's functionality?"

If it's the latter, composition is almost always the way to go.

Design patterns make the direction pretty clear too. Patterns like Strategy and Decorator are all built on composition.

The Strategy pattern in particular separates behavior into its own object and swaps it in at runtime — a level of flexibility that's hard to replicate with inheritance.

<figure>
  <img src="/assets/images/posts/f5446abb-6193-4732-8d28-c18476184490/3.png" alt="Swapping pieces in and out like this is what makes composition so appealing">
  <figcaption>Swapping pieces in and out like this is what makes composition so appealing</figcaption>
</figure>

Of course, this comes with a small cost: the code gets a bit longer, since you have to write out the delegating methods yourself. Still, it makes restructuring things down the line much easier.

---

"Don't use inheritance" isn't a ban on inheritance — it's a warning against overusing it for the sake of reuse. If it's clearly an is-a relationship, use inheritance; if you just want to borrow some functionality, use composition. Keep that one rule of thumb in mind, and your code will end up noticeably more solid. Here's to good design!
