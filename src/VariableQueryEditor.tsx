import React, { PureComponent } from 'react';
import { PluginMeta, SelectableValue } from '@grafana/data';
import { PanelPlugin } from '@grafana/data';
import { QueryField, Select } from '@grafana/ui';
import { VariableQueryData } from './types';
import IDatasourceRequestOptions from './Interfaces/IDatasourceRequestOptions';
import { getBackendSrv } from '@grafana/runtime';
import _ from 'lodash';

export interface PluginDashboard {
  dashboardId: number;
  description: string;
  folderId: number;
  imported: boolean;
  importedRevision: number;
  importedUri: string;
  importedUrl: string;
  path: string;
  pluginId: string;
  removed: boolean;
  revision: number;
  slug: string;
  title: string;
}

export interface PanelPluginsIndex {
  [id: string]: PanelPlugin;
}

export interface PluginsState {
  plugins: PluginMeta[];
  searchQuery: string;
  hasFetched: boolean;
  dashboards: PluginDashboard[];
  isLoadingPluginDashboards: boolean;
  panels: PanelPluginsIndex;
}

export interface VariableQueryProps {
  query: any;
  onChange: (query: any, definition: string) => void;
  datasource: any;
  templateSrv: any;
}

export class VariableQueryEditor extends PureComponent<VariableQueryProps, VariableQueryData> {
  defaults: VariableQueryData = {
    query: '',
    repo: '',
    repositories: [],
  };

  constructor(props: any) {
    super(props);
    this.state = Object.assign(this.defaults, this.props.query);
    console.log(this.state);
  }

  onQueryChange(query: string) {
    this.setState({
      ...this.state,
      query: query,
    });
  }

  onRepoChange(repo: SelectableValue<string>) {
    this.setState({
      ...this.state,
      repo: repo.value,
    });
  }

  componentDidMount() {
    let requestOpts: IDatasourceRequestOptions = {
      method: 'POST',
      url: this.props.datasource.graphql_endpoint,
      data: { query: '{searchDomains{name}}' },
      headers: this.props.datasource.headers,
    };

    getBackendSrv()
      .datasourceRequest(requestOpts)
      .then(res => {
        let searchDomainNames = res.data.data.searchDomains.map(({ name }: { name: string }) => ({
          label: name,
          value: name,
        }));

        this.setState({
          repositories: _.sortBy(searchDomainNames, ['label']),
        });
      });

    fetch('/api/dashboards/uid')
      .then(res => res.json())
      .then((res: any) => {
        console.log(res);
      });
  }

  componentDidUpdate(prevProps: Readonly<VariableQueryProps>, prevState: Readonly<VariableQueryData>) {
    const query = this.state.query;
    this.props.onChange(this.state, `Humio - ${query}`);
  }

  render() {
    return (
      <div className="gf-form gf-form--grow flex-shrink-1 min-width-15 explore-input-margin">
        <QueryField
          query={this.state.query}
          placeholder="Enter a Humio query (run with Shift+Enter)"
          portalOrigin="Humio"
          onChange={v => {
            this.onQueryChange(v);
          }}
        ></QueryField>

        <Select
          width={30}
          options={this.state.repositories}
          value={this.state.repo}
          onChange={v => {
            this.onRepoChange(v);
          }}
        ></Select>
      </div>
    );
  }
}
