import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ConsumerDeserializer, IncomingRequest } from '@nestjs/microservices';

export class InboundRequestDeserializer implements ConsumerDeserializer {
  private readonly logger = new Logger('InboundRequestDeserializer');

  deserialize(value: any, options?: Record<string, any>): IncomingRequest {
    this.logger.verbose(`<<-- Raw value:`, value);
    this.logger.verbose(`<<-- Options: ${JSON.stringify(options)}`);

    let data: any = value;
    
    // ✅ CONVERTI BUFFER IN STRINGA SOLO SE NON È VUOTO
    if (Buffer.isBuffer(value) && value.length > 0) {
      data = value.toString('utf8');
      this.logger.verbose(`🔧 Buffer converted: "${data}"`);
    } else if (Buffer.isBuffer(value) && value.length === 0) {
      // ✅ SE IL BUFFER È VUOTO, IMPOSTA undefined
      data = undefined;
      this.logger.verbose('🔧 Empty buffer, setting undefined');
    }

    // ✅ PARSING JSON SOLO SE C'È QUALCOSA
    try {
      if (typeof data === 'string' && data.trim() !== '') {
        data = JSON.parse(data);
        this.logger.verbose(`🔧 JSON parsed: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.logger.verbose('ℹ️ Keeping as non-JSON value');
    }

    return {
      pattern: options?.channel,
      data: data,  // ✅ SARÀ undefined PER PAYLOAD VUOTI
      id: uuidv4(),
    };
  }
}