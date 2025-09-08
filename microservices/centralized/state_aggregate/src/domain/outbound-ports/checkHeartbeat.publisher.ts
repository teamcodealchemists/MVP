import {CloudHeartbeat} from '../cloudHeartbeat.entity';

export interface CheckHeartbeatPublisher {
    publishHeartbeat(heartbeat: CloudHeartbeat): void;
}