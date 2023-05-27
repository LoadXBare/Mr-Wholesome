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
        this.#messageDeleted();
    }

    static async #messageDeleted() {
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

        let embedDescription = `## Message Deleted in ${this.message.channel}\n### Deleted by ${userWhoDeletedMessage}`;
        const embed = new EmbedBuilder()
            .setFooter({
                text: `@${this.message.author?.username} • Author ID: ${this.message.author?.id}`,
                iconURL: this.message.author?.displayAvatarURL()
            })
            .setTimestamp()
            .setColor(BotColors.Negative);

        if (this.message.content !== '') {
            embedDescription = embedDescription.concat(`\n### Message\n${this.message.content}`);
        }

        if (storedAttachments.length === 1) {
            const storedAttachment = storedAttachments.at(0);
            embedDescription = embedDescription.concat(`\n### Attachment\n${storedAttachment?.maskedLink}`);

            if (storedAttachment?.link !== '' && embeddableContentTypes.includes(storedAttachment?.type ?? '')) {
                embed.setImage(storedAttachment?.link ?? '');
            }
        }
        else if (storedAttachments.length > 1) {
            embedDescription = embedDescription.concat(`\n### Attachments${storedAttachments.map((a) => `\n- ${a.maskedLink}`).join('')}`);
        }

        embed.setDescription(embedDescription);

        this.logChannel.send({ embeds: [embed] });
    }
}
MessageDeleteListener.listener();
