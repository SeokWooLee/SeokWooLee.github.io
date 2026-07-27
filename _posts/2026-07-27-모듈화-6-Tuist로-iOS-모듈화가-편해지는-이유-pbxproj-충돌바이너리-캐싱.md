---
title: "[모듈화 #6] Tuist로 iOS 모듈화가 편해지는 이유 (pbxproj 충돌·바이너리 캐싱)"
description: "모듈화 시리즈를 따라 모듈을 수십 개까지 늘려 본 팀이라면, 새로운 종류의 피로를 만나게 됩니다."
header:
  og_image: /assets/images/posts/2461e64e-988b-43c4-a75f-59b167bfa642/1.png
tags:
  - Tuist
  - iOS모듈화
  - pbxproj충돌
  - 바이너리캐싱
permalink: /모듈화-6-Tuist로-iOS-모듈화가-편해지는-이유-pbxproj-충돌바이너리-캐싱/
toc: true
toc_sticky: true
last_modified_at: 2026-07-27
---

모듈화 시리즈를 따라 모듈을 수십 개까지 늘려 본 팀이라면, 새로운 종류의 피로를 만나게 됩니다.

모듈 하나 추가할 때마다 반복되는 설정 작업, 여전히 남아 있는 프로젝트 파일 충돌, 그리고 팀원마다 미묘하게 다른 모듈 구성.

Tuist는 정확히 이 지점을 노린 도구입니다. 한 줄로 정리하면, Xcode 프로젝트 파일을 저장소에서 없애고 Swift 코드로 선언해서 생성하는 도구예요.

이 글에서는 Tuist가 해결하는 문제, Project.swift 기본 사용법, 그리고 대규모 팀에서 진가를 발휘하는 바이너리 캐싱까지 정리합니다. 2026년 7월, Tuist 4 기준입니다.

<figure>
  <img src="/assets/images/posts/2461e64e-988b-43c4-a75f-59b167bfa642/1.png" alt="Tuist로 iOS 모듈화 관리, 핵심은 pbxproj를 커밋하지 않는 것">
  <figcaption>Tuist로 iOS 모듈화 관리, 핵심은 pbxproj를 커밋하지 않는 것</figcaption>
</figure>

---

## Tuist는 어떤 문제를 해결하나요?

핵심은 pbxproj의 소유권을 사람에게서 도구로 옮기는 겁니다.

일반적인 iOS 프로젝트에서 project.pbxproj는 저장소에 커밋되는 파일입니다. 파일 추가, 타깃 설정 변경이 전부 이 파일을 건드리는데 형식마저 사람이 읽기 어려운 구조라, 머지 충돌이 나면 풀기 고약하죠.

Tuist 프로젝트에서는 이 파일을 커밋하지 않습니다. 대신 Project.swift라는 선언을 커밋해요.

| 비교 | 일반 프로젝트 | Tuist 프로젝트 |
| --- | --- | --- |
| 저장소에 있는 것 | project.pbxproj | Project.swift (Swift 코드) |
| 프로젝트 파일 | 손으로 관리 | tuist generate로 매번 생성 |
| 머지 충돌 | pbxproj에서 빈발 | Swift 코드 diff라 드묾 |
| 모듈 추가 | GUI 조작 + 설정 반복 | 함수 호출 한 줄 |

> 프로젝트 파일이 생성물이 되는 순간, 머지 충돌 대상에서 빠집니다. .gitignore에 넣으면 끝이에요.

---

## Project.swift, 어떻게 생겼나요?

모듈 정의가 Swift 코드라서, 반복되는 구성을 함수로 묶을 수 있다는 게 백미입니다.

```swift
// Project.swift
let project = Project(
    name: "MyApp",
    targets: [
        .target(
            name: "MyApp",
            destinations: .iOS,
            product: .app,
            bundleId: "com.example.myapp",
            sources: ["Sources/**"],
            dependencies: [
                .target(name: "FeatureSearch"),
                .target(name: "CoreNetwork"),
            ]
        ),
    ]
)
```

여기까지는 SPM(Swift Package Manager)의 Package.swift와 비슷해 보입니다. 차이는 확장성에서 나요.

팀 표준 모듈 형태를 헬퍼 함수로 정의해 두면, 새 기능 모듈 추가가 정말로 한 줄이 됩니다.

```swift
// 팀 표준: 기능 모듈 = 소스 + 테스트 + 데모 앱 세트
let searchModule = Target.featureModule(name: "Search")
let orderModule = Target.featureModule(name: "Order")
// 모듈마다 타깃 3개씩, 설정은 헬퍼 안에서 통일
```

모듈이 30개면 pbxproj 방식으로는 설정 화면을 30번 반복해야 하지만 Tuist에서는 배열에 이름을 추가하는 일이 됩니다. 팀원마다 설정이 어긋날 여지도 사라지고요.

의존 그래프 시각화도 내장돼 있습니다. tuist graph 명령 하나로 모듈 의존도를 그림으로 뽑아 주는데, 순환 의존이나 지난 글에서 경고한 "모두가 의존하는 비대 모듈"을 눈으로 확인하기 좋습니다.

<figure>
  <img src="/assets/images/posts/2461e64e-988b-43c4-a75f-59b167bfa642/2.png" alt="선언에서 프로젝트가 생성되는 흐름이에요" loading="lazy">
  <figcaption>선언에서 프로젝트가 생성되는 흐름이에요</figcaption>
</figure>

---

## 바이너리 캐싱, 빌드 속도의 다음 단계

지난 글에서 모듈화가 재컴파일 범위를 줄인다고 했는데, Tuist 캐싱은 한 걸음 더 나갑니다.

tuist cache는 각 모듈을 미리 빌드해 바이너리(프레임워크)로 저장해 둡니다. 이후 tuist generate 시점에 안 바뀐 모듈은 소스 대신 캐시된 바이너리로 대체돼요.

- 내가 검색 기능만 개발 중이라면: 검색 모듈만 소스로 열고, 나머지 수십 개 모듈은 빌드 완료된 바이너리로 받는다
- 클린 빌드조차 사실상 "내 모듈 + 링킹"만 남는다

원격 캐시를 쓰면 이 바이너리를 팀·CI가 공유합니다. 동료가 이미 빌드한 모듈을 내 머신이 다시 빌드하지 않는 거죠. 대규모 팀에서 클린 빌드 시간이 분 단위에서 초 단위로 줄었다는 사례가 나오는 이유입니다.

---

## 언제 도입하고 언제 과할까?

Tuist는 강력하지만 도구 하나를 팀의 필수 의존으로 추가하는 결정입니다.

| 상황 | 판단 |
| --- | --- |
| 모듈 10개 미만, 소규모 팀 | SPM 로컬 패키지로 충분 |
| 모듈 수십 개, pbxproj 충돌이 주간 행사 | 도입 가치 큼 |
| CI·팀 빌드 시간이 비용 문제로 번짐 | 캐싱만으로도 도입 근거 충분 |
| 팀에 빌드 시스템 담당 여력이 전혀 없음 | 러닝커브·업데이트 추종 비용 고려 |

도입한다면 전면 전환보다, 신규 모듈부터 Tuist 관리로 넣고 기존 타깃을 점진 이관하는 경로가 안전합니다. XcodeGen이라는 더 가벼운 대안(프로젝트 생성만 담당)도 있으니, 캐싱이 필요 없다면 함께 검토해 보세요.

### 면접에서는 이렇게 물어봅니다

**Q. Tuist 같은 프로젝트 생성 도구를 도입하는 이유는 무엇인가요?**

pbxproj를 저장소에서 제거해 머지 충돌을 없애고, 프로젝트 구성을 Swift 코드로 선언해 모듈 템플릿을 표준화할 수 있기 때문입니다. 여기에 바이너리 캐싱으로 안 바뀐 모듈의 재빌드를 생략해, 모듈화의 관리 비용은 낮추고 빌드 속도 이점은 키웁니다.

**Q. 모듈이 많아질 때 빌드 시간을 팀 차원에서 줄이는 방법을 말해 보세요.**

모듈 단위 바이너리 캐싱을 도입해 변경 없는 모듈을 미리 빌드된 산출물로 대체하고, 원격 캐시로 팀·CI가 이를 공유합니다. 개발자는 자기가 작업하는 모듈만 소스로 열게 되어 클린 빌드 비용이 작업 범위에 비례하게 됩니다.

<figure>
  <img src="/assets/images/posts/2461e64e-988b-43c4-a75f-59b167bfa642/3.png" alt="의존 그래프를 화면에 띄워 놓으면 대화가 빨라집니다" loading="lazy">
  <figcaption>의존 그래프를 화면에 띄워 놓으면 대화가 빨라집니다</figcaption>
</figure>

---

이것으로 모듈화 시리즈를 마칩니다. 경계와 응집도에서 시작해 의존 방향, 레이어 구조, SPM, 빌드 속도, 그리고 Tuist까지 왔네요.

순서대로 적용해 보면 "빌드가 빨라졌다"를 넘어 "수정이 무섭지 않은 코드베이스"라는 더 큰 보상을 만나실 겁니다.
