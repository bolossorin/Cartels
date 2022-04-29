import { Property } from "../entity/Property";
import { Repository, Transaction, TransactionRepository } from "typeorm";
import { District } from "../entity/District";

export class PropertyService {
  @Transaction({ isolation: "READ COMMITTED" })
  async getAllProperties(
    @TransactionRepository(Property)
    propertiesRepository?: Repository<Property>
  ): Promise<Property[]> {
    return await propertiesRepository.find();
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getProperty(
    district: District,
    propertyType: string,
    @TransactionRepository(Property)
    propertiesRepository?: Repository<Property>
  ): Promise<Property | undefined> {
    return await propertiesRepository.findOne({
      where: {
        propertyType,
        district,
      },
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getPropertyById(
    id: string | number,
    @TransactionRepository(Property)
    propertiesRepository?: Repository<Property>
  ): Promise<Property | undefined> {
    return await propertiesRepository.findOne(id);
  }
}
