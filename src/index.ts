import {
  ChatInputCommandInteraction,
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  MessageFlags,
  type Interaction,
} from "discord.js";
// import { Glob } from "bun";
import { glob } from "glob";
import "dotenv/config";
import path from "node:path";

console.log(process.env);

const token = process.env.token ?? process.env.TOKEN;
if (!token)
  throw new Error(
    'Token required. Please fill in TOKEN in .env (TOKEN = "' + token + '")'
  );
console.log("Token Valid!");

const __dirname = import.meta.dirname;

// client typing
export type customClient = Client & {
  // add command typing
  commands: Collection<
    string,
    {
      data: { name: string };
      execute: (
        interaction: ChatInputCommandInteraction & { client: customClient }
      ) => Promise<void>;
    }
  >;
};
// new client
const client: customClient = new Client({
  intents: [GatewayIntentBits.Guilds],
  // as customclient as i cannot add .commands till this is done
}) as customClient;

// setup commands
client.commands = new Collection();
for (const file of await glob("src/commands/**/*.{ts,js}", {
  ignore: "node_modules",
})) {
  console.log(file, path.join(__dirname, "..", file));
  const command = await import("file:///" + path.join(__dirname, "..", file));
  // check command contains all required properties
  if (
    "data" in command &&
    "execute" in command &&
    typeof command.data === "object" &&
    command.data !== null &&
    "name" in command.data &&
    typeof command.data.name === "string"
  ) {
    client.commands.set(command.data.name, command);
    console.log("[loaded]", file);
  } else {
    // log missing features
    console.log(`[WARNING] ${file} is not a valid command!`, command);
  }
}

// when client is ready do this once
client.once(Events.ClientReady, (ready) => {
  console.log(`Ready! Logged in as ${ready.user.tag}`);
});

// _interaction so we can cast types properly
// we need access to client.commands
// we could just do it as a global but this makes it go wherever the command goes soooo
client.on(Events.InteractionCreate, async (_interaction) => {
  const interaction = _interaction as Interaction & { client: customClient };
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`No command ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (e) {
    console.error(e);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

client.login(token);
