
> Version: 1.1.0 (Final for Development)
> 
> Tech Stack: Next.js(App Router), TypeScript, Tailwind CSS, Supabase(DB/Auth/Realtime)

## 1. Database Schema & Policies (Supabase)

_원칙 2(구조화) & 원칙 3(기계 가독성): AI가 실행 가능한 SQL 형태의 데이터 구조입니다._

### **1.1. ERD & Tables**

SQL

```
-- [Table: profiles] 유저 정보 (Supabase Auth와 연동)
create table public.profiles (
  id uuid references auth.users not null primary key, -- User ID
  email text unique not null,
  nickname text,
  role text default 'user', -- 'admin' or 'user'
  created_at timestamptz default now()
);

-- [Table: worldcups] 월드컵 메타 정보
create table public.worldcups (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id), -- 작성자 (Nullable: 추후 확장성 고려)
  title text not null,
  description text,
  thumbnail_url text, -- 대표 이미지 (후보 중 하나 선택)
  is_deleted boolean default false, -- Soft Delete
  created_at timestamptz default now()
);

-- [Table: candidates] 월드컵 후보 (이미지 URL 방식)
create table public.candidates (
  id uuid default gen_random_uuid() primary key,
  worldcup_id uuid references public.worldcups(id) on delete cascade not null,
  name text not null,
  image_url text not null, -- 외부 URL 저장
  win_count int default 0, -- 최종 우승 횟수
  match_win_count int default 0, -- 1:1 대결 승리 횟수
  match_expose_count int default 0 -- 1:1 대결 노출 횟수
);

-- [Table: comments] 월드컵 댓글 (계층형 구조)
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  worldcup_id uuid references public.worldcups(id) on delete cascade not null,
  user_id uuid references public.profiles(id), -- Nullable: 비로그인 유저 허용
  nickname text not null, -- 작성자 닉네임 (로그인 유저도 입력 가능 or 자동 채움)
  content text not null,
  parent_id uuid references public.comments(id), -- 대댓글을 위한 자기 참조
  created_at timestamptz default now()
);

-- [View: worldcup_stats] 통계 최적화를 위한 가상 테이블
create view public.worldcup_stats as
select 
  w.id as worldcup_id,
  w.title,
  count(c.id) as candidate_count,
  sum(c.match_expose_count) as total_plays
from worldcups w
join candidates c on w.id = c.worldcup_id
where w.is_deleted = false
group by w.id, w.title;
```

### **1.2. RLS (Row Level Security) Policies**

- **WorldCup Table:**
    
    - `Select`: `true` (누구나 조회 가능)
        
    - `Insert`: `auth.uid() != null` (로그인한 유저만 생성)
        
    - `Update/Delete`: `auth.uid() == owner_id` (본인만 수정/삭제)
        
- **Candidates Table:**
    
    - `Update (Stats)`: `true` (게임 결과 반영을 위해 누구나 카운트 증가 허용 - _보안 강화 필요 시 Edge Function 권장_)
        
- **Comments Table:**
    
    - `Select`: `true` (누구나 조회 가능)
        
    - `Insert`: `true` (비로그인 유저도 작성 가능)
        
    - `Update/Delete`: `auth.uid() == user_id` (로그인 유저 본인만) OR `session_id` check (비로그인 - 추후 고려)
        

---

## 2. Information Architecture & Screen Flow

_원칙 1(통합): 화면 ID와 URL, 컴포넌트가 1:1로 매핑됩니다._

|**화면 ID**|**URL Path**|**설명**|**주요 기능/정책**|
|---|---|---|---|
|**SCR-MAIN**|`/`|메인 홈|• 인기/최신 월드컵 리스트 (Infinite Scroll)<br><br>  <br><br>• 로그인/마이페이지 진입점|
|**SCR-AUTH**|`/auth/login`|로그인/가입|• 이메일 로그인 + 소셜 로그인<br><br>  <br><br>• 로그인 성공 시 이전 페이지 리다이렉트|
|**SCR-MY**|`/my`|마이페이지|• **[F-MY-001]** 내가 만든 월드컵 리스트 조회<br><br>  <br><br>• 수정/삭제 버튼 노출|
|**SCR-CREATE**|`/create`|월드컵 생성|• **[P-AUTH]** 비로그인 접근 시 `SCR-AUTH`로 리다이렉트<br><br>  <br><br>• 이미지 URL 일괄 등록 (Paste & Parse)|
|**SCR-EDIT**|`/edit/[id]`|월드컵 수정|• **[P-OWNER]** `owner_id` 불일치 시 403 에러<br><br>  <br><br>• 기존 후보 데이터 로드 및 수정|
|**SCR-PRE**|`/play/[id]/intro`|게임 시작 전|• 라운드 선택 (32강/16강...)<br><br>  <br><br>• 현재 1위 후보 미리보기|
|**SCR-PLAY**|`/play/[id]`|게임 진행|• **[UI-THUMB]** 반반(Half-Half) 카드 UI<br><br>  <br><br>• 이상형 선택 시 다음 라운드 큐(Queue)로 이동|
|**SCR-RESULT**|`/play/[id]/result`|결과/통계|• **[F-STAT]** 우승자 화려한 연출 + 랭킹 그래프<br><br>  <br><br>• **[F-ADS]** 하단 배너 광고<br><br>  <br><br>• **[F-COMM]** 댓글 및 대댓글 작성/조회|

---

## 3. Core Logic Specifications (Vibe Logic)

_원칙 3(기계 가독성): 복잡한 로직을 명확한 알고리즘으로 정의합니다._

### **[Logic: Tournament_Engine]**

- **State:**
    
    - `currentRound`: `[Candidate A, Candidate B, ...]`
        
    - `nextRound`: `[]`
        
- **Algorithm:**
    
    1. `currentRound`에서 2개를 `pop()` -> `Left(A)`, `Right(B)`.
        
    2. User Selects `A` -> `nextRound.push(A)`.
        
    3. Stats Update (Async): `A.match_win++`, `A.match_expose++`, `B.match_expose++`.
        
    4. Repeat until `currentRound` is empty.
        
    5. Swap: `currentRound = nextRound`, `nextRound = []`.
        
    6. Shuffle `currentRound` (랜덤 대진표).
        
    7. Repeat until `currentRound.length == 1` (Winner).
        

### **[Logic: Image_Proxy (Optional)]**

- **Problem:** 외부 이미지 URL(네이버, 구글 등)이 CORS 문제로 캔버스에 안 그려지거나 엑박이 뜰 수 있음.
    
- **Solution:** Next.js Image Component를 사용하거나, `Next.js API Route`를 통해 이미지를 우회 로딩하는 유틸리티 함수 구현.
    

---

## 4. Directory Structure (Tree)

_개발 시작 시 바로 생성할 폴더 구조입니다._

Plaintext

```
/src
  /app
    /(route)
      /page.tsx           # SCR-MAIN
      /create/page.tsx    # SCR-CREATE
      /my/page.tsx        # SCR-MY
      /auth/page.tsx      # SCR-AUTH
    /play
      /[id]/page.tsx      # SCR-PLAY (Client Component for Game Logic)
      /[id]/result/page.tsx # SCR-RESULT
  /components
    /game
      /GameCard.tsx       # Half-Half UI Component
      /TournamentManager.tsx # Game Logic Hook Wrapper
    /common
      /Header.tsx
      /AdBanner.tsx
  /lib
    /supabase
      /client.ts          # Supabase Client Instance
      /database.types.ts  # Generic Type generated from SQL
  /hooks
    /useGameLogic.ts      # Tournament Algorithm
```

---

## 5. Validation Check (검증)

_원칙 5(검증): 코딩 전 최종 체크리스트_

1. **[Auth Flow]**: 로그인 상태에서만 `/create` 및 `/edit` 접근이 가능한가? (Middleware 검증 필요) -> **OK**
    
2. **[Data Safety]**: 유저 A가 URL 조작을 통해 유저 B의 월드컵(`/edit/user-b-id`)에 접근하면 차단되는가? (RLS 정책 확인) -> **OK**
    
3. **[Performance]**: `candidate` 테이블의 Row가 수만 개가 될 때 랭킹 페이지가 느리지 않은가? (인덱싱 및 View 사용) -> **OK**