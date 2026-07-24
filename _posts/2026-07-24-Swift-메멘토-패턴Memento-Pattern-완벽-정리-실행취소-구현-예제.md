---
title: "Swift 메멘토 패턴(Memento Pattern) 완벽 정리 (실행취소 구현 예제)"
description: "iOS 앱에서 '실행 취소' 버튼을 만들다가 벽에 부딪힌 적 있으신가요?"
header:
  og_image: /assets/images/posts/e4e5fbf7-c08e-4647-9a6e-d432f2aabb4d/1.png
tags:
  - Swift
  - 메멘토패턴
  - 디자인패턴
  - iOS개발
permalink: /Swift-메멘토-패턴Memento-Pattern-완벽-정리-실행취소-구현-예제/
toc: true
toc_sticky: true
last_modified_at: 2026-07-24
---

iOS 앱에서 '실행 취소' 버튼을 만들다가 벽에 부딪힌 적 있으신가요?

텍스트 에디터 앱에서 사용자가 방금 한 편집을 되돌리려면, 이전 상태를 어떻게 붙잡아 둬야 할지부터 고민이 되죠.

객체 내부 프로퍼티를 여기저기서 백업하다 보면 코드가 금세 지저분해집니다.

이럴 때 딱 맞는 게 바로 **Swift 메멘토 패턴**이에요. 오늘은 이 패턴으로 객체 상태를 어떻게 우아하게 저장하고 복원하는지, 제가 직접 써본 경험을 코드와 함께 풀어볼게요.

> 메멘토 패턴은 객체의 내부 상태를 캡슐화를 깨지 않고 외부에 저장해 뒀다가, 나중에 그 상태로 되돌리는 디자인 패턴입니다.

한 줄로 말하면 '스냅샷 찍어두기'예요. 실행 취소(Undo), 게임 세이브, 폼 임시저장 같은 기능의 밑바탕이 되죠.

<figure>
  <img src="/assets/images/posts/e4e5fbf7-c08e-4647-9a6e-d432f2aabb4d/1.png" alt="Swift 메멘토 패턴, 저장과 복원 딱 두 동작이 핵심이에요">
  <figcaption>Swift 메멘토 패턴, 저장과 복원 딱 두 동작이 핵심이에요</figcaption>
</figure>

---

## 메멘토 패턴이란? 세 가지 역할부터 🧩

메멘토 패턴은 등장인물이 딱 셋입니다. 여기만 이해하면 절반은 끝나요.

- **Originator(원본 객체)**: 상태를 가진 주인공. 자기 상태를 메멘토로 저장하고, 메멘토를 받아 복원합니다.
- **Memento(메멘토)**: 특정 시점의 상태를 담은 스냅샷. 한 번 만들어지면 내용이 바뀌지 않는 게 이상적입니다.
- **Caretaker(관리자)**: 메멘토들을 보관하는 역할. 대개 실행 취소 스택이 여기에 해당해요.

핵심은 관리자가 메멘토 '속'을 들여다보지 않는다는 거예요.

관리자는 그냥 스냅샷을 받아 쌓아두고, 필요할 때 다시 건네줄 뿐입니다. 원본 객체의 내부 구조는 원본만 알고 있죠.

덕분에 캡슐화가 깨지지 않아요. 이게 메멘토 패턴의 가장 큰 매력입니다.

---

## Swift로 메멘토 패턴 어떻게 구현하나요?

간단한 텍스트 편집기를 예로 들어볼게요. 먼저 메멘토와 원본 객체를 정의합니다.

아래는 상태를 담는 메멘토와, 그 메멘토를 만들고 되돌리는 원본 객체예요.

```swift
// 상태 스냅샷 — 한번 만들면 바뀌지 않도록 let으로
struct EditorMemento {
    let text: String
}

final class TextEditor {
    var text: String = ""
    func save() -> EditorMemento { EditorMemento(text: text) }   // 저장
    func restore(_ memento: EditorMemento) { text = memento.text } // 복원
}
```

`save()`는 현재 상태를 스냅샷으로 떠주고, `restore(_:)`는 받은 스냅샷으로 되돌립니다.

포인트는 `EditorMemento`의 프로퍼티를 `let`으로 둔 거예요. 저장한 시점의 상태가 나중에 훼손되지 않도록요.

<figure>
  <img src="/assets/images/posts/e4e5fbf7-c08e-4647-9a6e-d432f2aabb4d/2.png" alt="save와 restore만 나눠놔도 코드가 이만큼 깔끔해집니다" loading="lazy">
  <figcaption>save와 restore만 나눠놔도 코드가 이만큼 깔끔해집니다</figcaption>
</figure>

---

## 실전: 실행 취소(Undo) 기능 만들기 ⏪

이제 관리자, 즉 실행 취소 스택을 붙여볼게요. 앞서 만든 메멘토를 차곡차곡 쌓아두는 역할입니다.

```swift
final class UndoManager {
    private var history: [EditorMemento] = []
    func backup(_ memento: EditorMemento) { history.append(memento) }
    func undo() -> EditorMemento? { history.popLast() } // 가장 최근 상태 꺼내기
}
```

실제 흐름은 이렇게 흘러갑니다.

<figure>
  <img src="/assets/images/posts/e4e5fbf7-c08e-4647-9a6e-d432f2aabb4d/4-1783847825469.png" alt="저장하고 되돌리는 흐름을 그림으로 보면 이래요" loading="lazy">
  <figcaption>저장하고 되돌리는 흐름을 그림으로 보면 이래요</figcaption>
</figure>

사용자가 글을 고치기 직전에 `backup`으로 현재 상태를 저장해 둡니다.

그리고 '되돌리기'를 누르면 `undo`가 마지막 스냅샷을 꺼내주고, 원본 객체가 그걸로 `restore` 하는 거죠.

실제로 붙여보니 편집 로직과 저장 로직이 딱 갈라져서 코드가 한결 깔끔해지더라고요.

특히 여러 종류의 편집(글자 추가, 삭제, 서식 변경)이 섞여도 저장하는 방식은 하나로 통일돼서 유지보수가 편했어요.

<figure>
  <img src="/assets/images/posts/e4e5fbf7-c08e-4647-9a6e-d432f2aabb4d/3.png" alt="되돌리기 버튼 하나가 이 패턴 위에서 돌아가고 있어요" loading="lazy">
  <figcaption>되돌리기 버튼 하나가 이 패턴 위에서 돌아가고 있어요</figcaption>
</figure>

---

## Swift답게 쓰는 팁: Codable과 struct 활용

메멘토 패턴은 원래 자바 같은 언어를 기준으로 설명하는 글이 많아요. 그런데 Swift에서는 언어 특성을 살리면 훨씬 편해집니다.

첫째, 메멘토는 `class`보다 `struct`가 잘 어울려요. 값 타입이라 복사되는 순간 독립적인 스냅샷이 되거든요. 참조가 얽혀서 원본이 바뀔 걱정이 줄어듭니다.

둘째, 메멘토에 `Codable`을 채택하면 상태를 파일이나 UserDefaults에 저장하기 쉬워요. 앱을 껐다 켜도 유지되는 세이브 기능으로 확장할 수 있죠.

셋째, UIKit을 쓴다면 이미 `UndoManager`라는 시스템 클래스가 있으니 그것부터 살펴보시는 걸 추천해요. 직접 구현하기 전에 표준 도구를 아는 게 순서니까요.

---

### 자주 묻는 질문 (Q&A)

**Q. 그냥 변수에 백업해두면 안 되나요?**

간단한 경우엔 됩니다. 다만 상태가 여러 개거나 저장/복원 로직이 복잡해지면, 흩어진 백업 코드가 버그의 온상이 돼요. 메멘토 패턴은 이걸 한곳에 모아줍니다.

**Q. 메모리를 너무 많이 쓰지 않을까요?**

맞아요. 스냅샷을 무한정 쌓으면 메모리 부담이 커집니다. 그래서 실무에선 히스토리 개수를 20~50개 정도로 제한하거나, 변경된 부분만 저장하는 식으로 최적화하는 경우가 많습니다.

---

메멘토 패턴은 이름만 낯설 뿐, 알고 보면 '스냅샷 찍고 되돌리기'라는 단순한 아이디어예요.

실행 취소나 임시저장 기능을 고민 중이시라면 오늘 예제 코드부터 한번 따라 쳐보세요. 캡슐화를 지키면서 상태를 다루는 감각이 확 잡히실 거예요. 응원할게요! 😊

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 템플릿 메서드 패턴(Template Method), 프로토콜 extension으로 뼈대 잡기](/Swift-%ED%85%9C%ED%94%8C%EB%A6%BF-%EB%A9%94%EC%84%9C%EB%93%9C-%ED%8C%A8%ED%84%B4Template-Method-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C-extension%EC%9C%BC%EB%A1%9C-%EB%BC%88%EB%8C%80-%EC%9E%A1%EA%B8%B0/)
- [Swift 퍼사드 패턴(Facade Pattern), 복잡한 서브시스템을 메서드 하나로 감추기](/Swift-%ED%8D%BC%EC%82%AC%EB%93%9C-%ED%8C%A8%ED%84%B4Facade-Pattern-%EB%B3%B5%EC%9E%A1%ED%95%9C-%EC%84%9C%EB%B8%8C%EC%8B%9C%EC%8A%A4%ED%85%9C%EC%9D%84-%EB%A9%94%EC%84%9C%EB%93%9C-%ED%95%98%EB%82%98%EB%A1%9C-%EA%B0%90%EC%B6%94%EA%B8%B0/)
- [Swift 플라이웨이트 패턴(Flyweight Pattern), 객체 공유로 메모리 아끼는 법](/Swift-%ED%94%8C%EB%9D%BC%EC%9D%B4%EC%9B%A8%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-%EA%B0%9D%EC%B2%B4-%EA%B3%B5%EC%9C%A0%EB%A1%9C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EC%95%84%EB%81%BC%EB%8A%94-%EB%B2%95/)
<!-- /RELATED-POSTS -->
