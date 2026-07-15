---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Delegate Pattern in Swift: How Is It Different from Observer? (The Gold Standard for 1:1 Communication)"
lang: en
description: "If you've done any iOS development, you've run into the delegate pattern more times than you can count."
header:
  og_image: /assets/images/posts/84b5ff78-dfd2-4f9b-aa60-f4cd50f3afe1/1.png
tags:
  - Swift
  - delegate pattern
  - observer pattern
  - iOS development
  - design patterns
  - Swift syntax
  - NotificationCenter
  - iOS for beginners
  - delegate vs observer
permalink: /en/Swift-델리게이트-패턴-옵저버와-뭐가-다를까-11-통신의-정석/
toc: true
toc_sticky: true
last_modified_at: 2026-07-15
---

🌐 [한국어](/Swift-%EB%8D%B8%EB%A6%AC%EA%B2%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%98%B5%EC%A0%80%EB%B2%84%EC%99%80-%EB%AD%90%EA%B0%80-%EB%8B%A4%EB%A5%BC%EA%B9%8C-11-%ED%86%B5%EC%8B%A0%EC%9D%98-%EC%A0%95%EC%84%9D/) · **English** · [日本語](/ja/Swift-%EB%8D%B8%EB%A6%AC%EA%B2%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%98%B5%EC%A0%80%EB%B2%84%EC%99%80-%EB%AD%90%EA%B0%80-%EB%8B%A4%EB%A5%BC%EA%B9%8C-11-%ED%86%B5%EC%8B%A0%EC%9D%98-%EC%A0%95%EC%84%9D/) · [中文](/zh/Swift-%EB%8D%B8%EB%A6%AC%EA%B2%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%98%B5%EC%A0%80%EB%B2%84%EC%99%80-%EB%AD%90%EA%B0%80-%EB%8B%A4%EB%A5%BC%EA%B9%8C-11-%ED%86%B5%EC%8B%A0%EC%9D%98-%EC%A0%95%EC%84%9D/)
{: .notice--info}

If you've done any iOS development, you've run into the delegate pattern more times than you can count.

Every time you touch UITableView or UITextField and wire up a delegate, you've probably had this thought at least once: "Why does this need to be a delegate? Couldn't I just use a closure or a notification instead?"

Things get even more confusing once you've also learned the observer pattern. Both structures seem to "notify someone when something happens," so what exactly sets them apart?

Let's start with the answer.

> A delegate is 1:1 communication — one object hands off a task to exactly one other object, saying "I'm leaving this to you."
>
> An observer is 1:N broadcasting — a single event is subscribed to by multiple listeners at once.

If you hold onto that one line, you're already halfway there. Today, let's nail down this distinction for good, with code to back it up.

<figure>
  <img src="/assets/images/posts/84b5ff78-dfd2-4f9b-aa60-f4cd50f3afe1/1.png" alt="Delegate is 1:1, observer is 1:N — this one image sums it up">
  <figcaption>Delegate is 1:1, observer is 1:N — this one image sums it up</figcaption>
</figure>

---

## What Is the Delegate Pattern?

"Delegate" means exactly what it sounds like: delegation.

When something is awkward to handle directly, you hand it off to one trusted object and say, "You decide this for me."

Here's a real-world analogy.

Suppose you want to make a restaurant reservation but don't feel like calling yourself, so you ask an assistant: "Please make this reservation for me."

That assistant is the delegate. There's exactly one person asking, and exactly one person being asked. That's the 1:1 relationship.

In Swift, this contract is expressed through a protocol.

```swift
// Define the task being delegated as a protocol
protocol OrderDelegate: AnyObject {
    func didFinishOrder(_ menu: String)
}

class Restaurant {
    weak var delegate: OrderDelegate?  // Only one delegate is assigned
    func order(_ menu: String) {
        delegate?.didFinishOrder(menu)  // Notify only that one delegate
    }
}
```

The key thing to notice here is that `delegate` is **a single property**, not an array.

Since the task is handed to just one object, naturally only one reference is stored. That's why the delegate pattern is 1:1.

Also notice the `weak` keyword. If two objects hold strong references to each other, you get a retain cycle and memory leaks — so, by convention, delegates are held as weak references.

---

## How Is It Different from the Observer Pattern?

"Observer" means exactly that: a watcher.

When an event occurs, **everyone who's watching** gets notified at the same time.

Let's continue the assistant analogy.

This time, imagine you're broadcasting news about your restaurant's opening to the whole neighborhood: "We're opening tonight!"

Maybe ten people hear it, maybe a hundred. You don't care who's listening — you just put the announcement out there.

That's 1:N broadcasting — the observer pattern.

In iOS, `NotificationCenter` is the classic example.

```swift
// Event occurs → broadcast to everyone subscribed
NotificationCenter.default.post(name: .storeOpen, object: nil)

// Interested objects each subscribe independently
NotificationCenter.default.addObserver(
    self, selector: #selector(handleOpen),
    name: .storeOpen, object: nil)
```

The sender has no idea who's on the receiving end. It just throws out an event with a name attached.

On the receiving side, multiple objects each subscribe independently.

Because neither side needs to know about the other, coupling stays low — but the tradeoff is that it's hard to track who's currently listening to a given notification.

<figure>
  <img src="/assets/images/posts/84b5ff78-dfd2-4f9b-aa60-f4cd50f3afe1/2.png" alt="It only clicked once I actually typed the code myself">
  <figcaption>It only clicked once I actually typed the code myself</figcaption>
</figure>

---

## Delegate vs. Observer at a Glance

Explaining this in words alone gets confusing, so here's a table.

<figure>
  <img src="/assets/images/posts/84b5ff78-dfd2-4f9b-aa60-f4cd50f3afe1/4-1783847561867.png" alt="1:1 delegation vs. 1:N broadcasting — much clearer in picture form">
  <figcaption>1:1 delegation vs. 1:N broadcasting — much clearer in picture form</figcaption>
</figure>

| Category | Delegate | Observer |
|------|-----------|--------|
| Communication style | 1:1 (delegated to one) | 1:N (broadcast to many) |
| Do they know each other | Yes, explicitly | No, doesn't matter |
| Typical example | UITableViewDelegate | NotificationCenter |
| Getting a response back | Easy | Difficult |
| Coupling | Relatively high | Low |
| Tracking/debugging | Easy | Harder |

The core question is: "Do you need a response back?"

With a delegate, if you ask "What should this cell's height be?", the other side hands back a value. It's a back-and-forth conversation.

With an observer, you just throw the event out and that's it. The sender has no interest in who reacts or how.

---

## So Which One Should You Use, and When?

Here are the criteria worth applying in your own projects.

**Use a delegate when:**

1. You only need to communicate with exactly one object
2. You need a value returned from the other side (e.g., number of cells, cell height)
3. The sequence and flow are clear-cut, like a screen transition

**Use an observer when:**

1. Multiple screens need to react to a single event at the same time
2. It's an app-wide event, like a login-state change or a dark mode toggle
3. The sender and receiver don't need to know about each other

For example, if a successful login needs to update the home screen, the profile page, and a top banner all at once, a delegate quickly becomes unwieldy.

Since a delegate can only hand things off to one object, wiring it up to three different places at once turns the code messy.

In that case, broadcasting "Login succeeded!" once via an observer is far cleaner.

Conversely, a 1:1 case — like "the confirm button was tapped in this text field" — is exactly where a delegate or a closure is the right call.

<figure>
  <img src="/assets/images/posts/84b5ff78-dfd2-4f9b-aa60-f4cd50f3afe1/3.png" alt="Sketching it out with arrows on a whiteboard makes it so much clearer">
  <figcaption>Sketching it out with arrows on a whiteboard makes it so much clearer</figcaption>
</figure>

---

## Wrapping Up

The two patterns look similar, but the choice becomes easy once you ask yourself one question: "How many parties need to be notified?"

One recipient → delegate. Multiple recipients → observer. That single criterion is really all you need.

Try applying what you learned today the next time you write code. The moment something you only understood in theory clicks into practice, this pattern will suddenly feel a lot simpler. Good luck out there!
