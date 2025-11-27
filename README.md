# Pick-Pick (Ideal Type WorldCup)

Pick-Pick is an interactive web application that allows users to create, play, and share "Ideal Type WorldCup" games. Users can choose their favorite candidates in a tournament-style face-off until a winner is decided.

## Features

-   **Play WorldCups**: Participate in tournaments with various rounds (4, 8, 16, 32, 64).
-   **Create Your Own**: Users can create their own WorldCups with custom candidates and images.
-   **Community**: Share your results, view rankings, and leave comments.
-   **User Profiles**: Manage your created WorldCups and update your profile (nickname).
-   **Responsive Design**: Fully optimized for desktop and mobile devices.
-   **Real-time Stats**: View win rates and popularity of candidates.

## Tech Stack

-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Database & Auth**: [Supabase](https://supabase.com/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **State Management**: React Context & Hooks

## Getting Started

### Prerequisites

-   Node.js 18+ installed
-   A Supabase account and project

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/pick-pick.git
    cd pick-pick
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The project uses the following Supabase tables:

-   `profiles`: User profiles (extends auth.users)
-   `worldcups`: WorldCup metadata (title, description, owner, etc.)
-   `candidates`: Candidates for each WorldCup (name, image, stats)
-   `comments`: User comments on WorldCup results

## Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/).

1.  Push your code to GitHub.
2.  Import the project in Vercel.
3.  Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel dashboard.
4.  Deploy!

## License

This project is open source and available under the [MIT License](LICENSE).
