import { describe, expect } from "vitest";
import { SuspenseJsonStream } from "./server";

/**
 *
 * @param {ReadableStream} stream
 * @returns
 */
async function readAll(stream) {
  const reader = stream.getReader();
  const chunks = [];

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

describe("Server Tests", (it) => {
  it("works", async () => {
    const stream = new SuspenseJsonStream();
    expect(stream).toBeDefined();
    const place1 = stream.getPlaceholder();
    expect(place1).toMatchInlineSnapshot(`"r#0#"`);
    const place2 = stream.getPlaceholder();
    expect(place2).toMatchInlineSnapshot(`"r#1#"`);
    stream.push(place1, { data: place2 });
    stream.push(place2, { data: "inner" });
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
