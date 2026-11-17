import { it, expect } from "vitest";
import { parseCommands } from "../src/index";
it("isolates ownership and rejects duplicate, non-finite and invalid wheel commands", () => {
  for (const payload of [
    [{ id: "yellow-0", left: 0, right: 0 }],
    [{ id: "blue-0", left: NaN, right: 0 }],
    [{ id: "blue-0", left: 2, right: 0 }],
    [
      { id: "blue-0", left: 0, right: 0 },
      { id: "blue-0", left: 0, right: 0 },
    ],
  ])
    expect(() => parseCommands("blue", payload)).toThrow();
  expect(
    parseCommands("yellow", [{ id: "yellow-2", left: -0.6, right: 0.6 }]),
  ).toEqual([{ id: "yellow-2", left: -0.6, right: 0.6 }]);
});
