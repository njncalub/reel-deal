# Development

This documents how to start the development process.

## Chrome Extensions

Here are some chrome extensions that will improve your development experience:

- [Octotree - GitHub code tree](https://chrome.google.com/webstore/detail/octotree-github-code-tree/bkhaagjahfmjljalopjnoealnfndnagc)
- [Refined GitHub](https://chrome.google.com/webstore/detail/refined-github/hlepfoohegkhhmjieoechaddaejaokhf)
- [Gitpod - Always ready to code](https://chrome.google.com/webstore/detail/gitpod-always-ready-to-co/dodmmooeoklaejobgleioelladacbeki)
- [JSONVue](https://chrome.google.com/webstore/detail/jsonvue/chklaanhfefbnpoihckbnefhakgolnmc)

## Code Editors

We recommend using [Visual Studio Code](https://code.visualstudio.com/), with the following extensions:

- [`aaron-bond.better-comments`](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments)
- [`bierner.markdown-mermaid`](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid)
- [`denoland.vscode-deno`](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)
- [`esbenp.prettier-vscode`](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [`humao.rest-client`](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- [`sastan.twind-intellisense`](https://marketplace.visualstudio.com/items?itemName=sastan.twind-intellisense)

If you do not have access to a development machine, you can create a new [Gitpod](https://gitpod.io/) workspace by clicking the button below:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/njncalub/reel-deal)

## Deno

This project uses the [Deno](https://deno.land) JavaScript runtime to run the scripts. For more information, you can check the official documentation at https://deno.land/manual/introduction.

- Create a `.env` file from the `.env.template`.
- Fill in the required values:
  - The `SECRET_KEY` can be generated using:
    - `deno task crypto_generate_key`
- Start the development server:
  - `deno task start`

## Database

This project uses [Deno KV](https://deno.com/kv), a new key-value store for [Deno](https://deno.com/).

To populate the database with sample data, run the following command:

```sh
$ deno task db_populate_users
$ deno task db_populate_movies
```

### Connect to your development database

To connect to your development database using the [REPL](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop), run the following command:

```sh
$ deno repl -A --unstable
```

```typescript
const kv = await Deno.openKv();

const movies = kv.list({ prefix: ["movies"] });
for await (const movie of movies) {
  console.log(movie.key); // ["movies", "MOVIE-1234"]
  console.log(movie.value); // { ... }
  console.log(movie.versionstamp); // "00000000000000010000"
}

// See more commands: https://docs.deno.com/kv/manual
```

### Connect to your production database

First, get your [access token](https://dash.deno.com/account#access-tokens) and your database id from the [Deno Deploy project page](https://dash.deno.com/).

To connect to your production database using the [REPL](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop), run the following command:

```sh
$ DENO_KV_ACCESS_TOKEN="<YOUR-ACCESS-TOKEN>" deno repl -A --unstable
```

```typescript
const kv = await Deno.openKv(
  "https://api.deno.com/databases/<YOUR-DATABASE-ID>/connect"
);

const movies = kv.list({ prefix: ["movies"] });
for await (const movie of movies) {
  console.log(movie.key); // ["movies", "MOVIE-1234"]
  console.log(movie.value); // { ... }
  console.log(movie.versionstamp); // "00000000000000010000"
}

// See more commands: https://docs.deno.com/kv/manual
```
