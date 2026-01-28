## Local Setup

### Running from CLI

#### Dev mode

```shell
pnpm dev
```

This will start the development server on `http://localhost:3000`.

#### Prod mode

```shell
pnpm build
pnpm start
```


#### Enable git hooks
To auto-run linting before pushing

```shell
git config core.hooksPath .githooks
```

#### Clear next.js build cache
When colors don't update
```shell
rm -rf .next
```
