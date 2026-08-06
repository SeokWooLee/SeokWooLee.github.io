---
title: "Swift 미들웨어 패턴(Middleware Pattern), 데코레이터와 책임 연쇄 실전 조합"
description: "네트워크 레이어를 만들다 보면 꼭 이런 순간이 옵니다."
header:
  og_image: /assets/images/posts/7e172bb9-e535-45cc-a152-772a16eff333/1.jpg
tags:
  - Swift
  - 디자인패턴
  - 데코레이터패턴
  - 책임연쇄패턴
permalink: /Swift-미들웨어-패턴Middleware-Pattern-데코레이터와-책임-연쇄-실전-조합/
toc: true
toc_sticky: true
last_modified_at: 2026-07-28
---

네트워크 레이어를 만들다 보면 꼭 이런 순간이 옵니다.

요청 하나 보내는데 인증 토큰도 붙여야 하고, 로그도 남겨야 하고, 실패하면 재시도까지 해야 하죠.

그걸 전부 한 함수 안에 우겨넣다 보면 어느새 `send()` 하나가 200줄이 됩니다.

이럴 때 꺼낼 도구가 미들웨어 패턴입니다.

결론부터 말씀드릴게요. Swift에서 미들웨어는 **데코레이터 패턴으로 각 기능을 감싸고, 책임 연쇄(Chain of Responsibility)로 그 감싼 것들을 순서대로 연결**하면 가장 깔끔합니다. 둘은 경쟁 관계가 아니라 짝꿍이에요.

오늘은 이 조합을 왜 쓰는지, 코드로 어떻게 엮는지 실전 예제로 풀어보겠습니다.

<figure>
  <img src="/assets/images/posts/7e172bb9-e535-45cc-a152-772a16eff333/1.jpg" alt="Swift 미들웨어에서 데코레이터와 책임 연쇄, 역할이 이렇게 다릅니다" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>Swift 미들웨어에서 데코레이터와 책임 연쇄, 역할이 이렇게 다릅니다</figcaption>
</figure>

---

## 미들웨어 패턴이 뭔가요?

미들웨어는 요청과 응답 사이에 끼어드는 중간 처리 계층입니다.

Alamofire의 `RequestInterceptor`나 서버 쪽 Vapor의 `Middleware`를 써보셨다면 이미 만나본 개념이에요.

핵심 아이디어는 하나입니다.

> 요청을 처리하는 본체는 그대로 두고, 그 앞뒤로 기능을 끼웠다 뺐다 할 수 있게 만든다.

인증, 로깅, 캐싱, 재시도 같은 기능을 각각 독립된 조각으로 만들어 두는 거죠.

그러면 이번 요청엔 인증만, 저번 요청엔 인증+캐싱 이런 식으로 자유롭게 조합할 수 있습니다.

---

## 데코레이터와 책임 연쇄, 뭐가 다른가요?

이 둘을 헷갈려 하시는 분이 많은데요.

짧게 정리하면 이렇습니다.

| 구분 | 데코레이터 | 책임 연쇄 |
|---|---|---|
| 목적 | 기존 객체에 기능을 덧씌움 | 여러 처리기를 줄 세워 순서대로 통과 |
| 관계 | 감싸는 구조(중첩) | 이어지는 구조(체인) |
| 통과 여부 | 항상 다음으로 넘김 | 중간에 멈출 수도 있음 |
| 미들웨어에서 역할 | 기능 하나하나의 구현 | 그 기능들을 연결·정렬 |

제가 직접 써보니 이 둘은 대립이 아니라 층위가 다른 이야기더라고요.

데코레이터는 "기능을 어떻게 붙이냐"이고, 책임 연쇄는 "붙인 것들을 어떤 순서로 태우냐"입니다.

그래서 둘을 같이 쓰면 서로의 약점을 메워줍니다.

---

## 실전 조합: 코드로 엮어보기

먼저 미들웨어의 공통 인터페이스를 정의합니다. 요청을 받아 다음 미들웨어로 넘기는 구조예요.

```swift
protocol Middleware {
    // request를 받아 처리 후, next로 다음 단계에 넘긴다
    func handle(_ request: Request,
                next: (Request) async throws -> Response)
    async throws -> Response
}
```

이제 각 기능을 데코레이터처럼 하나씩 만듭니다. 아래는 로깅 미들웨어예요.

```swift
struct LoggingMiddleware: Middleware {
    func handle(_ request: Request,
                next: (Request) async throws -> Response)
    async throws -> Response {
        print("➡️ 요청: \(request.url)")
        let response = try await next(request)  // 다음 단계로
        print("⬅️ 응답: \(response.status)")
        return response
    }
}
```

여기서 `next(request)`를 호출하는 부분이 바로 책임 연쇄의 고리입니다.

자기 할 일(로그 찍기)을 하고 나머지는 다음 미들웨어에 넘기는 거죠.

마지막으로 여러 미들웨어를 하나의 체인으로 접어줍니다.

```swift
func buildChain(_ middlewares: [Middleware],
                final: @escaping (Request) async throws -> Response)
-> (Request) async throws -> Response {
    middlewares.reversed().reduce(final) { next, mw in
        { req in try await mw.handle(req, next: next) }
    }
}
```

`reduce`로 뒤에서부터 감싸 나가는 게 포인트입니다.

배열을 `[인증, 로깅, 재시도]` 순으로 넣으면 요청은 그 순서대로 통과하고 응답은 역순으로 빠져나옵니다. 양파 껍질을 떠올리시면 딱 맞아요.

<figure>
  <img src="/assets/images/posts/7e172bb9-e535-45cc-a152-772a16eff333/4-1783847517249.png" alt="요청은 안으로, 응답은 거꾸로 밖으로 빠져나가는 모양" width="1200" height="594" loading="lazy" decoding="async">
  <figcaption>요청은 안으로, 응답은 거꾸로 밖으로 빠져나가는 모양</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/7e172bb9-e535-45cc-a152-772a16eff333/2.jpg" alt="코드 붙이기 전에 종이에 껍질 구조부터 그려봤어요" width="1024" height="1024" loading="lazy" decoding="async">
  <figcaption>코드 붙이기 전에 종이에 껍질 구조부터 그려봤어요</figcaption>
</figure>

---

## 이렇게 짜면 뭐가 좋을까요?

제가 실제 프로젝트에 적용하고 느낀 장점을 정리해봤습니다.

1. **기능 추가가 배열에 한 줄 넣는 일이 됩니다.** 캐싱이 필요하면 `CachingMiddleware()`만 배열에 끼우면 끝이에요.

2. **순서를 바꾸기 쉽습니다.** 인증을 로깅보다 먼저 태울지 나중에 태울지, 배열 순서만 바꾸면 됩니다.

3. **테스트가 편합니다.** 각 미들웨어가 독립적이라 하나씩 단위 테스트를 붙일 수 있어요.

4. **본체가 깨끗해집니다.** 200줄짜리 `send()`가 다시 열 줄 안쪽으로 돌아옵니다.

반대로 주의할 점도 있어요.

미들웨어가 너무 많아지면 요청 하나가 어디를 거치는지 추적이 어려워집니다.

그래서 저는 체인이 대여섯 개를 넘어가면 로깅 미들웨어를 맨 앞에 두고 통과 경로를 찍어보는 편입니다.

---

## 마무리

데코레이터로 기능을 만들고 책임 연쇄로 줄 세우는 이 조합은, 한 번 손에 익으면 네트워크 레이어뿐 아니라 이벤트 처리, 유효성 검사 같은 곳에도 그대로 써먹을 수 있습니다.

오늘 예제를 작은 토이 프로젝트에 붙여보시길 권합니다. 직접 껍질을 벗겨보면 개념이 훨씬 빨리 몸에 붙거든요. 즐거운 리팩터링 되세요!

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 템플릿 메서드 패턴(Template Method), 프로토콜 extension으로 뼈대 잡기](/Swift-%ED%85%9C%ED%94%8C%EB%A6%BF-%EB%A9%94%EC%84%9C%EB%93%9C-%ED%8C%A8%ED%84%B4Template-Method-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C-extension%EC%9C%BC%EB%A1%9C-%EB%BC%88%EB%8C%80-%EC%9E%A1%EA%B8%B0/)
- [Swift 오브젝트 풀 패턴(Object Pool Pattern) 완전정리 (플라이웨이트와 차이·재사용법)](/Swift-%EC%98%A4%EB%B8%8C%EC%A0%9D%ED%8A%B8-%ED%92%80-%ED%8C%A8%ED%84%B4Object-Pool-Pattern-%EC%99%84%EC%A0%84%EC%A0%95%EB%A6%AC-%ED%94%8C%EB%9D%BC%EC%9D%B4%EC%9B%A8%EC%9D%B4%ED%8A%B8%EC%99%80-%EC%B0%A8%EC%9D%B4%EC%9E%AC%EC%82%AC%EC%9A%A9%EB%B2%95/)
- [어댑터 vs 퍼사드 vs 프록시 vs 데코레이터(Adapter·Facade·Proxy·Decorator), 래핑 패턴 4형제 완벽 구분법](/%EC%96%B4%EB%8C%91%ED%84%B0-vs-%ED%8D%BC%EC%82%AC%EB%93%9C-vs-%ED%94%84%EB%A1%9D%EC%8B%9C-vs-%EB%8D%B0%EC%BD%94%EB%A0%88%EC%9D%B4%ED%84%B0AdapterFacadeProxyDecorator-%EB%9E%98%ED%95%91-%ED%8C%A8%ED%84%B4-4%ED%98%95%EC%A0%9C-%EC%99%84%EB%B2%BD-%EA%B5%AC%EB%B6%84%EB%B2%95/)
<!-- /RELATED-POSTS -->
