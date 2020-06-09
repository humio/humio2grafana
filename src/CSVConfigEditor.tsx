import React, { PureComponent } from 'react';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { DataSourceHttpSettings, LegacyForms } from '@grafana/ui';
const { FormField } = LegacyForms;

import { HumioOptions } from './types';

interface Props extends DataSourcePluginOptionsEditorProps<HumioOptions> {}

interface State {
  humioToken?: string;
  props: any;
}

export class ConfigEditor extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      humioToken: props.options.jsonData.humioToken,
      props: props,
    };
  }

  componentDidMount() {}

  render() {
    const { options, onOptionsChange } = this.props;

    return (
      <>
        <DataSourceHttpSettings
          defaultUrl={'https://cloud.humio.com'}
          dataSourceConfig={options}
          showAccessOptions={false}
          onChange={onOptionsChange}
        />

        <h3 className="page-heading">Password</h3>
        <div className="gf-form-group">
          <div className="gf-form-inline">
            <div className="gf-form max-width-25">
              <FormField
                labelWidth={10}
                inputWidth={15}
                label="Token"
                value={options.jsonData.humioToken}
                onChange={newValue =>
                  onOptionsChange({
                    ...options,
                    jsonData: { humioToken: newValue.currentTarget.value },
                  })
                }
                required
              />
            </div>
          </div>
        </div>
      </>
    );
  }
}
