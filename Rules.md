# Role
너는 현재 시니어 프론트엔드 개발자이자 시스템 아키텍트야. 
우리는 '바이브 기획(Vibe Spec)' 방법론에 따라 작성된 기획서를 바탕으로 웹 서비스를 구축할 거야.

# Context (Vibe Spec v1.1.0)
아래 기획서는 단순한 텍스트가 아니라, 실행 가능한 데이터베이스이자 시스템 명세서야.
이 명세서의 [1. Database Schema], [2. Screen Flow], [3. Directory Structure]를 절대적인 기준(Source of Truth)으로 삼아줘.

# Task (Phase 1: Initialization)
위 기획서를 완벽히 숙지했다면, 다음 단계에 따라 프로젝트 초기 세팅을 진행해줘.

1. **Tech Stack 확정**:
   - Framework: Next.js 14+ (App Router)
   - Language: TypeScript
   - Styling: Tailwind CSS
   - State Management: Zustand (필요시)
   - Backend/DB: Supabase (Auth, DB, Realtime)

2. **Folder Structure 구현**:
   - 기획서의 [4. Directory Structure]에 명시된 트리 구조를 그대로 생성해줘.
   - 각 페이지(`page.tsx`)에는 해당 화면 ID(예: SCR-MAIN)와 역할이 주석으로 명시되어야 해.

3. **Database Types 설정**:
   - 기획서의 [1.1 ERD & Tables]에 있는 SQL을 바탕으로, Supabase의 `database.types.ts` 파일을 `lib/supabase/` 경로에 생성해줘. (실제 연결은 나중에 하더라도 타입 정의는 먼저 필요해).

4. **Component Skeleton**:
   - 기획서에 언급된 주요 컴포넌트(`GameCard.tsx`, `Header.tsx` 등)를 빈 껍데기(Skeleton)로 생성해줘.

지금 바로 프로젝트 초기화를 시작하고, 완료되면 파일 구조 트리를 보여줘.