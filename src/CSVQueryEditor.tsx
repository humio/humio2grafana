import React, { PureComponent } from 'react';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { Select, QueryField } from '@grafana/ui';
import { HumioDataSource, CSVQuery } from './CSVDataSource';
import { HumioOptions } from './types';
import IDatasourceRequestOptions from './Interfaces/IDatasourceRequestOptions';
import HumioHelper from './humio/humio_helper';
import _ from 'lodash';

type Props = QueryEditorProps<HumioDataSource, CSVQuery, HumioOptions>;

interface State {
  repositories: any;
  datasource: HumioDataSource;
  hostUrl: string;
}

export class QueryEditor extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      repositories: [],
      datasource: props.datasource,
      hostUrl: '',
    };
  }

  componentDidMount() {
    let requestOpts: IDatasourceRequestOptions = {
      method: 'POST',
      url: this.state.datasource.graphql_endpoint,
      data: { query: '{searchDomains{name}}' },
      headers: this.state.datasource.headers,
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

    fetch('/api/datasources/' + this.state.datasource.id)
      .then(res => res.json())
      .then((res: any) => {
        console.log(res);
        let url = res.url;
        console.log(this.state.datasource);
        // Trim off the last / if it exists. Otherwise later url concatinations will be incorrect.
        if (url[url.length - 1] === '/') {
          url = url.substring(0, url.length - 1);
        }

        this.setState({
          hostUrl: url,
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

  private _composeQueryArgs() {
    let isLive = HumioHelper.queryIsLive(location, this.state.datasource.timeRange.raw.to);

    var queryParams: { [k: string]: any } = { query: this.props.query.humioQuery, live: isLive };

    if (isLive) {
      queryParams['start'] = HumioHelper.parseDateFrom(this.state.datasource.timeRange.raw.from);
    } else {
      queryParams['start'] = this.state.datasource.timeRange.from._d.getTime();
      queryParams['end'] = this.state.datasource.timeRange.to._d.getTime();
    }

    return queryParams;
  }

  private _serializeQueryArgs(queryArgs: any) {
    let str = [];
    for (let argument in queryArgs) {
      str.push(encodeURIComponent(argument) + '=' + encodeURIComponent(queryArgs[argument]));
    }
    return str.join('&');
  }

  getHumioLink() {
    if (this.state.hostUrl === '') {
      return '#';
    } else {
      let queryParams = this._composeQueryArgs();
      return `${this.state.hostUrl}/${this.props.query.humioRepository}/search?${this._serializeQueryArgs(
        queryParams
      )}`;
    }
  }

  renderHumioLink() {
    if (this.state.datasource.timeRange && this.props.query.humioRepository) {
      return <a href={this.getHumioLink()}> Open query in Humio </a>;
    } else {
      return <div></div>;
    }
  }

  render() {
    return (
      <div className="query-editor-row" can-collapse="true">
        {this.renderHumioLink()}
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
