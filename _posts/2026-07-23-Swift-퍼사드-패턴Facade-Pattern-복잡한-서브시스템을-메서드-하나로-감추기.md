---
title: "Swift 퍼사드 패턴(Facade Pattern), 복잡한 서브시스템을 메서드 하나로 감추기"
description: "얼마 전에 회원가입 로직을 다시 들여다보다가 한숨이 나왔습니다."
header:
  og_image: /assets/images/posts/340a5196-1574-405a-a31e-39b21d025303/1.png
tags:
  - Swift
  - 퍼사드패턴
  - 디자인패턴
  - iOS개발
permalink: /Swift-퍼사드-패턴Facade-Pattern-복잡한-서브시스템을-메서드-하나로-감추기/
toc: true
toc_sticky: true
last_modified_at: 2026-07-23
---

얼마 전에 회원가입 로직을 다시 들여다보다가 한숨이 나왔습니다.

버튼 하나 눌렀을 뿐인데 뷰컨트롤러 안에서 유효성 검사, 네트워크 요청, 토큰 저장, 알림 등록까지 예닐곱 개 객체를 직접 부르고 있더라고요.

이걸 다른 화면에서 또 써야 하는데, 그 순서와 조합을 통째로 복사하고 싶진 않았어요.

이럴 때 쓰는 게 바로 Swift 퍼사드 패턴입니다.

결론부터 말씀드리면, 퍼사드 패턴은 여러 객체가 얽힌 복잡한 서브시스템을 `signUp()` 같은 메서드 하나로 감싸는 구조입니다. 쓰는 쪽은 그 안이 어떻게 돌아가는지 몰라도 되고요.

오늘은 Swift 코드로 이 패턴을 어떻게 적용하는지, 또 언제 쓰면 좋고 언제는 오히려 독이 되는지까지 제 경험을 섞어 풀어보려고 합니다.

<figure>
  <img src="/assets/images/posts/340a5196-1574-405a-a31e-39b21d025303/1.png" alt="Swift 퍼사드 패턴, 문 하나 뒤에 복잡함을 다 숨겨둔 그림입니다">
  <figcaption>Swift 퍼사드 패턴, 문 하나 뒤에 복잡함을 다 숨겨둔 그림입니다</figcaption>
</figure>

## 퍼사드 패턴이 뭔가요?

퍼사드(Facade)는 원래 건물의 '정면 외관'을 뜻하는 단어예요.

밖에서 보면 깔끔한 건물 정면만 보이지만, 그 안에는 배관이며 전선이며 복잡한 설비가 가득하잖아요.

소프트웨어에서도 똑같습니다.

내부에 여러 클래스가 서로 호출하며 돌아가는 서브시스템이 있을 때, 그 앞에 창구 하나를 세워두는 거예요.

호출하는 쪽은 그 창구에만 말을 걸면 됩니다.

핵심은 '단순화된 진입점'입니다.

> 퍼사드는 복잡함을 없애는 게 아니라, 복잡함을 한 곳에 가둬두고 바깥에는 쉬운 문 하나만 열어주는 패턴입니다.

내부 구현을 없애는 게 아니라 감춘다는 점이 중요해요.

배관은 그대로 있고, 그저 벽 뒤로 숨겼을 뿐입니다.

---

## Swift로 직접 짜보면 이렇습니다

말로만 하면 감이 안 오니 코드로 보겠습니다.

회원가입 과정에 유효성 검사, 서버 등록, 토큰 저장이라는 세 서브시스템이 있다고 해볼게요.

먼저 감추고 싶은 내부 객체들입니다.

```swift
struct Validator { func check(_ email: String) -> Bool { email.contains("@") } }
struct AuthAPI { func register(_ email: String) -> String { "token_\(email)" } }
struct TokenStore { func save(_ token: String) { /* 키체인 저장 */ } }
```

이 셋을 뷰컨트롤러가 직접 다 부르면 코드가 지저분해집니다.

그래서 퍼사드가 이들을 대신 조율해요.

```swift
struct SignUpFacade {
    private let validator = Validator()
    private let api = AuthAPI()
    private let store = TokenStore()

    func signUp(email: String) -> Bool {
        guard validator.check(email) else { return false }
        let token = api.register(email)   // 내부 순서를 여기서만 관리
        store.save(token)
        return true
    }
}
```

이제 쓰는 쪽은 딱 한 줄이면 끝납니다.

`SignUpFacade().signUp(email: "me@test.com")` 이렇게요.

호출하는 쪽은 유효성 검사를 먼저 하고 토큰을 저장한다는 순서를 전혀 몰라도 됩니다.

<figure>
  <img src="/assets/images/posts/340a5196-1574-405a-a31e-39b21d025303/4-1783847771586.png" alt="퍼사드 하나가 세 서브시스템을 대신 조율하는 그림" loading="lazy">
  <figcaption>퍼사드 하나가 세 서브시스템을 대신 조율하는 그림</figcaption>
</figure>

나중에 그 순서가 바뀌거나 단계가 하나 늘어도 퍼사드 안쪽만 고치면 되고요.

---

## 언제 쓰면 좋고, 언제는 피해야 할까?

제가 직접 써보고 느낀 기준을 정리해봤습니다.

**퍼사드가 어울리는 상황**
- 여러 객체를 정해진 순서로 매번 똑같이 호출하는 코드가 여기저기 반복될 때
- 외부 라이브러리나 복잡한 SDK를 감싸서 우리 앱에 맞는 쉬운 이름으로 바꾸고 싶을 때
- 뷰컨트롤러가 너무 많은 걸 알고 있어서 살을 빼주고 싶을 때

**오히려 피하는 게 나은 상황**
- 서브시스템이 원래 단순해서 감쌀 게 별로 없을 때 (괜히 층만 하나 늘어납니다)
- 세밀한 제어가 매번 필요해서, 결국 퍼사드를 뚫고 내부를 직접 불러야 할 때

여기서 한 가지 짚고 싶은 게 있어요.

퍼사드는 내부 접근을 '막는' 게 아닙니다.

쉬운 길을 하나 열어줄 뿐, 필요하면 내부 객체를 직접 써도 됩니다.

그래서 모든 접근을 통제하려는 다른 패턴과는 성격이 다릅니다.

---

## 자주 헷갈리는 질문 몇 가지

**Q. 퍼사드랑 그냥 유틸리티 함수랑 뭐가 다른가요?**

유틸 함수는 보통 독립적인 기능 하나를 담지만, 퍼사드는 여러 객체의 협력과 순서를 조율하는 데 목적이 있어요.

'무엇을 감추느냐'가 다릅니다.

**Q. 프로토콜로 만들어야 하나요?**

꼭 그럴 필요는 없습니다.

다만 테스트에서 퍼사드를 가짜 객체로 바꿔치기하고 싶다면, 프로토콜로 추상화해두면 훨씬 편해요.

**Q. 어댑터 패턴이랑 헷갈려요.**

어댑터는 맞지 않는 인터페이스를 끼워 맞추는 게 목적이고, 퍼사드는 복잡한 걸 단순하게 보여주는 게 목적입니다.

목적이 다르다고 기억하면 편합니다.

<figure>
  <img src="/assets/images/posts/340a5196-1574-405a-a31e-39b21d025303/2.png" alt="이 예제 코드, 저는 실제 프로젝트에서 이렇게 정리했어요" loading="lazy">
  <figcaption>이 예제 코드, 저는 실제 프로젝트에서 이렇게 정리했어요</figcaption>
</figure>

---

## 마무리하며

복잡한 호출 뭉치를 볼 때마다 '이걸 메서드 하나로 감쌀 수 있을까?' 하고 한 번 자문해보세요.

그 질문 하나만으로도 코드가 한결 읽기 좋아지는 순간이 자주 옵니다.

퍼사드는 화려한 패턴은 아니지만, 실무에서 가장 자주 손이 가는 든든한 도구예요.

오늘 회원가입 예제부터 가볍게 흉내 내보시길 응원합니다.

<figure>
  <img src="/assets/images/posts/340a5196-1574-405a-a31e-39b21d025303/3.png" alt="깔끔한 문 하나만 열어주면 되는 거, 딱 이 느낌입니다" loading="lazy">
  <figcaption>깔끔한 문 하나만 열어주면 되는 거, 딱 이 느낌입니다</figcaption>
</figure>

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 프록시 패턴(Proxy Pattern), lazy 뒤에 숨은 대리인 객체](/Swift-%ED%94%84%EB%A1%9D%EC%8B%9C-%ED%8C%A8%ED%84%B4-%EC%99%84%EC%A0%84%EC%A0%95%EB%B3%B5-lazy-%EB%92%A4%EC%97%90-%EC%88%A8%EC%9D%80-%EB%8C%80%EB%A6%AC%EC%9D%B8-%EA%B0%9D%EC%B2%B4-%EC%98%88%EC%A0%9C-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
- [Swift 컴포지트 패턴(Composite Pattern), 트리 구조를 객체 하나처럼 다루기](/Swift-%EC%BB%B4%ED%8F%AC%EC%A7%80%ED%8A%B8-%ED%8C%A8%ED%84%B4-%ED%8A%B8%EB%A6%AC-%EA%B5%AC%EC%A1%B0%EB%A5%BC-%EA%B0%9D%EC%B2%B4-%ED%95%98%EB%82%98%EC%B2%98%EB%9F%BC-%EB%8B%A4%EB%A3%A8%EA%B8%B0-%EC%98%88%EC%A0%9C%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/)
- [Swift 템플릿 메서드 패턴(Template Method), 프로토콜 extension으로 뼈대 잡기](/Swift-%ED%85%9C%ED%94%8C%EB%A6%BF-%EB%A9%94%EC%84%9C%EB%93%9C-%ED%8C%A8%ED%84%B4Template-Method-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C-extension%EC%9C%BC%EB%A1%9C-%EB%BC%88%EB%8C%80-%EC%9E%A1%EA%B8%B0/)
<!-- /RELATED-POSTS -->
