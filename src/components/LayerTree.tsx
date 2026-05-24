import type { LayerGroup } from "../lib/layersMeta";
import { SublayerMultiSelect } from "./SublayerMultiSelect";

interface LayerTreeProps {
  groups: LayerGroup[];
  selectedGroup: string | null;
  onGroupChange: (name: string) => void;

  selectedLayer: string | null;
  onLayerChange: (name: string | null) => void;

  sublayerCodes: Set<string>;
  onToggleSublayer: (code: string) => void;
  onClearSublayers: () => void;
  onSelectAllSublayers: () => void;
  statusCounts: Map<string, number>;
}

export function LayerTree({
  groups,
  selectedGroup,
  onGroupChange,
  selectedLayer,
  onLayerChange,
  sublayerCodes,
  onToggleSublayer,
  onClearSublayers,
  onSelectAllSublayers,
  statusCounts,
}: LayerTreeProps) {
  const group = groups.find((g) => g.name === selectedGroup) ?? null;
  const layer = group?.layers.find((l) => l.name === selectedLayer) ?? null;

  return (
    <div className="egkn-tree">
      <label className="egkn-field">
        <span className="egkn-field-label">Группа</span>
        <select
          className="egkn-select"
          value={selectedGroup ?? ""}
          onChange={(e) => onGroupChange(e.target.value)}
        >
          {groups.map((g) => (
            <option key={g.name} value={g.name}>
              {g.title}
            </option>
          ))}
        </select>
      </label>

      {group ? (
        <label className="egkn-field">
          <span className="egkn-field-label">Слой</span>
          <select
            className="egkn-select"
            value={selectedLayer ?? ""}
            onChange={(e) => onLayerChange(e.target.value || null)}
          >
            <option value="">— не выбрано —</option>
            {group.layers.map((l) => (
              <option key={l.name} value={l.name}>
                {l.title}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {layer && layer.sublayers.length > 0 ? (
        <SublayerMultiSelect
          sublayers={layer.sublayers}
          selectedCodes={sublayerCodes}
          onToggleCode={onToggleSublayer}
          onClear={onClearSublayers}
          onSelectAll={onSelectAllSublayers}
          counts={statusCounts}
        />
      ) : null}
    </div>
  );
}
