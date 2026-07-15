---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "SwiftUI Doesn't Need a ViewModel? A Full Rundown of the MV Pattern Debate"
lang: en
description: "There's a debate that's been raging in the iOS community for years now."
header:
  og_image: /assets/images/posts/7bedf164-d196-4a13-815a-c43b2968f9f4/1.png
tags:
  - SwiftUI
  - MV Pattern
  - MVVM
  - ViewModel
  - Observable
  - iOS
  - Architecture
  - State
  - iOS Development
  - iOS Architecture
permalink: /en/SwiftUI에-ViewModel이-필요-없다-MV-패턴-논쟁-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-15
---

🌐 [한국어](/SwiftUI%EC%97%90-ViewModel%EC%9D%B4-%ED%95%84%EC%9A%94-%EC%97%86%EB%8B%A4-MV-%ED%8C%A8%ED%84%B4-%EB%85%BC%EC%9F%81-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · **English** · [日本語](/ja/SwiftUI%EC%97%90-ViewModel%EC%9D%B4-%ED%95%84%EC%9A%94-%EC%97%86%EB%8B%A4-MV-%ED%8C%A8%ED%84%B4-%EB%85%BC%EC%9F%81-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [中文](/zh/SwiftUI%EC%97%90-ViewModel%EC%9D%B4-%ED%95%84%EC%9A%94-%EC%97%86%EB%8B%A4-MV-%ED%8C%A8%ED%84%B4-%EB%85%BC%EC%9F%81-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
{: .notice--info}

There's a debate that's been raging in the iOS community for years now.

**"Does SwiftUI actually need a ViewModel?"**

In the last installment, we established that the heart of MVVM is binding, and SwiftUI has binding built right into the framework. That gave rise to an argument: "Isn't the ViewModel layer itself redundant, then?" This is the so-called **MV (Model-View) pattern** camp.

Today, in the final entry of this series, we'll lay out both sides of the debate fairly and get to **the practical criteria you can actually use to decide**.

<figure>
  <img src="/assets/images/posts/7bedf164-d196-4a13-815a-c43b2968f9f4/1.png" alt="The MV vs MVVM debate has been simmering in the SwiftUI community for years">
  <figcaption>The MV vs MVVM debate has been simmering in the SwiftUI community for years</figcaption>
</figure>

---

## SwiftUI's View Already Looks a Lot Like a ViewModel

Let's revisit why MVVM was needed in UIKit in the first place:

- UIViewController was bloating out of control, so state and logic needed to move elsewhere
- Binding was needed to keep state and screen in sync

But a SwiftUI View is, from the ground up, **a function of state**. `body` simply takes state and returns a screen declaration, and when a `@State` value changes, the framework redraws automatically. There's no need to write Combine subscription code just to get binding.

On top of that, a SwiftUI View isn't a class — it's a **value-type struct**. It's not a lifecycle-laden blob that can balloon to thousands of lines like UIViewController; it's closer to a lightweight blueprint that gets recreated on every render.

This is where the MV camp's argument begins. "There's no bloated View to worry about, and binding comes for free — so isn't creating a ViewModel class for every screen just carrying over a UIKit habit out of inertia?"

---

## The MV Camp's Case

In the MV pattern, you don't give every screen its own ViewModel — the View works directly with state tools.

- State confined to a single view goes in `@State`
- State shared across multiple screens is injected via `@Environment` as an `@Observable` model
- Server data is handled by a store or client in the Model layer

```swift
struct ProfileView: View {
    @Environment(UserStore.self) private var store
    @State private var isEditing = false

    var body: some View {
        List(store.posts) { PostRow(post: $0) }
            .task { await store.loadPosts() }
    }
}
```

Apple's official sample code (Fruta, Food Truck, etc.) largely follows this structure too. Instead of a ViewModel per screen, a single domain-level `@Observable` model gets shared across multiple Views.

The advantage here is clear: the boilerplate of creating a class for every single screen disappears, and framework tools like `@State` and `@Binding` can be used directly, without workarounds.

<figure>
  <img src="/assets/images/posts/7bedf164-d196-4a13-815a-c43b2968f9f4/2.png" alt="A SwiftUI View is, from the start, a function of state">
  <figcaption>A SwiftUI View is, from the start, a function of state</figcaption>
</figure>

---

## The MVVM Camp's Rebuttal

The counterarguments carry just as much weight.

**First, logic seeps into the View.** Once conditions like "if there are zero posts, loading has finished, and there's no error, show a placeholder message" start piling up as ternary operators inside `body`, it becomes just as hard to read — value type or not.

**Second, there's the testing problem.** A View's `body` is difficult to exercise with unit tests. If presentation logic lives inside the View, that logic falls into the same testing blind spot. Pull it out into a ViewModel, and it's a plain Swift object you can verify directly.

**Third, there's the scale problem.** In an app with dozens of screens and multiple people working on it, you need a consistent rule for "where does state and logic live." The argument here is that having a fixed spot — a ViewModel — for every screen reduces the cost of collaboration.

---

## It's Not About the Name — It's About Dependency Direction

Looking at both arguments side by side, this debate is really less about "does a class called ViewModel exist" and more about **where logic and state actually live**. Framed that way, most cases resolve themselves:

- **UI state confined to a single view** (toggles, focus, whether a sheet is shown) belongs in `@State` on the View. Pulling this out into a ViewModel is over-engineering.
- **Domain state shared across multiple screens** should be an `@Observable` model that gets injected. Whether you call it a Store or a ViewModel, the substance is the same.
- **When screen-specific processing logic gets complex** (formatting, display conditions, sorting/filtering), pull it out into a testable type outside the View. That's effectively a ViewModel.
- Either way, as long as you keep the dependency direction intact — **the View never touches the network or database directly** — whether you call it MV or MVVM is basically a naming difference.

In the end, the real substance behind "SwiftUI doesn't need a ViewModel" comes down to this: **you don't need to mechanically create a ViewModel for every single screen. But that doesn't mean the logic that needs to live outside the View disappears.**

<figure>
  <img src="/assets/images/posts/7bedf164-d196-4a13-815a-c43b2968f9f4/3.png" alt="The real deciding factor isn't the name — it's the direction of dependencies">
  <figcaption>The real deciding factor isn't the name — it's the direction of dependencies</figcaption>
</figure>

---

## Series Wrap-Up

Here's the three-part iOS architecture series, compressed to one line each:

- **MVC**: UIViewController doubles as both View and Controller, so responsibilities pile up in one place. Still valid for smaller screens.
- **MVVM**: Screen state moves into a ViewModel and syncs via binding. Without binding, it's only half the pattern.
- **The MV debate**: SwiftUI has binding built in, so there's no inherent reason to force a ViewModel onto every screen. That said, you still have to design where logic lives and which way dependencies point.

Architecture isn't a trend to follow — it's **a tradeoff you choose to fit your team and app's scale**. If this series lands well, I'll follow up with heavier options like VIPER and TCA.
