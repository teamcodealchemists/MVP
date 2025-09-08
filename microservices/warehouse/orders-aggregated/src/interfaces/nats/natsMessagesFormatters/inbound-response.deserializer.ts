import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ConsumerDeserializer, IncomingRequest } from '@nestjs/microservices';

export class InboundRequestDeserializer implements ConsumerDeserializer {
  private readonly logger = new Logger('InboundRequestDeserializer');

  deserialize(value: any, options?: Record<string, any>): IncomingRequest {
    this.logger.verbose(`<<-- Payload:`, value);

    let data: any = value;
    
    // Gestione buffer (aka payload) vuoto (come "")
    if (Buffer.isBuffer(value) && value.length === 0) {
      data = undefined;
      this.logger.verbose('Payload vuoto, impostato a "undefined"');
    }
    // Gestione buffer (aka payload) con contenuto
    else if (Buffer.isBuffer(value)) {
      data = value.toString('utf8');
      this.logger.verbose(`Payload convertito: "${data}"`);
      
      // Parsa JSON solo se non è una stringa vuota
      try {
        if (data.trim() !== '') {
          data = JSON.parse(data);
          this.logger.verbose(`JSON parsato: ${JSON.stringify(data)}`);
        }
      } catch (error) {
        // Se non è JSON valido, mantieni come stringa
        this.logger.verbose('Mantengo il valore come stringa non-JSON');
      }
    }

    return {
      pattern: options?.channel,
      data: data,
      id: uuidv4(),
    };
  }
}