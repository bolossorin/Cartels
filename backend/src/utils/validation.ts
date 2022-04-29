import { UserInputError } from "apollo-server-core";

export function playerName(name) {
  const validChars = /^([a-z0-9\-]{3,13})$/i;
  // No dashes at the start or end of the string, or two or more dashes in a row.
  const invalidDashes = /[\-]{2,}|^\-|\-$/;

  if (name.match(validChars) && !name.match(invalidDashes)) {
    return name;
  }

  return null;
}

export function sanitizeAmount(input: string): number | null {
  const amount = input.replace(/[^\d]*/g, "");

  return parseInt(amount) ?? null;
}
