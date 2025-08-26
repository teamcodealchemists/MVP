import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('auth')
export class JwtController {
    constructor() {}

    @MessagePattern('jwtHeader')
    async getJwtFromHeader(@Payload() data: { headers: Headers }): Promise<string | null> {
        const authHeader = data.headers['authorization'];
        if (!authHeader) return null;

        const token = authHeader.split(' ')[1];
        return token || null;
    }
}