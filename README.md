# Yalibe Wallet

Mini dApp to connect MetaMask and manage a custom ERC20 token (YAL).

## What it does
- Requests MetaMask connection and shows current account/network.
- Instantiates the ERC20 at `TOKEN_ADDRESS`.
- Reads symbol/decimals to format balances.
- Fetches user balance via `balanceOf`.
- Sends tokens with `transfer`, disables buttons while pending, refreshes balance on confirmation.
- Listens to account/network changes in MetaMask and reloads/updates state.

## Requirements
- Browser with MetaMask or another `window.ethereum` provider.
- Ethers.js v5 (already loaded via CDN in `index.html`).

## How to use
1. In `app.js`, replace `TOKEN_ADDRESS` with your YAL ERC20 contract address.
2. (Optional) Set `EXPECTED_CHAIN_ID` to the chainId in hex (e.g. `0x5` for Goerli) to flag a mismatched network.
3. Open `index.html` via a static server or directly in the browser.
4. Click `Connect MetaMask` and approve; the formatted address and detected network will appear.
5. Use `Refresh balance` to read the current YAL balance.
6. To send, enter destination address and amount, then click `Send tokens`; transaction status appears below.

## Notes
- The send form and balance button enable only after connecting and creating the contract instance.
- If MetaMask account changes, balance is refreshed; if the network changes, the page reloads to avoid inconsistent state.
