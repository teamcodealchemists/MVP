import { AuthRepository } from "src/domain/mongodb/auth.repository";
import { User } from "src/domain/user.entity";
import { AuthenticationModel } from "src/infrastructure/adapters/mongdb/models/auth.model";
import { Authentication } from "src/domain/authentication.entity";
import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

const logger = new Logger('AuthRepositoryMongo');


@Injectable()
export class AuthRepositoryMongo implements AuthRepository {
    constructor(
        @InjectModel('Authentication') private readonly authenticationModel: AuthenticationModel
    ) {}

    async findByEmail(email: string): Promise<Authentication | null> {
        logger.log(`Searching for authentication by email: ${email}`);
        const auth = await this.authenticationModel.findOne({ email: email }).exec();
        if (!auth) {
            logger.warn(`No authentication found for email: ${email}`);
            return Promise.resolve(null);
        }
        logger.log(`Authentication found for email: ${email}`);
        return Promise.resolve(new Authentication(auth.email, auth.password));
    }

    async getIdByEmail(email: string): Promise<string | null> {
        return Promise.resolve(null);
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