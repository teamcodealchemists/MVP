import { CloudHeartbeatDTO } from './../../../src/interfaces/dto/cloudHeartbeat.dto';

export interface HeartbeatReceivedEvent {
    syncReceivedHeartbeat(heartbeat: CloudHeartbeatDTO): Promise<string>;
}