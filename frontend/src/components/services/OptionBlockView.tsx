import { Check, Info } from "lucide-react";

import type { OptionBlock } from "@/lib/types";

export function OptionBlockView({ block, headingId }: { block: OptionBlock; headingId: string }) {
  return (
    <div>
      <div className="max-w-3xl" data-reveal>
        <h2 id={headingId} className="text-title text-ink-950">
          {block.heading}
        </h2>
        {block.intro && <p className="text-lede mt-4 text-muted">{block.intro}</p>}
      </div>

      <div className="mt-10">
        {block.layout === "cards" && <Cards block={block} />}
        {block.layout === "table" && <Table block={block} />}
        {block.layout === "tags" && (
          <ul className="flex flex-wrap gap-2" data-reveal>
            {block.tags.map((t) => (
              <li key={t} className="rounded-full border border-line-strong/70 bg-white px-4 py-2 text-[0.95rem] text-ink-800 shadow-[var(--shadow-card)]">
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>

      {block.note && (
        <p className="mt-6 flex max-w-3xl gap-3 text-sm leading-relaxed text-muted" data-reveal>
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-700" />
          {block.note}
        </p>
      )}
    </div>
  );
}

function Cards({ block }: { block: OptionBlock }) {
  const n = block.cards.length;
  const cols = n === 2 ? "md:grid-cols-2" : n === 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3";
  return (
    <ul className={`grid gap-4 ${cols}`}>
      {block.cards.map((card, i) => (
        <li
          key={`${card.title}-${i}`}
          data-reveal
          data-spotlight
          style={{ ["--i" as string]: i }}
          className="relative flex flex-col rounded-2xl border border-line bg-white p-7 shadow-[var(--shadow-card)]"
        >
          <span aria-hidden className="text-xs font-semibold text-ink-400 tabular-nums">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink-950">{card.title}</h3>
          {card.meta && <p className="text-eyebrow mt-2.5 text-brand-700">{card.meta}</p>}
          {card.body && <p className="mt-3 leading-relaxed text-muted">{card.body}</p>}
          {card.items.length > 0 && (
            <ul className="mt-6 space-y-2.5 border-t border-line pt-6 text-[0.95rem]">
              {card.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check aria-hidden className="mt-1 size-4 shrink-0 text-accent-600" strokeWidth={2} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

function Table({ block }: { block: OptionBlock }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white px-5 shadow-[var(--shadow-card)] md:px-0" data-reveal>
      <table className="table-stack w-full text-left text-[0.95rem]">
        <thead>
          <tr className="border-b border-line bg-paper/60">
            {block.columns.map((c) => (
              <th key={c} scope="col" className="text-eyebrow px-6 py-4 font-medium text-muted">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="md:divide-y md:divide-line">
          {block.rows.map((row) => (
            <tr key={row[0]} className="align-top transition-colors md:hover:bg-paper/50">
              {row.map((cell, ci) =>
                ci === 0 ? (
                  <th key={ci} scope="row" data-label={block.columns[ci]} className="px-6 py-5 font-semibold text-ink-950">
                    {cell}
                  </th>
                ) : (
                  <td
                    key={ci}
                    data-label={block.columns[ci]}
                    className={`px-6 py-5 ${ci === 1 ? "font-mono text-[0.85rem] whitespace-nowrap text-ink-800" : "text-muted"}`}
                  >
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
