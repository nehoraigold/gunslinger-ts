import { Action } from '../../engine/action';

export interface ActionResolver {
    resolve(name: string): Action<any, any> | undefined;
}
