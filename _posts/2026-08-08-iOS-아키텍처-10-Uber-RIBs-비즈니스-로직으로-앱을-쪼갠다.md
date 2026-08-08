---
title: "[iOS 아키텍처 #10] Uber RIBs, 비즈니스 로직으로 앱을 쪼갠다"
description: "RIBs는 앱을 화면이 아니라 비즈니스 로직 단위로 쪼갭니다. 화면 없는 조각이 존재한다는 전제와 초대형 조직에서만 쓰이는 이유, VIPER와 무엇이 다른지를 정리했습니다."
header:
  og_image: /assets/images/posts/f06929f4-621d-40e7-88d9-8817b02ef56d/uber-ribs-architecture-hero-1.jpg
categories:
  - iOS
tags:
  - iOS
  - RIBs
  - Uber
  - 토스
permalink: /iOS-아키텍처-10-Uber-RIBs-비즈니스-로직으로-앱을-쪼갠다/
toc: true
toc_sticky: true
last_modified_at: 2026-08-08
---

VIPER(View·Interactor·Presenter·Entity·Router) 편에서 "Uber가 VIPER에서 영감을 받아 만든 RIBs"를 한 문단으로 지나갔는데, 이번 편에서 제대로 다뤄보겠습니다. 국내에서는 토스가 도입한 아키텍처로 잘 알려져 있죠.

RIBs를 이해하는 열쇠는 하나입니다. 지금까지 다룬 모든 아키텍처(MVC·MVVM·VIPER·ReactorKit)는 **화면**을 기본 단위로 삼았습니다. RIBs는 이 전제를 버립니다. 앱을 화면이 아니라 **비즈니스 로직** 단위로 쪼개요.

<figure>
  <img src="/assets/images/posts/f06929f4-621d-40e7-88d9-8817b02ef56d/uber-ribs-architecture-hero-1.jpg" alt="Uber RIBs 아키텍처 화면 있는 RIB과 viewless LOGIC RIB이 섞인 트리 다이어그램" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>화면이 있는 노드와 없는 노드가 한 트리에 섞여 있는 게 RIBs입니다</figcaption>
</figure>

---

## 화면 없는 조각이 존재한다는 것

RIBs는 Router·Interactor·Builder의 약자입니다. 이 세 개가 한 조각(RIB)의 필수 구성이고, 필요할 때만 Presenter와 View가 붙습니다.

- **Interactor**: 비즈니스 로직의 본체. RIB의 두뇌입니다.
- **Router**: 자식 RIB을 붙였다(attach) 뗐다(detach) 하며 트리를 관리합니다.
- **Builder**: RIB 한 조각을 조립하고 의존성을 주입합니다.
- **Presenter·View**: 선택 사항. 화면이 필요한 RIB에만 존재합니다.

여기서 "View가 선택 사항"이라는 게 결정적입니다. 예를 들어 차량 호출 앱의 "탑승 중" 상태를 생각해보세요. 이 상태는 지도 화면, 기사 정보 카드, 결제 준비 로직을 아우르지만 그 자체로는 특정 화면 하나가 아닙니다. RIBs에서는 이걸 화면 없는(viewless) RIB으로 만들고, 그 아래에 화면 있는 자식 RIB들을 매답니다.

앱 전체는 RIB들의 트리가 됩니다. 로그인 여부, 탑승 상태 같은 **앱의 상태 변화가 곧 트리의 모양 변화**예요. 로그아웃하면 LoggedIn RIB이 트리에서 통째로 떨어져 나가고, 그 아래 매달린 화면과 로직도 함께 사라집니다. 상태 관리가 곧 트리 관리인 셈입니다.

<figure>
  <img src="/assets/images/posts/f06929f4-621d-40e7-88d9-8817b02ef56d/uber-ribs-tree-structure-2.png" alt="RIBs 트리 구조 viewless RIB과 View 보유 RIB 구분 예시 다이어그램" width="1144" height="956" loading="lazy" decoding="async">
  <figcaption>로그인·탑승 같은 앱 상태가 곧 트리의 모양입니다</figcaption>
</figure>

---

## 왜 초대형 조직만 쓸까

RIBs의 설계 목표는 처음부터 "수백 명이 한 앱을 만들 때"였습니다. Uber 앱에는 수십 개 팀이 동시에 코드를 넣는데, 화면 단위 분리로는 팀 경계를 만들 수 없었어요. 한 화면에 여러 팀의 로직이 섞이니까요.

RIB 단위로 쪼개면 팀마다 자기 RIB 서브트리를 소유하게 됩니다. Builder가 의존성 주입 지점을 강제하니 다른 팀 RIB의 내부에 손댈 방법 자체가 막혀 있습니다. 모듈화 시리즈에서 다룬 "경계 강제"를 아키텍처 차원에서 해내는 거죠.

토스가 RIBs를 도입한 이유도 같은 맥락입니다. 금융 서비스 수십 개가 한 앱에 들어가는 슈퍼앱 구조에서, 서비스 하나가 RIB 서브트리 하나가 되면 붙이고 떼는 게 명확해집니다.

반대로 이 장점은 소규모 팀에서는 전부 비용으로 바뀝니다.

첫째, **보일러플레이트가 VIPER보다도 많습니다**. RIB 하나에 파일이 기본 네댓 개씩 생깁니다. Uber도 이걸 알아서 코드 생성 템플릿을 함께 제공해요.

둘째, **러닝커브가 가파릅니다**. 트리 설계, attach/detach 시점, 스코프별 의존성 주입까지 익혀야 팀 전체가 같은 그림을 그릴 수 있습니다.

셋째, **화면 중심 사고와 어긋납니다**. 기획서는 보통 화면 단위로 나오는데, RIBs는 상태 단위로 쪼개니 설계 단계에서 번역이 필요합니다.

## VIPER와는 뭐가 다를까

구성 요소 이름만 보면 VIPER의 변형 같지만 차이는 근본적입니다.

| | VIPER | RIBs |
|---|---|---|
| 기본 단위 | 화면 | 비즈니스 로직 |
| 화면 없는 조각 | 불가능 | viewless RIB |
| 내비게이션 | Router가 화면 전환 | Router가 트리 attach/detach |
| 목표 | 화면 하나의 책임 분리 | 조직 단위의 코드 소유권 분리 |

VIPER의 Router는 "다음 화면으로 어떻게 넘어가나"를 담당하지만 RIBs의 Router는 "지금 앱 상태에서 어떤 로직 조각이 살아 있어야 하나"를 담당합니다. 같은 이름, 다른 질문이에요.

<figure>
  <img src="/assets/images/posts/f06929f4-621d-40e7-88d9-8817b02ef56d/ribs-team-code-ownership-3.jpg" alt="RIBs 팀별 코드 소유권 TEAM A B C 서브트리 분할 일러스트" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>팀마다 자기 서브트리를 소유한다는 게 RIBs의 진짜 목적이에요</figcaption>
</figure>

---

## 정리하면

- RIBs는 화면이 아니라 비즈니스 로직 단위로 앱을 트리 구조로 쪼개는 Uber의 아키텍처입니다.
- 화면 없는 RIB이 허용되고, 앱 상태 변화를 트리의 attach/detach로 표현합니다.
- 팀별 코드 소유권과 경계 강제가 목표라, 수백 명 규모 조직에서 진가가 나옵니다. Uber와 토스가 대표 사례입니다.
- 소규모 팀에는 보일러플레이트와 러닝커브가 장점을 압도합니다. 선택 기준은 8편의 선택 가이드에서 다룬 그대로예요. 팀 규모가 답의 대부분입니다.

이것으로 iOS 아키텍처 시리즈에서 언급만 하고 지나갔던 조각들까지 모두 채웠습니다. MVC부터 RIBs까지, 결국 모든 아키텍처는 "로직을 어디에 둘 것인가"라는 같은 질문에 내놓는 다른 답이라는 걸 기억하시면 됩니다.

<!-- RELATED-POSTS -->
## 이어서 읽기

### iOS 아키텍처 시리즈

- 이전 편: [\[iOS 아키텍처 #9\] ReactorKit 정리, 단방향 아키텍처의 표준](/iOS-%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98-9-ReactorKit-%EC%A0%95%EB%A6%AC-%EB%8B%A8%EB%B0%A9%ED%96%A5-%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98%EC%9D%98-%ED%91%9C%EC%A4%80/)
- 이전 편: [\[iOS 아키텍처 #8\] iOS 아키텍처 선택 가이드, 팀 규모·앱 수명·상태 복잡도로 고르는 법](/iOS-%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98-8-iOS-%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98-%EC%84%A0%ED%83%9D-%EA%B0%80%EC%9D%B4%EB%93%9C-%ED%8C%80-%EA%B7%9C%EB%AA%A8%EC%95%B1-%EC%88%98%EB%AA%85%EC%83%81%ED%83%9C-%EB%B3%B5%EC%9E%A1%EB%8F%84%EB%A1%9C-%EA%B3%A0%EB%A5%B4%EB%8A%94-%EB%B2%95/)
- 이전 편: [\[iOS 아키텍처 #7\] TCA(The Composable Architecture) 입문, 단방향 데이터 흐름 총정리](/iOS-%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98-7-TCAThe-Composable-Architecture-%EC%9E%85%EB%AC%B8-%EB%8B%A8%EB%B0%A9%ED%96%A5-%EB%8D%B0%EC%9D%B4%ED%84%B0-%ED%9D%90%EB%A6%84-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
<!-- /RELATED-POSTS -->
