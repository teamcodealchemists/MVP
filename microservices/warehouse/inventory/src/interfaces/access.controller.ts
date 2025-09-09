import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

const logger = new Logger('AccessControlController');

@Controller()
export class AccessController {
    constructor() { }

    @MessagePattern(`access.warehouse.${process.env.WAREHOUSE_ID}.stock.*`)
    async callAccess(@Payload() data: any): Promise<string> {
        return this.checkAccess(data);
    }
    

    @MessagePattern(`access.warehouse.${process.env.WAREHOUSE_ID}.stock.*`)
    async commandAccess(@Payload() data: any): Promise<string> {
        return this.checkAccess(data);
    }

    @MessagePattern(`access.warehouse.${process.env.WAREHOUSE_ID}.inventory`)
    async invAccess(@Payload() data: any): Promise<string> {
        return this.checkAccess(data);
    }

    private checkAccess(data: any): Promise<string> {
        if (data.token && !data.token.error) {
            logger.debug(`Access check for operation: ${JSON.stringify(data.token)}`);
            if (data.token.isGlobal) {
                return Promise.resolve(JSON.stringify({ result: { get: true, call: "*" } }));
            }
            else if (
                Array.isArray(data.token.warehouseAssigned) &&
                data.token.warehouseAssigned.some(
                    (w: { warehouseId: number }) => w.warehouseId === Number(process.env.WAREHOUSE_ID)
                )
            ) {
                // Access granted only if the user is assigned to the current warehouse
                return Promise.resolve(JSON.stringify({ result: { get: true, call: "*" } }));
            }
            else {
                return Promise.resolve(JSON.stringify({ result: { get: false } }));
            }
        }
        else {
            const errorMsg = data.token?.error || 'Operation not allowed.';
            return Promise.resolve(JSON.stringify({ error: { code: 'system.accessDenied', message: errorMsg } }));
        }
    }
}


