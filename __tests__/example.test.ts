import { describe, it, expect } from "vitest";

describe("Prueba de Humo (Vitest)", () => {
  it("debería sumar correctamente", () => {
    expect(1 + 1).toBe(2);
  });

  it("debería tener acceso al DOM (JSDOM)", () => {
    const element = document.createElement("div");
    element.innerHTML = "Hola Mundo";
    expect(element.innerHTML).toBe("Hola Mundo");
  });
});
