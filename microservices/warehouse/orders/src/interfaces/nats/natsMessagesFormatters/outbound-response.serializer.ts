import { Serializer, OutgoingResponse } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export class OutboundResponseSerializer implements Serializer {
  serialize(value: any): any {
    console.log('🔍🎯 SERIALIZER Input:', value);

    // ✅ RESTITUISCI L'OGGETTO COMPLETO, NON SOLO LA RISPOSTA
    // NestJS NATS transport ha bisogno dell'intera struttura
    console.log('🎯✅ RETURNING FULL STRUCTURE:', value);
    return value;
  }
}
