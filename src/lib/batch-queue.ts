export type BatchStatus = "waiting" | "processing" | "completed" | "error";
export type BatchUpdate<T> = { index: number; status: BatchStatus; progress?: number; result?: T; error?: unknown };

/** A bounded queue: failed tasks do not prevent later files from running. */
export async function runBatchQueue<Input, Output>(
  inputs: readonly Input[],
  process: (input: Input, report: (percent: number) => void) => Promise<Output>,
  options: { concurrency?: number; signal?: AbortSignal; onUpdate: (update: BatchUpdate<Output>) => void },
): Promise<void> {
  const concurrency = options.concurrency ?? 1;
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 3) throw new Error("INVALID_CONCURRENCY");
  let cursor = 0;
  const publish = (update: BatchUpdate<Output>) => { if (!options.signal?.aborted) options.onUpdate(update); };
  await Promise.all(Array.from({ length: Math.min(inputs.length, concurrency) }, async () => {
    while (!options.signal?.aborted && cursor < inputs.length) {
      const index = cursor++;
      publish({ index, status: "processing", progress: 0 });
      let progress = 0;
      try {
        const result = await process(inputs[index], percent => {
          if (!Number.isFinite(percent)) return;
          progress = Math.max(progress, Math.min(99, Math.max(0, Math.round(percent))));
          publish({ index, status: "processing", progress });
        });
        publish({ index, status: "completed", progress: 100, result });
      } catch (error) {
        publish({ index, status: "error", error });
      }
      // Give the browser a paint/input opportunity between CPU-heavy jobs.
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }));
}
