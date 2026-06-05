import { Review } from "@/lib/types";
import StarRating from "./StarRating";

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-xl2 border border-orange-100 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-brand-sunny to-brand-coral font-bold text-white">
            {review.customerName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-brand-ink">{review.customerName}</p>
            <p className="text-xs text-brand-ink/50">{review.date}</p>
          </div>
        </div>
        <StarRating value={review.stars} size="sm" />
      </div>

      <p className="mt-3 text-brand-ink/80">{review.text}</p>

      {review.photos.length > 0 && (
        <div className="mt-3 flex gap-2">
          {review.photos.map((src, i) => (
            <img
              key={i}
              src={src}
              alt="review photo"
              className="h-20 w-20 rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-brand-ink/60">
        <span>Quality {review.quality}★</span>
        <span>On time {review.onTime}★</span>
        <span>Clean {review.cleanliness}★</span>
        <span>Value {review.value}★</span>
      </div>

      {review.reply && (
        <div className="mt-3 rounded-xl bg-orange-50 p-3 text-sm">
          <span className="font-bold text-brand-coral">Pro replied: </span>
          <span className="text-brand-ink/80">{review.reply}</span>
        </div>
      )}
    </div>
  );
}
