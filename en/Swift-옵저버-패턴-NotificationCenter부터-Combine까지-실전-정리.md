---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "The Observer Pattern in Swift: From NotificationCenter to Combine (A Practical Guide)"
lang: en
description: "If you build iOS apps long enough, you'll inevitably hit this moment: something changes on screen A, and screen B, way off on the other side of the app,…"
header:
  og_image: /assets/images/posts/60338bae-53e5-45cb-907e-58c9a798ee1c/1.png
tags:
  - Swift
  - ObserverPattern
  - NotificationCenter
  - Combine
  - iOSDevelopment
  - SwiftProgramming
  - ReactiveProgramming
  - DesignPatterns
  - iOSAppDevelopment
permalink: /en/Swift-옵저버-패턴-NotificationCenter부터-Combine까지-실전-정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-14
---

🌐 [한국어](/Swift-%EC%98%B5%EC%A0%80%EB%B2%84-%ED%8C%A8%ED%84%B4-NotificationCenter%EB%B6%80%ED%84%B0-Combine%EA%B9%8C%EC%A7%80-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/) · **English** · [日本語](/ja/Swift-%EC%98%B5%EC%A0%80%EB%B2%84-%ED%8C%A8%ED%84%B4-NotificationCenter%EB%B6%80%ED%84%B0-Combine%EA%B9%8C%EC%A7%80-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/) · [中文](/zh/Swift-%EC%98%B5%EC%A0%80%EB%B2%84-%ED%8C%A8%ED%84%B4-NotificationCenter%EB%B6%80%ED%84%B0-Combine%EA%B9%8C%EC%A7%80-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/)
{: .notice--info}

If you build iOS apps long enough, you'll inevitably hit this moment: something changes on screen A, and screen B, way off on the other side of the app, needs to update in response.

Force screens together with delegates and the code tends to tangle into spaghetti fast.

This is exactly what the observer pattern is for. To cut to the chase: in Swift, the natural path is to start with NotificationCenter and move on to Combine.

In this post, I'll walk through what the observer pattern actually is, how to use NotificationCenter, and how Combine — which has become the go-to choice lately — fits in, all with real code.

<figure>
  <img src="/assets/images/posts/60338bae-53e5-45cb-907e-58c9a798ee1c/1.png" alt="The Swift observer pattern, flowing left to right — that's the heart of this post">
  <figcaption>The Swift observer pattern, flowing left to right — that's the heart of this post</figcaption>
</figure>

## What Is the Observer Pattern?

The observer pattern is a structure where, when some object's state changes, everyone watching it gets notified automatically.

Think of a YouTube subscription. When a channel (the publisher) uploads a video, its subscribers (the observers) get notified.

The key point is that the publisher and the observers don't need to know each other directly.

<figure>
  <img src="/assets/images/posts/60338bae-53e5-45cb-907e-58c9a798ee1c/4-1783847822056.png" alt="The publisher and observer never know each other — they just pass notifications back and forth">
  <figcaption>The publisher and observer never know each other — they just pass notifications back and forth</figcaption>
</figure>

The channel doesn't care how many subscribers there are or who they are. It just announces "new video's up" and that's it.

This loose coupling means less tangled code and much easier changes down the road.

---

## How Do You Use NotificationCenter?

NotificationCenter is Apple's built-in tool for the observer pattern. No extra library needed — you can use it right away.

First, define a notification name, then post it from the publishing side.

```swift
// Define the notification name
extension Notification.Name {
    static let didLogin = Notification.Name("didLogin")
}

// Post a notification on successful login
NotificationCenter.default.post(name: .didLogin, object: nil)
```

On the receiving side, register an observer like this:

```swift
// Subscribe to the notification
NotificationCenter.default.addObserver(
    self, selector: #selector(handleLogin),
    name: .didLogin, object: nil
)
```

There's one thing worth watching out for. With the old-school approach (addObserver + selector), if you don't call removeObserver when the screen disappears, you can run into trouble.

That said, on iOS 9 and later a lot of this cleanup happens automatically, so if you're using the block-based API, just keep track of the token it returns.

---

## What Do You Gain by Moving to Combine?

Combine is the reactive programming framework Apple introduced in 2019. It's available from iOS 13 onward.

NotificationCenter can also be converted into a Combine Publisher, so it blends naturally with existing code.

```swift
// Bridging NotificationCenter into Combine
let token = NotificationCenter.default
    .publisher(for: .didLogin)
    .sink { _ in
        print("Login detected!")
    }
```

The real advantage of Combine is that you can chain data flows together.

You can transform values with operators like map and filter, and even merge multiple events.

And if you store the subscription that sink returns (AnyCancellable) in a variable, the subscription cancels automatically once that variable goes away. Memory management gets a lot simpler as a result.

<figure>
  <img src="/assets/images/posts/60338bae-53e5-45cb-907e-58c9a798ee1c/2.png" alt="This is how I got a feel for it — code open, typing it out by hand">
  <figcaption>This is how I got a feel for it — code open, typing it out by hand</figcaption>
</figure>

---

## So Which One Should You Use?

It depends on the situation. Here's a quick comparison:

| Item | NotificationCenter | Combine |
|------|-------------------|---------|
| Introduced | Long-standing built-in API | iOS 13+ |
| Learning curve | Low | Moderate to high |
| Transforming values | Difficult | Freely with map/filter |
| Memory management | Manual | Automatic once you hold the subscription |

For one or two simple notifications, NotificationCenter is plenty.

On the other hand, if your data flow is complex or you need to combine multiple events, Combine is far cleaner.

> If you're just starting out, get comfortable with the concept using NotificationCenter first, then move on to Combine once it clicks.

Of course, these days SwiftUI and async/await are the dominant approach, so if you're starting a new project, it's worth considering both of those alongside what's covered here.

<figure>
  <img src="/assets/images/posts/60338bae-53e5-45cb-907e-58c9a798ee1c/3.png" alt="There's something satisfying about seeing one notification fire and another screen update right along with it">
  <figcaption>There's something satisfying about seeing one notification fire and another screen update right along with it</figcaption>
</figure>

---

## Wrapping Up

Today we went through the observer pattern in Swift, from NotificationCenter all the way to Combine.

Don't try to grasp everything perfectly right out of the gate — start by building a single small notification yourself. Writing it out by hand will get you up to speed much faster than reading about it. Good luck!
