# Rapidity

Rapidity is a performance measuring tool for NodeJS unit tests.
It will measure the performance of all function calls that are executing during the test.

This tool is currently only available for Mocha tests.
To use it, add ``rapidity`` as a devDependency using
``npm install --save-dev rapidity`` and add a script to your ``package.json`` file.
The "rapidity" script is copied from your test script, but with added
``--require rapidity`` for loading and with the reporter set by ``-R rapidity``.

```
  "scripts": {
    "test": "mocha test.js",
    "rapidity": "mocha --require rapidity test.js -R rapidity > output.html"
  },
  "devDependencies": {
    "mocha": "^2.2.4",
    "rapidity": "^1.0.0"
  }
```

This application is still a work-in-progress. It is not very well tested yet
and lacks configuration options and support for other test runners.
And the code looks like it is written by drunken monkeys.
