const kvAccessToken = Deno.env.get("DENO_KV_ACCESS_TOKEN");
const kvPathKey = Deno.env.get("DENO_KV_PATH_KEY");

// We should only connect to an existing KV store if it's been configured.
let path = undefined;
if (kvAccessToken && kvPathKey) {
  path = kvPathKey;
}
export const kv = await Deno.openKv(path);

/** A function that transforms a value of type T1 to a value of type T2. */
type TransformerFn<T1, T2> = (value: T1) => T2;

/**
 * Returns an array of values of a given {@linkcode Deno.KvListIterator} that's
 * been iterated over.
 */
export async function collectValues<T1, T2 = T1>(
  iter: Deno.KvListIterator<T1>,
  transform: TransformerFn<T1, T2>,
) {
  const values: T2[] = [];
  for await (const { value } of iter) {
    values.push(await transform(value));
  }
  return values;
}

export async function deleteAllWithPrefix<T = unknown>(prefix: string[]) {
  const iter = kv.list<T>({ prefix });
  const promises = [];
  for await (const { key } of iter) {
    promises.push(kv.delete(key));
  }
  await Promise.all(promises);
}
