import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "./CopyButton";
import { getLayerAdapter, type Badge } from "../lib/layerAdapter";
import type { EgknItem } from "../types/api";

export const PAGE_SIZE = 5;

interface ResultsListProps {
  items: EgknItem[];
  page: number;
}

export function ResultsList({ items, page }: ResultsListProps) {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, safePage]);

  if (items.length === 0) {
    return <div className="egkn-empty">Нет элементов</div>;
  }

  return (
    <ul className="egkn-results">
      {pageItems.map((item) => (
        <ResultCard
          key={`${item._layerName ?? ""}:${item.properties.id}`}
          item={item}
        />
      ))}
    </ul>
  );
}

interface PaginationProps {
  page: number;
  totalItems: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalItems, onChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const from = totalItems === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, totalItems);

  if (totalPages <= 1) return null;

  return (
    <nav className="egkn-pagination" aria-label="Пагинация">
      <span className="egkn-pagination-info">
        {from}–{to} из {totalItems}
      </span>
      <div className="egkn-pagination-controls">
        <button
          type="button"
          className="egkn-pagination-btn"
          onClick={() => onChange(safePage - 1)}
          disabled={safePage <= 1}
          aria-label="Предыдущая страница"
        >
          ‹
        </button>
        <span className="egkn-pagination-pages">
          {safePage} / {totalPages}
        </span>
        <button
          type="button"
          className="egkn-pagination-btn"
          onClick={() => onChange(safePage + 1)}
          disabled={safePage >= totalPages}
          aria-label="Следующая страница"
        >
          ›
        </button>
      </div>
    </nav>
  );
}

export function useResultsPage(resetKey: unknown): [number, (p: number) => void] {
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [resetKey]);
  return [page, setPage];
}

function ResultCard({ item }: { item: EgknItem }) {
  const id = item.properties.id;
  const adapter = getLayerAdapter(item._layerName);
  const address = adapter.getAddress(item);
  const rows = adapter.getRows(item);
  const badges = adapter.getBadges(item);

  return (
    <li className="egkn-card">
      <div className="egkn-card-header">
        <span className="egkn-card-id" title={id}>
          {id}
        </span>
        <CopyButton text={id} />
      </div>

      <Badges badges={badges} />

      <div className="egkn-card-fields">
        {address ? <Row k="Адрес" v={address} /> : null}
        {rows.map((r) => (
          <Row key={r.label} k={r.label} v={r.value} />
        ))}
      </div>
    </li>
  );
}

function Badges({ badges }: { badges: Badge[] }) {
  if (badges.length === 0) return null;
  return (
    <div className="egkn-card-badges">
      {badges.map((b, i) => (
        <span
          key={`${b.kind}:${i}`}
          className={`egkn-badge egkn-badge-${b.kind}`}
          title={b.title}
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="egkn-field-row">
      <span className="egkn-field-key">{k}</span>
      <span className="egkn-field-val">{v}</span>
    </div>
  );
}
