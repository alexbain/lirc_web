# Change Log

All notable changes to this project will be documented in this file.

As of `v0.1.0`, this project adheres to [Semantic Versioning](http://semver.org/).

## Unreleased

## [0.2.2] - 2016-01-01

* Removing `Makefile` for running tests. Only need `package.json`.
* Fixing .gitignore error for the global lirc_web build

## [0.2.1] - 2015-12-31

* `lirc_web` can now be installed globally and called by `lirc_web` from CLI
* Adding ESLint to the mix and ensuring all JS conforms to Airbnb ES5 standards

## [0.2.0] - 2015-12-30

* Adding `blacklist` configuration option to hide unused keys from UI (thanks @OvisMaximus)
* Adding support for SSL (thanks @de-live-gdev)
* Fixing example config in the README (thanks @de-live-gdev)
* Fixes url escaping bug with macros and remotes (issue #23)

## [0.1.0] - 2015-12-30

* Locking npm versions to ensure future install work
* Adding `CHANGELOG.md`
* Adding `/refresh` link on bottom to reload UI after making changes to LIRC (thanks @f00f)
* Adding ability to set custom labels on command and remote names (thanks @elysion)
* Adding Apple mobile app capability, disabling zoom (thanks @elysion)
* Moving Lato fonts locally to remove external network dependency

## [0.0.8] - 2014-01-18

* Adding `macros` configuration option
* Fixing bug with setInterval causing repeaters to potentially never stop

## [0.0.7] - 2013-12-29

* Adding `send_start` and `send_stop` support to UI
* Adding `config.json` configuration file which allows users to set options
* Adding `repeaters` as a configuration file
* Adding documentation about API to README
* Setting up proper test suite with LIRC test fixtures

## [0.0.6] - 2013-12-01

* Adding `upstart` example configuration files

## [0.0.5] - 2013-08-21

* Locking swig dependency due to breaking change in new version
* `urlencode` command names (thanks @joe-forbes)

## [0.0.4] - 2013-05-16

* Fixing iOS caching error that was preventing commands from sending

## [0.0.3] - 2013-03-31

## [0.0.2] - 2013-03-22

* Include compiled JS and CSS for ease of installation

## [0.0.1] - 2013-03-20

* Initial commit and integration with `lirc_node`
