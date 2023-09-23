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

This project uses the [Deno](https://deno.land) JavaScript runtime to run the scripts. You can check the manual at https://deno.land/manual/introduction.

- Create a `.env` file from the `.env.template`.
- Fill in the required values.
- Watch the project directory and start the development server:
  - `deno task start`
