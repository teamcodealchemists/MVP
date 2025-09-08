import { StateSchema, StateSchemaFactory } from '../../src/infrastructure/adapters/mongodb/schemas/state.schema';
import { expect } from '@jest/globals';
import { model } from 'mongoose';

describe('StateSchema', () => {
  const StateModel = model('State', StateSchemaFactory);

  it('dovrebbe creare un documento con tutte le proprietà', () => {
    const doc = new StateModel({
      warehouseId: 1,
      state: 'active',
      lastHeartbeat: new Date(),
      lastHeartbeatMsg: 'OK',
    });

    expect(doc).toHaveProperty('warehouseId', 1);
    expect(doc).toHaveProperty('state', 'active');
    expect(doc).toHaveProperty('lastHeartbeat');
    expect(doc).toHaveProperty('lastHeartbeatMsg', 'OK');
  });
});