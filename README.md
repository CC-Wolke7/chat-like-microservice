# Chat & Like Microservices

[![Node.js CI](https://github.com/cc-wolke7/chat-like-microservice/workflows/Node.js%20CI/badge.svg)](https://github.com/CC-Wolke7/chat-like-microservice/actions?query=workflow%3A%22Node.js+CI%22)
[![Chat API Deployment](https://github.com/cc-wolke7/chat-like-microservice/workflows/Chat%20API%20Deployment/badge.svg)](https://github.com/CC-Wolke7/chat-like-microservice/actions?query=workflow%3A%22Chat+API+Deployment%22)
[![Like API Deployment](https://github.com/cc-wolke7/chat-like-microservice/workflows/Like%20API%20Deployment/badge.svg)](https://github.com/CC-Wolke7/chat-like-microservice/actions?query=workflow%3A%22Like+API+Deployment%22)

## Development

### Docker

Development can be done in Docker without any external dependencies using [docker-compose](https://docs.docker.com/compose/reference/overview/).

For the first time running, you can bootstrap the local development environment with `bin/bootstrap.sh`.

After that, you can manage the environment with standard [docker-compose](https://docs.docker.com/compose/reference/overview/) commands. A few of the more common commands are listed below.

| Action                | Command                                   |
| --------------------- | ----------------------------------------- |
| Bootstrap environment | `$ bin/bootstrap.sh`                      |
| Start environment     | `$ docker-compose start`                  |
| Stop environment      | `$ docker-compose stop`                   |
| Attach to logs        | `$ docker-compose logs -f`                |
| Run unit tests        | `$ docker-compose exec api yarn test`     |
| Run E2E tests         | `$ docker-compose exec api yarn test:e2e` |
| Destroy environment   | `$ docker-compose down -v`                |

---

### Native

If you prefer not to develop with Docker, you can run the app natively on your system.

#### Dependencies:

- [NodeJS 14.15+](https://www.python.org/)
- [Yarn](https://yarnpkg.com/getting-started)
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/quickstart?hl=de)

#### Steps:

1. `$ yarn install --frozen-lockfile`
2. `$ yarn start:dev`

To emulate Google Firestore, run:

1. `gcloud beta emulators firestore start --host-port localhost:8080`
2. `export FIRESTORE_EMULATOR_HOST=localhost:8080`.

To emulate Google BigTable, run:

1. `gcloud beta emulators firestore start --host-port localhost:8086`
2. `export BIGTABLE_EMULATOR_HOST=localhost:8086`.

See the [section on Real-Time Chat](#real-time-chat) for further steps.

## Deployment

This project includes GitHub workflows to deploy the Like and Chat APIs on Google Cloud. They will use App Engine and Cloud Run respectively. To do so, perform the following steps:

1. Create a new service account (SA) via: IAM & Admin > Service Accounts > Create Service Account

2. Grant permissions via IAM & Admin > IAM > Permissions > Edit SA (from above) > Add another role

- App Engine
  - Service Account User
  - App Engine Admin
  - Storage Admin
  - Cloud Build Editor
- Cloud Run
  - Service Account User
  - Cloud Run Admin

3. Generate a service account key via IAM & Admin > Service Accounts > Actions > Create key > type: JSON

4. Add GitHub secrets

- `GCP_PROJECT_ID: <your-project>`
- `GCP_SA_KEY: <JSON-contents-from-above>`

5. Enable the Google Admin APIs

- [App Engine](https://console.developers.google.com/apis/library/appengine.googleapis.com)
- [Cloud Run](https://console.developers.google.com/apis/api/run.googleapis.com)

6. Deploy via GitHub Actions

7. Allow public access to the Chat API via Cloud Run > `chat-api` service > Permissions > Add > members: `allUsers` / role: `Cloud Run Invoker`

## Persistence

This project offers two kind of storage methods for each API module:

- Chat API: Google Firestore / In-Memory
- Like API: Google BigTable / In-Memory

To leverage the Google persistence layer, simply specify `CHAT_STORAGE=firestore` or `LIKE_STORAGE=bigtable` as deployment environment variables. Both rely on `GCP_PROJECT_ID` being set correctly.

In the case of Firestore, no further configuration is needed except for [activating it](https://console.cloud.google.com/firestore) in the **native mode**.

BigTable, however, must be provisioned manually. Then, set `LIKE_BIGTABLE_INSTANCE_ID` accordingly.

## Real-Time Chat

The Chat API module supports real-time messaging based on WebSockets. Besides that, any message or chat created through the REST API will also trigger an appropriate notification. To enable both of these features, set `CHAT_BROKER_ENABLED=true`.

As the name implies, a message broker is required in order to support horizontal scaling. Currently, [Redis](https://redis.io/) is the only support backbone. Configure it via `CHAT_REDIS_HOST` and `CHAT_REDIS_PORT`. Additionally, each deployed instance should have a unique `CHAT_REDIS_CLIENT_ID` which follows the UUIDv4 standard.

To provision Redis on Google Cloud, go to Memorystore > Redis > Create Instance and configure a v5 instance. Note its instance ID and connect it with an authorized VPC network (e.g. project default). Then, [create a serverless VPC access connector](https://cloud.google.com/vpc/docs/configure-serverless-vpc-access#creating_a_connector) in the same region pointing to this authorized VPC network. Note the name of the connector. Finally, configure your Cloud Run instance to route requests to private IPs through this VPC connector.
