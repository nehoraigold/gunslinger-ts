import { SaveController } from '../../app/save';
import { InvalidGameDataError, InvalidSlotNameError } from '../../persistence';

const INVALID_NAME_MESSAGE = "Invalid save name — use letters, digits, '-' or '_'.";

export class MetaCommandHandler {
    constructor(
        private readonly saves: SaveController,
        private readonly output: (line: string) => void,
        private readonly onLoad: () => void,
    ) {}

    async handle(input: string): Promise<boolean> {
        const [command, ...rest] = input.split(/\s+/);
        const argument = rest.join(' ');
        switch (command.toLowerCase()) {
            case 'save':
                await this.save(argument);
                return true;
            case 'load':
                await this.load(argument);
                return true;
            case 'saves':
                await this.listSaves();
                return true;
            default:
                return false;
        }
    }

    private async save(name: string): Promise<void> {
        try {
            if (name) {
                this.saves.setCurrentSlotName(name);
            }
            await this.saves.save();
            this.output(`Saved to "${this.saves.currentSlotName()}".`);
        } catch (error) {
            if (error instanceof InvalidSlotNameError) {
                this.output(INVALID_NAME_MESSAGE);
                return;
            }
            throw error;
        }
    }

    private async load(name: string): Promise<void> {
        if (!name) {
            this.output('Load which save? Try "saves" to list them.');
            return;
        }
        try {
            const result = await this.saves.load(name);
            if (result.status === 'loaded') {
                this.onLoad();
                this.output(`Loaded "${name}". Current room: ${result.roomId}`);
            } else {
                this.output(`No save named "${name}".`);
            }
        } catch (error) {
            if (error instanceof InvalidSlotNameError) {
                this.output(INVALID_NAME_MESSAGE);
                return;
            }
            if (error instanceof InvalidGameDataError) {
                this.output(`Could not load "${name}": ${error.message}`);
                return;
            }
            throw error;
        }
    }

    private async listSaves(): Promise<void> {
        const { names, current } = await this.saves.list();
        this.output(
            names.length === 0
                ? 'No saves yet.'
                : `Saves: ${names.map((name) => (name === current ? `${name} (current)` : name)).join(', ')}`,
        );
    }
}
