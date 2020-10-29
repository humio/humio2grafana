
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
