import { Authentication } from "../authentication.entity";
import { GlobalSupervisor } from "../globalSupervisor.entity";
import { Token } from "../token.entity";
import { User } from "../user.entity";

export interface AuthRepository {
    findByEmail(email: string): Promise<User | null>;
    getIdByEmail(email: string): Promise<string | null>;
    newProfile(auth: User): Promise<string>;
    deleteById(id: string): Promise<void>;
    getGlobalSupervisor(): Promise<GlobalSupervisor | null>;
    getAllProfiles(): Promise<User[]>;
    storeToken(token: Token): Promise<void>;
    getToken(sub: string): Promise<Token | null>;
    updateToken(token: Token): Promise<void>;
}

export const AuthRepository = Symbol("AUTHREPOSITORY");