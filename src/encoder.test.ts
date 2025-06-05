import { describe, expect } from "vitest";
import { SuspenseJsonEncoder, SuspenseJsonRootEncoder } from "./encoder.js";


async function readAll(stream: ReadableStream) {
  const reader = stream.getReader();
  const chunks: any[] = [];

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  return chunks;
}

describe("Encoder Stream", (it) => {
  it("works", async () => {
    const stream = new SuspenseJsonEncoder();
    expect(stream).toBeDefined();
    const place1 = stream.getPlaceholder();
    expect(place1).toMatchInlineSnapshot(`"r#0#"`);
    const place2 = stream.getPlaceholder();
    expect(place2).toMatchInlineSnapshot(`"r#1#"`);
    stream.resolve(place1, { data: place2 });
    stream.resolve(place2, { data: "inner" });
    const res = await readAll(stream);
    expect(res.join("")).toMatchInlineSnapshot(`
      "
      /** r#0# */
      {"data":"r#1#"}
      /** r#1# */
      {"data":"inner"}"
    `);
  });
});
describe("Encoder Root Stream", (it) => {
  it("works", async () => {
    const {promise, resolve} = Promise.withResolvers<{ place1: string }>();
    const enc = new SuspenseJsonRootEncoder(
      state => {
        const place1 = state.getPlaceholder()
        expect(place1).toMatchInlineSnapshot(`"r#0#"`);
        resolve({ place1 })
        return {
          data: place1,
        }
      }
    )
    const { place1 } = await promise
    expect(enc).toBeDefined();
    
    const place2 = enc.getPlaceholder()
    expect(place2).toMatchInlineSnapshot(`"r#1#"`);
    enc.resolve(place1, { data: place2 });
    enc.resolve(place2, { data: "inner" });
    const res = await readAll(enc);
    expect(res.join("")).toMatchInlineSnapshot(`
      "{"data":"r#0#"}
      /** r#0# */
      {"data":"r#1#"}
      /** r#1# */
      {"data":"inner"}"
    `);
  });
});
