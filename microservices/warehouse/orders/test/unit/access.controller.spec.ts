import { AccessController } from '../../src/interfaces/access.controller';

describe('AccessController', () => {
  let controller: AccessController;
  const WAREHOUSE_ID = '42';

  beforeAll(() => {
    process.env.WAREHOUSE_ID = WAREHOUSE_ID;
  });

  beforeEach(() => {
    controller = new AccessController();
  });

  it('commandOrder: access granted isGlobal', async () => {
    const data = { token: { isGlobal: true } };
    const result = await controller.commandOrder(data);
    expect(JSON.parse(result)).toEqual({ result: { get: true, call: "*" } });
  });

  it('commandOrder: access granted warehouseAssigned', async () => {
    const data = {
      token: {
        warehouseAssigned: [{ warehouseId: Number(WAREHOUSE_ID) }]
      }
    };
    const result = await controller.commandOrder(data);
    expect(JSON.parse(result)).toEqual({ result: { get: true, call: "*" } });
  });

  it('commandOrder: access denied warehouseAssigned mismatch', async () => {
    const data = {
      token: {
        warehouseAssigned: [{ warehouseId: 999 }]
      }
    };
    const result = await controller.commandOrder(data);
    expect(JSON.parse(result)).toEqual({ result: { get: false } });
  });

  it('commandOrder: access denied no token', async () => {
    const data = {};
    const result = await controller.commandOrder(data);
    expect(JSON.parse(result)).toEqual({ error: { code: 'system.accessDenied', message: 'Operation not allowed.' } });
  });

  it('commandOrder: access denied token error', async () => {
    const data = { token: { error: 'invalid token' } };
    const result = await controller.commandOrder(data);
    expect(JSON.parse(result)).toEqual({ error: { code: 'system.accessDenied', message: 'invalid token' } });
  });

  it('orderAccess: delega a checkAccess', async () => {
    const spy = jest.spyOn(controller as any, 'checkAccess');
    const data = { token: { isGlobal: true } };
    await controller.orderAccess(data);
    expect(spy).toHaveBeenCalledWith(data);
  });

  it('ordersAccess: delega a checkAccess', async () => {
    const spy = jest.spyOn(controller as any, 'checkAccess');
    const data = { token: { isGlobal: true } };
    await controller.ordersAccess(data);
    expect(spy).toHaveBeenCalledWith(data);
  });
});