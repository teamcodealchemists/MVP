import { LocalSupervisor } from "../localSupervisior.entity";

export interface RegisteredLocalSupervisorEventPublisher {
    publishRegisteredLocalSupervisor(localSupervisor: LocalSupervisor): void;
}