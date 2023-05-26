import { ChatInputCommandInteraction, Events, Interaction } from "discord.js";
import { SettingsCommand } from "../commands/utility/settings.js";
import { client } from "../index.js";

class InteractionCreateListener {
    static interaction: Interaction;

    static listener() {
        client.on(Events.InteractionCreate, (interaction) => {
            this.interaction = interaction;

            this.#run();
        });
    }

    static #run() {
        this.#handleChatInputCommand();
    }

    static async #handleChatInputCommand() {
        if (!this.interaction.isChatInputCommand()) return;
        const chatInputInteraction = this.interaction as ChatInputCommandInteraction;

        switch (chatInputInteraction.commandName) {
            case 'settings':
                SettingsCommand.run(chatInputInteraction);
                break;

            default:
                chatInputInteraction.reply({ content: 'This command hasn\'t been implemented yet, come back later (*・ω・)ﾉ', ephemeral: true });
                break;
        }
    }
}
InteractionCreateListener.listener();
