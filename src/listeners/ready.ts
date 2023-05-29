import { Client, Events } from "discord.js";
import { client } from "../index.js";
import { EventHandler } from "../lib/config.js";
import { Utils } from "../lib/utilities.js";

class ReadyHandler extends EventHandler {
	client: Client;

	constructor(client: Client) {
		super();
		this.client = client;
		this.#handle();
	}

	#handle() {
		this.#logBotReady();
	}

	#logBotReady() {
		Utils.log(`Logged in as ${this.client.user?.tag}! [${this.client.user?.id}]`, true);
	}
}

client.once(Events.ClientReady, (client) => {
	new ReadyHandler(client);
});
