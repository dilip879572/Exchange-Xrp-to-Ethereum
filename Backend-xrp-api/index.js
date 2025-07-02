const express = require("express");
const cors = require("cors");

const xrpl = require("xrpl"); // Make sure to install it: npm i xrpl
const { Xumm } = require("xumm");

const { XummSdk } = require("xumm-sdk");
const app = express();
app.use(cors());
app.use(express.json());


// const { Token } = require("parse5");
const xumm = new XummSdk(
  "9c4d630c-ac1b-425b-b818-22ff0be1a641",  // Your API Key
  "e7434c14-4580-4ece-9c56-2afe9997ee1c"   // Your API Secret
);

app.post("/create-payload", async (req, res) => {
    try {
      const { destinationAddress, amountXRP } = req.body;
  
      if (!destinationAddress || !amountXRP) {
        throw new Error("Destination address and amount are required");
      }
  
      if (!destinationAddress.startsWith('r') || destinationAddress.length < 25) {
        throw new Error("Invalid destination XRP address");
      }
  
      const payload = {
        TransactionType: "Payment",
        Destination: destinationAddress,
        Amount: (parseFloat(amountXRP) * 1000000).toString(), // XRP to drops
      };
  
      // Attempt to create the payload
      const created = await xumm.payload.create(payload);
  
      // Log the full response for debugging
      console.log("Payload creation response:", created);
  
      // Check if the payload creation was successful
      if (!created || !created.uuid) {
        throw new Error("Failed to create payload");
      }
  
      res.json({
        qrUrl: `https://xumm.app/sign/${created.uuid}`,
        payloadUuid: created.uuid,
        websocket: created.refs.websocket_status
      });
      
  
    } catch (error) {
      console.error("Error creating payload:", error.message || error);
      res.status(500).json({ error: error.message || "Error creating payload" });
    }
  });
  
  // Add this new endpoint to your server.js
  app.get("/get-account-info/:payloadUuid", async (req, res) => {
    try {
      const { payloadUuid } = req.params;
      const payloadResult = await xumm.payload.get(payloadUuid);
  
      const isSigned = payloadResult.meta.signed;
  
      if (!isSigned) {
        return res.json({
          transactionStatus: "unsigned",
          message: "Transaction not signed yet",
        });
      }
  
      const accountAddress = payloadResult.response.account;
  
      if (!accountAddress) {
        throw new Error("Signed but account info not available");
      }
  
      const xrpl = require("xrpl");
      const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
      await client.connect();
  
      const accountInfo = await client.request({
        command: "account_info",
        account: accountAddress,
        ledger_index: "validated"
      });
  
      await client.disconnect();
  
      const balance = accountInfo.result.account_data.Balance / 1000000;
      res.json({
        account: accountAddress,
        balance,
        transactionStatus: "signed"
      });
  
    } catch (error) {
      console.error("❌ Error fetching account info:", error.message || error);
      res.status(500).json({ error: error.message || "Error fetching account info" });
    }
  });
  
  








  app.post("/create-payload", async (req, res) => {
    try {
      const { destinationAddress, amountXRP } = req.body;
  
      if (!destinationAddress || !amountXRP) {
        throw new Error("Destination address and amount are required");
      }
  
      if (!destinationAddress.startsWith('r') || destinationAddress.length < 25) {
        throw new Error("Invalid destination XRP address");
      }
  
      const payload = {
        TransactionType: "Payment",
        Destination: destinationAddress,
        Amount: (parseFloat(amountXRP) * 1000000).toString(),
      };
  
      const created = await xumm.payload.create(payload);
  
      res.json({
        qrUrl: `https://xumm.app/sign/${created.uuid}`,
        payloadUuid: created.uuid,
        websocket: created.refs.websocket_status
      });
  
    } catch (error) {
      console.error("Error creating payload:", error.message || error);
      res.status(4000).json({ error: error.message || "Error creating payload" });
    }
  });


// Step 1: Sign-in payload (QR code)
// Sign-in endpoint: creates a payload





app.post("/signin", async (req, res) => {
  try {
    const payload = await xumm.payload.create({
      txjson: { TransactionType: "SignIn" },
    });

    res.json({
      qrUrl: `https://xumm.app/sign/${payload.uuid}`,
      payloadUuid: payload.uuid,
      websocket: payload.refs.websocket_status,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





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

















  
const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

