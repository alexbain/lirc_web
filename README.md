lirc_web
========

``lirc_web`` is a NodeJS / Express app that creates a web UI & API for [LIRC](http://lirc.org). It uses [lirc_node](https://github.com/alexbain/lirc_node) to handle communication between LIRC and NodeJS.

It is part of the [Open Source Universal Remote](http://opensourceuniversalremote.com) project.

## What is this?

``lirc_web`` is a sample NodeJS app that uses ``lirc_node`` to facilitate communication with LIRC. This web app provides two major pieces of functionality:

* A listing of all remotes/commands known to LIRC
* A POST endpoint that a web service can hit to send an IR command

## How do I use it?

You'll need to have LIRC installed and configured on your machine to use ``lirc_web``. Once you have LIRC installed and configured you should be able to start the NodeJS server and access it from the web.

## Getting started

First, clone the repository:

```
git clone git://github.com/alexbain/lirc_web.git
cd lirc_web
```

Install the required modules:

```
npm install
```

Start up the server:

```
node app.js
```

Verify the UI web works by opening ``http://SERVER:3000/`` in a web browser.


## Development

Would you like to contribute to and improve this sample app? Fantastic. To contribute
patches, run tests or benchmarks, make sure to follow the instructions above.

You'll want to run the ``grunt watch`` task in your shell so that all JS and LESS changes are picked up and recompiled upon save:

Install GruntJS (build environment):

```
npm install -g grunt-cli
npm install -g grunt-init
grunt
```

**You may need to reload your shell before continuing so the Grunt binares are detected.**

Running ``grunt`` will create all of the static assets.

Running ``grunt watch`` will recreate static assets every time you save a file.

You can run the test suite by running:

```
make test
```

## Contributing

Before you submit a pull request with your change, please be sure to:

* Add new tests that prove your change works as expected.
* Ensure all existing tests are still passing.

Once you're sure everything is still working, open a pull request with a clear
description of what you changed and why. I will not accept a pull request which
breaks existing tests or adds new functionality without tests.

The exception to this would be refactoring existing code or changing documentation.


## License

(The MIT License)

Copyright (c) 2013 Alex Bain &lt;alex@alexba.in&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
