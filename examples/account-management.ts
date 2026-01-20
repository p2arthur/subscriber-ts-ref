import { AlgorandClient } from "../src";

/**
 * Example: Managing Algorand accounts.
 *
 * This example demonstrates how to:
 * - Create new accounts
 * - Load accounts from environment variables
 * - Fund accounts with Algo
 * - Get account information and balances
 *
 * ## Create a New Account
 *
 * Generate a new random account:
 *
 * {@includeCode ./account-management.ts#create}
 *
 * ## Fund an Account
 *
 * Use the dispenser to fund an account on LocalNet:
 *
 * {@includeCode ./account-management.ts#fund}
 *
 * ## Get Account Info
 *
 * Retrieve detailed account information:
 *
 * {@includeCode ./account-management.ts#info}
 *
 * @returns The created account information
 */
export async function manageAccountsExample() {
  //#region create
  const algorand = AlgorandClient.fromEnvironment();

  // Create a new random account
  const newAccount = algorand.account.random();

  console.log(`New account address: ${newAccount.addr}`);
  console.log(`New account mnemonic: ${newAccount.mnemonic}`);
  //#endregion create

  //#region fund
  // Fund the new account from the dispenser (LocalNet only)
  const dispenser = await algorand.account.fromEnvironment("DISPENSER");

  const fundResult = await algorand.send.payment({
    sender: dispenser.addr,
    receiver: newAccount.addr,
    amount: 1000000n, // 1 Algo in microAlgos
  });

  console.log(`Funded new account with txn: ${fundResult.txId}`);
  //#endregion fund

  //#region info
  // Get account information
  const accountInfo = await algorand.account.getInformation(newAccount.addr);

  console.log(`Account balance: ${accountInfo.amount} microAlgos`);
  console.log(`Account status: ${accountInfo.status}`);
  console.log(`Apps created: ${accountInfo.createdApps?.length || 0}`);
  console.log(`Assets created: ${accountInfo.createdAssets?.length || 0}`);
  //#endregion info

  return {
    account: newAccount,
    accountInfo,
  };
}

/**
 * Example: Loading accounts from different sources.
 *
 * Learn how to load accounts from various sources:
 *
 * {@includeCode ./account-management.ts#load}
 *
 * @returns Multiple account instances
 */
export async function loadAccountsExample() {
  //#region load
  const algorand = AlgorandClient.fromEnvironment();

  // Load from environment variables
  const deployer = await algorand.account.fromEnvironment("DEPLOYER");
  const sender = await algorand.account.fromEnvironment("SENDER");

  console.log(`Deployer: ${deployer.addr}`);
  console.log(`Sender: ${sender.addr}`);

  // Load from mnemonic
  const mnemonicAccount = await algorand.account.fromMnemonic(
    "your mnemonic phrase here with all 25 words separated by spaces",
  );
  console.log(`Mnemonic account: ${mnemonicAccount.addr}`);
  //#endregion load

  return { deployer, sender, mnemonicAccount };
}
