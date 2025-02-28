import { Message } from "discord.js";
import { database } from "./config.js";
import { styleLog } from "./utilities.js";

export default class MessageStatisticsHandler {
  private message: Message;

  public constructor(message: Message) {
    this.message = message;
  }

  public async handle() {
    const { messageCount, messagesPerHour } = await this.fetchMemberStats();
    const parsedMessagesPerHour = this.parseHourlyMessages(messagesPerHour);

    const updatedMessageCount = messageCount + 1;
    const currentUTCHour = new Date().getUTCHours();
    if (typeof parsedMessagesPerHour.at(currentUTCHour) !== 'undefined') parsedMessagesPerHour[currentUTCHour] += 1;
    else styleLog(`Message count undefined at current UTC hour (${currentUTCHour}) for ${this.message.author.username} (${this.message.author.id})`, false, 'message-statistics-handler.js');

    const stringifiedMessagesPerHour = this.stringifyHourlyMessages(parsedMessagesPerHour);
    await this.updateMemberStats(updatedMessageCount, stringifiedMessagesPerHour);
  }

  private parseHourlyMessages(messagesPerHourString: string) {
    const parsedMessagesPerHour = JSON.parse(messagesPerHourString) as Array<number>;
    return parsedMessagesPerHour;
  }

  private stringifyHourlyMessages(messagesPerHourArray: Array<number>) {
    const stringifiedMessagesPerHour = JSON.stringify(messagesPerHourArray);
    return stringifiedMessagesPerHour;
  }

  private async fetchMemberStats() {
    const memberStats = await database.memberStats.findUnique({
      where: {
        userID_guildID: {
          guildID: this.message.guildId!,
          userID: this.message.author.id
        }
      }
    });

    if (memberStats) return memberStats;

    const createdMemberStats = await this.createMemberStats();
    return createdMemberStats;
  }

  private async createMemberStats() {
    const memberStats = await database.memberStats.create({
      data: {
        guildID: this.message.guildId!,
        messagesPerHour: JSON.stringify(new Array(24).fill(0)),
        userID: this.message.author.id
      }
    });

    return memberStats;
  }

  private async updateMemberStats(messageCount: number, messagesPerHour: string) {
    const updatedMemberStats = await database.memberStats.update({
      where: {
        userID_guildID: {
          guildID: this.message.guildId!,
          userID: this.message.author.id
        }
      },
      data: {
        messageCount,
        messagesPerHour
      }
    });

    return updatedMemberStats;
  }
}
