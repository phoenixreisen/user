# Phoenix Reisen User

User Handler, der den typischen Umgang mit einem eingeloggten bzw. sich einloggenden Phoenix-User erleichtert.

## Installation

```bash
npm install --save @phoenixreisen/user
```

## Test

```bash
npm run test
```

## Deployment

```bash
npm version [major|minor|patch]     # increase version x.x.x => major.minor.patch
npm publish                         # upload to npm

hg bzw. git commit package.json package-lock.json -m "(npm) version increased"
hg bzw. git push
```