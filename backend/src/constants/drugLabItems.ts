import { v5 as uuidv5 } from "uuid";

const UUID_NAMESPACE = "55f07080-9644-4f4b-8a84-b64e5859121a";

export interface DrugLabItem {
  id: string;
  name: string;
  capability: string;
  prices: DrugLabItemPrices;
  image: string;
  variant: string;
  unlock?: number;
}

export interface DrugLabItemPrices {
  cash: number;
  crypto: number;
}

export const DRUG_LAB_VARIANTS = {
  lab: "MANUFACTURING_LAB",
  hub: "DISTRIBUTION_HUB",
};

export const DRUG_LAB_ITEMS: DrugLabItem[] = [
  // LABS
  {
    id: uuidv5("Crackhouse", UUID_NAMESPACE),
    name: "Crackhouse",
    capability: "10 units per hour",
    prices: {
      cash: 5000,
      crypto: 500,
    },
    image: "crackHouse",
    variant: DRUG_LAB_VARIANTS.lab,
  },
  {
    id: uuidv5("Suburban House", UUID_NAMESPACE),
    name: "Suburban House",
    capability: "15 units per hour",
    prices: {
      cash: 12500,
      crypto: 1250,
    },
    image: "suburbanHouse",
    variant: DRUG_LAB_VARIANTS.lab,
    unlock: 2,
  },
  {
    id: uuidv5("Recreational Vehicle", UUID_NAMESPACE),
    name: "Recreational Vehicle",
    capability: "25 units per hour",
    prices: {
      cash: 75000,
      crypto: 7500,
    },
    image: "rv",
    variant: DRUG_LAB_VARIANTS.lab,
    unlock: 3,
  },
  {
    id: uuidv5("Professional Lab", UUID_NAMESPACE),
    name: "Professional Lab",
    capability: "40 units per hour",
    prices: {
      cash: 1000000,
      crypto: 100000,
    },
    image: "professionalLab",
    variant: DRUG_LAB_VARIANTS.lab,
    unlock: 5,
  },
  {
    id: uuidv5("Warehouse", UUID_NAMESPACE),
    name: "Warehouse",
    capability: "60 units per hour",
    prices: {
      cash: 6500000,
      crypto: 650000,
    },
    image: "warehouse",
    variant: DRUG_LAB_VARIANTS.lab,
    unlock: 7,
  },
  {
    id: uuidv5("Secluded Megalab", UUID_NAMESPACE),
    name: "Secluded Megalab",
    capability: "100 units per hour",
    prices: {
      cash: 10000000,
      crypto: 1000000,
    },
    image: "megalab",
    variant: DRUG_LAB_VARIANTS.lab,
    unlock: 10,
  },
  // HUBS
  {
    id: uuidv5("Used Box Truck", UUID_NAMESPACE),
    name: "Used Box Truck",
    capability: "70 units capacity",
    prices: {
      cash: 5000,
      crypto: 500,
    },
    image: "boxTruck",
    variant: DRUG_LAB_VARIANTS.hub,
  },
  {
    id: uuidv5("Safehouse", UUID_NAMESPACE),
    name: "Safehouse",
    capability: "150 units capacity",
    prices: {
      cash: 100000,
      crypto: 10000,
    },
    image: "safeHouse",
    variant: DRUG_LAB_VARIANTS.hub,
    unlock: 4,
  },
  {
    id: uuidv5("Semi Trailer", UUID_NAMESPACE),
    name: "Semi Trailer",
    capability: "400 units capacity",
    prices: {
      cash: 250000,
      crypto: 25000,
    },
    image: "semi",
    variant: DRUG_LAB_VARIANTS.hub,
    unlock: 6,
  },
  {
    id: uuidv5("Distribution Warehouse", UUID_NAMESPACE),
    name: "Distribution Warehouse",
    capability: "700 units capacity",
    prices: {
      cash: 3000000,
      crypto: 300000,
    },
    image: "distributionWarehouse",
    variant: DRUG_LAB_VARIANTS.hub,
    unlock: 8,
  },
];
