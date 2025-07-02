const express = require('express');
const xrpl = require('xrpl');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = 4000;

// Body Parser Middleware
app.use(bodyParser.json());

// Endpoint to listen for incoming XRP transactions
app.post('/api/handle-xrp', async (req, res) => {
  const { account, sendAmount, ethAddress } = req.body;

  if (!account || !sendAmount || !ethAddress) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Connect to the XRP Ledger
    const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();

    // Subscribe to the account for incoming transactions
    await client.request({
      command: 'subscribe',
      accounts: [account],
    });

    client.on('transaction', async (tx) => {
      // Log the full transaction to inspect its structure
      console.log('Transaction received:', JSON.stringify(tx, null, 2));

      const transaction = tx.transaction;
      const txHash = transaction.hash || tx.hash || xrpl.computeTransactionHash(transaction);

      // If the transaction matches the destination account and has a valid amount
      if (transaction.Destination === account && transaction.Amount) {
        console.log(`Received transaction: ${txHash}`);
        
        // Convert XRP to ETH (Exchange Logic)
        const ethTxHash = await performXRPToETHConversion(txHash, sendAmount, ethAddress);
        
        // Return a response with the exchange result
        res.json({
          message: 'Exchange success',
          xrpTxHash: txHash,
          ethTxHash: ethTxHash,
        });
      }
    });
  } catch (error) {
    console.error('Error listening for XRP transactions:', error);
    res.status(500).json({ message: 'Failed to process transaction' });
  }
});

// Simulate the conversion of XRP to ETH (you would typically use a service like Uniswap or an exchange API here)
async function performXRPToETHConversion(xrpTxHash, sendAmount, ethAddress) {
  // Example logic: You would need to fetch real conversion rates
  console.log(`Converting ${sendAmount} XRP to ETH and sending to: ${ethAddress}`);

  // Fetch current XRP to ETH conversion rate (dummy rate here, replace with real API)
  const xrpToEthRate = 0.0003; // Example: 1 XRP = 0.0003 ETH (this will vary)
  const ethAmount = sendAmount * xrpToEthRate;

  // Simulate the transaction hash for the ETH transaction
  console.log(`Sending ${ethAmount} ETH to ${ethAddress}`);

  // In real-life, you would interact with Ethereum network to send ETH
  // (via a Web3 or Ethers.js client). For simplicity, return a fake ETH TxHash
  const ethTxHash = '0x1234567890abcdef';

  // Return the ETH transaction hash
  return ethTxHash;
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
