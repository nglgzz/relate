import {app} from 'electron';

export const ELECTRON_IS_READY = new Promise((resolve) => {
    if (typeof app.isReady === 'function' && app.isReady()) {
        resolve();
        return;
    }

    app.once('ready', () => {
        resolve();
    });
});
