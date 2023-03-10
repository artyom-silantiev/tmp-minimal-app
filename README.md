# TMP MINIMAL APP

# deploy and install

```sh
cp .env.default .env
yarn
yarn gen-grpc-types
```

# run dev

```sh
yarn dev:one
# or
yarn dev:two
```

# build for dev

```sh
yarn build:all:dev
# or
yarn build:one:dev
# or
yarn build:two:dev
```

# build for prod

```sh
yarn build:all
# or
yarn build:one
# or
yarn build:two
```

# run prod

```sh
yarn prod:one
# or
yarn prod:two
```
