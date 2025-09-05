import { Test, TestingModule } from '@nestjs/testing';
import { AccessController } from '../../src/interfaces/access.controller';

describe('AccessController', () => {
  let controller: AccessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccessController],
    }).compile();

    controller = module.get<AccessController>(AccessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should respond to loginAccess with JSON result', async () => {
    const payload = { username: 'user', password: 'pass' };
    const result = await controller.loginAccess(payload);
    
    expect(typeof result).toBe('string');

    const parsed = JSON.parse(result);
    expect(parsed).toEqual({ result: { get: true, call: '*' } });
  });
});
