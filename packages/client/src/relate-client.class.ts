import {getParseLaunchTokenPayload} from './utils';
import {APP_LAUNCH_DATA_RESOLVER, DEFAULT_CLIENT_REMOTE} from './constants';

export interface IAppLaunchData {
    accessToken?: string;
    dbms: {
        id: string;
        name: string;
        connectionUri: string;
    };
    principal?: string;
    project?: {
        name: string;
    };
}

export interface IRelateClientConfig {
    clientId: string;
    relateOrigin: string;
    apiToken?: string;
}

export interface IRelateClientParams {
    clientId: string;
    relateOrigin?: string;
    apiToken?: string;
}

export class RelateClient {
    private readonly config: IRelateClientConfig;

    constructor(config: IRelateClientParams) {
        this.config = {
            relateOrigin: config.relateOrigin || DEFAULT_CLIENT_REMOTE,
            ...config,
        };
    }

    getAppLaunchData(launchToken: string): Promise<IAppLaunchData> {
        const payload = getParseLaunchTokenPayload(this.config.clientId, launchToken);
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Client-Id': this.config.clientId,
        };

        if (this.config.apiToken) {
            headers['X-API-Token'] = this.config.apiToken;
        }

        return fetch(this.config.relateOrigin, {
            body: JSON.stringify(payload),
            headers,
            method: 'POST',
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed');
                }

                return res.json();
            })
            .then(({data}) => data)
            .then((data) => {
                if (!data[APP_LAUNCH_DATA_RESOLVER]) {
                    throw new Error('Unable to parse App Launch Token');
                }

                return data[APP_LAUNCH_DATA_RESOLVER];
            });
    }
}
