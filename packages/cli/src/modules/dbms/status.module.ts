import {OnApplicationBootstrap, Module, Inject} from '@nestjs/common';
import cli from 'cli-ux';

import {SystemModule, SystemProvider} from '@relate/common';
import {readStdinArray, isTTY} from '../../stdin';

@Module({
    exports: [],
    imports: [SystemModule],
    providers: [],
})
export class StatusModule implements OnApplicationBootstrap {
    static DEFAULT_ACCOUNT_ID = 'foo';

    constructor(
        @Inject('PARSED_PROVIDER') protected readonly parsed: ParsedInput<any>,
        @Inject('UTILS_PROVIDER') protected readonly utils: CommandUtils,
        @Inject(SystemProvider) protected readonly systemProvider: SystemProvider,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        const account = this.systemProvider.getAccount(StatusModule.DEFAULT_ACCOUNT_ID);
        const dbmss = await account.listDbmss();
        let dbmsIds = this.parsed.argv;

        if (!dbmsIds.length) {
            if (isTTY()) {
                dbmsIds = dbmss.map((dbms) => dbms.id);
            } else {
                const stdinDbmss = await readStdinArray();
                dbmsIds = stdinDbmss;
            }
        }

        return account.statusDbmss(dbmsIds).then((res: string[]) => {
            const table = res.map((status, index) => {
                const dbms = dbmss.find((d) => d.id === dbmsIds[index]) || {
                    id: '',
                    name: '',
                };

                return {
                    id: dbms.id,
                    name: dbms.name,
                    status: status.trim(),
                };
            });

            cli.table(
                table,
                {
                    id: {},
                    name: {},
                    status: {},
                },
                {
                    printLine: this.utils.log,
                    ...this.parsed.flags,
                },
            );
        });
    }
}