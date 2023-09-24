#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read --unstable

import "$std/dotenv/load.ts";

import { countAllMovies, createNewMovie } from "@/apps/movies/controller.ts";
import {
  MovieRow,
  NewMoviePayload,
  NewMoviePayloadSchema,
  PublicMovieData,
} from "@/apps/movies/models.ts";
import { extractDataFromFile } from "@/utils/files/extractDataFromFile.ts";

try {
  console.log("Populating movies from seed data...");

  const movies = await extractDataFromFile<MovieRow, NewMoviePayload>(
    "./seed/movies.yaml",
    (item) => {
      const res = NewMoviePayloadSchema.safeParse(item);
      if (!res.success) {
        console.log({
          message: "invalid movie payload",
          errors: res.error,
        });
      }
      return res.success;
    },
    (movie) => {
      return {
        title: movie.title,
        genre: movie.genre,
        releaseYear: movie.releaseYear,
        rentalPrice: movie.rentalPrice,
        availableCopies: BigInt(movie.availableCopies),
        synopsis: movie.synopsis,
        imdbUrl: movie.imdbUrl,
      };
    },
  );

  if (movies instanceof Error) {
    console.log(movies.message);
    Deno.exit(1);
  }

  const promises: Promise<PublicMovieData>[] = [];
  for (const movie of movies) {
    console.log(
      `Inserting: Movie ${movie.title} (${movie.releaseYear})`,
    );

    promises.push(createNewMovie(movie));
  }

  await Promise.all(promises);

  const count = await countAllMovies();
  console.log(`Database now has ${count} movie(s)`);
} catch (e) {
  console.error(e);
}
