import { NestFactory } from '@nestjs/core';
import { InventoryModule } from '../../src/application/inventory.module';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    createMicroservice: jest.fn(),
  },
}));

describe('main.ts bootstrap', () => {
  it('should call NestFactory.createMicroservice with InventoryModule and NATS options', async () => {
    const useGlobalPipesMock = jest.fn();
    const listenMock = jest.fn().mockResolvedValue(undefined);

    (NestFactory.createMicroservice as jest.Mock).mockResolvedValue({
      useGlobalPipes: useGlobalPipesMock,
      listen: listenMock,
    });

    const mainModule = await import('../../src/main');
    await mainModule.bootstrap();

    expect(NestFactory.createMicroservice).toHaveBeenCalledWith(
      InventoryModule,
      expect.objectContaining({
        transport: Transport.NATS,
        options: expect.objectContaining({
          servers: expect.arrayContaining([expect.any(String)]),
          deserializer: expect.any(Object),
          serializer: expect.any(Object),
        }),
        logger: expect.any(Logger),
      })
    );

    expect(useGlobalPipesMock).toHaveBeenCalled();
    expect(listenMock).toHaveBeenCalled();
  });
});
