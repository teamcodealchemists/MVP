import { validate } from 'class-validator';
// NestJS & Framework Imports
import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

// Domain Entities & Interfaces
import { AuthRepository } from "src/domain/mongodb/auth.repository";
import { User } from "src/domain/user.entity";
import { Authentication } from "src/domain/authentication.entity";
import { GlobalSupervisor } from "src/domain/globalSupervisor.entity";
import { LocalSupervisor } from "src/domain/localSupervisior.entity";
import { Role } from "src/domain/role.entity";
import { WarehouseId } from "src/domain/warehouseId.entity";

// Infrastructure / Mongoose Models
import { AuthenticationModel } from "src/infrastructure/adapters/mongodb/models/auth.model";
import { TokenListModel } from "src/infrastructure/adapters/mongodb/models/tokenList.schema";
import { Token } from "src/domain/token.entity";
import { TokenStatus } from 'src/domain/tokenStatus.entity';

const logger = new Logger('AuthRepositoryMongo');


@Injectable()
export class AuthRepositoryMongo implements AuthRepository {
    constructor(
        @InjectModel('Authentication') private readonly authenticationModel: AuthenticationModel,
        @InjectModel('TokenList') private readonly tokenListModel: TokenListModel
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

    async newProfile(user: User): Promise<string> {
        const existingUser = await this.authenticationModel.findOne({ email: user.getAuthentication().getEmail() }).exec();
        if (existingUser) {
            throw new Error('Profile with this email already exists');
        }

        if (user.getRole() == Role.GLOBAL) {
            const newGlobalSupervisor = new this.authenticationModel({
                name: user.getName(),
                surname: user.getSurname(),
                phone: user.getPhone(),
                email: user.getAuthentication().getEmail(),
                password: user.getAuthentication().getPassword(),
                isGlobal: true
            });
            await newGlobalSupervisor.save();
            return Promise.resolve(newGlobalSupervisor.id);
        } else {
            const newLocalSupervisor = new this.authenticationModel({
                name: user.getName(),
                surname: user.getSurname(),
                phone: user.getPhone(),
                email: user.getAuthentication().getEmail(),
                password: user.getAuthentication().getPassword(),
                isGlobal: false,
                warehouseAssigned: (user as LocalSupervisor).getWarehouseAssigned().map(warehouseId => warehouseId.getId())
            });
            await newLocalSupervisor.save();
            return Promise.resolve(newLocalSupervisor.id);
        }
    }

    async getGlobalSupervisor(): Promise<GlobalSupervisor | null> {
        const globalSupervisor = await this.authenticationModel.findOne({ isGlobal: true }).exec();
        if (!globalSupervisor) {
            return Promise.resolve(null);
        }
        return Promise.resolve(new GlobalSupervisor(
            globalSupervisor.name,
            globalSupervisor.surname,
            globalSupervisor.phone,
            new Authentication(globalSupervisor.email, globalSupervisor.password),
            Role.GLOBAL
        ));
    }

    async getAllProfiles(): Promise<User[]> {
        const profiles = await this.authenticationModel.find().exec();
        return Promise.resolve(profiles.map(auth => {
            if (auth.isGlobal) {
                return new GlobalSupervisor(auth.name, auth.surname, auth.phone, new Authentication(auth.email, auth.password), Role.GLOBAL);
            } else {
                const warehouseIds = (auth.warehouseAssigned || []).map((id: number) => new WarehouseId(id));
                return new LocalSupervisor(auth.name, auth.surname, auth.phone, new Authentication(auth.email, auth.password), Role.LOCAL, warehouseIds);
            }
        }));
    }

    async storeToken(token: Token): Promise<void> {
        const newToken = new this.tokenListModel({
            sub: token.getSub(),
            status: token.getStatus()
        });
        await newToken.save();
    }

    async getToken(sub: string): Promise<Token | null> {
        const token = await this.tokenListModel.findOne({ sub: sub }).exec();
        if (!token) {
            return Promise.resolve(null);
        }
        return Promise.resolve(new Token(token.sub, token.status ? TokenStatus.ACTIVE : TokenStatus.REVOKED));
    }

    async updateToken(token: Token): Promise<void> {
        await this.tokenListModel.updateOne({ sub: token.getSub() }, { status: token.getStatus() }).exec();
        return Promise.resolve();
    }
}