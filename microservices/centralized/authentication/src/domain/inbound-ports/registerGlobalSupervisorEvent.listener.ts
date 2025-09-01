import { UserIdDTO } from 'src/interfaces/dto/userId.dto';
import { UserId } from './../userId.entity';
import { GlobalSupervisorDTO } from "src/interfaces/dto/globalSupervisor.dto";


export interface RegisterGlobalSupervisorEventListener {
    registerGlobalSupervisor(globalSupervisorDTO: GlobalSupervisorDTO): Promise<string>;
}
