"use client";

import { useEffect, useMemo, useState } from "react";
import { painters as samplePainters, SKILLS, CITIES } from "@/lib/data";
import { Painter } from "@/lib/types";
import { fetchPainters } from "@/lib/painters";
import PainterCard from "@/components/PainterCard";

export default function PaintersPage() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("All");
  const [skill, setSkill] = useState("All");
  const [sort, setSort] = useState("rating");
  const [painters, setPainters] = useState<Painter[]>(samplePainters);
  const [live, setLive] = useState(false);

  useEffect(() => {
    fetchPainters().then((rows) => {
      if (rows.length > 0) {
        setPainters(rows);
        setLive(true);
      }
    });
  }, []);

  const list = useMemo(() => {
    let out = painters.filter((p) => {
      const matchQ =
        q === "" ||
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.skills.join(" ").toLowerCase().includes(q.toLowerCase());
      const matchCity = city === "All" || p.city === city;
      const matchSkill = skill === "All" || p.skills.includes(skill);
      return matchQ && matchCity && matchSkill;
    });
    if (sort === "rating") out = [...out].sort((a, b) => b.rating - a.rating);
    if (sort === "low") out = [...out].sort((a, b) => a.pricePerDay - b.pricePerDay);
    if (sort === "high") out = [...out].sort((a, b) => b.pricePerDay - a.pricePerDay);
    return out;
  }, [painters, q, city, skill, sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-extrabold text-brand-ink">Find Painters</h1>
        {live && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">● Live</span>
        )}
      </div>
      <p className="mt-1 text-brand-ink/60">Pick the best painter for your home.</p>

      {/* Search + filters */}
      <div className="mt-6 rounded-xl2 border border-orange-100 bg-white p-4 shadow-soft">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔍 Search by name or work (e.g. texture, exterior)"
          className="w-full rounded-xl border border-orange-100 px-4 py-3 outline-none focus:border-brand-coral"
        />
        <div className="mt-3 flex flex-wrap gap-3">
          <Select label="City" value={city} setValue={setCity} options={["All", ...CITIES]} />
          <Select label="Work type" value={skill} setValue={setSkill} options={["All", ...SKILLS]} />
          <Select
            label="Sort by"
            value={sort}
            setValue={setSort}
            options={["rating", "low", "high"]}
            labels={{ rating: "Top rated", low: "Price: low to high", high: "Price: high to low" }}
          />
        </div>
      </div>

      <p className="mt-6 text-sm font-semibold text-brand-ink/60">
        {list.length} painter{list.length !== 1 && "s"} found
      </p>

      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <PainterCard key={p.id} painter={p} />
        ))}
      </div>

      {list.length === 0 && (
        <div className="mt-10 rounded-xl2 border border-orange-100 bg-white p-10 text-center">
          <div className="text-4xl">😕</div>
          <p className="mt-2 font-bold text-brand-ink">No painters match that.</p>
          <p className="text-sm text-brand-ink/60">Try a different city or work type.</p>
        </div>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  setValue,
  options,
  labels,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="font-semibold text-brand-ink/60">{label}</span>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="rounded-xl border border-orange-100 bg-white px-3 py-2 font-medium outline-none focus:border-brand-coral"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {labels?.[o] ?? o}
          </option>
        ))}
      </select>
    </label>
  );
}
