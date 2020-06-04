# Project Skeleton For Tufts CS Code For Good

This repo serves as an opinionated project skeleton put together by someone who's struggled through this process
many times before :) 
Feel free to fork this/copy it for other projects that may find it useful.

## What does this project skeleton give me?

Out of the box, this project skeleton gives you:
* Only need to install ONE piece of software onto your computer (not including your editor of choice)
    * Don't have to worry about Python version, Postgres version, etc etc
* Guarantee that everyone has the same development environment
* A Python backend running Flask (a fairly straightforward Python web framework https://flask.palletsprojects.com/en/1.1.x/)
* Stand up a Postgres database with one command
* Start up the server with one command
* Pre-configured to serve static files (JS, CSS, images, etc.) from `/static/`
* Serves index.html at `/`  

## What do I need to do to use it?

All you need to do is:
* Install some editor- up to you
* Install Docker Desktop for Mac https://hub.docker.com/editions/community/docker-ce-desktop-mac

## What's Docker?

That's a broader question, but a (very) simplified answer is: It's a way to build and run tiny VMs, and we use
it to consistently build the same tiny VM for everyone to run their code in.
