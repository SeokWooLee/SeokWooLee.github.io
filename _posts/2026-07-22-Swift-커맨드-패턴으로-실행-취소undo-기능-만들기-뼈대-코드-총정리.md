---
title: "Swift 커맨드 패턴(Command Pattern)으로 실행 취소(undo) 기능 만들기"
description: "앱을 만들다 보면 \"실행 취소 버튼 하나만 넣어달라\"는 요청이 생각보다 자주 들어옵니다."
header:
  og_image: /assets/images/posts/787c2654-92c6-4fec-a0b2-49a3558c53b7/1.png
tags:
  - Swift
  - 커맨드패턴
  - 디자인패턴
  - undo기능
permalink: /Swift-커맨드-패턴으로-실행-취소undo-기능-만들기-뼈대-코드-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-22
---

앱을 만들다 보면 "실행 취소 버튼 하나만 넣어달라"는 요청이 생각보다 자주 들어옵니다.

막상 undo를 붙이려 하면 코드가 스파게티가 되기 쉽습니다. 버튼 하나 때문에 삭제·이동·수정 로직 곳곳에 되돌리기 코드를 흩뿌리게 되거든요.

이걸 정리해주는 게 바로 **Swift 커맨드 패턴**입니다.

이 글에서는 커맨드 패턴이 왜 실행 취소 기능의 뼈대가 되는지, 실제로 쓰는 최소 코드 골격까지 짚어 드릴게요. 복잡한 이론보다 "당장 프로젝트에 붙일 수 있는 형태"에 초점을 맞췄습니다.

<figure>
  <img src="/assets/images/posts/787c2654-92c6-4fec-a0b2-49a3558c53b7/1.png" alt="Swift 커맨드 패턴, execute와 undo를 한 짝으로 묶는 게 핵심이에요">
  <figcaption>Swift 커맨드 패턴, execute와 undo를 한 짝으로 묶는 게 핵심이에요</figcaption>
</figure>

## 커맨드 패턴이 뭔가요? 한 줄 정리

먼저 한마디로 정리해볼게요.

> 커맨드 패턴은 "무엇을 한다"는 동작 자체를 객체로 포장해서, 실행과 취소를 하나의 단위로 묶는 설계 방식입니다.

버튼을 눌렀을 때 곧바로 로직을 실행하는 대신, "이 동작을 하라"는 명령서(Command 객체)를 하나 만듭니다.

그 명령서 안에는 실행하는 방법(execute)과 되돌리는 방법(undo)이 함께 들어 있어요.

정리하면 이렇습니다.

1. 동작을 객체로 만든다 — 삭제, 이동, 입력이 각각 하나의 커맨드
2. 각 커맨드는 execute()와 undo()를 짝으로 가진다
3. 실행한 커맨드를 스택에 쌓아둔다
4. 실행 취소는 스택에서 하나 꺼내 undo()를 부르면 끝

이 구조 덕분에 되돌리기 로직이 여기저기 흩어지지 않고 각 커맨드 안에 딱 붙어 있게 됩니다.

---

## Swift로 커맨드 프로토콜부터 만들어봅시다

가장 먼저 모든 명령서가 지켜야 할 약속, 즉 프로토콜을 정의합니다.

아래는 실행과 취소를 강제하는 최소 뼈대예요.

```swift
protocol Command {
    func execute()   // 동작 실행
    func undo()      // 실행 취소
}
```

이 두 메서드만 있으면 됩니다.

이제 실제 동작을 담을 구체 커맨드를 하나 만들어볼게요. 예를 들어 텍스트를 추가하는 명령입니다.

아래 코드는 "글자를 붙였다가, 취소하면 다시 떼어내는" 커맨드입니다.

```swift
final class AddTextCommand: Command {
    private let document: Document
    private let text: String

    init(document: Document, text: String) {
        self.document = document
        self.text = text
    }

    func execute() { document.content += text }
    func undo()    { document.content.removeLast(text.count) }
}
```

execute는 글자를 붙이고, undo는 붙인 만큼 다시 떼어냅니다. 실행과 취소가 한 객체 안에 붙어 있다는 게 이 패턴의 전부예요.

<figure>
  <img src="/assets/images/posts/787c2654-92c6-4fec-a0b2-49a3558c53b7/2.png" alt="protocol Command 딱 두 줄에서 시작하면 됩니다" loading="lazy">
  <figcaption>protocol Command 딱 두 줄에서 시작하면 됩니다</figcaption>
</figure>

---

## 실행 취소의 핵심은 스택입니다

커맨드를 만들었다면, 이걸 관리해줄 "관리자"가 필요합니다. 흔히 Invoker라고 부르는 역할이에요.

관리자는 실행한 커맨드를 스택(stack)에 차곡차곡 쌓습니다.

실행 취소를 누르면 가장 최근에 쌓인 커맨드를 꺼내 undo()를 부르면 되죠. 나중에 한 일을 먼저 되돌리는 것, 이게 바로 실행 취소의 자연스러운 순서입니다.

아래는 그 관리자 골격입니다.

```swift
final class CommandManager {
    private var undoStack: [Command] = []

    func run(_ command: Command) {
        command.execute()
        undoStack.append(command)   // 실행 후 스택에 저장
    }

    func undo() {
        guard let last = undoStack.popLast() else { return }
        last.undo()                 // 마지막 것부터 되돌리기
    }
}
```

이제 사용법은 아주 단순해집니다.

buttonTapped에서 manager.run(command)를 부르고, 실행 취소 버튼에서 manager.undo()만 부르면 돼요.

되돌리기 순서나 스택 관리는 CommandManager가 알아서 처리하니, 화면 코드는 깔끔하게 유지됩니다.

<figure>
  <img src="/assets/images/posts/787c2654-92c6-4fec-a0b2-49a3558c53b7/4-1783847803003.png" alt="커맨드 세 조각이 이렇게 엮여 있습니다" loading="lazy">
  <figcaption>커맨드 세 조각이 이렇게 엮여 있습니다</figcaption>
</figure>

만약 다시 실행(redo)까지 필요하다면 undo한 커맨드를 redoStack에 따로 담아두면 됩니다. 구조가 대칭이라 확장이 어렵지 않아요.

---

## 커맨드 패턴, 언제 쓰고 언제 피할까요?

커맨드 패턴도 만능은 아닙니다. 어디에 맞고 어디엔 과한지 표로 정리해봤어요.

| 상황 | 커맨드 패턴 |
|---|---|
| 실행 취소·다시 실행이 필요 | 아주 적합 |
| 작업 기록(히스토리)을 남겨야 함 | 적합 |
| 동작을 큐에 넣고 나중에 실행 | 적합 |
| 되돌릴 일 없는 단순 버튼 하나 | 과함, 그냥 함수로 |

커맨드 패턴이 빛을 보는 건 "되돌리기"나 "기록"이 필요한 순간입니다. 그림판, 텍스트 에디터, 결제 취소, 게임의 되돌리기 같은 기능이 대표적이에요.

반대로 단순히 화면을 이동하는 버튼 하나에 커맨드 패턴을 붙이면 오히려 코드만 늘어납니다.

모든 버튼을 커맨드로 만들면 파일만 잔뜩 늘어나기 쉬우니, 되돌릴 필요가 있는 동작에만 적용하는 게 좋습니다.

<figure>
  <img src="/assets/images/posts/787c2654-92c6-4fec-a0b2-49a3558c53b7/3.png" alt="제일 위 카드부터 하나씩 꺼내 되돌리는 구조예요" loading="lazy">
  <figcaption>제일 위 카드부터 하나씩 꺼내 되돌리는 구조예요</figcaption>
</figure>

---

## 마무리

실행 취소 기능은 막상 붙이려면 막막하지만 커맨드 패턴이라는 뼈대 하나만 잡아두면 생각보다 깔끔하게 굴러갑니다.

오늘 정리한 프로토콜·구체 커맨드·매니저 세 조각을 작은 화면에 먼저 붙여보세요. 구조가 손에 익으면 redo나 히스토리 확장도 자연스럽게 따라올 거예요. 여러분 앱에도 되돌리기 버튼 하나 자신 있게 달아보세요.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 플라이웨이트 패턴 완벽 정리 (객체 공유로 메모리 아끼는 법)](/Swift-%ED%94%8C%EB%9D%BC%EC%9D%B4%EC%9B%A8%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-%EA%B0%9D%EC%B2%B4-%EA%B3%B5%EC%9C%A0%EB%A1%9C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EC%95%84%EB%81%BC%EB%8A%94-%EB%B2%95/)
- [Swift 브릿지 패턴, 서브클래스 폭발 막는 추상화 분리 (예제 총정리)](/Swift-%EB%B8%8C%EB%A6%BF%EC%A7%80-%ED%8C%A8%ED%84%B4-%EC%84%9C%EB%B8%8C%ED%81%B4%EB%9E%98%EC%8A%A4-%ED%8F%AD%EB%B0%9C-%EB%A7%89%EB%8A%94-%EC%B6%94%EC%83%81%ED%99%94-%EB%B6%84%EB%A6%AC-%EC%98%88%EC%A0%9C-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
- [Swift 프록시 패턴 완전정복, lazy 뒤에 숨은 대리인 객체 (예제 총정리)](/Swift-%ED%94%84%EB%A1%9D%EC%8B%9C-%ED%8C%A8%ED%84%B4-%EC%99%84%EC%A0%84%EC%A0%95%EB%B3%B5-lazy-%EB%92%A4%EC%97%90-%EC%88%A8%EC%9D%80-%EB%8C%80%EB%A6%AC%EC%9D%B8-%EA%B0%9D%EC%B2%B4-%EC%98%88%EC%A0%9C-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
<!-- /RELATED-POSTS -->
