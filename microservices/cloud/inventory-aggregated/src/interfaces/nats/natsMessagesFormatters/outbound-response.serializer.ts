import { Serializer, OutgoingResponse } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

export class OutboundResponseSerializer implements Serializer {
  private readonly logger = new Logger(OutboundResponseSerializer.name);
  serialize(value: any): OutgoingResponse {
    this.logger.verbose(
      `-->> Serializing outbound response: \n${JSON.stringify(value)}`,
    );

    /**
     * Here, we are merely "unpacking" the response payload from the Nest
     * message structure, and returning it as a "plain" top-level object.
     */
    if (value.response) {
      value = { data: value.response };
    } else if (value.err) {
      // Estrae i messaggi di errore dall'array di errori di validazione.
      const message = Array.isArray(value.err)
        ? value.err
          .flatMap((err) => (err.constraints ? Object.values(err.constraints) : []))
          .join('. ')
        : value.err;

      value = {
        data: JSON.stringify({
          error: {
            code: 'system.invalidParams',
            message: message
          }
        })
      }
    }

    this.logger.verbose(
      `-->> Serialized outbound response: \n${value.data}`,
    );

    return value;
  }
}