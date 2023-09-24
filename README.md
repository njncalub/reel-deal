# reel-deal

[![Deno Version](https://img.shields.io/badge/deno-v1.37.0-black)](https://deno.land/)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE.md)

![Reel Deal Logo](./static/ogp.png)

Allows users to browse available movies, rent movies, and view their rental history. This is a sample project built using [Deno](https://deno.com/), [Fresh](https://fresh.deno.dev/), [Deno KV](https://deno.com/kv), and deployed on [Deno Deploy](https://deno.com/deploy).

## Development

Please see bundled [DEVELOPMENT file](./DEVELOPMENT.md) for more details.

## Schema

This project uses [Deno KV](https://deno.com/kv), a new key-value store for [Deno](https://deno.com/). Since there are no tables, values can only be accessed by their respective keys. These keys are sequences of [key parts](https://docs.deno.com/kv/manual/key_space) (strings, numbers, booleans, Uint8Arrays, or bigints) and can be used for modeling hierarchical data. For example, the key `["users", 1]` is a user with the ID `1`. The key `["users", 1, "rentals"]` is the rentals for the user with the ID `1`.

> **NOTE**: Due to design limitations of the datastore, we need to maintain separate keys if we want to create [indexes](https://docs.deno.com/kv/manual/secondary_indexes) or count the number of records. For example, the key `["users_by_email"]` indexes the users by their emails and the key `["users_count"]` holds the number of users.

| Feature | Key Prefix           | Description                                |
| ------- | -------------------- | ------------------------------------------ |
| Auth    | `["tokens"]`         | Stores tokens for authentication.          |
| Users   | `["users"]`          | Stores user information.                   |
| Users   | `["users_by_email"]` | Stores user information, indexed by email. |
| Users   | `["users_count"]`    | Stores the number of users.                |

```typescript
export const TokenRowSchema = z.object({
  token: z.string(), // Primary Key: ["tokens", x.token]
  userId: z.string().ulid(),
  type: z.enum(["access_token", "refresh_token"]),
  expires: z.date(),
  blacklisted: z.boolean(),
  createdAt: z.date(),
});

export const UserRowSchema = z.object({
  id: z.string().ulid(), // Primary Key: ["users", x.id]
  email: z.string().email(), // Secondary Index: ["users_by_email", x.email]
  name: z.string(),
  hashedPassword: z.string(),
  createdAt: z.date(),
});
```

## Endpoints

- [x] Auth:
  - [x] POST `/auth/login`
    - Description: Authenticates a user and returns an access token and a refresh token.
    - Payload:
      - `email`: string
      - `password`: string
  - [x] POST `/auth/refresh-tokens`
    - Description: Refreshes an access token.
    - Payload:
      - `refreshToken`: string
- [ ] Users:
  - [x] GET `/users`
    - Description: Returns a list of users.
    - Query parameters:
      - `cursor`: string
      - `limit`: number
      - `reverse`: boolean
  - [x] POST `/users`
    - Description: Registers a new user.
    - Payload:
      - `email`: string
      - `name`: string
      - `password`: string
        - should be 8 to 100 characters long and must have at least one uppercase letter, one lowercase letter, one number, and one special character
  - [x] GET `/users/:user_id`
    - Description: Returns a specifc user's information.
  - [ ] GET `/users/:user_id/rentals`
    - Description: Returns a specific user's rental history.
- [ ] Movies:
  - [ ] GET `/movies`
    - Description: Returns a list of movies.
    - Query parameters:
      - [ ] `available`: boolean, default=true
  - [ ] GET `/movies/:movie_id`
    - Description: Returns a specific movie's information.
- [ ] Rentals:
  - [ ] POST `/rentals`
    - Description: Registers a new rental record.
    - Payload:
      - `user_id`: string
      - `movie_id`: string
  - [ ] GET `/rentals/:rental_id`
    - Description: Returns a specific rental record.
  - [ ] DELETE `/rentals/:rental_id`
    - Description: Soft deletes a specific rental record.

### Demo

Check out the [demo.http](./demo.http) file for a sample flow of the requests, namely the:

- [Register](./demo.http#:~:text=@name%20createUser)
- [Login](./demo.http#:~:text=@name%20loginUser)
- [List Users](./demo.http#:~:text=@name%20getUsers)
- [List Users Parameterized](./demo.http#:~:text=@name%20getUsersWithQueryParams)
- [Get User](./demo.http#:~:text=@name%20getUser)

> **NOTE**: Please install the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension for [Visual Studio Code](https://code.visualstudio.com/) to run the requests. Once installed, you will be able to see the `Send Request` button on the top-left corner of the request blocks. This should open a new tab with the response. These should be ran in order, as some requests depend on the previous ones.

## Contributing

> **Attribution**: This text is originally from [adriennefriend/imposter-syndrome-disclaimer](https://github.com/adriennefriend/imposter-syndrome-disclaimer).

**Imposter syndrome disclaimer**: We want your help. No, really.

There may be a little voice inside your head that is telling you that you're not ready to be an open source contributor; that your skills aren't nearly good enough to contribute. What could you possibly offer a project like this one?

We assure you - the little voice in your head is wrong. If you can write code at all, you can contribute code to open source. Contributing to open source projects is a fantastic way to advance one's coding skills. Writing perfect code isn't the measure of a good developer (that would disqualify all of us!); it's trying to create something, making mistakes, and learning from those mistakes. That's how we all improve, and we are happy to help others learn.

Being an open source contributor doesn't just mean writing code, either. You can help out by writing documentation, tests, or even giving feedback about the project (and yes - that includes giving feedback about the contribution process). Some of these contributions may be the most valuable to the project as a whole, because you're coming to the project with fresh eyes, so you can see the errors and assumptions that seasoned contributors have glossed over.

## License

Licensed under **MIT**. Please see bundled [LICENSE file](./LICENSE.md) for more details.
