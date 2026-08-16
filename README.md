# Showing NPM Packages

A small Angular application built as a technical test assignment. It fetches a list
of npm packages from a provided API and renders them as a searchable grid of cards.

## Setup

Install nodejs and run next command in the root project

```bash
# install correct node version
nvm install

# before running the project later use correct node version
nvm use

# install packages
npm install
```

## Development server

To start a local development server, run:

```bash
npm run start:dev
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
npm run test:unit
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
npm run test:e2e
```

## Design decisions & trade-offs

- **NgRx SignalStore** — the whole page state (packages, search query, active card, dependencies per package) lives in one store. Components stay thin and every state transition is unit-testable without rendering anything.
- **`exhaustMap` for load/refresh** — while a list request is in flight, further triggers are ignored. There is no value in firing the same request twice.
- **`mergeMap` for dependency fetches** — the user can sweep the pointer across several cards quickly, so each card's dependencies request is allowed to run concurrently and results are stored per package id.
- **Stale `mouseleave` handling** — when the pointer crosses card A onto card B, A's late `mouseleave` must not clear B's highlight. The store ignores an unset coming from a card that is no longer active (covered by a unit test).
- **`HttpClient` over raw `fetch`** — keeps interceptors available and makes the service testable with `HttpTestingController`.
- **Dependencies cached per package id** — hovering the same card again does not refetch.

## Possible improvements

- Introduce openapi schema (single source of truth) and generate the API types from it
- Add pagination or list virtualization instead of showing all entries at once (backend + frontend)
- Persist the search query in the URL so the filtered view can be shared

## Stay in touch

- Author - [Goran Tubic](https://github.com/orangeGoran)

## License

This project is licensed under the MIT License.
