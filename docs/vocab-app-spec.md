# 단어장(Vocabulary) 웹앱 개발 문서

## 1. 개요

영어 단어와 한국어 뜻을 등록하고, 세 가지 방식(최근 등록 / 오답률 높음 / 전체)으로 테스트하며,
로컬에서만 실행되는 상태에서 필요할 때 Notion으로 데이터를 내보낼 수 있는 개인용 웹앱.
별도 백엔드 서버나 DB 서버 없이 프론트엔드 하나로 동작한다.

## 2. 기술 스택

| 영역 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | React + Vite + TypeScript | 백엔드 서버 없이 SPA로 동작 |
| 데이터 저장 | IndexedDB (브라우저 로컬) | 단일 기기 전용, 동기화 없음 |
| 라우팅 | react-router-dom | 페이지 전환 |
| Notion 연동 | Notion REST API + Vite Dev Server Proxy | 아래 4.4절 참고 |

**Notion 연동 관련 중요 제약**: Notion API는 브라우저 CORS를 허용하지 않아 프론트엔드에서 직접 호출이 불가능하다.
이 앱은 배포하지 않고 로컬(`npm run dev`)에서만 실행하는 것을 전제로 하므로,
Vite의 `server.proxy` 설정만으로 별도 백엔드 코드 없이 우회한다 (4.4절 상세 설명).

## 3. 데이터 모델

```ts
interface Word {
  id: string;              // uuid
  english: string;
  korean: string;
  createdAt: string;       // ISO datetime, 등록 시각
  correctCount: number;    // 맞춘 횟수
  wrongCount: number;      // 틀린 횟수
  lastCorrectAt: string | null; // 마지막으로 정답을 맞춘 시각 (ISO), 아직 없으면 null
  notionPageId?: string;   // Notion으로 내보낸 적 있으면 저장되는 페이지 ID (업데이트용)
}
```

- 총 시도 횟수 = `correctCount + wrongCount`
- 오답률 = `wrongCount / (correctCount + wrongCount)` (시도 이력이 없으면 정의되지 않음)
  - 시도 이력이 없는 단어(0/0)는 오답률로 줄 세우지 않고, 4.2절의 **동률 그룹**에 넣어 랜덤으로 다룬다.

## 4. 기능 명세

### 4.1 단어 관리 (CRUD)

- 단어 등록: 영어 + 한국어 뜻 입력 (등록 시 `createdAt` 자동 기록, 카운트 0으로 초기화)
- 단어 목록: 검색, 정렬(최근순 / 오답률순 / 알파벳순)
- 단어 수정 / 삭제
  - *(요청에 명시되진 않았지만, 등록만 있고 수정/삭제가 없으면 오타 정정이 불가능해 실사용이 어려워 기본 CRUD로 포함함. 불필요하면 제외 가능)*

### 4.2 테스트

**대상 단어 선택 (3가지 중 택1)**

| 모드 | 대상 | 기본 개수/기준 |
|---|---|---|
| 최근 등록 | `createdAt` 내림차순 상위 N개 | N = 20 (상수로 조정 가능) |
| 오답률 높은 단어 | 아래 **3단계 우선순위**로 정렬한 상위 N개 (시도 이력 없는 단어도 포함) | N = 20 (상수로 조정 가능) |
| 전체 단어 | 전체 단어 | - |

**세 모드 모두 "기준대로 대상을 뽑은 뒤 → 매 세션 랜덤 셔플"** 순서로 동작한다.
셔플은 개수를 자른 **다음에** 적용되므로, 어떤 단어가 뽑히는지는 위 기준이 그대로 결정하고 출제 순서만 매번 달라진다.

**오답률 모드의 3단계 우선순위**

정답 수와 오답 수의 대소 관계로 그룹을 먼저 나누고, 그룹 안에서 다시 정렬한다.
그룹 간 순서가 절대적이므로, 1순위 그룹이 N개를 채우면 2·3순위 그룹은 출제되지 않는다.

| 순위 | 그룹 | 조건 | 그룹 내 정렬 |
|---|---|---|---|
| 1 | 오답 우세 | `wrongCount > correctCount` | 오답률 내림차순 (동률이면 `wrongCount` 많은 순) |
| 2 | 동률 | `wrongCount === correctCount` (**시도 이력이 없는 0/0 포함**) | 오답률이 모두 같으므로 비교하지 않고 **랜덤 셔플** |
| 3 | 정답 우세 | `correctCount > wrongCount` | 오답률 내림차순 (동률이면 `wrongCount` 많은 순) |

- 2순위 그룹의 셔플은 최종 출제 순서 셔플과 **별개**다. 이 셔플은 동률 단어가 N개 컷 안에 들어갈지를 균등한 확률로 결정하는 역할을 한다.
- 1·3순위 그룹은 오답 수와 정답 수가 다르므로 시도 이력이 반드시 1회 이상이고, 따라서 오답률 계산에서 0으로 나눌 일이 없다.
- 아직 한 번도 풀지 않은 단어가 2순위로 올라오므로, "최근 등록 20개" 밖으로 밀려난 미시도 단어(특히 Notion에서 가져온 과거 단어)도 자동으로 출제 대상에 들어온다.

**출제 방향 (2가지 중 택1, 대상 선택과 독립적으로 조합 가능 → 총 6가지 조합)**

- 영어 → 한글: 영단어를 보여주고 한글 뜻 입력
- 한글 → 영어: 한글 뜻을 보여주고 영단어 입력

**채점**

- `trim()` + 대소문자 무시 후 완전 일치 여부만 판정 (동의어/복수 정답 미지원)
- 정답: `correctCount += 1`, `lastCorrectAt = 현재시각`
- 오답: `wrongCount += 1`

**테스트 흐름**: 대상/방향 선택 → 문제 순차 진행(제출 시 즉시 정오답 표시) → 세션 종료 후 결과 요약(정답/오답 개수, 틀린 단어 목록)

### 4.3 대시보드 / 통계

- 전체 단어 수, 오답률 상위 단어 미리보기, 최근 등록 단어 미리보기
- 각 테스트 모드로 바로 진입할 수 있는 버튼

### 4.4 Notion 내보내기

**동작 방식**

1. Notion에 단어 데이터를 담을 데이터베이스를 미리 만들어 두고, Integration Token과 Database ID를 로컬 `.env`에 저장한다 (`NOTION_TOKEN`, `NOTION_DATABASE_ID` — `VITE_` 접두사를 붙이지 않아 클라이언트 번들에 노출되지 않음).
2. `vite.config.ts`에서 `loadEnv`로 이 값을 읽고, `server.proxy`로 `/api/notion/*` → `https://api.notion.com/*` 요청을 전달하면서 `Authorization` 헤더를 서버 측(Node)에서 주입한다.
3. 프론트엔드 코드는 토큰을 전혀 모른 채 `/api/notion/v1/pages` 같은 상대 경로로만 호출한다.
4. "Notion으로 내보내기" 버튼 클릭 시, 로컬에 저장된 전체 단어를 순회하며:
   - `notionPageId`가 없으면 → Notion 페이지 생성(`pages.create`) 후 반환된 ID를 로컬 단어에 저장
   - `notionPageId`가 있으면 → 해당 페이지 업데이트(`pages.update`)로 최신 카운트/시각 반영

**Notion 데이터베이스 속성 매핑**

| Notion 속성 | 타입 | 값 |
|---|---|---|
| English | Title | `word.english` |
| Korean | Rich text | `word.korean` |
| WrongCount | Number | `word.wrongCount` |
| CorrectCount | Number | `word.correctCount` |
| LastCorrectAt | Date | `word.lastCorrectAt` |
| CreatedAt | Date | `word.createdAt` |

**전제**: 이 앱은 배포하지 않고 `npm run dev`로 로컬에서만 실행한다. 배포가 필요해지면 이 프록시 방식은 동작하지 않으며, 별도 서버리스 함수(CORS 우회용 프록시 1개) 추가가 필요하다.

## 5. 화면 구성 (라우트)

| 경로 | 화면 |
|---|---|
| `/` | 대시보드 (통계 요약, 빠른 진입) |
| `/words` | 단어 목록 (검색/정렬/수정/삭제) |
| `/words/new` | 단어 등록 |
| `/test/setup` | 테스트 대상 + 방향 선택 |
| `/test/session` | 테스트 진행 |
| `/test/result` | 테스트 결과 요약 |

## 6. 프로젝트 구조

```
vocab/
├── .env                      # NOTION_TOKEN, NOTION_DATABASE_ID (gitignore)
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.ts            # server.proxy로 /api/notion → api.notion.com
├── docs/
│   └── vocab-app-spec.md     # 본 문서
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── config.ts              # RECENT_WORDS_TEST_COUNT 등 상수
    ├── types/
    │   └── word.ts
    ├── db/
    │   ├── db.ts              # IndexedDB 초기화
    │   └── wordsRepo.ts       # CRUD 함수
    ├── utils/
    │   ├── grading.ts         # 정답 판정 로직
    │   └── selectors.ts       # 최근/오답률 상위 N개 선택 로직
    ├── features/
    │   ├── dashboard/
    │   │   └── Dashboard.tsx
    │   ├── words/
    │   │   ├── WordList.tsx
    │   │   └── WordForm.tsx
    │   ├── test/
    │   │   ├── TestSetup.tsx
    │   │   ├── TestSession.tsx
    │   │   └── TestResult.tsx
    │   └── notion/
    │       └── notionClient.ts  # /api/notion/* 호출
    └── routes/
        └── router.tsx
```

## 7. 확정을 위해 임의로 정한 값 (필요시 조정)

- 최근 등록 단어 테스트 기본 개수: 20개
- 오답률 높은 단어 테스트 기본 개수: 20개, 시도 이력 없는 단어는 동률 그룹에 포함
- 모든 테스트 모드: 대상 선별 후 매 세션 랜덤 셔플
- 단어 수정/삭제 기능 포함 (요청엔 없었으나 실사용에 필수라 판단)
