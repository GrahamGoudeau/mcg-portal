# MCG Student and Alumni Portal

## How do I run the portal locally?

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
DB_USER=postgres
JWT_KEY=mcg-portal-jwt-key
" > .env
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

### How do I install a new Yarn package for the UI?

It's a little tricky, since everything happens inside a Docker "VM", not on your laptop directly. So you may not even have Yarn installed
yourself. To get around this, run `make run-yarn-shell`. This will dump you into a shell session inside the UI's "VM". From that shell
you can run `yarn install <new dependency>`.

## Great, I'm running the portal locally. Now, how do I test?

For the UI, just visit `localhost:5000` in your browser of choice, after running `make run-server`.

For the backend, you can either:
* test by running JS written in the UI, that makes network requests to the server on `localhost:5000`
* (probably easier in the short term) test the backend in isolation by using `curl`

`curl` is a program that should already be installed on all Macs. It's a way to make requests to a server from the command line.

### `curl` examples

#### Logging in to the server

Let's log in using the test account that we set up by default in standUpDB.bash:

```bash
curl -XPOST -H 'Content-Type: application/json' -d '{"email": "test@example.com", "password": "password"}' localhost:5000/api/login
``` 

* `-XPOST` - tells the server we're making a "post" request
* `-H 'Content-Type: application/json'` - required on every `curl` invocation in our case; this tells the server that you're sending a JSON payload
* `-d '{"email": "test@example.com", "password": "password"}'` - this is the JSON payload that the above bullet point told the server to expect
* `localhost:5000/api/login` - this is the URL for the "login" route on the server

Running this command will yield something like:

```json
{"jwt":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1OTE1Mzk0ODEsIm5iZiI6MTU5MTUzOTQ4MSwianRpIjoiYzQ4MjA1MWMtNThlOS00NDhlLWI0NDItNmVkZDg2NzViMmJjIiwiZXhwIjoxNTkyMTQ0MjgxLCJpZGVudGl0eSI6MSwiZnJlc2giOmZhbHNlLCJ0eXBlIjoiYWNjZXNzIiwidXNlcl9jbGFpbXMiOnsiaXNfYWRtaW4iOnRydWV9fQ.bn1DMcMVjYv07TyxGZPid8S6W3B7_YOBhRR2EBbW5Ow"}
```

That's our login token. It's good for seven days before it expires. Let's use it to perform an action on our account:

#### Creating a resource that you can offer to other students/alumni

Let's use curl to say that we can offer mock interviews to other students/alumni:

```bash
curl -XPOST -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1OTE1Mzk0ODEsIm5iZiI6MTU5MTUzOTQ4MSwianRpIjoiYzQ4MjA1MWMtNThlOS00NDhlLWI0NDItNmVkZDg2NzViMmJjIiwiZXhwIjoxNTkyMTQ0MjgxLCJpZGVudGl0eSI6MSwiZnJlc2giOmZhbHNlLCJ0eXBlIjoiYWNjZXNzIiwidXNlcl9jbGFpbXMiOnsiaXNfYWRtaW4iOnRydWV9fQ.bn1DMcMVjYv07TyxGZPid8S6W3B7_YOBhRR2EBbW5Ow' -H 'Content-Type: application/json' -d '{"name": "mock interviews"}' localhost:5000/api/accounts/1/resources
```

This is pretty long, but let's break it down:

* `-XPOST` - tells the server we're making a "post" request
* `-H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci.....` - this is how we send the login token that we got from the previous command. The server will tell us we're not authorized if we don't include it.
* `-H 'Content-Type: application/json'` - required on every `curl` invocation in our case; this tells the server that you're sending a JSON payload
* `-d '{"name": "mock interviews"}'` - the JSON payload describing the resource we're offering
* `localhost:5000/api/accounts/1/resources` - the URL for the "resources" offered by account with id `1`. We add a resource by POSTing data to that URL.

## (Advanced) What's Docker?

That's a broader question, but a (very) simplified answer is: It's a way to build and run tiny VMs, and we use
it to consistently build the same tiny VM for everyone to run their code in.

### (Advanced) What's the deal with with `host.docker.internal` in the notes for setting up the top-level `.env` file?

One of the tradeoffs with the conveniences that Docker brings is that networking gets a little harder; specifically,
the Docker container is not on the same network as the host machine (your laptop), but there's a special IP address
aliased to `host.docker.internal` that will let you get to your host machine IP. That's how we cross the bridge from
the container running the server to the container running the database, which aren't on the same network; they're not on the
same network, but they both open a port on the host machine, so we can get to each via `host.docker.internal`.
