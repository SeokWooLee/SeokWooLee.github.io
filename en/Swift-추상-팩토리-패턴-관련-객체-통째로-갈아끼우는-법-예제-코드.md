---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift Abstract Factory Pattern: How to Swap Out Related Objects as a Set (With Code Examples)"
lang: en
description: "Have you ever switched your app's entire screen theme from light to dark?"
header:
  og_image: /assets/images/posts/83042fcc-289b-4915-8eea-35dfb3ace490/1-1783771760314.png
tags:
  - Swift
  - abstract factory pattern
  - design patterns
  - AbstractFactory
  - iOS development
  - Swift syntax
  - factory method
  - object-oriented programming
  - learning to code
  - programming
permalink: /en/Swift-추상-팩토리-패턴-관련-객체-통째로-갈아끼우는-법-예제-코드/
toc: true
toc_sticky: true
last_modified_at: 2026-07-18
---

🌐 [한국어](/Swift-%EC%B6%94%EC%83%81-%ED%8C%A9%ED%86%A0%EB%A6%AC-%ED%8C%A8%ED%84%B4-%EA%B4%80%EB%A0%A8-%EA%B0%9D%EC%B2%B4-%ED%86%B5%EC%A7%B8%EB%A1%9C-%EA%B0%88%EC%95%84%EB%81%BC%EC%9A%B0%EB%8A%94-%EB%B2%95-%EC%98%88%EC%A0%9C-%EC%BD%94%EB%93%9C/) · **English** · [日本語](/ja/Swift-%EC%B6%94%EC%83%81-%ED%8C%A9%ED%86%A0%EB%A6%AC-%ED%8C%A8%ED%84%B4-%EA%B4%80%EB%A0%A8-%EA%B0%9D%EC%B2%B4-%ED%86%B5%EC%A7%B8%EB%A1%9C-%EA%B0%88%EC%95%84%EB%81%BC%EC%9A%B0%EB%8A%94-%EB%B2%95-%EC%98%88%EC%A0%9C-%EC%BD%94%EB%93%9C/) · [中文](/zh/Swift-%EC%B6%94%EC%83%81-%ED%8C%A9%ED%86%A0%EB%A6%AC-%ED%8C%A8%ED%84%B4-%EA%B4%80%EB%A0%A8-%EA%B0%9D%EC%B2%B4-%ED%86%B5%EC%A7%B8%EB%A1%9C-%EA%B0%88%EC%95%84%EB%81%BC%EC%9A%B0%EB%8A%94-%EB%B2%95-%EC%98%88%EC%A0%9C-%EC%BD%94%EB%93%9C/)
{: .notice--info}

Have you ever switched your app's entire screen theme from light to dark?

If you go about it by swapping colors one button, one label at a time, you'll almost always miss something. It's easy to end up with a button on a black background while a label is still stuck on white.

This is exactly the kind of problem the Swift abstract factory pattern solves. It groups related objects into a single set, and lets you swap the whole set at once.

<figure>
  <img src="/assets/images/posts/83042fcc-289b-4915-8eea-35dfb3ace490/1-1783771760314.png" alt="Swift abstract factory pattern — you swap the whole factory, not individual parts">
  <figcaption>Swift abstract factory pattern — you swap the whole factory, not individual parts</figcaption>
</figure>

In this post, I'll walk through exactly what problem the abstract factory pattern solves, how to swap related objects as a group using Swift code, and when it's worth reaching for — and when it isn't.

---

## What is the abstract factory pattern?

In one sentence:

> It's a pattern that lets you swap out, as a whole, a "factory" that produces a group of objects meant to work together.

The key idea is "objects that need to be used together." You don't want a dark-theme button paired with a light-theme background — that's a problem.

The abstract factory pattern prevents exactly this kind of mismatched combination.

Once you pick a factory, everything it produces is guaranteed to match. Pick the light factory, and you get a light button, a light label, and a light background — all consistent.

Instead of picking each component individually, you pick the factory as a whole.

That's really all there is to it.

---

## How to swap related objects as a set in Swift

This becomes much clearer with actual code. Let's use a UI theme as an example.

First, define the protocols for the components that will be created, along with the protocol for the factory that produces them.

```swift
protocol Button { func render() -> String }
protocol Label  { func render() -> String }

// The factory is responsible for producing a matching set of components
protocol ThemeFactory {
    func makeButton() -> Button
    func makeLabel() -> Label
}
```

<figure>
  <img src="/assets/images/posts/83042fcc-289b-4915-8eea-35dfb3ace490/2.png" alt="It all starts with pinning down a single protocol">
  <figcaption>It all starts with pinning down a single protocol</figcaption>
</figure>

Now create a light theme factory and a dark theme factory. Each factory only produces components that match its own theme.

<figure>
  <img src="/assets/images/posts/83042fcc-289b-4915-8eea-35dfb3ace490/4-1783847732231.png" alt="Pick one factory, and the components come as a matching set automatically">
  <figcaption>Pick one factory, and the components come as a matching set automatically</figcaption>
</figure>

```swift
struct LightFactory: ThemeFactory {
    func makeButton() -> Button { LightButton() }
    func makeLabel() -> Label  { LightLabel() }
}
struct DarkFactory: ThemeFactory {
    func makeButton() -> Button { DarkButton() }
    func makeLabel() -> Label  { DarkLabel() }
}
```

The code that draws the screen only needs to be handed a single factory. It doesn't need to care which factory it actually is.

```swift
func buildScreen(with factory: ThemeFactory) {
    let button = factory.makeButton()
    let label  = factory.makeLabel()
    print(button.render(), label.render())
}

// Switching themes only requires changing this one line — the factory
buildScreen(with: DarkFactory())
```

The moment you swap `LightFactory()` for `DarkFactory()`, the button and the label both switch to dark at once.

There's no more need to update the button color and the label color separately.

<figure>
  <img src="/assets/images/posts/83042fcc-289b-4915-8eea-35dfb3ace490/3.png" alt="Light to dark, one line changed, and the whole screen just fell into place">
  <figcaption>Light to dark, one line changed, and the whole screen just fell into place</figcaption>
</figure>

---

## How is this different from the factory method pattern?

The names look similar, which makes this easy to mix up, so let's clear it up.

| | Factory Method | Abstract Factory |
|------|------|------|
| What it creates | A single type of object | Multiple related types of objects (a set) |
| Focus | "What to create" | "Grouping things that belong together" |
| Typical example | Creating a single button | A matched set of button + label + background |

Put simply, the factory method is a way to create one component, while the abstract factory is a way to bundle those components into a matching set.

You can think of an abstract factory as internally using multiple factory methods.

---

## When to use it, and when to skip it

In practice, there are situations where this pattern fits well, and others where it's overkill.

**Good fits**

- When things clearly change as a "set" — themes, platforms, regions, and the like
- When you need to swap out an entire family of UI components, like between iOS and macOS
- When you're dealing with structures that get swapped as a whole unit, like payment methods or database drivers

**Overkill**

- When you only have one or two types of objects to create
- When the combination rules change so often that the "set" itself is unstable

If you set up an abstract factory for just a single object, you end up with more code and less readability, for no real benefit.

It's best reserved for cases where there's a clear reason to bundle things into a set.

---

## Two common questions

**Q. What if I need to add a new component type later?**

You'll need to add a method to the protocol and implement it in every factory. This can mean a fair amount of work if you have many factories, so if your project is one where component types tend to grow frequently, it's worth thinking this through ahead of time.

**Q. Does this apply in SwiftUI too?**

You certainly can use it, but SwiftUI already has strong built-in injection mechanisms like `Environment` and `@Observable`, which are often more concise for something like theming. The abstract factory pattern shines more in UIKit-based code, or in a pure logic layer where you need to swap out an entire set.

---

At the end of the day, the abstract factory pattern is about bundling things that shouldn't be mixed and matched into a single switch.

Once you experience how changing a single line for the theme makes the entire screen fall into place, it clicks immediately why this pattern exists. I'd recommend trying it out yourself with a small example first.
