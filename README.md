# Habitica Automation

I got inspired by @alexanderczigler's [automation scripts](https://github.com/alexanderczigler/habitica) for our [Habitica](http://habitica.com/) party and wanted to try out Google Apps Scripts for myself.

## Get started

This project is written in TypeScript and uses `clasp` to integrate and build to Google Apps Scripts. Start by installing `clasp` and logging in.

```bash
$ npm i -g @google/clasp
$ clasp login
```

Get your API values from the [Habitica settings](https://habitica.com/user/settings/api) and create a `config.ts` in the root of the project with the following content:

```typescript
// config.ts
const config = {
  goldThresholds: {
    // If the user has more than 500 gold, buy an armoire
    armoire: 500,
  },
  manaThresholds: {
    // If the user has more that 150 mana, cast earthquake
    earthquake: 150,
  },
  headers: {
    'x-api-user': '<user-id>',
    'x-api-key': '<api-key>',
  },
}

export default config
```

You should the be ready to push your project to Google Apps Scripts using.
`clasp` will take care of compiling the TypeScript code.

```bash
$ clasp push
```

## Functions

### `buyArmoire`

This function will buy an "Enchanted armoire"

### `earthquake`

This function will cast "Earthquake" that buffs the party's intelligence
