# Speaking Coach — AI 영어 스피킹 웹앱

서버 없이 도는 단일 HTML 영어회화 연습 앱.
브라우저 STT/TTS(무료) + Gemini 무료 등급으로 **추가 비용 0원**.

## 파일 구성

| 파일 | 역할 |
|---|---|
| `index.html` | 앱 본체 (Chrome에서 열면 바로 작동) |
| `gas-proxy/Code.gs` | (선택) Gemini API 프록시 — API 키를 GAS에 은닉 |

## 연결 방식 2가지

### ① 직접 연결 — 가장 간단 (내 PC 전용)
1. 무료 키 발급: https://aistudio.google.com/apikey (카드 불필요)
2. `index.html`을 **Chrome**으로 열기
3. ⚙️ 설정 → 연결 방식 "직접 연결" → 키 붙여넣고 저장

키는 이 브라우저의 localStorage에만 저장된다.

### ② GAS 프록시 — 키 은닉 + 폰에서도 사용
GAS 웹앱은 iframe이 마이크를 차단하므로 **프론트를 GAS에 올리는 것이 아니라**,
GAS는 API 호출 대행(프록시)만 맡고 index.html은 밖(로컬/GitHub Pages)에서 연다.

**GAS 배포 (1회):**
1. https://script.google.com → 새 프로젝트 → `gas-proxy/Code.gs` 내용 붙여넣기
2. 좌측 ⚙️ 프로젝트 설정 → **Script Properties** 추가:
   - `GEMINI_KEY` = 발급받은 Gemini API 키 (필수)
   - `APP_TOKEN` = 아무 비밀 문자열 (선택 — URL 유출 대비 잠금)
3. 배포 → **새 배포** → 유형: **웹 앱**
   - 실행 계정: **나** / 액세스 권한: **모든 사용자**
4. 생성된 `https://script.google.com/macros/s/…/exec` URL 복사
   - 브라우저로 열어 `{"ok":true,…}` 나오면 정상

**앱 연결:**
- index.html ⚙️ 설정 → 연결 방식 "GAS 프록시" → /exec URL 입력
  (APP_TOKEN 설정했으면 접근 토큰도 동일하게 입력)

**폰에서 쓰려면:** index.html을 GitHub Pages 등 https 정적 호스팅에 올리고
폰 Chrome으로 접속 (마이크는 https 필수. GAS 프록시 모드면 키 노출 없음).

## 배포 정보
개인 배포 URL·스크립트 ID 등은 `DEPLOY_PRIVATE.md`(git 미추적)에 별도 보관.
프록시 /exec URL은 공개 저장소에 절대 커밋하지 말 것 — 유출 시 무료 할당량 도용 가능.

## 주의사항
- 음성인식(마이크)은 Chrome/Edge에서만 동작. 미지원 브라우저는 텍스트 입력으로 연습 가능
- Gemini 무료 등급: 하루 1,500회 요청(2.5 Flash 기준), 입력이 구글 모델 학습에 사용될 수 있음
- Code.gs를 수정하면 배포 → 배포 관리 → 새 버전으로 재배포해야 반영됨
- 발음 점수는 브라우저 인식 신뢰도 기반 근사치 (정밀 음소 평가는 Azure Pronunciation API 연동 시)
