# humio2grafana
![Humio Panel](https://github.com/humio/humio2grafana/blob/master/src/img/humio_logo.png)


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
