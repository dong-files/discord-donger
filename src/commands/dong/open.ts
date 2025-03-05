import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type { customClient } from "../..";

export const data = new SlashCommandBuilder()
  .setName("open")
  .setDescription("Open a dong file!")
  .addAttachmentOption((opt) =>
    opt
      .setName("dong")
      .setDescription("The dong file")
      .setRequired(true)
  );
export const execute = async (
  interaction: ChatInputCommandInteraction & { client: customClient }
) => {
  await interaction.reply("Not Implemented!");
};
