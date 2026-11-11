export function PageAtmosphere({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`page-atmosphere${compact ? " compact" : ""}`}
      aria-hidden="true"
    >
      <div className="page-clouds">
        <i />
        <i />
        <i />
      </div>
      <svg viewBox="0 0 900 250" preserveAspectRatio="none">
        <path
          className="page-trajectory-shadow"
          d="M-30 206 C 100 196, 174 225, 286 174 S 470 88, 560 132 S 700 136, 940 26"
        />
        <path
          className="page-trajectory-path"
          d="M-30 206 C 100 196, 174 225, 286 174 S 470 88, 560 132 S 700 136, 940 26"
        />
        <g className="page-trajectory-node node-one">
          <circle cx="286" cy="174" r="5" />
          <circle cx="286" cy="174" r="11" />
        </g>
        <g className="page-trajectory-node node-two">
          <circle cx="560" cy="132" r="5" />
          <circle cx="560" cy="132" r="11" />
        </g>
        <g className="page-trajectory-node node-three">
          <circle cx="760" cy="95" r="5" />
          <circle cx="760" cy="95" r="11" />
        </g>
      </svg>
      <span className="page-coordinate coordinate-one">DISCOVER / 01</span>
      <span className="page-coordinate coordinate-two">CONNECT / 02</span>
      <span className="page-coordinate coordinate-three">ADVANCE / 03</span>
    </div>
  );
}
