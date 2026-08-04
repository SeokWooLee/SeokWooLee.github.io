---
title: "커맨드(Command) vs 메멘토(Memento), 실행취소(undo) 구현 두 가지 접근 총정리"
description: "실행취소(undo) 기능을 직접 만들어보려다 막힌 적 있으신가요?"
header:
  og_image: /assets/images/posts/7eba0a5d-40af-43aa-85f0-d49192f7765d/1.png
tags:
  - 커맨드패턴
  - 메멘토패턴
  - 디자인패턴
  - 실행취소
permalink: /커맨드Command-vs-메멘토Memento-실행취소undo-구현-두-가지-접근-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-08-04
---

실행취소(undo) 기능을 직접 만들어보려다 막힌 적 있으신가요?

Ctrl+Z 한 번이면 끝나는 흔한 기능인데, 막상 코드로 옮기면 은근히 골치 아픕니다. 그림판 비슷한 토이 프로젝트에서도 며칠씩 붙잡게 되는 구간이거든요.

결론부터 말씀드릴게요. undo 구현은 크게 두 갈래입니다.

하나는 했던 행동을 거꾸로 되돌리는 커맨드(Command) 패턴, 다른 하나는 행동 전 상태를 통째로 저장해두는 메멘토(Memento) 패턴이에요.

둘 다 정답입니다. 다만 언제 뭘 쓰느냐가 갈려요. 오늘은 이 둘을 코드까지 곁들여 비교해볼게요.

<figure>
  <img src="/assets/images/posts/7eba0a5d-40af-43aa-85f0-d49192f7765d/1.png" alt="커맨드랑 메멘토, undo 접근 방식부터 이렇게 갈립니다">
  <figcaption>커맨드랑 메멘토, undo 접근 방식부터 이렇게 갈립니다</figcaption>
</figure>

---

## 커맨드 패턴 — 행동을 객체로 포장하기

커맨드 패턴은 '무엇을 했는지'를 객체 하나에 담습니다.

실행(execute)과 되돌리기(undo)를 한 쌍으로 묶어둔 객체라고 보시면 돼요.

예를 들어 글자를 입력하는 행동이 있다면, 그 반대인 '입력한 만큼 지우기'를 같은 객체 안에 미리 정의해둡니다.

```swift
protocol Command {
    func execute()
    func undo()
}

struct TypeCommand: Command {
    let text: String
    let editor: Editor
    func execute() { editor.content += text }
    func undo() { editor.content.removeLast(text.count) }
}
```

이렇게 만든 커맨드 객체를 스택에 차곡차곡 쌓아둡니다.

그러다 Ctrl+Z가 들어오면? 맨 위 것을 꺼내 undo()만 호출하면 끝이에요.

> 커맨드 패턴이 저장하는 건 상태가 아니라 '행동'입니다.

---

## 메멘토 패턴 — 상태를 스냅샷으로 저장하기

메멘토는 접근이 완전히 다릅니다.

행동을 어떻게 되돌릴지 고민하는 대신, 그냥 바뀌기 직전 상태를 통째로 찍어둬요. 사진 찍듯이요.

```swift
struct Memento { let content: String }

class Editor {
    var content = ""
    func save() -> Memento { Memento(content: content) }
    func restore(_ m: Memento) { content = m.content }
}

let editor = Editor()
editor.content = "안녕"
let snapshot = editor.save()   // 여기서 스냅샷 저장
editor.content = "안녕하세요"
editor.restore(snapshot)
print(editor.content)
// 출력: 안녕
```

undo가 필요하면 저장해둔 스냅샷으로 상태를 갈아끼우면 됩니다. 그게 전부예요.

되돌리는 로직을 행동마다 일일이 짤 필요가 없어서 마음이 편합니다.

대신 단점도 분명해요. 상태가 크면 메모리를 꽤 먹습니다. 매번 통째로 복사해 들고 있으니까요.

<figure>
  <img src="/assets/images/posts/7eba0a5d-40af-43aa-85f0-d49192f7765d/2.png" alt="커맨드 객체를 스택에 쌓아두는 구조를 그림으로 보면 이래요" loading="lazy">
  <figcaption>커맨드 객체를 스택에 쌓아두는 구조를 그림으로 보면 이래요</figcaption>
</figure>

---

## 그래서 뭘 써야 할까?

제가 둘 다 굴려보고 느낀 차이를 표로 정리했습니다.

| 기준 | 커맨드 패턴 | 메멘토 패턴 |
|---|---|---|
| 저장 대상 | 행동(execute/undo) | 상태 스냅샷 |
| 메모리 | 가벼움 | 상태 크면 무거움 |
| undo 로직 | 행동마다 직접 구현 | 복원만 하면 끝 |
| redo | 스택 되밀기로 자연스러움 | 스냅샷 배열로 가능 |
| 잘 맞는 곳 | 편집기, 그래픽 툴 | 게임 세이브, 폼 상태 |

한 줄로 요약하면 이래요.

되돌리는 행동을 명확히 짤 수 있으면 커맨드, 상태를 통째로 찍는 게 마음 편하면 메멘토입니다.

<figure>
  <img src="/assets/images/posts/7eba0a5d-40af-43aa-85f0-d49192f7765d/3.png" alt="Ctrl+Z 하나 붙잡고 며칠 씨름했던 그 책상입니다" loading="lazy">
  <figcaption>Ctrl+Z 하나 붙잡고 며칠 씨름했던 그 책상입니다</figcaption>
</figure>

---

## 언제 쓰고 언제 피할까

실제로 고를 때는 이 기준을 봅니다.

- **행동 단위가 뚜렷하고 redo까지 필요하다** → 커맨드. 편집기나 드로잉 툴이 대표적이에요.
- **상태가 작고 스냅샷 복사가 부담 없다** → 메멘토. 폼 입력, 설정값 되돌리기 같은 곳이요.
- **상태가 거대한데 변경은 국소적이다** → 메멘토는 피하세요. 매번 통째로 복사하면 메모리가 터집니다. 커맨드가 낫습니다.
- **되돌리는 로직이 도저히 안 떠오른다** → 억지로 커맨드 쓰지 말고 메멘토로 스냅샷 저장이 깔끔합니다.

참고로 실무에선 둘을 섞기도 합니다. 커맨드로 행동을 관리하되 되돌리기 어려운 일부만 메멘토로 스냅샷을 남기는 식이에요.

---

### 면접에서는 이렇게 물어봅니다

**Q. 커맨드 패턴과 메멘토 패턴의 차이는 무엇인가요?**

커맨드는 '행동'을 객체로 캡슐화해 execute와 undo를 짝으로 갖습니다. 메멘토는 객체의 '상태'를 스냅샷으로 저장했다가 복원해요. 즉 되돌리는 방식이 행동 역연산이냐, 상태 복원이냐로 갈립니다.

**Q. undo 스택을 구현한다면 어떤 걸 고르겠어요?**

행동 단위가 명확하고 redo까지 자연스럽게 지원하고 싶으면 커맨드를 택합니다. 반대로 상태가 작고 되돌리는 로직을 짜기 번거로우면 메멘토로 스냅샷을 쌓는 편이 단순하고 안전합니다.

---

두 패턴 다 한 번씩 직접 구현해보시길 추천드려요. 개념만 읽을 때랑, 스택에 객체가 쌓이고 Ctrl+Z에 상태가 되돌아가는 걸 눈으로 볼 때랑은 이해의 깊이가 완전히 다르더라고요. 오늘 글이 그 첫 삽 뜨는 데 도움이 됐으면 좋겠습니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [전략 vs 템플릿 메서드 vs 커맨드(Strategy·Template Method·Command), 알고리즘 교체 3형제 총정리](/%EC%A0%84%EB%9E%B5-vs-%ED%85%9C%ED%94%8C%EB%A6%BF-%EB%A9%94%EC%84%9C%EB%93%9C-vs-%EC%BB%A4%EB%A7%A8%EB%93%9CStrategyTemplate-MethodCommand-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EA%B5%90%EC%B2%B4-3%ED%98%95%EC%A0%9C-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
- [Swift 메멘토 패턴(Memento Pattern) 완벽 정리 (실행취소 구현 예제)](/Swift-%EB%A9%94%EB%A9%98%ED%86%A0-%ED%8C%A8%ED%84%B4Memento-Pattern-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-%EC%8B%A4%ED%96%89%EC%B7%A8%EC%86%8C-%EA%B5%AC%ED%98%84-%EC%98%88%EC%A0%9C/)
- [Swift 커맨드 패턴(Command Pattern)으로 실행 취소(undo) 기능 만들기](/Swift-%EC%BB%A4%EB%A7%A8%EB%93%9C-%ED%8C%A8%ED%84%B4%EC%9C%BC%EB%A1%9C-%EC%8B%A4%ED%96%89-%EC%B7%A8%EC%86%8Cundo-%EA%B8%B0%EB%8A%A5-%EB%A7%8C%EB%93%A4%EA%B8%B0-%EB%BC%88%EB%8C%80-%EC%BD%94%EB%93%9C-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
<!-- /RELATED-POSTS -->
