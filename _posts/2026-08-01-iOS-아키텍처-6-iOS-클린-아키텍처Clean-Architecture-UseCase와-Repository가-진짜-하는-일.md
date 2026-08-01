---
title: "[iOS 아키텍처 #6] iOS 클린 아키텍처(Clean Architecture), UseCase와 Repository가 진짜 하는 일"
description: "채용 공고나 기술 블로그에서 \"클린 아키텍처 기반\"이라는 문구를 자주 보게 됩니다. 그런데 막상 코드를 열어보면 팀마다 모습이 제각각이에요. UseCase가 있는 곳도 있고 없는 곳도 있고, Repository의 역할도 다 다릅니다."
header:
  og_image: /assets/images/posts/4a332cf7-d161-401b-ab7c-f15324e48609/1.png
tags:
  - iOS
  - 클린아키텍처
  - UseCase
  - Repository
permalink: /iOS-아키텍처-6-iOS-클린-아키텍처Clean-Architecture-UseCase와-Repository가-진짜-하는-일/
toc: true
toc_sticky: true
last_modified_at: 2026-08-01
---

채용 공고나 기술 블로그에서 "클린 아키텍처 기반"이라는 문구를 자주 보게 됩니다. 그런데 막상 코드를 열어보면 팀마다 모습이 제각각이에요. UseCase가 있는 곳도 있고 없는 곳도 있고, Repository의 역할도 다 다릅니다.

혼란의 이유는 간단합니다. 클린 아키텍처는 특정 폴더 구조나 클래스 목록이 아니라 원칙 하나이기 때문이에요.

오늘은 그 원칙이 뭔지, 그리고 iOS에서 UseCase와 Repository라는 형태로 구현될 때 각각 뭘 담당하는지 정리해보겠습니다.

<figure>
  <img src="/assets/images/posts/4a332cf7-d161-401b-ab7c-f15324e48609/1.png" alt="규칙은 단 하나, 의존성은 안쪽으로만">
  <figcaption>규칙은 단 하나, 의존성은 안쪽으로만</figcaption>
</figure>

---

## 핵심은 "의존성은 안쪽으로만"

클린 아키텍처는 로버트 마틴(Uncle Bob)이 정리한 개념으로, 앱을 동심원 계층으로 봅니다.

- **가장 안쪽**: 도메인. 엔티티와 비즈니스 규칙. "이 앱이 뭘 하는 앱인가"
- **중간**: UseCase. 앱의 동작 시나리오
- **바깥쪽**: UI, 데이터베이스, 네트워크, 프레임워크

규칙은 단 하나입니다. **의존성은 항상 바깥에서 안쪽으로만 향한다.**

안쪽의 도메인 코드는 바깥의 UIKit도, URLSession도, SwiftData도 몰라야 합니다. 반대로 바깥 계층은 안쪽을 알아도 됩니다. 이렇게 하면 UI 프레임워크를 갈아치우든 서버 API가 바뀌든, 앱의 핵심 규칙은 건드리지 않아도 되는 구조가 됩니다.

눈치채셨겠지만 이건 DIP(의존성 역전 원칙)를 앱 전체 규모로 확장한 이야기입니다. "추상에 의존하고 구체에 의존하지 말라"를 계층 단위로 적용한 거예요.

---

## Repository: "데이터가 어디서 오는지" 숨기는 문

Repository는 도메인과 데이터 소스 사이의 경계입니다. 프로토콜은 도메인 쪽에, 구현은 바깥 쪽에 둡니다.

```swift
// 도메인 계층 — URLSession도 SwiftData도 모름
protocol PostRepository {
    func fetchPosts(userID: String) async throws -> [Post]
}

// 데이터 계층 — 구현은 바깥에
final class RemotePostRepository: PostRepository {
    func fetchPosts(userID: String) async throws -> [Post] {
        // URLSession 호출, DTO 디코딩, Post로 변환
    }
}
```

포인트는 프로토콜의 위치입니다. 인터페이스를 도메인이 소유하니까, 도메인은 "포스트를 가져올 수 있다"는 사실만 알고 그게 서버인지 캐시인지 로컬 DB인지는 모릅니다. 서버 응답 형식이 바뀌면 DTO(Data Transfer Object, 서버 응답을 옮겨 담는 데이터 전송 객체)와 구현체만 고치면 되고, 테스트에서는 가짜 Repository를 꽂으면 됩니다.

<figure>
  <img src="/assets/images/posts/4a332cf7-d161-401b-ab7c-f15324e48609/2.png" alt="도메인은 데이터가 어디서 오는지 몰라도 됩니다" loading="lazy">
  <figcaption>도메인은 데이터가 어디서 오는지 몰라도 됩니다</figcaption>
</figure>

---

## UseCase: "이 앱이 하는 일" 하나를 담는 그릇

UseCase는 앱의 동작 시나리오 하나를 객체로 만든 것입니다. "피드를 불러온다", "글을 발행한다" 같은 단위죠.

```swift
final class LoadFeedUseCase {
    private let postRepository: PostRepository
    private let blockRepository: BlockRepository

    func execute(userID: String) async throws -> [Post] {
        let posts = try await postRepository.fetchPosts(userID: userID)
        let blocked = try await blockRepository.blockedUserIDs()
        return posts
            .filter { !blocked.contains($0.authorID) }
            .sorted { $0.createdAt > $1.createdAt }
    }
}
```

"차단한 사용자의 글은 피드에서 제외한다"는 비즈니스 규칙이 UseCase에 삽니다. 이 규칙을 ViewModel에 두면 어떻게 될까요? 피드 화면과 프로필 화면과 검색 화면이 각자 차단 필터를 구현하게 되고, 언젠가 한 군데가 어긋납니다. UseCase로 빼면 규칙이 한곳에 살고, 화면 없이 테스트할 수 있어요.

그래서 MVVM(Model-View-ViewModel)과 클린 아키텍처는 경쟁 관계가 아니라 직교 관계입니다. MVVM은 View 쪽 정리법이고, 클린 아키텍처는 그 뒤 계층의 정리법이에요. 지난 편에서 "Massive ViewModel을 피하려면 로직을 내려보내라"고 했는데, 그 내려보낼 자리가 바로 UseCase와 Repository입니다.

---

## 어디까지 도입해야 할까요?

클린 아키텍처의 함정은 과잉 도입입니다. 화면 두 개짜리 앱에 UseCase·Repository·DTO·Mapper를 전부 갖추면, 값을 하나 전달하는 데 파일 다섯 개를 통과합니다. VIPER(View·Interactor·Presenter·Entity·Router)의 보일러플레이트 문제가 그대로 재현되는 거죠.

현실적인 기준은 이렇습니다.

- **Repository는 거의 항상 이득입니다.** 네트워크·DB 코드를 화면에서 떼어내는 것만으로 테스트와 변경이 쉬워져요.
- **UseCase는 여러 화면이 공유하는 비즈니스 규칙이 생길 때** 도입하면 됩니다. Repository 호출을 그대로 전달만 하는 UseCase가 대부분이라면 아직 이릅니다.
- **계층별 모델 분리(DTO/도메인/화면 모델)는 규모가 커진 뒤에.** 처음부터 전부 나누면 Mapper 코드만 쌓입니다.

<figure>
  <img src="/assets/images/posts/4a332cf7-d161-401b-ab7c-f15324e48609/3.png" alt="전부 갖추는 게 아니라 필요할 때 한 층씩 쌓는 겁니다" loading="lazy">
  <figcaption>전부 갖추는 게 아니라 필요할 때 한 층씩 쌓는 겁니다</figcaption>
</figure>

---

## 정리

- 클린 아키텍처는 폴더 구조가 아니라 "의존성은 안쪽(도메인)으로만"이라는 원칙입니다. DIP의 앱 규모 확장판이에요.
- Repository는 데이터 출처를 숨기는 경계이고, 프로토콜을 도메인이 소유한다는 점이 핵심입니다.
- UseCase는 여러 화면이 공유할 비즈니스 규칙의 자리입니다. MVVM과는 직교 관계라 함께 쓰입니다.
- 전부 갖추는 게 목표가 아닙니다. Repository부터 시작해 규칙이 쌓일 때 UseCase를 더하세요.

다음 편에서는 방향을 바꿔, 상태 관리 자체를 아키텍처로 만든 TCA(The Composable Architecture)를 다룹니다.
