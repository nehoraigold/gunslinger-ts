// @ts-ignore
import blessed from 'blessed';

export type BlessedScreen = blessed.Widgets.Screen;
export type BlessedLog = blessed.Widgets.Log;
export type BlessedBox = blessed.Widgets.BoxElement;

export interface ScreenWidgets {
    screen: BlessedScreen;
    narrativeBox: BlessedLog;
    sidebarBox: BlessedBox;
    /** Plain box — content managed manually by InputBar. */
    inputBox: BlessedBox;
}

let widgets: ScreenWidgets | null = null;

export function createScreen(): ScreenWidgets {
    if (widgets) return widgets;

    const screen: BlessedScreen = blessed.screen({
        smartCSR: true,
        title: 'GUNSLINGER',
        fullUnicode: true,
        forceUnicode: true,
    });

    const narrativeBox: BlessedLog = blessed.log({
        parent: screen,
        top: 0,
        left: 0,
        width: '70%',
        height: '100%-3',
        label: ' GUNSLINGER ',
        border: { type: 'line' },
        style: {
            border: { fg: 'white' },
        },
        scrollable: true,
        alwaysScroll: true,
        scrollbar: {
            ch: '│',
            style: { bg: 'blue' },
        },
        keys: false,
        mouse: true,
        tags: true,
        wrap: true,
    });

    const sidebarBox: BlessedBox = blessed.box({
        parent: screen,
        top: 0,
        left: '70%',
        width: '30%',
        height: '100%-3',
        label: ' STATUS ',
        border: { type: 'line' },
        style: {
            border: { fg: 'white' },
        },
        tags: true,
    });

    // Plain box — InputBar handles all keystrokes manually via screen.on('keypress')
    const inputBox: BlessedBox = blessed.box({
        parent: screen,
        bottom: 0,
        left: 0,
        width: '100%',
        height: 3,
        label: ' > ',
        border: { type: 'line' },
        style: {
            border: { fg: 'green' },
        },
        tags: true,
    });

    widgets = { screen, narrativeBox, sidebarBox, inputBox };
    return widgets;
}

export function getScreenWidgets(): ScreenWidgets {
    if (!widgets) throw new Error('Screen not created. Call createScreen() first.');
    return widgets;
}
