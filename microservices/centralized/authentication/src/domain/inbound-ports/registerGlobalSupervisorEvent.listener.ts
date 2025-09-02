import { GlobalSupervisorDTO } from "src/interfaces/dto/globalSupervisor.dto";


export interface RegisterGlobalSupervisorEventListener {
    registerGlobalSupervisor(globalSupervisorDTO: GlobalSupervisorDTO): Promise<string>;
}
