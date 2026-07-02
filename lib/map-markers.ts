export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const bikeSvg = `
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="5.5" cy="17.5" r="3.2"></circle>
    <circle cx="18.5" cy="17.5" r="3.2"></circle>
    <path d="M8.2 17.5 11 10.5l3.5 7"></path>
    <path d="M11 10.5h4l3.5 7"></path>
    <path d="M8.2 17.5h6.3"></path>
    <path d="M13.5 7.5h2.7"></path>
    <path d="M12.4 7.5h-2"></path>
  </svg>
`;

export function bikeMarkerHtml(title: string, className = "ride-marker") {
  return `<span class="${className}" title="${escapeHtml(title)}">${bikeSvg}</span>`;
}

export function transitMarkerHtml(title: string, type: "metro" | "mcc" | "mcd") {
  const label = type === "metro" ? "М" : type === "mcc" ? "МЦК" : "МЦД";
  return `<span class="transit-marker transit-marker--${type}" title="${escapeHtml(title)}">${label}</span>`;
}
