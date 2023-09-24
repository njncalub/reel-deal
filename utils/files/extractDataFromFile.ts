import { parse as parseYaml } from "$std/yaml/mod.ts";

/** A function that checks if a value conforms to the correct schema. */
type SchemaCheckerFn = (value: unknown) => boolean;

/** A function that transforms a value of type T1 to a value of type T2. */
type TransformerFn<T1, T2> = (value: T1) => T2;

export const extractDataFromFile = async <
  T1 = unknown,
  T2 = unknown,
>(
  filename: string,
  checkSchema: SchemaCheckerFn,
  transform: TransformerFn<T1, T2>,
): Promise<T2[] | Error> => {
  const rawData = await Deno.readTextFile(filename);
  const rawItems = parseYaml(rawData) as T1[];

  const items: T2[] = [];
  for (let i = 0; i < rawItems.length; i++) {
    const item = rawItems[i];
    if (!checkSchema(item)) {
      return new Error(`invalid data at index ${i}`);
    }

    items.push(transform(item));
  }

  return items;
};
