# humio2grafana

This repo contains the official Grafana integration for Humio.

If you just want to use the plugin for your dashboards keep reading. If you want to develop the plugin further go [here](src/README.md).

## Installing the Plugin
1. Run `git clone git@github.com:humio/humio2grafana.git`
2. Run `cd humio2grafana`
3. Run `yarn install` to install dependencies
4. Run `yarn run build` to generate the "dist" folder, which contains the transpiled plugin code
5. Copy the "dist" folder to `{grafana-install-path}/data/plugins`
    - Linux: Grafana installed at  `/var/lib/grafana/`
    - MacOS: Grafana installed at `/usr/local/var/lib/grafana/`
    - Windows: Grafana installed at `C:\Program Files\GrafanaLabs\grafana\`
6. Restart Grafana service

## Setting Up A Humio Data Source
Before you can populate your dashboards with Humio data, you must register a Humio data source to your Grafana instance by following these steps:
1. Login to your Grafana instance.
2. Go to "Configuration" -> "Data Sources".
3. Click "Add data source".
4. Choose the Humio data source from the list.
5. Configure the data source:
    1. Set data source name, for example "MyHumioCloud".
    2. Set Humio server address, for example https://cloud.humio.com.
    3. Set Humio access token. Note that an ingest token cannot be used, as the token must permit queries to be made against the resource.
6. Click "Save & Test". You'll get a "Success" message, if a connection to your Humio server could be made.

## Adding a New Humio Panel to a Dashboard
To add a Humio panel to your dashboard, simply add a new panel widget and select your new Humio data source as the panel's data source. You can then write regular Humio queries for the panel to populate it with data. 

### Widget Types
Grafana offers many different types of widgets to display data queried from Humio. Depending on the type of widget you choose, your query is expected to return a certain data format. The data format returned by a query depends on the final consuming function of its pipeline. For instance, given `groupby(...) | count()` the data format returned is decided by `count()`, which in this case returns a single data point.

 In the following, we give some examples that work well with the different widget types. This is not an exhaustive list, but is meant as a good starting point.

#### Graph 
The graph widget is suited for showing time-series data. Use the `timechart()` in your query to populate it.

#### Table
The table widget is suited for showing tabular data. Use the `table()` function in your query to return data formatted for this widget.

#### Stat/Gauge/BarChart
These widgets are suited for showing a single metric across different groups of data. Use the `groupby()` function in your query to return data for these widgets.

#### Singlestat
The Singlestat widget is suited for showing a single number. You can populate it with queries that return a single datapoint such as when using the `count()` function in your query.

#### Worldmap
The Worldmap widget is very useful for showing locational data, but is not included in the standard Grafana installation. You can install it as a plugin from its [plugin page](https://grafana.com/plugins/grafana-worldmap-panel)).

To populate your widget use the `worlmap()` function. As an example, if you want to decide location by ip use `worldmap(ip={your ip field here})`. Given this query, the widget must be configured in the following manner to be shown correctly:
* Location Data: Table
* Aggregation: Total
* Table Query Format: geohash
* Location Name Field: geohash
* Metric Field: magnitude
* Geohash Field: geohash