# Chat & Like Microservices

This package provides a REST and WebSocket API to chat. The OpenAPI specification is available at `http://localhost:3000/docs/`.

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

#### Steps:

1. `$ yarn install --frozen-lockfile`
2. `$ yarn start:dev`

To emulate Google Firestore (via [Google Cloud SDK](https://cloud.google.com/sdk/docs/quickstart?hl=de)), run:

1. `gcloud beta emulators firestore start --host-port localhost:8080`
2. `export FIRESTORE_EMULATOR_HOST=localhost:8080`.

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
