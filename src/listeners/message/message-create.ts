import { Events, Message } from "discord.js";
import { client } from "../../index.js";
import { ChannelIDs, Emotes, UserIDs } from "../../lib/config.js";
import { DatabaseUtils, Utils } from "../../lib/utilities.js";

class MessageCreateListener {
    static message: Message;
    static listener() {
        client.on(Events.MessageCreate, (message) => {
            this.message = message;

            this.#run();
        });
    }

    static async #run() {
        const channelHasEventsIgnored = await DatabaseUtils.checkIfChannelHasEventsIgnored(this.message.guildId, this.message.channelId);
        if (this.message.author.bot || channelHasEventsIgnored) return;

        this.#arson();
        this.#bonkAkia();
        this.#autoCrosspost();
        this.#painAuChocolat();
        // TODO: RANKING STUFF
    }

    // React with the :arson: emoji if the message contains "arson"
    static async #arson() {
        const messageContainsArson = this.message.content.search(/(?<!\S)[a]+[r]+[s]+[o]+[n]+/mi) !== -1;
        if (!messageContainsArson) return;

        await this.message.react(Emotes.Arson)
            .then(() => Utils.log('Reacted with Arson!', true))
            .catch((e) => Utils.log('An error occurred while reacting to a message!', false, e));
    }

    // React with the :akiaBonque: emoji and say "NO SORRY" if the message contains "sorry" and is sent by Akia
    static async #bonkAkia() {
        const messageContainsSorry = this.message.content.search(/[s]+[o]+[r]+[y]+/mi) !== -1;
        const authorIsAkia = this.message.author.id === UserIDs.Akialyne;
        if (!messageContainsSorry || !authorIsAkia) return;

        await this.message.react(Emotes.Bonque)
            .then(() => Utils.log('Reacted with Bonque!', true))
            .catch((e) => Utils.log('An error occurred while reacting to a message!', false, e));
        await this.message.reply(`NO SORRY ${Emotes.Bonque}`)
            .then(() => Utils.log('Replied with "NO SORRY"!', true))
            .catch((e) => Utils.log('An error occurred while replying to a message!', false, e));
    }

    // Automatically crosspost any message sent in Announcement channels
    static async #autoCrosspost() {
        if (!this.message.crosspostable) return;

        await this.message.crosspost()
            .then(() => Utils.log('Crossposted message!', true))
            .catch((e) => Utils.log('An error occurred while crossposting a message!', false, e));
    }

    // Say "au chocolat?" if the message ends with "pain" and is sent in #🤡-memes-🤡
    static async #painAuChocolat() {
        const messageEndsWithPain = this.message.content.search(/\bpain\W{0,}$/i) !== -1;
        const channelIsMemes = this.message.channelId === ChannelIDs.Memes;
        if (!messageEndsWithPain || !channelIsMemes) return;

        await this.message.reply('au chocolat?')
            .then(() => Utils.log('Replied with "au chocolat?"!', true))
            .catch((e) => Utils.log('An error occurred while replying to a message!', false, e));
    }
}
MessageCreateListener.listener();
