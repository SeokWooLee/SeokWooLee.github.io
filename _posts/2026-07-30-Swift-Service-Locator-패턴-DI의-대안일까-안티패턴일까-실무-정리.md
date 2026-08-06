---
title: "Swift Service Locator 패턴, DI의 대안일까 안티패턴일까 (실무 정리)"
description: "iOS 앱 규모가 커지면서 의존성 관리 때문에 골치 아파진 적, 한 번쯤 있으실 거예요."
header:
  og_image: /assets/images/posts/8901a7e4-5a49-4c0e-9f91-65ff16d0b5b4/1.jpg
tags:
  - Swift
  - ServiceLocator
  - 의존성주입
  - iOS개발
permalink: /Swift-Service-Locator-패턴-DI의-대안일까-안티패턴일까-실무-정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-30
---

iOS 앱 규모가 커지면서 의존성 관리 때문에 골치 아파진 적, 한 번쯤 있으실 거예요.

그러다 보면 꼭 만나는 게 바로 **Swift Service Locator 패턴**입니다. 편하다는 사람도 많고, 안티패턴이라며 손사래 치는 분도 많더라고요.

저는 전면 도입보다는 꼭 필요한 지점에만 부분적으로 쓰는 쪽에서 재미를 봤어요.

결론부터 말씀드리면 이렇습니다.

> Service Locator는 DI(Dependency Injection, 의존성 주입)의 완전한 대안이 아니라, 잘못 쓰면 의존성을 숨기는 안티패턴이 되는 '보조 도구'에 가깝습니다.

그래서 오늘은 이 패턴이 뭔지, 왜 욕을 먹는지, 그래도 언제 쓸 만한지를 제 경험 위주로 풀어볼게요.

<figure>
  <img src="/assets/images/posts/8901a7e4-5a49-4c0e-9f91-65ff16d0b5b4/1.jpg" alt="Swift Service Locator 패턴, DI랑 나란히 놓고 보면 차이가 확 옵니다" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>Swift Service Locator 패턴, DI랑 나란히 놓고 보면 차이가 확 옵니다</figcaption>
</figure>

---

## Service Locator 패턴이 뭔가요?

한 문장으로 말하면, **필요한 객체를 중앙 저장소에서 꺼내 쓰는 방식**이에요.

어딘가에 '등록소' 하나를 두고, 객체가 필요할 때마다 거기서 찾아 쓰는 구조입니다.

생성자 주입(Constructor Injection)이 밖에서 의존성을 넣어주는 방식이라면, Service Locator는 안에서 직접 꺼내 쓰는 방식이라고 보시면 돼요.

<figure>
  <img src="/assets/images/posts/8901a7e4-5a49-4c0e-9f91-65ff16d0b5b4/4-1783847558818.png" alt="밖에서 넣어주느냐, 안에서 꺼내 쓰느냐의 차이" width="1200" height="266" loading="lazy" decoding="async">
  <figcaption>밖에서 넣어주느냐, 안에서 꺼내 쓰느냐의 차이</figcaption>
</figure>

코드로 보면 감이 빨리 오실 거예요.

```swift
// 중앙 저장소에 서비스를 등록하고 꺼내 쓰는 구조
final class ServiceLocator {
    static let shared = ServiceLocator()
    private var services: [String: Any] = [:]

    func register<T>(_ service: T) { services["\(T.self)"] = service }
    func resolve<T>() -> T { services["\(T.self)"] as! T }
}
```

등록은 앱 시작 시점에 한 번 해두고요.

실제 사용하는 쪽에서는 이렇게 필요한 걸 꺼내 씁니다.

```swift
// 뷰모델 내부에서 직접 의존성을 '찾아' 온다
final class FeedViewModel {
    private let api: APIClient = ServiceLocator.shared.resolve()
    // 생성자에 api를 넣지 않아도 동작한다
}
```

보시면 알겠지만, 생성자가 깔끔해지는 게 최대 장점이에요.

---

## Service Locator는 왜 안티패턴이라고 할까?

가장 큰 이유는 딱 하나예요. **의존성이 숨어버린다**는 점입니다.

위 `FeedViewModel` 코드를 다시 보실게요. 생성자만 봐서는 이 클래스가 `APIClient`를 쓴다는 걸 알 수가 없어요.

내부를 열어봐야 비로소 보이죠. 협업할 때 이게 은근히 큰 불편입니다.

두 번째 문제는 테스트예요.

생성자 주입은 테스트할 때 가짜 객체(Mock)를 그냥 넣어주면 끝이거든요. 그런데 Service Locator는 전역 저장소 상태를 바꿔줘야 해서 테스트끼리 상태가 얽히기 쉽습니다.

세 번째는 런타임 위험이에요.

등록을 깜빡한 의존성을 꺼내려 하면 컴파일 타임이 아니라 앱 실행 중에 크래시가 납니다. 위 예제의 `as!` 강제 캐스팅이 딱 그 지점이죠.

정리하면 이렇습니다.

| 비교 항목 | 생성자 주입(DI) | Service Locator |
|---|---|---|
| 의존성 노출 | 명확히 드러남 | 내부에 숨음 |
| 테스트 용이성 | 높음 | 낮은 편 |
| 오류 발견 시점 | 컴파일 타임 | 런타임 |
| 생성자 간결함 | 인자 많아짐 | 깔끔함 |

<figure>
  <img src="/assets/images/posts/8901a7e4-5a49-4c0e-9f91-65ff16d0b5b4/2.jpg" alt="생성자만 봐선 뭘 쓰는지 안 보이는 게 늘 걸렸어요" width="1024" height="1024" loading="lazy" decoding="async">
  <figcaption>생성자만 봐선 뭘 쓰는지 안 보이는 게 늘 걸렸어요</figcaption>
</figure>

---

## 그럼 언제 써도 괜찮을까요?

무조건 나쁘다는 건 아니에요. 저는 이런 상황에서 요긴하게 썼습니다.

1. 앱 전역에서 공유하는 단일 서비스(로거, 분석 도구 등)
2. 생성자 주입 경로가 너무 깊어 인자가 계속 딸려 내려갈 때
3. 레거시 코드에 DI를 점진적으로 도입하는 과도기

특히 세 번째가 현실적이에요.

이미 짜인 코드에 생성자 주입을 한 번에 다 넣기는 부담스럽잖아요. 이럴 때 Service Locator로 임시 다리를 놓고 조금씩 생성자 주입으로 옮기는 게 안전하더라고요.

요즘은 순수 Service Locator보다 **Swinject**나 Swift의 `@Environment` 같은 DI 컨테이너를 많이 씁니다.

이들도 내부적으로는 저장소에서 꺼내 쓰는 구조지만 등록 검증이나 스코프 관리가 더 탄탄해서 위험이 줄어들어요.

---

## 자주 묻는 질문

**Q. Singleton이랑 뭐가 다른가요?**

Singleton은 특정 객체 하나가 전역이 되는 거고, Service Locator는 여러 객체를 담아두는 '창고' 역할이에요. 성격이 조금 다릅니다.

**Q. SwiftUI에서도 쓰나요?**

SwiftUI의 `@Environment`와 `@EnvironmentObject`가 사실 Service Locator와 상당히 닮은 개념이에요. 애플이 프레임워크 차원에서 비슷한 방식을 제공하는 셈이죠.

**Q. 결국 뭘 기본으로 삼아야 하나요?**

기본은 생성자 주입으로 두시길 권합니다. Service Locator는 꼭 필요한 지점에만 국소적으로 쓰세요.

<figure>
  <img src="/assets/images/posts/8901a7e4-5a49-4c0e-9f91-65ff16d0b5b4/3.jpg" alt="결국 화이트보드에 의존성 그려놓고 정리하는 게 제일 빨랐습니다" width="1200" height="1200" loading="lazy" decoding="async">
  <figcaption>결국 화이트보드에 의존성 그려놓고 정리하는 게 제일 빨랐습니다</figcaption>
</figure>

---

의존성 관리에 정답은 없지만, 방향은 분명해요.

의존성은 되도록 드러내고, 숨기는 도구는 꼭 필요한 곳에만 조심스럽게 쓰시길 바랍니다. 그렇게만 관리하셔도 유지보수가 훨씬 편해지실 거예요.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift enum 상태 기계(FSM) 만들기, 스테이트 패턴 없이 상태 관리하는 법](/Swift-enum-%EC%83%81%ED%83%9C-%EA%B8%B0%EA%B3%84FSM-%EB%A7%8C%EB%93%A4%EA%B8%B0-%EC%8A%A4%ED%85%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%97%86%EC%9D%B4-%EC%83%81%ED%83%9C-%EA%B4%80%EB%A6%AC%ED%95%98%EB%8A%94-%EB%B2%95/)
- [Swift Copy-on-Write, 값 타입이 프로토타입 패턴을 대체하는 방식 (개념 정리)](/Swift-Copy-on-Write-%EA%B0%92-%ED%83%80%EC%9E%85%EC%9D%B4-%ED%94%84%EB%A1%9C%ED%86%A0%ED%83%80%EC%9E%85-%ED%8C%A8%ED%84%B4%EC%9D%84-%EB%8C%80%EC%B2%B4%ED%95%98%EB%8A%94-%EB%B0%A9%EC%8B%9D-%EA%B0%9C%EB%85%90-%EC%A0%95%EB%A6%AC/)
- [Swift 정적 팩토리 메서드(Static Factory Method), init 대신 static func make 쓰는 이유](/Swift-%EC%A0%95%EC%A0%81-%ED%8C%A9%ED%86%A0%EB%A6%AC-%EB%A9%94%EC%84%9C%EB%93%9CStatic-Factory-Method-init-%EB%8C%80%EC%8B%A0-static-func-make-%EC%93%B0%EB%8A%94-%EC%9D%B4%EC%9C%A0/)
<!-- /RELATED-POSTS -->
