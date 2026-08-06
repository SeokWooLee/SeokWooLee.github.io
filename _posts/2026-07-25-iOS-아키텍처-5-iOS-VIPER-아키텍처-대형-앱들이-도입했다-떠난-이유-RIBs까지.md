---
title: "[iOS 아키텍처 #5] iOS VIPER 아키텍처, 대형 앱들이 도입했다 떠난 이유 (RIBs까지)"
description: "iOS 아키텍처 이야기에서 VIPER만큼 평가가 극단적으로 갈리는 패턴도 드뭅니다."
header:
  og_image: /assets/images/posts/ef088d05-20c3-46e5-95b6-d23a695099e9/1.jpg
tags:
  - iOS
  - VIPER
  - RIBs
  - 아키텍처
permalink: /iOS-아키텍처-5-iOS-VIPER-아키텍처-대형-앱들이-도입했다-떠난-이유-RIBs까지/
toc: true
toc_sticky: true
last_modified_at: 2026-07-25
---

iOS 아키텍처 이야기에서 VIPER만큼 평가가 극단적으로 갈리는 패턴도 드뭅니다.

한쪽에서는 "대규모 팀 협업의 정답"이라 부르고, 다른 쪽에서는 "보일러플레이트 지옥"이라고 부릅니다. 실제로 한 시기에 여러 대형 서비스 앱들이 VIPER나 그 변형을 도입했다가, 몇 년 뒤 더 가벼운 구조로 옮겨간 사례가 적지 않아요.

오늘은 VIPER가 무엇을 해결하려던 패턴인지, 왜 그 대가가 컸는지를 정리해보겠습니다.

<figure>
  <img src="/assets/images/posts/ef088d05-20c3-46e5-95b6-d23a695099e9/1.jpg" alt="화면 하나를 다섯 조각으로, VIPER의 극단적 분리" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>화면 하나를 다섯 조각으로, VIPER의 극단적 분리</figcaption>
</figure>

---

## VIPER는 다섯 조각입니다

VIPER는 화면 하나를 다섯 가지 역할로 쪼갭니다. 이름 자체가 그 다섯 개의 머리글자예요.

- **View**: 화면 표시. 뷰컨트롤러 포함. "그리기만" 합니다
- **Interactor**: 비즈니스 로직. 데이터를 가져오고 규칙을 적용합니다
- **Presenter**: View와 Interactor 사이의 중개. 데이터를 화면용으로 가공합니다
- **Entity**: 순수 데이터 모델
- **Router** (Wireframe): 화면 전환 담당

MVC(Model-View-Controller)에서 뷰컨트롤러 하나가 하던 일을 넷으로 나누고, 화면 전환까지 별도 조각(Router)으로 뺀 겁니다. 시리즈 1편에서 봤던 Massive View Controller의 모든 책임에 각각 전용 자리를 만들어준 셈이에요.

핵심 규칙은 **단방향에 가까운 엄격한 참조 관계**입니다. View는 Presenter만 알고, Presenter는 Interactor와 Router를 알고, Interactor는 Entity만 만집니다. 각 경계는 프로토콜로 끊어서, 어느 조각이든 mock으로 바꿔 끼울 수 있습니다.

---

## 무엇이 좋아지나요?

이 구조가 빛나는 순간은 분명히 있습니다.

첫째, **테스트 커버리지**를 극한까지 올릴 수 있습니다. 모든 경계가 프로토콜이라 Interactor도 Presenter도 Router도 각각 단독 테스트가 됩니다.

둘째, **대규모 팀의 분업**이 쉬워집니다. 화면마다 구조가 똑같으니 "누가 짠 화면이든 파일 구성이 같다"는 예측 가능성이 생깁니다. 수십 명이 한 코드베이스를 만질 때 이 균일함은 실제로 값을 해요.

셋째, **기능 단위 모듈화**와 궁합이 좋습니다. 화면 하나가 자기완결적인 다섯 조각이라, 기능별로 모듈을 떼어내기 수월합니다. Uber가 VIPER에서 영감을 받아 만든 RIBs가 이 방향을 극단까지 밀어붙인 사례입니다. 화면(View)이 아니라 비즈니스 로직 단위로 앱을 트리 구조로 쪼개죠.

<figure>
  <img src="/assets/images/posts/ef088d05-20c3-46e5-95b6-d23a695099e9/2.jpg" alt="버튼 하나짜리 화면에도 똑같이 다섯 조각이 강제됩니다" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>버튼 하나짜리 화면에도 똑같이 다섯 조각이 강제됩니다</figcaption>
</figure>

---

## 왜 다들 떠났을까요?

문제는 비용입니다.

**보일러플레이트**가 압도적입니다. 버튼 하나 있는 화면을 만들어도 View, Interactor, Presenter, Entity, Router에 그 사이 프로토콜들까지, 파일이 예닐곱 개씩 생깁니다. "레이블 텍스트 하나 바꾸는데 파일 세 개를 거친다"는 하소연이 괜히 나오는 게 아니에요.

간단한 화면에도 **같은 무게가 강제**됩니다. 정적인 설정 화면이든 복잡한 피드 화면이든 똑같이 다섯 조각입니다. 화면의 복잡도와 구조의 무게가 비례하지 않아요.

**러닝커브와 온보딩 비용**도 만만치 않습니다. 데이터가 View → Presenter → Interactor → Presenter → View로 돌아오는 여정을 처음 보는 사람이 따라가려면 시간이 걸립니다.

그리고 결정타는 **SwiftUI의 등장**입니다. VIPER는 "뷰컨트롤러에서 책임을 떼어낸다"는 UIKit 시대의 문제의식에서 나온 패턴인데, SwiftUI에서는 View가 이미 가볍고 화면 전환 방식도 달라서 Router 같은 조각이 어색해집니다. 문제 자체가 달라진 거예요.

---

## 그래서 VIPER는 실패한 패턴인가요?

그렇게 보기는 어렵습니다. VIPER가 남긴 유산이 지금의 표준 관행에 녹아 있거든요.

- 화면 전환을 전담 객체로 뺀다 → Coordinator 패턴으로 정착
- 비즈니스 로직을 프레젠테이션과 분리한다 → UseCase/Repository 계층으로 정착
- 경계를 프로토콜로 끊는다 → 의존성 주입과 테스트 관행으로 정착

VIPER의 다섯 조각을 통째로 쓰는 팀은 줄었지만, **그 다섯 조각이 각각 해결하려던 문제와 해법은 살아남았습니다**. 지금은 그중 필요한 조각만 골라 쓰는 시대에 가까워요.

<figure>
  <img src="/assets/images/posts/ef088d05-20c3-46e5-95b6-d23a695099e9/3.jpg" alt="통째로는 떠났지만 쓸 만한 조각들은 표준 관행으로 남았어요" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>통째로는 떠났지만 쓸 만한 조각들은 표준 관행으로 남았어요</figcaption>
</figure>

---

## 정리

- VIPER는 화면 하나를 View·Interactor·Presenter·Entity·Router 다섯 조각으로 나누고 경계를 프로토콜로 끊는 패턴입니다.
- 테스트 용이성과 대규모 팀의 균일함이 강점이지만, 화면 하나에 파일 예닐곱 개라는 보일러플레이트 비용이 큽니다.
- SwiftUI 시대에 문제의식 자체가 달라지면서 원형 그대로 쓰는 팀은 줄었습니다.
- 다만 Router→Coordinator, Interactor→UseCase처럼 그 유산은 표준 관행으로 살아남았습니다.

다음 편에서는 그 유산 중 가장 널리 퍼진 형태, 클린 아키텍처의 UseCase와 Repository가 iOS에서 실제로 하는 일을 다룹니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [iOS MVVM 패턴, 바인딩 없으면 반쪽인 이유 (Combine·Observation 예제)](/iOS-MVVM-%ED%8C%A8%ED%84%B4-%EB%B0%94%EC%9D%B8%EB%94%A9-%EC%97%86%EC%9C%BC%EB%A9%B4-%EB%B0%98%EC%AA%BD%EC%9D%B8-%EC%9D%B4%EC%9C%A0-CombineObservation-%EC%98%88%EC%A0%9C/)
- [iOS MVC 패턴, Massive View Controller가 생기는 진짜 이유](/iOS-MVC-%ED%8C%A8%ED%84%B4-Massive-View-Controller%EA%B0%80-%EC%83%9D%EA%B8%B0%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/)
- [[iOS 아키텍처 #8] iOS 아키텍처 선택 가이드, 팀 규모·앱 수명·상태 복잡도로 고르는 법](/iOS-%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98-8-iOS-%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98-%EC%84%A0%ED%83%9D-%EA%B0%80%EC%9D%B4%EB%93%9C-%ED%8C%80-%EA%B7%9C%EB%AA%A8%EC%95%B1-%EC%88%98%EB%AA%85%EC%83%81%ED%83%9C-%EB%B3%B5%EC%9E%A1%EB%8F%84%EB%A1%9C-%EA%B3%A0%EB%A5%B4%EB%8A%94-%EB%B2%95/)
<!-- /RELATED-POSTS -->
