import { AlgorandClient } from "../src";

/**
 * Example: Querying application and account state.
 *
 * This example demonstrates how to:
 * - Read global state from applications
 * - Read local state from accounts
 * - Query account assets and apps
 * - Parse state values
 *
 * ## Read Global State
 *
 * Access an application's global state:
 *
 * {@includeCode ./state-queries.ts#global}
 *
 * ## Read Local State
 *
 * Access an account's local state for an application:
 *
 * {@includeCode ./state-queries.ts#local}
 *
 * ## Get Account Assets
 *
 * Query all assets held by an account:
 *
 * {@includeCode ./state-queries.ts#assets}
 *
 * @param appId - The application ID to query
 * @returns State information
 */
export async function queryStateExample(appId: bigint) {
  const algorand = AlgorandClient.fromEnvironment();
  const account = await algorand.account.fromEnvironment("ACCOUNT");

  //#region global
  // Get application information and global state
  const appInfo = await algorand.client.algod
    .getApplicationByID(Number(appId))
    .do();

  console.log(`App ID: ${appInfo.id}`);
  console.log(`Creator: ${appInfo.params.creator}`);
  console.log(
    `Global state keys: ${Object.keys(appInfo.params["global-state"] || {}).length}`,
  );

  // Parse global state
  const globalState: Record<string, unknown> = {};
  if (appInfo.params["global-state"]) {
    for (const entry of appInfo.params["global-state"]) {
      const key = Buffer.from(entry.key, "base64").toString();
      const value = entry.value;
      globalState[key] =
        value.type === 1
          ? value.uint
          : Buffer.from(value.bytes, "base64").toString();
    }
  }

  console.log("Global state:", globalState);
  //#endregion global

  //#region local
  // Get local state for an account in an app
  const accountAppState = await algorand.client.algod
    .accountApplicationInformation(account.addr, Number(appId))
    .do();

  console.log(
    `Local state keys: ${Object.keys(accountAppState["app-local-state"] || {}).length}`,
  );

  // Parse local state
  const localState: Record<string, unknown> = {};
  if (accountAppState["app-local-state"]) {
    for (const entry of accountAppState["app-local-state"]["key-value"]) {
      const key = Buffer.from(entry.key, "base64").toString();
      const value = entry.value;
      localState[key] =
        value.type === 1
          ? value.uint
          : Buffer.from(value.bytes, "base64").toString();
    }
  }

  console.log("Local state:", localState);
  //#endregion local

  //#region assets
  // Get all assets held by an account
  const accountInfo = await algorand.account.getInformation(account.addr);

  console.log(`Total assets: ${accountInfo.assets?.length || 0}`);

  if (accountInfo.assets) {
    for (const asset of accountInfo.assets.slice(0, 5)) {
      // Show first 5 assets
      console.log(`Asset ${asset["asset-id"]}: ${asset.amount} units`);
    }
  }
  //#endregion assets

  return { globalState, localState, accountInfo };
}

/**
 * Example: Watching for changes in account state.
 *
 * Monitor account state for changes:
 *
 * {@includeCode ./state-queries.ts#watch}
 *
 * @param account - The account address to monitor
 */
export async function watchAccountStateExample(account: string) {
  //#region watch
  const algorand = AlgorandClient.fromEnvironment();

  let lastRound = 0;
  const pollInterval = 4000; // Poll every 4 seconds

  const watcher = setInterval(async () => {
    try {
      const status = await algorand.client.algod.status().do();
      const currentRound = status["last-round"];

      if (currentRound > lastRound) {
        const accountInfo = await algorand.account.getInformation(account);
        console.log(
          `Round ${currentRound}: Account balance = ${accountInfo.amount} microAlgos`,
        );
        lastRound = currentRound;
      }
    } catch (error) {
      console.error("Error watching account:", error);
    }
  }, pollInterval);

  // Stop watching after 60 seconds
  setTimeout(() => {
    clearInterval(watcher);
    console.log("Stopped watching account");
  }, 60000);
  //#endregion watch
}
