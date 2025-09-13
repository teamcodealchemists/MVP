import { Counter } from 'prom-client';

export const loginAttemptsCounter = new Counter({
  name: 'login_attempts_total',
  help: 'Numero totale di tentativi di login per email',
  labelNames: ['email'], // Occhio alla cardinalità!
});
