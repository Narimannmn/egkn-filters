import { Suspense, useState } from "react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { Fab } from "../components/Fab";
import { FilterDialog } from "../components/FilterDialog";
import { LayerTree } from "../components/LayerTree";
import { LoadStatus } from "../components/LoadStatus";
import { RegionDistrictSelect } from "../components/RegionDistrictSelect";
import { Pagination, ResultsList, useResultsPage } from "../components/ResultsList";
import { useActiveDistrict } from "../hooks/useActiveDistrict";
import { useDistrictSelection } from "../hooks/useDistrictSelection";
import { useLayerPages } from "../hooks/useLayerPages";
import { useLayerSelection } from "../hooks/useLayerSelection";
import { useLayersMeta } from "../hooks/useLayersMeta";
import { useRegions } from "../hooks/useRegions";
import { useStatusCounts } from "../hooks/useStatusCounts";
import { useSublayerFilter } from "../hooks/useSublayerFilter";
import { getLayerAdapter } from "../lib/layerAdapter";
import { findLayerMeta } from "../lib/layersMeta";
import { queryClient } from "../lib/queryClient";
import type { EgknItem } from "../types/api";

export function App() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Fab onClick={() => setOpen(true)} />
      <FilterDialog open={open} onOpenChange={setOpen}>
        <ErrorBoundary fallback={renderErrorFallback}>
          <Suspense fallback={<div className="egkn-empty">Загрузка…</div>}>
            <DialogBody />
          </Suspense>
        </ErrorBoundary>
      </FilterDialog>
    </>
  );
}

function renderErrorFallback(error: Error, reset: () => void) {
  return (
    <div className="egkn-error">
      Ошибка: {error.message}{" "}
      <button
        type="button"
        className="egkn-link-btn"
        onClick={() => {
          queryClient.invalidateQueries();
          reset();
        }}
      >
        повторить
      </button>
    </div>
  );
}

function DialogBody() {
  const meta = useLayersMeta();
  const regions = useRegions();
  const initialDistrict = useActiveDistrict();

  const district = useDistrictSelection(regions, initialDistrict);
  const layerSel = useLayerSelection(meta, district.districtCode);

  const hasDistrict = district.districtCode != null && !district.setting;
  const activeLayer = hasDistrict ? layerSel.layerName : null;
  const pages = useLayerPages(activeLayer);
  const layerMeta = activeLayer ? findLayerMeta(meta, activeLayer) : null;
  const adapter = getLayerAdapter(activeLayer);
  const filteredItems = useSublayerFilter(
    pages.items,
    layerSel.sublayerCodes,
    layerMeta,
    adapter,
  );
  const statusCounts = useStatusCounts(pages.items, layerMeta, adapter);

  return (
    <>
      <aside className="egkn-sidebar">
        <div className="egkn-field">
          <span className="egkn-field-label">Область и район</span>
          <RegionDistrictSelect
            regions={regions}
            selectedRegionCode={district.regionCode}
            selectedDistrictCode={district.districtCode}
            onChange={district.select}
            disabled={district.setting}
          />
          {district.error ? (
            <div className="egkn-error">
              Не удалось применить район: {district.error}
            </div>
          ) : null}
        </div>

        <LayerTree
          groups={meta}
          selectedGroup={layerSel.groupName}
          onGroupChange={layerSel.selectGroup}
          selectedLayer={layerSel.layerName}
          onLayerChange={layerSel.selectLayer}
          sublayerCodes={layerSel.sublayerCodes}
          onToggleSublayer={layerSel.toggleSublayer}
          onClearSublayers={layerSel.clearSublayers}
          onSelectAllSublayers={layerSel.selectAllSublayers}
          statusCounts={statusCounts}
        />
        {pages.error ? (
          <div className="egkn-error">Ошибка: {pages.error}</div>
        ) : null}
      </aside>
      <main className="egkn-main">
        <MainContent
          hasDistrict={hasDistrict}
          districtSetting={district.setting}
          layerName={layerSel.layerName}
          items={filteredItems}
          totalLoaded={pages.totalLoaded}
          totalCount={pages.totalCount}
          loading={pages.loading}
        />
      </main>
    </>
  );
}

interface MainContentProps {
  hasDistrict: boolean;
  districtSetting: boolean;
  layerName: string | null;
  items: EgknItem[];
  totalLoaded: number;
  totalCount: number | null;
  loading: boolean;
}

function MainContent({
  hasDistrict,
  districtSetting,
  layerName,
  items,
  totalLoaded,
  totalCount,
  loading,
}: MainContentProps) {
  if (!hasDistrict) {
    return (
      <div className="egkn-empty">
        {districtSetting
          ? "Применяем район…"
          : "Сначала выберите область и район."}
      </div>
    );
  }
  if (!layerName) {
    return (
      <div className="egkn-empty">
        Выберите слой слева, чтобы загрузить участки.
      </div>
    );
  }
  return (
    <ResultsPane
      items={items}
      totalLoaded={totalLoaded}
      totalCount={totalCount}
      loading={loading}
    />
  );
}

interface ResultsPaneProps {
  items: EgknItem[];
  totalLoaded: number;
  totalCount: number | null;
  loading: boolean;
}

function ResultsPane({ items, totalLoaded, totalCount, loading }: ResultsPaneProps) {
  const [page, setPage] = useResultsPage(items);
  return (
    <>
      <header className="egkn-main-header">
        <LoadStatus
          loaded={totalLoaded}
          total={totalCount}
          loading={loading}
          shown={items.length}
        />
      </header>
      <div className="egkn-main-scroll">
        <ResultsList items={items} page={page} />
      </div>
      <footer className="egkn-main-footer">
        <Pagination page={page} totalItems={items.length} onChange={setPage} />
      </footer>
    </>
  );
}
