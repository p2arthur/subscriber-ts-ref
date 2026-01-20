import { AlgorandClient } from "../src";

/**
 * Example: Calling contract methods with different argument types.
 *
 * This example demonstrates how to:
 * - Call contract methods with various argument types
 * - Handle return values from contract methods
 * - Pass accounts and assets as arguments
 * - Use reference arrays for foreign accounts/assets
 *
 * ## Call Simple Method
 *
 * Call a basic contract method with primitive arguments:
 *
 * {@includeCode ./contract-interaction.ts#simple}
 *
 * ## Call Method with Complex Args
 *
 * Call methods with accounts, assets, and references:
 *
 * {@includeCode ./contract-interaction.ts#complex}
 *
 * ## Error Handling
 *
 * Handle contract execution errors gracefully:
 *
 * {@includeCode ./contract-interaction.ts#errors}
 *
 * @param appSpec - The ARC-56 app specification
 * @param appId - The application ID
 */
export async function callContractMethodsExample(appSpec: any, appId: bigint) {
  const algorand = AlgorandClient.fromEnvironment();
  const sender = await algorand.account.fromEnvironment("SENDER");

  const appClient = algorand.client.getAppClientById({
    appSpec,
    appId,
    defaultSender: sender.addr,
  });

  //#region simple
  // Call a simple method with string and number arguments
  const simpleResult = await appClient.send.call({
    method: "greet",
    args: ["Alice", 42],
  });

  console.log(`Method result: ${simpleResult.return}`);
  //#endregion simple

  //#region complex
  // Call method with account and asset references
  const otherAccount = await algorand.account.fromEnvironment("OTHER_ACCOUNT");

  const complexResult = await appClient.send.call({
    method: "transfer_with_fee",
    args: {
      amount: 1000n,
      recipient: otherAccount.addr,
      feePercentage: 1,
    },
    foreignAccounts: [otherAccount.addr],
    foreignAssets: [1n, 2n], // Asset IDs
    foreignApps: [123n], // App IDs
  });

  console.log(`Transfer complete, return value: ${complexResult.return}`);
  //#endregion complex

  //#region errors
  // Handle errors from contract calls
  try {
    const failingResult = await appClient.send.call({
      method: "risky_operation",
      args: [100n],
    });
  } catch (error: any) {
    if (error.message?.includes("rejected by logic")) {
      console.log(`Contract rejected the operation: ${error.message}`);
    } else if (error.message?.includes("insufficient balance")) {
      console.log("Insufficient balance for this operation");
    } else {
      console.log(`Unexpected error: ${error.message}`);
    }
  }
  //#endregion errors

  return { simpleResult, complexResult };
}

/**
 * Example: Composing multiple contract calls.
 *
 * Call multiple methods in sequence or simultaneously:
 *
 * {@includeCode ./contract-interaction.ts#compose}
 *
 * @param appSpec - The ARC-56 app specification
 * @param appId - The application ID
 */
export async function composeContractCallsExample(appSpec: any, appId: bigint) {
  //#region compose
  const algorand = AlgorandClient.fromEnvironment();
  const sender = await algorand.account.fromEnvironment("SENDER");

  const appClient = algorand.client.getAppClientById({
    appSpec,
    appId,
    defaultSender: sender.addr,
  });

  // Sequential calls
  const result1 = await appClient.send.call({
    method: "initialize",
    args: ["config_value"],
  });

  console.log(`Initialized with result: ${result1.return}`);

  const result2 = await appClient.send.call({
    method: "process",
    args: [result1.return],
  });

  console.log(`Processed with result: ${result2.return}`);

  // Parallel calls (independent operations)
  const [parallel1, parallel2] = await Promise.all([
    appClient.send.call({
      method: "get_counter",
      args: [],
    }),
    appClient.send.call({
      method: "get_owner",
      args: [],
    }),
  ]);

  console.log(`Counter: ${parallel1.return}, Owner: ${parallel2.return}`);
  //#endregion compose

  return { result1, result2, parallel1, parallel2 };
}
