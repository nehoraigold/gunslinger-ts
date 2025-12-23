//region imports
import { exit } from "process";
import { IActionHandler } from "./IActionHandler";
import { GetUserInput } from "../../utils/utils";
import { Print } from "../../utils/print";
import { ActionType } from "../ActionType";
//endregion

export class QuitActionHandler implements IActionHandler<ActionType.QUIT> {
    private AFFIRMATIVE_WORDS: Array<string> = ["y", "yes"];

    async handle(): Promise<void> {
        const confirmation = await GetUserInput("Are you sure you want to quit?");
        if (this.AFFIRMATIVE_WORDS.includes(confirmation)) {
            exit(0);
        } else {
            Print.NewLine();
        }
    }
}
