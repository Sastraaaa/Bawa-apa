import { describe, it, expect } from "vitest";
import { parseContext, parseConfidence } from "./parser";

describe("parseContext", () => {
  it("mengenali aktivitas kampus + presentasi + motor", () => {
    const ctx = parseContext(
      "Besok ke kampus buat presentasi, naik motor, dari pagi sampai sore",
    );
    expect(ctx.activity).toBe("campus");
    expect(ctx.purpose).toContain("presentation");
    expect(ctx.transport).toBe("motorcycle");
    expect(ctx.duration).toEqual({ value: 8, unit: "hours" });
  });

  it("mengenali durasi hari dan menginap", () => {
    const ctx = parseContext("Traveling ke Bandung 3 hari, menginap");
    expect(ctx.activity).toBe("traveling");
    expect(ctx.duration).toEqual({ value: 3, unit: "days" });
    expect(ctx.overnight).toBe(true);
  });

  it("mengenali cuaca hujan", () => {
    const ctx = parseContext("Ke kantor tapi kayaknya hujan");
    expect(ctx.weatherContext).toBe("possible_rain");
  });

  it("confidence rendah untuk kalimat tanpa keyword", () => {
    const ctx = parseContext("halo dunia");
    expect(parseConfidence(ctx)).toBeLessThan(0.6);
  });

  it("confidence tinggi bila aktivitas + transport dikenali", () => {
    const ctx = parseContext("ke gym naik mobil");
    expect(parseConfidence(ctx)).toBeGreaterThanOrEqual(0.6);
  });
});
