import { Action } from '../../../engine/action';
import { ToolDefinition } from './ToolDefinition';

export interface ToolCatalogEntry {
    readonly action: Action<any, any>;
    readonly description: string;
}

export interface ToolCatalog {
    listDefinitions(): ToolDefinition[];
    find(name: string): ToolCatalogEntry | undefined;
}
