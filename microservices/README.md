# MVP: Sistema di Gestione di un Magazzino Distribuito

## Guida per i Programmatori

### Info

- **Ambiente Docker:** `node:22-alpine`
- **Node:** `v22.16.0`

### Guida

- **Se non l'avete già fatto:** ```npm install -g @nestjs/cli```
- nest new nome_del_microservizio --skip-git
  - Da fare all'interno di una cartella dei microservices/
- Aggiungere su docker compose:
    ```yaml
    nome_del_microservizio:
        container_name: nome_del_microservizio
        build:
            context: ./microservices/area_del_microservizio/nome_del_microservizio
            dockerfile: Dockerfile
        environment:
            - MONGO_DB=mongodb://mongo:27017/authentication
        volumes:
            - ./microservices/area_del_microservizio/nome_del_microservizio/src:/usr/src/app/src
        networks:
            - shared-warehouses
        depends_on:
            - nats
            - mongodb
            - resgate
     ```
  - Potrebbero esserci variazioni in base al tipo di Microservizio che create
- Aggiungere il Dockerfile e il .dockerignore all'interno della cartella del nome_del_microservizio
  - Basta copiarli da altri microservizi, sono sempre uguali, nel caso di modifiche meglio aggiornarli tutti in tutti i servizi.
- Aggiungere al file `tsconfig.json`, questa sezione alla fine:
  ```json
  ...
  ,
  "watchOptions": {
    // Use a dynamic polling instead of system’s native events for file changes.
    "watchFile": "priorityPollingInterval",
    "watchDirectory": "dynamicPriorityPolling",
    "fallbackPolling": "dynamicPriority",
    "synchronousWatchDirectory": true,
    "excludeDirectories": [
      "**/node_modules",
      "dist"
    ]
  }

  ...
  ```
  - Questo serve per abilitare il live reload durante lo sviluppo.
- Eseguire i seguenti comandi nel microservizio in base ad i moduli che si andranno ad usare, fare riferimento alla [documentazione ufficiale di NestJS](https://docs.nestjs.com/):
  - ```npm i --save class-validator class-transformer```
  - ```npm i --save @nestjs/microservices```
  - ```npm i --save nats```
  - ```npm install --save mongoose```
  - Se ci sono altri comandi o moduli da recuperare controllare la documentazione di NestJS
- Ora si modifica il main.ts della vostra cartella srv per trasformarlo in un microservizio che funziona con nestjs, quindi:
    ```ts
        import { nome_del_microservizioModule } from './application/inventory.module'; //Modulo Principale
        import { NestFactory } from '@nestjs/core'; //Factory per creare il servizio nest
        import { MicroserviceOptions, Transport } from '@nestjs/microservices'; //Opzioni
        import { Logger } from '@nestjs/common'; //Per fare logging del microservizio

        //Importanti da copiare in seguito, permettono il formatting dei messaggi in entrata ed uscita a nats
        import { OutboundResponseSerializer } from './interfaces/nats/natsMessagesFormatters/outbound-response.serializer';
        import { InboundRequestDeserializer } from './interfaces/nats/natsMessagesFormatters/inbound-response.deserializer';

        const logger = new Logger();

        async function bootstrap() {
        const app = await NestFactory.createMicroservice<MicroserviceOptions>(NomeModule, { //RICORDA DI CAMBIARE I NOMI DEI MODULI
            logger: logger,
            transport: Transport.NATS,
            options: {
            servers: ['nats://nats:4222'], // Indirizzo del container NATS
            deserializer: new InboundRequestDeserializer(),
            serializer: new OutboundResponseSerializer(),
            },
        });
        app.useGlobalPipes(new ValidationPipe({ exceptionFactory: (errors) => new RpcException(errors) }));
        await app.listen();
        }

        bootstrap();

    ```
- Per quanto riguarda i Serializer/Deserializer fai riferimento alla Branch di Microservizio di Auth e copiali pure da lì in quanto sono i più aggiornati e stabili (Forse lol)
- Ora puoi procedere con la programmazione
```
     _._     _,-'""`-._
    (,-.`._,'(       |\`-/|
         `-.-' \ )-`( , o o)
             `-    \`_`"'-   
                    
                                        ____()()
                                       /      @@
                                 `~~~~~\_;m__m._>o    

```

---