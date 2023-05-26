import { Client, Events } from "discord.js";
import { client } from "../index.js";
import { Utils } from "../lib/utilities.js";

class ReadyListener {
	static client: Client;

	static listener() {
		client.once(Events.ClientReady, (client) => {
			this.client = client;

			this.#run();
		});
	}

	static #run() {
		Utils.log(`Logged in as ${this.client.user?.tag}! [${this.client.user?.id}]`, true);
	}
}
ReadyListener.listener();
