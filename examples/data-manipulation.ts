/**
 * Example: Data manipulation with TypeScript.
 *
 * This example demonstrates:
 * - Working with arrays and objects
 * - Using loops and iteration
 * - Filtering and transforming data
 * - Type-safe operations
 *
 * ## Array Filtering
 *
 * Filter data using various methods:
 *
 * {@includeCode ./data-manipulation.ts#filtering}
 *
 * ## Data Transformation
 *
 * Transform and map data structures:
 *
 * {@includeCode ./data-manipulation.ts#transformation}
 *
 * ## Aggregation
 *
 * Calculate aggregated values from collections:
 *
 * {@includeCode ./data-manipulation.ts#aggregation}
 */

/**
 * Represents a transaction record
 */
interface Transaction {
  id: string;
  amount: number;
  type: "payment" | "asset-transfer";
  timestamp: number;
  fee: number;
}

/**
 * Process and filter transactions based on criteria
 *
 * @example
 * ```typescript
 * const txns = getTransactions();
 * const filtered = filterTransactions(txns, "payment", 1000);
 * console.log(`Found ${filtered.length} matching transactions`);
 * ```
 */
export function dataManipulationExample(): void {
  //#region filtering
  // Sample transaction data
  const transactions: Transaction[] = [
    { id: "tx1", amount: 1000, type: "payment", timestamp: 1234567890, fee: 1 },
    {
      id: "tx2",
      amount: 500,
      type: "asset-transfer",
      timestamp: 1234567900,
      fee: 2,
    },
    { id: "tx3", amount: 2000, type: "payment", timestamp: 1234567910, fee: 1 },
    { id: "tx4", amount: 750, type: "payment", timestamp: 1234567920, fee: 1 },
  ];

  // Filter payments over a threshold
  const largePayments: Transaction[] = [];
  for (const txn of transactions) {
    if (txn.type === "payment" && txn.amount >= 1000) {
      largePayments.push(txn);
    }
  }

  console.log(`Found ${largePayments.length} large payments`);

  // Alternative: using array methods
  const filteredTxns = transactions.filter(
    (txn) => txn.type === "payment" && txn.amount >= 1000,
  );
  //#endregion filtering

  //#region transformation
  // Transform transactions to a summary format
  interface TransactionSummary {
    id: string;
    total: number; // amount + fee
    date: Date;
  }

  const summaries: TransactionSummary[] = [];
  for (let i = 0; i < transactions.length; i++) {
    const txn = transactions[i];
    summaries.push({
      id: txn.id,
      total: txn.amount + txn.fee,
      date: new Date(txn.timestamp * 1000),
    });
  }

  // Using map for transformation
  const mapped = transactions.map((txn) => ({
    id: txn.id,
    total: txn.amount + txn.fee,
    date: new Date(txn.timestamp * 1000),
  }));

  console.log(`Transformed ${mapped.length} transactions`);
  //#endregion transformation

  //#region aggregation
  // Calculate total volume and fees
  let totalVolume = 0;
  let totalFees = 0;
  let paymentCount = 0;

  for (const txn of transactions) {
    totalVolume += txn.amount;
    totalFees += txn.fee;

    if (txn.type === "payment") {
      paymentCount++;
    }
  }

  const stats = {
    totalVolume,
    totalFees,
    paymentCount,
    averageAmount: totalVolume / transactions.length,
    transactionCount: transactions.length,
  };

  console.log(`Total volume: ${stats.totalVolume}`);
  console.log(`Average amount: ${stats.averageAmount.toFixed(2)}`);
  console.log(`Payment transactions: ${stats.paymentCount}`);

  // Using reduce for aggregation
  const volumeSum = transactions.reduce((sum, txn) => sum + txn.amount, 0);
  //#endregion aggregation

  // Group transactions by type
  const grouped = new Map<string, Transaction[]>();
  for (const txn of transactions) {
    const existing = grouped.get(txn.type) || [];
    existing.push(txn);
    grouped.set(txn.type, existing);
  }

  console.log(`Grouped into ${grouped.size} categories`);
}
