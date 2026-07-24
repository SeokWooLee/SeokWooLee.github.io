---
title: "Swift 템플릿 메서드 패턴(Template Method), 프로토콜 extension으로 뼈대 잡기"
description: "비슷한 로직을 클래스마다 복붙하다가 \"이거 뭔가 잘못됐는데\" 싶었던 적 있으신가요? iOS 앱에서 화면별 데이터 로딩 코드를 세 번째 복사할 때쯤이면 손이 멈추게 되죠."
header:
  og_image: /assets/images/posts/1ea35405-8e4c-456a-8c11-0c61487bea78/1.png
tags:
  - Swift
  - iOS개발
  - 디자인패턴
  - 템플릿메서드패턴
permalink: /Swift-템플릿-메서드-패턴Template-Method-프로토콜-extension으로-뼈대-잡기/
toc: true
toc_sticky: true
last_modified_at: 2026-07-24
---

비슷한 로직을 클래스마다 복붙하다가 "이거 뭔가 잘못됐는데" 싶었던 적 있으신가요? iOS 앱에서 화면별 데이터 로딩 코드를 세 번째 복사할 때쯤이면 손이 멈추게 되죠.

이럴 때 꺼내 들 도구가 바로 템플릿 메서드 패턴이에요.

결론부터 말씀드리면, 전체 흐름(뼈대)은 한 곳에 고정하고 달라지는 단계만 각자 채우게 만드는 패턴입니다. Swift에서는 이걸 상속 대신 프로토콜 extension으로 훨씬 깔끔하게 잡을 수 있어요.

<figure>
  <img src="/assets/images/posts/1ea35405-8e4c-456a-8c11-0c61487bea78/1.png" alt="상속으로 잡을 때랑 프로토콜 extension으로 잡을 때, 뼈대가 이렇게 다릅니다">
  <figcaption>상속으로 잡을 때랑 프로토콜 extension으로 잡을 때, 뼈대가 이렇게 다릅니다</figcaption>
</figure>

이 글에서는 템플릿 메서드 패턴이 뭔지, Swift에선 왜 프로토콜 extension이 정답에 가까운지, 실제 코드로 뼈대를 어떻게 잡는지까지 차례로 풀어볼게요.

## 핵심 요약 먼저 볼게요

1. 템플릿 메서드 패턴은 "고정된 절차 + 갈아끼우는 단계"를 분리하는 방법입니다
2. 전통적으로는 부모 클래스 상속으로 구현하지만, Swift답게 하려면 프로토콜 extension이 낫습니다
3. 뼈대는 extension의 기본 구현에, 달라지는 부분은 프로토콜 요구사항으로 남깁니다
4. 상속의 한계(단일 상속, 강한 결합)에서 자유로워집니다

---

## 템플릿 메서드 패턴이 뭔가요?

이름은 거창한데 개념은 단순합니다.

요리 레시피를 떠올려 보세요. "재료 준비 → 손질 → 조리 → 담기" 이 순서는 고정이에요.

근데 재료가 뭔지, 어떻게 조리하는지는 요리마다 다르죠.

여기서 순서(뼈대)가 템플릿 메서드고, 요리마다 달라지는 각 단계가 갈아끼우는 부분입니다.

> 흐름은 한 곳에서 통제하고, 세부 구현만 밖으로 위임한다.
>
> 이 한 줄이 템플릿 메서드 패턴의 전부라고 봐도 됩니다.

코드로 보면 이런 상황이에요. 데이터를 불러오는 절차는 어느 화면이든 똑같습니다. 로딩 시작 → 요청 → 파싱 → 화면 갱신.

달라지는 건 "어떤 URL을 요청하고", "받은 데이터를 어떻게 파싱하느냐" 정도죠.

이 공통 절차를 매번 다시 쓰는 게 낭비였던 겁니다.

---

## Swift에선 왜 상속 말고 프로토콜 extension인가요?

원조 방식은 부모 클래스에 뼈대를 두고, 자식이 특정 메서드만 override하는 구조입니다. Java 교과서에 나오는 그 방식이요.

그런데 Swift에서 이걸 클래스 상속으로 하면 걸리는 게 많습니다.

- 클래스는 단일 상속만 됩니다. 부모를 이미 하나 쓰고 있으면 끝이에요
- struct나 enum에는 아예 못 씁니다
- 부모-자식이 강하게 묶여서 나중에 갈아끼우기 힘듭니다

프로토콜 extension은 이 문제를 대부분 풀어줍니다.

뼈대가 되는 메서드는 extension의 기본 구현으로 제공하고, 달라지는 단계는 프로토콜 요구사항으로 선언만 해두는 거예요.

그러면 struct든 class든 그 프로토콜만 채택하면 공통 뼈대를 공짜로 가져갑니다. 상속의 제약 없이요.

아래는 데이터 로딩 절차를 프로토콜로 잡은 예시입니다. `load()`가 고정된 뼈대고, 나머지 둘이 갈아끼우는 부분이에요.

```swift
protocol DataLoadable {
    associatedtype Item
    var endpoint: URL { get }          // 화면마다 다름
    func parse(_ data: Data) -> [Item] // 화면마다 다름
}

extension DataLoadable {
    func load() async throws -> [Item] {   // 고정된 뼈대
        let (data, _) = try await URLSession.shared.data(from: endpoint)
        return parse(data)
    }
}
```

`load()`의 순서는 extension이 통제합니다.

각 화면은 `endpoint`와 `parse`만 자기 방식대로 채우면 되고요.

<figure>
  <img src="/assets/images/posts/1ea35405-8e4c-456a-8c11-0c61487bea78/4-1783847844973.png" alt="뼈대는 프로토콜에, 빈칸만 채택한 쪽이 채워요" loading="lazy">
  <figcaption>뼈대는 프로토콜에, 빈칸만 채택한 쪽이 채워요</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/1ea35405-8e4c-456a-8c11-0c61487bea78/2-1783772144178.png" alt="뼈대는 고정하고 달라지는 단계만 갈아끼우면 됩니다" loading="lazy">
  <figcaption>뼈대는 고정하고 달라지는 단계만 갈아끼우면 됩니다</figcaption>
</figure>

---

## 실제로 뼈대를 채워볼게요

이제 이 프로토콜을 채택하는 쪽을 볼게요. 상속이 아니라 채택이라 struct로도 됩니다.

```swift
struct ArticleLoader: DataLoadable {
    let endpoint = URL(string: "https://api.example.com/articles")!
    func parse(_ data: Data) -> [Article] {
        (try? JSONDecoder().decode([Article].self, from: data)) ?? []
    }
}
// 사용: let articles = try await ArticleLoader().load()
```

보시면 `ArticleLoader`는 `load()`를 직접 구현하지 않았어요.

그런데도 `load()`를 호출할 수 있습니다. extension이 기본 구현을 주고 있으니까요.

이게 프로토콜 extension으로 잡은 템플릿 메서드의 힘입니다. 새 화면이 생기면 `endpoint`랑 `parse`만 채운 struct 하나 더 만들면 끝이에요.

저는 이 방식으로 바꾸고 나서 화면 추가 코드가 절반 이하로 줄었습니다. 로딩·에러 처리 로직이 한 곳에 모이니 버그 잡기도 훨씬 수월했고요.

<figure>
  <img src="/assets/images/posts/1ea35405-8e4c-456a-8c11-0c61487bea78/3.png" alt="struct 하나 더 만드는 걸로 화면이 추가되니 코드가 확 줄었어요" loading="lazy">
  <figcaption>struct 하나 더 만드는 걸로 화면이 추가되니 코드가 확 줄었어요</figcaption>
</figure>

한 가지 주의할 점. 프로토콜 extension의 기본 구현은 override와 동작이 조금 다릅니다. 채택 타입이 같은 이름의 메서드를 정의해도, 프로토콜 요구사항으로 선언돼 있지 않으면 정적 디스패치로 엉뚱하게 불릴 수 있어요.

그래서 갈아끼울 단계는 반드시 프로토콜 본문에 요구사항으로 선언해 두는 게 안전합니다.

---

## 짧게 정리하는 Q&A

**Q. 그럼 상속 기반 템플릿 메서드는 이제 안 써도 되나요?**

UIKit처럼 클래스 계층이 이미 깔린 곳에선 상속 override가 자연스러울 때도 있어요. 상황 봐서 고르시면 됩니다.

**Q. associatedtype이 부담스러운데요?**

반환 타입이 고정이라면 associatedtype 없이 그냥 프로토콜로 잡아도 됩니다. 제네릭이 필요한 경우에만 쓰세요.

---

프로토콜 extension으로 뼈대를 잡아보면, 상속으로 씨름하던 게 조금 허무할 정도로 정리됩니다.

지금 복붙하고 있는 그 로직이 있다면, 오늘 딱 하나만 프로토콜로 빼보세요. 감이 확 올 거예요. 응원합니다!

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 프록시 패턴(Proxy Pattern), lazy 뒤에 숨은 대리인 객체](/Swift-%ED%94%84%EB%A1%9D%EC%8B%9C-%ED%8C%A8%ED%84%B4-%EC%99%84%EC%A0%84%EC%A0%95%EB%B3%B5-lazy-%EB%92%A4%EC%97%90-%EC%88%A8%EC%9D%80-%EB%8C%80%EB%A6%AC%EC%9D%B8-%EA%B0%9D%EC%B2%B4-%EC%98%88%EC%A0%9C-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
- [Swift 메멘토 패턴(Memento Pattern) 완벽 정리 (실행취소 구현 예제)](/Swift-%EB%A9%94%EB%A9%98%ED%86%A0-%ED%8C%A8%ED%84%B4Memento-Pattern-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-%EC%8B%A4%ED%96%89%EC%B7%A8%EC%86%8C-%EA%B5%AC%ED%98%84-%EC%98%88%EC%A0%9C/)
- [Swift 비지터 패턴(Visitor Pattern), 더블 디스패치가 필요한 순간](/Swift-%EB%B9%84%EC%A7%80%ED%84%B0-%ED%8C%A8%ED%84%B4Visitor-Pattern-%EB%8D%94%EB%B8%94-%EB%94%94%EC%8A%A4%ED%8C%A8%EC%B9%98%EA%B0%80-%ED%95%84%EC%9A%94%ED%95%9C-%EC%88%9C%EA%B0%84/)
<!-- /RELATED-POSTS -->
