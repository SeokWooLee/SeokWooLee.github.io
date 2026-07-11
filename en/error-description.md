---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Defining Custom Error Messages in Swift: The Complete Guide to LocalizedError (With Examples)"
lang: en
description: "If you build apps in Swift, you've probably had this experience: you caught an error with do-catch, but the message you actually got to show on screen was pretty underwhelming."
header:
  og_image: /assets/images/posts/a4fd42cd-dc7b-4c76-a180-5b1868371ad2/1.png
categories:
  - iOS
tags:
  - Swift
  - LocalizedError
  - errorDescription
  - iOS development
  - error handling
  - SwiftUI
  - custom errors
  - app development
permalink: /en/error-description/
toc: true
toc_sticky: true
last_modified_at: 2026-07-11
---

🌐 [한국어](/error-description/) · **English** · [日本語](/ja/error-description/) · [中文](/zh/error-description/)
{: .notice--info}

If you build apps in Swift, you've probably had this experience: you caught an error with `do-catch`, but the message you actually got to show on screen was pretty underwhelming.

I ran into this myself early on — I used `error.localizedDescription` as-is and ended up showing users a cryptic line like "The operation couldn't be completed…" 😅

Let me give you the short answer first.

> To define a custom error message you can show to users in Swift, adopt the `LocalizedError` protocol instead of just `Error`, and implement the `errorDescription` property.

Today I'll walk through this approach step by step, with examples.

<figure>
  <img src="/assets/images/posts/a4fd42cd-dc7b-4c76-a180-5b1868371ad2/1.png" alt="Here's how using LocalizedError instead of Error changes your custom error messages">
  <figcaption>Here's how using LocalizedError instead of Error changes your custom error messages</figcaption>
</figure>

---

## Why isn't plain Error enough?

A lot of people define errors like this:

```swift
enum LoginError: Error {
    case invalidPassword
    case userNotFound
}
```

If you leave it at that and print `error.localizedDescription`, you won't get the "Incorrect password" message you were hoping for — you'll get a bland, generic message the system generates instead.

That's because the `Error` protocol itself has no place to define a human-readable message.

That's exactly where `LocalizedError` comes in.

---

## How do you define a custom error message in Swift?

The approach is simple: adopt `LocalizedError` and implement `errorDescription`.

Here's an example that attaches a user-facing message to a login error.

```swift
extension LoginError: LocalizedError {
    var errorDescription: String? {
        switch self {
        case .invalidPassword:
            return "비밀번호가 올바르지 않습니다."
        case .userNotFound:
            return "존재하지 않는 사용자입니다."
        }
    }
}
```

Now when you call `error.localizedDescription`, you'll get exactly the message you defined.

The key point is that `errorDescription` returns `String?` — an optional.

If you return `nil`, it falls back to the system's default message again. So it's important to fill in a value for every case.

<figure>
  <img src="/assets/images/posts/a4fd42cd-dc7b-4c76-a180-5b1868371ad2/2-1783751475406.png" alt="The key is filling in a string for every single case">
  <figcaption>The key is filling in a string for every single case</figcaption>
</figure>

---

## Is there more than just errorDescription? (failureReason and recoverySuggestion)

Yes — `LocalizedError` has a few more properties you can optionally implement.

Here's a table summarizing their roles:

| Property | Role | Example message |
|---|---|---|
| `errorDescription` | What went wrong | "Login failed." |
| `failureReason` | Why it happened | "The password was entered incorrectly 5 times." |
| `recoverySuggestion` | How to fix it | "Please try again in a moment." |

`recoverySuggestion` in particular is useful for guiding the user on what to do next.

In practice, SwiftUI's `Alert` and AppKit environments will often read these values automatically and lay them out on screen for you.

For any error that's user-facing, I make a habit of implementing at least `errorDescription` and `recoverySuggestion`.

---

## Don't confuse developer-facing logs with user-facing messages

One more thing I want to add.

For descriptions meant for your debug logs, I'd recommend using `CustomStringConvertible` (i.e., `description`),

and keeping the localized messages shown to users under `LocalizedError`.

The two serve different purposes — one is for you, the other is for your users.

Separating these roles also makes it much easier to layer on `NSLocalizedString` later when you add multi-language support.

---

If I had to sum up today's post in one line: "If it's an error you're going to show users, start by filling in `errorDescription` on `LocalizedError`."

One small habit like this can make a real difference in user experience — give it a try on your next project. Rooting for you! 🙌

---

## References

- [Create A Custom Swift Error [and override localizedDescription]](https://www.advancedswift.com/custom-errors-in-swift/)
- [Defining Custom Errors With Advanced Descriptions In Swift – SerialCoder.dev](https://serialcoder.dev/text-tutorials/swift-tutorials/defining-custom-errors-with-advanced-descriptions-in-swift/)
- [Alert and LocalizedError in SwiftUI – Augmented Code](https://augmentedcode.io/2020/03/01/alert-and-localizederror-in-swiftui/)
