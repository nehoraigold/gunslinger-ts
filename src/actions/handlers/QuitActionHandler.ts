//region imports
import { exit } from "process";
import { IActionHandler } from "../../types/actions/IActionHandler";
import { GetUserInput } from "../../utils/utils";
import { Print } from "../../utils/print";
//endregion

export class QuitActionHandler implements IActionHandler {
    private AFFIRMATIVE_WORDS: Array<string> = ["y", "yes"];

    async Handle(): Promise<void> {
        const confirmation = await GetUserInput("Are you sure you want to quit?");
        if (this.AFFIRMATIVE_WORDS.includes(confirmation)) {
            exit(0);
        } else {
            Print.NewLine();
        }
    }
}
