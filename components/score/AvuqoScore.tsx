import type { DealRating } from "../../types/deal";

type Props = {
  score: number;
  rating: DealRating;
};

const labels: Record<DealRating, string> = {
  exceptional: "Exceptional",
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  weak: "Not really a deal",
};

export default function AvuqoScore({ score, rating }: Props) {
  return (
    <div className="avuqo-score" aria-label={`AVUQO Score ${score}, ${labels[rating]}`}>
      <strong>{score}</strong>
      <span>{labels[rating]}</span>
    </div>
  );
}
