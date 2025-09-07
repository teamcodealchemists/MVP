# Test API - MVP

Questa pagina documenta i test automatici delle API tramite Postman e Newman.


## Tabella Comandi Test Newman

| Nome Test                                      | Comando Newman                                      | Collection ID |
|------------------------------------------------|-----------------------------------------------------|--------------|
| TdA01 - Registrazione Supervisore Globale      | `newman run TdA-01.postman_collection.json`         |    46314414-5b9d7b5f-f2fc-4218-8553-b768cfd5fb6e          |
| TdA02 - Errori Registrazione Supervisore Globale| `newman run TdA-02.postman_collection.json`         |              |
| TdA03 - Autenticazione Utente                  | `newman run TdA-03.postman_collection.json`         |              |
| TdA04 - Errori Login Utente                    | `newman run TdA-04.postman_collection.json`         |              |
| TdA05 - Logout Utente                          | `newman run TdA-05.postman_collection.json`         |              |
| TdA06 - Registrazione Supervisore Locale       | `newman run TdA-06.postman_collection.json`         |              |
| TdA07 - Errori Registrazione Supervisore Locale| `newman run TdA-07.postman_collection.json`         |              |
| TdA08 - Assegnazione Magazzini                 | `newman run TdA-08.postman_collection.json`         |              |
| TdA09 - Aggiunta Magazzino                     | `newman run TdA-09.postman_collection.json`         |              |
| TdA10 - Modifica Magazzino                     | `newman run TdA-10.postman_collection.json`         |              |
| TdA11 - Inserimento Merce                      | `newman run TdA-11.postman_collection.json`         |              |
| TdA12 - Modifica Quantità Merce                | `newman run TdA-12.postman_collection.json`         |              |
| TdA13 - Rimozione Merce                        | `newman run TdA-13.postman_collection.json`         |              |
| TdA14 - Inserimento Ordine Interno             | `newman run TdA-14.postman_collection.json`         |              |
| TdA15 - Inserimento Ordine Esterno             | `newman run TdA-15.postman_collection.json`         |              |
| TdA16 - Annullamento Ordini                    | `newman run TdA-16.postman_collection.json`         |              |
| TdA17 - Gestione Stati Ordini                  | `newman run TdA-17.postman_collection.json`         |              |
| TdA18 - Visualizzazione Inventario             | `newman run TdA-18.postman_collection.json`         |              |
| TdA19 - Visualizzazione Report Ordini          | `newman run TdA-19.postman_collection.json`         |              |
| TdA20 - Modifica Soglie Critiche               | `newman run TdA-20.postman_collection.json`         |              |
| TdA21 - Gestione Magazzini Offline/Online      | `newman run TdA-21.postman_collection.json`         |              |
| TdA22 - Riassortimento Automatico Ordine       | `newman run TdA-22.postman_collection.json`         |              |
| TdA23 - Riassortimento Soglia Minima           | `newman run TdA-23.postman_collection.json`         |              |
| TdA24 - Riassortimento Soglia Massima          | `newman run TdA-24.postman_collection.json`         |              |
| TdA25 - Gestione Conflitti Ordini Simultanei   | `newman run TdA-25.postman_collection.json`         |              |


## Guida all'Esecuzione dei Test

Segui questi passaggi per eseguire i test di accettazione in modo sicuro e ripetibile:

### 1. Clonare la repository

Apri il terminale e spostati nella cartella di lavoro desiderata:

```
cd ~/workspace
```

Clona la repository (sostituisci `<URL-della-repository>` con l'indirizzo reale):

```
git clone <URL-della-repository>
```

Entra nella cartella del progetto (sostituisci `<nome-cartella-repository>`):

```
cd <nome-cartella-repository>
```

---

### 2. Avviare Docker Compose

Avvia tutti i servizi necessari:

```
docker compose up --build -d
```

Verifica che i container siano attivi:

```
docker ps
```

---

### 3. Resettare l’ambiente ad ogni test

Per ripartire da zero e resettare i volumi:

```
docker compose down
docker compose up --build -d
```

Questo comando ferma i container, rimuove i volumi e ricrea l’ambiente da zero.

---

### 4. Eseguire i test con Newman

**Non usare Postman per le run automatiche (richiede account a pagamento).**

Installa Newman (solo la prima volta):

```
npm install -g newman
```

Spostati nella cartella dove sono presenti i file dei test di accettazione.

Per eseguire i test localmente sui file json tramite Newman, usa il seguente comando (sostituisci il nome del file):

```
newman run <nome_file>
```

Oppure sulle collezioni del workspace (sostituisci il collection-id):

```
newman run https://www.postman.com/collections/<collection-id>
```

Si può anche usare l'opzione `--verbose` per ottenere più informazioni sul ritorno delle richieste.

---

### 5. Verificare i risultati

Controlla l'output di Newman per verificare il superamento o il fallimento dei test.

---

### 6. Riavviare Docker Compose dopo ogni test

**Importante:** Dopo ogni test, riavvia Docker Compose per garantire un ambiente pulito:

```
docker compose down
docker compose up --build -d
```

## Risorse Utili

- [Documentazione Newman](https://www.npmjs.com/package/newman)


## Script Commands per Sviluppo

Template: newman run https://www.postman.com/collections/

- **TdA-01:**  ``newman run https://www.postman.com/collections/46314414-5b9d7b5f-f2fc-4218-8553-b768cfd5fb6e``
- **TdA-02:**  ``newman run https://www.postman.com/collections/46314414-9f74ea49-1a0a-4352-b295-41e41bef69e9``
- **TdA-03:**  ``newman run https://www.postman.com/collections/46314414-7f79b291-6fac-490d-8361-5779e0428d17``
- **TdA-04:**  ``newman run https://www.postman.com/collections/46314414-b3078c6e-ecdc-4542-bc4e-c4fde61f06f7``
- **TdA-05:**  ``newman run https://www.postman.com/collections/46314414-97d57106-2823-42a4-a2e9-1fd2ea80b8f8``
- **TdA-06:**  ``newman run https://www.postman.com/collections/46314414-720032e1-b087-437a-a233-719820a0c2e5``
- **TdA-07:**  ``newman run https://www.postman.com/collections/46314414-e17c10a6-7cd6-4f7f-975b-a1902da699a1``
- **TdA-08:**  ``newman run https://www.postman.com/collections/``
- **TdA-09:**  ``newman run https://www.postman.com/collections/``
- **TdA-10:**  ``newman run https://www.postman.com/collections/``
- **TdA-11:**  ``newman run https://www.postman.com/collections/``
- **TdA-12:**  ``newman run https://www.postman.com/collections/``
- **TdA-13:**  ``newman run https://www.postman.com/collections/``
- **TdA-14:**  ``newman run https://www.postman.com/collections/``
- **TdA-15:**  ``newman run https://www.postman.com/collections/``
- **TdA-16:**  ``newman run https://www.postman.com/collections/``
- **TdA-17:**  ``newman run https://www.postman.com/collections/``
- **TdA-18:**  ``newman run https://www.postman.com/collections/``
- **TdA-19:**  ``newman run https://www.postman.com/collections/``
- **TdA-20:**  ``newman run https://www.postman.com/collections/``
- **TdA-21:**  ``newman run https://www.postman.com/collections/``
- **TdA-22:**  ``newman run https://www.postman.com/collections/``
- **TdA-23:**  ``newman run https://www.postman.com/collections/``
- **TdA-24:**  ``newman run https://www.postman.com/collections/``
- **TdA-25:**  ``newman run https://www.postman.com/collections/``