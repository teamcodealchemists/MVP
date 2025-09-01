// DTO Imports
import { GlobalSupervisorDTO } from 'src/interfaces/dto/globalSupervisor.dto';
import { LocalSupervisorDTO } from 'src/interfaces/dto/localSupervisor.dto';
import { WarehouseIdDTO } from 'src/interfaces/dto/warehouseId.dto';
import { AuthenticationDTO } from 'src/interfaces/dto/authentication.dto';
import { UserIdDTO } from 'src/interfaces/dto/userId.dto';

//Domain Imports
import { GlobalSupervisor } from 'src/domain/globalSupervisor.entity';
import { Authentication } from 'src/domain/authentication.entity';
import { LocalSupervisor } from 'src/domain/localSupervisior.entity';
import { WarehouseId } from 'src/domain/warehouseId.entity';
import { UserId } from 'src/domain/userId.entity';
import { Role } from 'src/domain/role.entity';

export const DataMapper = {
    globalSupervisorToDomain(GlobalSupervisorDTO: GlobalSupervisorDTO) : GlobalSupervisor {
        return new GlobalSupervisor(
            GlobalSupervisorDTO.name,
            GlobalSupervisorDTO.surname,
            GlobalSupervisorDTO.phone,
            new Authentication(
                GlobalSupervisorDTO.authentication.email,
                GlobalSupervisorDTO.authentication.password
            ),
            Role.GLOBAL
        );
    },

    LocalSupervisorToDomain(LocalSupervisorDTO: LocalSupervisorDTO) : LocalSupervisor {
        return new LocalSupervisor(
            LocalSupervisorDTO.name,
            LocalSupervisorDTO.surname,
            LocalSupervisorDTO.phone,
            new Authentication(
                LocalSupervisorDTO.authentication.email,
                LocalSupervisorDTO.authentication.password
            ),
            LocalSupervisorDTO.role,
            LocalSupervisorDTO.warehouseAssigned.map(
                (warehouseDTO) => new WarehouseId(warehouseDTO.warehouseId)
            )
        );
    },

    warehouseToDomain(WarehouseIdDTO: WarehouseIdDTO) : WarehouseId {
        return new WarehouseId(
            WarehouseIdDTO.warehouseId
        );
    },

    authenticationToDomain(AuthenticationDTO: AuthenticationDTO) : Authentication {
        return new Authentication(
            AuthenticationDTO.email,
            AuthenticationDTO.password
        );
    },

    globalSupervisorToDTO(globalSupervisor: GlobalSupervisor) : GlobalSupervisorDTO {
        return {
            name: globalSupervisor.getName().toString(),
            surname: globalSupervisor.getSurname().toString(),
            phone: globalSupervisor.getPhone().toString(),
            authentication: {
                email: globalSupervisor.getAuthentication().getEmail().toString(),
                password: globalSupervisor.getAuthentication().getPassword().toString()
            }
        };
    },

    localSupervisorToDTO(localSupervisor: LocalSupervisor) : LocalSupervisorDTO {
        return {
            name: localSupervisor.getName().toString(),
            surname: localSupervisor.getSurname().toString(),
            phone: localSupervisor.getPhone().toString(),
            authentication: {
                email: localSupervisor.getAuthentication().getEmail().toString(),
                password: localSupervisor.getAuthentication().getPassword().toString()
            },
            role: localSupervisor.getRole(),
            warehouseAssigned: localSupervisor.getWarehouseAssigned().map(warehouse => ({
                warehouseId: warehouse.getId()
            }))
        };
    },

    warehouseIdToDTO(warehouse: WarehouseId) : WarehouseIdDTO {
        return {
            warehouseId: warehouse.getId()
        };
    },

    authenticationToDTO(authentication: Authentication) : AuthenticationDTO {
        return {
            email: authentication.getEmail(),
            password: authentication.getPassword()
        };
    },

    userIdToDTO(userId: UserId) : UserIdDTO {
        return {
            userId: userId.getId()
        };
    }

}