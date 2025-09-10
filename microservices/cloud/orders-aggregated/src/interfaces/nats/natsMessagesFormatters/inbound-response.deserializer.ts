import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ConsumerDeserializer } from '@nestjs/microservices';

export class InboundResponseDeserializer
  implements ConsumerDeserializer {
  private readonly logger = new Logger('InboundResponseDeserializer');
  public deserialize(value: any, options?: Record<string, any>) {
    this.logger.verbose(
      `<<-- Deserializing inbound response message:\n${value}
      \nwith options: ${JSON.stringify(options)}`,
    );
    /**
     * Here, we merely wrap our inbound message payload in the standard Nest
     * message structure.
     */
    let data: any;
    try {
      data = JSON.parse(value);
    } catch (error) {
      this.logger.error(`Failed to parse inbound response message: ${error}`);
      data = value;
    }
    this.logger.verbose(
      `<<-- Deserialized inbound response message:\n${JSON.stringify(data)}`,
    );
    return {
      pattern: options?.channel || 'no-subject',
      data,
      id: uuidv4(),
    };
  }
}