import { AuthRepository } from "src/domain/mongodb/auth.repository";
import { User } from "src/domain/user.entity";
import { AuthenticationModel } from "src/infrastructure/adapters/mongdb/models/auth.model";
import { Authentication } from "src/domain/authentication.entity";
import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { GlobalSupervisor } from "src/domain/globalSupervisor.entity";
import { Role } from "src/domain/role.entity";
import { LocalSupervisor } from "src/domain/localSupervisior.entity";
import { WarehouseId } from "src/domain/warehouseId.entity";

const logger = new Logger('AuthRepositoryMongo');


@Injectable()
export class AuthRepositoryMongo implements AuthRepository {
    constructor(
        @InjectModel('Authentication') private readonly authenticationModel: AuthenticationModel
    ) {}

    async findByEmail(email: string): Promise<User | null> {
        logger.log(`Searching for authentication by email: ${email}`);
        const auth = await this.authenticationModel.findOne({ email: email }).exec();
        if (!auth) {
            logger.warn(`No authentication found for email: ${email}`);
            return Promise.resolve(null);
        }
        logger.log(`Authentication found for email: ${email}`);

        if(auth.isGlobal)
        {
            return Promise.resolve(new GlobalSupervisor(auth.name,auth.surname,auth.phone,new Authentication(auth.email,auth.password),Role.GLOBAL));
        }
        else
        {
            const warehouseIds = (auth.warehouseAssigned || []).map((id: number) => new WarehouseId(id));
            return Promise.resolve(new LocalSupervisor(
                auth.name,
                auth.surname,
                auth.phone,
                new Authentication(auth.email, auth.password),
                Role.LOCAL,
                warehouseIds
            ));
        }
    }

    async getIdByEmail(email: string): Promise<string | null> {
        logger.log('Retriving ID of user by email');
        const user = await this.authenticationModel.findOne({ email: email}).exec();
        if (!user) {
            logger.warn(`No id found for this email`);
            return Promise.resolve(null);
        }
        logger.log("Id found for this email: " + user.id);
        return Promise.resolve(user.id);
    }
    async existsByAuth(auth: Authentication): Promise<boolean> { 
        return Promise.resolve(false);
    }
    async newProfile(auth: User): Promise<string> {
        return Promise.resolve("");
    }
    async deleteById(id: string): Promise<void> {
        return Promise.resolve();
    }
    async getAllProfiles(): Promise<User[]> {
        return Promise.resolve([]);
    } 
}