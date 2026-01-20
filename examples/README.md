# TypeScript Examples

This folder contains comprehensive TypeScript examples demonstrating various programming patterns and techniques.

## Overview

These examples showcase vanilla TypeScript features without external dependencies, making them perfect for learning and reference. Each example includes detailed documentation, code regions for easy navigation, and practical use cases.

## Examples

### 📊 Data Manipulation

**File**: [`data-manipulation.ts`](./data-manipulation.ts)

Learn how to work with collections and process data efficiently:

- **Array Filtering**: Filter data using loops and array methods
- **Data Transformation**: Map and transform data structures
- **Aggregation**: Calculate totals, averages, and grouped statistics
- **Iteration Patterns**: Various loop types (for, for-of, forEach)

```typescript
const transactions = [...];
const filtered = transactions.filter(txn => txn.amount >= 1000);
const total = transactions.reduce((sum, txn) => sum + txn.amount, 0);
```

### ⚡ Async Operations

**File**: [`async-operations.ts`](./async-operations.ts)

Master asynchronous programming in TypeScript:

- **Promises & Async/Await**: Modern async patterns
- **Sequential Processing**: Process items one after another
- **Parallel Processing**: Execute operations concurrently with `Promise.all()`
- **Error Handling**: Retry logic, timeouts, and error recovery
- **Performance**: Compare sequential vs parallel execution

```typescript
// Sequential processing
for (const item of items) {
  await processItem(item);
}

// Parallel processing
await Promise.all(items.map((item) => processItem(item)));
```

### 🏗️ Object-Oriented Programming

**File**: [`object-oriented.ts`](./object-oriented.ts)

Explore OOP concepts and patterns in TypeScript:

- **Classes & Interfaces**: Define reusable components
- **Inheritance**: Extend base classes with specialized behavior
- **Composition**: Combine objects to build complex systems
- **Encapsulation**: Use private properties and getters/setters
- **Generics**: Create type-safe, reusable code

```typescript
class Account {
  private _balance: bigint;

  deposit(amount: bigint): void {
    this._balance += amount;
  }
}

class PremiumAccount extends Account {
  // Additional features
}
```

## Legacy Examples

The following examples demonstrate Algorand-specific concepts (documentation only):

- **account-management.ts** - Account creation, funding, and information
- **transactions.ts** - Payment and asset transfer transactions
- **state-queries.ts** - Querying blockchain and application state
- **deploy-app.ts** - Smart contract deployment
- **contract-interaction.ts** - Calling contract methods
- **advanced-scenarios.ts** - Advanced transaction patterns

## Documentation

These examples are used to generate TypeDoc documentation. Each example includes:

- **JSDoc Comments**: Comprehensive documentation for all functions and types
- **Code Regions**: Marked with `#region` and `#endregion` for easy reference
- **Type Safety**: Full TypeScript type annotations
- **Practical Examples**: Real-world use cases and patterns

## Usage

### Running Examples

To run any example:

```bash
# Using ts-node
npx ts-node examples/data-manipulation.ts

# Or compile first
npx tsc examples/data-manipulation.ts
node examples/data-manipulation.js
```

### Generating Documentation

Documentation is generated using TypeDoc:

```bash
npm run docs:examples
```

This creates HTML documentation in the `docs/examples` folder, with each example rendered as a separate page with syntax highlighting and cross-references.

## Learning Path

**Recommended order for learning:**

1. **Data Manipulation** - Start with basic collections and loops
2. **Object-Oriented** - Learn OOP concepts and patterns
3. **Async Operations** - Master asynchronous programming

## Contributing

When adding new examples:

- Use vanilla TypeScript (no external dependencies)
- Include comprehensive JSDoc comments
- Add code regions for important sections
- Provide practical, runnable code
- Follow the existing naming conventions

## License

These examples are part of the AlgoKit TypeScript reference implementation.
