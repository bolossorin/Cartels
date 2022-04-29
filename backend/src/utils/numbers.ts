export const ordinal = function (n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;

  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const wealthStatus = (n) => {
  if (n < 0) {
    return "Dirty hacker";
  }
  if (n < 10000) {
    return "Penniless";
  }
  if (n < 50000) {
    return "Broke";
  }
  if (n < 125000) {
    return "Working Class";
  }
  if (n < 250000) {
    return "Middle Class";
  }
  if (n < 500000) {
    return "Rich";
  }
  if (n < 1100000) {
    return "Very Rich";
  }
  if (n < 2500000) {
    return "Smoking Paper";
  }
  if (n < 4000000) {
    return "Dangerously Healthy";
  }
  if (n < 10000000) {
    return "Emerging Empire";
  }
  if (n < 20000000) {
    return "Ferrari Red";
  }
  if (n < 80000000) {
    return "Richer than God";
  }

  return "Minted Empire";
};

export const shuffleArray = (array: Array<any>): Array<any> => {
  return array.sort(function () {
    return 0.5 - Math.random();
  });
};
