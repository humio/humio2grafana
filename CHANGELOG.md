
# Changelog


## 0.1.5 (2020-03-26)
Major refactoring of codebase. 
### Added 
- Support for table queries
- Support for groupby on multiple fields

### Changed
- Migrated from using older REST endpoints to modern GraphQL
- Updated code structure to improve readability

### Removed
- Many smaller unused files.

## 2.0.0 (2020-04-16)
Update to Datasource Configuration. This update requires existing data sources to be set up again.
### Added 
- Encryption of Humio access token on backend. Now all Humio calls are proxied through the Grafana backend, meaning that access tokens are no longer accessible to users in the frontend. This also means that Humio queries can no longer be made through the browser directly.

### Changed
- Fixed bug where humio query links would not work, if the datasource URL did not have a trailing slash.

### Removed
- Some standard data source configuration options. These had to be removed in order to configure datasources for encrypted access tokens.

## 3.0.0 (2020-07-16)
Major update which rewrites the plugin to use React rather than AngularJS
### Added 
- Support for variables
- Support for annotations

### Changed
- Fixed bug where humio query links would not work, if the datasource URL did not have a trailing slash.

### Removed
- Old tests

## 3.0.1 (2020-07-21)
Patch which allows users to use non-token auth for data sources again.

### Changed
- Updated data source config to allow users more types of authentication.

## 3.0.2 (2020-07-24)
Can now filter repository dropdowns to limit their contents

### Added
- A field to the Annotations page, which allows for filtering on strings beginning with another string.


## 3.0.3 (2020-08-26)
Smaller bugfixes

### Changed
- Annotation query now works without Regex lookahead. This is not supported in browsers like Safari, so it yielded some issues.

### Removed
- Regex escaping for variables. The escaping procedure proved to aggressive and ruined templated queries.

## 3.0.4 (2020-08-27)
Version created to test release pipeline, equivalent with 3.0.3.

## 3.0.5 (2020-10-29)
Updated plugin id, so that the project was ready for official release.

## 3.1.0 (2020-11-03)
First release to Grafana.com
### Changed
- Update to use grafana-toolkit 7.3.0 to fix some vulnerable dependencies
- Changed plugin id to `humio-datasource`, will require a reinstallation of existing datasources.

## 3.1.1 (2020-11-09)
### Changed
- Updated Query editor not to execute query when hidden or when no repo is selected.

## 3.2.0 (2020-12-08)
### Added
- Queries are now marked as initiated from Grafana.
- A large amount of new unit tests.

## Changed
- Annotation queries can now use live query jobs like with the panel queries.
- Non-predefined time ranges that can be set in Grafana are now supported.

## 3.2.1 (2020-12-18)
### Added
- Unit tests for the query job object

## Changed
- BugFix: Switching between repos when running live queries now results in a new queryjob being created.
- BugFix: Error Handling in query job now works as it used to, and can recreate queryjob automatically on errors.

## 3.2.2 (2021-01-06)
### Changed
- Upgraded some transitive dependencies to include security fixes.

## 3.2.3 (2021-01-29)
### Changed
- Upgraded some transitive dependencies to include security fixes.

## 3.2.4 (2021-03-30)
### Changed
- Fixed issue where data of certain timechart queries wasn't correctly formatted.
- Upgraded some transitive dependencies to include security fixes.