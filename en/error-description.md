---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Defining Custom Error Messages in Swift: A Complete Guide to LocalizedError (With Examples)"
lang: en
description: "If you build apps in Swift, you've probably caught an error with do-catch only to find that the message you had to show on screen was pretty underwhelming."
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
last_modified_at: 2026-07-13
---

🌐 [한국어](/error-description/) · **English** · [日本語](/ja/error-description/) · [中文](/zh/error-description/)
{: .notice--info}

If you build apps in Swift, you've probably caught an error with `do-catch` only to find that the message you had to show on screen was pretty underwhelming.

If you just use `error.localizedDescription` as-is, you end up exposing some mystery phrase like "The operation couldn't be completed…" directly to your users.

Let's cut to the conclusion first.

> To define a custom error message for users in Swift, adopt the `LocalizedError` protocol instead of plain `Error`, and implement the `errorDescription` property.

Today I'll walk through this approach step by step with examples.

<figure>
  <img src="/assets/images/posts/a4fd42cd-dc7b-4c76-a180-5b1868371ad2/1.png" alt="Here's how custom error messages change when you use LocalizedError instead of Error">
  <figcaption>Here's how custom error messages change when you use LocalizedError instead of Error</figcaption>
</figure>

---

## Why isn't plain Error enough?

Many of you probably define errors like this:

```swift
enum LoginError: Error {
    case invalidPassword
    case userNotFound
}
```

If you leave it at that and print `error.localizedDescription`, you won't get the "Incorrect password" you were hoping for — instead you get a bland, system-generated default phrase.

That's because the `Error` protocol itself has no place to define a human-readable message.

That's exactly where `LocalizedError` comes in.

---

## How do you define a custom error message in Swift?

The method is simple: adopt `LocalizedError` and implement `errorDescription`.

Here's an example that attaches a user-facing message to a login error.

```swift
extension LoginError: LocalizedError {
    var errorDescription: String? {
        switch self {
        case .invalidPassword:
            return "The password you entered is incorrect."
        case .userNotFound:
            return "This user doesn't exist."
        }
    }
}
```

Now when you call `error.localizedDescription`, the exact phrase you defined comes out.

The key point is that `errorDescription`'s return type is `String?` — an optional.

If you return `nil` here, it falls back to the system's default message. So it's important to fill in a value for every case.

<figure>
  <img src="/assets/images/posts/a4fd42cd-dc7b-4c76-a180-5b1868371ad2/2-1783751475406.png" alt="The key is filling in a string for every single case">
  <figcaption>The key is filling in a string for every single case</figcaption>
</figure>

---

## Is there more beyond errorDescription? (failureReason, recoverySuggestion)

Yes — `LocalizedError` has a few more properties you can optionally implement.

Here's a table summarizing their roles.

| Property | Role | Example phrase |
|---|---|---|
| `errorDescription` | What went wrong | "Login failed." |
| `failureReason` | Why it happened | "You entered the wrong password 5 times." |
| `recoverySuggestion` | How to fix it | "Please try again in a moment." |

`recoverySuggestion` in particular is useful for guiding users toward their next action.

In practice, SwiftUI's `Alert` and AppKit environments often read these values automatically and lay them out on screen.

For any user-facing error, I make it a habit to fill in at least `errorDescription` and `recoverySuggestion`.

---

## Don't confuse developer-facing logs with user-facing messages

One more thing to add.

I'd recommend keeping developer-facing descriptions meant for debug logs under `CustomStringConvertible` (i.e., `description`),

and keeping translated messages meant for users under `LocalizedError` — as two separate things.

They serve different purposes: one is for you, the other is for your users.

Separating these roles also makes it much easier to layer in `NSLocalizedString` later when you add multi-language support.

---

If I had to sum up today's post in one line: "If it's an error you're showing to users, start by filling in `errorDescription` on `LocalizedError`."

One small habit like this can make a huge difference in user experience, so definitely give it a try in your next project. Rooting for you! 🙌

---

## References

- [Create A Custom Swift Error [and override localizedDescription]](https://www.advancedswift.com/custom-errors-in-swift/)
- [Defining Custom Errors With Advanced Descriptions In Swift – SerialCoder.dev](https://serialcoder.dev/text-tutorials/swift-tutorials/defining-custom-errors-with-advanced-descriptions-in-swift/)
- [Alert and LocalizedError in SwiftUI – Augmented Code](https://augmentedcode.io/2020/03/01/alert-and-localizederror-in-swiftui/)
