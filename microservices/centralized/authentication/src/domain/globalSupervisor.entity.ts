import { WarehouseId } from "./warehouseId.entity";
import { LocalSupervisor } from "./localSupervisior.entity";
import { User } from "./user.entity";
import { Role } from "./role.entity";
import { Authentication } from "./authentication.entity";
import { UserId } from "./userId.entity";

export class GlobalSupervisor extends User {
    constructor(
        name: string,
        surname: string,
        phone: string,
        authentication: Authentication,
        role: Role
    ) {
        super(name, surname, phone, authentication, role);
    }

    registerLocalSupervisor(name: string, surname: string, phone: string, authentication: Authentication, warehouses: WarehouseId[]) {
        return new LocalSupervisor(name, surname, phone, authentication, Role.LOCAL, warehouses);
    }
}