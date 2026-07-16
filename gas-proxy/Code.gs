/**
 * Speaking Coach — Gemini API 프록시 (Google Apps Script 웹앱)
 *
 * 역할: 프론트(index.html)의 요청을 받아 Gemini API를 대신 호출.
 *       API 키는 Script Properties에만 존재 — 클라이언트에 절대 노출되지 않음.
 *
 * 배포 전 설정 (Apps Script 편집기):
 *   프로젝트 설정(⚙️) → Script Properties → 추가:
 *     GEMINI_KEY = (필수) Google AI Studio에서 발급한 키
 *     APP_TOKEN  = (선택) 아무 비밀 문자열. 설정하면 이 토큰 없는 요청 거부
 *
 * 배포: 배포 → 새 배포 → 웹 앱
 *   실행 계정: 나  /  액세스 권한: 모든 사용자
 *   → 생성된 /exec URL을 index.html 설정의 "GAS 웹앱 URL"에 입력
 */

// 프록시가 대행할 모델 화이트리스트 (URL 유출 시 비싼 모델 악용 방지)
var ALLOWED_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];

function doPost(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    var key = props.getProperty('GEMINI_KEY');
    if (!key) return jsonOut_({ error: { message: 'GEMINI_KEY가 Script Properties에 설정되지 않았습니다.' } });

    // 프론트는 preflight(OPTIONS) 회피를 위해 text/plain으로 JSON을 보냄
    var req = JSON.parse(e.postData.contents);

    // 접근 토큰 검사 (APP_TOKEN을 설정한 경우에만)
    var expected = props.getProperty('APP_TOKEN');
    if (expected && req.token !== expected) {
      return jsonOut_({ error: { message: '접근 토큰이 올바르지 않습니다.' } });
    }

    var model = ALLOWED_MODELS.indexOf(req.model) >= 0 ? req.model : ALLOWED_MODELS[0];
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent';

    var resp = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      headers: { 'x-goog-api-key': key },
      payload: JSON.stringify({
        systemInstruction: req.systemInstruction,
        contents: req.contents,
        generationConfig: req.generationConfig
      }),
      muteHttpExceptions: true
    });

    // Gemini 응답(성공/오류 JSON 모두)을 그대로 전달
    return ContentService.createTextOutput(resp.getContentText())
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return jsonOut_({ error: { message: '프록시 오류: ' + String(err) } });
  }
}

// 브라우저로 /exec를 직접 열었을 때 동작 확인용
function doGet() {
  return jsonOut_({ ok: true, service: 'speaking-coach-proxy' });
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
