# Humio2Grafana
This document will help you contribute to this repo. If you're merely interested in using the plugin, please see the official [documentation](https://docs.humio.com/integrations/other/grafana/) for instructions on installation and usage.
 
Before contributing please read our [contributors’ guidelines](CONTRIBUTING.MD). We very much encourage that you add issues and pull requests to this repo as the need arises.
 
 
## Setting Up Your Development Environment
To setup your development environment, you must install the plugin as described in the [documentation](https://docs.humio.com/integrations/other/grafana/).
 
Now, each time you make a change to the code, you need to:
1. Rebuild the `dist` folder
2. Copy it to the Grafana plugin folder
3. Restart the Grafana service
 
To make this a bit easier, a "watch" script has been created, which rebuilds `dist` at each change to the code base. Activate it by running:
```bash
yarn run watch
```
 
In addition, you can symlink the `dist` folder into the Grafana plugin folder, to avoid having to copy it manually after each build. On Unix systems this can be done by entering the command:
```bash
ln -s $(pwd)/dist {grafana-install-path}/plugins/humio2grafana
```
 
## Running Humio and Grafana on the Same System
Both Grafana and Humio use port 3000 as their default TCP port. This results in clashes when attempting to run them on the same system. To change Grafana's default port find the `grafana.ini` file, location depending on OS, and modify its `http_port` field. Then restart Grafana to apply the change.