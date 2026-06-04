"use client";

type Props = {
  value: number;
  size?: "sm" | "md" | "lg";
  onChange?: (v: number) => void; // if given, stars become clickable
};

export default function StarRating({ value, size = "md", onChange }: Props) {
  const px = size === "sm" ? "text-base" : size === "lg" ? "text-3xl" : "text-xl";

  return (
    <div className={`inline-flex items-center gap-0.5 ${px}`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        return (
          <button
            key={n}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(n)}
            className={`${onChange ? "cursor-pointer transition hover:scale-110" : "cursor-default"} leading-none`}
            aria-label={`${n} star`}
          >
            <span className={filled ? "text-amber-400" : "text-gray-300"}>★</span>
          </button>
        );
      })}
    </div>
  );
}
