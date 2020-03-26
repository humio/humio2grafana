# Development
This document seeks to help you get started with further development on this repo.

## Setup
To setup your development environment, you must install the plugin as described in the [main document](../README.md).

Now, each time you make a change to the code, you need to:
1. Rebuild the "dist" folder
2. Copy it to the Grafana plugin folder
3. Restart Grafana

To make this a bit easier, a "watch" script has been created, which rebuilds "dist" at each change to the code base. Activate it by running:
```bash
yarn run watch
```

In addition, you can symlink "dist" into the Grafana plugin folder, to avoid having to copy it manually after each build:
```bash
ln -s $(pwd)/dist {grafana-install-path}/plugins/humio2grafana
```

## Running Humio and Grafana on the Same System
Both Grafana and Humio use port 3000 as their default port, which results in clashses when attempting to run them on the same system. To change Grafana's default port find the `grafana.ini` file, location depending on OS, and modify its `http_port` field. Then restart Grafana to apply the change.
