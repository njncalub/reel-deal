# Development

This documents how to start the development process.

## Code Editors

We recommend using [Visual Studio Code](https://code.visualstudio.com/), with the following extensions:

- [`bierner.markdown-mermaid`](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid)
- [`denoland.vscode-deno`](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)
- [`esbenp.prettier-vscode`](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [`humao.rest-client`](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- [`sastan.twind-intellisense`](https://marketplace.visualstudio.com/items?itemName=sastan.twind-intellisense)

## Deno

This project uses the [Deno](https://deno.land) JavaScript runtime to run the scripts. For more information, you can check the official documentation at https://deno.land/manual/introduction.

- Create a `.env` file from the `.env.template`.
- Fill in the required values.
- Start the development server:
  - `deno task start`

## Database

This project uses [Deno KV](https://deno.com/kv), a new key-value store for [Deno](https://deno.com/).

To populate the database with sample data, run the following command:

```sh
$ deno task db_populate_users
$ deno task db_populate_movies
```

To connect to your production database using the [REPL](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop), run the following command:

```sh
$ DENO_KV_ACCESS_TOKEN="<your-access-token>" deno repl -A --unstable
```

```typescript
const kv = await Deno.openKv(
  "https://api.deno.com/databases/<database-id>/connect"
);

// See: https://docs.deno.com/kv/manual
```
