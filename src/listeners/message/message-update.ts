import { diffChars } from "diff";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events, Message, PartialMessage, TextBasedChannel, codeBlock } from "discord.js";
import { client } from "../../index.js";
import { BotColors } from "../../lib/config.js";
import { DatabaseUtils, Utils } from "../../lib/utilities.js";

class MessageUpdateListener {
    static oldMessage: Message | PartialMessage;
    static newMessage: Message | PartialMessage;
    static logChannel: TextBasedChannel;

    static listener() {
        client.on(Events.MessageUpdate, (oldMessage, newMessage) => {
            this.oldMessage = oldMessage;
            this.newMessage = newMessage;

            this.#run();
        });
    }

    static async #run() {
        const logChannel = await DatabaseUtils.fetchGuildLogChannel(this.newMessage.guildId);
        const channelHasEventsIgnored = await DatabaseUtils.checkIfChannelHasEventsIgnored(this.newMessage.guildId, this.newMessage.channelId);
        if (logChannel === null || this.newMessage.author?.bot || channelHasEventsIgnored) return;

        this.logChannel = logChannel;
        this.#contentUpdate();
        this.#messageAttachmentRemoved();
    }

    static #contentUpdate() {
        if (this.oldMessage.content === this.newMessage.content) return;
        const contentDifference = diffChars(this.oldMessage.content ?? '', this.newMessage.content ?? '');

        let formattedContentDifference = '';
        for (const difference of contentDifference) {
            if (difference.added) formattedContentDifference = formattedContentDifference.concat(`\u001b[1;32m${difference.value}`);
            else if (difference.removed) formattedContentDifference = formattedContentDifference.concat(`\u001b[1;31m${difference.value}`);
            else formattedContentDifference = formattedContentDifference.concat(`\u001b[0;37m${difference.value}`);
        }

        const embed = new EmbedBuilder()
            .setDescription(`## Message Edited in ${this.newMessage.channel}\n### Changes\n${codeBlock('ansi', formattedContentDifference)}`)
            .setFooter({
                text: `@${this.newMessage.author?.username} • User ID: ${this.newMessage.author?.id}`,
                iconURL: this.newMessage.author?.displayAvatarURL()
            })
            .setTimestamp()
            .setColor(BotColors.Neutral);

        const jumpButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setLabel('Jump To Message')
                .setStyle(ButtonStyle.Link)
                .setURL(this.newMessage.url)
        );

        this.logChannel.send({ embeds: [embed], components: [jumpButton] });
    }

    static async #messageAttachmentRemoved() {
        if (this.oldMessage.attachments.equals(this.newMessage.attachments)) return;
        const embeddableContentTypes = ['image/png', 'image/gif', 'image/webp', 'image/jpeg'];
        const removedAttachment = this.oldMessage.attachments.difference(this.newMessage.attachments);

        const storedAttachment = (await Utils.storeAttachments(removedAttachment)).at(0);
        const embed = new EmbedBuilder()
            .setDescription(`## Message Attachment Removed\nin ${this.newMessage.channel}\n\n### Attachment\n${storedAttachment?.maskedLink}`)
            .setFooter({
                text: `@${this.newMessage.author?.username} • Author ID: ${this.newMessage.author?.id}`,
                iconURL: this.newMessage.author?.displayAvatarURL()
            })
            .setTimestamp()
            .setColor(BotColors.Neutral);

        if (storedAttachment?.link !== '' && embeddableContentTypes.includes(storedAttachment?.type ?? '')) {
            embed.setImage(storedAttachment?.link ?? '');
        }

        const jumpButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setLabel('Jump To Message')
                .setStyle(ButtonStyle.Link)
                .setURL(this.newMessage.url)
        );

        this.logChannel.send({
            embeds: [embed],
            components: [jumpButton]
        });
    }
}
MessageUpdateListener.listener();
