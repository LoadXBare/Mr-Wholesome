import { ButtonHandler } from "@buttons/button-handler.js";
import { database } from "@lib/config.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionOverwriteOptions, Role, userMention } from "discord.js";

export class createTicketButtonHandler extends ButtonHandler {
  async handle() {
    await this.interaction.deferReply({ ephemeral: true });
    const ticketPanelName = this.interaction.customId.split(':')[2];
    const ticketPanel = await database.ticketPanel.findUnique({ where: { name_guildID: { name: ticketPanelName, guildID: this.guild.id } } });
    if (!ticketPanel) {
      await this.interaction.editReply({ content: 'Ticket panel not found.' });
      return;
    }

    const user = this.interaction.user;
    const moderatorRole = await this.guild.roles.fetch(ticketPanel.moderatorRoleID) as Role; // TODO:handle errors
    const authorID = user.id;
    const timeCreated = Date.now().toString();

    const closeTicketButton = new ButtonBuilder()
      .setCustomId(`ticket:close:${timeCreated}`)
      .setLabel('Close Ticket')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Secondary);
    const closeTicketActionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(closeTicketButton);

    const permissionOverwrites: PermissionOverwriteOptions = { AttachFiles: true, SendMessages: true, ReadMessageHistory: true, ViewChannel: true };
    const ticketChannel = await this.guild.channels.create({ name: `❌${user.username}`, type: ChannelType.GuildText, parent: ticketPanel.categoryID });
    await ticketChannel.permissionOverwrites.create(user, permissionOverwrites);
    await ticketChannel.permissionOverwrites.create(moderatorRole, permissionOverwrites);

    const formattedJSON = ticketPanel.ticketEmbedJSON.replace('{user}', userMention(user.id));
    const ticketEmbed = JSON.parse(formattedJSON);
    await ticketChannel.send({ embeds: [ticketEmbed], components: [closeTicketActionRow] });

    const channelID = ticketChannel.id;
    await database.ticket.create({ data: { authorID, channelID, ticketPanelName, timeCreated } });

    await this.interaction.editReply({ content: `✅ Ticket created in ${ticketChannel}` });
  }
}
