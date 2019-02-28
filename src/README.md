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