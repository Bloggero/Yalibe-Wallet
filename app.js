const TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const EXPECTED_CHAIN_ID = null;

const TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

let provider;
let signer;
let tokenContract;
let currentAccount = null;
let tokenDecimals = 18;
let tokenSymbol = "YAL";

const connectButton = document.getElementById("connectButton");
const connectionStatus = document.getElementById("connectionStatus");
const accountAddress = document.getElementById("accountAddress");
const networkName = document.getElementById("networkName");
const tokenBalance = document.getElementById("tokenBalance");
const tokenSymbolSpan = document.getElementById("tokenSymbol");
const refreshBalanceBtn = document.getElementById("refreshBalance");
const transferForm = document.getElementById("transferForm");
const toAddressInput = document.getElementById("toAddress");
const amountInput = document.getElementById("amount");
const sendButton = document.getElementById("sendButton");
const txStatus = document.getElementById("txStatus");

async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("No se detectó MetaMask. Instálalo para usar la DApp.");
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
      connectionStatus.textContent = "Conectado, pero en una red distinta a la esperada.";
      connectionStatus.className = "status status-warning";
    } else {
      connectionStatus.textContent = "Conectado";
      connectionStatus.className = "status status-success";
    }

    accountAddress.textContent = shortenAddress(currentAccount);

    tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);

    await loadTokenMetadata();
    await loadBalance();

    refreshBalanceBtn.disabled = false;
    sendButton.disabled = false;
  } catch (error) {
    console.error(error);
    connectionStatus.textContent = "Error al conectar";
    connectionStatus.className = "status status-error";
  }
}

function shortenAddress(addr) {
  if (!addr) return "—";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
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
    console.warn("No se pudieron cargar name/symbol/decimals:", error);
  }
}

async function loadBalance() {
  if (!tokenContract || !currentAccount) return;

  try {
    const rawBalance = await tokenContract.balanceOf(currentAccount);
    const formatted = ethers.utils.formatUnits(rawBalance, tokenDecimals);
    tokenBalance.textContent = `${formatted} ${tokenSymbol}`;
  } catch (error) {
    console.error("Error al cargar balance:", error);
    tokenBalance.textContent = "Error al obtener balance";
  }
}

async function handleTransfer(event) {
  event.preventDefault();
  txStatus.textContent = "";

  if (!tokenContract || !signer) {
    alert("Primero conecta tu wallet.");
    return;
  }

  const to = toAddressInput.value.trim();
  const amount = amountInput.value.trim();

  if (!ethers.utils.isAddress(to)) {
    alert("La dirección de destino no es válida.");
    return;
  }

  if (!amount || Number(amount) <= 0) {
    alert("Ingresa una cantidad mayor a 0.");
    return;
  }

  try {
    sendButton.disabled = true;
    txStatus.textContent = "Enviando transacción...";

    const amountWei = ethers.utils.parseUnits(amount, tokenDecimals);
    const tx = await tokenContract.transfer(to, amountWei);

    txStatus.textContent = `Transacción enviada. Esperando confirmación... (hash: ${tx.hash.slice(
      0,
      10
    )}...)`;

    const receipt = await tx.wait();

    if (receipt.status === 1) {
      txStatus.textContent = "✅ Transacción confirmada correctamente.";
      await loadBalance();
      amountInput.value = "";
    } else {
      txStatus.textContent = "⚠️ La transacción falló.";
    }
  } catch (error) {
    console.error(error);
    txStatus.textContent = "❌ Error al enviar la transacción.";
  } finally {
    sendButton.disabled = false;
  }
}

connectButton.addEventListener("click", connectWallet);
refreshBalanceBtn.addEventListener("click", loadBalance);
transferForm.addEventListener("submit", handleTransfer);

if (window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length === 0) {
      currentAccount = null;
      accountAddress.textContent = "—";
      tokenBalance.textContent = "—";
      connectionStatus.textContent = "No conectado";
      connectionStatus.className = "status status-warning";
      sendButton.disabled = true;
      refreshBalanceBtn.disabled = true;
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
