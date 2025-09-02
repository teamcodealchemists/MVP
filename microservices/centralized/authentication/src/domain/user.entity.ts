import { Authentication } from './authentication.entity';
import { Role } from './role.entity';

export abstract class User {
    private readonly name: string;
    private readonly surname: string;
    private readonly phone: string;
    private authentication: Authentication;
    private readonly role: Role;

    constructor(
        name: string,
        surname: string,
        phone: string,
        authentication: Authentication,
        role: Role
    ) {
        this.name = name;
        this.surname = surname;
        this.phone = phone;
        this.authentication = authentication;
        this.role = role;
    }

    getName(): string {
        return this.name;
    }

    getSurname(): string {
        return this.surname;
    }

    getPhone(): string {
        return this.phone;
    }

    getAuthentication(): Authentication {
        return this.authentication;
    }

    getRole(): Role {
        return this.role;
    }
}