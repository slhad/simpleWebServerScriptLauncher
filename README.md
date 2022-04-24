# simpleWebServerScriptLauncher
Listen on a method//:ip:port/path and launch a script


## Installation and use

```bash
npm i -g simple-webserver-script-launcher
simple-webserver-script-launcher
```


## Configuration is done by environment variables

Here are how to use theses variables (with their default values)

```bash
ADDRESS=0.0.0.0 PORT=8888 METHOD=POST URL_PATH=runScript SCRIPT=script.sh simple-webserver-script-launcher
```

## Adding multiple routes
It's possible to add new routes with the same 3 variables METHOD , URL_PATH and SCRIPT with a numbered suffix

```bash
METHOD_0=GET URL_PATH_0=runScript SCRIPT_0="echo 'ok'" simple-webserver-script-launcher
```