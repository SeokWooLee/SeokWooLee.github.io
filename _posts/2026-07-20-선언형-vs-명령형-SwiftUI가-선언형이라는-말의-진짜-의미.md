---
title: "선언형 vs 명령형, SwiftUI가 선언형이라는 말의 진짜 의미"
description: "SwiftUI 소개 문서 첫 줄에는 어김없이 \"선언형(declarative) 프레임워크\"라는 말이 나옵니다. React도, Jetpack Compose도 자신을 선언형이라 부르죠."
header:
  og_image: /assets/images/posts/8e0f30e5-8050-45c9-8136-4399ee8b55a9/1.png
tags:
  - 선언형
  - 명령형
  - SwiftUI
  - UIKit
  - declarative
  - imperative
  - 함수형
  - 상태관리
  - 기술면접
  - CS기초
permalink: /선언형-vs-명령형-SwiftUI가-선언형이라는-말의-진짜-의미/
toc: true
toc_sticky: true
last_modified_at: 2026-07-20
---

🌐 **한국어** · [English](/en/%EC%84%A0%EC%96%B8%ED%98%95-vs-%EB%AA%85%EB%A0%B9%ED%98%95-SwiftUI%EA%B0%80-%EC%84%A0%EC%96%B8%ED%98%95%EC%9D%B4%EB%9D%BC%EB%8A%94-%EB%A7%90%EC%9D%98-%EC%A7%84%EC%A7%9C-%EC%9D%98%EB%AF%B8/) · [日本語](/ja/%EC%84%A0%EC%96%B8%ED%98%95-vs-%EB%AA%85%EB%A0%B9%ED%98%95-SwiftUI%EA%B0%80-%EC%84%A0%EC%96%B8%ED%98%95%EC%9D%B4%EB%9D%BC%EB%8A%94-%EB%A7%90%EC%9D%98-%EC%A7%84%EC%A7%9C-%EC%9D%98%EB%AF%B8/) · [中文](/zh/%EC%84%A0%EC%96%B8%ED%98%95-vs-%EB%AA%85%EB%A0%B9%ED%98%95-SwiftUI%EA%B0%80-%EC%84%A0%EC%96%B8%ED%98%95%EC%9D%B4%EB%9D%BC%EB%8A%94-%EB%A7%90%EC%9D%98-%EC%A7%84%EC%A7%9C-%EC%9D%98%EB%AF%B8/)
{: .notice--info}

SwiftUI 소개 문서 첫 줄에는 어김없이 "선언형(declarative) 프레임워크"라는 말이 나옵니다. React도, Jetpack Compose도 자신을 선언형이라 부르죠.

그런데 막상 "선언형이 뭔가요?"라고 물으면 답이 궁해집니다. "코드가 깔끔한 거요"는 정답이 아니에요.

선언형과 명령형의 차이는 한 문장으로 갈립니다. **"어떻게(How)"를 쓰느냐, "무엇(What)"을 쓰느냐.**

이 글에서는 이 기준을 일상 예제로 잡고, UIKit과 SwiftUI 코드로 확인한 다음, 선언형이 공짜가 아니라는 것까지 다룹니다.

<figure>
  <img src="/assets/images/posts/8e0f30e5-8050-45c9-8136-4399ee8b55a9/1.png" alt="길 안내를 직접 하면 명령형, 목적지만 말하면 선언형">
  <figcaption>길 안내를 직접 하면 명령형, 목적지만 말하면 선언형</figcaption>
</figure>

핵심 요약입니다.

1. 명령형: 원하는 결과에 도달하는 절차를 단계별로 지시한다 — How
2. 선언형: 원하는 결과가 무엇인지 기술하고, 절차는 시스템에 맡긴다 — What
3. SQL, HTML, map/filter, SwiftUI가 선언형의 대표 사례
4. 선언형 UI의 본질: "상태가 이럴 때 화면은 이렇다"를 선언하면, 상태 변화에 따른 갱신은 프레임워크가 한다

---

## 택시로 비유하면

명령형은 기사님께 길을 직접 안내하는 겁니다. "우회전이요, 300미터 직진, 신호에서 좌회전…" 절차를 하나하나 지시하고 그 절차의 합이 목적지 도착이라는 결과를 만들어요.

선언형은 "강남역 가주세요"입니다. 목적지(What)만 말하고 경로 선택(How)은 기사님과 내비게이션에 맡깁니다.

둘 다 목적지에 도착합니다. 다른 건 **내가 절차를 소유하느냐, 결과 기술만 소유하느냐**예요.

---

## 코드에서는 같은 일을 두 방식으로 씁니다

짝수만 골라 제곱하는 코드를 두 방식으로 써 볼게요.

```swift
// 명령형: 어떻게 순회하고 어디에 담을지 내가 지시
var result: [Int] = []
for n in numbers {
    if n % 2 == 0 {
        result.append(n * n)
    }
}

// 선언형: 무엇을 원하는지만 기술
let result = numbers.filter { $0 % 2 == 0 }.map { $0 * $0 }
```

명령형 버전에는 루프 변수, 중간 배열, 순서 같은 "절차의 부품"이 노출됩니다. 선언형 버전은 "짝수를 걸러 제곱한 것"이라는 의도만 남아요. 순회 방법은 filter와 map 내부에 숨었습니다.

더 익숙한 선언형도 이미 쓰고 계실 겁니다. SQL은 "이런 조건의 행을 달라"고만 쓰지 인덱스 탐색 방법을 쓰지 않고, HTML은 "여기 제목, 여기 문단"이라고 구조만 선언하지 렌더링 절차를 쓰지 않죠.

---

## UI로 오면 차이가 극적으로 커집니다

명령형 UI(UIKit)는 화면을 **바꾸는 절차**를 씁니다.

```swift
// UIKit: 상태가 바뀔 때마다 화면 조작을 직접 지시
func updateBadge(count: Int) {
    if count > 0 {
        badgeLabel.isHidden = false
        badgeLabel.text = "\(count)"
    } else {
        badgeLabel.isHidden = true
    }
}
```

이 방식의 어려움은 "현재 화면이 어떤 상태인지"를 개발자가 계속 추적해야 한다는 겁니다. 갱신 경로가 여러 개면 하나쯤 빼먹기 쉽고 그게 바로 "데이터는 바뀌었는데 화면은 그대로"인 버그예요.

선언형 UI(SwiftUI)는 **상태에 대한 화면의 모습**을 선언합니다.

```swift
// SwiftUI: count가 이럴 때 화면은 이렇다, 를 선언
struct BadgeView: View {
    let count: Int
    var body: some View {
        if count > 0 {
            Text("\(count)").badgeStyle()
        }
    }
}
```

count가 바뀌면 화면을 어떻게 고칠지는 내가 쓰지 않습니다. SwiftUI가 이전 선언과 새 선언을 비교해 필요한 부분만 갱신해요. UI를 "상태의 함수"로 만든 겁니다. 갱신 절차의 소유권을 프레임워크에 넘겼으니 빼먹을 갱신 코드 자체가 없습니다.

<figure>
  <img src="/assets/images/posts/8e0f30e5-8050-45c9-8136-4399ee8b55a9/2.png" alt="명령형은 갱신 절차를 내가 쓰고, 선언형은 프레임워크가 차이를 계산합니다" loading="lazy">
  <figcaption>명령형은 갱신 절차를 내가 쓰고, 선언형은 프레임워크가 차이를 계산합니다</figcaption>
</figure>

---

## 선언형은 공짜가 아닙니다

균형을 위해 반대편도 봐야 합니다.

**절차를 숨긴 대가로, 절차가 필요할 때 답답합니다**. "스크롤을 정확히 이 오프셋으로 옮겨" 같은 명령형 요구는 선언형 프레임워크에서 오히려 우회로가 필요해요.

**디버깅의 결이 다릅니다**. 명령형은 절차를 따라가면 되지만 선언형은 "왜 다시 그려졌지?"처럼 프레임워크의 판단을 추적해야 합니다. 숨겨진 How를 아예 몰라도 되는 건 아니에요.

**성능 튜닝도 결국 내부 이해로 돌아옵니다**. SwiftUI에서 뷰가 과도하게 재계산될 때, 해결하려면 diffing과 의존성 추적이 어떻게 도는지 알아야 하죠.

그래서 정확한 관점은 "선언형이 우월하다"가 아니라, **추상화 수준의 선택**입니다. 절차의 소유권을 넘기면 코드는 의도 중심으로 단순해지고 대신 세밀한 제어와 내부 이해가 과제로 남습니다.

<figure>
  <img src="/assets/images/posts/8e0f30e5-8050-45c9-8136-4399ee8b55a9/3.png" alt="절차의 소유권을 넘기는 대신 세밀한 제어를 내주는 트레이드오프" loading="lazy">
  <figcaption>절차의 소유권을 넘기는 대신 세밀한 제어를 내주는 트레이드오프</figcaption>
</figure>

---

## 정리

- 명령형은 결과에 도달하는 절차(How)를 지시하고, 선언형은 원하는 결과(What)를 기술한다
- SQL·HTML·map/filter는 이미 익숙한 선언형이다
- 명령형 UI는 화면을 바꾸는 절차를 쓰고, 상태-화면 불일치 버그가 나기 쉽다
- 선언형 UI는 "상태가 이럴 때 화면은 이렇다"를 선언하고, 갱신은 프레임워크가 맡는다 (UI = 상태의 함수)
- 선언형의 대가: 세밀한 절차 제어가 어렵고, 프레임워크 내부 동작 이해가 결국 필요하다
- 본질은 우열이 아니라 절차의 소유권을 누가 갖느냐의 선택이다

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [오버로딩 vs 오버라이딩, 이름만 닮은 두 개념 확실히 구분하기 (Swift 예제)](/%EC%98%A4%EB%B2%84%EB%A1%9C%EB%94%A9-vs-%EC%98%A4%EB%B2%84%EB%9D%BC%EC%9D%B4%EB%94%A9-%EC%9D%B4%EB%A6%84%EB%A7%8C-%EB%8B%AE%EC%9D%80-%EB%91%90-%EA%B0%9C%EB%85%90-%ED%99%95%EC%8B%A4%ED%9E%88-%EA%B5%AC%EB%B6%84%ED%95%98%EA%B8%B0-Swift-%EC%98%88%EC%A0%9C/)
- [라이브러리 vs 프레임워크, 기준은 '누가 누구를 호출하나' (제어의 역전)](/%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC-vs-%ED%94%84%EB%A0%88%EC%9E%84%EC%9B%8C%ED%81%AC-%EA%B8%B0%EC%A4%80%EC%9D%80-%EB%88%84%EA%B0%80-%EB%88%84%EA%B5%AC%EB%A5%BC-%ED%98%B8%EC%B6%9C%ED%95%98%EB%82%98-%EC%A0%9C%EC%96%B4%EC%9D%98-%EC%97%AD%EC%A0%84/)
<!-- /RELATED-POSTS -->
