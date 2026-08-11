---
title: "Swift DI 라이브러리 Factory 정리, Swinject와 뭐가 다를까"
description: "Factory는 의존성 등록 누락을 컴파일 타임에 잡아내는 Swift DI 라이브러리입니다. 2026년 7월 기준 3.3.1로 기본 사용법과 스코프 선언, 테스트·프리뷰 주입, Swinject와의 차이를 정리했습니다."
header:
  og_image: /assets/images/posts/621e6ca4-c884-4399-9e80-ca6964ae2679/swift-di-factory-1.jpg
categories:
  - Swift
  - iOS
tags:
  - Swift
  - Factory
  - 의존성주입
  - DI
permalink: /Swift-DI-라이브러리-Factory-정리-Swinject와-뭐가-다를까/
toc: true
toc_sticky: true
last_modified_at: 2026-08-11
---

지난 편에서 SOLID(객체지향 5대 설계 원칙)의 마지막 글자, DIP(의존성 역전 원칙)를 정리했는데요. 원칙을 이해하고 나면 자연스럽게 다음 질문이 따라옵니다. "그래서 이 의존성들, 실제 앱에서는 누가 어떻게 조립하지?"

프로젝트가 작을 때는 이니셜라이저에 직접 넘겨주는 수동 DI(Dependency Injection, 의존성 주입)로 충분해요. 그런데 화면이 수십 개로 늘고 의존성 그래프가 깊어지면 조립 코드 자체가 부담이 되기 시작합니다. 오늘은 그 지점에서 꺼내 쓰기 좋은 Swift DI 라이브러리, Factory를 소개합니다. 2026년 7월 기준 최신 버전인 3.3.1을 기준으로 정리했어요.

<figure>
  <img src="/assets/images/posts/621e6ca4-c884-4399-9e80-ca6964ae2679/swift-di-factory-1.jpg" alt="FACTORY 글자가 새겨진 컨테이너에 플러그 모듈을 싣는 Swift DI 썸네일" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>DIP 이론편의 후속, 이번엔 조립 도구 차례입니다</figcaption>
</figure>

---

## 수동 DI, 어디까지 버틸 수 있을까

DIP를 지키는 코드는 대략 이런 모양이었죠.

```swift
protocol NetworkProviding {
    func fetch(_ url: URL) async throws -> Data
}

final class OrderViewModel {
    private let network: NetworkProviding

    init(network: NetworkProviding) {
        self.network = network
    }
}
```

프로토콜에 의존하고, 구현체는 밖에서 주입받습니다. 여기까지는 라이브러리가 필요 없어요. 문제는 조립하는 쪽입니다.

```swift
// 어딘가의 조립 지점(Composition Root)
let network = NetworkProvider()
let repository = OrderRepository(network: network)
let analytics = AnalyticsService(network: network)
let viewModel = OrderViewModel(repository: repository, analytics: analytics)
```

의존성이 3단, 4단으로 깊어지면 이런 초기화 코드가 화면마다 반복됩니다. 중간 계층에 의존성이 하나 추가되면 그걸 거쳐 가는 모든 초기화 코드를 수정해야 하고요. 싱글톤으로 도망가고 싶은 유혹이 커지는 순간인데, 싱글톤이 테스트를 어떻게 막는지는 이미 아실 거예요. DI 컨테이너는 바로 이 조립 문제를 대신 맡아주는 도구입니다.

## Factory가 다른 점: 컴파일 타임 안전

Swift DI 라이브러리 하면 오랫동안 Swinject가 표준처럼 쓰였는데요. Swinject는 문자열·타입 기반으로 등록하고 `resolve()`로 꺼내는 구조라, 등록을 빠뜨리면 컴파일은 통과하고 런타임에 nil이 터집니다. 앱을 실행해 봐야 실수를 알 수 있다는 뜻이에요.

Factory는 이 지점을 뒤집었습니다. 의존성을 Container의 계산 프로퍼티로 정의하기 때문에, 존재하지 않는 의존성을 참조하면 그냥 컴파일이 안 돼요. 오타도, 등록 누락도 빌드 단계에서 걸립니다.

여기에 실행 코드가 1,000줄이 안 되는 경량 라이브러리인 데다, 컴파일 타임 코드 생성 스크립트 없이 순수 Swift만으로 동작하는 것도 장점입니다. Needle처럼 빌드 파이프라인에 도구를 끼워 넣을 필요가 없어요.

## 기본 사용법 3분 정리

설치는 SPM(Swift Package Manager)으로 합니다. 패키지 주소는 `https://github.com/hmlongco/Factory`, 임포트는 3.x부터 `FactoryKit`입니다.

의존성 등록은 Container 확장에 계산 프로퍼티를 추가하는 방식이에요.

```swift
import FactoryKit

extension Container {
    var networkService: Factory<NetworkProviding> {
        self { NetworkProvider() }
    }
    var orderRepository: Factory<OrderRepositoryType> {
        self { OrderRepository(network: self.networkService()) }
    }
}
```

꺼내 쓸 때는 세 가지 방법이 있습니다.

```swift
// 1. 프로퍼티 래퍼 주입
final class OrderViewModel {
    @Injected(\.orderRepository) private var repository
}

// 2. 직접 호출
let repository = Container.shared.orderRepository()

// 3. 생성자 주입 — 조립만 컨테이너에 맡기기
extension Container {
    var orderViewModel: Factory<OrderViewModel> {
        self { OrderViewModel(repository: self.orderRepository()) }
    }
}
```

3번 방식이 눈여겨볼 만합니다. 클래스 자체는 라이브러리를 전혀 모르는 순수한 생성자 주입 형태를 유지하면서, 조립 코드만 컨테이너가 맡는 구조거든요. DIP 편에서 다룬 "구현체 조립은 바깥의 몫"이라는 원칙과 정확히 맞아떨어집니다.

SwiftUI에서는 `@InjectedObservable`로 Observable 뷰모델을 바로 받을 수 있어요.

```swift
struct OrderView: View {
    @InjectedObservable(\.orderViewModel) var viewModel
}
```

<figure>
  <img src="/assets/images/posts/621e6ca4-c884-4399-9e80-ca6964ae2679/swift-di-factory-2.jpg" alt="컨테이너가 컨베이어로 의존성 모듈을 앱 화면에 조립해 넣는 일러스트" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>등록부에 선언만 해두면 조립은 컨테이너 몫이에요</figcaption>
</figure>

## 스코프: 인스턴스 수명은 선언으로

DI 컨테이너를 쓰는 또 하나의 이유가 인스턴스 수명 관리인데요. Factory는 등록부에 수정자 하나만 붙이면 됩니다.

```swift
extension Container {
    var networkService: Factory<NetworkProviding> {
        self { NetworkProvider() }.singleton
    }
    var imageCache: Factory<ImageCaching> {
        self { ImageCache() }.cached
    }
}
```

- **unique** — 기본값. 요청할 때마다 새 인스턴스를 만듭니다.
- **singleton** — 앱 전체에서 하나를 공유합니다.
- **cached** — 캐시를 리셋하기 전까지 같은 인스턴스를 돌려줍니다.
- **shared** — 누군가 강한 참조로 들고 있는 동안만 유지되고, 아무도 안 쓰면 해제됩니다.

전역 싱글톤 객체를 직접 만들 때와 뭐가 다르냐 하면, 수명이 코드 곳곳에 흩어진 `static let`이 아니라 등록부 한 곳에 선언으로 모인다는 점입니다. 나중에 singleton을 cached로 바꾸고 싶으면 수정자 하나만 바꾸면 끝이에요.

## 테스트와 프리뷰에서 진가가 나온다

DI를 도입하는 가장 실용적인 이유는 결국 테스트입니다. Factory는 등록을 그 자리에서 덮어쓸 수 있어요.

```swift
import FactoryTesting

@Suite(.container)  // 테스트마다 컨테이너를 격리
struct OrderViewModelTests {
    @Test func loadsOrders() async {
        Container.shared.orderRepository { MockOrderRepository() }
        let viewModel = Container.shared.orderViewModel()
        await viewModel.load()
        #expect(viewModel.orders.count == 3)
    }
}
```

Swift Testing 기준으로 `FactoryTesting` 타깃의 `.container` 트레이트를 붙이면 테스트끼리 컨테이너 상태가 섞이지 않습니다. SwiftUI 프리뷰에서도 같은 방식으로 목을 꽂을 수 있고요.

```swift
#Preview {
    Container.shared.orderRepository { MockOrderRepository() }
    return OrderView()
}
```

특정 실행 환경에서만 자동으로 갈아 끼우는 컨텍스트 수정자도 있습니다. 디버그 빌드에서만 스텁 애널리틱스를 쓰고 싶다면 이렇게요.

```swift
container.analytics.onDebug { StubAnalyticsEngine() }
```

같은 요령으로 테스트, 프리뷰, 시뮬레이터 환경별 오버라이드를 등록부에 선언해 둘 수 있습니다.

<figure>
  <img src="/assets/images/posts/621e6ca4-c884-4399-9e80-ca6964ae2679/swift-di-factory-3.jpg" alt="기계 슬롯의 실제 모듈을 목 모듈로 교체하는 테스트 주입 일러스트" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>테스트에서는 진짜 구현 대신 목을 꽂습니다</figcaption>
</figure>

## Factory 3.x에서 달라진 점

2.x를 쓰다가 넘어오는 분들을 위해 주요 변경점을 정리했어요.

- **임포트 이름 변경** — `import Factory`가 `import FactoryKit`으로 바뀌었습니다. 마이그레이션의 대부분은 이 치환이에요.
- **Swift 6 Strict Concurrency 완전 지원** — `@MainActor` 뷰모델을 등록할 때 2.x에서는 클로저 안에 `@MainActor in`을 중복으로 써줘야 했는데, 3.x에서는 팩토리 선언부의 어노테이션만으로 처리됩니다.
- **SPM 전용** — CocoaPods 지원이 중단됐습니다. CocoaPods 프로젝트라면 Factory 2.5.3에 머물거나 소스를 직접 임베드해야 해요.
- **Swift Testing 대응** — 위에서 본 `.container` 트레이트를 포함해 테스트 격리 지원이 정식으로 들어왔습니다.

<figure>
  <img src="/assets/images/posts/621e6ca4-c884-4399-9e80-ca6964ae2679/swift-di-factory-4.png" alt="Container 등록부를 앱 코드·테스트·프리뷰가 공유하는 Factory 구조 다이어그램" width="1200" height="440" loading="lazy" decoding="async">
  <figcaption>등록부 한 곳을 앱 코드·테스트·프리뷰가 함께 씁니다</figcaption>
</figure>

## 정리하며

DIP가 "구체가 아니라 추상에 의존하라"는 방향을 알려준다면, Factory는 그 방향을 실제 코드베이스에서 유지하는 비용을 낮춰주는 도구입니다. 컴파일 타임 안전 덕분에 등록 누락이 빌드 에러로 잡히고, 스코프와 목 교체가 선언 몇 줄로 끝나니까요.

이미 Swinject로 잘 돌아가는 프로젝트를 갈아엎을 필요까지는 없지만, 새 프로젝트라면 Factory를 기본 선택지로 놓고 시작해도 좋다고 봅니다. 라이브러리가 가벼워서 도입 부담도 작고, 마음에 안 들면 생성자 주입 구조는 그대로 둔 채 컨테이너만 걷어낼 수도 있거든요.

수동 DI로 버티다가 조립 코드가 발목을 잡기 시작했다면, 한번 시도해 보세요.

---

## 참고 자료

- [hmlongco/Factory](https://github.com/hmlongco/Factory)
- [Swinject/Swinject](https://github.com/Swinject/Swinject)

<!-- RELATED-POSTS -->
## 이어서 읽기

- [프로토콜 지향 프로그래밍(POP), OOP 한계를 넘는 법](/%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C-%EC%A7%80%ED%96%A5-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8DPOP-OOP-%ED%95%9C%EA%B3%84%EB%A5%BC-%EB%84%98%EB%8A%94-%EB%B2%95/)
- [\[Swift 중급 #8\] Swift KeyPath 정리, map(\\\\.name)의 원리](/Swift-%EC%A4%91%EA%B8%89-8-Swift-KeyPath-%EC%A0%95%EB%A6%AC-mapname%EC%9D%98-%EC%9B%90%EB%A6%AC/)
- [\[Swift 중급 #7\] 프로퍼티 래퍼 원리, @State가 마법이 아닌 이유](/Swift-%EC%A4%91%EA%B8%89-7-%ED%94%84%EB%A1%9C%ED%8D%BC%ED%8B%B0-%EB%9E%98%ED%8D%BC-%EC%9B%90%EB%A6%AC-State%EA%B0%80-%EB%A7%88%EB%B2%95%EC%9D%B4-%EC%95%84%EB%8B%8C-%EC%9D%B4%EC%9C%A0/)
<!-- /RELATED-POSTS -->
