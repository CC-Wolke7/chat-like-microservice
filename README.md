# Chat-Microservice

OpenAPI specification available at `http://localhost:3000/docs/`.

## Installation

```bash
$ npm install
```

## Running the app

To emulate Google Firestore, run:

1. `gcloud beta emulators firestore start --host-port localhost:8080`
2. `export FIRESTORE_EMULATOR_HOST=localhost:8080`.

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
