export const random = (minimum: number, maximum: number) => {
  const min = Math.ceil(minimum);
  const max = Math.floor(maximum);

  return Math.round(Math.random() * (max - min) + min);
};

export const randomValue = <T>(array: Array<T>): T => {
  return array[~~(array.length * Math.random())];
};

// skew = 1        symmetric
// skew > 1        shifted to the max
// 0 < skew < 1    shifted to min
export const gaussianRandom = (
  minimum: number,
  maximum: number,
  skew: number
) => {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) num = gaussianRandom(minimum, maximum, skew); // resample between 0 and 1 if out of range
  num = Math.pow(num, skew); // Skew
  num *= maximum - minimum; // Stretch to fill range
  num += minimum; // offset to min
  return num;
};

export const randomPlateLetters = (len) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from(Array(len), () =>
    letters.charAt(random(0, letters.length - 2))
  ).join("");
};
export const randomPlateNumbers = (len) => {
  const numbers = "0123456789";
  return Array.from(Array(len), () =>
    numbers.charAt(random(0, numbers.length - 2))
  ).join("");
};
export const randomPlate = (): string => {
  return `${randomPlateLetters(2)}-${randomPlateNumbers(
    3
  )}-${randomPlateLetters(2)}`;
};

export function randomFunctionFromOddsPool(odds, funcs) {
  let ar = [];
  let i,
    sum = 0;

  // that following initialization loop could be done only once above that
  // randexec() function, we let it here for clarity

  for (
    i = 0;
    i < odds.length - 1;
    i++ // notice the '-1'
  ) {
    sum += odds[i];
    ar[i] = sum;
  }

  // Then we get a random number and finds where it sits inside the probabilities
  // defined earlier

  const r = Math.random(); // returns [0,1]

  for (i = 0; i < ar.length && r >= ar[i]; i++);

  // Finally execute the function and return its result

  return funcs[i];
}

export function bankResultCalculator(amount, accountType, riskiness) {
  const RISKY_VARIANCE = 25;
  const UNCHARTED_VARIANCE = 55;

  let result = 0;
  if (accountType === "savings") {
    result = (amount * 2.5) / 100;
  }

  if (accountType === "investment") {
    let variance = 10;
    if (riskiness === "risky") {
      variance = RISKY_VARIANCE;
    }
    if (riskiness === "uncharted") {
      variance = UNCHARTED_VARIANCE;
    }

    let resultFactor = gaussianRandom(-120, 120, 1) / 10;
    const conditionsOdds = random(0, 100);
    if (conditionsOdds < variance) {
      resultFactor = random(-120, 120) / 10;
    }
    if (conditionsOdds > 55) {
      resultFactor = gaussianRandom(-80 / 9, 120, 1) / 10;
    }

    result = (resultFactor * amount) / 100;
  }

  return result;
}
