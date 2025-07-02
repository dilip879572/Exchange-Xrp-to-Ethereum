const express = require("express");
const xrpl = require("xrpl");
const { ethers } = require("ethers");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const XRPL_CLIENT = "wss://s.altnet.rippletest.net:51233"; // XRP Testnet
const ETH_PROVIDER = new ethers.JsonRpcProvider(process.env.INFURA_URL); // Ethereum testnet

app.post("/api/xrp-to-eth", async (req, res) => {
  const { xrpSenderSeed, ethReceiverAddress, xrpAmount } = req.body;

  try {
    // Step 1: Connect to XRPL and send XRP
    const xrpClient = new xrpl.Client(XRPL_CLIENT);
    await xrpClient.connect();

    const senderWallet = xrpl.Wallet.fromSeed(xrpSenderSeed);
    const bridgeWallet = xrpl.Wallet.fromSeed(process.env.XRPL_SEED);

    // Create the transaction to send XRP to the bridge wallet
    const tx = {
      TransactionType: "Payment",
      Account: senderWallet.address,
      Destination: bridgeWallet.address,
      Amount: xrpl.xrpToDrops(xrpAmount),
    };

    const prepared = await xrpClient.autofill(tx);
    const signed = senderWallet.sign(prepared);
    const result = await xrpClient.submitAndWait(signed.tx_blob);
    await xrpClient.disconnect();

    if (result.result.meta.TransactionResult !== "tesSUCCESS") {
      return res.status(400).json({ error: "XRP payment failed" });
    }

    // Step 2: Send ETH in return
    const ethWallet = new ethers.Wallet(process.env.ETH_PRIVATE_KEY, ETH_PROVIDER);

    // Exchange rate: 100 XRP = 0.01 ETH
    const ethAmount = (parseFloat(xrpAmount) / 10000).toFixed(6);  // Convert XRP to ETH
    const tx2 = await ethWallet.sendTransaction({
      to: ethReceiverAddress,
      value: ethers.parseEther(ethAmount),
    });

    await tx2.wait();

    res.json({
      message: "XRP received and ETH sent",
      ethTxHash: tx2.hash,
      xrpTxHash: result.result.hash,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Bridge transaction failed" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Bridge API running on port ${PORT}`));
