import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import type { customClient } from "../..";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with pong!");
export const execute = async (
  interaction: ChatInputCommandInteraction & { client: customClient }
) => {
  console.log("[command] /ping")
  await interaction.reply("Pong!");
};
