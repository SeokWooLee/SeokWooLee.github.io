---
title: "DI 컨테이너 언제 도입할까? Swinject·Factory 도입 시점 총정리"
description: "iOS 개발을 하다 보면 어느 순간 이런 질문이 옵니다."
header:
  og_image: /assets/images/posts/971149c8-2775-432c-a2bb-2bb93d8579b4/1.jpg
tags:
  - DI컨테이너
  - Swinject
  - Factory
  - 의존성주입
permalink: /DI-컨테이너-언제-도입할까-SwinjectFactory-도입-시점-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-08-01
---

iOS 개발을 하다 보면 어느 순간 이런 질문이 옵니다.

"이거 그냥 생성자로 넘기면 되는데, 굳이 DI 컨테이너까지 써야 하나?"

사이드 프로젝트가 커지다 보면 누구나 한 번은 만나는 고민이에요. 저는 Swinject와 Factory를 둘 다 실제 프로젝트에 붙여보며 기준을 세웠습니다.

결론부터 말씀드릴게요.

> 화면이 20개 아래라면 DI 컨테이너 없이 생성자 주입만으로 충분합니다.
>
> 의존성 그래프가 복잡해지고 테스트 목(mock) 교체가 잦아질 때, 그때가 도입 타이밍입니다.
>
> 그리고 도입한다면, 선택은 Factory입니다.

언제 도입할지, 왜 Factory인지를 제가 겪은 순서대로 풀어보겠습니다.

<figure>
  <img src="/assets/images/posts/971149c8-2775-432c-a2bb-2bb93d8579b4/1.jpg" alt="DI 컨테이너 도입 전에 Swinject·Factory부터 비교해봤어요" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>DI 컨테이너 도입 전에 Swinject·Factory부터 비교해봤어요</figcaption>
</figure>

## DI 컨테이너, 도입 전에 이것부터 확인하세요

헷갈리기 쉬운 부분부터 정리할게요.

의존성 주입(DI)과 DI 컨테이너는 다릅니다.

의존성 주입은 필요한 객체를 밖에서 넣어주는 설계 습관이에요. 라이브러리가 전혀 필요 없습니다.

```swift
// 이것도 이미 훌륭한 의존성 주입입니다
final class LoginViewModel {
    private let authService: AuthService
    init(authService: AuthService) {
        self.authService = authService
    }
}
```

반면 DI 컨테이너는 이 객체들을 어디서 어떻게 만들지 한곳에서 관리해주는 도구입니다.

생성자 주입만으로 충분하다면 아직 컨테이너는 이릅니다.

도입 신호는 이렇게 잡았습니다.

1. 초기화 코드가 화면마다 반복되고, 객체를 넘기는 손이 아프기 시작할 때
2. 테스트에서 가짜 객체로 갈아끼우는 일이 잦아질 때
3. 앱 전역에서 같은 인스턴스(싱글턴 성격)를 여러 곳이 공유해야 할 때
4. 팀이 커져서 "이 객체 어디서 만들어지지?"를 자주 묻게 될 때

이 중 두 개 이상 걸린다면 그때부터 컨테이너 도입을 고민합니다.

---

## Swinject와 Factory, 뭐가 다를까요?

Swinject는 2015년부터 쓰여온 스위프트 진영의 전통적인 런타임 컨테이너입니다. `Container`에 등록하고 `resolve`로 꺼내 쓰는 방식이죠. 문제는 이 `resolve`가 옵셔널을 돌려준다는 점이에요. 등록을 빠뜨리면 컴파일은 멀쩡히 통과하고, 앱을 실행해 그 화면에서 nil을 강제 언래핑하는 순간에야 크래시로 터집니다.

Factory는 바로 이런 전통적인 컨테이너들의 단점을 보완하려고 나온 프로젝트입니다. Resolver를 만들었던 Michael Long이 그 경험을 바탕으로 다시 설계했어요. 핵심 아이디어는 "정의가 곧 등록"이라는 겁니다. 컨테이너의 프로퍼티로 팩토리를 정의하니, 등록을 빠뜨린다는 개념 자체가 없어요. 잘못 참조하면 런타임이 아니라 컴파일 타임에 에러가 납니다.

2026년 기준으로 제가 느낀 차이를 표로 정리했어요.

| 항목 | Swinject | Factory |
|------|----------|---------|
| 등록·해석 방식 | 런타임 resolve(옵셔널 반환) | 타입 기반 정의 + 프로퍼티 래퍼 |
| 등록 누락 시 | 런타임 nil/크래시 | 컴파일 에러로 사전 차단 |
| 스코프 관리 | 지원 | 지원(`.singleton`·`.cached`·`.shared` 등) |
| 외부 의존성 | 별도 프레임워크 의존 | 경량 단일 패키지 |
| 학습 곡선 | 다소 가파름 | 완만한 편 |

한때는 "복잡한 스코프 관리가 필요하면 Swinject"라는 조언도 있었지만, 지금은 아닙니다. Factory도 싱글턴·캐시·공유 스코프를 전부 지원하거든요. Swinject가 하던 일을 Factory가 더 안전하게 해냅니다.

<figure>
  <img src="/assets/images/posts/971149c8-2775-432c-a2bb-2bb93d8579b4/2.jpg" alt="직접 붙여보니 Factory는 파일 하나로도 시작되더라고요" width="1024" height="1024" loading="lazy" decoding="async">
  <figcaption>직접 붙여보니 Factory는 파일 하나로도 시작되더라고요</figcaption>
</figure>

---

## 그래서 결론은 Factory입니다

실제로 판단했던 기준은 이랬습니다.

**새로 도입한다면 Factory 하나면 됩니다**

혼자 하는 프로젝트든 팀 프로젝트든, Factory는 외부 의존성 없이 패키지 하나로 시작할 수 있어서 부담이 적었습니다. 무엇보다 등록을 깜빡해서 런타임에 터지는 사고 유형이 구조적으로 사라진다는 게 결정적이었어요.

```swift
// Factory: 정의가 곧 등록입니다
extension Container {
    var authService: Factory<AuthService> {
        self { LiveAuthService() }.singleton  // 스코프도 한 줄로
    }
}
// 사용하는 쪽
@Injected(\.authService) private var authService
```

테스트에서 목으로 갈아끼우는 것도 한 줄입니다.

```swift
Container.shared.authService.register { MockAuthService() }
```

**Swinject는 언제 남겨두나요?**

이미 Swinject로 지어진 큰 코드베이스를 유지보수하는 경우입니다. 잘 돌아가는 조립(assembly) 구조를 당장 걷어낼 이유는 없어요. 다만 그런 프로젝트에서도 새 모듈부터 Factory로 점진 전환하는 팀이 늘었습니다. 신규 도입 시점에 Swinject를 고를 이유는 이제 찾기 어렵습니다.

---

## 자주 묻는 질문 (Q&A)

**Q. 처음부터 컨테이너를 깔고 시작하면 안 되나요?**

말리진 않지만 추천하진 않아요. 의존성 그래프가 단순할 때 컨테이너는 오히려 코드를 한 겹 더 감춰서 추적을 더 어렵게 합니다.

**Q. Swinject에서 Factory로 갈아탈 수 있나요?**

가능합니다. 두 컨테이너를 잠시 공존시키면서 모듈 단위로 옮기는 점진 마이그레이션이 현실적이에요. 등록 지점과 스코프 설정을 다시 손봐야 하니 규모가 크면 시간은 걸리지만, 옮기고 나면 런타임 크래시 걱정이 사라집니다.

**Q. SwiftUI 프로젝트엔 뭐가 나을까요?**

단연 Factory입니다. 프로퍼티 래퍼 기반이라 SwiftUI의 선언형 스타일과 자연스럽게 어울리고, 프리뷰에서 목을 끼우는 것도 간단합니다.

---

DI 컨테이너는 필요해지는 순간에 도입하는 게 가장 깔끔합니다.

도입하기로 했다면 고민할 것 없이 Factory로 가세요. 기존 컨테이너들의 단점을 보완하려고 태어난 도구라, 작게 시작하기에도 크게 키우기에도 부족함이 없습니다. 앞서 적은 도입 신호 네 가지가 지금 몇 개나 걸리는지부터 세어보시면 됩니다.
