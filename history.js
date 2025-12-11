import { getTxHistory } from "./utils.js";

function loadTxHistory() {
  const txListElem = document.getElementById("txHistoryList");
  const txEmptyElem = document.getElementById("txHistoryEmpty");

  const items = getTxHistory();

  if (items.length === 0) {
    txEmptyElem.classList.remove("hidden");
    txListElem.classList.add("hidden");
    return;
  }

  txEmptyElem.classList.add("hidden");
  txListElem.classList.remove("hidden");

  txListElem.innerHTML = items
    .map(
      (tx) => `
        <div class="tx-item">
          <div class="tx-header">
            <span>${tx.amount} YAL</span>
            <span>${tx.date}</span>
          </div>

          <span class="tx-address">To: ${tx.to}</span>

          <a href="${tx.explorer}" target="_blank">Ver en el explorador</a>
        </div>
      `
    )
    .join("");
}

loadTxHistory();
