/**
 * Example: Async operations and promises.
 *
 * This example demonstrates:
 * - Working with Promises
 * - Using async/await syntax
 * - Error handling in async code
 * - Sequential and parallel operations
 *
 * ## Basic Async Operations
 *
 * Simple async function calls:
 *
 * {@includeCode ./async-operations.ts#basic}
 *
 * ## Sequential Processing
 *
 * Process items one after another:
 *
 * {@includeCode ./async-operations.ts#sequential}
 *
 * ## Parallel Processing
 *
 * Execute multiple operations concurrently:
 *
 * {@includeCode ./async-operations.ts#parallel}
 *
 * ## Error Handling
 *
 * Handle errors in async operations:
 *
 * {@includeCode ./async-operations.ts#errors}
 */

/**
 * Represents the result of an async operation
 */
interface AsyncResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  duration: number;
}

/**
 * Simulates an async API call
 */
function simulateApiCall<T>(data: T, delay: number): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.1) {
        // 90% success rate
        resolve(data);
      } else {
        reject(new Error("Simulated API failure"));
      }
    }, delay);
  });
}

/**
 * Demonstrates async/await patterns and error handling
 *
 * @example
 * ```typescript
 * await asyncOperationsExample();
 * // Processes items sequentially and in parallel
 * // Shows error handling patterns
 * ```
 */
export async function asyncOperationsExample(): Promise<void> {
  //#region basic
  // Simple async function with await
  async function fetchData(id: string): Promise<string> {
    const result = await simulateApiCall(`Data for ${id}`, 100);
    return result;
  }

  const data = await fetchData("tx-123");
  console.log(`Fetched: ${data}`);

  // Using Promise.then() syntax
  simulateApiCall("Alternative data", 100)
    .then((result) => console.log(`Result: ${result}`))
    .catch((error) => console.error(`Error: ${error.message}`));
  //#endregion basic

  //#region sequential
  // Process items sequentially (one after another)
  const itemIds = ["item-1", "item-2", "item-3", "item-4"];
  const results: string[] = [];

  console.log("Starting sequential processing...");
  const startTime = Date.now();

  for (const id of itemIds) {
    try {
      const result = await simulateApiCall(`Processed ${id}`, 50);
      results.push(result);
      console.log(`✓ Completed: ${id}`);
    } catch (error) {
      console.error(`✗ Failed: ${id}`);
      results.push(`Error processing ${id}`);
    }
  }

  const sequentialDuration = Date.now() - startTime;
  console.log(`Sequential processing took ${sequentialDuration}ms`);
  console.log(`Processed ${results.length} items`);
  //#endregion sequential

  //#region parallel
  // Process items in parallel (all at once)
  console.log("Starting parallel processing...");
  const parallelStart = Date.now();

  const promises = itemIds.map((id) =>
    simulateApiCall(`Parallel ${id}`, 50)
      .then((result) => ({ success: true, data: result }))
      .catch((error) => ({ success: false, error: error.message })),
  );

  const parallelResults = await Promise.all(promises);
  const parallelDuration = Date.now() - parallelStart;

  const successCount = parallelResults.filter((r) => r.success).length;
  console.log(`Parallel processing took ${parallelDuration}ms`);
  console.log(`Success rate: ${successCount}/${parallelResults.length}`);
  //#endregion parallel

  //#region errors
  // Error handling patterns
  async function robustFetch(
    id: string,
    retries = 3,
  ): Promise<AsyncResult<string>> {
    const startTime = Date.now();

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const data = await simulateApiCall(`Data ${id}`, 30);
        return {
          success: true,
          data,
          duration: Date.now() - startTime,
        };
      } catch (error) {
        console.log(`Attempt ${attempt} failed for ${id}`);

        if (attempt === retries) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            duration: Date.now() - startTime,
          };
        }

        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, attempt * 100));
      }
    }

    return {
      success: false,
      error: "Max retries exceeded",
      duration: Date.now() - startTime,
    };
  }

  // Test robust fetch with retries
  const robustResult = await robustFetch("important-data");
  if (robustResult.success) {
    console.log(`✓ Success: ${robustResult.data} (${robustResult.duration}ms)`);
  } else {
    console.error(
      `✗ Failed: ${robustResult.error} (${robustResult.duration}ms)`,
    );
  }
  //#endregion errors

  // Wait for all operations with timeout
  const withTimeout = <T>(
    promise: Promise<T>,
    timeoutMs: number,
  ): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), timeoutMs),
      ),
    ]);
  };

  try {
    const timedResult = await withTimeout(
      simulateApiCall("timed-data", 200),
      150,
    );
    console.log(`Timed result: ${timedResult}`);
  } catch (error) {
    console.error("Operation timed out");
  }
}
