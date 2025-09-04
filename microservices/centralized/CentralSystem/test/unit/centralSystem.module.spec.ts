import { Test, TestingModule } from '@nestjs/testing';
import { CentralSystemModule } from 'src/application/centralsystem.module';
import { CentralSystemService } from 'src/application/centralsystem.service';
import { centralSystemController } from 'src/interfaces/centralSystemController';
import { InboundPortsAdapter } from 'src/infrastructure/adapters/InboundPortsAdapter';
import { OutboundPortsAdapter } from 'src/infrastructure/adapters/centralSystemEventAdapter';
import { centralSystemHandler } from 'src/interfaces/centralSystem.handler';
import { NatsClientModule } from 'src/interfaces/nats/natsClientModule/natsClient.module';

describe('CentralSystemModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CentralSystemModule],
    }).compile();
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should resolve CentralSystemService', () => {
    const service = module.get<CentralSystemService>(CentralSystemService);
    expect(service).toBeInstanceOf(CentralSystemService);
  });

  it('should resolve centralSystemController', () => {
    const controller = module.get<centralSystemController>(centralSystemController);
    expect(controller).toBeInstanceOf(centralSystemController);
  });

  it('should resolve InboundPortsAdapter', () => {
    const inbound = module.get<InboundPortsAdapter>(InboundPortsAdapter);
    expect(inbound).toBeInstanceOf(InboundPortsAdapter);
  });

  it('should resolve OutboundPortsAdapter', () => {
    const outbound = module.get<OutboundPortsAdapter>(OutboundPortsAdapter);
    expect(outbound).toBeInstanceOf(OutboundPortsAdapter);
  });

  it('should resolve centralSystemHandler', () => {
    const handler = module.get<centralSystemHandler>(centralSystemHandler);
    expect(handler).toBeInstanceOf(centralSystemHandler);
  });
});
