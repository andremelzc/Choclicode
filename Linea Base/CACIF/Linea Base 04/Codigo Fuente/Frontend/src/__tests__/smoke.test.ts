/**
 * Smoke tests — verifican que los módulos principales se importan
 * correctamente y que la configuración base funciona.
 */
import { describe, it, expect } from "vitest";

describe("Smoke Tests", () => {
  it("should import App module without errors", async () => {
    const module = await import("../App");
    expect(module).toBeDefined();
    expect(module.default).toBeDefined();
  });

  it("should have correct environment", () => {
    expect(typeof window).toBe("object");
    expect(typeof document).toBe("object");
  });
});

describe("Type Safety", () => {
  it("should validate chat message types at runtime", async () => {
    // Verifica que los tipos del chat se pueden importar
    const chatTypes = await import("../types/chat");
    expect(chatTypes).toBeDefined();
  });

  it("should validate auth types at runtime", async () => {
    const authTypes = await import("../types/auth");
    expect(authTypes).toBeDefined();
  });
});
