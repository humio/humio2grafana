
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