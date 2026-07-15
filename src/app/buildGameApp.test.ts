import { describe, it } from 'mocha';
import { expect } from 'chai';

import { buildGameApp } from './buildGameApp';

describe(buildGameApp.name, () => {
    it('should build a fully-wired GameApp from config, without any network calls', () => {
        const app = buildGameApp({ ollamaModel: 'test-model', saveDir: './does-not-matter' });

        expect(app.saveController).to.exist;
        expect(app.gameMaster).to.exist;
        expect(app.currentRoomId()).to.exist;
    });

    it('should start the session in the sample world entrance room', () => {
        const app = buildGameApp({ ollamaModel: 'test-model', saveDir: './does-not-matter' });

        expect(app.currentRoomId()).to.equal('entrance');
    });
});
