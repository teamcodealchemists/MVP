import { Controller, Post } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';


@Controller()
export class AccessController{
    @MessagePattern('access.routing.>')
    access(){
        // Implement your access logic here
        return JSON.stringify({ result: {get: true, call: '*'}})
    }
}
