---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Library vs. Framework: The Real Distinction Is \"Who Calls Whom\" (Inversion of Control)"
lang: en
description: "Alamofire is called a library, and SwiftUI is called a framework. But aren't both just \"code someone else wrote that you use\"? What's actually different?"
header:
  og_image: /assets/images/posts/479c5583-9372-4e43-b639-e3c2b91852ac/1.png
tags:
  - library vs framework
  - inversion of control
  - IoC
  - Hollywood Principle
  - SwiftUI
  - UIKit
  - delegate pattern
  - iOS interview questions
  - CS fundamentals
  - swift programming
permalink: /en/라이브러리-vs-프레임워크-기준은-누가-누구를-호출하나-제어의-역전/
toc: true
toc_sticky: true
last_modified_at: 2026-07-20
---

🌐 [한국어](/%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC-vs-%ED%94%84%EB%A0%88%EC%9E%84%EC%9B%8C%ED%81%AC-%EA%B8%B0%EC%A4%80%EC%9D%80-%EB%88%84%EA%B0%80-%EB%88%84%EA%B5%AC%EB%A5%BC-%ED%98%B8%EC%B6%9C%ED%95%98%EB%82%98-%EC%A0%9C%EC%96%B4%EC%9D%98-%EC%97%AD%EC%A0%84/) · **English** · [日本語](/ja/%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC-vs-%ED%94%84%EB%A0%88%EC%9E%84%EC%9B%8C%ED%81%AC-%EA%B8%B0%EC%A4%80%EC%9D%80-%EB%88%84%EA%B0%80-%EB%88%84%EA%B5%AC%EB%A5%BC-%ED%98%B8%EC%B6%9C%ED%95%98%EB%82%98-%EC%A0%9C%EC%96%B4%EC%9D%98-%EC%97%AD%EC%A0%84/) · [中文](/zh/%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC-vs-%ED%94%84%EB%A0%88%EC%9E%84%EC%9B%8C%ED%81%AC-%EA%B8%B0%EC%A4%80%EC%9D%80-%EB%88%84%EA%B0%80-%EB%88%84%EA%B5%AC%EB%A5%BC-%ED%98%B8%EC%B6%9C%ED%95%98%EB%82%98-%EC%A0%9C%EC%96%B4%EC%9D%98-%EC%97%AD%EC%A0%84/)
{: .notice--info}

Alamofire is called a library, and SwiftUI is called a framework. But aren't both just "code someone else wrote that you use"? What's actually different?

The common answer is "a framework is just bigger," but size isn't the essence. There are small frameworks and massive libraries.

There's really only one criterion that matters. **Who calls whom.**

Once you lock in on this single criterion, it connects naturally to an important concept: Inversion of Control (IoC). You'll run into this again when you study dependency injection, so getting it right here pays off.

<figure>
  <img src="/assets/images/posts/479c5583-9372-4e43-b639-e3c2b91852ac/1.png" alt="Pull it from the toolbox and it's a library; fill in the skeleton and it's a framework">
  <figcaption>Pull it from the toolbox and it's a library; fill in the skeleton and it's a framework</figcaption>
</figure>

Here's the core summary.

1. Library: a toolkit your code calls when it needs it. You hold the control
2. Framework: a skeleton that holds the flow and "calls" your code. The framework holds the control
3. This reversed direction of calls is called Inversion of Control (IoC)
4. The Hollywood Principle: "Don't call us, we'll call you"

---

## Library: A Tool You Call

A library is a bundle of code that implements some specific functionality ahead of time. Your own code decides entirely when and in what order to use it.

```swift
// Your code owns the flow
let json = try JSONDecoder().decode(User.self, from: data)
let hash = SHA256.hash(data: input)
```

You write the start, the end, and the overall flow of the program, and you pull tools out as you need them along the way. It's like grabbing a screwdriver out of your toolbox — the screwdriver doesn't decide the order of the work.

Things like Alamofire and Kingfisher fall into this category. You decide when to fire off a network request or when to load an image.

---

## Framework: A Skeleton That Calls You

A framework is a pre-built skeleton for an application's overall structure and execution flow. You fill in the blanks the skeleton has left open.

An iOS app makes this clear. The app's entry point, the event loop, and the screen lifecycle are all held by UIKit and SwiftUI. What you write is code like `viewDidLoad`, `body`, or `onAppear` — code that **the framework calls at a predetermined moment.**

```swift
struct ProfileView: View {
    var body: some View {   // You don't call this yourself.
        Text("Hello")       // SwiftUI calls it when it needs to
    }
}
```

You never call `body` with your own hands. SwiftUI decides when and how many times it gets called. The owner of the flow has flipped.

<figure>
  <img src="/assets/images/posts/479c5583-9372-4e43-b639-e3c2b91852ac/2.png" alt="The direction of the call is reversed — that's inversion of control" loading="lazy">
  <figcaption>The direction of the call is reversed — that's inversion of control</figcaption>
</figure>

---

## Inversion of Control, and the Hollywood Principle

This reversed relationship has a name: Inversion of Control (IoC).

In a typical procedural program, your code holds the control flow and calls out to external code. In a framework-based program, the framework holds that flow, and your code gets called at the points you've registered. Since the control has swapped sides, it's an "inversion."

There's a witty phrase for this: the Hollywood Principle.

> "Don't call us, we'll call you."

It's the structure where an actor who auditioned doesn't call the studio — the studio calls the actor if they're cast. That's exactly the relationship between a framework and your code.

The delegate pattern follows the same logic. When you implement `UITableViewDataSource`, do you call `cellForRowAt` yourself? No — the table view calls you when it needs to. The grammar of the framework world is woven throughout the code.

---

## So What Actually Changes in Practice

**The way you learn is different.** With a library, you can just look up "what features does it have," but with a framework you first need to learn "when does it call me" — the lifecycle and calling conventions. That's why studying UIKit starts with studying the lifecycle.

**The cost of switching is different.** You can swap out a library by just fixing the call sites, but with a framework, your entire codebase sits on top of that skeleton, so replacing it is effectively a rewrite. That's why moving from UIKit to SwiftUI isn't a matter of changing a few functions.

**The testing strategy is different.** Code that the framework calls for you is hard to run standalone without the framework. That's why the advice to separate your logic into a framework-independent layer (pure Swift) keeps coming up.

<figure>
  <img src="/assets/images/posts/479c5583-9372-4e43-b639-e3c2b91852ac/3.png" alt="Don't call us, we'll call you — the Hollywood Principle" loading="lazy">
  <figcaption>Don't call us, we'll call you — the Hollywood Principle</figcaption>
</figure>

---

## In One Sentence for an Interview

> "A library is a tool that my code calls, and a framework is a skeleton that holds the control flow and calls my code. This difference in the direction of control is called Inversion of Control."

The natural follow-up questions go: "Give an example of IoC" (lifecycle methods, delegates), then "Why is that a good thing?" (it standardizes the flow so developers can focus on business logic).

---

## Summary

- The distinguishing criterion isn't size — it's the direction of the call
- Library: a tool your code calls when it needs it. You hold the control
- Framework: a skeleton that holds the flow and calls your code at predetermined moments. The framework holds the control
- This reversed control is called Inversion of Control (IoC), also known as the Hollywood Principle
- `viewDidLoad`, `body`, and delegate methods are all code that gets "called," not code you call
- Practical differences: with a framework, learning the lifecycle comes first, replacing it is hard, and separating your logic becomes the key to testability
