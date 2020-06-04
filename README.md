# Project Skeleton For Tufts CS Code For Good

This repo serves as an opinionated project skeleton put together by someone who's struggled through this process
many times before :) 
Feel free to fork this/copy it for other projects that may find it useful.

## What does this project skeleton give me?

Out of the box, this project skeleton gives you:
* Only need to install ONE piece of software onto your computer (not including your editor of choice)
    * Don't have to worry about Python version, Postgres version, Node version, etc etc
* Guarantee that everyone has the same development environment
* A Python backend running Flask (a fairly straightforward Python web framework https://flask.palletsprojects.com/en/1.1.x/)
* Stand up a Postgres database with one command
* An opinionated ReactJS frontend built with the server
* Start up the server with one command
* Serves index.html at `/`
* Plays ping-pong; responds to `/ping` with `pong #N` where `N` is the number of `ping` requests that have sent

## What do I need to do to use it?

All you need to do is:
* Install some editor- up to you
* Install Docker Desktop for Mac https://hub.docker.com/editions/community/docker-ce-desktop-mac
* Create a file named `.env` in this directory. This file is used to store configuration like database passwords that
SHOULD NOT be committed into git. This file is explicitly ignored by git (look at the `.gitignore` file). 
Don't commit it! Create the file by running:
```bash
echo "DB_PASS=docker
DB_URL=host.docker.internal
DB_NAME=postgres
DB_USER=postgres" > .env
```
* Create a file named `.env` in `ui/` like so: `echo PUBLIC_URL=static/ > ui/.env` - this is configuration for the Yarn build

### How do I actually run the server now that I've installed Docker?

Run `make init-postgres` to stand up a database. It'll start an instance of Postgres 9.6 on your system
without you having to install Postgres yourself. All that setup is handled by a pre-built Docker "VM" configured to run Postgres.

Once the database is running, run `make run-server`. That will leave your terminal following Flask's output, and the Python
backend running on `localhost:5000`, which is a URL that you can visit in your browser at this point.

#### What if I need to directly manipulate the database?

Postgres has a CLI tool called `psql`; you do not need to install this yourself. If you run `make run-psql`, then you'll
be dropped into a `psql` session (again running in a Docker "VM") for your database.

If you want to teardown your database completely and kill the process, run `make teardown-db`.

#### How do I make postgres come up with the tables/data I want from the start?

Take a look in `standUpDB.bash` - that file has a multiline string at the bottom that you can fill with whatever
initialization code you want; create tables, populate dummy data, etc.

Just delete the comment reading `-- This is a Postgres comment; put database initialization code (create table, populate test data) here`
and replace it with your own code.

You can also do this by getting into a `psql` session with `make run-psql`, but if you want this to happen in an automated way,
you can change this script.

A common workflow may be to do something like `make teardown-db && make init-postgres` to re-set the database to a clean state.

## (Advanced) What's Docker?

That's a broader question, but a (very) simplified answer is: It's a way to build and run tiny VMs, and we use
it to consistently build the same tiny VM for everyone to run their code in.

### (Advanced) What's the deal with with `host.docker.internal` in the notes for setting up the top-level `.env` file?

One of the tradeoffs with the conveniences that Docker brings is that networking gets a little harder; specifically,
the Docker container is not on the same network as the host machine (your laptop), but there's a special IP address
aliased to `host.docker.internal` that will let you get to your host machine IP. That's how we cross the bridge from
the container running the server to the container running the database, which aren't on the same network; they're not on the
same network, but they both open a port on the host machine, so we can get to each via `host.docker.internal`.
