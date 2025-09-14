import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const loginAttemptsCounterProvider = makeCounterProvider({
  name: 'login_attempts_total',
  help: 'Numero di tentativi di login falliti'
});
