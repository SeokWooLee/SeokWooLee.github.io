---
title: "스택(Stack)과 큐(Queue) 완벽 정리, Swift에 Stack 타입이 없는 이유 (removeFirst 함정까지)"
description: "자료구조 공부를 시작하면 가장 먼저 만나는 두 형제가 스택(Stack)과 큐(Queue)입니다."
header:
  og_image: /assets/images/posts/b3b25947-bca7-4159-a81d-72e71cecace5/stack-vs-queue-lifo-fifo-1.jpg
tags:
  - 자료구조
  - 스택
  - 큐
  - LIFO
permalink: /스택Stack과-큐Queue-완벽-정리-Swift에-Stack-타입이-없는-이유-removeFirst-함정까지/
toc: true
toc_sticky: true
last_modified_at: 2026-08-04
---

자료구조 공부를 시작하면 가장 먼저 만나는 두 형제가 스택(Stack)과 큐(Queue)입니다.

개념 자체는 5분이면 끝납니다. 그런데 Swift로 넘어오면 이상한 점이 하나 보입니다. 표준 라이브러리에 `Array`, `Dictionary`, `Set`은 있는데 **`Stack`과 `Queue` 타입은 없습니다.** 왜 없는지, 그리고 없는 채로 어떻게 써야 하는지까지가 이 글의 범위입니다.

특히 큐를 배열로 흉내 낼 때 밟는 성능 지뢰(`removeFirst()`)는 코딩 테스트에서 시간 초과의 단골 원인이라, 따로 자세히 다룹니다.

<figure>
  <img src="/assets/images/posts/b3b25947-bca7-4159-a81d-72e71cecace5/stack-vs-queue-lifo-fifo-1.jpg" alt="스택 LIFO 접시 더미와 큐 FIFO 줄서기를 대비한 Stack vs Queue 자료구조 썸네일" width="1200" height="800">
  <figcaption>접시는 위에서, 줄은 앞에서 — 이 차이가 전부입니다</figcaption>
</figure>

---

## 개념은 접시와 줄서기로 끝

**스택은 LIFO(Last In, First Out)**. 마지막에 넣은 게 먼저 나옵니다. 접시 더미를 떠올리면 됩니다. 위에 쌓고(push), 위에서 꺼냅니다(pop). 중간에서 빼는 건 반칙입니다.

**큐는 FIFO(First In, First Out)**. 먼저 넣은 게 먼저 나옵니다. 계산대 줄서기입니다. 뒤로 들어와서(enqueue) 앞으로 나갑니다(dequeue).

연산은 각각 두 개가 전부입니다.

| | 넣기 | 꺼내기 | 엿보기 |
|---|---|---|---|
| 스택 | push | pop | peek(top) |
| 큐 | enqueue | dequeue | front |

이게 전부인데 왜 중요할까요? 이 단순한 규칙이 iOS 개발 곳곳의 뼈대이기 때문입니다.

- **콜 스택**: 함수 호출과 리턴이 정확히 push/pop입니다. 재귀가 깊어지면 나는 크래시 이름이 괜히 stack overflow가 아닙니다
- **UINavigationController**: `pushViewController` / `popViewController` — 화면 전환이 문자 그대로 스택입니다
- **실행취소(undo)**: 커맨드를 스택에 쌓고 역순으로 되돌립니다
- **GCD(Grand Central Dispatch)의 DispatchQueue**: 이름 그대로 큐입니다. serial queue에 넣은 작업은 넣은 순서대로 실행됩니다
- **BFS/DFS**: 그래프 탐색에서 큐를 쓰면 BFS(Breadth-First Search, 너비 우선 탐색), 스택을 쓰면 DFS(Depth-First Search, 깊이 우선 탐색)가 됩니다. 자료구조 선택이 곧 알고리즘 선택입니다

---

## Swift에 Stack이 없는 이유

결론부터 말하면, **Array가 이미 완벽한 스택이기 때문**입니다.

```swift
var stack: [Int] = []
stack.append(3)      // push — O(1)
stack.append(7)
let top = stack.last // peek — O(1)
let popped = stack.popLast() // pop — O(1), 비어 있으면 nil
```

배열의 끝에서 넣고 빼는 연산은 전부 O(1)입니다(정확히는 amortized O(1) — 내부 버퍼가 꽉 찼을 때만 확장 비용이 듭니다). 별도 타입을 만들어봐야 Array를 감싼 껍데기라서 표준 라이브러리는 타입을 추가하지 않는 쪽을 택했습니다.

그래도 의도를 드러내고 싶다면 얇게 감싸는 게 관례입니다.

```swift
struct Stack<Element> {
    private var storage: [Element] = []
    var isEmpty: Bool { storage.isEmpty }
    var top: Element? { storage.last }
    mutating func push(_ element: Element) { storage.append(element) }
    mutating func pop() -> Element? { storage.popLast() }
}
```

`subscript`를 막아서 "중간 접근 금지"라는 스택의 규칙을 타입으로 강제하는 효과가 있습니다.

<figure>
  <img src="/assets/images/posts/b3b25947-bca7-4159-a81d-72e71cecace5/stack-vs-queue-lifo-fifo-2.png" alt="스택 push pop과 큐 enqueue dequeue 동작 구조를 나란히 그린 LIFO FIFO 다이어그램" width="1200" height="476" loading="lazy">
  <figcaption>넣고 빼는 방향만 기억하면 헷갈릴 일이 없습니다</figcaption>
</figure>

---

## 큐는 배열로 만들면 함정에 빠진다

스택과 같은 논리로 큐를 만들면 이렇게 됩니다.

```swift
var queue: [Int] = []
queue.append(1)              // enqueue — O(1), 문제없음
let first = queue.removeFirst() // dequeue — O(n), 여기가 함정
```

`removeFirst()`는 맨 앞 요소를 빼고 **나머지 전부를 한 칸씩 앞으로 당깁니다.** 요소가 10만 개면 dequeue 한 번에 10만 번의 이동이 일어납니다. BFS처럼 dequeue를 수만 번 반복하는 알고리즘에서 이걸 쓰면 전체가 O(n²)이 되고 코딩 테스트라면 시간 초과가 납니다.

해결책은 세 가지입니다.

**1. 인덱스로 앞을 밀기 (코딩 테스트 정석)**

```swift
var queue: [Int] = []
var head = 0
// enqueue
queue.append(5)
// dequeue
let value = queue[head]
head += 1
```

실제로 빼지 않고 읽는 위치만 옮깁니다. dequeue가 O(1)이 되고, 다 쓴 앞부분 메모리는 그대로 남지만 코딩 테스트에서는 거의 항상 이걸로 충분합니다.

**2. 스택 두 개로 큐 만들기 (면접 단골)**

넣을 때는 in 스택에 쌓고 뺄 때는 out 스택이 비어 있으면 in을 통째로 뒤집어 옮긴 뒤 pop합니다. 요소 하나당 이동이 최대 두 번이라 amortized O(1)입니다. "스택으로 큐를 구현하라"는 면접 문제의 정답이기도 합니다.

**3. swift-collections의 Deque (실무 정답)**

애플이 관리하는 [swift-collections](https://github.com/apple/swift-collections) 패키지의 `Deque`는 링 버퍼 기반이라 **양쪽 끝 삽입·삭제가 전부 O(1)**입니다.

```swift
import DequeModule

var queue: Deque<Int> = []
queue.append(1)            // enqueue
let v = queue.popFirst()   // dequeue — O(1)
```

Array와 API가 거의 같아서 교체 비용도 낮습니다. 실무에서 큐가 필요하면 직접 만들지 말고 이걸 쓰는 게 맞습니다.

---

## 어느 쪽을 쓸지 판단하는 기준

헷갈릴 때는 질문 하나면 정리됩니다. **"나중에 온 걸 먼저 처리해야 하나, 먼저 온 걸 먼저 처리해야 하나?"**

- 되돌리기, 괄호 짝 검사, 방문 경로 역추적, 깊이 우선 탐색 → 최근 것 우선 → **스택**
- 작업 대기열, 이벤트 처리, 프린터 출력, 너비 우선 탐색 → 도착 순서 보장 → **큐**

괄호 짝 검사는 스택의 대표 활용이라 한 줄만 짚고 갑니다. 여는 괄호를 만나면 push, 닫는 괄호를 만나면 pop해서 짝이 맞는지 확인 — 끝났을 때 스택이 비어 있으면 유효한 수식입니다. 컴파일러가 코드의 중괄호를 검사하는 원리도 같습니다.

<figure>
  <img src="/assets/images/posts/b3b25947-bca7-4159-a81d-72e71cecace5/stack-vs-queue-lifo-fifo-3.jpg" alt="Swift 배열 removeFirst O(n) 성능 함정을 컨베이어 벨트로 표현한 큐 일러스트" width="1200" height="1200" loading="lazy">
  <figcaption>하나 뺄 때마다 뒤에 있는 전부가 한 칸씩 움직입니다</figcaption>
</figure>

---

## 정리

- 스택은 LIFO, 큐는 FIFO — 접시 더미와 계산대 줄이면 개념은 끝입니다
- 콜 스택·내비게이션 스택·undo가 스택, DispatchQueue·이벤트 처리·BFS가 큐 — iOS 개발 곳곳에 이미 깔려 있습니다
- Swift에 Stack 타입이 없는 건 **Array의 append/popLast가 이미 O(1) 스택**이기 때문입니다
- 큐를 배열로 만들 때 `removeFirst()`는 O(n) — 코딩 테스트 시간 초과의 단골 원인입니다
- 해결책은 head 인덱스 방식, 스택 두 개 방식, 그리고 실무라면 swift-collections의 **Deque**입니다
- 스택이냐 큐냐는 "최근 것 우선이냐, 도착 순서 우선이냐"라는 질문 하나로 갈립니다

다음 글에서는 이 둘의 응용판인 힙(Heap)과 우선순위 큐, 그리고 Dictionary 뒤에 숨은 해시 테이블로 이어가겠습니다.
