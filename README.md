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

## Possible improvements

- Introduce openapi schema (single source of truth)
- Implement CI/CD (or at least CI for running tests on github workers)

## Stay in touch

- Author - [Goran Tubic](https://github.com/orangeGoran)

## License

This project is licensed under the MIT License.
