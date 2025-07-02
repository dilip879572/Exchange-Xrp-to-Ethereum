const xrpl = require("xrpl");
async function createCustomToken() {
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();

  // 🔼 Define this at the top
  function encodeCurrency(currencyName) {
    const buf = Buffer.alloc(20); // 20 bytes
    buf.write(currencyName, "utf8");
    return buf.toString("hex").toUpperCase(); // 40-character hex string
  }
  const hexCurrency = encodeCurrency("MyToken");

  // 1. Generate issuer and hot wallets
  const issuerWallet = xrpl.Wallet.generate();
  const hotWallet = xrpl.Wallet.generate();
  console.log("Issuer Address:", issuerWallet.address);
  console.log("Hot Address:", hotWallet.address);

  // 2. Fund both wallets from testnet faucet
  await client.fundWallet(issuerWallet);
  await client.fundWallet(hotWallet);
  console.log("Wallets funded");

  // 3. Configure issuer account with defaultRipple flag
  const issuerSettingsTx = {
    TransactionType: "AccountSet",
    Account: issuerWallet.address,
    SetFlag: xrpl.AccountSetAsfFlags.asfDefaultRipple,
  };
  await client.submitAndWait(issuerSettingsTx, { wallet: issuerWallet });
  console.log("Issuer account configured");

  // 4. Configure hot wallet (optional)
  const hotSettingsTx = {
    TransactionType: "AccountSet",
    Account: hotWallet.address,
    SetFlag: xrpl.AccountSetAsfFlags.asfDefaultRipple,
  };
  await client.submitAndWait(hotSettingsTx, { wallet: hotWallet });
  console.log("Hot account configured");

  // 5. Set trust line from hot wallet to issuer
  const trustSetTx = {
    TransactionType: "TrustSet",
    Account: hotWallet.address,
    LimitAmount: {
      currency: hexCurrency,
      issuer: issuerWallet.address,
      value: "1000000",
    },
  };
  await client.submitAndWait(trustSetTx, { wallet: hotWallet });
  console.log("Trust line established");

  // 6. Issue custom token from issuer to hot wallet
  const tokenPaymentTx = {
    TransactionType: "Payment",
    Account: issuerWallet.address,
    Destination: hotWallet.address,
    Amount: {
      currency: hexCurrency,
      issuer: issuerWallet.address,
      value: "1000",
    },
  };
  await client.submitAndWait(tokenPaymentTx, { wallet: issuerWallet });
  console.log("Token issued to hot wallet");

  // 7. Confirm balance of custom token in hot wallet
  const hotBalance = await client.request({
    command: "account_lines",
    account: hotWallet.address,
  });

  console.log("Custom Token Balances in Hot Wallet:");
  console.dir(hotBalance.result.lines, { depth: null });
  await client.disconnect();
}
createCustomToken();

