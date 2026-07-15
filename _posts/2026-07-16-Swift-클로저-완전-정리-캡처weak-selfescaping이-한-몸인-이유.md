---
title: "Swift 클로저 완전 정리, 캡처·[weak self]·@escaping이 한 몸인 이유"
description: "Swift 코드에서 클로저는 공기 같은 존재입니다. 정렬 조건, 네트워크 완료 핸들러, 버튼 액션, SwiftUI의 body까지, 중괄호 블록을 넘기는 코드가 하루에도 수십 번 등장하죠. 그런데 정작 \"클로저가 값을 캡처한다는 게 정확히 무슨 뜻인가\", \"[weak self]는…"
header:
  og_image: /assets/images/posts/acbedb03-d119-4e28-b248-ff183d5af89c/1.png
tags:
  - Swift
  - 스위프트
  - 클로저
  - closure
  - 캡처리스트
  - weakself
  - escaping
  - 순환참조
  - iOS개발
  - 개발공부
permalink: /Swift-클로저-완전-정리-캡처weak-selfescaping이-한-몸인-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-16
---

🌐 **한국어** · [English](/en/Swift-%ED%81%B4%EB%A1%9C%EC%A0%80-%EC%99%84%EC%A0%84-%EC%A0%95%EB%A6%AC-%EC%BA%A1%EC%B2%98weak-selfescaping%EC%9D%B4-%ED%95%9C-%EB%AA%B8%EC%9D%B8-%EC%9D%B4%EC%9C%A0/) · [日本語](/ja/Swift-%ED%81%B4%EB%A1%9C%EC%A0%80-%EC%99%84%EC%A0%84-%EC%A0%95%EB%A6%AC-%EC%BA%A1%EC%B2%98weak-selfescaping%EC%9D%B4-%ED%95%9C-%EB%AA%B8%EC%9D%B8-%EC%9D%B4%EC%9C%A0/) · [中文](/zh/Swift-%ED%81%B4%EB%A1%9C%EC%A0%80-%EC%99%84%EC%A0%84-%EC%A0%95%EB%A6%AC-%EC%BA%A1%EC%B2%98weak-selfescaping%EC%9D%B4-%ED%95%9C-%EB%AA%B8%EC%9D%B8-%EC%9D%B4%EC%9C%A0/)
{: .notice--info}

Swift 코드에서 클로저는 공기 같은 존재입니다. 정렬 조건, 네트워크 완료 핸들러, 버튼 액션, SwiftUI의 body까지, 중괄호 블록을 넘기는 코드가 하루에도 수십 번 등장하죠. 그런데 정작 "클로저가 값을 캡처한다는 게 정확히 무슨 뜻인가", "[weak self]는 왜 쓰는가", "@escaping은 왜 붙는가"를 설명해보라고 하면 말문이 막히는 경우가 많습니다.

이 세 질문은 사실 한 몸입니다. 클로저가 주변 값을 붙잡는 방식(캡처)을 이해하면, 참조 타입인 이유도, 순환 참조가 생기는 이유도, escaping 표시가 필요한 이유도 연쇄적으로 풀려요. Swift 기초 시리즈 2편, 이번 글에서 그 연결 고리를 순서대로 짚습니다.

<figure>
  <img src="/assets/images/posts/acbedb03-d119-4e28-b248-ff183d5af89c/1.png" alt="클로저의 본질은 코드 블록이 아니라 바깥 변수를 붙잡는 캡처입니다">
  <figcaption>클로저의 본질은 코드 블록이 아니라 바깥 변수를 붙잡는 캡처입니다</figcaption>
</figure>

## 클로저란 — 이름보다 중요한 건 "잡는다"는 성질

문법부터 최소한으로 정리하고 갑니다. 클로저는 실행 코드 블록을 값처럼 다루는 문법입니다. 변수에 담고 인자로 넘기고 반환할 수 있어요.

```swift
let add: (Int, Int) -> Int = { a, b in a + b }
add(2, 3) // 5
```

사실 `func`로 선언하는 함수도 이름 있는 클로저입니다. Swift에서 함수와 클로저는 같은 족속이고, `{ }` 문법은 이름 없이 즉석에서 만드는 버전일 뿐이에요.

그런데 클로저(closure)라는 이름은 "코드 블록"이 아니라 다른 성질에서 왔습니다. 주변 변수를 감싸 닫는다(close over)는 성질입니다.

```swift
func makeCounter() -> () -> Int {
    var count = 0
    return {
        count += 1
        return count
    }
}

let counter = makeCounter()
counter() // 1
counter() // 2
counter() // 3
```

이상한 일이 벌어지고 있습니다. `count`는 makeCounter의 지역 변수라 함수가 반환되면 사라져야 하는데, 반환된 클로저를 부를 때마다 계속 자라나요. 클로저가 자기 몸 밖의 변수 `count`를 캡처해서, 함수가 끝난 뒤에도 살려둔 겁니다. 이게 클로저의 본질이고 이 글의 나머지 전부가 이 캡처의 파생 이야기입니다.

## 캡처의 정확한 의미 — 복사가 아니라 참조

Swift 클로저의 기본 캡처 방식은 참조입니다. 값을 복사해 가는 게 아니라, 그 변수 자체와 연결을 유지해요. 그래서 이런 결과가 나옵니다.

```swift
var multiplier = 2
let times = { (n: Int) in n * multiplier }

times(10)      // 20
multiplier = 3
times(10)      // 30 — 클로저가 바뀐 값을 본다
```

클로저를 만든 시점의 multiplier(2)가 아니라, 실행 시점의 multiplier(3)가 쓰였죠. 클로저는 변수의 스냅숏이 아니라 변수 그 자체를 들고 다닙니다.

만드는 시점의 값을 고정하고 싶다면 캡처 리스트를 씁니다.

```swift
let times = { [multiplier] (n: Int) in n * multiplier }

times(10)      // 20
multiplier = 3
times(10)      // 20 — 만든 시점의 2로 고정
```

대괄호 안에 적은 변수는 클로저 생성 시점에 복사되어 클로저 안에 상수로 박제됩니다. 정리하면 이렇습니다. 기본은 참조 캡처(살아 있는 연결), 캡처 리스트는 값 캡처(생성 시점 스냅숏). [weak self]를 설명하기 전에 이 구분이 먼저 서야 해요.

그리고 이 캡처 저장소 때문에 클로저는 참조 타입입니다. 캡처된 변수들은 클로저와 수명을 같이해야 하니 힙에 저장되고, 클로저 값을 복사하면 그 저장소를 공유하는 참조가 하나 늘어나는 구조예요. struct 중심의 Swift에서 클로저가 클래스처럼 행동하는 이유입니다. 값 타입과 참조 타입의 구분이 낯설다면 값 타입 우선주의 편을 먼저 읽고 오시면 좋습니다.

<figure>
  <img src="/assets/images/posts/acbedb03-d119-4e28-b248-ff183d5af89c/2.png" alt="기본 캡처는 살아 있는 연결, 캡처 리스트는 생성 시점의 스냅숏">
  <figcaption>기본 캡처는 살아 있는 연결, 캡처 리스트는 생성 시점의 스냅숏</figcaption>
</figure>

## 순환 참조와 [weak self] — 캡처가 만드는 대표 사고

참조 캡처의 대가가 바로 순환 참조입니다. 구도는 늘 같습니다.

```swift
class ProfileViewModel {
    var onUpdate: (() -> Void)?
    var name = ""

    func bind() {
        onUpdate = {
            print("이름: \(self.name)")
        }
    }
}
```

뷰모델은 프로퍼티 onUpdate로 클로저를 강하게 소유합니다. 그런데 그 클로저는 self, 그러니까 뷰모델을 참조 캡처하고 있어요. 뷰모델 → 클로저 → 뷰모델로 소유의 고리가 닫혔고 ARC 세상에서 이 둘은 서로를 붙잡은 채 영원히 해제되지 않습니다. 화면을 닫아도 뷰모델이 메모리에 남는 누수가 완성된 거죠.

해법이 캡처 리스트의 두 번째 용법입니다. `[weak self]`는 self를 약한 참조로 캡처하라는 지시예요. 클로저가 self를 붙잡되 소유하지는 않으니 고리가 끊어집니다. 대신 self가 먼저 해제될 수 있으므로 클로저 안에서 self는 옵셔널이 되고 보통 `guard let self else { return }`으로 시작하게 됩니다. 옵셔널 편에서 본 조기 탈출 패턴이 여기서 다시 나오는 겁니다.

```swift
onUpdate = { [weak self] in
    guard let self else { return }
    print("이름: \(self.name)")
}
```

중요한 건 [weak self]가 만능 접두사가 아니라는 점입니다. 순환의 조건은 "self가 클로저를 소유하고, 그 클로저가 self를 캡처"하는 것. 이 조건이 없으면 weak도 필요 없습니다. 예컨대 `DispatchQueue.main.asyncAfter`에 넘기는 클로저는 실행 후 시스템이 버리므로, self가 잠깐 더 살아 있을 뿐 누수는 아닙니다. 반사적으로 weak를 붙이는 대신 "이 클로저를 누가 얼마나 오래 소유하나"를 묻는 게 정확한 습관이에요. NSTimer처럼 소유 구조가 특이해서 유명해진 사례는 별도 글에서 다뤘습니다.

## @escaping — 클로저가 함수보다 오래 살 때

마지막 퍼즐 조각입니다. 함수 파라미터로 받는 클로저에는 가끔 @escaping이 붙습니다.

```swift
func fetchUser(completion: @escaping (User) -> Void) {
    URLSession.shared.dataTask(with: url) { data, _, _ in
        let user = parse(data)
        completion(user)   // 함수가 반환된 한참 뒤에 실행됨
    }.resume()
}
```

구분 기준은 실행 시점입니다. 함수가 반환되기 전에 안에서 다 실행하고 버리는 클로저는 non-escaping(기본값)이고, 프로퍼티에 저장하거나 비동기 작업에 넘겨서 함수 반환 후에 실행될 수 있으면 escaping, 즉 함수 밖으로 탈출하는 클로저입니다.

왜 구분을 강제할까요. 탈출 여부에 따라 컴파일러와 개발자 양쪽의 셈법이 달라지기 때문입니다. non-escaping은 함수 실행 동안만 살아 있음이 보장되므로 컴파일러가 캡처 저장을 최적화할 수 있고 순환 참조 걱정도 원천적으로 없습니다. map이나 filter에 넘기는 클로저에서 self를 신경 안 쓰는 게 그래서 가능해요. 반면 escaping은 클로저가 어딘가에 저장되어 오래 산다는 뜻이라, 위에서 본 순환 참조 검토가 필요한 후보가 됩니다. @escaping 표시는 "이 클로저는 오래 살아남으니 캡처를 신경 쓰라"는 API 차원의 경고 라벨인 셈입니다.

참고로 completion 핸들러 스타일의 escaping 클로저는 async/await가 도입되면서 새 코드에서는 줄어드는 추세지만 기존 API를 읽고 브리징하려면 여전히 정확히 이해해야 하는 개념입니다.

<figure>
  <img src="/assets/images/posts/acbedb03-d119-4e28-b248-ff183d5af89c/3.png" alt="서로를 붙잡은 고리를 weak가 끊습니다">
  <figcaption>서로를 붙잡은 고리를 weak가 끊습니다</figcaption>
</figure>

## 손에 익히는 세 가지 기준

이론을 실무 기준으로 압축하면 세 개입니다.

**첫째, 클로저를 보면 수명부터 묻습니다.** 이 클로저는 함수 안에서 소비되고 끝나는가(non-escaping), 어딘가 저장되어 오래 사는가(escaping). 이 질문 하나로 캡처를 얼마나 신경 쓸지가 정해집니다.

**둘째, weak는 반사가 아니라 판단으로 씁니다.** 소유 고리가 실제로 닫히는 자리(프로퍼티로 저장하는 핸들러, 델리게이트성 콜백)에는 [weak self], 고리가 없는 일회성 실행에는 불필요. 판단이 애매하면 Instruments의 Leaks나 deinit 로그로 확인하는 습관이 답입니다.

**셋째, 캡처 리스트로 의도를 문서화합니다.** 값을 고정하고 싶으면 [value], 소유하지 않겠다면 [weak self]. 캡처 리스트는 성능 장치이기 전에 "이 클로저가 바깥 세계와 어떻게 연결되는가"를 코드에 명시하는 문서입니다.

## 정리

- 클로저의 본질은 코드 블록이 아니라 캡처, 즉 주변 변수를 감싸 닫아 수명을 연장하는 성질입니다.
- 기본 캡처는 복사가 아니라 참조라서 클로저는 실행 시점의 값을 보고, 캡처 리스트 [x]는 생성 시점 값으로 고정합니다.
- 캡처 저장소를 공유해야 하므로 클로저는 참조 타입입니다.
- self가 소유한 클로저가 self를 캡처하면 순환 참조가 되고, [weak self] + guard let self가 표준 해법입니다. 단 소유 고리가 없으면 weak도 불필요합니다.
- @escaping은 "함수보다 오래 사는 클로저"라는 경고 라벨로, 캡처 검토가 필요한 지점을 표시해줍니다.

다음 편에서는 저장 프로퍼티와 연산 프로퍼티, lazy, 프로퍼티 옵저버까지, 변수 선언 한 줄에 숨은 선택지들을 정리합니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 전략 패턴 완벽 정리 (프로토콜·클로저로 알고리즘 갈아끼우기)](/Swift-%EC%A0%84%EB%9E%B5-%ED%8C%A8%ED%84%B4-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%ED%81%B4%EB%A1%9C%EC%A0%80%EB%A1%9C-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EA%B0%88%EC%95%84%EB%81%BC%EC%9A%B0%EA%B8%B0/)
- [Swift 탄생 배경, 크리스 래트너는 왜 Objective-C를 버렸을까](/Swift-%ED%83%84%EC%83%9D-%EB%B0%B0%EA%B2%BD-%ED%81%AC%EB%A6%AC%EC%8A%A4-%EB%9E%98%ED%8A%B8%EB%84%88%EB%8A%94-%EC%99%9C-Objective-C%EB%A5%BC-%EB%B2%84%EB%A0%B8%EC%9D%84%EA%B9%8C/)
- [Swift 모노스테이트 패턴, 싱글톤의 대안이 될 수 있을까 (실전 정리)](/Swift-%EB%AA%A8%EB%85%B8%EC%8A%A4%ED%85%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%8B%B1%EA%B8%80%ED%86%A4%EC%9D%98-%EB%8C%80%EC%95%88%EC%9D%B4-%EB%90%A0-%EC%88%98-%EC%9E%88%EC%9D%84%EA%B9%8C-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/)
<!-- /RELATED-POSTS -->
