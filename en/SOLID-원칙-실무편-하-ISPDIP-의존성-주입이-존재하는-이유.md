---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "SOLID Principles in Practice (Part 2): ISP, DIP, and Why Dependency Injection Exists"
lang: en
description: "In the last post, we covered the first three letters of SOLID — SRP, OCP, and LSP. Today we'll wrap up the remaining two."
header:
  og_image: /assets/images/posts/6d8f2c8e-6a69-4df6-a991-c232fcf9500a/1.png
tags:
  - SOLID principles
  - ISP
  - DIP
  - dependency injection
  - dependency inversion
  - interface segregation
  - object-oriented design
  - Swift
  - clean code
  - software architecture
permalink: /en/SOLID-원칙-실무편-하-ISPDIP-의존성-주입이-존재하는-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/SOLID-%EC%9B%90%EC%B9%99-%EC%8B%A4%EB%AC%B4%ED%8E%B8-%ED%95%98-ISPDIP-%EC%9D%98%EC%A1%B4%EC%84%B1-%EC%A3%BC%EC%9E%85%EC%9D%B4-%EC%A1%B4%EC%9E%AC%ED%95%98%EB%8A%94-%EC%9D%B4%EC%9C%A0/) · **English** · [日本語](/ja/SOLID-%EC%9B%90%EC%B9%99-%EC%8B%A4%EB%AC%B4%ED%8E%B8-%ED%95%98-ISPDIP-%EC%9D%98%EC%A1%B4%EC%84%B1-%EC%A3%BC%EC%9E%85%EC%9D%B4-%EC%A1%B4%EC%9E%AC%ED%95%98%EB%8A%94-%EC%9D%B4%EC%9C%A0/) · [中文](/zh/SOLID-%EC%9B%90%EC%B9%99-%EC%8B%A4%EB%AC%B4%ED%8E%B8-%ED%95%98-ISPDIP-%EC%9D%98%EC%A1%B4%EC%84%B1-%EC%A3%BC%EC%9E%85%EC%9D%B4-%EC%A1%B4%EC%9E%AC%ED%95%98%EB%8A%94-%EC%9D%B4%EC%9C%A0/)
{: .notice--info}

In the last post, we covered the first three letters of SOLID — SRP, OCP, and LSP. Today we'll wrap up the remaining two.

Those are ISP (Interface Segregation Principle) and DIP (Dependency Inversion Principle).

DIP in particular is the theoretical root of "dependency injection (DI)" — something you inevitably run into whether you're using Swinject or Factory or any other DI library in Swift. By the end of this post, you'll understand why those libraries are shaped the way they are.

<figure>
  <img src="/assets/images/posts/6d8f2c8e-6a69-4df6-a991-c232fcf9500a/1.png" alt="This time it's the last two letters — ISP and DIP">
  <figcaption>This time it's the last two letters — ISP and DIP</figcaption>
</figure>

---

## ISP: Interface Segregation Principle

Let's start with the definition.

> Clients should not be forced to depend on methods they do not use.

That sounds abstract, but it clicks the moment you see it in the wild. Say you build a protocol for a multifunction printer.

```swift
protocol Machine {
    func print(_ doc: Document)
    func scan(_ doc: Document)
    func fax(_ doc: Document)
}

// An old printer can only print, but...
class OldPrinter: Machine {
    func print(_ doc: Document) { /* works fine */ }
    func scan(_ doc: Document) { fatalError("scanning not supported") }  // forced implementation
    func fax(_ doc: Document) { fatalError("faxing not supported") }   // forced implementation
}
```

A print-only printer is being forced to implement scanning and faxing too. The result is a fake method that just throws an error — and that's also a violation of LSP, which we covered last time. A bloated interface breaks two principles at once like this.

The fix is simple: split the interface by role.

```swift
protocol Printer { func print(_ doc: Document) }
protocol Scanner { func scan(_ doc: Document) }
protocol Fax { func fax(_ doc: Document) }

class OldPrinter: Printer { ... }                      // print only
class MultiFunction: Printer, Scanner, Fax { ... }     // does everything
```

Each type only commits to what it can actually do. In practice, this shows up as a specific smell: if adopting a protocol leaves you writing an empty implementation while thinking "this method has nothing to do with us...", that protocol is overdue for a split.

---

## DIP: Dependency Inversion Principle

This is a principle that's widely misunderstood because of its name. The definition is two lines.

> High-level modules should not depend on low-level modules. Both should depend on abstractions.

> Abstractions should not depend on details. Details should depend on abstractions.

Let's look at code. Here, an order service directly uses an email-sending library.

```swift
// The high-level module (business logic) directly depends on a low-level module (implementation detail)
import SendGrid

class OrderService {
    private let mailer = SendGridClient(apiKey: apiKey)

    func completeOrder(_ order: Order) {
        // process the order...
        mailer.send(to: order.email, message: "Order complete")  // locked into SendGrid
    }
}
```

This structure has two problems. Swapping SendGrid for another service means cracking open the business logic, and every test run fires off a real email.

Applying DIP flips the direction of the arrow.

```swift
// The high-level module (the order domain) defines the abstraction
protocol NotificationSender {
    func send(to: String, message: String) async throws
}

class OrderService {
    private let sender: NotificationSender

    init(sender: NotificationSender) {  // depends only on the abstraction
        self.sender = sender
    }

    func completeOrder(_ order: Order) async throws {
        try await sender.send(to: order.email, message: "Order complete")
    }
}

// The detail (SendGrid) now follows the abstraction
class SendGridSender: NotificationSender { ... }
class SlackSender: NotificationSender { ... }
class FakeSender: NotificationSender { ... }  // for testing
```

The dependency that used to point "OrderService → SendGrid" now points "OrderService → protocol ← SendGrid." Since the detail now bends toward the domain instead of the other way around, we call this an "inversion."

<figure>
  <img src="/assets/images/posts/6d8f2c8e-6a69-4df6-a991-c232fcf9500a/4-1783847948960.png" alt="The point where the arrow flips is the whole story of DIP">
  <figcaption>The point where the arrow flips is the whole story of DIP</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/6d8f2c8e-6a69-4df6-a991-c232fcf9500a/2.png" alt="The arrow flipping direction is what &quot;inversion&quot; really means">
  <figcaption>The arrow flipping direction is what &quot;inversion&quot; really means</figcaption>
</figure>

---

## Which Is Exactly Why DI Frameworks Exist

A natural question comes up here: "So who actually creates `SendGridSender()`?"

That's exactly what a dependency injection (DI) container does for you. DI libraries in the Swift ecosystem, like Swinject or Factory, do precisely this job — they let your classes look only at protocols, while the library handles plugging in the real implementation.

DIP is the principle (the direction), and DI is the technique (the tool) that makes it real. Nailing down this distinction alone will take your interview answers up a notch.

<figure>
  <img src="/assets/images/posts/6d8f2c8e-6a69-4df6-a991-c232fcf9500a/3.png" alt="Implementations get swapped in and out; the framework handles the wiring">
  <figcaption>Implementations get swapped in and out; the framework handles the wiring</figcaption>
</figure>

---

## SOLID, All Together

Compressing both posts on SOLID down to five lines:

| Principle | One-line summary |
|------|-----------|
| SRP | If different people ask for different changes, split the code |
| OCP | Where things change often, extend instead of modifying |
| LSP | A subclass must not break its parent's contract |
| ISP | Don't force implementations of methods that won't be used |
| DIP | Don't let business logic cling to implementation details |

All five ultimately point in the same direction: shrink the blast radius of change.

That said, applying these principles mechanically to every piece of code ends up violating KISS and YAGNI instead. These principles are tools to apply selectively, in the places where change actually happens often. That sense of balance is, I'd argue, what real skill looks like.
