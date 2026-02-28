import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const PASSWORD_SCHEME = "scrypt";
const KEY_LENGTH = 64;
const SALT_BYTES = 16;

export const hashPassword = (plainPassword: string): string => {
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const hash = scryptSync(plainPassword, salt, KEY_LENGTH).toString("hex");
  return `${PASSWORD_SCHEME}$${salt}$${hash}`;
};

export const isLegacyPlaintextPassword = (storedPassword: string): boolean =>
  !storedPassword.startsWith(`${PASSWORD_SCHEME}$`);

export const verifyPassword = (
  plainPassword: string,
  storedPassword: string,
): boolean => {
  if (isLegacyPlaintextPassword(storedPassword)) {
    return plainPassword === storedPassword;
  }

  const [scheme, salt, storedHash] = storedPassword.split("$");
  if (scheme !== PASSWORD_SCHEME || !salt || !storedHash) {
    return false;
  }

  try {
    const computedHash = scryptSync(plainPassword, salt, KEY_LENGTH).toString(
      "hex",
    );
    const storedHashBuffer = Buffer.from(storedHash, "hex");
    const computedHashBuffer = Buffer.from(computedHash, "hex");

    if (storedHashBuffer.length !== computedHashBuffer.length) {
      return false;
    }

    return timingSafeEqual(storedHashBuffer, computedHashBuffer);
  } catch {
    return false;
  }
};
