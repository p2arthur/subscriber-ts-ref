/**
 * Example: Object-oriented programming patterns.
 *
 * This example demonstrates:
 * - Classes and interfaces
 * - Inheritance and composition
 * - Encapsulation with private properties
 * - Generic types
 *
 * ## Class Definition
 *
 * Define a class with methods and properties:
 *
 * {@includeCode ./object-oriented.ts#class}
 *
 * ## Inheritance
 *
 * Extend classes to create specialized types:
 *
 * {@includeCode ./object-oriented.ts#inheritance}
 *
 * ## Composition
 *
 * Combine objects to create complex structures:
 *
 * {@includeCode ./object-oriented.ts#composition}
 *
 * ## Generics
 *
 * Use generic types for reusable code:
 *
 * {@includeCode ./object-oriented.ts#generics}
 */

/**
 * Base interface for blockchain entities
 */
interface BlockchainEntity {
  id: string;
  createdAt: number;
}

//#region class
/**
 * Represents an account on the blockchain
 */
class Account implements BlockchainEntity {
  readonly id: string;
  readonly createdAt: number;
  private _balance: bigint;
  private _transactions: string[];

  constructor(address: string) {
    this.id = address;
    this.createdAt = Date.now();
    this._balance = 0n;
    this._transactions = [];
  }

  /**
   * Get the current balance
   */
  get balance(): bigint {
    return this._balance;
  }

  /**
   * Get transaction history
   */
  get transactions(): readonly string[] {
    return this._transactions;
  }

  /**
   * Add funds to the account
   */
  deposit(amount: bigint): void {
    if (amount <= 0n) {
      throw new Error("Amount must be positive");
    }
    this._balance += amount;
    this._transactions.push(`+${amount}`);
  }

  /**
   * Withdraw funds from the account
   */
  withdraw(amount: bigint): boolean {
    if (amount <= 0n) {
      throw new Error("Amount must be positive");
    }
    if (this._balance < amount) {
      return false;
    }
    this._balance -= amount;
    this._transactions.push(`-${amount}`);
    return true;
  }

  /**
   * Get account summary
   */
  getSummary(): string {
    return `Account ${this.id}: ${this._balance} (${this._transactions.length} txns)`;
  }
}
//#endregion class

//#region inheritance
/**
 * Specialized account with additional features
 */
class PremiumAccount extends Account {
  private _rewardsBalance: bigint;
  private readonly _rewardRate: number;

  constructor(address: string, rewardRate: number = 0.05) {
    super(address);
    this._rewardsBalance = 0n;
    this._rewardRate = rewardRate;
  }

  /**
   * Get rewards balance
   */
  get rewards(): bigint {
    return this._rewardsBalance;
  }

  /**
   * Override deposit to add rewards
   */
  override deposit(amount: bigint): void {
    super.deposit(amount);

    // Calculate and add rewards
    const rewardAmount = BigInt(Math.floor(Number(amount) * this._rewardRate));
    this._rewardsBalance += rewardAmount;
  }

  /**
   * Claim accumulated rewards
   */
  claimRewards(): bigint {
    const rewards = this._rewardsBalance;
    if (rewards > 0n) {
      super.deposit(rewards);
      this._rewardsBalance = 0n;
    }
    return rewards;
  }

  /**
   * Enhanced summary including rewards
   */
  override getSummary(): string {
    return `${super.getSummary()} + ${this._rewardsBalance} rewards`;
  }
}
//#endregion inheritance

//#region composition
/**
 * Transaction record
 */
class Transaction implements BlockchainEntity {
  readonly id: string;
  readonly createdAt: number;
  readonly from: Account;
  readonly to: Account;
  readonly amount: bigint;
  private _confirmed: boolean;

  constructor(from: Account, to: Account, amount: bigint) {
    this.id = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.createdAt = Date.now();
    this.from = from;
    this.to = to;
    this.amount = amount;
    this._confirmed = false;
  }

  /**
   * Execute the transaction
   */
  execute(): boolean {
    if (this._confirmed) {
      throw new Error("Transaction already confirmed");
    }

    if (this.from.withdraw(this.amount)) {
      this.to.deposit(this.amount);
      this._confirmed = true;
      return true;
    }

    return false;
  }

  /**
   * Check if transaction is confirmed
   */
  isConfirmed(): boolean {
    return this._confirmed;
  }
}

/**
 * Wallet managing multiple accounts
 */
class Wallet {
  private readonly _accounts: Map<string, Account>;
  private readonly _transactions: Transaction[];

  constructor() {
    this._accounts = new Map();
    this._transactions = [];
  }

  /**
   * Add an account to the wallet
   */
  addAccount(account: Account): void {
    this._accounts.set(account.id, account);
  }

  /**
   * Get total balance across all accounts
   */
  getTotalBalance(): bigint {
    let total = 0n;
    for (const account of this._accounts.values()) {
      total += account.balance;
    }
    return total;
  }

  /**
   * Transfer between accounts
   */
  transfer(fromId: string, toId: string, amount: bigint): boolean {
    const from = this._accounts.get(fromId);
    const to = this._accounts.get(toId);

    if (!from || !to) {
      return false;
    }

    const txn = new Transaction(from, to, amount);
    const success = txn.execute();

    if (success) {
      this._transactions.push(txn);
    }

    return success;
  }
}
//#endregion composition

//#region generics
/**
 * Generic cache for any type of data
 */
class Cache<T> {
  private readonly _data: Map<string, { value: T; expiresAt: number }>;
  private readonly _defaultTTL: number;

  constructor(defaultTTL: number = 60000) {
    this._data = new Map();
    this._defaultTTL = defaultTTL;
  }

  /**
   * Store a value in the cache
   */
  set(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl ?? this._defaultTTL);
    this._data.set(key, { value, expiresAt });
  }

  /**
   * Retrieve a value from the cache
   */
  get(key: string): T | undefined {
    const entry = this._data.get(key);

    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this._data.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Clear expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this._data.entries()) {
      if (now > entry.expiresAt) {
        this._data.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this._data.size,
      keys: Array.from(this._data.keys()),
    };
  }
}
//#endregion generics

/**
 * Demonstrates object-oriented patterns
 *
 * @example
 * ```typescript
 * objectOrientedExample();
 * // Creates accounts, performs transfers
 * // Shows inheritance and composition patterns
 * ```
 */
export function objectOrientedExample(): void {
  console.log("=== Object-Oriented Programming Example ===\n");

  // Create accounts
  const alice = new Account("ALICE123");
  const bob = new PremiumAccount("BOB456", 0.1);

  // Deposit funds
  alice.deposit(10000n);
  bob.deposit(5000n);

  console.log(alice.getSummary());
  console.log(bob.getSummary());

  // Transfer between accounts
  const txn = new Transaction(alice, bob, 2000n);
  if (txn.execute()) {
    console.log(`✓ Transfer successful: ${txn.id}`);
  }

  console.log(alice.getSummary());
  console.log(bob.getSummary());

  // Claim rewards
  const rewards = bob.claimRewards();
  console.log(`Claimed ${rewards} in rewards`);
  console.log(bob.getSummary());

  // Use wallet to manage accounts
  const wallet = new Wallet();
  wallet.addAccount(alice);
  wallet.addAccount(bob);

  console.log(`\nTotal wallet balance: ${wallet.getTotalBalance()}`);

  // Use generic cache
  const accountCache = new Cache<Account>(30000);
  accountCache.set("alice", alice);
  accountCache.set("bob", bob);

  const cached = accountCache.get("alice");
  console.log(`\nCached account: ${cached?.id}`);
  console.log(`Cache stats:`, accountCache.getStats());

  // Demonstrate loops and iteration
  console.log("\n=== Account Transaction History ===");
  const accounts = [alice, bob];

  for (let i = 0; i < accounts.length; i++) {
    const acc = accounts[i];
    console.log(`\n${acc.id}:`);

    const txns = acc.transactions;
    for (const txn of txns) {
      console.log(`  - ${txn}`);
    }
  }
}
