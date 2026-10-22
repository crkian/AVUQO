import type { DealRating } from "@/types/deal";

type Props = {
  score: number;
  rating: DealRating;
};

const labels: Record<DealRating, string> = {
  exceptional: "Exceptional",
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  weak: "Not really a deal"
};

export default function AvuqoScore({ score, rating }: Props) {
  return (
    <div className="avuqo-score">
      <div className="avuqo-score-number">{score}</div>
      <div className="avuqo-score-label">{labels[rating]}</div>
    </div>
  );
}
