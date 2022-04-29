import * as crypto from "crypto";
import { Account } from "../entity/Account";

interface IPasswords {
  salt: string;
  passwordHash: string;
  comparablePasswordHash: string;
}

export const safeEqual = (hashOne: string, hashTwo: string) => {
  return crypto.timingSafeEqual(Buffer.from(hashOne), Buffer.from(hashTwo));
};

export const processPassword = async (
  password: string,
  account: Account
): Promise<IPasswords> => {
  const salt = await createNonce(account);
  const passwordHash = await hash(password, salt);

  const rounds = 30 + password.length;
  let comparablePasswordHash = "23F#@$tH$hhJK43f23F#";
  let newSalt = "";
  let newPassword = "";
  for (let i = 0; i < rounds; i++) {
    newSalt = `${newSalt}${comparablePasswordHash}_3248DDt3546#^#$54_${comparablePasswordHash}${
      i * 6782
    }`;
    newPassword = `${newPassword}${password}_3248DDt3546#^#$54_${password.substring(
      i
    )}${i * 1092}`;

    comparablePasswordHash = await hash(newPassword, newSalt);
  }
  comparablePasswordHash = comparablePasswordHash.substring(24, 64);

  return { salt, passwordHash, comparablePasswordHash };
};

export const hash = async (password: string, salt: string): Promise<string> => {
  return crypto
    .createHash("sha512")
    .update(`___${salt}_n%56GFg^jJWX##fg_${password}_${salt}`)
    .digest("hex");
};

export const checksum = async (obj: Record<string, any>): Promise<string> => {
  return crypto.createHash("sha512").update(JSON.stringify(obj)).digest("hex");
};

export const createNonce = async (account: Account) => {
  const accountFactors = `${account.id} ${account.email} ${account.salt}`;

  return crypto
    .createHash("sha512")
    .update(
      `${accountFactors}_2342${Math.random()}34Ffwe56@#$@#$${Math.random()}$41232dfdcbhg_${Math.random()}`
    )
    .digest("hex");
};

export const validToken = async (token) => token.match(/^\w{128}$/g);
