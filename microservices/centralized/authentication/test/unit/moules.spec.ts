import { Test } from '@nestjs/testing';
import { AuthModule } from '../../src/application/authentication.module';
import { AuthRepositoryModule } from '../../src/interfaces/mongodb/auth.repository.module';
import { NatsClientModule } from '../../src/interfaces/nats/natsClientModule/natsClient.module';

jest.mock('@nestjs/mongoose', () => {
    const actual = jest.requireActual('@nestjs/mongoose');
    return {
        ...actual,
        MongooseModule: {
            forRoot: () => ({}),
            forFeature: () => ({}),
        }
    };
});

// Mock solo ClientsModule e Transport, NON tutto @nestjs/microservices!
jest.mock('@nestjs/microservices', () => {
    const actual = jest.requireActual('@nestjs/microservices');
    return {
        ...actual,
        ClientsModule: {
            register: () => ({}),
        },
        Transport: {},
    };
});

describe('NestJS Modules', () => {
    it('AuthenticationModule should compile', async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AuthModule],
        })
        .overrideProvider('AUTHREPOSITORY').useValue({})
        .overrideProvider('NATS_SERVICE').useValue({})
        .compile();
        expect(moduleRef).toBeDefined();
    });

    it('AuthRepositoryModule should compile', async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AuthRepositoryModule],
        })
        .overrideProvider('AUTHREPOSITORY').useValue({})
        .compile();
        expect(moduleRef).toBeDefined();
    });

    it('NatsClientModule should compile', async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [NatsClientModule],
        })
        .overrideProvider('NATS_SERVICE').useValue({})
        .compile();
        expect(moduleRef).toBeDefined();
    });
});