import {
  hashPassword,
  isLegacyPlaintextPassword,
  verifyPassword,
} from "./password.util";

describe("password util", () => {
  it("hashes password and verifies correctly", () => {
    const plain = "StrongPass#2026";
    const hashed = hashPassword(plain);

    expect(hashed).not.toBe(plain);
    expect(hashed.startsWith("scrypt$")).toBe(true);
    expect(verifyPassword(plain, hashed)).toBe(true);
  });

  it("rejects invalid password for hashed value", () => {
    const hashed = hashPassword("Correct#Pass1");
    expect(verifyPassword("Wrong#Pass1", hashed)).toBe(false);
  });

  it("supports legacy plaintext password and marks it as legacy", () => {
    const legacyPassword = "admin123";

    expect(isLegacyPlaintextPassword(legacyPassword)).toBe(true);
    expect(verifyPassword("admin123", legacyPassword)).toBe(true);
    expect(verifyPassword("admin124", legacyPassword)).toBe(false);
  });

  it("returns false for malformed hashed password", () => {
    expect(verifyPassword("any", "scrypt$only-salt")).toBe(false);
    expect(verifyPassword("any", "scrypt$salt$not-hex")).toBe(false);
  });
});
