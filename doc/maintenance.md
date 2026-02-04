## upgrading libs

```bash
# upgrade node
nvm install --lts
nvm use --lts
npm install -g pnpm # install pnpm again for the new node version

# bump lib versions
npm install -g npm-check-updates
ncu -u
rm -rf node_modules pnpm-lock.yaml # delete all project modules
pnpm install

# align next.js and react (might do code changes if next.js major version changed)
npx @next/codemod@latest upgrade latest

# validate
pnpm tsc --noEmit
pnpm lint --fix
pnpm test
pnpm build
pnpm start
```