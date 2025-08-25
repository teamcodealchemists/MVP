import { WarehouseId } from "./warehouseId.entity";
import { LocalSupervisor } from "./localSupervisior.entity";
import { User } from "./user.entity";
import { Role } from "./role.entity";
import { Authentication } from "./authentication.entity";
import { UserId } from "./userId.entity";

export class GlobalSupervisor extends User {
    constructor(
        id: UserId,
        name: String,
        surname: String,
        phone: String,
        authentication: Authentication,
        role: Role
    ) {
        super(id, name, surname, phone, authentication, role);
    }

    registerLocalSupervisor(id: UserId, name: String, surname: String, phone: String, authentication: Authentication, warehouses: WarehouseId[]) {
        return new LocalSupervisor(id, name, surname, phone, authentication, Role.LOCAL, warehouses);
    }
}