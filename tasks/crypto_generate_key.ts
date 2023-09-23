import { generateKey } from "@/apps/auth/utils.ts";

const key = await generateKey();

console.log(key);
