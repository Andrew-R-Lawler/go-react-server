# go-react-server
Template for a full-stack crud application using TypeScript, golang, and PostgreSQL.

## Table of Contents

    - [Install](#install)
    
## Install

In order to use this template you need to have a few things installed on your machine.

* Golang
* Bun (Package management, Runtime)
* Air (Go hot reload)

## Usage
Create a new repository with this template, clone it into your machine, move into the client directory in the cloned repository.

```
git clone your-github-link-here
cd newly-added-respository/client
```
in order for our web server to serve our static page we need to build our frontend, this can be done using the build script from package.json.
```
bun run build
```

## Development
This repository was built to be developed upon and has everything needed for quick iteration.

To start development it is intended to run air in one terminal instance to ensure the backend code that is running is up to date. This can be done by simply running the air command.

```
air
```

We also need to run a react development server, we do this using vite, and we call it using our dev script.

```
bun run dev
```

With both servers up and running we are ready to develop.


