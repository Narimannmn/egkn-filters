interface LoadStatusProps {
  loaded: number;
  total: number | null;
  loading: boolean;
  shown: number;
}

export function LoadStatus({ loaded, total, loading, shown }: LoadStatusProps) {
  const pct =
    total != null && total > 0 ? Math.min(100, (loaded / total) * 100) : 0;
  return (
    <div className="egkn-status">
      <div className="egkn-status-row">
        <span>
          {loading ? "Загружено" : "Готово"}{" "}
          <b key={`loaded-${loaded}`} className="egkn-stat-num">
            {loaded}
          </b>
          {total != null ? (
            <>
              {" "}из{" "}
              <b key={`total-${total}`} className="egkn-stat-num">
                {total}
              </b>
            </>
          ) : null}
        </span>
        <span className="egkn-status-shown">
          Показано{" "}
          <b key={`shown-${shown}`} className="egkn-stat-num">
            {shown}
          </b>
        </span>
      </div>
      {total != null && total > 0 ? (
        <div
          className={`egkn-progress ${loading ? "is-loading" : ""}`}
          aria-hidden="true"
        >
          <div className="egkn-progress-bar" style={{ width: `${pct}%` }} />
        </div>
      ) : null}
    </div>
  );
}
