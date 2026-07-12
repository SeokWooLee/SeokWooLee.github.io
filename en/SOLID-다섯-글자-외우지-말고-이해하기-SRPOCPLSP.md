---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "The Five Letters of SOLID, Understood Not Memorized (SRP, OCP, LSP)"
lang: en
description: "\"Explain the SOLID principles\" — pretty much everyone has fielded that interview question at some point."
header:
  og_image: /assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/1.png
tags:
  - SOLID principles
  - SRP
  - OCP
  - LSP
  - object-oriented design
  - single responsibility principle
  - liskov substitution principle
  - software design principles
  - clean code
  - software engineering
permalink: /en/SOLID-다섯-글자-외우지-말고-이해하기-SRPOCPLSP/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/SOLID-%EB%8B%A4%EC%84%AF-%EA%B8%80%EC%9E%90-%EC%99%B8%EC%9A%B0%EC%A7%80-%EB%A7%90%EA%B3%A0-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-SRPOCPLSP/) · **English** · [日本語](/ja/SOLID-%EB%8B%A4%EC%84%AF-%EA%B8%80%EC%9E%90-%EC%99%B8%EC%9A%B0%EC%A7%80-%EB%A7%90%EA%B3%A0-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-SRPOCPLSP/) · [中文](/zh/SOLID-%EB%8B%A4%EC%84%AF-%EA%B8%80%EC%9E%90-%EC%99%B8%EC%9A%B0%EC%A7%80-%EB%A7%90%EA%B3%A0-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-SRPOCPLSP/)
{: .notice--info}

"Explain the SOLID principles" — pretty much everyone has fielded that interview question at some point.

But honestly, most of us can rattle off the five letters and still draw a blank when it comes to "okay, so how does this actually apply to my code?" I was in that boat for a while myself.

So this time I want to walk through SOLID as real working scenarios instead of textbook definitions. It's a lot of ground to cover, so I'm splitting it into two posts. Today covers the first three letters: SRP, OCP, and LSP.

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/1.png" alt="Today we're covering the first three of the five letters">
  <figcaption>Today we're covering the first three of the five letters</figcaption>
</figure>

SOLID is an acronym for five object-oriented design principles laid out by Robert C. Martin (Uncle Bob).

- **S**RP — Single Responsibility Principle
- **O**CP — Open-Closed Principle
- **L**SP — Liskov Substitution Principle
- **I**SP — Interface Segregation Principle
- **D**IP — Dependency Inversion Principle

They look like five unrelated ideas at first glance, but they're all pointing at the same thing: shrink the blast radius of a change. When something needs to change, you want to touch as little code as possible.

---

## SRP — Single Responsibility Principle

The textbook definition is "a class should have only one responsibility," but Uncle Bob himself later rephrased it into something sharper.

> A module should be responsible to one, and only one, actor.

Here, an "actor" means the person (or department) who would ask for that code to change. Take a class like this:

```javascript
class Employee {
  calculatePay() { ... }    // Accounting wants changes here
  reportHours() { ... }     // HR wants changes here
  save() { ... }            // Engineering (DBAs) wants changes here
}
```

All three methods answer to a different owner. If accounting requests a change to `calculatePay` and the edit touches shared logic along the way, HR's reports can quietly break. When something like that actually happens, it's brutal to trace back to the cause.

SRP boils this down to a simple rule: if different people ask for changes, the code should live in different places. Split payroll calculation, hours reporting, and persistence into separate classes, and an accounting request can no longer reach into HR's territory.

---

## OCP — Open-Closed Principle

The definition is "open for extension, closed for modification." Sounds cryptic the first time you hear it, but it clicks once you see it in code.

```javascript
// If you have to edit this function every time a new payment method shows up...
function pay(method, amount) {
  if (method === 'card') { ... }
  else if (method === 'kakaopay') { ... }
  else if (method === 'naverpay') { ... }
  // new payment method = new else if = editing existing code
}
```

With this structure, adding a new payment provider means cracking open a function that already works and modifying it. Every edit risks breaking a payment method that used to work fine.

```javascript
// A structure where adding a new payment method means only 'adding' code
const payments = {
  card: new CardPayment(),
  kakaopay: new KakaoPayment(),
  naverpay: new NaverPayment(),
  // adding a new provider = register one new class
};

function pay(method, amount) {
  return payments[method].process(amount);
}
```

Here, existing code stays untouched (closed for modification), and new functionality just means adding a new class (open for extension). The trick is applying this pattern only at the points that actually change often. Slap it everywhere and you end up violating YAGNI, which I covered in an earlier post.

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/4-1783848080106.png" alt="Adding Toss Pay is as simple as tacking on one more class">
  <figcaption>Adding Toss Pay is as simple as tacking on one more class</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/2.png" alt="OCP means responding by adding, not modifying">
  <figcaption>OCP means responding by adding, not modifying</figcaption>
</figure>

---

## LSP — Liskov Substitution Principle

It has the scariest-sounding name of the five, but the idea itself is simple.

> A subclass should be substitutable for its parent class without breaking the program.

The classic counterexample is the rectangle-square problem. If you follow the mathematical logic that "a square is a rectangle" and model it as inheritance, here's what happens:

```javascript
class Rectangle {
  setWidth(w) { this.width = w; }
  setHeight(h) { this.height = h; }
}

class Square extends Rectangle {
  setWidth(w) { this.width = w; this.height = w; }  // because it's a square
  setHeight(h) { this.width = h; this.height = h; }
}

// code that expects a rectangle
function test(rect) {
  rect.setWidth(5);
  rect.setHeight(4);
  console.log(rect.width * rect.height); // expects 20, but gets 16 for a Square
}
```

The moment you pass in a Square, the reasonable expectation of "width 5, height 4, area 20" falls apart. Even when an is-a relationship looks valid on paper, LSP says you shouldn't inherit if it breaks the behavioral contract.

Here's the practical tell: if a subclass overrides a parent method just to throw an exception or leave it empty, that inheritance relationship is probably violating LSP.

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/3.png" alt="Turns out a square just doesn't fit where a rectangle should go">
  <figcaption>Turns out a square just doesn't fit where a rectangle should go</figcaption>
</figure>

---

## Wrapping up part one

Here's each of today's three principles boiled down to one line:

- **SRP** — If a different person asks for the change, the code should live in a different place.
- **OCP** — Design the parts that change often so you can respond by adding, not modifying.
- **LSP** — A subclass shouldn't break its parent's contract. If it has to, the inheritance itself is the mistake.

Next time, I'll cover the remaining two letters: ISP (Interface Segregation) and DIP (Dependency Inversion). DIP in particular ties directly into why so many modern frameworks lean on dependency injection, so that one should be fun.
