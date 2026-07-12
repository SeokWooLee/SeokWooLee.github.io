---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "SOLID's Five Letters: Understanding Instead of Memorizing (SRP, OCP, LSP)"
lang: en
description: "\"Can you explain the SOLID principles?\" — I'm sure most of you have been asked this in an interview at least once."
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
last_modified_at: 2026-07-12
---

🌐 [한국어](/SOLID-%EB%8B%A4%EC%84%AF-%EA%B8%80%EC%9E%90-%EC%99%B8%EC%9A%B0%EC%A7%80-%EB%A7%90%EA%B3%A0-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-SRPOCPLSP/) · **English** · [日本語](/ja/SOLID-%EB%8B%A4%EC%84%AF-%EA%B8%80%EC%9E%90-%EC%99%B8%EC%9A%B0%EC%A7%80-%EB%A7%90%EA%B3%A0-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-SRPOCPLSP/)
{: .notice--info}

"Can you explain the SOLID principles?" — I'm sure most of you have been asked this in an interview at least once.

But honestly, even if you can rattle off all five letters, it's rare for the answer to actually connect to "okay, so how do I use this in my own code?" I was the same way for a long time.

So this time, I want to break down SOLID not as textbook definitions, but through real-world scenes from actual work. There's a lot of ground to cover, so I'm splitting it into two parts. Today covers the first three letters: SRP, OCP, and LSP.

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/1.png" alt="Today we're starting with the first three of the five letters">
  <figcaption>Today we're starting with the first three of the five letters</figcaption>
</figure>

SOLID is an acronym for five object-oriented design principles compiled by Robert Martin (Uncle Bob).

- **S**RP — Single Responsibility Principle
- **O**CP — Open-Closed Principle
- **L**SP — Liskov Substitution Principle
- **I**SP — Interface Segregation Principle
- **D**IP — Dependency Inversion Principle

Each of the five seems to be making a different point, but there's one message running through all of them: when a change happens, shrink the scope of code you have to touch.

---

## SRP — Single Responsibility Principle

The textbook definition is "a class should have only one responsibility," but Uncle Bob himself later rephrased it more precisely.

> A module should be responsible to one, and only one, actor.

Here, "actor" means the person (or department) who demands changes to that code. Take this class as an example:

```javascript
class Employee {
  calculatePay() { ... }    // Accounting asks for changes here
  reportHours() { ... }     // HR asks for changes here
  save() { ... }            // Engineering (DBA) asks for changes here
}
```

All three methods answer to different owners. If a change requested by Accounting to `calculatePay` accidentally touches shared logic, HR's report quietly breaks. When something like this actually happens, it's a nightmare to trace.

SRP boils this down to: "if different people are asking for the changes, separate the code too." Split pay calculation, hours reporting, and saving into separate classes, and Accounting's requests will never touch HR's functionality.

---

## OCP — Open-Closed Principle

The definition is "open for extension, closed for modification." It sounds like a riddle at first, but it's clear once you see it in code.

```javascript
// If you have to modify this function every time a new payment method is added
function pay(method, amount) {
  if (method === 'card') { ... }
  else if (method === 'kakaopay') { ... }
  else if (method === 'naverpay') { ... }
  // New payment method = new else-if = modifying existing code
}
```

With this structure, adding a new payment provider means opening up a function that was already working fine and editing it. Every edit risks breaking one of the existing payment methods.

```javascript
// A structure where adding a new payment method just means 'adding' something
const payments = {
  card: new CardPayment(),
  kakaopay: new KakaoPayment(),
  naverpay: new NaverPayment(),
  // Adding a new provider = one line registering a new class
};

function pay(method, amount) {
  return payments[method].process(amount);
}
```

You never touch the existing code (closed for modification), and functionality grows just by adding a new class (open for extension). The trick is to only apply this structure at points that change frequently. If you apply it everywhere, you end up violating YAGNI, which I covered in the last post.

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/2.png" alt="Responding by adding instead of modifying — that's OCP">
  <figcaption>Responding by adding instead of modifying — that's OCP</figcaption>
</figure>

---

## LSP — Liskov Substitution Principle

The name sounds the scariest, but the idea is simple.

> A subclass should be substitutable for its parent class anywhere the parent is used, without breaking the program.

The classic counterexample is the rectangle-square problem. If you follow the mathematical common sense that "a square is a rectangle" and set up inheritance accordingly, this happens:

```javascript
class Rectangle {
  setWidth(w) { this.width = w; }
  setHeight(h) { this.height = h; }
}

class Square extends Rectangle {
  setWidth(w) { this.width = w; this.height = w; }  // because it's a square
  setHeight(h) { this.width = h; this.height = h; }
}

// Code that expects a rectangle
function test(rect) {
  rect.setWidth(5);
  rect.setHeight(4);
  console.log(rect.width * rect.height); // expects 20, but gets 16 if it's a Square
}
```

The moment you pass in a Square, the reasonable expectation of "width 5, height 4, so area 20" breaks down. Even if the is-a relationship seems to hold, LSP says you shouldn't use inheritance if it breaks the behavioral contract.

Here's the practical warning sign: if a subclass overrides a parent method by throwing an exception or leaving it as an empty implementation, that inheritance is likely violating LSP.

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/3.png" alt="Turns out a square just doesn't fit where a rectangle belongs">
  <figcaption>Turns out a square just doesn't fit where a rectangle belongs</figcaption>
</figure>

---

## Wrapping up Part One

Let me leave you with one line each for the three principles covered today.

- **SRP** — If different people are asking for changes, separate the code too.
- **OCP** — Build the frequently-changing points so you can respond by adding, not modifying.
- **LSP** — A subclass must not break its parent's contract. If it has to, the inheritance itself is wrong.

In the next part, I'll cover the remaining two letters: ISP (Interface Segregation) and DIP (Dependency Inversion). DIP in particular ties directly into why modern frameworks all rely on dependency injection, so that one should be fun.
