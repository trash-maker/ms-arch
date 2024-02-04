# ms-arch

[![nodejs-v20.11.0](https://img.shields.io/badge/node-v20.11.0-blue?logo=nodedotjs)](https://nodejs.org/en)
[![nx monorepo](https://img.shields.io/badge/nx-monorepo-blue?logo=nx)](https://nx.dev)
[![docker-compose](https://img.shields.io/badge/docker-compose-blue?logo=docker)](https://docs.docker.com/compose/)


✨ A monorepo oriented approach for microservice architectures ✨

## Requirements
 - `docker` + `docker-compose` installed
 - `node` installed
 - A [dns proxy](https://chromewebstore.google.com/detail/proxy-switchyomega/padekgcemlokbadohgkifijomclgjgif) installed, routing `**.local` hosts to `localhost`

## Setup
Install all needed dependencies:
```
npm install
```

Build all needed docker images:
```
npx nx run-many --target=docker-build --all=true
```

Spin up environment:
```
docker-compose up
```

> ℹ️ [nginxproxy/nginx-proxy](https://github.com/nginx-proxy/nginx-proxy) is used as ingress controller. `VIRTUAL_HOST` and `VIRTUAL_PORT` env variables on services are used ad host-based routing.

Test api call, in your browser console:
```javascript
fetch('http://orders-api.local/api/orders', {
  body: JSON.stringify({ items: [{ productId: 2, quantity: 2 }] }),
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## Add a new microservice

Each microservice in the sample is created in the same way:

```
npx nx generate @nx/node:application --name=apps/sample-api --bundler=webpack --framework=express --docker=true --e2eTestRunner=none --projectNameAndRootFormat=as-provided --no-interactive --dry-run
```

In newly created `apps/sample-api/package.json` set
`generatePackageJson` to `true` in the build options.

Then add the microservice in the docker-compose.yaml file:
```yaml
version: '3.9'
services:
    #...
    sample-api:
        image: sample-api:latest
        deploy:
        replicas: 1
        expose:
        - 3000
        environment:
        VIRTUAL_HOST: sample-api.local
        VIRTUAL_PORT: 3000
        PORT: 3000
```

---
Shared with 💜 by `trash-maker`