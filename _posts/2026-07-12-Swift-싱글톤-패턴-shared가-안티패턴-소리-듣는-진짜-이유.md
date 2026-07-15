---
title: "Swift 싱글톤 패턴, shared가 안티패턴 소리 듣는 진짜 이유"
description: "Swift 개발을 하다 보면 static let shared 한 줄로 만드는 싱글톤을 정말 자주 만나게 됩니다."
header:
  og_image: /assets/images/posts/b71a69ec-a38f-40af-8715-df457527f22f/1.png
tags:
  - Swift
  - 싱글톤패턴
  - iOS개발
  - 디자인패턴
  - 의존성주입
  - 안티패턴
  - shared
  - 코틀린iOS
  - 앱개발
  - Swift개발자
permalink: /Swift-싱글톤-패턴-shared가-안티패턴-소리-듣는-진짜-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 **한국어** · [English](/en/Swift-%EC%8B%B1%EA%B8%80%ED%86%A4-%ED%8C%A8%ED%84%B4-shared%EA%B0%80-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4-%EC%86%8C%EB%A6%AC-%EB%93%A3%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · [日本語](/ja/Swift-%EC%8B%B1%EA%B8%80%ED%86%A4-%ED%8C%A8%ED%84%B4-shared%EA%B0%80-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4-%EC%86%8C%EB%A6%AC-%EB%93%A3%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · [中文](/zh/Swift-%EC%8B%B1%EA%B8%80%ED%86%A4-%ED%8C%A8%ED%84%B4-shared%EA%B0%80-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4-%EC%86%8C%EB%A6%AC-%EB%93%A3%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/)
{: .notice--info}

Swift 개발을 하다 보면 `static let shared` 한 줄로 만드는 싱글톤을 정말 자주 만나게 됩니다.

처음 iOS 앱을 만들 때는 네트워크 매니저, 유저 세션, 캐시 관리까지 전부 싱글톤으로 도배하기 쉽습니다.

편하거든요. 어디서든 `Manager.shared`만 부르면 되니까요.

그런데 프로젝트가 커지면 이상한 일이 생기기 시작합니다. 테스트가 안 돼요. 화면 하나 고쳤을 뿐인데 엉뚱한 데서 버그가 터지고요.

싱글톤이 안티패턴 소리를 듣는 데는 다 이유가 있습니다.

이 글에서는 Swift 싱글톤 패턴이 정확히 무엇인지, 왜 남용하면 안티패턴 취급을 받는지, 그럼에도 언제는 써도 되는지를 실무 관점으로 정리해볼게요.

결론부터 말씀드리면, 싱글톤 자체가 나쁜 게 아니라 "전역에서 아무 데서나 상태를 바꿀 수 있게 열어두는 방식"이 문제입니다. 그래서 shared를 무분별하게 남용하면 테스트가 막히고 의존성이 숨고 동시성 문제까지 생기는 겁니다.

<figure>
  <img src="/assets/images/posts/b71a69ec-a38f-40af-8715-df457527f22f/1.png" alt="Swift 싱글톤 패턴, shared 하나로 편해지지만 그만큼 함정도 큽니다">
  <figcaption>Swift 싱글톤 패턴, shared 하나로 편해지지만 그만큼 함정도 큽니다</figcaption>
</figure>

## Swift 싱글톤 패턴, 대체 뭔가요?

싱글톤은 "앱 전체에서 인스턴스가 딱 하나만 존재하도록 보장하는" 디자인 패턴입니다.

Swift에서는 정말 짧게 만들 수 있어요. 이게 매력이자 함정이죠.

```swift
final class NetworkManager {
    static let shared = NetworkManager()  // 앱에 단 하나
    private init() {}                     // 외부 생성 차단
    func request(_ url: URL) { /* ... */ }
}
```

`static let`은 Swift가 스레드 안전하게 딱 한 번만 초기화해줍니다. 그래서 별도 lock 없이도 인스턴스 생성 자체는 안전해요.

`private init()`으로 외부에서 새로 만드는 걸 막는 것도 핵심입니다. 이게 빠지면 그냥 전역 객체지 싱글톤이 아니거든요.

여기까지만 보면 참 깔끔합니다. 문제는 이걸 어디서든 부를 수 있다는 점에서 시작돼요.

---

## shared 인스턴스가 왜 안티패턴 소리를 들을까?

가장 자주 지적되는 이유 세 가지를 경험한 순서대로 풀어볼게요.

첫째, 테스트가 지옥이 됩니다.

`NetworkManager.shared`를 코드 안에서 직접 부르면, 테스트할 때 이걸 가짜(mock) 객체로 바꿔치기할 방법이 없어요.

실제 서버에 요청이 나가버리거나 테스트끼리 상태를 공유해서, 순서만 바뀌어도 결과가 달라집니다.

둘째, 의존성이 숨어버립니다.

어떤 함수가 내부에서 몰래 `UserSession.shared`를 쓰고 있으면, 함수 시그니처만 봐서는 이 함수가 뭘 필요로 하는지 알 수가 없어요.

협업할 때 이게 정말 무섭습니다. 코드를 다 열어봐야 의존 관계가 보이니까요.

셋째, 전역 가변 상태의 동시성 문제입니다.

싱글톤이 내부에 프로퍼티를 들고 있고 여러 스레드가 동시에 그걸 읽고 쓰면 데이터 레이스가 납니다.

인스턴스 생성은 안전해도 그 안의 상태 변경까지 안전한 건 아니에요. 이 둘을 헷갈리면 크래시를 만나게 됩니다.

<figure>
  <img src="/assets/images/posts/b71a69ec-a38f-40af-8715-df457527f22f/2.png" alt="shared 도배하던 시절 제 코드, 지금 보면 아찔합니다">
  <figcaption>shared 도배하던 시절 제 코드, 지금 보면 아찔합니다</figcaption>
</figure>

정리하면 이렇습니다.

> 싱글톤이 욕먹는 진짜 이유는 "하나만 존재해서"가 아니라, "어디서든 꺼내 쓰고 어디서든 바꿀 수 있어서"입니다.

---

## 그럼 싱글톤은 무조건 쓰면 안 되나요?

아니요. 저는 지금도 특정 상황에서는 씁니다.

애초에 하나만 존재하는 게 자연스러운 대상이 있어요. 예를 들면 `UserDefaults.standard`, `FileManager.default`, `URLSession.shared` 처럼 애플도 표준 라이브러리에서 싱글톤을 씁니다.

기준은 이렇게 잡으면 편해요.

- 상태를 거의 안 바꾸고 읽기 위주다 → 싱글톤 괜찮음
- 앱 전체에서 진짜 하나여야만 한다 → 싱글톤 고려
- 테스트에서 다르게 동작시켜야 한다 → 의존성 주입 권장

핵심은 "shared를 코드 안에서 직접 부르지 말고, 밖에서 주입받자"는 겁니다.

<figure>
  <img src="/assets/images/posts/b71a69ec-a38f-40af-8715-df457527f22f/3-1783847709763.png" alt="shared는 기본값으로, 테스트엔 가짜를 주입하는 구조">
  <figcaption>shared는 기본값으로, 테스트엔 가짜를 주입하는 구조</figcaption>
</figure>

같은 싱글톤을 쓰더라도 이렇게 바꾸면 테스트 가능성이 확 올라갑니다.

```swift
protocol Networking { func request(_ url: URL) }
extension NetworkManager: Networking {}

final class FeedViewModel {
    private let network: Networking
    init(network: Networking = .shared) {  // 기본값은 싱글톤, 테스트는 mock 주입
        self.network = network
    }
}
```

평소엔 기본값으로 싱글톤을 쓰니 편하고, 테스트할 땐 가짜 객체를 넣을 수 있으니 유연합니다.

싱글톤을 버리는 게 아니라, 부르는 방식만 바꾼 거예요.

---

## 실전에서 제가 지키는 규칙 3가지

마지막으로 제가 현업에서 스스로 정한 기준을 공유할게요.

1. 가변 상태를 여러 곳에서 바꾸는 싱글톤은 만들지 않는다. 상태가 필요하면 소유자를 명확히 한다.
2. `shared`를 함수 안에서 직접 호출하지 않고, 생성자나 파라미터로 주입받는다.
3. 동시 접근이 있는 싱글톤은 actor로 만들거나 직렬 큐로 보호한다.

이 세 가지만 지켜도 "싱글톤 때문에 프로젝트가 썩는" 상황은 거의 안 옵니다.

싱글톤은 잘못된 도구가 아니라, 너무 쉬워서 남용되기 좋은 도구입니다.

편하다는 이유로 아무 데나 `shared`를 뿌리기 전에, "이거 나중에 테스트할 수 있나?" 한 번만 자문해보세요. 그 질문 하나가 6개월 뒤의 나를 구합니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 커스텀 에러 메시지 정의, LocalizedError 완벽 정리 (예제 포함)](/error-description/)
- [Swift 탄생 배경, 크리스 래트너는 왜 Objective-C를 버렸을까](/Swift-%ED%83%84%EC%83%9D-%EB%B0%B0%EA%B2%BD-%ED%81%AC%EB%A6%AC%EC%8A%A4-%EB%9E%98%ED%8A%B8%EB%84%88%EB%8A%94-%EC%99%9C-Objective-C%EB%A5%BC-%EB%B2%84%EB%A0%B8%EC%9D%84%EA%B9%8C/)
- [iOS MVC 패턴, Massive View Controller가 생기는 진짜 이유](/iOS-MVC-%ED%8C%A8%ED%84%B4-Massive-View-Controller%EA%B0%80-%EC%83%9D%EA%B8%B0%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/)
<!-- /RELATED-POSTS -->
