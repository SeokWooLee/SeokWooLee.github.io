---
title: "+load vs +initialize 완벽 비교, 호출 시점부터 상속 함정까지 (Objective-C 면접 단골)"
description: "메서드 스위즐링 코드는 왜 하나같이 +load 안에 들어 있을까요? 비슷해 보이는 +initialize에 넣으면 안 되는 걸까요?"
header:
  og_image: /assets/images/posts/ce02c349-0560-4095-af6b-fd3574f7cbdd/objc-load-vs-initialize-1.jpg
tags:
  - ObjectiveC
  - load
  - initialize
  - 런타임
permalink: /load-vs-initialize-완벽-비교-호출-시점부터-상속-함정까지-Objective-C-면접-단골/
toc: true
toc_sticky: true
last_modified_at: 2026-08-01
---

메서드 스위즐링 코드는 왜 하나같이 `+load` 안에 들어 있을까요? 비슷해 보이는 `+initialize`에 넣으면 안 되는 걸까요?

`+load`와 `+initialize`는 둘 다 "클래스가 준비될 때 한 번 불리는 메서드"처럼 보이지만 호출 시점부터 호출 방식, 상속 규칙까지 전부 다릅니다. Objective-C 면접 단골 주제이기도 하고, 잘못 이해하면 "왜 이 코드가 두 번 실행되지?" 하고 헤매기 쉬운 지점이라 한 번쯤 정리해 둘 만합니다.

<figure>
  <img src="/assets/images/posts/ce02c349-0560-4095-af6b-fd3574f7cbdd/objc-load-vs-initialize-1.jpg" alt="+load와 +initialize 호출 시점을 알람시계와 초인종으로 대비한 썸네일" width="1200" height="800">
  <figcaption>하나는 무조건 새벽에, 하나는 초인종이 울릴 때만</figcaption>
</figure>

---

## 한눈 비교표

| | `+load` | `+initialize` |
|---|---|---|
| 호출 시점 | 클래스가 런타임에 로드될 때 (main 이전) | 클래스가 **첫 메시지를 받기 직전** (lazy) |
| 호출 방식 | 함수 포인터 직접 호출 | objc_msgSend 경유 |
| 카테고리 | 클래스 것과 카테고리 것 **모두 각각** 호출 | 카테고리 구현이 클래스 구현을 **덮어씀** |
| 상속 | 자기가 구현한 클래스만 호출됨 | 상속됨 — 서브클래스 때문에 **여러 번 불릴 수 있음** |
| 안 쓰이면? | 그래도 호출됨 | 클래스를 안 쓰면 영영 호출 안 됨 |

표만 봐서는 감이 안 오는 부분을 하나씩 풀어보겠습니다.

---

## +load: main보다 먼저, 무조건

`+load`는 해당 클래스(또는 카테고리)가 담긴 바이너리가 런타임에 로드되는 시점, 즉 **main 함수가 실행되기도 전에** 호출됩니다. 앱에서 그 클래스를 한 번도 안 써도 호출됩니다.

호출 방식이 특이합니다. objc_msgSend를 거치지 않고 **함수 포인터로 직접** 부릅니다. 그래서 일반적인 오버라이드 규칙이 적용되지 않습니다.

- 서브클래스가 `+load`를 구현 안 했다고 부모 것이 대신 불리지 않습니다
- 클래스의 `+load`와 카테고리의 `+load`가 **둘 다 각각** 호출됩니다 — 덮어쓰기가 아닙니다
- 순서 보장: 부모 클래스의 `+load`가 자식보다 먼저, 클래스의 `+load`가 카테고리보다 먼저

이 성질들이 스위즐링과 정확히 맞물립니다. 카테고리에서 `+load`를 구현해도 원본 클래스의 `+load`를 방해하지 않고 앱 수명에서 가장 이른 시점에 확실히 한 번 실행되니까요.

대신 대가가 있습니다. `+load`는 **앱 시작 시간에 그대로 청구됩니다.** 모든 클래스의 `+load`가 main 이전에 순차 실행되므로, 여기서 무거운 일을 하면 첫 화면이 늦게 뜹니다. 애플이 수년째 "가급적 +load를 피하라"고 안내하는 이유입니다. 실제로 `+load` 안에서는 self가 속한 이미지 밖의 다른 클래스가 아직 로드되지 않았을 수 있어 할 수 있는 일도 제한적입니다.

<figure>
  <img src="/assets/images/posts/ce02c349-0560-4095-af6b-fd3574f7cbdd/objc-load-vs-initialize-2.png" alt="앱 실행 타임라인에서 +load와 +initialize 호출 시점을 보여주는 다이어그램" width="552" height="1980" loading="lazy">
  <figcaption>갈림길은 msgSend를 거치느냐 하나입니다</figcaption>
</figure>

---

## +initialize: 첫 메시지 직전에, 게으르게

`+initialize`는 정반대 전략입니다. 클래스가 **첫 메시지를 받기 직전**에 런타임이 호출해 줍니다. 그 클래스를 앱에서 한 번도 안 쓰면 영영 호출되지 않습니다. 시작 시간에 부담이 없는, 게으른(lazy) 초기화 지점입니다.

여기는 objc_msgSend를 경유하기 때문에 일반 메서드처럼 **상속 규칙이 적용됩니다.** 바로 이 지점에서 그 유명한 함정이 나옵니다.

```objc
@implementation Animal
+ (void)initialize {
    NSLog(@"initialize: %@", self);
}
@end

@interface Dog : Animal
@end
@implementation Dog
@end
```

`Dog`에 첫 메시지를 보내면 로그가 이렇게 찍힙니다.

```
initialize: Animal
initialize: Dog
```

`Animal`의 `+initialize`가 **두 번** 실행됩니다. 한 번은 Animal 자신 몫, 한 번은 `+initialize`를 구현하지 않은 Dog가 부모 구현을 물려받아 실행한 몫입니다. 그래서 `+initialize`의 관례적 구현엔 클래스 체크가 들어갑니다.

```objc
+ (void)initialize {
    if (self == [Animal class]) {
        // 진짜 Animal 몫의 초기화만 여기서
    }
}
```

참고로 `+initialize`는 런타임이 클래스 단위로 락을 잡고 불러주기 때문에 그 자체로 스레드 안전합니다. `dispatch_once`를 겹쳐 쓸 필요는 없습니다.

---

## 실무 선택 기준

판단 기준은 간단합니다.

- **스위즐링, 클래스 등록처럼 "무조건, 가장 먼저" 필요한 일** → `+load` (단, 최소한으로)
- **그 클래스를 쓸 때만 필요한 준비 작업** → `+initialize` (self 체크 필수)
- **대부분의 초기화** → 사실 둘 다 아니고, `dispatch_once` 싱글톤이나 lazy 프로퍼티로 충분합니다

Swift에는 이 고민 자체가 없습니다. Swift는 `+load`에 해당하는 것을 아예 제공하지 않습니다. 전역 실행 코드를 main 전에 끼워 넣는 공식 통로 자체가 없습니다. 대신 타입 프로퍼티(`static let`)가 언어 차원에서 lazy + 스레드 안전을 보장하므로 `+initialize`의 역할을 대체합니다. 앱 시작 성능 관점에서 Swift가 구조적으로 유리한 지점 중 하나입니다.

<figure>
  <img src="/assets/images/posts/ce02c349-0560-4095-af6b-fd3574f7cbdd/objc-load-vs-initialize-3.jpg" alt="before main의 +load와 lazy한 +initialize를 경주 트랙으로 표현한 일러스트" width="1200" height="1200" loading="lazy">
  <figcaption>출발 전부터 뛰는 쪽과 첫 호출까지 자는 쪽</figcaption>
</figure>

---

## 정리

- `+load`는 **main 이전, 무조건, 함수 포인터 직접 호출** — 클래스와 카테고리 것이 각각 다 불립니다
- `+initialize`는 **첫 메시지 직전, lazy, msgSend 경유** — 안 쓰는 클래스에선 영영 안 불립니다
- `+initialize`는 상속 때문에 여러 번 실행될 수 있어 `if (self == [MyClass class])` 체크가 관례입니다
- 스위즐링이 `+load`에 사는 이유: 가장 이른 시점 + 카테고리 독립 호출 + 확실한 1회 실행
- `+load` 남발은 앱 시작 시간을 직접 늦춥니다 — 무거운 초기화는 lazy로 미루는 게 정답입니다

런타임 시리즈의 다른 글(objc_msgSend, 메시지 포워딩, 스위즐링, KVO)과 겹쳐 보면, `+load`와 `+initialize`의 차이가 결국 "msgSend를 거치느냐"라는 하나의 축에서 갈라진다는 게 보입니다. 호출 경로를 이해하면 규칙을 외울 필요가 없어집니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Objective-C 메서드 스위즐링(Method Swizzling) 완벽 정리](/Objective-C-%EB%A9%94%EC%84%9C%EB%93%9C-%EC%8A%A4%EC%9C%84%EC%A6%90%EB%A7%81Method-Swizzling-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC/)
<!-- /RELATED-POSTS -->
