import { AlgorandClient } from "../src";

/**
 * Example: Sending different types of transactions.
 *
 * This example demonstrates how to:
 * - Send payment transactions
 * - Create and transfer assets (ASAs)
 * - Opt-in to assets
 * - Configure transactions with custom parameters
 *
 * ## Payment Transaction
 *
 * Send Algo from one account to another:
 *
 * {@includeCode ./transactions.ts#payment}
 *
 * ## Asset Transfer
 *
 * Transfer an ASA (Algorand Standard Asset):
 *
 * {@includeCode ./transactions.ts#asset}
 *
 * ## Opt-In to Asset
 *
 * Opt-in to receive a specific asset:
 *
 * {@includeCode ./transactions.ts#optin}
 *
 * @returns Transaction IDs and results
 */
export async function sendTransactionsExample() {
  const algorand = AlgorandClient.fromEnvironment();
  const sender = await algorand.account.fromEnvironment("SENDER");
  const receiver = await algorand.account.fromEnvironment("RECEIVER");

  //#region payment
  // Send a simple payment transaction
  const paymentResult = await algorand.send.payment({
    sender: sender.addr,
    receiver: receiver.addr,
    amount: 1000000n, // 1 Algo in microAlgos
    note: "Payment for services",
  });

  console.log(`Payment sent with txn ID: ${paymentResult.txId}`);
  console.log(`Confirmed in round: ${paymentResult.confirmedRound}`);
  //#endregion payment

  //#region asset
  // Create a new ASA (only works if sender has create permission)
  const createAssetResult = await algorand.send.assetCreate({
    sender: sender.addr,
    total: 1000000n,
    decimals: 2,
    assetName: "Example Token",
    unitName: "EXMPL",
    url: "https://example.com",
  });

  const assetId = createAssetResult.assetIndex!;
  console.log(`Asset created with ID: ${assetId}`);

  // Transfer the asset to another account
  const transferResult = await algorand.send.assetTransfer({
    sender: sender.addr,
    receiver: receiver.addr,
    assetId,
    amount: 1000n, // 10 tokens (with 2 decimals)
  });

  console.log(`Asset transferred with txn ID: ${transferResult.txId}`);
  //#endregion asset

  //#region optin
  // Opt-in to receive the asset
  const optInResult = await algorand.send.assetOptIn({
    sender: receiver.addr,
    assetId,
  });

  console.log(`Opted in with txn ID: ${optInResult.txId}`);
  //#endregion optin

  return { paymentResult, createAssetResult, transferResult, optInResult };
}

/**
 * Example: Sending grouped (atomic) transactions.
 *
 * Send multiple transactions atomically - all succeed or all fail:
 *
 * {@includeCode ./transactions.ts#atomic}
 *
 * @returns The transaction results
 */
export async function atomicTransactionsExample() {
  //#region atomic
  const algorand = AlgorandClient.fromEnvironment();
  const sender = await algorand.account.fromEnvironment("SENDER");
  const receiver = await algorand.account.fromEnvironment("RECEIVER");

  // Send multiple transactions atomically
  const results = await algorand.send.group(
    [
      // First transaction: payment
      {
        sender: sender.addr,
        receiver: receiver.addr,
        amount: 1000000n,
      },
      // Second transaction: asset transfer (requires opt-in first)
      {
        sender: sender.addr,
        receiver: receiver.addr,
        assetId: 1n,
        amount: 100n,
      },
    ],
    { sendParams: { suppressLog: false } },
  );

  console.log(`Atomic transaction group submitted`);
  console.log(`Transaction IDs: ${results.map((r) => r.txId).join(", ")}`);
  //#endregion atomic

  return results;
}
