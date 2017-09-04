# humio2grafana
grafana integration for humio

# installing the plugin
- clone the repo
- copy dist folder (or the whole repo) to /var/lib/grafana/data/plugins
- restart grafana

# visualization of humio data
- open grafana 
- open "datasources" page
- click "add datasouce"
- select datasource type "humio2grafana"
- set datasource name, for example "humio cloud"
- set humio server address without trailing slash, for example "https://cloud.humio.com"
- set "Humio access token" to some active token
- after a valid token is entered "dataspaces" list should be populated, select some dataspace
- click "Save & Test" button, you chould receive "success" message

# setting up dashboard
- add new "Graph" widget to some dashboard
- click on widget title, and then on "edit" button
- open "metrics" tab
- set "Panel Data Source" to one you've created
- also set timeseries to "_count"
- you should see the data, the default qyery is just "timechart" for the last 5 min, set time interval to "last 5 min" in grafana, set refresh time interval to see live data flow.
