import * as Checkbox from "@radix-ui/react-checkbox";
import * as Popover from "@radix-ui/react-popover";
import { usePortalContainer } from "../lib/portalContainer";

export interface ValueOption {
  value: string;
  title: string;
}

interface ValueMultiSelectProps {
  label: string;
  options: ValueOption[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  onClear: () => void;
  onSelectAll: () => void;
  counts: Map<string, number>;
  nullValue?: string;
  nullLabel?: string;
}

export function ValueMultiSelect({
  label,
  options,
  selected,
  onToggle,
  onClear,
  onSelectAll,
  counts,
  nullValue,
  nullLabel,
}: ValueMultiSelectProps) {
  const container = usePortalContainer();
  const total = options.length + (nullValue ? 1 : 0);
  const triggerLabel =
    selected.size === 0
      ? `все (${total})`
      : `выбрано: ${selected.size} из ${total}`;

  return (
    <div className="egkn-field">
      <span className="egkn-field-label">{label}</span>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button type="button" className="egkn-multiselect-trigger">
            <span>{triggerLabel}</span>
            <span className="egkn-multiselect-caret">▾</span>
          </button>
        </Popover.Trigger>
        <Popover.Portal container={container ?? undefined}>
          <Popover.Content
            className="egkn-multiselect-content"
            align="start"
            sideOffset={4}
            collisionPadding={8}
          >
            <div className="egkn-multiselect-toolbar">
              <button
                type="button"
                className="egkn-link-btn"
                onClick={onSelectAll}
              >
                выбрать все
              </button>
              <button
                type="button"
                className="egkn-link-btn egkn-link-btn-danger"
                onClick={onClear}
                disabled={selected.size === 0}
              >
                сбросить
              </button>
            </div>
            <ul className="egkn-multiselect-list">
              {options.map((o) => (
                <ValueOptionRow
                  key={o.value}
                  title={o.title}
                  count={counts.get(o.value) ?? 0}
                  checked={selected.has(o.value)}
                  onToggle={() => onToggle(o.value)}
                />
              ))}
              {nullValue ? (
                <ValueOptionRow
                  title={nullLabel ?? "Без значения"}
                  count={counts.get(nullValue) ?? 0}
                  checked={selected.has(nullValue)}
                  onToggle={() => onToggle(nullValue)}
                  muted
                />
              ) : null}
            </ul>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

interface RowProps {
  title: string;
  count: number;
  checked: boolean;
  onToggle: () => void;
  muted?: boolean;
}

function ValueOptionRow({ title, count, checked, onToggle, muted }: RowProps) {
  const isEmpty = count === 0;
  return (
    <li>
      <label
        className={`egkn-checkbox-row egkn-sublayer-row ${isEmpty ? "is-empty" : ""}`}
      >
        <Checkbox.Root
          className="egkn-checkbox"
          checked={checked}
          onCheckedChange={onToggle}
        >
          <Checkbox.Indicator className="egkn-checkbox-indicator">
            ✓
          </Checkbox.Indicator>
        </Checkbox.Root>
        <span className={`egkn-sublayer-title ${muted ? "egkn-muted" : ""}`}>
          {title}
        </span>
        <span className="egkn-sublayer-count">{count}</span>
      </label>
    </li>
  );
}
