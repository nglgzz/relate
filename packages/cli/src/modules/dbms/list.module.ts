import {OnApplicationBootstrap, Module, Inject} from '@nestjs/common';
import cli from 'cli-ux';

import {SystemModule, SystemProvider} from '@relate/common';
import ListCommand from '../../commands/dbms/list';

@Module({
    exports: [],
    imports: [SystemModule],
    providers: [],
})
export class ListModule implements OnApplicationBootstrap {
    constructor(
        @Inject('PARSED_PROVIDER')
        protected readonly parsed: ParsedInput<typeof ListCommand>,
        @Inject('UTILS_PROVIDER') protected readonly utils: CommandUtils,
        @Inject(SystemProvider) protected readonly systemProvider: SystemProvider,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        const {flags} = this.parsed;
        const environment = await this.systemProvider.getEnvironment(flags.environment);

        return environment.dbmss.list().then((dbmss) => {
            cli.table(
                dbmss.toArray(),
                {
                    id: {},
                    name: {},
                    description: {},
                    tags: {get: (dbms) => dbms.tags.join(', ')},
                },
                {
                    printLine: this.utils.log,
                    ...flags,
                },
            );
        });
    }
}
