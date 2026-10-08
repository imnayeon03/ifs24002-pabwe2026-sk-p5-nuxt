import { describe, it, expect } from "vitest";
import { useInput } from "./useInput";

describe("useInput", () => {
  it("nilai awal default kosong", () => {
    const [value] = useInput();
    expect(value.value).toBe("");
  });
  it("menerima event atau nilai langsung, dan reset", () => {
    const [value, onChange, reset] = useInput("awal");
    const input = document.createElement("input");
    input.value = "dari event";
    onChange({ target: input } as unknown as Event);
    expect(value.value).toBe("dari event");
    onChange("langsung");
    expect(value.value).toBe("langsung");
    reset();
    expect(value.value).toBe("awal");
  });
});
