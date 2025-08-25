import { UserId } from './userId.entity'
import { Authentication } from './authentication.entity';
import { Role } from './role.entity';

export abstract class User {
    private readonly id: UserId;
    private readonly name: String;
    private readonly surname: String;
    private readonly phone: String;
    private authentication: Authentication;
    private readonly role: Role;

    constructor(
        id: UserId,
        name: String,
        surname: String,
        phone: String,
        authentication: Authentication,
        role: Role
    ) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.phone = phone;
        this.authentication = authentication;
        this.role = role;
    }

    getId(): UserId {
        return this.id;
    }

    getName(): String {
        return this.name;
    }

    getSurname(): String {
        return this.surname;
    }

    getPhone(): String {
        return this.phone;
    }

    getAuthentication(): Authentication {
        return this.authentication;
    }

    getRole(): Role {
        return this.role;
    }
}