import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ConsumerDeserializer } from '@nestjs/microservices';

export class InboundRequestDeserializer implements ConsumerDeserializer {
  private readonly logger = new Logger('InboundRequestDeserializer');

  deserialize(value: any, options?: Record<string, any>) {
    this.logger.verbose(
      `<<-- deserializing inbound request message:\n${value}
      \n\twith options: ${JSON.stringify(options)}`,
    );

    let data: any;

    // Se è Buffer, prova a fare il parse JSON
    if (Buffer.isBuffer(value)) {
  const str = value.toString().trim(); // rimuove spazi e ritorni a capo
  try {
    data = JSON.parse(str);
  } catch {
    data = str;
  }
} else if (typeof value === 'string') {
  try {
    data = JSON.parse(value.trim());
  } catch {
    data = value.trim();
  }
} else {
  data = value;
}

    return {
      pattern: undefined,
      data,
      id: uuidv4(),
    };
  }
}
