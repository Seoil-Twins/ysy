import { InferAttributes, Transaction, WhereOptions } from "sequelize";
import { Service } from "./service.js";
import { CreateAdmin } from "../types/admin.type.js";
import { Admin } from "../models/admin.model.js";

class AdminService extends Service {
  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }
  async select(where: WhereOptions<Admin>): Promise<Admin | null> {
    const admin: Admin | null = await Admin.findOne({ where });
    return admin;
  }

  async create(transaction: Transaction | null, data: CreateAdmin): Promise<Admin> {
    const createdAdmin: Admin = await Admin.create(data, { transaction });
    return createdAdmin;
  }

  async update(transaction: Transaction | null, admin: Admin, data: Partial<InferAttributes<Admin>>): Promise<any> {
    const updatedAdmin: Admin = await admin.update(data, { transaction });
    return updatedAdmin;
  }

  async delete(transaction: Transaction | null, admin: Admin): Promise<any> {
    await admin.destroy({ transaction });
  }
}

export default AdminService;
