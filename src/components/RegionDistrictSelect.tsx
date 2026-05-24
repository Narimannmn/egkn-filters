import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { usePortalContainer } from "../lib/portalContainer";
import type { District, Region } from "../lib/districtsMeta";

interface Props {
  regions: Region[];
  selectedRegionCode: string | null;
  selectedDistrictCode: string | null;
  onChange: (region: Region, district: District) => void;
  disabled?: boolean;
}

export function RegionDistrictSelect({
  regions,
  selectedRegionCode,
  selectedDistrictCode,
  onChange,
  disabled,
}: Props) {
  const container = usePortalContainer();
  const [open, setOpen] = useState(false);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const selectedRegion = regions.find((r) => r.code === selectedRegionCode) ?? null;
  const selectedDistrict =
    selectedRegion?.districts.find((d) => d.code === selectedDistrictCode) ?? null;
  const activeRegion = pickActiveRegion(regions, hoveredRegion, selectedRegionCode);

  const label =
    selectedDistrict?.nameRu ??
    selectedRegion?.nameRu ??
    "Выберите область и район";

  return (
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setHoveredRegion(null);
      }}
    >
      <Popover.Trigger asChild>
        <button type="button" className="egkn-multiselect-trigger" disabled={disabled}>
          <span className={selectedDistrict ? "" : "egkn-muted"}>{label}</span>
          <span className="egkn-multiselect-caret">▾</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal container={container ?? undefined}>
        <Popover.Content
          className="egkn-cascade-content"
          align="start"
          sideOffset={4}
          collisionPadding={8}
        >
          <div className="egkn-cascade">
            <RegionColumn
              regions={regions}
              activeCode={activeRegion?.code ?? null}
              selectedCode={selectedRegionCode}
              onHover={setHoveredRegion}
            />
            <DistrictColumn
              region={activeRegion}
              selectedRegionCode={selectedRegionCode}
              selectedDistrictCode={selectedDistrictCode}
              onPick={(d) => {
                if (activeRegion) {
                  onChange(activeRegion, d);
                  setOpen(false);
                }
              }}
            />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function pickActiveRegion(
  regions: Region[],
  hoveredCode: string | null,
  selectedCode: string | null,
): Region | null {
  const code = hoveredCode ?? selectedCode ?? regions[0]?.code ?? null;
  return regions.find((r) => r.code === code) ?? null;
}

interface RegionColumnProps {
  regions: Region[];
  activeCode: string | null;
  selectedCode: string | null;
  onHover: (code: string) => void;
}

function RegionColumn({ regions, activeCode, selectedCode, onHover }: RegionColumnProps) {
  return (
    <ul className="egkn-cascade-col egkn-cascade-regions">
      {regions.map((r) => {
        const isActive = r.code === activeCode;
        const isSelected = r.code === selectedCode;
        return (
          <li key={r.code}>
            <button
              type="button"
              className={`egkn-cascade-item ${isActive ? "is-active" : ""} ${isSelected ? "is-selected" : ""}`}
              onMouseEnter={() => onHover(r.code)}
              onFocus={() => onHover(r.code)}
            >
              <span className="egkn-cascade-item-label">{r.nameRu}</span>
              {r.districts.length > 0 ? (
                <span className="egkn-cascade-arrow">›</span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

interface DistrictColumnProps {
  region: Region | null;
  selectedRegionCode: string | null;
  selectedDistrictCode: string | null;
  onPick: (district: District) => void;
}

function DistrictColumn({
  region,
  selectedRegionCode,
  selectedDistrictCode,
  onPick,
}: DistrictColumnProps) {
  if (!region || region.districts.length === 0) {
    return (
      <ul className="egkn-cascade-col egkn-cascade-districts">
        <li className="egkn-cascade-empty">
          {region ? "Нет районов" : "Выберите область"}
        </li>
      </ul>
    );
  }
  return (
    <ul className="egkn-cascade-col egkn-cascade-districts">
      {region.districts.map((d) => {
        const isSelected =
          d.code === selectedDistrictCode && region.code === selectedRegionCode;
        return (
          <li key={d.code}>
            <button
              type="button"
              className={`egkn-cascade-item ${isSelected ? "is-selected" : ""}`}
              onClick={() => onPick(d)}
            >
              <span className="egkn-cascade-bullet">•</span>
              <span className="egkn-cascade-item-label">{d.nameRu}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
