# humio2grafana

Grafana integration for Humio

# Installing the plugin
-   clone the repo
-   copy dist folder (or the whole repo) to /var/lib/grafana/data/plugins
-   restart grafana

# Setting up Humio datasource
-   open grafana
-   open "datasources" page
-   click "add datasouce"
-   select datasource type "humio2grafana"
-   set datasource name, for example "Humio cloud"
-   set humio server address without trailing slash, for example https://cloud.humio.com
-   set "Humio access token" to some active token
-   click "Save & Test" button, you chould receive "success" message

# Setting up dashboard
-   add new "Graph" widget to some dashboard
-   click on widget title, and then on "edit" button
-   open "metrics" tab
-   set panel "Data Source" to one you've created
-   "Dataspace" dropdown list should be populated with avaliable dataspaces, select one
-   enter query ("timechart()" is the default one)
-   you should see the data, when panel is refreshed.

# Using Grafana [Worldmap Panel plugin](https://grafana.com/plugins/grafana-worldmap-panel)

![worldmap plugin example](https://github.com/humio/humio2grafana/blob/master/img/worldmap-panel-example.png)

-   Install Grafana Worldmap Panel plugin (see installation instructions on [plugin page](https://grafana.com/plugins/grafana-worldmap-panel))
-   Select Humio as datasource
-   Extract country code using ipLocation Humio function (see [Humio docs](https://docs.humio.com/) for function description),


Example query:
```
format("%s", field="client", as=ip) | ipLocation(ip) | groupby(ip.country)
```

# Development
Clone this repository and install its dependencies:

```bash
git clone git@github.com:humio/humio2grafana.git
cd humio2grafana
yarn install
```

Build the plugin:
```bash
yarn run build
```

This will create a `dist` directory with the necessary files for the plugin.

### Install and configure Grafana
This set of instructions assumes that the developer is using macOS. 

#### Install Grafana
Follow the setup guide provided by Grafana: http://docs.grafana.org/installation/mac/. Installing through Homebrew is recommended.

#### Change Grafana's default port
As a default Grafana runs on port 3000 which clashes with Humio's default port. Change this by uncommenting and modifying the `http_port` setting in `/usr/local/etc/grafana/grafana.ini`. Restart Grafana:

```
brew services restart grafana
```

#### Install the plugin
Grafana plugins are stored in `/usr/local/var/lib/grafana/plugins`. To install the plugin, simply copy the `dist` directory to the Grafana plugins directory:

```
cp -R dist `/usr/local/var/lib/grafana/plugins/humio2grafana`
```

Or create a symlink to avoid having to copy the `dist` directory every time a change has been made:

```bash
cd /usr/local/var/lib/grafana/plugins/
ln -s ~/code/humio/humio2grafana/dist humio2grafana
brew services restart grafana
```

Configure the plugin by following the [instructions provided above](#setting-up-humio-datasource).

### During development
A file watching script is available to build the plugin whenever a project file changes:

```bash
yarn run watch
```

In order for plugin changes to take effect, Grafana has to be manually restarted:

```
brew services restart grafana
```