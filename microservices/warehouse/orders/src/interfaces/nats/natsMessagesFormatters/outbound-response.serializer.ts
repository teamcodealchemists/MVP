import { Serializer, OutgoingResponse } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export class OutboundResponseSerializer implements Serializer {
  serialize(value: any): any {
    // Restituisce l'intero oggetto, non solo la risposta
    // NestJS NATS transport ha bisogno dell'intera struttura (da vedere se/come restituire solo response/err)
    return value;
  }
}
