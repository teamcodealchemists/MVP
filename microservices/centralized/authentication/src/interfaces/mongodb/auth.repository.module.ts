import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthRepositoryMongo } from './auth.repository.impl';
import { AuthenticationSchema } from "src/infrastructure/adapters/mongdb/schemas/auth.schema";
import { AuthenticationModel } from "src/infrastructure/adapters/mongdb/models/auth.model";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Authentication', schema: AuthenticationSchema }]),
        MongooseModule.forRoot('mongodb://host.docker.internal:27017/authentication')
        
    ],
    providers: [
        {
            provide: 'AUTHREPOSITORY',
            useClass: AuthRepositoryMongo,
        },
    ],
    exports: [
        'AUTHREPOSITORY',
        MongooseModule, 
    ],
})
export class AuthRepositoryModule {}