import { diffChars } from "diff";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events, Message, PartialMessage, codeBlock } from "discord.js";
import { client } from "../../index.js";
import { EmbedColours, EventHandler } from "../../lib/config.js";
import { DatabaseUtils, Utils } from "../../lib/utilities.js";

class MessageUpdateHandler extends EventHandler {
    oldMessage: Message | PartialMessage;
    newMessage: Message | PartialMessage;

    constructor(oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) {
        super();
        this.oldMessage = oldMessage;
        this.newMessage = newMessage;
        this.#handle();
    }

    async #handle() {
        const channelHasEventsIgnored = await DatabaseUtils.checkIfChannelHasEventsIgnored(this.newMessage.guildId, this.newMessage.channelId);
        if (this.newMessage.author?.bot || channelHasEventsIgnored) return;

        this.#logEditedMessage();
        this.#logRemovedMessageAttachment();
    }

    #logEditedMessage() {
        if (this.oldMessage.content === this.newMessage.content) return;
        const contentDifference = diffChars(this.oldMessage.content ?? '', this.newMessage.content ?? '');

        const formattedContentDifference: Array<string> = [];
        for (const difference of contentDifference) {
            if (difference.added) formattedContentDifference.push(`\u001b[1;32m${difference.value}`);
            else if (difference.removed) formattedContentDifference.push(`\u001b[1;31m${difference.value}`);
            else formattedContentDifference.push(`\u001b[0;37m${difference.value}`);
        }

        const embedDescription = [
            `## Message Edited in ${this.newMessage.channel}`,
            '### Changes',
            codeBlock('ansi', formattedContentDifference.join(''))
        ].join('\n');

        const embed = new EmbedBuilder()
            .setDescription(embedDescription)
            .setFooter({
                text: `@${this.newMessage.author?.username} • User ID: ${this.newMessage.author?.id}`,
                iconURL: this.newMessage.author?.displayAvatarURL()
            })
            .setTimestamp()
            .setColor(EmbedColours.Neutral);

        const jumpButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setLabel('Jump To Message')
                .setStyle(ButtonStyle.Link)
                .setURL(this.newMessage.url)
        );

        super.logChannel.send({ embeds: [embed], components: [jumpButton] }); // TODO: alert if user on watchlist
    }

    async #logRemovedMessageAttachment() {
        if (this.oldMessage.attachments.size === this.newMessage.attachments.size) return;
        const embeddableContentTypes = ['image/png', 'image/gif', 'image/webp', 'image/jpeg'];
        const removedAttachment = this.oldMessage.attachments.difference(this.newMessage.attachments);

        const storedAttachment = (await Utils.storeAttachments(removedAttachment)).at(0);
        const embedDescription = [
            '## Message Attachment Removed',
            `### in ${this.newMessage.channel}`,
            '### Attachment',
            storedAttachment?.maskedLink
        ].join('\n');

        const embed = new EmbedBuilder()
            .setDescription(embedDescription)
            .setFooter({
                text: `@${this.newMessage.author?.username} • Author ID: ${this.newMessage.author?.id}`,
                iconURL: this.newMessage.author?.displayAvatarURL()
            })
            .setTimestamp()
            .setColor(EmbedColours.Neutral);

        if (storedAttachment?.link !== '' && embeddableContentTypes.includes(storedAttachment?.type ?? '')) {
            embed.setImage(storedAttachment?.link ?? '');
        }

        const jumpButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setLabel('Jump To Message')
                .setStyle(ButtonStyle.Link)
                .setURL(this.newMessage.url)
        );

        super.logChannel.send({ embeds: [embed], components: [jumpButton] }); // TODO: alert if user on watchlist
    }
}

client.on(Events.MessageUpdate, (oldMessage, newMessage) => {
    new MessageUpdateHandler(oldMessage, newMessage);
});
