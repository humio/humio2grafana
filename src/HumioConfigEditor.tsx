import React, { PureComponent } from 'react';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { DataSourceHttpSettings, LegacyForms } from '@grafana/ui';

const { FormField, SecretFormField, Switch } = LegacyForms;

import { HumioOptions, SecretHumioOptions } from './types';

interface Props extends DataSourcePluginOptionsEditorProps<HumioOptions, SecretHumioOptions> {}

interface State {
  humioToken?: string;
  props: any;
}

export class ConfigEditor extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    console.log(props);

    props.options.jsonData = { ...props.options.jsonData };

    this.state = {
      humioToken: props.options.jsonData.humioToken,
      props: props,
    };
  }

  componentDidMount() {}

  commonHeader() {
    const { options, onOptionsChange } = this.props;
    return (
      <>
        <p>
          With this plugin you may authenticate using one of two overall strategies. Pick the strategy you want to use
          using the toggle below.
        </p>
        <Switch
          label="Authentication Strategy"
          checked={options.jsonData.tokenAuth}
          onChange={_ => {
            onOptionsChange({
              ...options,
              withCredentials: false,
              basicAuth: false,
              basicAuthPassword: '',
              basicAuthUser: '',
              jsonData: {
                ...options.jsonData,
                tokenAuth: !options.jsonData.tokenAuth,
                // TODO: This ensures that we don't try to do the non-token auth, such as using a CACert when using a token. But this also resets parts of the non-token form. Try to find a better way.
                tlsAuth: false,
                tlsSkipVerify: false,
                tlsAuthWithCACert: false,
                oauthPassThru: false,
              },
              secureJsonFields: {},
            });
          }}
        />
        <p></p>
      </>
    );
  }

  onPasswordReset = () => {
    const { options, onOptionsChange } = this.props;
    onOptionsChange({
      ...options,
      jsonData: { ...options.jsonData },
      secureJsonData: {
        humioToken: '',
      },
      secureJsonFields: {
        humioToken: false,
      },
    });
  };

  body() {
    const { options, onOptionsChange } = this.props;
    if (options.jsonData.tokenAuth) {
      return (
        <>
          <h3 className="page-heading">Authenticate With Encrypted API Tokens </h3>
          <p> This authentication strategy allows you to authenticate with a personal API token. </p>
          <p>
            {' '}
            Note that the token is encrypted and stored on Grafana's backend, so you can't access it via the browser
            after entry. This also means that all requests to Humio will be proxied through the Grafana server instance.{' '}
          </p>
          <div className="gf-form-group">
            <div className="gf-form max-width-25">
              <FormField
                labelWidth={10}
                inputWidth={15}
                label="URL"
                value={options.jsonData.baseUrl}
                onChange={newValue =>
                  onOptionsChange({
                    ...options,
                    jsonData: {
                      ...options.jsonData,
                      baseUrl: newValue.currentTarget.value,
                    },
                    secureJsonData: { ...options.secureJsonData },
                  })
                }
                required
              />
            </div>
          </div>
          <div className="gf-form-group">
            <div className="gf-form max-width-25">
              <SecretFormField
                labelWidth={10}
                inputWidth={15}
                label="Token"
                value={options.secureJsonData?.humioToken}
                onChange={newValue =>
                  onOptionsChange({
                    ...options,
                    jsonData: {
                      humioToken: options.jsonData.humioToken,
                      tokenAuth: options.jsonData.tokenAuth,
                      baseUrl: options.jsonData.baseUrl,
                    },
                    secureJsonData: { humioToken: newValue.currentTarget.value },
                  })
                }
                isConfigured={!!(options.secureJsonFields && options.secureJsonFields.humioToken)}
                onReset={this.onPasswordReset}
                required
              />
            </div>
          </div>
        </>
      );
    } else {
      return (
        <>
          <h3 className="page-heading">Authenticate Without API Tokens </h3>
          <p> This authentication strategy allows you to authenticate without an API token. </p>

          <DataSourceHttpSettings
            defaultUrl={'https://cloud.humio.com'}
            dataSourceConfig={options}
            showAccessOptions={false}
            onChange={newValue =>
              onOptionsChange({
                ...newValue,
                jsonData: { ...newValue.jsonData, tokenAuth: false },
              })
            }
          />
        </>
      );
    }
  }

  render() {
    return (
      <>
        {this.commonHeader()}
        {this.body()}
      </>
    );
  }
}
