# MVP – Sistema di Gestione di un Magazzino Distribuito

![Coverage](https://codecov.io/gh/teamcodealchemists/MVP/branch/main/graph/badge.svg)

## Descrizione

Questo progetto rappresenta un **MVP (Minimum Viable Product)** per la gestione di un sistema di magazzini distribuiti, pensato per supportare scenari di logistica avanzata, orchestrazione di ordini, gestione delle scorte e monitoraggio centralizzato tramite microservizi.

L’architettura si basa su **microservizi** sviluppati con [NestJS](https://nestjs.com/), con comunicazione tramite API REST e messaggistica, e include strumenti di monitoraggio come **Prometheus** e **Grafana**.

---

## Struttura del Progetto

```
microservices/
│
├── centralized/           # Servizi centrali (autenticazione, sistema centrale, routing, aggregazione stato)
│
├── cloud/                 # Aggregatori cloud (ordini, inventario)
│
├── warehouse/             # Microservizi warehouse (ordini, inventario, stato)
│
├── grafana/               # Dashboard di monitoraggio
│
└── prometheus/            # Configurazione Prometheus
```

### Microservizi Principali

- **Centralized**
  - `authentication`: Gestione autenticazione e autorizzazione utenti
  - `CentralSystem`: Coordinamento centrale e orchestrazione
  - `routing`: Gestione del routing degli ordini e delle spedizioni
  - `state_aggregate`: Aggregazione e monitoraggio dello stato globale

- **Cloud**
  - `orders-aggregated`: Aggregazione e sincronizzazione ordini tra magazzini
  - `inventory-aggregated`: Aggregazione e sincronizzazione inventario

- **Warehouse**
  - `orders`: Gestione ordini locale
  - `inventory`: Gestione inventario locale
  - `state`: Stato e metriche del magazzino
  - `mongodb`: Database NoSQL per la persistenza locale

- **Monitoring**
  - `grafana`: Dashboard per visualizzazione metriche
  - `prometheus`: Raccolta e scraping metriche

---

## Come Avviare il Progetto

> **Prerequisiti:**  
> - [Docker](https://www.docker.com/) (per database, microservizi e monitoring)

### 1. Clona il repository

```bash
git clone https://github.com/teamcodealchemists/MVP.git
cd MVP/microservices
```

### 2. Avvia tutti i servizi con Docker Compose

```bash
docker-compose up --build
```

Tutti i microservizi, database e strumenti di monitoring verranno avviati automaticamente.

---

## Testing

Per eseguire i test unitari di un microservizio, posizionati nella sua cartella e lancia:

```bash
npm run test
```

La copertura del codice è monitorata tramite Codecov.

---

## Dashboard & Monitoring

- **Prometheus**: [localhost:9090](http://localhost:9090)
- **Grafana**: [localhost:3210](http://localhost:3210)  
  (login di default: `admin` / `admin`)

---

## Autori

Team Code Alchemists  
[https://github.com/teamcodealchemists](https://github.com/teamcodealchemists)

