---
title: "Swift 오브젝트 풀 패턴(Object Pool Pattern) 완전정리 (플라이웨이트와 차이·재사용법)"
description: "게임 이펙트를 잔뜩 뿌리는 화면을 만들다 보면 프레임이 뚝뚝 끊기는 순간이 옵니다."
header:
  og_image: /assets/images/posts/5741e48b-8a9c-4976-b0ac-a2fe1ca180f3/1.jpg
tags:
  - Swift
  - 오브젝트풀
  - 디자인패턴
  - 플라이웨이트
permalink: /Swift-오브젝트-풀-패턴Object-Pool-Pattern-완전정리-플라이웨이트와-차이재사용법/
toc: true
toc_sticky: true
last_modified_at: 2026-07-29
---

게임 이펙트를 잔뜩 뿌리는 화면을 만들다 보면 프레임이 뚝뚝 끊기는 순간이 옵니다.

총알이나 파티클처럼 짧게 살고 금방 사라지는 객체를 계속 `init`으로 만들면, 인스트루먼트에서 메모리 그래프가 톱니처럼 튀는 걸 보게 됩니다.

이럴 때 꺼내 드는 게 바로 **Swift 오브젝트 풀 패턴**입니다.

결론부터 말씀드릴게요. 오브젝트 풀은 "객체를 매번 새로 만들지 않고 미리 만들어둔 걸 빌려 쓰고 반납하는" 재사용 기법이고 자주 헷갈리는 플라이웨이트와는 목적 자체가 다릅니다.

<figure>
  <img src="/assets/images/posts/5741e48b-8a9c-4976-b0ac-a2fe1ca180f3/1.jpg" alt="Swift 오브젝트 풀과 플라이웨이트, 한눈에 비교해봤어요" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>Swift 오브젝트 풀과 플라이웨이트, 한눈에 비교해봤어요</figcaption>
</figure>

이 글에서는 오브젝트 풀이 뭔지, 플라이웨이트와 어떻게 다른지, 그리고 Swift로 실제 어떻게 짜는지까지 순서대로 풀어드릴게요.

---

## 오브젝트 풀 패턴이 뭔가요?

오브젝트 풀은 생성 비용이 비싼 객체를 미리 여러 개 만들어 "풀(pool)"에 담아두는 방식입니다.

필요할 때 새로 만드는 게 아니라 풀에서 하나 꺼내 쓰고, 다 쓰면 다시 풀에 반납합니다.

핵심은 **재사용**이에요. `init`과 `deinit`을 반복하면서 생기는 메모리 할당·해제 비용을 줄이는 게 목적입니다.

> 오브젝트 풀의 한 문장 요약은 "만들지 말고 빌려 쓰고 돌려받아라"입니다.

주로 이런 상황에서 빛을 발합니다.

- 총알, 파티클처럼 짧은 시간에 대량으로 생성·소멸되는 객체
- 네트워크 연결이나 스레드처럼 생성 자체가 무거운 리소스
- `UITableViewCell`의 재사용 큐처럼 화면에서 계속 갈아끼우는 뷰

사실 iOS 개발자라면 이미 오브젝트 풀을 쓰고 있었어요. `dequeueReusableCell`이 바로 애플이 만들어둔 오브젝트 풀이거든요.

---

## 플라이웨이트와 뭐가 다른가요?

둘 다 "객체를 아껴 쓴다"는 인상 때문에 헷갈리기 쉽습니다.

하지만 목적이 완전히 다릅니다.

오브젝트 풀은 **같은 객체를 시간차를 두고 돌려쓰는** 방식입니다. 지금 이 총알을 쓰고 반납하면, 다음 총알이 그 자리를 물려받아요.

플라이웨이트는 **여러 곳에서 동시에 하나의 공유 객체를 참조하는** 방식입니다. 예를 들어 숲에 나무 1만 그루를 그릴 때, 나무의 색·질감 같은 공통 데이터는 한 벌만 두고 위치 값만 따로 넘깁니다.

표로 정리하면 이렇게 나뉩니다.

| 구분 | 오브젝트 풀 | 플라이웨이트 |
| --- | --- | --- |
| 목적 | 생성·해제 비용 절감 | 메모리 사용량 절감 |
| 재사용 방식 | 빌려 쓰고 반납 (시간 분할) | 동시에 공유 (공간 분할) |
| 상태 | 객체마다 고유 상태 유지 | 공유 상태 + 외부 상태 분리 |
| 대표 예시 | 셀 재사용, 파티클 | 폰트 글리프, 지도 아이콘 |

한 줄로 정리하면 오브젝트 풀은 "차례로 돌려쓰기", 플라이웨이트는 "다 같이 나눠쓰기"입니다.

<figure>
  <img src="/assets/images/posts/5741e48b-8a9c-4976-b0ac-a2fe1ca180f3/2.jpg" alt="빌려 쓰고 반납하는 구조라 코드가 생각보다 단순합니다" width="1200" height="1200" loading="lazy" decoding="async">
  <figcaption>빌려 쓰고 반납하는 구조라 코드가 생각보다 단순합니다</figcaption>
</figure>

---

## Swift로 오브젝트 풀 만드는 법

생각보다 구조는 단순합니다. 사용 가능한 객체를 담는 배열 하나, 그리고 빌려주고 돌려받는 메서드 두 개면 됩니다.

아래는 제네릭으로 짠 간단한 풀입니다.

```swift
final class ObjectPool<T> {
    private var available: [T] = []
    private let factory: () -> T

    init(factory: @escaping () -> T) { self.factory = factory }

    func acquire() -> T { available.popLast() ?? factory() }  // 없으면 새로 생성
    func release(_ item: T) { available.append(item) }        // 다 쓰면 반납
}
```

`acquire()`는 풀에 남은 게 있으면 꺼내 주고, 비었으면 그때만 새로 만듭니다.

`release()`로 반납하면 다음 요청이 그 객체를 재사용해요.

<figure>
  <img src="/assets/images/posts/5741e48b-8a9c-4976-b0ac-a2fe1ca180f3/4-1783847575845.png" alt="빌리고 쓰고 돌려주고, 이 순환이 전부예요" width="330" height="766" loading="lazy" decoding="async">
  <figcaption>빌리고 쓰고 돌려주고, 이 순환이 전부예요</figcaption>
</figure>

실제로 파티클에 적용하면 이런 흐름이 됩니다.

```swift
let pool = ObjectPool<Particle> { Particle() }

let p = pool.acquire()  // 풀에서 빌리기
p.reset(at: point)      // 상태 초기화가 중요!
// ...화면에서 다 쓴 뒤
pool.release(p)         // 반납
```

여기서 꼭 기억할 점 하나. 반납받은 객체는 **이전 상태가 그대로 남아** 있어요.

그래서 다시 빌려줄 때는 `reset()` 같은 초기화를 반드시 거쳐야 유령 데이터가 안 생깁니다.

---

## 오브젝트 풀, 언제 쓰고 언제 피할까?

좋다고 아무 데나 쓰면 오히려 독이 됩니다.

직접 써보고 정리한 기준이에요.

**이럴 때 추천해요.**

1. 초당 수십 개 이상 생성·소멸이 반복될 때
2. 객체 하나 만드는 비용이 눈에 띄게 클 때
3. 메모리 그래프가 톱니처럼 튀어 GC(가비지 컬렉션)/ARC(Automatic Reference Counting, 자동 참조 계수) 부담이 보일 때

**이럴 땐 다시 생각해보세요.**

- 가끔 한두 개만 만드는 가벼운 객체라면 풀 관리 비용이 더 큽니다
- 반납을 깜빡하면 풀이 텅 비어 오히려 매번 새로 만들게 됩니다
- 멀티스레드 환경이면 풀 접근에 락이나 큐 동기화가 필요해요

Swift는 값 타입(struct)이 많고 ARC가 꽤 효율적이라 무조건 풀부터 도입할 필요는 없습니다.

먼저 인스트루먼트로 측정하고 병목이 확인됐을 때 도입하는 순서를 권합니다.

<figure>
  <img src="/assets/images/posts/5741e48b-8a9c-4976-b0ac-a2fe1ca180f3/3.jpg" alt="측정해보니 메모리 그래프부터 확실히 잔잔해지더라고요" width="1024" height="1024" loading="lazy" decoding="async">
  <figcaption>측정해보니 메모리 그래프부터 확실히 잔잔해지더라고요</figcaption>
</figure>

---

오브젝트 풀은 생성 비용을 아끼는 재사용 패턴이고 플라이웨이트는 메모리를 아끼는 공유 패턴입니다.

둘의 차이만 확실히 잡아두면 상황에 맞는 카드를 꺼내 쓸 수 있어요.

측정부터 하고 필요할 때 딱 맞게 도입해보세요. 프레임이 한결 부드러워지는 순간을 꼭 경험하시길 바랍니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 미들웨어 패턴(Middleware Pattern), 데코레이터와 책임 연쇄 실전 조합](/Swift-%EB%AF%B8%EB%93%A4%EC%9B%A8%EC%96%B4-%ED%8C%A8%ED%84%B4Middleware-Pattern-%EB%8D%B0%EC%BD%94%EB%A0%88%EC%9D%B4%ED%84%B0%EC%99%80-%EC%B1%85%EC%9E%84-%EC%97%B0%EC%87%84-%EC%8B%A4%EC%A0%84-%EC%A1%B0%ED%95%A9/)
- [Swift 인터프리터 패턴(Interpreter Pattern), 미니 언어 해석기 직접 만들기](/Swift-%EC%9D%B8%ED%84%B0%ED%94%84%EB%A6%AC%ED%84%B0-%ED%8C%A8%ED%84%B4Interpreter-Pattern-%EB%AF%B8%EB%8B%88-%EC%96%B8%EC%96%B4-%ED%95%B4%EC%84%9D%EA%B8%B0-%EC%A7%81%EC%A0%91-%EB%A7%8C%EB%93%A4%EA%B8%B0/)
- [Swift 템플릿 메서드 패턴(Template Method), 프로토콜 extension으로 뼈대 잡기](/Swift-%ED%85%9C%ED%94%8C%EB%A6%BF-%EB%A9%94%EC%84%9C%EB%93%9C-%ED%8C%A8%ED%84%B4Template-Method-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C-extension%EC%9C%BC%EB%A1%9C-%EB%BC%88%EB%8C%80-%EC%9E%A1%EA%B8%B0/)
<!-- /RELATED-POSTS -->
