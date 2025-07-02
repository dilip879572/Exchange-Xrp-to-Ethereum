const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const xrpl = require("xrpl"); // Make sure to install it: npm i xrpl
const { Xumm } = require("xumm");

const { XummSdk } = require("xumm-sdk");







app.post("/api/exchange", async (req, res) => {
  const { fromCoin, toCoin, amount } = req.body;

  if (!fromCoin || !toCoin || !amount) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const response = await axios.get("https://api.coingecko.com/api/v3/simple/price", {
      params: {
        ids: `${fromCoin},${toCoin}`,
        vs_currencies: "usd",
      },
    });

    const fromPriceUSD = response.data[fromCoin]?.usd;
    const toPriceUSD = response.data[toCoin]?.usd;

    if (!fromPriceUSD || !toPriceUSD) {
      return res.status(400).json({ error: "Invalid coin IDs" });
    }

    const totalUSD = fromPriceUSD * amount;
    const receivedAmount = totalUSD / toPriceUSD;

    const rate = receivedAmount / amount;
    const serviceFeePercent = 0.25; // 0.25%
    const serviceFee = (receivedAmount * serviceFeePercent) / 100;
    const networkFee = 0.00038709; // Fixed fee

    const finalAmount = receivedAmount - serviceFee - networkFee;


// const txEth = await ethWallet.sendTransaction({
//   to: ethAddress,
//   value: valueToSend,
// });

    
//     return res.json({
//       xrpSent: xrpAmount,
//       ethAddress,
//       ethToReceive,
//       xrpTxHash: result.result.hash,
//       ethTxHash: txEth.hash,
//       message: "XRP sent and ETH transferred successfully.",
//     });

    return res.json({
      fromAmountValue: amount,
      toAmountValue: finalAmount.toFixed(8),
      transactionDetails: {
        rate: rate.toFixed(8),
        serviceFee: serviceFee.toFixed(8),
        serviceFeePercent: serviceFeePercent,
        networkFee: networkFee.toFixed(8),
      },
    });
 
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});



const xumm = new XummSdk(
  "9c4d630c-ac1b-425b-b818-22ff0be1a641",  // Your API Key
  "e7434c14-4580-4ece-9c56-2afe9997ee1c"   // Your API Secret
);



const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
client.connect(); // Make sure client is connected only once in your app

app.get("/account-info/:uuid", async (req, res) => {
  try {
    const { uuid } = req.params;
    const result = await xumm.payload.get(uuid);

    if (!result?.meta?.signed) {
      return res.json({ signed: false });
    }
    const account = result.response.account;
    // ✅ Fetch account info from TESTNET
    const response = await client.request({
      command: "account_info",
      account: account,
      ledger_index: "validated"
    });
    const drops = response.result.account_data.Balance;
    const balance = (parseFloat(drops) / 1_000_000).toFixed(6);
    res.json({
      signed: true,
      account,
      balance: `${balance} XRP`
    });

  } catch (err) {
    console.error("Error fetching account info:", err);
    res.status(500).json({ error: err.message });
  }
});




const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
