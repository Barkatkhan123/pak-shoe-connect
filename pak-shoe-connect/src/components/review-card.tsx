import type { Review } from "@/data/products";
import { Star, ThumbsUp, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";

type Props = {
  review: Review;
};

export function ReviewCard({ review }: Props) {
  const [helpful, setHelpful] = useState(review.helpful);
  const [voted, setVoted] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewImage(null);
    };
    if (previewImage) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage]);

  const handleVote = () => {
    if (voted) return;
    setHelpful(h => h + 1);
    setVoted(true);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-shadow hover:premium-shadow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-foreground">{review.reviewer}</span>
            {review.verified && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-deep/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-deep" title="Verified Wholesale Buyer">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {review.city}, {review.country}
          </div>
        </div>
        <div className="text-right">
          <div className="flex text-gold">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < review.rating ? "star-filled" : "star-empty"}`}
              />
            ))}
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            {new Date(review.date).toLocaleDateString("en-PK", { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-foreground/90 leading-relaxed">
        "{review.comment}"
      </p>

      {(review as any).images && (review as any).images.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {(review as any).images.map((img: string, i: number) => (
            <button 
              key={i} 
              onClick={() => setPreviewImage(img)} 
              className="shrink-0 focus:outline-none focus:ring-2 focus:ring-primary rounded-md"
            >
              <img 
                src={img} 
                alt={`Review image ${i+1}`} 
                className="h-16 w-16 rounded-md object-cover border border-border"
              />
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-4 border-t border-border pt-3">
        <button 
          onClick={handleVote}
          disabled={voted}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            voted ? "text-primary cursor-default" : "text-muted-foreground hover:text-primary"
          }`}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          Helpful ({helpful})
        </button>
      </div>

      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <button 
            className="absolute right-4 top-4 text-white hover:text-gray-300 focus:outline-none"
            onClick={() => setPreviewImage(null)}
          >
            Close
          </button>
          <img 
            src={previewImage} 
            alt="Full size review" 
            className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
