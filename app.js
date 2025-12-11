import { saveTx, longAddress } from "./utils.js";

const TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const EXPECTED_CHAIN_ID = null;

const TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

const translations = {
  es: {
    headerTitle: "Yalibe Wallet",
    headerSubtitle: "Conecta tu wallet y consulta tus YAL de forma segura.",
    connectButton: "Conectar MetaMask",
    connectionTitle: "Estado de conexión",
    statusDisconnected: "No conectado",
    statusConnected: "Conectado",
    statusWrongNetwork: "Conectado, pero en una red distinta a la esperada.",
    accountLabel: "Cuenta:",
    networkLabel: "Red:",
    balanceTitle: "Balance de Yalibe (YAL)",
    tokenLabel: "Token:",
    balanceLabel: "Tu balance:",
    refreshButton: "Actualizar balance",
    transferTitle: "Enviar YAL",
    toLabel: "Dirección de destino",
    amountLabel: "Cantidad de YAL",
    sendButton: "Enviar tokens",
    footerText: "Yalibe · Fase 1 — Wallet DApp básica",
    modalTitle: "Confirmar envío",
    modalToLabel: "Dirección de destino",
    modalAmountLabel: "Cantidad a enviar",
    modalCheckbox: "Confirmo que la información es correcta y deseo continuar.",
    modalConfirm: "Confirmar",
    modalCancel: "Cancelar",
    alertTxSending: "Enviando transacción...",
    alertTxPending: "Transacción enviada. Esperando confirmación...",
    alertTxSuccess: "Transacción confirmada correctamente.",
    alertTxFailed: "La transacción falló.",
    alertTxError: "Ocurrió un error al enviar la transacción.",
    errorNoMetamask: "No se detectó MetaMask. Instálalo para usar la DApp.",
    errorInvalidAddress: "La dirección de destino no es válida.",
    errorInvalidAmount: "Ingresa una cantidad mayor a 0."
  },
  en: {
    headerTitle: "Yalibe Wallet",
    headerSubtitle: "Connect your wallet and check your YAL safely.",
    connectButton: "Connect MetaMask",
    connectionTitle: "Connection status",
    statusDisconnected: "Not connected",
    statusConnected: "Connected",
    statusWrongNetwork: "Connected, but on a different network than expected.",
    accountLabel: "Account:",
    networkLabel: "Network:",
    balanceTitle: "Yalibe balance (YAL)",
    tokenLabel: "Token:",
    balanceLabel: "Your balance:",
    refreshButton: "Refresh balance",
    transferTitle: "Send YAL",
    toLabel: "Destination address",
    amountLabel: "Amount of YAL",
    sendButton: "Send tokens",
    footerText: "Yalibe · Phase 1 — Basic Wallet DApp",
    modalTitle: "Confirm transfer",
    modalToLabel: "Destination address",
    modalAmountLabel: "Amount to send",
    modalCheckbox: "I confirm the information is correct and I want to continue.",
    modalConfirm: "Confirm",
    modalCancel: "Cancel",
    alertTxSending: "Sending transaction...",
    alertTxPending: "Transaction sent. Waiting for confirmation...",
    alertTxSuccess: "Transaction confirmed successfully.",
    alertTxFailed: "The transaction failed.",
    alertTxError: "An error occurred while sending the transaction.",
    errorNoMetamask: "MetaMask was not detected. Install it to use the DApp.",
    errorInvalidAddress: "The destination address is not valid.",
    errorInvalidAmount: "Enter an amount greater than 0."
  }
};

let provider;
let signer;
let tokenContract;
let currentAccount = null;
let tokenDecimals = 18;
let tokenSymbol = "YAL";
let currentLang = localStorage.getItem("yalibe_lang") || "en";
let pendingTo = null;
let pendingAmount = null;

const headerTitle = document.getElementById("headerTitle");
const headerSubtitle = document.getElementById("headerSubtitle");
const historyButton = document.getElementById("historyButton");
const connectButton = document.getElementById("connectButton");
const connectionTitle = document.getElementById("connectionTitle");
const connectionStatus = document.getElementById("connectionStatus");
const accountLabel = document.getElementById("accountLabel");
const accountAddress = document.getElementById("accountAddress");
const networkLabel = document.getElementById("networkLabel");
const networkName = document.getElementById("networkName");
const balanceTitle = document.getElementById("balanceTitle");
const tokenLabel = document.getElementById("tokenLabel");
const tokenSymbolSpan = document.getElementById("tokenSymbol");
const balanceLabel = document.getElementById("balanceLabel");
const tokenBalance = document.getElementById("tokenBalance");
const refreshBalanceBtn = document.getElementById("refreshBalance");
const transferTitle = document.getElementById("transferTitle");
const toLabel = document.getElementById("toLabel");
const amountLabel = document.getElementById("amountLabel");
const transferForm = document.getElementById("transferForm");
const toAddressInput = document.getElementById("toAddress");
const amountInput = document.getElementById("amount");
const sendButton = document.getElementById("sendButton");
const footerText = document.getElementById("footerText");
const transferAlert = document.getElementById("transferAlert");
const langButtons = document.querySelectorAll(".lang-btn");

const confirmModal = document.getElementById("confirmModal");
const modalTitle = document.getElementById("modalTitle");
const modalToLabel = document.getElementById("modalToLabel");
const modalAmountLabel = document.getElementById("modalAmountLabel");
const modalToValue = document.getElementById("modalToValue");
const modalAmountValue = document.getElementById("modalAmountValue");
const modalCheckboxLabel = document.getElementById("modalCheckboxLabel");
const modalConfirmCheck = document.getElementById("modalConfirmCheck");
const modalConfirm = document.getElementById("modalConfirm");
const modalCancel = document.getElementById("modalCancel");

const errorModal = document.getElementById("errorModal");
const errorModalTitle = document.getElementById("errorModalTitle");
const errorModalMessage = document.getElementById("errorModalMessage");
const errorModalClose = document.getElementById("errorModalClose");

historyButton.addEventListener("click", () => {
  window.location.href = "history.html";
});


function applyTranslations() {
  const t = translations[currentLang];
  headerTitle.textContent = t.headerTitle;
  headerSubtitle.textContent = t.headerSubtitle;
  connectButton.textContent = t.connectButton;
  connectionTitle.textContent = t.connectionTitle;
  accountLabel.textContent = t.accountLabel;
  networkLabel.textContent = t.networkLabel;
  balanceTitle.textContent = t.balanceTitle;
  tokenLabel.textContent = t.tokenLabel;
  balanceLabel.textContent = t.balanceLabel;
  refreshBalanceBtn.textContent = t.refreshButton;
  transferTitle.textContent = t.transferTitle;
  toLabel.childNodes[0].nodeValue = t.toLabel + " ";
  amountLabel.childNodes[0].nodeValue = t.amountLabel + " ";
  sendButton.textContent = t.sendButton;
  footerText.textContent = t.footerText;
  modalTitle.textContent = t.modalTitle;
  modalToLabel.textContent = t.modalToLabel;
  modalAmountLabel.textContent = t.modalAmountLabel;
  modalCheckboxLabel.textContent = t.modalCheckbox;
  modalConfirm.textContent = t.modalConfirm;
  modalCancel.textContent = t.modalCancel;
  if (!currentAccount) {
    setConnectionStatus("disconnected");
  }
}

function setConnectionStatus(state) {
  const t = translations[currentLang];
  if (state === "connected") {
    connectionStatus.textContent = t.statusConnected;
    connectionStatus.className = "status status-success";
  } else if (state === "wrongNetwork") {
    connectionStatus.textContent = t.statusWrongNetwork;
    connectionStatus.className = "status status-warning";
  } else if (state === "error") {
    connectionStatus.textContent = t.alertTxError;
    connectionStatus.className = "status status-error";
  } else {
    connectionStatus.textContent = t.statusDisconnected;
    connectionStatus.className = "status status-warning";
  }
}

function setAlert(type, message) {
  transferAlert.textContent = message;
  if (!message) {
    transferAlert.className = "alert hidden";
    return;
  }
  if (type === "success") {
    transferAlert.className = "alert alert-success";
  } else if (type === "error") {
    transferAlert.className = "alert alert-error";
  } else {
    transferAlert.className = "alert alert-info";
  }
}

function clearAlert() {
  setAlert("", "");
}

function shortenAddress(addr) {
  if (!addr) return "—";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

async function connectWallet() {
  clearAlert();
  try {
    if (!window.ethereum) {
      openErrorModal("errorNoMetamask");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    currentAccount = accounts[0];
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();

    const network = await provider.getNetwork();
    networkName.textContent = network.name
      ? `${network.name} (chainId: ${network.chainId})`
      : `chainId: ${network.chainId}`;

    if (EXPECTED_CHAIN_ID && network.chainId !== parseInt(EXPECTED_CHAIN_ID, 16)) {
      setConnectionStatus("wrongNetwork");
    } else {
      setConnectionStatus("connected");
    }

    accountAddress.textContent = shortenAddress(currentAccount);
    tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
    await loadTokenMetadata();
    await loadBalance();
    refreshBalanceBtn.disabled = false;
    sendButton.disabled = false;
  } catch (error) {
    console.error(error);
    setConnectionStatus("error");
  }
}

async function loadTokenMetadata() {
  try {
    const [symbol, decimals] = await Promise.all([
      tokenContract.symbol(),
      tokenContract.decimals()
    ]);
    tokenSymbol = symbol;
    tokenDecimals = decimals;
    tokenSymbolSpan.textContent = tokenSymbol;
  } catch (error) {
    console.warn(error);
  }
}

async function loadBalance() {
  if (!tokenContract || !currentAccount) return;
  try {
    const rawBalance = await tokenContract.balanceOf(currentAccount);
    const formatted = ethers.utils.formatUnits(rawBalance, tokenDecimals);
    tokenBalance.textContent = `${formatted} ${tokenSymbol}`;
  } catch (error) {
    console.error(error);
    tokenBalance.textContent = "Error";
  }
}

function openConfirmModal(to, amount) {
  const t = translations[currentLang];
  modalToValue.textContent = longAddress(to);
  modalAmountValue.textContent = `${amount} ${tokenSymbol}`;
  modalConfirmCheck.checked = false;
  modalConfirm.disabled = true;

  modalTitle.textContent = t.modalTitle;
  modalToLabel.textContent = t.modalToLabel;
  modalAmountLabel.textContent = t.modalAmountLabel;
  modalCheckboxLabel.textContent = t.modalCheckbox;
  modalConfirm.textContent = t.modalConfirm;
  modalCancel.textContent = t.modalCancel;

  confirmModal.classList.remove("hidden");
  confirmModal.classList.add("active");
}

function closeConfirmModal() {
  confirmModal.classList.remove("active");
  confirmModal.classList.add("hidden");
}

function openErrorModal(messageKeyOrText, fromTranslations = true) {
  const t = translations[currentLang];

  errorModalTitle.textContent = currentLang === "es" ? "Error" : "Error";

  if (fromTranslations && t[messageKeyOrText]) {
    errorModalMessage.textContent = t[messageKeyOrText];
  } else {
    errorModalMessage.textContent = messageKeyOrText;
  }

  errorModal.classList.remove("hidden");
  errorModal.classList.add("active");
}

function closeErrorModal() {
  errorModal.classList.remove("active");
  errorModal.classList.add("hidden");
}

errorModalClose.addEventListener("click", closeErrorModal);



async function sendTokens(to, amount) {
  const t = translations[currentLang];
  if (!tokenContract || !signer) {
    openErrorModal("errorNoMetamask");
    return;
  }
  try {
    setAlert("info", t.alertTxSending);
    const amountWei = ethers.utils.parseUnits(amount, tokenDecimals);
    const tx = await tokenContract.transfer(to, amountWei);
    setAlert("info", t.alertTxPending);
    const receipt = await tx.wait();
    if (receipt.status === 1) {
      saveTx({
        to,
        amount,
        date: new Date().toLocaleString(),
        explorer: `https://sepolia.etherscan.io/tx/${tx.hash}`
      });
      setAlert("success", t.alertTxSuccess);
      await loadBalance();
      amountInput.value = "";
      toAddressInput.value = "";
    } else {
      setAlert("error", t.alertTxFailed);
    }
  } catch (error) {
    console.error(error);
    setAlert("error", t.alertTxError);
  }
}

async function handleTransfer(event) {
  event.preventDefault();
  clearAlert();
  const t = translations[currentLang];

  if (!tokenContract || !signer) {
    openErrorModal("errorNoMetamask");
    return;
  }

  const to = toAddressInput.value.trim();
  const amount = amountInput.value.trim();

  if (!ethers.utils.isAddress(to)) {
    openErrorModal("errorInvalidAddress");
    return;
  }

  if (!amount || Number(amount) <= 0) {
    openErrorModal("errorInvalidAmount");
    return;
  }

  pendingTo = to;
  pendingAmount = amount;
  openConfirmModal(to, amount);
}

connectButton.addEventListener("click", connectWallet);
refreshBalanceBtn.addEventListener("click", loadBalance);
transferForm.addEventListener("submit", handleTransfer);

modalConfirmCheck.addEventListener("change", () => {
  modalConfirm.disabled = !modalConfirmCheck.checked;
});

modalCancel.addEventListener("click", () => {
  closeConfirmModal();
});

modalConfirm.addEventListener("click", async () => {
  closeConfirmModal();
  if (pendingTo && pendingAmount) {
    sendButton.disabled = true;
    await sendTokens(pendingTo, pendingAmount);
    sendButton.disabled = false;
    pendingTo = null;
    pendingAmount = null;
  }
});

langButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const lang = btn.getAttribute("data-lang");
    if (lang === currentLang) return;
    currentLang = lang;
    localStorage.setItem("yalibe_lang", currentLang);
    langButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    applyTranslations();
  });
});

if (window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length === 0) {
      currentAccount = null;
      accountAddress.textContent = "—";
      tokenBalance.textContent = "—";
      networkName.textContent = "—";
      refreshBalanceBtn.disabled = true;
      sendButton.disabled = true;
      setConnectionStatus("disconnected");
    } else {
      currentAccount = accounts[0];
      accountAddress.textContent = shortenAddress(currentAccount);
      loadBalance();
    }
  });

  window.ethereum.on("chainChanged", () => {
    window.location.reload();
  });
}

langButtons.forEach((btn) => {
  if (btn.getAttribute("data-lang") === currentLang) {
    btn.classList.add("active");
  } else {
    btn.classList.remove("active");
  }
});

applyTranslations();
setConnectionStatus("disconnected");
