import { describe, it, expect } from "vitest";
import { buildChecklist, computeProgress, mergeItems } from "./build";
import { parseContext } from "./parser";
import { makeItem } from "./item";

describe("buildChecklist", () => {
  it("menghasilkan checklist dari preset + rules tanpa AI", () => {
    const ctx = parseContext("ke kampus presentasi naik motor");
    const items = buildChecklist(ctx);
    const names = items.map((i) => i.name.toLowerCase());
    expect(names).toContain("laptop"); // dari rule presentasi
    expect(names).toContain("jas hujan"); // dari rule motor
    expect(items.length).toBeGreaterThan(0);
  });

  it("tidak menduplikasi barang dengan nama sama", () => {
    const ctx = parseContext("menginap 2 hari");
    const items = buildChecklist(ctx);
    const names = items.map((i) => i.name.toLowerCase());
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it("menghormati daftar avoid", () => {
    const ctx = parseContext("ke gym");
    const items = buildChecklist(ctx, { avoid: ["Handuk"] });
    expect(items.map((i) => i.name.toLowerCase())).not.toContain("handuk");
  });

  it("menambahkan neverForget sebagai required", () => {
    const ctx = parseContext("nongkrong");
    const items = buildChecklist(ctx, { neverForget: ["Obat maag"] });
    const item = items.find((i) => i.name === "Obat maag");
    expect(item?.priority).toBe("required");
    expect(item?.source).toBe("memory");
  });
});

describe("computeProgress", () => {
  it("0% untuk checklist kosong", () => {
    expect(computeProgress([])).toBe(0);
  });

  it("menghitung persentase tercentang", () => {
    const items = [
      { ...makeItem("A", "required", "manual"), checked: true },
      { ...makeItem("B", "required", "manual"), checked: false },
    ];
    expect(computeProgress(items)).toBe(50);
  });
});

describe("mergeItems", () => {
  it("menambah item baru tanpa duplikat", () => {
    const existing = [makeItem("Laptop", "required", "rule")];
    const additions = [
      makeItem("Laptop", "required", "ai"),
      makeItem("Mouse", "optional", "ai"),
    ];
    const merged = mergeItems(existing, additions);
    expect(merged.map((i) => i.name)).toContain("Mouse");
    expect(merged.filter((i) => i.name === "Laptop")).toHaveLength(1);
  });
});
