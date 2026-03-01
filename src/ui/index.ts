import { createScreen, BlessedScreen } from './screen';
import { NarrativePanel } from './NarrativePanel';
import { Sidebar } from './Sidebar';
import { InputBar } from './InputBar';
import { SystemMenu } from './modals/SystemMenu';
import { InventoryModal } from './modals/InventoryModal';
import { DialogueModal } from './modals/DialogueModal';
import { TradeModal } from './modals/TradeModal';
import { StartMenu } from './modals/StartMenu';

export interface UIModals {
    system: SystemMenu;
    inventory: InventoryModal;
    dialogue: DialogueModal;
    trade: TradeModal;
    startMenu: StartMenu;
}

export interface UI {
    screen: BlessedScreen;
    narrative: NarrativePanel;
    sidebar: Sidebar;
    input: InputBar;
    modals: UIModals;
}

let uiInstance: UI | null = null;

export function initUI(): UI {
    if (uiInstance) return uiInstance;

    const { screen, narrativeBox, sidebarBox, inputBox } = createScreen();

    const narrative = new NarrativePanel(narrativeBox, screen);
    const sidebar = new Sidebar(sidebarBox, screen);
    const input = new InputBar(inputBox, screen);
    const modals: UIModals = {
        system: new SystemMenu(screen),
        inventory: new InventoryModal(screen),
        dialogue: new DialogueModal(screen),
        trade: new TradeModal(screen),
        startMenu: new StartMenu(screen),
    };

    // Handle Ctrl+C to exit cleanly
    screen.key(['C-c'], () => {
        screen.destroy();
        process.exit(0);
    });

    uiInstance = { screen, narrative, sidebar, input, modals };
    return uiInstance;
}

export function getUI(): UI {
    if (!uiInstance) throw new Error('UI not initialized. Call initUI() first.');
    return uiInstance;
}
