# Humio2Grafana
This repository hosts code for the Humio plugin for Grafana. Full documentation can be found in the official [humio docs](https://docs.humio.com/integrations/other/grafana/).


## Vision
The vision for the Humio Grafana plugin, is to create a plugin for Grafana, which allows users to create Grafana panels that pull data from Humio. It should be possible for users to write pure Humio queries in Grafana to populate their panels. Development seeks to keep the plugin up to date with both Grafana and Humio as they evolve. 

## Governance
This project is maintained by employees at Humio ApS.
As a general rule, only employees at Humio can become maintainers and have commit privileges to this repository.
Therefore, if you want to contribute to the project, which we very much encourage, you must first fork the repository.
Maintainers will have the final say on accepting or rejecting pull requests.
As a rule of thumb, pull requests will be accepted if:
 
   * The contribution fits with the project's vision
   * All automated tests have passed
   * The contribution is of a quality comparable to the rest of the project
 
The maintainers will attempt to react to issues and pull requests quickly, but their ability to do so can vary.
If you haven't heard back from a maintainer within 7 days of creating an issue or making a pull request, please feel free to ping them on the relevant post.

Maintainers will also be in charge of both versioning and publishing future releases of the project. This includes adding versioning tags and adding to the changelog file.
 
The active maintainers involved with this project include:
  
   * [Alexander Brandborg](https://github.com/AlexanderBrandborg)
   * [Suzanna Volkov](https://github.com/Suzanna-Volkov)

## The React Beta Branch
This branch contains a Beta version of version 3.0.0 of the plugin. This section describes new additions.
 
Please note that in some of these new additions you can now use Humio filter queries. The standard result size of filter queries will always be 200 events. If you need a larger result from a query, append `| tail(x)` to your query, where `x` is the number of returned events. This is done, as it is very easy for even simple queries on medium sized Humio repos to have results that are several GB in size. Such a sizable result is usually not helpful and is likely to crash the Grafana frontend in your browser. Therefore we leave the return size up to the user, and urge that you try to be as specific with your queries as possible.

### Move away from AngularJS to React
Most of the plugin has been upgraded to use React, as this is the modern option for Grafana plugins. This has unlocked some new opportunities in development of the plugin, and also allows for some usage of the `explore` feature.

### Query Variables
The plugin now supports Grafana variables populated using Humio queries. Both aggregate and filter queries can be used to populate a variable.
In addition to the query, you must provide:
* The Humio repo to query
* The name of the event field in the returned events to extract the variable contents from

As a special case for this plugin, you must press the `Execute Humio Query` button on the variables screen to query Humio for variable values and get a set of variable values to appear in the bottom of the screen. 

We support the `All` and `Multi-Value` features for query variables. When a variable evaulates to more than one value in a query, it will interpolated to the format `/^val1|val2...|valN$/`, so you need to keep account of that in your queries.

### Annotations
The plugin also supports annotations based on Humio filter queries. Given the return of a filter query, each event will be turned into an annotation an its `@timestamp` field will define where in time to place the annotation. 

In addition to the query you also need to define:
* The Humio repo to query
* The name of the event field in the returned events to extract the annotation text from

Note that variables may be used in annotation queries.
 
## Installation & Usage of The Beta Branch
Installation is now a bit different since the move to React. To try out this branch execute the following steps:
1. Clone https://github.com/humio/humio2grafana/tree/issue/53/upgrade-to-react
2. Enter directory
3. Run `yarn install` to set up the repo
4. Run `node_modules/@grafana/toolkit/bin/grafana-toolkit.js plugin:dev` to build the plugin into the `dist` folder
5. Move the `dist` folder to the Grafana plugin directory and rename it to `humio2grafana`, or create a symlink
6. Restart Grafana

Be aware that the plugin will appear as `Unsigned`, as it is not officially endorsed by Grafana. However the plugin will work as normal.

