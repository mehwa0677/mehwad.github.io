# [BRAND] 홍보 웹사이트

정적 HTML/CSS/JS 사이트입니다. 빌드 과정 없이 GitHub Pages에 바로 올릴 수 있습니다.

## 폴더 구조

```
brand-site/
├── index.html
├── css/style.css
├── js/main.js
└── images/          ← 이미지를 여기에 넣으세요
```

## 이미지 넣기

아래 파일명으로 `images/` 폴더에 넣으면 자동으로 표시됩니다. 파일이 없으면 플레이스홀더가 보입니다.

| 파일명 | 위치 | 권장 비율 |
|---|---|---|
| hero.jpg | 첫 화면 | 4:5 |
| story.jpg | 브랜드 스토리 | 3:4 |
| logo.png | 상단·하단 로고 (밝은 색, 투명 배경) | 가로형 |
| member-01.jpg ~ member-05.jpg | SCENTS 멤버 사진 (WONI·MINAMI·LIV·MAY·ZENA 순) | 4:5 |
| album-01.jpg ~ album-16.jpg | ALBUM 커버 | 1:1 |
| quote-bg.jpg | 인용문 배경 | 16:9 |
| intro.mp4 | 대문 동영상 (MP4, 25MB 이하 권장) | 16:9 |
| intro-poster.jpg | 대문 동영상 로딩 전 이미지 (선택) | 16:9 |

## GitHub Pages 배포

1. GitHub에서 새 저장소 생성 (예: `brand-site`)
2. 이 폴더의 파일을 모두 업로드 (`index.html`이 저장소 최상단에 있어야 함)
3. 저장소 **Settings → Pages**
4. **Source: Deploy from a branch**, Branch: `main` / `/ (root)` → **Save**
5. 1~2분 뒤 `https://<아이디>.github.io/brand-site/` 에서 확인

## 수정 포인트

- **포인트 색상**: `css/style.css` 상단 `--accent`
- **텍스트**: `index.html`의 `[대괄호]` 부분
- **이메일 폼**: 현재는 데모입니다. 실제 수신이 필요하면 [Formspree](https://formspree.io) 등을 연결하세요.

## 멤버 상세 페이지

- SCENTS의 멤버 사진을 누르면 `member.html?id=멤버아이디` 로 이동합니다.
- 상세 페이지 프로필 표(본명·출생·MBTI·소개·유행어)은 **`js/members.js`** 한 파일에서 수정합니다.
- 사진은 메인과 같은 `member-01.jpg` ~ `member-05.jpg`를 사용합니다.
