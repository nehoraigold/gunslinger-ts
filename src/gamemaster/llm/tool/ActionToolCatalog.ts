import { ToolCatalog, ToolCatalogEntry } from './ToolCatalog';
import { ToolDefinition } from './ToolDefinition';

export class ActionToolCatalog implements ToolCatalog {
    constructor(private readonly entries: Readonly<Record<string, ToolCatalogEntry>>) {}

    listDefinitions(): ToolDefinition[] {
        return Object.entries(this.entries).map(([name, entry]) => ({
            name,
            description: entry.description,
            inputSchema: entry.action.schema.toJsonSchema(),
        }));
    }

    find(name: string): ToolCatalogEntry | undefined {
        return this.entries[name];
    }
}
