import { Action } from '../../../engine/action';
import { ActionResolver } from '../../dispatch';
import { ToolAdvertiser, ToolCatalogEntry } from './ToolAdvertiser';
import { ToolDefinition } from './ToolDefinition';

export class ActionToolCatalog implements ActionResolver, ToolAdvertiser {
    constructor(private readonly entries: Readonly<Record<string, ToolCatalogEntry>>) {}

    listDefinitions(): ToolDefinition[] {
        return Object.entries(this.entries).map(([name, entry]) => ({
            name,
            description: entry.description,
            inputSchema: entry.action.schema.toJsonSchema(),
        }));
    }

    resolve(name: string): Action<any, any> | undefined {
        return this.entries[name]?.action;
    }
}
