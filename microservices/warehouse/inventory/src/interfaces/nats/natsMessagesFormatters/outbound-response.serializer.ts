/*import { Serializer, OutgoingResponse } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

export class OutboundResponseSerializer implements Serializer {
  private readonly logger = new Logger('OutboundResponseSerializer');

 /* serialize(value: any): OutgoingResponse {
    this.logger.verbose(
      `-->> Serializing outbound response:\n${JSON.stringify(value)}`,
    );

    
    if (value && value.response !== undefined) {
      return { data: JSON.stringify(value.response) };
    }

    // Altrimenti serializza tutto il valore
    return { data: JSON.stringify(value) };
  }
}*/
