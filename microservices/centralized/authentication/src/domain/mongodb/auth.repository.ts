import { Authentication } from "../authentication.entity";
import { GlobalSupervisor } from "../globalSupervisor.entity";
import { User } from "../user.entity";

export interface AuthRepository {
    findByEmail(email: string): Promise<User | null>;
    getIdByEmail(email: string): Promise<string | null>;
    newProfile(auth: User): Promise<string>;
    deleteById(id: string): Promise<void>;
    getGlobalSupervisor(): Promise<GlobalSupervisor | null>;
    getAllProfiles(): Promise<User[]>;
}

export const AuthRepository = Symbol("AUTHREPOSITORY");