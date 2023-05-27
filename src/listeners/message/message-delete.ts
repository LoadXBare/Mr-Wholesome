import { AuditLogEvent, EmbedBuilder, Events, Message, PartialMessage, TextBasedChannel } from "discord.js";
import { client } from "../../index.js";
import { BotColors } from "../../lib/config.js";
import { DatabaseUtils, Utils } from "../../lib/utilities.js";

class MessageDeleteListener {
    static message: Message | PartialMessage;
    static logChannel: TextBasedChannel;

    static listener() {
        client.on(Events.MessageDelete, (message) => {
            this.message = message;

            this.#run();
        });
    }

    static async #run() {
        const logChannel = await DatabaseUtils.fetchGuildLogChannel(this.message.guildId);
        if (logChannel === null) return;

        this.logChannel = logChannel;
        this.#logDeletedMessage();
    }

    static async #logDeletedMessage() {
        const embeddableContentTypes = ['image/png', 'image/gif', 'image/webp', 'image/jpeg'];
        const removedAttachments = this.message.attachments;
        const storedAttachments = await Utils.storeAttachments(removedAttachments);
        const messageDeleteAuditLogs = await this.message.guild?.fetchAuditLogs({ type: AuditLogEvent.MessageDelete, limit: 1 });
        const latestMessageDeleteAuditLog = messageDeleteAuditLogs?.entries.at(0);
        let userWhoDeletedMessage = this.message.author;

        if (latestMessageDeleteAuditLog !== undefined // Audit log exists
            && latestMessageDeleteAuditLog.targetId === this.message.author?.id // Audit log target is message author
            && (Date.now() - 10000) < latestMessageDeleteAuditLog.createdTimestamp // Audit log created in last 10 seconds
        ) {
            userWhoDeletedMessage = latestMessageDeleteAuditLog.executor;
        }

        const embedDescription = [
            `## Message Deleted in ${this.message.channel}`,
            `### Deleted by ${userWhoDeletedMessage}`
        ];

        const embed = new EmbedBuilder()
            .setFooter({
                text: `@${this.message.author?.username} • Author ID: ${this.message.author?.id}`,
                iconURL: this.message.author?.displayAvatarURL()
            })
            .setTimestamp()
            .setColor(BotColors.Negative);

        if (this.message.content !== '') {
            embedDescription.push('### Message', this.message.content ?? '');
        }

        if (storedAttachments.length === 1) {
            const storedAttachment = storedAttachments.at(0)!;
            embedDescription.push('### Attachment', storedAttachment.maskedLink);

            if (storedAttachment.link !== '' && embeddableContentTypes.includes(storedAttachment.type)) {
                embed.setImage(storedAttachment.link);
            }
        }
        else if (storedAttachments.length > 1) {
            embedDescription.push('### Attachments', storedAttachments.map((a) => `- ${a.maskedLink}`).join('\n'));
        }

        embed.setDescription(embedDescription.join('\n'));

        this.logChannel.send({ embeds: [embed] });
    }
}
MessageDeleteListener.listener();
