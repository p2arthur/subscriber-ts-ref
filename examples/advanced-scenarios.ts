import { AlgorandClient } from "../src";

/**
 * Example: Advanced transaction scenarios.
 *
 * This example demonstrates how to:
 * - Use custom transaction parameters
 * - Build transactions manually for advanced use cases
 * - Handle special scenarios like rekeying and close-out
 * - Work with microalgos and precision
 *
 * ## Manual Transaction Building
 *
 * Build a transaction manually for fine-grained control:
 *
 * {@includeCode ./advanced-scenarios.ts#manual}
 *
 * ## Close Out Assets
 *
 * Close out an asset position and return funds:
 *
 * {@includeCode ./advanced-scenarios.ts#closeout}
 *
 * ## Multi-Signature Transactions
 *
 * Build and sign transactions with multiple signers:
 *
 * {@includeCode ./advanced-scenarios.ts#multisig}
 *
 * @returns Transaction results
 */
export async function advancedTransactionExample() {
  const algorand = AlgorandClient.fromEnvironment();
  const sender = await algorand.account.fromEnvironment("SENDER");
  const receiver = await algorand.account.fromEnvironment("RECEIVER");

  //#region manual
  // Build a payment transaction manually with custom parameters
  const result = await algorand.send.payment({
    sender: sender.addr,
    receiver: receiver.addr,
    amount: 1000000n,
    lease: "test-lease-123", // Prevents duplicate submissions within lease period
    note: Buffer.from("Custom payment").toString("base64"),
  });

  console.log(`Manual transaction sent: ${result.txId}`);
  //#endregion manual

  //#region closeout
  // Close out an asset and send remaining to clawback address
  const assetCloseResult = await algorand.send.assetTransfer({
    sender: sender.addr,
    receiver: receiver.addr,
    assetId: 1n,
    amount: 0n, // Transfer 0 to close out
    closeAssetTo: sender.addr, // Send remaining funds to this address
  });

  console.log(`Asset closed out: ${assetCloseResult.txId}`);
  //#endregion closeout

  //#region multisig
  // For multi-signature accounts, you would typically:
  // 1. Build the transaction
  // 2. Get it signed by all parties
  // 3. Combine signatures
  // Note: This example shows the structure

  const multisigAccount = {
    addr: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HVY",
    // Multi-sig details would be stored separately
  };

  try {
    const multisigResult = await algorand.send.payment({
      sender: multisigAccount.addr,
      receiver: receiver.addr,
      amount: 1000000n,
    });
    console.log(`Multi-sig transaction: ${multisigResult.txId}`);
  } catch (error) {
    console.log("Multi-sig transaction requires additional setup");
  }
  //#endregion multisig

  return { result, assetCloseResult };
}

/**
 * Example: Disaster recovery and chain recovery operations.
 *
 * Handle critical scenarios like chain recovery:
 *
 * {@includeCode ./advanced-scenarios.ts#recovery}
 *
 */
export async function chainRecoveryExample() {
  //#region recovery
  const algorand = AlgorandClient.fromEnvironment();

  // Get current network status
  const status = await algorand.client.algod.status().do();
  console.log(`Current round: ${status["last-round"]}`);
  console.log(`Sync time: ${status["time-since-last-round"]}ms`);

  // Check if node is catching up
  if (status["catching-up"]) {
    console.log("Node is catching up to the network");
  }

  // Get network parameters
  const params = await algorand.client.algod.getTransactionParams().do();
  console.log(`Min fee: ${params.minFee} microAlgos`);
  console.log(`Round: ${params.lastRound}`);
  console.log(`Genesis ID: ${params.genesisID}`);

  // Retry a failed transaction with updated parameters
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const sender = await algorand.account.fromEnvironment("SENDER");
      const result = await algorand.send.payment({
        sender: sender.addr,
        receiver: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HVY",
        amount: 1000000n,
      });
      console.log(`Transaction succeeded: ${result.txId}`);
      break;
    } catch (error) {
      attempt++;
      console.log(`Attempt ${attempt} failed, retrying...`);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      }
    }
  }
  //#endregion recovery
}

/**
 * Example: Monitor and handle transactions.
 *
 * Wait for transaction confirmations and handle timeouts:
 *
 * {@includeCode ./advanced-scenarios.ts#monitor}
 *
 */
export async function monitorTransactionExample() {
  //#region monitor
  const algorand = AlgorandClient.fromEnvironment();
  const sender = await algorand.account.fromEnvironment("SENDER");

  // Send a transaction
  const txnResult = await algorand.send.payment({
    sender: sender.addr,
    receiver: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HVY",
    amount: 1000000n,
  });

  console.log(`Transaction submitted: ${txnResult.txId}`);

  // Wait for confirmation with timeout
  const maxRounds = 5;
  let currentRound = txnResult.confirmedRound || 0;

  const confirmationLoop = setInterval(async () => {
    try {
      const status = await algorand.client.algod.status().do();
      const latestRound = status["last-round"];

      if (latestRound - currentRound > maxRounds) {
        clearInterval(confirmationLoop);
        console.log("Transaction confirmation timeout");
        return;
      }

      const txnInfo = await algorand.client.algod
        .pendingTransactionInformation(txnResult.txId)
        .do();

      if (txnInfo["confirmed-round"]) {
        clearInterval(confirmationLoop);
        console.log(
          `Transaction confirmed in round ${txnInfo["confirmed-round"]}`,
        );
      }
    } catch (error) {
      // Transaction not found yet (still pending)
      currentRound = latestRound;
    }
  }, 1000);
  //#endregion monitor
}
