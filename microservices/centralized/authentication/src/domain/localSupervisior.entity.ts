import { User } from "./user.entity";
import { UserId } from "./userId.entity";
import { WarehouseId } from "./warehouseId.entity";
import { Authentication } from "./authentication.entity";
import { Role } from "./role.entity";

export class LocalSupervisor extends User {
    private readonly warehouseAssigned: WarehouseId[];

    constructor(
        name: string,
        surname: string,
        phone: string,
        authentication: Authentication,
        role: Role,
        warehouseAssigned: WarehouseId[]
    ) {
        super(name, surname, phone, authentication, role);
        this.warehouseAssigned = warehouseAssigned;
    }

    getWarehouseAssigned(): WarehouseId[] {
        return this.warehouseAssigned;
    }
}