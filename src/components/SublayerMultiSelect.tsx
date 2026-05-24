import * as Checkbox from "@radix-ui/react-checkbox";
import * as Popover from "@radix-ui/react-popover";
import { usePortalContainer } from "../lib/portalContainer";
import type { Sublayer } from "../lib/layersMeta";

const NULL_CODE = "__null";

interface SublayerMultiSelectProps {
  sublayers: Sublayer[];
  selectedCodes: Set<string>;
  onToggleCode: (code: string) => void;
  onClear: () => void;
  onSelectAll: () => void;
  counts: Map<string, number>;
}

export function SublayerMultiSelect({
  sublayers,
  selectedCodes,
  onToggleCode,
  onClear,
  onSelectAll,
  counts,
}: SublayerMultiSelectProps) {
  const container = usePortalContainer();
  const total = sublayers.length + 1;
  const label =
    selectedCodes.size === 0
      ? `все (${total})`
      : `выбрано: ${selectedCodes.size} из ${total}`;

  return (
    <div className="egkn-field">
      <span className="egkn-field-label">Статусы</span>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button type="button" className="egkn-multiselect-trigger">
            <span>{label}</span>
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
                disabled={selectedCodes.size === 0}
              >
                сбросить
              </button>
            </div>
            <ul className="egkn-multiselect-list">
              {sublayers.map((s) => (
                <SublayerOption
                  key={s.code}
                  code={s.code}
                  title={s.title}
                  count={counts.get(s.code) ?? 0}
                  checked={selectedCodes.has(s.code)}
                  onToggle={() => onToggleCode(s.code)}
                />
              ))}
              <SublayerOption
                code={NULL_CODE}
                title="Без статуса"
                count={counts.get(NULL_CODE) ?? 0}
                checked={selectedCodes.has(NULL_CODE)}
                onToggle={() => onToggleCode(NULL_CODE)}
                muted
              />
            </ul>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

interface OptionProps {
  code: string;
  title: string;
  count: number;
  checked: boolean;
  onToggle: () => void;
  muted?: boolean;
}

function SublayerOption({
  title,
  count,
  checked,
  onToggle,
  muted,
}: OptionProps) {
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
