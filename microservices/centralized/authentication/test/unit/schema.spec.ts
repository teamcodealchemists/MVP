import { AuthenticationSchema } from '../../src/infrastructure/adapters/mongodb/schemas/auth.schema';
import { TokenListSchemaFactory } from '../../src/infrastructure/adapters/mongodb/schemas/tokenList.schema';

describe('Mongoose Schemas', () => {
    it('AuthenticationSchema should be defined', () => {
        expect(AuthenticationSchema).toBeDefined();
    });

    it('AuthenticationSchema should have expected fields', () => {
        const fields = Object.keys(AuthenticationSchema.obj);
        expect(fields).toEqual(expect.arrayContaining(['name', 'surname', 'phone', 'email', 'password', 'isGlobal', 'warehouseAssigned']));
    });

    it('tokenListSchema should be defined', () => {
        expect(TokenListSchemaFactory).toBeDefined();
    });

    it('tokenListSchema should have expected fields', () => {
        const fields = Object.keys(TokenListSchemaFactory.obj);
        expect(fields).toEqual(expect.arrayContaining(['sub', 'status']));
    });
});