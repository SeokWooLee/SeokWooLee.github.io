---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Stack vs. Heap: Where Your Variables Actually Live (Including Swift Value Types)"
lang: en
description: "When you declare a variable, where does its value actually get stored?"
header:
  og_image: /assets/images/posts/39da779b-da57-43cc-acf3-a463444242ba/1.png
tags:
  - stack
  - heap
  - memory layout
  - stack overflow
  - ARC
  - Swift
  - structs
  - classes
  - technical interview
  - CS fundamentals
permalink: /en/스택-vs-힙-변수가-저장되는-곳-완벽-정리-Swift-값-타입까지/
toc: true
toc_sticky: true
last_modified_at: 2026-07-20
---

🌐 [한국어](/%EC%8A%A4%ED%83%9D-vs-%ED%9E%99-%EB%B3%80%EC%88%98%EA%B0%80-%EC%A0%80%EC%9E%A5%EB%90%98%EB%8A%94-%EA%B3%B3-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-Swift-%EA%B0%92-%ED%83%80%EC%9E%85%EA%B9%8C%EC%A7%80/) · **English** · [日本語](/ja/%EC%8A%A4%ED%83%9D-vs-%ED%9E%99-%EB%B3%80%EC%88%98%EA%B0%80-%EC%A0%80%EC%9E%A5%EB%90%98%EB%8A%94-%EA%B3%B3-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-Swift-%EA%B0%92-%ED%83%80%EC%9E%85%EA%B9%8C%EC%A7%80/) · [中文](/zh/%EC%8A%A4%ED%83%9D-vs-%ED%9E%99-%EB%B3%80%EC%88%98%EA%B0%80-%EC%A0%80%EC%9E%A5%EB%90%98%EB%8A%94-%EA%B3%B3-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-Swift-%EA%B0%92-%ED%83%80%EC%9E%85%EA%B9%8C%EC%A7%80/)
{: .notice--info}

When you declare a variable, where does its value actually get stored?

If your answer is "memory," that's half right and half incomplete. Even within memory, values placed on the stack and values placed on the heap have completely different fates.

The term "stack overflow," the performance gap between classes and structs, why ARC even needs to exist — all of it traces back to these two regions.

This post breaks down how the stack and heap each work, why there's a speed difference between them, and what goes where in Swift.

<figure>
  <img src="/assets/images/posts/39da779b-da57-43cc-acf3-a463444242ba/1.png" alt="The stack is like stacking plates, the heap is like managing a warehouse. That's where the speed difference comes from.">
  <figcaption>The stack is like stacking plates, the heap is like managing a warehouse. That's where the speed difference comes from.</figcaption>
</figure>

Let's start with the key takeaways.

1. Stack: an automatically managed region that grows with function calls and shrinks when they return. Fast.
2. Heap: a dynamic region you borrow space from at runtime, in whatever size you need. Flexible, but it costs management overhead.
3. The real reason for the speed gap comes down to "how allocation and deallocation happen" and "who's responsible for cleanup."
4. In Swift, structs generally live on the stack, while class instances live on the heap.

---

## The Stack: A Stack of Plates

The stack is the region where function call information piles up. It works exactly like its name suggests — stacking plates. It's a LIFO (last-in, first-out) structure, where the last plate placed on top is the first one taken off.

When you call a function, its local variables, parameters, and return address get pushed together as a single unit (a stack frame). When the function returns, that entire frame disappears at once.

This is where the stack's strengths come from.

**Allocation is fast.** All it takes is moving the stack pointer up. There's no need to go hunting for free space.

**Deallocation is free, too.** Once a function ends, the pointer just moves back. Nobody has to figure out what needs cleaning up.

There are trade-offs, though. The size has to be known at compile time, everything on it disappears the moment the function returns, and the total capacity is small (typically a few megabytes). If a recursive function keeps calling itself without a termination condition, its frames eventually exceed that limit — and that's exactly the error known as a stack overflow.

---

## The Heap: A Spacious but High-Maintenance Warehouse

The heap is a region you borrow from at runtime, taking exactly as much as you need. You don't need to know the size in advance, it survives past the end of the function that created it, and it's far larger in capacity.

But that flexibility comes with management overhead.

**Allocation is relatively slow.** The system has to search for free space that fits the requested size, and if multiple threads are requesting allocations at the same time, that has to be coordinated too.

**Someone has to take responsibility for deallocation.** Since heap memory doesn't disappear when a function ends, something has to decide when it's "no longer needed." In C, the programmer calls free manually. In Java, the garbage collector sweeps periodically. In Swift, ARC keeps a reference count and deallocates the moment it hits zero.

Get this judgment wrong and you run into one of two problems: deallocate too late and you get a memory leak; deallocate too early and you get access to freed memory (a dangling pointer).

<figure>
  <img src="/assets/images/posts/39da779b-da57-43cc-acf3-a463444242ba/2.png" alt="A reference in the stack frame pointing to the actual object sitting on the heap." loading="lazy">
  <figcaption>A reference in the stack frame pointing to the actual object sitting on the heap.</figcaption>
</figure>

---

## What Goes Where in Swift

Apple's official documentation and WWDC sessions keep hammering on the same structure: by default, value types (structs and enums) get allocated on the stack, while reference types (classes) get allocated on the heap.

```swift
struct PointStruct { var x, y: Double }
class PointClass { var x = 0.0, y = 0.0 }

func run() {
    let a = PointStruct(x: 1, y: 2) // Lives entirely inside the stack frame
    let b = PointClass()            // Allocated on the heap; only a reference sits on the stack
}
```

Struct `a` gets its value placed entirely within the stack frame. When the function ends, it disappears along with the frame — no reference counting needed at all.

Class instance `b` gets a spot on the heap, and only its address sits on the stack. Since it can be referenced from multiple places, ARC has to keep counting.

This is exactly the performance argument behind Apple's recommendation to "favor structs." It eliminates heap allocation, reference counting, and locking overhead all at once.

That said, "struct = always on the stack" isn't quite accurate. A struct that's a property of a class lives on the heap along with that class, and types like String or Array look like structs on the surface but actually keep their real data buffer on the heap. It's more accurate to think of it as "structs meet the conditions needed to be placed on the stack," rather than a hard guarantee.

<figure>
  <img src="/assets/images/posts/39da779b-da57-43cc-acf3-a463444242ba/3.png" alt="A struct sits entirely on the stack, while a class keeps its body on the heap with only a reference on the stack." loading="lazy">
  <figcaption>A struct sits entirely on the stack, while a class keeps its body on the heap with only a reference on the stack.</figcaption>
</figure>

---

## Common Follow-Up Interview Questions

**"Why is the stack faster than the heap?"** — The stack handles allocation and deallocation with nothing more than a pointer move, while the heap needs to search for free space and manage deallocation (via reference counting or GC).

**"Why does a stack overflow happen?"** — The stack has a small size limit, and deep recursion or oversized local variables can push a frame past that limit.

**"Are local variables always on the stack?"** — No. Even a local variable that's a reference type only has its body on the heap. Only the reference itself sits on the stack.

---

## Summary

- The stack is a region that automatically grows and shrinks per function call. It's managed with nothing but pointer movement, which makes it fast.
- The heap is a region you borrow from at runtime with a size decided on the spot. It's flexible, but it costs you in allocation search time and deallocation management.
- Deallocation responsibility: automatic on the stack, but it varies by language on the heap (manual in C, GC in Java, ARC in Swift).
- A stack overflow is the error that occurs when something like deep recursion pushes past the stack's size limit.
- In Swift, structs generally live on the stack while classes live on the heap — this is the performance rationale behind favoring value types.
- That said, a struct nested inside a class lives on the heap, and types like String and Array keep their internal buffers on the heap.
