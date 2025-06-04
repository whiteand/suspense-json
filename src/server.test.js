import { describe, expect } from "vitest";
import { SuspenseJsonStream } from "./server";

describe("Server Tests", (it) => {
  it("works", () => {
    const stream = new SuspenseJsonStream();
    expect(stream).toBeDefined();
    const place1 = stream.getPlaceholder();
    expect(place1).toMatchInlineSnapshot(`"r#0#"`);
    const place2 = stream.getPlaceholder();
    expect(place2).toMatchInlineSnapshot(`"r#1#"`);
    stream.push(place1, { data: place2 });
    stream.push(place2, { data: "inner" });
  });
});
