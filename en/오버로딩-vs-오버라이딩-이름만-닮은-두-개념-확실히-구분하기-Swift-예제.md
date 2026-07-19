---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Overloading vs. Overriding: Two Concepts That Only Sound Alike (Swift Examples)"
lang: en
description: "Overloading and overriding. Do the names really need to be this similar?"
header:
  og_image: /assets/images/posts/f43ad7f1-a220-4a59-80c0-43700ea3bb2b/1.png
tags:
  - overloading
  - overriding
  - polymorphism
  - inheritance
  - Swift
  - dynamic dispatch
  - static dispatch
  - OOP
  - technical interview
  - CS fundamentals
permalink: /en/오버로딩-vs-오버라이딩-이름만-닮은-두-개념-확실히-구분하기-Swift-예제/
toc: true
toc_sticky: true
last_modified_at: 2026-07-19
---

🌐 [한국어](/%EC%98%A4%EB%B2%84%EB%A1%9C%EB%94%A9-vs-%EC%98%A4%EB%B2%84%EB%9D%BC%EC%9D%B4%EB%94%A9-%EC%9D%B4%EB%A6%84%EB%A7%8C-%EB%8B%AE%EC%9D%80-%EB%91%90-%EA%B0%9C%EB%85%90-%ED%99%95%EC%8B%A4%ED%9E%88-%EA%B5%AC%EB%B6%84%ED%95%98%EA%B8%B0-Swift-%EC%98%88%EC%A0%9C/) · **English** · [日本語](/ja/%EC%98%A4%EB%B2%84%EB%A1%9C%EB%94%A9-vs-%EC%98%A4%EB%B2%84%EB%9D%BC%EC%9D%B4%EB%94%A9-%EC%9D%B4%EB%A6%84%EB%A7%8C-%EB%8B%AE%EC%9D%80-%EB%91%90-%EA%B0%9C%EB%85%90-%ED%99%95%EC%8B%A4%ED%9E%88-%EA%B5%AC%EB%B6%84%ED%95%98%EA%B8%B0-Swift-%EC%98%88%EC%A0%9C/) · [中文](/zh/%EC%98%A4%EB%B2%84%EB%A1%9C%EB%94%A9-vs-%EC%98%A4%EB%B2%84%EB%9D%BC%EC%9D%B4%EB%94%A9-%EC%9D%B4%EB%A6%84%EB%A7%8C-%EB%8B%AE%EC%9D%80-%EB%91%90-%EA%B0%9C%EB%85%90-%ED%99%95%EC%8B%A4%ED%9E%88-%EA%B5%AC%EB%B6%84%ED%95%98%EA%B8%B0-Swift-%EC%98%88%EC%A0%9C/)
{: .notice--info}

Overloading and overriding. Do the names really need to be this similar?

They're a recurring pair in exams and interviews, and the confusion mostly comes down to the names themselves. The actual mechanics are completely different. One means "defining several functions with the same name," the other means "redefining an inherited function."

They're also resolved at different times. One is decided at compile time, the other at runtime — and that distinction is what leads into the static dispatch vs. dynamic dispatch conversation, performance and all.

This post draws a clear line between the two using Swift examples.

<figure>
  <img src="/assets/images/posts/f43ad7f1-a220-4a59-80c0-43700ea3bb2b/1.png" alt="Overload piles several functions onto one name; override writes over the parent's definition">
  <figcaption>Overload piles several functions onto one name; override writes over the parent's definition</figcaption>
</figure>

Here's the core summary.

1. Overloading: defining multiple functions with the same name but different parameters. Has nothing to do with inheritance.
2. Overriding: a subclass redefines a method it inherited from its parent. Inheritance is required.
3. Overloading is resolved at compile time; overriding is resolved at runtime — which function gets called is decided differently for each.
4. Overriding is the core mechanism behind polymorphism.

---

## Overloading: The Same Name, Multiple Times

Overloading means defining several functions that share a name but differ in their parameter makeup — count, type, or labels.

```swift
func area(radius: Double) -> Double { .pi * radius * radius }
func area(width: Double, height: Double) -> Double { width * height }
func area(side: Double) -> Double { side * side }
```

The compiler looks at the arguments passed at the call site and decides which function to use. The moment you write `area(radius: 3)`, it's already locked in as the first function. This gets settled before the code even runs.

It helps to think back to C, which didn't have this feature. The absolute-value function had a different name for every type — `abs`, `labs`, `fabs`. Overloading is the mechanism that lets you keep the name the same when the concept is the same.

Swift leans on overloading throughout its standard library, in places like `print(_:)` and `min(_:_:)`. Operator overloading is another example — a single `+` handles integer addition, string concatenation, and array combination all at once.

One thing to watch out for: avoid overloading that differs only in return type. Swift technically allows this in some cases, but without an explicit type at the call site you'll hit an ambiguity error, and it tends to confuse readers too.

---

## Overriding: Redefining What You Inherited

Overriding means a subclass redefines, with the same signature, a method it inherited from its parent class. It only makes sense in an inheritance relationship.

```swift
class Animal {
    func speak() { print("...") }
}
class Dog: Animal {
    override func speak() { print("Woof") }
}
class Cat: Animal {
    override func speak() { print("Meow") }
}
```

The key moment is this one:

```swift
let animals: [Animal] = [Dog(), Cat()]
for animal in animals {
    animal.speak() // Woof, Meow
}
```

The variable's type is `Animal`, but what actually runs is the method on the concrete instance. Which `speak` gets called is decided at runtime by looking at the real object — that's dynamic dispatch, and it's the mechanism that makes polymorphism work.

It's also worth noting that Swift requires the `override` keyword. The compiler catches mistakes where you'd otherwise accidentally match a parent's signature, or fail to actually override due to a typo. Conversely, marking a parent method `final` lets you forbid it from being overridden at all.

<figure>
  <img src="/assets/images/posts/f43ad7f1-a220-4a59-80c0-43700ea3bb2b/2.png" alt="Even though the variable's type is Animal, what runs is the actual instance's method">
  <figcaption>Even though the variable's type is Animal, what runs is the actual instance's method</figcaption>
</figure>

---

## Side-by-Side Comparison

| | Overloading | Overriding |
|---|---|---|
| Definition | Same name, different parameters | Redefines the same signature |
| Inheritance | Not required | Required |
| Resolved at | Compile time (static) | Runtime (dynamic) |
| Purpose | Naming consistency, API convenience | Polymorphism, swapping behavior |
| Swift keyword | None | `override` (required), blocked with `final` |

The difference in when things get resolved also ties into performance. A call that's locked in at compile time (static dispatch) can jump straight to its target, but a runtime decision (dynamic dispatch) has to go through the actual type's method table. In Swift, adding `final` or `private` gives the compiler room to turn dynamic dispatch into static dispatch and optimize accordingly.

<figure>
  <img src="/assets/images/posts/f43ad7f1-a220-4a59-80c0-43700ea3bb2b/3.png" alt="Overloading is resolved at compile time, overriding at runtime">
  <figcaption>Overloading is resolved at compile time, overriding at runtime</figcaption>
</figure>

---

## A Way to Keep Them Straight

The English words themselves are the easiest mnemonic.

**Overload = pile on.** You're "loading" multiple functions onto the same name. One name, several capabilities.

**Override = write over, step past.** You're "overwriting" the parent's definition. One definition, swapped-out contents.

For an interview, this is a solid way to open your answer:

> "Overloading means having multiple functions with the same name but different parameters, resolved at compile time. Overriding means redefining an inherited method, resolved at runtime based on the actual type. Overriding is what makes polymorphism possible."

---

## Recap

- Overloading: defining multiple functions that share a name but differ in parameters. No inheritance required.
- Overriding: a subclass redefines a parent method with the same signature. Inheritance required.
- Overloading is resolved at compile time (static); overriding is resolved at runtime (dynamic).
- The core mechanism behind polymorphism is overriding paired with dynamic dispatch.
- Swift enforces the `override` keyword to prevent mistakes, and `final` can block overriding entirely.
- Mnemonic: Overload piles functions onto a name; override writes over a definition.
