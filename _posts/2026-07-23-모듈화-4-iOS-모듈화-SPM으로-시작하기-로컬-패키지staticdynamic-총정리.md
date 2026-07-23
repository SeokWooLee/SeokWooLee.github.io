---
title: "[모듈화 #4] iOS 모듈화 SPM으로 시작하기 (로컬 패키지·static·dynamic 총정리)"
description: "앞선 모듈화 시리즈에서 경계·의존 방향·레이어 구조까지 원론을 정리했습니다. 이제 iOS 프로젝트에 실제로 적용할 차례입니다."
header:
  og_image: /assets/images/posts/2dfa8b93-209b-47ab-8ad8-2745ec0ab314/1.png
tags:
  - iOS모듈화
  - SPM
  - SwiftPackageManager
  - Xcode
permalink: /모듈화-4-iOS-모듈화-SPM으로-시작하기-로컬-패키지staticdynamic-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-23
---

앞선 모듈화 시리즈에서 경계·의존 방향·레이어 구조까지 원론을 정리했습니다. 이제 iOS 프로젝트에 실제로 적용할 차례입니다.

iOS에서 모듈을 나누는 도구는 사실상 두 가지입니다. Xcode 프레임워크 타깃, 그리고 Swift Package(SPM).

결론부터 드리면, 2026년 기준 새로 시작하는 모듈화라면 SPM이 기본 선택지입니다. 프로젝트 파일(pbxproj) 충돌 없이 폴더와 Package.swift만으로 모듈이 만들어지거든요.

이 글에서는 SPM으로 로컬 모듈을 만드는 법, 프레임워크 타깃과의 차이, 그리고 static·dynamic 링킹 선택 기준까지 정리합니다.

<figure>
  <img src="/assets/images/posts/2dfa8b93-209b-47ab-8ad8-2745ec0ab314/1.png" alt="iOS 모듈화, 결국 pbxproj와 Package.swift 중 뭘 만질지의 문제입니다">
  <figcaption>iOS 모듈화, 결국 pbxproj와 Package.swift 중 뭘 만질지의 문제입니다</figcaption>
</figure>

---

## 왜 프레임워크 타깃이 아니라 SPM일까?

Xcode에서 File → New → Target → Framework로도 모듈을 만들 수 있습니다. 오랫동안 이게 표준이었죠.

문제는 이 방식이 남기는 흔적입니다. 타깃 하나를 추가할 때마다 project.pbxproj 파일이 수십 줄씩 바뀌고 팀원 두 명이 동시에 타깃을 만지면 머지 충돌이 납니다.

SPM 로컬 패키지는 다릅니다.

| 비교 | 프레임워크 타깃 | SPM 로컬 패키지 |
| --- | --- | --- |
| 모듈 정의 위치 | project.pbxproj | Package.swift (선언형 코드) |
| 머지 충돌 | 잦음 | 드묾 (파일이 사람이 읽는 코드) |
| 모듈 추가 비용 | Xcode GUI 조작 | 폴더 + 몇 줄 추가 |
| 세밀한 빌드 설정 | 자유로움 | 제한적 |

> 모듈이 늘어날수록 "모듈 하나 추가하는 비용"이 구조를 결정합니다. 추가가 무서우면 아무도 안 나누게 되거든요.

빌드 설정을 아주 세밀하게 제어해야 하는 경우가 아니라면, 로컬 SPM 패키지가 관리 비용에서 우위입니다.

---

## 로컬 SPM 패키지, 어떻게 만드나요?

앱 프로젝트 옆에 폴더 하나 만들고 Package.swift를 두면 끝입니다. 지난 글의 레이어 구조를 그대로 옮겨 볼게요.

```swift
// Modules/Package.swift
let package = Package(
    name: "Modules",
    products: [
        .library(name: "FeatureSearch", targets: ["FeatureSearch"]),
        .library(name: "CoreNetwork", targets: ["CoreNetwork"]),
    ],
    targets: [
        .target(name: "FeatureSearch", dependencies: ["CoreNetwork"]),
        .target(name: "CoreNetwork"),
        .testTarget(name: "FeatureSearchTests", dependencies: ["FeatureSearch"]),
    ]
)
```

이 패키지를 Xcode 프로젝트에 드래그해서 넣고, 앱 타깃에 라이브러리를 연결하면 import FeatureSearch가 동작합니다.

주목할 점은 의존 관계가 dependencies 배열에 코드로 명시된다는 겁니다. FeatureSearch가 CoreNetwork를 안 쓰기로 했다면 배열에서 빼면 되고, 몰래 import하면 컴파일 에러가 나요.

지난 글에서 말한 "컴파일러가 경계를 강제하는 상태"가 이렇게 만들어집니다.

<figure>
  <img src="/assets/images/posts/2dfa8b93-209b-47ab-8ad8-2745ec0ab314/2.png" alt="dependencies 배열이 그대로 의존 그래프가 됩니다" loading="lazy">
  <figcaption>dependencies 배열이 그대로 의존 그래프가 됩니다</figcaption>
</figure>

한 패키지 안에 타깃 여러 개를 두는 위 방식 말고, 모듈마다 패키지를 하나씩 두는 방식도 있습니다. 모듈 수가 적을 땐 단일 패키지 멀티 타깃이 관리하기 편하고, 수십 개 규모가 되면 도메인별로 패키지를 쪼개는 팀이 많습니다.

---

## static과 dynamic, 뭘 선택해야 하나요?

.library를 선언할 때 링킹 방식을 정할 수 있습니다. 기본값은 Xcode가 알아서 정하는 automatic이고 대부분 static으로 처리됩니다.

- static: 모듈 코드가 앱 바이너리에 복사되어 합쳐짐. 앱 실행 시 추가 로딩 없음
- dynamic: 모듈이 별도 프레임워크 파일로 존재, 실행 시점에 로딩

선택 기준은 이렇습니다.

| 상황 | 선택 |
| --- | --- |
| 일반적인 기능·코어 모듈 | static (기본값 유지) |
| 앱 + 위젯 + 익스텐션이 같은 모듈을 공유 | dynamic (바이너리 중복 제거) |
| 앱 시작 시간이 민감한데 dynamic이 수십 개 | static으로 통합 검토 |

dynamic 프레임워크가 많아지면 앱 실행 시 로딩 비용이 늘어납니다. 애플이 WWDC 세션에서 꾸준히 권고해 온 내용이라, 특별한 이유가 없으면 automatic(사실상 static)을 유지하는 게 무난합니다.

---

## 언제 SPM만으로 부족해질까?

SPM 모듈화로 시작해서 잘 쓰다가, 팀이 커지면 한계를 만나는 지점이 있습니다.

- 앱 타깃 자체의 설정(서명, 스킴, 빌드 설정)은 여전히 pbxproj에 남아 충돌 여지가 있다
- 모듈이 수십 개가 되면 Package.swift 관리와 모듈 템플릿 통일이 번거롭다
- 빌드 캐싱을 조직 단위로 공유하고 싶다

이 지점에서 등장하는 도구가 Tuist입니다. 시리즈 마지막 글에서 다룰 주제예요.

### 면접에서는 이렇게 물어봅니다

**Q. iOS 모듈화에서 SPM 로컬 패키지를 쓰는 이유는 무엇인가요?**

모듈 정의가 pbxproj가 아닌 Package.swift라는 선언형 코드로 관리되어 머지 충돌이 줄고, 모듈 추가 비용이 낮아집니다. 또 타깃 간 의존이 dependencies에 명시되어 허용하지 않은 import가 컴파일 에러로 차단되므로, 모듈 경계를 컴파일러가 강제하게 됩니다.

**Q. static 라이브러리와 dynamic 프레임워크의 차이와 선택 기준을 설명해 보세요.**

static은 링크 타임에 앱 바이너리로 복사되어 실행 시 로딩 비용이 없고, dynamic은 별도 파일로 존재해 실행 시 로딩됩니다. 기본은 static을 쓰되, 앱과 익스텐션·위젯이 같은 코드를 공유해 바이너리 중복을 줄여야 할 때 dynamic을 선택합니다.

<figure>
  <img src="/assets/images/posts/2dfa8b93-209b-47ab-8ad8-2745ec0ab314/3.png" alt="패키지 폴더가 하나씩 늘어나는 재미가 은근히 있습니다" loading="lazy">
  <figcaption>패키지 폴더가 하나씩 늘어나는 재미가 은근히 있습니다</figcaption>
</figure>

---

다음 글에서는 많은 팀이 모듈화를 시작하는 진짜 계기, Xcode 빌드 속도를 다룹니다.

빌드가 왜 느려지는지, 모듈화가 어디를 얼마나 개선하는지, 그리고 개선 효과를 숫자로 측정하는 방법까지 정리할게요.
