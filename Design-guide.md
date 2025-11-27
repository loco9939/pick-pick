🎨 Design Concept: "Dopamine Pop & Dark Mode"
MZ세대 타겟의 엔터테인먼트 서비스는 콘텐츠(이미지)에 집중할 수 있는 Dark Mode 베이스에, 강렬한 네온/그라데이션 포인트 컬러를 사용하는 것이 대세입니다. (예: 틱톡, 넷플릭스, 스포티파이)

1. Color Palette (Tailwind CSS 기준)
'승부'와 '결과'가 중요한 서비스이므로, 강렬한 대비가 핵심입니다.

Background (Canvas): bg-slate-900 (완전 블랙 black보다는 깊은 네이비/그레이가 눈이 편하고 고급스럽습니다.)

Primary (Brand): Violet-500 ~ Fuchsia-500 (Gradient)

용도: 로고, 메인 버튼, 우승자 강조 효과

Secondary (VS Colors): 게임 진행 시 좌/우 대립을 명확히 보여줍니다.

Option A (Left): Blue-500 (Cyan 계열 추천)

Option B (Right): Rose-500 (Pink/Red 계열 추천)

Text:

Head: text-white

Body: text-slate-300

Muted: text-slate-500

2. Typography (Font)
가독성과 트렌디함을 모두 잡는 San-serif 계열이 필수입니다.

한글/영문 공통: Pretendard (국룰 폰트)

제목(Title)은 Bold (700) 또는 ExtraBold (800)로 굵고 크게 배치하여 임팩트를 줍니다.

본문은 Regular (400) ~ Medium (500).

📱 Core UX/UI Patterns (화면별 전략)
1. 게임 플레이 화면 (The Arena)
사용자가 가장 집중해야 하는 화면입니다. **엄지 영역(Thumb Zone)**과 직관성이 최우선입니다.

Layout:

Mobile: 세로 2분할 (상/하) 또는 카드 스택 방식.

Desktop: 가로 2분할 (좌/우).

Interaction:

이미지 위에 마우스를 올리거나 터치했을 때, Scale Up (105%) 되며 선택되지 않은 쪽은 어두워지는(Dimmed) 효과.

가운데 [VS] 뱃지는 번개 아이콘이나 불꽃 효과로 긴장감 조성.

Progress: 상단에 얇은 바(Bar) 형태로 32강 -> 16강 -> ... 진행 상황 표시.

2. 결과 및 랭킹 화면 (The Hall of Fame)
단순한 텍스트 나열은 지루합니다. 데이터 시각화로 "내 취향이 메이저인지" 즉시 확인시켜줍니다.

Winner Card: 화면 중앙에 우승자 이미지가 크게 뜨고, 배경에는 폭죽(Confetti) 애니메이션 필수.

Stats UI:

가로형 막대 그래프(Progress Bar) 활용.

1위부터 3위까지는 금/은/동 메달 아이콘과 함께 카드 크기를 키워서 강조 (grid-cols-2 중 첫 번째 아이템 col-span-2 처리).

승률 데이터(72%)는 굵은 숫자로 강조하고 색상을 입힙니다 (예: 높으면 초록, 낮으면 빨강).

3. 메인/리스트 화면 (The Gallery)
유튜브 썸네일이나 넷플릭스 탐색 화면처럼 이미지 위주의 그리드 레이아웃.

Card UI:

직사각형(4:3 또는 16:9) 썸네일.

썸네일 위에 "현재 1,240명 참여 중" 같은 라이브 배지(badge) 부착.

제목은 2줄 말줄임표(line-clamp-2) 처리.