---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "SOLID Five Letters: Understanding Instead of Memorizing (SRP, OCP, LSP)"
lang: en
description: "You've probably been asked \"Can you explain the SOLID principles?\" in an interview at least once."
header:
  og_image: /assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/1.png
tags:
  - SOLID principles
  - SRP
  - OCP
  - LSP
  - object-oriented design
  - single responsibility principle
  - liskov substitution
  - software design principles
  - clean code
  - programming
permalink: /en/SOLID-다섯-글자-외우지-말고-이해하기-SRPOCPLSP/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/SOLID-%EB%8B%A4%EC%84%AF-%EA%B8%80%EC%9E%90-%EC%99%B8%EC%9A%B0%EC%A7%80-%EB%A7%90%EA%B3%A0-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-SRPOCPLSP/) · **English** · [日本語](/ja/SOLID-%EB%8B%A4%EC%84%AF-%EA%B8%80%EC%9E%90-%EC%99%B8%EC%9A%B0%EC%A7%80-%EB%A7%90%EA%B3%A0-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-SRPOCPLSP/) · [中文](/zh/SOLID-%EB%8B%A4%EC%84%AF-%EA%B8%80%EC%9E%90-%EC%99%B8%EC%9A%B0%EC%A7%80-%EB%A7%90%EA%B3%A0-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-SRPOCPLSP/)
{: .notice--info}

You've probably been asked "Can you explain the SOLID principles?" in an interview at least once.

But honestly, plenty of us can rattle off all five letters and still hit a wall at "okay, so how does that actually apply to my code?"

So this time, instead of textbook definitions, let's walk through SOLID as real working scenarios. There's enough ground to cover that I'm splitting it into two parts. Today: the first three letters — SRP, OCP, and LSP.

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/1.png" alt="Three down, two to go — starting with the first three letters today">
  <figcaption>Three down, two to go — starting with the first three letters today</figcaption>
</figure>

SOLID is an acronym for five object-oriented design principles compiled by Robert C. Martin (Uncle Bob).

- **S**RP — Single Responsibility Principle
- **O**CP — Open-Closed Principle
- **L**SP — Liskov Substitution Principle
- **I**SP — Interface Segregation Principle
- **D**IP — Dependency Inversion Principle

Each of the five sounds like it's making a different point, but they all funnel into one message: shrink the blast radius of code you have to touch when something changes.

---

## SRP — Single Responsibility Principle

The textbook definition is "a class should have only one responsibility," but Uncle Bob himself later rephrased it more precisely:

> A module should be responsible to one, and only one, actor.

Here, an "actor" means the person (or department) who might ask for that code to change. Take this class as an example:

```swift
class Employee {
    func calculatePay() { ... }   // Accounting wants this changed
    func reportHours() { ... }    // HR wants this changed
    func save() { ... }           // Engineering (DBAs) want this changed
}
```

All three methods answer to different owners. If a change to `calculatePay()` requested by Accounting ends up touching shared logic, HR's reports quietly break. And when that kind of incident actually happens, it's genuinely hard to trace back to the cause.

SRP boils this down to: "if different people ask for changes, keep the code separate." Split pay calculation, hours reporting, and persistence into their own classes, and a request from Accounting can no longer reach into HR's functionality.

---

## OCP — Open-Closed Principle

The definition is "open for extension, closed for modification." It sounds like a riddle at first, but it's obvious once you see it in code.

```swift
// If you have to edit this function every time a payment method is added...
func pay(method: String, amount: Int) {
    if method == "card" { ... }
    else if method == "kakaopay" { ... }
    else if method == "naverpay" { ... }
    // New payment method = new else-if = editing existing code
}
```

With this structure, adding a new payment provider means cracking open a function that already works and modifying it. Every edit risks breaking a payment method that was working fine before.

```swift
// A structure where adding a new payment method just means 'adding', not editing
let payments: [String: Payment] = [
    "card": CardPayment(),
    "kakaopay": KakaoPayment(),
    "naverpay": NaverPayment(),
    // Adding a new provider = one line registering a new class
]

func pay(method: String, amount: Int) {
    payments[method]?.process(amount: amount)
}
```

Existing code stays untouched (closed for modification), while new classes let you add functionality (open for extension). The trick is applying this pattern only where things actually change often. Slap it on everything and you're violating YAGNI, which we covered last time.

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/4-1783848080106.png" alt="Adding Toss Pay is as simple as bolting on one more class">
  <figcaption>Adding Toss Pay is as simple as bolting on one more class</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/2.png" alt="OCP means responding by adding, not editing">
  <figcaption>OCP means responding by adding, not editing</figcaption>
</figure>

---

## LSP — Liskov Substitution Principle

The name sounds the scariest of the three, but the idea is simple.

> A subclass should be substitutable for its parent class anywhere the parent is used, without breaking the program.

The classic counterexample is the rectangle-square problem. If you follow the mathematical intuition that "a square is a rectangle" and model it as inheritance, here's what happens:

```swift
class Rectangle {
    var width = 0
    var height = 0
    func setWidth(_ w: Int) { width = w }
    func setHeight(_ h: Int) { height = h }
}

class Square: Rectangle {
    override func setWidth(_ w: Int) { width = w; height = w }  // because it's a square
    override func setHeight(_ h: Int) { width = h; height = h }
}

// Code that expects a Rectangle
func test(_ rect: Rectangle) {
    rect.setWidth(5)
    rect.setHeight(4)
    print(rect.width * rect.height) // expects 20, but gets 16 if it's a Square
}
```

The moment you pass in a Square, the reasonable expectation of "width 5, height 4, area 20" falls apart. Even when an is-a relationship seems to hold, LSP says you shouldn't inherit if it breaks the behavioral contract.

Here's the practical tell: if a subclass overrides a parent method just to throw an exception or leave it empty, that inheritance relationship is very likely violating LSP.

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/3.png" alt="Turns out a square just can't fit where a rectangle should go">
  <figcaption>Turns out a square just can't fit where a rectangle should go</figcaption>
</figure>

---

## Wrapping Up Part One

Here's each of today's three principles in one line:

- **SRP** — If different people ask for changes, keep the code separate.
- **OCP** — Build the spots that change often so you can respond by adding, not editing.
- **LSP** — A subclass shouldn't break its parent's contract. If it has to, the inheritance is wrong to begin with.

Next time, I'll cover the remaining two letters — ISP (Interface Segregation) and DIP (Dependency Inversion). DIP in particular ties directly into why modern frameworks all lean so heavily on dependency injection, so that one should be fun.
