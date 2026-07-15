---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Why iOS MVVM Falls Short Without Binding (Combine and Observation Examples)"
lang: en
description: "In the last post, we covered why Massive View Controllers happen. The gist was that since the view controller plays both View and Controller at once, every…"
header:
  og_image: /assets/images/posts/f493544a-c1fe-4846-88cc-edd9a3879c4c/1.png
tags:
  - iOS
  - MVVM
  - architecture
  - ViewModel
  - Combine
  - SwiftUI
  - Observation
  - data binding
  - iOS development
  - iOS architecture
permalink: /en/iOS-MVVM-패턴-바인딩-없으면-반쪽인-이유-CombineObservation-예제/
toc: true
toc_sticky: true
last_modified_at: 2026-07-15
---

🌐 [한국어](/iOS-MVVM-%ED%8C%A8%ED%84%B4-%EB%B0%94%EC%9D%B8%EB%94%A9-%EC%97%86%EC%9C%BC%EB%A9%B4-%EB%B0%98%EC%AA%BD%EC%9D%B8-%EC%9D%B4%EC%9C%A0-CombineObservation-%EC%98%88%EC%A0%9C/) · **English** · [日本語](/ja/iOS-MVVM-%ED%8C%A8%ED%84%B4-%EB%B0%94%EC%9D%B8%EB%94%A9-%EC%97%86%EC%9C%BC%EB%A9%B4-%EB%B0%98%EC%AA%BD%EC%9D%B8-%EC%9D%B4%EC%9C%A0-CombineObservation-%EC%98%88%EC%A0%9C/)
{: .notice--info}

In the last post, we covered why Massive View Controllers happen. The gist was that since the view controller plays both View and Controller at once, every piece of code with nowhere else to go ends up piling in there.

The most widely used fix for this is **MVVM (Model-View-ViewModel)**. But when you open up code that claims to use MVVM, you surprisingly often find a structure like this: there's a class named ViewModel, sure, but the view controller is still pulling values out one by one and reflecting them on screen.

Today, let's break down what a ViewModel's real job is, and why MVVM without binding is only half the pattern.

<figure>
  <img src="/assets/images/posts/f493544a-c1fe-4846-88cc-edd9a3879c4c/1.png" alt="MVVM isn't complete with just a ViewModel — it needs binding">
  <figcaption>MVVM isn't complete with just a ViewModel — it needs binding</figcaption>
</figure>

---

## The ViewModel Is a Factory That Produces Screen State

MVVM splits into three parts:

- **Model**: Data and business logic (same as in MVC)
- **View**: Screen display. On iOS, both UIView and UIViewController belong here
- **ViewModel**: An object that **transforms Model data into a form the screen can display** and holds the screen's state

There are two key points here.

First, in MVVM, **UIViewController belongs to the View side**. This nails down, once and for all, the ambiguous position the view controller occupied in the last post's discussion. The view controller's job is purely to render the screen — all the decision-making goes to the ViewModel.

Second, the ViewModel **must not know about UIKit**. That means no `import UIKit`. Taking a `Date` and converting it into a string like "3 minutes ago," or holding a Bool for whether something is loading — that's all the ViewModel's job. Deciding which UILabel that string goes into is the View's job.

Thanks to this separation, the ViewModel can be tested without a screen at all. You can verify something like "if there are zero posts, a placeholder message appears" as pure logic, with no UIViewController involved.

---

## Why Is It Only Half the Pattern Without Binding?

If you stop right here, you end up with code like this.

```swift
// "MVVM in name only" without binding
final class ProfileViewController: UIViewController {
    let viewModel = ProfileViewModel()

    func refresh() {
        viewModel.load()
        nameLabel.text = viewModel.displayName   // pulling values out directly
        statusLabel.text = viewModel.statusText  // and applying them one by one
        emptyView.isHidden = !viewModel.isEmpty
    }
}
```

Every time the ViewModel's state changes, the view controller has to remember to call `refresh()`. Miss even one call at the right moment, and the screen falls out of sync with the state. All you've done is relocate the state — the responsibility of "keeping state and screen in sync" still sits with the view controller.

This is exactly why MVVM, ever since it was born in Microsoft's WPF, was **designed around the assumption of data binding** from the start. The pattern is only complete once "when the ViewModel changes, the View follows automatically" is guaranteed.

<figure>
  <img src="/assets/images/posts/f493544a-c1fe-4846-88cc-edd9a3879c4c/2.png" alt="Set up a subscription once, and the screen follows the state on its own">
  <figcaption>Set up a subscription once, and the screen follows the state on its own</figcaption>
</figure>

---

## In UIKit, Combine Handles the Binding

UIKit has no built-in binding, so attaching Combine is close to the standard approach.

```swift
final class ProfileViewModel {
    @Published private(set) var displayName = ""
    @Published private(set) var isLoading = false

    func load() { ... }  // updates @Published values on completion
}

final class ProfileViewController: UIViewController {
    private var cancellables = Set<AnyCancellable>()

    override func viewDidLoad() {
        super.viewDidLoad()
        viewModel.$displayName
            .assign(to: \.text!, on: nameLabel)
            .store(in: &cancellables)
        viewModel.$isLoading
            .sink { [weak self] in self?.spinner.isAnimating = $0 }
            .store(in: &cancellables)
    }
}
```

Once you set up the subscription, the screen follows along no matter when or how the ViewModel changes afterward. The whole question of "when should I call refresh?" simply disappears.

In SwiftUI, this binding is built into the language itself. As long as a View merely reads a property on an object marked `@Observable`, that View automatically redraws whenever the value changes. You don't even need subscription code.

---

## The Trap Called Massive ViewModel

A few months after adopting MVVM, you run into a new problem. This time, it's the **ViewModel that bloats**. If network requests, caching, and business rules all get shoved into the ViewModel, you've simply relocated the monster.

The ViewModel's place is strictly **presentation logic** (shaping screen state). Fetching data should go down to a Repository or Service, and business rules should go down to the Model layer. MVVM is a pattern for separating the View from everything else — not a pattern that says everything else should live in the ViewModel.

<figure>
  <img src="/assets/images/posts/f493544a-c1fe-4846-88cc-edd9a3879c4c/3.png" alt="Cram everything in, and you've just relocated the monster">
  <figcaption>Cram everything in, and you've just relocated the monster</figcaption>
</figure>

---

## Summary

- The ViewModel is an object that transforms Model data into screen-ready state, and it must not know about UIKit. That's what makes it testable without a screen.
- If you only move the state without binding, the responsibility for syncing stays with the view controller. MVVM is only complete once binding is in place.
- In UIKit, Combine handles that binding; in SwiftUI, @Observable does.
- Cramming all logic into the ViewModel produces a Massive ViewModel. Limit its job to presentation logic only.

That said, in SwiftUI, since the View itself reflects state declaratively, the argument that "you don't need a ViewModel at all" is gaining traction. We'll tackle that debate head-on in the next post.
