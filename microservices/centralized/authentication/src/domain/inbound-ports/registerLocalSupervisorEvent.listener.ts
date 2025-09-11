import { LocalSupervisorDTO } from "src/interfaces/dto/localSupervisor.dto";

export interface RegisterLocalSupervisorEventListener {
    registerLocalSupervisor(localSupervisorDTO: LocalSupervisorDTO): Promise<string>;
}