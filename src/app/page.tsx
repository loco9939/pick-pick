import Image from "next/image";
import WorldCupCard from '@/components/worldcup/WorldCupCard';

// Mock Data
const MOCK_WORLDCUPS = [
  {
    id: '1',
    title: 'K-Pop Female Idol WorldCup',
    description: 'Choose your favorite K-Pop female idol!',
    thumbnailUrl: 'https://placehold.co/600x400/png?text=K-Pop',
  },
  {
    id: '2',
    title: 'Best Ramen WorldCup',
    description: 'Which ramen is the best?',
    thumbnailUrl: 'https://placehold.co/600x400/png?text=Ramen',
  },
  {
    id: '3',
    title: 'Marvel vs DC WorldCup',
    description: 'The ultimate superhero showdown.',
    thumbnailUrl: 'https://placehold.co/600x400/png?text=Marvel+vs+DC',
  },
];

export default function Home() {
  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Popular WorldCups</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {MOCK_WORLDCUPS.map((worldcup) => (
          <WorldCupCard
            key={worldcup.id}
            id={worldcup.id}
            title={worldcup.title}
            description={worldcup.description}
            thumbnailUrl={worldcup.thumbnailUrl}
          />
        ))}
      </div>
    </div>
  );
}
