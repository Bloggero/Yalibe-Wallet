// =========================
//  UTILIDADES GLOBALES YALIBE
// =========================

// Guarda una transacción en localStorage
export function saveTx(tx) {
  const existing = JSON.parse(localStorage.getItem("yalibe_tx_history") || "[]");
  existing.unshift(tx);
  localStorage.setItem("yalibe_tx_history", JSON.stringify(existing.slice(0, 10)));
}

// Obtiene el historial completo
export function getTxHistory() {
  return JSON.parse(localStorage.getItem("yalibe_tx_history") || "[]");
}

// Dirección acortada pero segura
export function longAddress(addr) {
  if (!addr) return "—";
  return addr.slice(0, 12) + "..." + addr.slice(-6);
}
