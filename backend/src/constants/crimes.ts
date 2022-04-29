import { v5 as uuidv5 } from "uuid";

const UUID_NAMESPACE = "04f07080-9644-4f4b-8a84-b64e5859121e";

export interface Crime {
  id: string;
  ord: number;
  name: string;
  description: string;
  image: string;
  limitedTime: boolean;
  difficulty: string;
  loot: CrimeLoot;
  progression: CrimeProgression;
}

export interface CrimeProgression {
  minimumCxp: number;
  targetCxp: number;
}

export interface CrimeLoot {
  money?: number;
  crypto?: number;
  exp?: number;
}

export const CRIMES: Crime[] = [
  // STREET
  {
    id: uuidv5("Search a car wreck", UUID_NAMESPACE),
    ord: 1,
    name: "Search a car wreck",
    description: "Find a wrecked car and strip it for possessions",
    image: "SearchCarWreck",
    limitedTime: false,
    difficulty: "Street",
    loot: { money: 25, crypto: 0, exp: 1 },
    progression: {
      minimumCxp: 0,
      targetCxp: 25,
    },
  },
  {
    id: uuidv5("Pickpocket a man on street", UUID_NAMESPACE),
    ord: 2,
    name: "Pickpocket a man on street",
    description: "He would never stand up to you",
    image: "PickpocketMan",
    limitedTime: false,
    difficulty: "Street",
    loot: { money: 65, crypto: 0, exp: 2 },
    progression: {
      minimumCxp: 1,
      targetCxp: 25,
    },
  },
  {
    id: uuidv5("Search old factory", UUID_NAMESPACE),
    ord: 3,
    name: "Search old factory",
    description: "Nobody's going to miss this stuff",
    image: "SearchFactory",
    limitedTime: false,
    difficulty: "Street",
    loot: { money: 125, crypto: 0, exp: 3 },
    progression: {
      minimumCxp: 8,
      targetCxp: 50,
    },
  },
  {
    id: uuidv5("Steal gas", UUID_NAMESPACE),
    ord: 4,
    name: "Steal gas",
    description: "A family RV is the perfect target",
    image: "StealGas",
    limitedTime: false,
    difficulty: "Street",
    loot: { money: 135, crypto: 0, exp: 3 },
    progression: {
      minimumCxp: 45,
      targetCxp: 60,
    },
  },
  {
    id: uuidv5("Pickpocket a business man", UUID_NAMESPACE),
    ord: 5,
    name: "Pickpocket a business man",
    description: "He can afford it",
    image: "PickpocketBusinessman",
    limitedTime: false,
    difficulty: "Street",
    loot: { money: 275, crypto: 0, exp: 4 },
    progression: {
      minimumCxp: 90,
      targetCxp: 90,
    },
  },
  {
    id: uuidv5("Steal a bicycle", UUID_NAMESPACE),
    ord: 6,
    name: "Steal a bicycle",
    description: "The more gears, the more cash",
    image: "StealBicycle",
    limitedTime: false,
    difficulty: "Street",
    loot: { money: 390, crypto: 0, exp: 4 },
    progression: {
      minimumCxp: 115,
      targetCxp: 110,
    },
  },
  {
    id: uuidv5("Rob a garage", UUID_NAMESPACE),
    ord: 7,
    name: "Rob a garage",
    description: "Case out a car garage and rip it off when nobody's in",
    image: "RobGarage",
    limitedTime: false,
    difficulty: "Street",
    loot: { money: 440, crypto: 0, exp: 4 },
    progression: {
      minimumCxp: 130,
      targetCxp: 150,
    },
  },
  {
    id: uuidv5("Rob a liquor store", UUID_NAMESPACE),
    ord: 8,
    name: "Rob a liquor store",
    description: "Everyone loves liquor, but not as much as money",
    image: "RobLiquorStore",
    limitedTime: false,
    difficulty: "Street",
    loot: { money: 600, crypto: 0, exp: 5 },
    progression: {
      minimumCxp: 150,
      targetCxp: 250,
    },
  },
  // {
  //   id: uuidv5("Search for Easter Eggs", UUID_NAMESPACE),
  //   ord: 9,
  //   name: "Search for Easter Eggs",
  //   description: "I'm sure these have value somewhere",
  //   image: "EasterEgg",
  //   limitedTime: true,
  //   difficulty: "Street",
  //   loot: { money: 0, crypto: 0, exp: 50 },
  //   progression: {
  //     minimumCxp: 0,
  //     targetCxp: 250,
  //   },
  // },
  // HEISTS
  {
    id: uuidv5("Rob a house", UUID_NAMESPACE),
    ord: 1,
    name: "Rob a house",
    description:
      "Houses with palm trees usually have luxury goods laying around",
    image: "RobHouse",
    limitedTime: false,
    difficulty: "Heists",
    loot: { money: 700, crypto: 0, exp: 7 },
    progression: {
      minimumCxp: 1000,
      targetCxp: 25,
    },
  },
  {
    id: uuidv5("Pickpocket a drug dealer", UUID_NAMESPACE),
    ord: 2,
    name: "Pickpocket a drug dealer",
    description: "Shouldn't be too hard to get in character as a junkie",
    image: "PickpocketDrugDealer",
    limitedTime: false,
    difficulty: "Heists",
    loot: { money: 700, crypto: 0, exp: 8 },
    progression: {
      minimumCxp: 1020,
      targetCxp: 35,
    },
  },
  {
    id: uuidv5("Rob a jewelery store", UUID_NAMESPACE),
    ord: 3,
    name: "Rob a jewelery store",
    description: "I've got some extra loud blanks, just in case",
    image: "RobJewelleryStore",
    limitedTime: false,
    difficulty: "Heists",
    loot: { money: 990, crypto: 0, exp: 8 },
    progression: {
      minimumCxp: 1060,
      targetCxp: 45,
    },
  },
  {
    id: uuidv5("Steal a cargo van", UUID_NAMESPACE),
    ord: 4,
    name: "Steal a cargo van",
    description: "An ice cream truck doesn't count",
    image: "StealCargoVan",
    limitedTime: false,
    difficulty: "Heists",
    loot: { money: 1075, crypto: 0, exp: 9 },
    progression: {
      minimumCxp: 1095,
      targetCxp: 60,
    },
  },
  {
    id: uuidv5("Hack an ATM", UUID_NAMESPACE),
    ord: 5,
    name: "Hack an ATM",
    description: "Most of them still run Windows XP",
    image: "RobATM",
    limitedTime: false,
    difficulty: "Heists",
    loot: { money: 1150, crypto: 0, exp: 9 },
    progression: {
      minimumCxp: 1150,
      targetCxp: 90,
    },
  },
  {
    id: uuidv5("Steal a luxury sports car", UUID_NAMESPACE),
    ord: 6,
    name: "Steal a luxury sports car",
    description: "You do know what the paddles do, right?",
    image: "StealCar",
    limitedTime: false,
    difficulty: "Heists",
    loot: { money: 1250, crypto: 0, exp: 9 },
    progression: {
      minimumCxp: 1199,
      targetCxp: 110,
    },
  },
  {
    id: uuidv5("Rob a local bank", UUID_NAMESPACE),
    ord: 7,
    name: "Rob a local bank",
    description: "Bus driver? What bus driver?",
    image: "RobLocalBank",
    limitedTime: false,
    difficulty: "Heists",
    loot: { money: 1300, crypto: 0, exp: 10 },
    progression: {
      minimumCxp: 1230,
      targetCxp: 150,
    },
  },
  {
    id: uuidv5("Steal a yacht", UUID_NAMESPACE),
    ord: 8,
    name: "Steal a yacht",
    description: "Piracy doesn't just mean free movies",
    image: "StealYacht",
    limitedTime: false,
    difficulty: "Heists",
    loot: { money: 1400, crypto: 0, exp: 10 },
    progression: {
      minimumCxp: 1300,
      targetCxp: 250,
    },
  },
  // CORPORATE
  {
    id: uuidv5("Steal tax money", UUID_NAMESPACE),
    ord: 1,
    name: "Steal tax money",
    description: "Taxation is theft anyway",
    image: "StealTax",
    limitedTime: false,
    difficulty: "Corporate",
    loot: { money: 1500, crypto: 25, exp: 13 },
    progression: {
      minimumCxp: 4000,
      targetCxp: 30,
    },
  },
  {
    id: uuidv5("Pickpocket an accountant", UUID_NAMESPACE),
    ord: 2,
    name: "Pickpocket an accountant",
    description: "Mob accountants are off limits by tradition",
    image: "PickpocketAccountant",
    limitedTime: false,
    difficulty: "Corporate",
    loot: { money: 1700, crypto: 30, exp: 15 },
    progression: {
      minimumCxp: 4030,
      targetCxp: 35,
    },
  },
  {
    id: uuidv5("Rob an exotic car", UUID_NAMESPACE),
    ord: 3,
    name: "Rob an exotic car",
    description: "We've got a guy who will pay for a prototype Cybertruck",
    image: "RobCarSalon",
    limitedTime: false,
    difficulty: "Corporate",
    loot: { money: 1900, crypto: 40, exp: 17 },
    progression: {
      minimumCxp: 4050,
      targetCxp: 50,
    },
  },
  {
    id: uuidv5("Steal a private jet", UUID_NAMESPACE),
    ord: 4,
    name: "Steal a private jet",
    description: "Who isn't sick of airport security?",
    image: "StealJet",
    limitedTime: false,
    difficulty: "Corporate",
    loot: { money: 2100, crypto: 45, exp: 17 },
    progression: {
      minimumCxp: 4070,
      targetCxp: 90,
    },
  },
  {
    id: uuidv5("Rob a penthouse", UUID_NAMESPACE),
    ord: 5,
    name: "Rob a penthouse",
    description: "A cable guy disguise is the most effective",
    image: "RobPenthouse",
    limitedTime: false,
    difficulty: "Corporate",
    loot: { money: 2300, crypto: 50, exp: 18 },
    progression: {
      minimumCxp: 4190,
      targetCxp: 150,
    },
  },
  {
    id: uuidv5("Steal an armored car", UUID_NAMESPACE),
    ord: 6,
    name: "Steal an armored car",
    description: "An inside man can provide us with routes",
    image: "StealArmoredCar",
    limitedTime: false,
    difficulty: "Corporate",
    loot: { money: 2400, crypto: 60, exp: 20 },
    progression: {
      minimumCxp: 4250,
      targetCxp: 190,
    },
  },
  {
    id: uuidv5("Rip off a Local Boss", UUID_NAMESPACE),
    ord: 7,
    name: "Rip off a Local Boss",
    description: "Blowback is practically a guarantee",
    image: "PickpocketLocalBoss",
    limitedTime: false,
    difficulty: "Corporate",
    loot: { money: 2750, crypto: 150, exp: 23 },
    progression: {
      minimumCxp: 4500,
      targetCxp: 250,
    },
  },
  {
    id: uuidv5("Invade a mob compound", UUID_NAMESPACE),
    ord: 8,
    name: "Invade a mob compound",
    description: "All those hours in Hitman finally pay off",
    image: "RobMobCompound",
    limitedTime: false,
    difficulty: "Corporate",
    loot: { money: 3000, crypto: 175, exp: 25 },
    progression: {
      minimumCxp: 4900,
      targetCxp: 400,
    },
  },
];
