import {
  EntityManager,
  getRepository,
  In,
  Repository,
  Transaction,
  TransactionManager,
  TransactionRepository,
} from "typeorm";
import { Rank } from "../entity/Rank";
import { Character } from "../entity/Character";
import { District } from "../entity/District";
import { Player } from "../entity/Player";
import { Jail } from "../entity/Jail";
import { Configuration } from "../entity/Configuration";
import { Item } from "../entity/Item";
import { InventoryItem } from "../entity/InventoryItem";
import { random } from "../utils/random";
import { PerkService } from "./Perk";
import { IpAccessLog } from "../entity/IpAccessLog";
import { IpIntelligence } from "../entity/IpIntelligence";

export enum Currency {
  cash = "cash",
  crypto = "crypto",
  gold = "gold",
}

export const DISTRICT_DISTANCES = {
  Dirtlands: {
    Dirtlands: 0,
    "Park City": 145,
    "Sol Furioso": 307,
    "Marshall City": 203,
    "Valencia Hills": 406,
  },
  "Park City": {
    Dirtlands: 145,
    "Park City": 0,
    "Sol Furioso": 167,
    "Marshall City": 122,
    "Valencia Hills": 296,
  },
  "Sol Furioso": {
    Dirtlands: 307,
    "Park City": 167,
    "Sol Furioso": 0,
    "Marshall City": 229,
    "Valencia Hills": 293,
  },
  "Marshall City": {
    Dirtlands: 203,
    "Park City": 122,
    "Sol Furioso": 229,
    "Marshall City": 0,
    "Valencia Hills": 203,
  },
  "Valencia Hills": {
    Dirtlands: 406,
    "Park City": 296,
    "Sol Furioso": 293,
    "Marshall City": 203,
    "Valencia Hills": 0,
  },
};

interface JailPlayerParams {
  player: Player;
  crime: string;
  description: string;
  cellBlock: string;
  releaseDate: Date;
  special?: string;
}

export class GameService {
  game: any;
  perk: PerkService;

  constructor({ Perk }) {
    this.game = {};
    this.perk = Perk;
  }

  async warmGameState() {
    const ranks = await getRepository(Rank).find();
    const gameRanks = {};
    for (const rank of ranks) {
      gameRanks[rank.name] = rank;
      gameRanks[rank.id] = rank;
      console.log(`📈 GameService[Rank] -> ${rank.id} -> ${rank.name}`);
    }

    const characters = await getRepository(Character).find();
    const gameCharacters = {};
    for (const character of characters) {
      gameCharacters[character.name] = character;
      gameCharacters[character.id] = character;
      console.log(
        `🤔 GameService[Character] -> ${character.id} -> ${character.name}`
      );
    }

    const districts = await getRepository(District).find();
    const gameDistricts = {};
    for (const district of districts) {
      gameDistricts[district.name] = district;
      gameDistricts[district.id] = district;
      console.log(
        `🌎 GameService[District] -> ${district.id} -> ${district.name}`
      );
    }

    this.game = {
      ranks: gameRanks,
      characters: gameCharacters,
      districts: gameDistricts,
    };
  }

  getRank(rank: string): Rank {
    return this.game.ranks[rank];
  }

  getDistrict(district: string): District {
    return this.game.districts[district];
  }

  getCharacter(character: string): Character {
    return this.game.characters[character];
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async setActive(
    {
      player,
      date,
    }: {
      player: Player;
      date?: Date;
    },
    @TransactionManager() manager?: EntityManager
  ) {
    player.dateActive = date ?? new Date();

    await manager.save(player);
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async recordIp(
    player: Player,
    ipAddress: string,
    @TransactionRepository(IpAccessLog)
    ipAccessLogRepo?: Repository<IpAccessLog>,
    @TransactionRepository(IpIntelligence)
    ipIntelligenceRepo?: Repository<IpIntelligence>
  ): Promise<void> {
    try {
      let ipIntel = await ipIntelligenceRepo.findOne({ where: { ipAddress } });
      if (!ipIntel) {
        ipIntel = new IpIntelligence();
        ipIntel.ipAddress = ipAddress;

        await ipIntelligenceRepo.save(ipIntel, { reload: true });
      }

      let ipAccessLog = await ipAccessLogRepo.findOne({
        where: { player, ip: ipIntel },
      });
      if (!ipAccessLog) {
        ipAccessLog = new IpAccessLog();
        ipAccessLog.player = player;
        ipAccessLog.ip = ipIntel;
      }

      ipAccessLog.dateLastSeen = new Date();
      await ipAccessLogRepo.save(ipAccessLog);
    } catch {
      console.log(`couldn't record IP ${ipAddress} for ${player.id}`);
    }
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async awardXp(
    player: Player,
    xp: number,
    @TransactionRepository(Player) playerRepository?: Repository<Player>
  ): Promise<boolean> {
    if (xp <= 0) {
      return false;
    }
    const { affected } = await playerRepository.increment(
      { id: player.id },
      "xp",
      xp
    );

    return affected === 1;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async awardCash(
    player: Player,
    cash: number,
    @TransactionRepository(Player) playerRepository?: Repository<Player>
  ): Promise<boolean> {
    if (cash <= 0) {
      return false;
    }
    const { affected } = await playerRepository.increment(
      { id: player.id },
      "cash",
      cash
    );

    return affected === 1;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async awardCrypto(
    player: Player,
    crypto: number,
    @TransactionRepository(Player) playerRepository?: Repository<Player>
  ): Promise<boolean> {
    if (crypto <= 0) {
      return false;
    }
    const { affected } = await playerRepository.increment(
      { id: player.id },
      "crypto",
      crypto
    );

    return affected === 1;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async awardGold(
    player: Player,
    gold: number,
    @TransactionRepository(Player) playerRepository?: Repository<Player>
  ): Promise<boolean> {
    if (gold <= 0) {
      return false;
    }
    const { affected } = await playerRepository.increment(
      { id: player.id },
      "gold",
      gold
    );

    return affected === 1;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async deductCash(
    player: Player,
    cash: number,
    @TransactionRepository(Player) playerRepository?: Repository<Player>
  ): Promise<boolean> {
    if (cash <= 0) {
      return false;
    }
    const { affected } = await playerRepository.decrement(
      { id: player.id },
      "cash",
      cash
    );

    return affected === 1;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getPlayerInJail(
    player: Player,
    @TransactionRepository(Jail) jailRepository?: Repository<Jail>
  ): Promise<Jail | undefined> {
    return await jailRepository.findOne({ player });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getConfig(
    name: string,
    @TransactionRepository(Configuration)
    configRepository?: Repository<Configuration>
  ): Promise<string | undefined> {
    return (await configRepository.findOne({ name }))?.value ?? undefined;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async setConfig(
    name: string,
    value: string,
    @TransactionRepository(Configuration)
    configRepository?: Repository<Configuration>
  ): Promise<string | undefined> {
    const config = new Configuration();
    config.name = name;
    config.value = value;
    await configRepository.save(config);

    return value;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async awardItem(
    player: Player,
    itemCode: string,
    quantity: number,
    @TransactionRepository(Item) itemRepository?: Repository<Item>,
    @TransactionRepository(InventoryItem)
    inventoryItemRepository?: Repository<InventoryItem>
  ): Promise<void> {
    const item = await itemRepository.findOne({ itemCode });
    if (!item) {
      throw new Error("That item code does not exist");
    }

    const existingItem = await inventoryItemRepository.findOne({
      item,
      player,
    });
    if (existingItem) {
      existingItem.quantity += quantity;

      await inventoryItemRepository.save(existingItem);
    } else {
      const inventoryItem = new InventoryItem();
      inventoryItem.player = player;
      inventoryItem.quantity = quantity;
      inventoryItem.item = item;

      await inventoryItemRepository.save(inventoryItem);
    }
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async equipItem(
    player: Player,
    id: string,
    equip: boolean,
    @TransactionRepository(Item)
    itemRepository?: Repository<Item>,
    @TransactionRepository(InventoryItem)
    inventoryItemRepository?: Repository<InventoryItem>
  ): Promise<InventoryItem> {
    const item = await inventoryItemRepository.findOne(
      { id, player },
      { relations: ["item"] }
    );
    if (!item) {
      throw new Error("That item does not exist");
    }

    if (item.equipped === equip) {
      throw new Error(
        `You already have that item ${!equip ? "un" : ""}equipped`
      );
    }

    const equippable = ["weapon", "protection"];
    if (!equippable.includes(item.item.variant)) {
      throw new Error("That item cannot be equipped");
    }

    if (equip) {
      const items = await itemRepository.find({
        where: { variant: item.item.variant },
      });

      await inventoryItemRepository
        .createQueryBuilder()
        .update()
        .set({
          equipped: false,
        })
        .where("player = :playerId", { playerId: player.id })
        .andWhere("itemId IN(:...itemIds)", {
          itemIds: items.map((i) => i.id),
        })
        .execute();
    }

    item.equipped = equip;
    await inventoryItemRepository.save(item);

    return item;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async deductItem(
    player: Player,
    itemCode: string,
    quantity: ((existingQuantity: number) => number) | number,
    @TransactionRepository(Item) itemRepository?: Repository<Item>,
    @TransactionRepository(InventoryItem)
    inventoryItemRepository?: Repository<InventoryItem>
  ): Promise<void> {
    const item = await itemRepository.findOne({ itemCode });
    if (!item) {
      throw new Error("That item code does not exist");
    }

    const existingItem = await inventoryItemRepository.findOne({
      item,
      player,
    });
    if (existingItem) {
      let updatedQuantity;
      if (typeof quantity === "number") {
        updatedQuantity = existingItem.quantity - quantity;
      } else {
        updatedQuantity =
          existingItem.quantity - quantity(existingItem.quantity);
      }
      if (updatedQuantity <= 0) {
        await inventoryItemRepository.delete(existingItem.id);

        return;
      }

      existingItem.quantity = updatedQuantity;

      await inventoryItemRepository.save(existingItem);
    }
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getInventoryItems(
    player: Player,
    @TransactionRepository(InventoryItem)
    inventoryItemRepository?: Repository<InventoryItem>
  ): Promise<InventoryItem[]> {
    return await inventoryItemRepository.find({
      where: { player },
      relations: ["item"],
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getInventoryItemsByVariant(
    player: Player,
    variant: string,
    @TransactionRepository(InventoryItem)
    inventoryItemRepository?: Repository<InventoryItem>
  ): Promise<InventoryItem[]> {
    const inventoryItems = await inventoryItemRepository.find({
      where: { player },
      relations: ["item"],
    });

    return (
      inventoryItems?.filter(
        (inventoryItem) => inventoryItem.item.variant === variant
      ) ?? []
    );
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getInventoryItemsByEquipped(
    player: Player,
    equipped: boolean,
    @TransactionRepository(InventoryItem)
    inventoryItemRepository?: Repository<InventoryItem>
  ): Promise<InventoryItem[]> {
    return await inventoryItemRepository.find({
      where: { player, equipped },
      relations: ["item"],
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getInventoryItemById(
    player: Player,
    id: string,
    @TransactionRepository(InventoryItem)
    inventoryItemRepository?: Repository<InventoryItem>
  ): Promise<InventoryItem> {
    return await inventoryItemRepository.findOne({
      where: { player, id },
      relations: ["item"],
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getInventoryItemByItemCode(
    player: Player,
    itemCode: string,
    @TransactionRepository(InventoryItem)
    inventoryItemRepository?: Repository<InventoryItem>
  ): Promise<InventoryItem | undefined> {
    return await inventoryItemRepository.findOne({
      where: { player, item: { itemCode } },
      relations: ["item"],
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getInventoryItemsByItemId(
    player: Player,
    itemId: string,
    @TransactionRepository(InventoryItem)
    inventoryItemRepository?: Repository<InventoryItem>
  ): Promise<InventoryItem[]> {
    return await inventoryItemRepository.find({
      where: { player, itemId },
      relations: ["item"],
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getInventoryItemByItemId(
    player: Player,
    itemId: string,
    @TransactionRepository(InventoryItem)
    inventoryItemRepository?: Repository<InventoryItem>
  ): Promise<InventoryItem | undefined> {
    return await inventoryItemRepository.findOne({
      where: { player, itemId },
      relations: ["item"],
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getItem(
    id: string,
    @TransactionRepository(Item) itemRepository?: Repository<Item>
  ): Promise<Item> {
    return await itemRepository.findOne(id, { cache: 60000 });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getItemByCode(
    itemCode: string,
    @TransactionRepository(Item) itemRepository?: Repository<Item>
  ): Promise<Item> {
    return await itemRepository.findOne({
      where: {
        itemCode,
      },
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getItemsByVariant(
    variant: string,
    @TransactionRepository(Item) itemRepository?: Repository<Item>
  ): Promise<Item[]> {
    return await itemRepository.find({
      where: {
        variant,
      },
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async jailPlayer(
    {
      player,
      crime,
      description,
      releaseDate,
      cellBlock,
      special,
    }: JailPlayerParams,
    @TransactionRepository(Jail) jailRepository?: Repository<Jail>
  ) {
    const prisoner = new Jail();
    prisoner.player = player;
    prisoner.crime = crime;
    prisoner.description = description;
    prisoner.dateRelease = await this.perk.determineJailReleaseDate(
      player,
      crime,
      releaseDate
    );
    prisoner.cellBlock = cellBlock;
    prisoner.special = special ?? null;

    if (!special && player.isStaff) {
      const crypto = random(5, 30) * 10;

      prisoner.special = `${crypto} crypto`;
    }

    await jailRepository.save(prisoner);
  }

  async getCustomsInfo(player: Player, proposedAddition?: number) {
    const drugs = await this.getInventoryItemsByVariant(player, "drug");
    const min = 0;
    const max = 500;
    let current = 0;
    let travelRestriction = false;
    let hardRestriction = false;
    let hardRestrictionDelta = 0;
    if (drugs) {
      for (const drug of drugs) {
        current += drug.quantity;
      }
    }

    let description =
      "Trafficking contraband is prohibited by Valencia Hills law. To avoid arrest, adjust the quantity you traffick across regional borders.";
    if (current > max) {
      travelRestriction = true;
      description =
        "You are carrying contraband at 100% risk of detection. If you travel between regions, this guarantees confiscation and arrest.";
    }
    if (current + (proposedAddition ?? 0) > max * 2) {
      hardRestriction = true;
      hardRestrictionDelta = current + (proposedAddition ?? 0) - max * 2;
      description =
        "You are carrying excessive amounts of contraband and will not be able to produce or purchase more until you reduce the amount on hand.";
    }

    let label = "Zero Risk";
    if (current > max) {
      label = `Invasive Search (${max} limit)`;
    } else if (current >= max * 0.9) {
      label = "Very High Risk";
    } else if (current >= max * 0.75) {
      label = "High Risk";
    } else if (current >= max * 0.5) {
      label = "Moderate Risk";
    } else if (current >= max * 0.25) {
      label = "Low Risk";
    } else if (current >= 1) {
      label = "Normal Risk";
    }

    const performCustomsSearch = () => {
      const odds = random(1, 1000);
      const bustOdds = current > max ? 1000 : (current / max) * 200;
      const bustType = random(1, 4) === 1 ? "FULL" : "PARTIAL";
      const success = odds > bustOdds;

      return {
        success,
        bustType,
      };
    };

    return {
      min,
      max,
      current,
      description,
      label,
      travelRestriction,
      hardRestriction,
      hardRestrictionDelta,
      performCustomsSearch,
    };
  }
}
