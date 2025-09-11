import { NestFactory } from '@nestjs/core';
import { CentralSystemModule } from '../../src/application/centralsystem.module';
import { bootstrap } from '../../src/main';
import { ValidationPipe, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InboundResponseDeserializer } from '../../src/interfaces/nats/natsMessagesFormatters/inbound-response.deserializer';
import { OutboundResponseSerializer } from '../../src/interfaces/nats/natsMessagesFormatters/outbound-response.serializer';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    createMicroservice: jest.fn().mockResolvedValue({
      useGlobalPipes: jest.fn(),
      listen: jest.fn(),
    }),
  },
}));

describe('Bootstrap unit test', () => {
  let mockApp: any;

  beforeEach(() => {
    mockApp = {
      useGlobalPipes: jest.fn(),
      listen: jest.fn(),
    };
    (NestFactory.createMicroservice as jest.Mock).mockResolvedValue(mockApp);
  });

  it('should create the microservice with correct options and apply ValidationPipe', async () => {
    await bootstrap();

    expect(NestFactory.createMicroservice).toHaveBeenCalledWith(
      CentralSystemModule,
      expect.objectContaining({
        transport: expect.anything(),
        options: expect.objectContaining({
          servers: ['nats://nats:4222'],
          deserializer: expect.any(InboundResponseDeserializer),
          serializer: expect.any(OutboundResponseSerializer),
        }),
        logger: expect.any(Logger),
      }),
    );

    expect(mockApp.useGlobalPipes).toHaveBeenCalled();
    const pipeInstance = mockApp.useGlobalPipes.mock.calls[0][0];
    expect(pipeInstance).toBeInstanceOf(ValidationPipe);
    expect(typeof pipeInstance.exceptionFactory).toBe('function');

    expect(mockApp.listen).toHaveBeenCalled();
  });

  it('should use RpcException in ValidationPipe exceptionFactory', async () => {
    await bootstrap();

    const pipe = mockApp.useGlobalPipes.mock.calls[0][0];
    const validationErrors = [{ property: 'test', constraints: { required: 'required' } }];
    const result = pipe.exceptionFactory(validationErrors);

    expect(result).toBeInstanceOf(RpcException);
    expect(result.getError()).toBe(validationErrors);
  });
});
