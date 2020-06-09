import React, { PureComponent } from 'react';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { Select, QueryField } from '@grafana/ui';
import { HumioDataSource, CSVQuery } from './CSVDataSource';
import { HumioOptions } from './types';
import IDatasourceRequestOptions from './Interfaces/IDatasourceRequestOptions';

type Props = QueryEditorProps<HumioDataSource, CSVQuery, HumioOptions>;

interface State {
  repositories: any;
  selected?: string;
  datasource: HumioDataSource;
}

export class QueryEditor extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      repositories: [],
      selected: props.query.humioRepository,
      datasource: props.datasource,
    };
  }

  componentDidMount() {
    let requestOpts: IDatasourceRequestOptions = {
      method: 'POST',
      url: this.state.datasource.proxy_url,
      data: { query: '{searchDomains{name}}' },
    };

    requestOpts.url += '/graphql';
    requestOpts.headers = this.state.datasource.headers;

    getBackendSrv()
      .datasourceRequest(requestOpts)
      .then(res => {
        let searchDomainNames = res.data.data.searchDomains.map((name: string) => ({
          label: name,
          value: name,
        }));

        this.setState({
          repositories: searchDomainNames, // Should be sorted
          selected: searchDomainNames[0], // What if the result is empty?
        });
      });
  }

  onChangeQuery = (value: string, override?: boolean) => {
    // Send text change to parent
    const { query, onChange, onRunQuery } = this.props;
    if (onChange) {
      const nextQuery = { ...query, humioQuery: value };
      onChange(nextQuery);

      if (override && onRunQuery) {
        onRunQuery();
      }
    }
  };

  onChangeRepo = (value: SelectableValue<string>, override?: boolean) => {
    // Send text change to parent
    const { query, onChange, onRunQuery } = this.props;
    if (onChange) {
      const nextQuery = { ...query, humioRepository: value.value };
      onChange(nextQuery);

      if (override && onRunQuery) {
        onRunQuery();
      }
    }
  };

  render() {
    return (
      <div className="query-editor-row" can-collapse="true">
        <div className="gf-form gf-form--grow flex-shrink-1 min-width-15 explore-input-margin">
          <QueryField
            query={this.props.query.humioQuery}
            onChange={this.onChangeQuery}
            onBlur={this.props.onBlur}
            onRunQuery={this.props.onRunQuery}
            placeholder="Enter a Humio query (run with Shift+Enter)"
            portalOrigin="Humio"
          ></QueryField>
        </div>

        <Select
          width={30}
          options={this.state.repositories}
          value={this.props.query.humioRepository}
          onChange={this.onChangeRepo}
        ></Select>
      </div>
    );
  }
}
