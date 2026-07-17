---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "What Is Dependency Injection (DI)? Moving `new` Outside the Class (Examples, Analogies, and a Full Rundown)"
lang: en
description: "When your code needs an object, it's common to just create it right there on the spot. But the moment you try to write a test, you hit a wall. The object…"
header:
  og_image: /assets/images/posts/1bc5e86b-847f-4d07-aaa8-ed5d26c59792/1.png
tags:
  - dependency injection
  - DI
  - IoC
  - Spring
  - inversion of control
  - object-oriented programming
  - constructor injection
  - Java
  - backend learning
  - programming for beginners
permalink: /en/의존성-주입DI이란-new를-클래스-밖으로-꺼내는-것부터-예제비유-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-17
---

🌐 [한국어](/%EC%9D%98%EC%A1%B4%EC%84%B1-%EC%A3%BC%EC%9E%85DI%EC%9D%B4%EB%9E%80-new%EB%A5%BC-%ED%81%B4%EB%9E%98%EC%8A%A4-%EB%B0%96%EC%9C%BC%EB%A1%9C-%EA%BA%BC%EB%82%B4%EB%8A%94-%EA%B2%83%EB%B6%80%ED%84%B0-%EC%98%88%EC%A0%9C%EB%B9%84%EC%9C%A0-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · **English** · [日本語](/ja/%EC%9D%98%EC%A1%B4%EC%84%B1-%EC%A3%BC%EC%9E%85DI%EC%9D%B4%EB%9E%80-new%EB%A5%BC-%ED%81%B4%EB%9E%98%EC%8A%A4-%EB%B0%96%EC%9C%BC%EB%A1%9C-%EA%BA%BC%EB%82%B4%EB%8A%94-%EA%B2%83%EB%B6%80%ED%84%B0-%EC%98%88%EC%A0%9C%EB%B9%84%EC%9C%A0-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [中文](/zh/%EC%9D%98%EC%A1%B4%EC%84%B1-%EC%A3%BC%EC%9E%85DI%EC%9D%B4%EB%9E%80-new%EB%A5%BC-%ED%81%B4%EB%9E%98%EC%8A%A4-%EB%B0%96%EC%9C%BC%EB%A1%9C-%EA%BA%BC%EB%82%B4%EB%8A%94-%EA%B2%83%EB%B6%80%ED%84%B0-%EC%98%88%EC%A0%9C%EB%B9%84%EC%9C%A0-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
{: .notice--info}

When your code needs an object, it's common to just create it right there on the spot. But the moment you try to write a test, you hit a wall. The object creation is baked so deep into the class that there's no way to swap it out.

Searching for what dependency injection (DI) actually means often makes things worse, too — you mostly get answers full of "inversion of control" and "IoC containers" that don't really explain anything.

So today, let's break it down as simply as possible. Here's the conclusion up front.

Dependency injection (DI) ultimately means taking an object that used to be created inside a class and instead creating it outside and passing it in. That single shift is the whole point. Moving the location of object creation outside the class — that's essentially all DI is.

By the end of this post, you should have a solid feel for why DI matters, how the code actually changes, and why DI libraries like Swinject exist to handle this for you.

<figure>
  <img src="/assets/images/posts/1bc5e86b-847f-4d07-aaa8-ed5d26c59792/1.png" alt="Dependency injection (DI), at its core, is just moving `new` from inside to outside">
  <figcaption>Dependency injection (DI), at its core, is just moving `new` from inside to outside</figcaption>
</figure>

## What's the problem with creating objects inside a class?

Let's say you have a class that handles order processing. This class needs a payment module to process payments.

The most common beginner-level code looks like this.

```swift
class OrderService {
    // Creating the payment object directly inside the class
    private let pay = KakaoPay()

    func order() { pay.pay() }
}
```

The problem is that `OrderService` is now tightly glued to `KakaoPay`.

What if you want to switch from KakaoPay to NaverPay? You'd have to go inside the class and rewrite the creation logic.

And if you want to pass in a fake payment object for testing, there's no way to do it — the class already creates a real `KakaoPay` instance internally.

In other words, when object creation lives inside a class, that class ends up handcuffed to one specific implementation.

---

## So let's move object creation outside

The fix is simpler than you'd expect. Instead of creating the object yourself, just receive one that's already been created elsewhere.

```swift
class OrderService {
    private let pay: Pay
    // Just receives an object that was created outside
    init(pay: Pay) { self.pay = pay }

    func order() { pay.pay() }
}
```

Only one thing changed: direct creation is gone, replaced by receiving the dependency through the initializer.

Now `OrderService` doesn't need to know whether the payment is KakaoPay or NaverPay. All it knows is "I receive something called `Pay` and use it."

> The essence of DI isn't anything grand. It's simply moving object creation outside the class, and handing the authority to decide what gets passed in over to the outside.

Supplying an object from the outside like this is called "injecting" it. You inject the object a class depends on — hence, dependency injection.

The name sounds intimidating, but what it actually does is exactly what you just saw.

---

## What do you actually gain from DI?

Just saying "it's good" doesn't really land, so let's spell out what actually changes.

- Swapping becomes easy: switching from KakaoPay to NaverPay doesn't require touching a single line of `OrderService`. You just change the object you pass in.
- Testing gets easier: you can pass in a fake (mock) payment object instead of a real one, so you can verify the logic without any money actually moving.
- Responsibilities separate cleanly: `OrderService` focuses solely on "processing orders," while "which payment method to use" is decided from the outside.

The third point is the one that resonated with me the most. When a class stays focused on its own job, the code becomes noticeably easier to read.

Here's a summary.

| Category | Creation inside the class | Creation moved outside (DI) |
|------|------|------|
| Swapping payment methods | Requires editing the class | Just swap the injected object |
| Testing | Can't inject a fake object | Mock injection possible |
| Concerns | Creation and logic mixed together | Focused purely on logic |

<figure>
  <img src="/assets/images/posts/1bc5e86b-847f-4d07-aaa8-ed5d26c59792/2-1783803959217.png" alt="Once you move `new` outside, the code ends up looking this clean">
  <figcaption>Once you move `new` outside, the code ends up looking this clean</figcaption>
</figure>

---

## So why do we need a DI library like Swinject?

At this point, a natural question comes up: "Okay, I get that you inject from outside — but who manages that 'outside'?"

When there are only a handful of objects, you can just create and pass them in by hand. But real-world projects have hundreds of objects, all tangled together.

Having a person manually create and wire all of that up in the right order is a nightmare.

That's where tools that handle this "creating and injecting from outside" job for you come in. In the Swift world, DI containers like Swinject or Factory play exactly that role.

<figure>
  <img src="/assets/images/posts/1bc5e86b-847f-4d07-aaa8-ed5d26c59792/4-1783847680148.png" alt="The container creates the objects and plugs them in wherever they're needed">
  <figcaption>The container creates the objects and plugs them in wherever they're needed</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/1bc5e86b-847f-4d07-aaa8-ed5d26c59792/3.png" alt="Once you're dealing with hundreds of objects, a container that manages this for you becomes a lifesaver">
  <figcaption>Once you're dealing with hundreds of objects, a container that manages this for you becomes a lifesaver</figcaption>
</figure>

You register the objects you need, and the container creates them and injects them wherever they're needed. You barely have to create anything by hand anymore.

This is also where the term "inversion of control (IoC)" comes from. It means the control over creating and wiring objects has moved out of your code and into the container.

Put another way: DI is the concept, and a DI container is the worker that carries that concept out for you.

---

## Frequently asked questions

Q. Are DI and IoC the same thing?
No. IoC (inversion of control) is the broader principle of "handing control over to something else," while DI is one specific way of putting that principle into practice. You can think of DI as one type of IoC.

Q. Are there injection methods besides the initializer?
Yes. There's constructor injection, property injection, and method injection. That said, Swift generally recommends constructor injection — dependencies stay fixed as `let`, values can't change afterward, and it's easier to test.

Q. Do you need a library for it to count as DI?
Not at all. Manually passing an object into an initializer, like we just did, is genuine DI too. A library just automates that process.

---

Today we broke dependency injection down into one very small shift: where objects get created.

If DI has felt hard to grasp, just remember one thing: "Don't create it inside the class — create it outside and pass it in." Hold onto that single sentence, and everything else follows naturally.

If you've ever felt stuck staring at a blank test file, I'd recommend rewriting the example from this post by hand at least once. It clicks a lot more solidly than just reading it does.
