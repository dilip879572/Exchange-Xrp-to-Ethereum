// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const XUMM_BASE = 'https://xumm.app/api/v1/platform';

const xummHeaders = {
  'Content-Type': 'application/json',
  'x-api-key': process.env.XUMM_API_KEY,
  'x-api-secret': process.env.XUMM_API_SECRET,
};

// STEP 1: Create XUMM Payload
app.post('/api/create-payload', async (req, res) => {
  const { account, amount } = req.body;

  const payload = {
    txjson: {
      TransactionType: 'Payment',
      Destination: process.env.DESTINATION_XRP_ADDRESS, // Replace with your XRP receiving address
      Amount: (amount * 1000000).toString(),
    },
    options: {
      expire: 5,
    },
  };

  try {
    const response = await axios.post(`${XUMM_BASE}/payload`, payload, {
      headers: xummHeaders,
    });
    res.json(response.data);
  } catch (err) {
    console.error('Create Payload Error:', err.response?.data || err.message);
    res.status(500).send('Failed to create payload');
  }
});

// STEP 2: Check Payload Status
app.get('/api/payload-status/:uuid', async (req, res) => {
  const uuid = req.params.uuid;

  try {
    const response = await axios.get(`${XUMM_BASE}/payload/${uuid}`, {
      headers: xummHeaders,
    });
    res.json(response.data);
  } catch (err) {
    console.error('Payload Status Error:', err.response?.data || err.message);
    res.status(500).send('Failed to get payload status');
  }
});

// STEP 3: Exchange XRP → ETH
app.post('/api/exchange', async (req, res) => {
  const { ethAddress, toEthAmount, signedXrpTx } = req.body;

  try {
    const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
    const wallet = new ethers.Wallet(process.env.ETH_PRIVATE_KEY, provider);
    
    const tx = await wallet.sendTransaction({
      to: ethAddress,
      value: ethers.parseEther(toEthAmount.toString()),
    });

    await tx.wait();

    res.json({
      xrpTxHash: signedXrpTx,
      ethTxHash: tx.hash,
    });
  } catch (err) {
    console.error('Exchange Error:', err.message);
    res.status(500).send('ETH transfer failed');
  }
});

app.listen(4000, () => console.log('✅ Server running on http://localhost:4000'));



// const express = require('express');
// const bodyParser = require('body-parser');
// const { Client, Wallet } = require('xrpl');
// const { ethers } = require('ethers');
// const cors = require('cors');

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use(bodyParser.json());

// const port = 5000;

// // XRP client setup
// const xrpClient = new Client('wss://s.altnet.rippletest.net:51233');
// xrpClient.connect().then(() => console.log('Connected to XRP Testnet')).catch(err => console.error('XRP connection error:', err));

// // Ethereum setup
// const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/136859da75784561b898c1837c25d94e");
// const ethWallet = new ethers.Wallet('c13ee214a5c0705f8b4cdc7df4843f219c0ca64a8a8dbadc93d654aabcdfce1f', provider);

// // Helper: calculate exchange rate
// function calculateExchangeRate(fromAmount, rate) {
//   if (!fromAmount || !rate || isNaN(fromAmount) || isNaN(rate)) return 0;
//   return fromAmount * rate;
// }

// // POST /api/exchange
// app.post('/api/exchange', async (req, res) => {
//   const { fromCoin, toCoin, xrpsender, amount, ethAddress } = req.body;

//   if (!fromCoin || !toCoin || !xrpsender || !amount || !ethAddress) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   const parsedAmount = parseFloat(amount);
//   if (isNaN(parsedAmount) || parsedAmount <= 0) {
//     return res.status(400).json({ error: 'Invalid amount value' });
//   }

//   const exchangeRate = 0.00116321;
//   const serviceFee = 0.00005816;
//   const networkFee = 0.00038709;
//   const toAmount = calculateExchangeRate(parsedAmount, exchangeRate);

//   if (!toAmount || isNaN(toAmount) || toAmount <= 0) {
//     return res.status(400).json({ error: 'Failed to calculate toAmount' });
//   }

//   const transactionDetails = {
//     rate: exchangeRate,
//     serviceFee,
//     serviceFeePercent: (serviceFee / parsedAmount) * 100,
//     networkFee,
//   };

//   try {
//     const xrpWallet = Wallet.fromSecret('sEdT2knr1ap1BeuUWSrw64gwrhHGZcG');
//    const xrpTransaction = {
//   TransactionType: 'Payment',
//   Account: xrpWallet.classicAddress,
//   Destination: xrpsender,
//   Amount: (parsedAmount * 1_000_000).toString(),  // must be a string!
//   Fee: '12',
//   Flags: 2147483648,
//   LastLedgerSequence: await xrpClient.getLedgerIndex() + 5,
// };

//     const prepared = await xrpClient.autofill(xrpTransaction);
//     const signed = xrpWallet.sign(prepared);
//     const result = await xrpClient.submit(signed.tx_blob);
//     const xrpTxHash = result.result.hash;

//     // Parse ETH value safely
//     const valueToSend = ethers.parseUnits(toAmount.toString(), 'ether');

//     const txEth = await ethWallet.sendTransaction({
//       to: ethAddress,
//       value: valueToSend,
//       gasLimit: 21000,
//       gasPrice: ethers.parseUnits('20', 'gwei'),
//     });

//     return res.json({
//       xrpSent: parsedAmount,
//       xrpAddress,
//       ethAddress: ethAddress,
//       ethToReceive: toAmount.toFixed(8),
//       ethTxHash: txEth.hash,
//       transactionDetails,
//       message: "XRP sent and ETH transferred successfully.",
//     });
//   } catch (error) {
//     console.error('Error during transaction:', error);
//     return res.status(500).json({
//       error: 'Transaction failed',
//       details: error?.message || 'Unknown error',
//     });
//   }
// });

// // Start server
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });
