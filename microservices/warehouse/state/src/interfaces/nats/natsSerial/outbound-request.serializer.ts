import { Serializer, OutgoingResponse } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export class OutboundResponseSerializer implements Serializer {
  private readonly logger = new Logger('OutboundResponseSerializer');

  serialize(value: any): OutgoingResponse {
    this.logger.verbose(
      `-->> Serializing outbound response: ${JSON.stringify(value)}`,
    );

    return {
      id: uuidv4(),            
      response: value.response ?? value, 
      isDisposed: true,         
    };
  } 

}
