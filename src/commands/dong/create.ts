import {
  Attachment,
  AttachmentBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import type { customClient } from "../..";
import { createDong } from "../../lib/dong-io";
import { download } from "../../lib/download";

export const data = new SlashCommandBuilder()
  .setName("create")
  .setDescription("Create a dong file!")
  .addAttachmentOption((opt) =>
    opt
      .setName("image")
      .setDescription("The image of the dong file")
      .setRequired(true)
  )
  .addAttachmentOption((opt) =>
    opt
      .setName("audio")
      .setDescription("The audio of the dong file")
      .setRequired(true)
  )
  .addStringOption((opt) =>
    opt
      .setName("name")
      .setDescription("Filename of the dong file")
      .setRequired(true)
  );
export const execute = async (
  interaction: ChatInputCommandInteraction & { client: customClient }
) => {
  const filename = interaction.options.getString("name", true) + ".dong";
  const image = interaction.options.getAttachment("image", true);
  const audio = interaction.options.getAttachment("audio", true);

  if (!image.contentType?.startsWith("image/")) {
    await interaction.reply("Image is not a valid image!");
    return;
  }
  if (!audio.contentType?.startsWith("audio/")) {
    await interaction.reply("Audio is not a valid audio!");
    return;
  }

  await interaction.deferReply();

  let downloaded = {
    image: await download(image),
    audio: await download(audio),
  };
  console.log(downloaded);

  const dong = new File(
    [await createDong(downloaded.image, downloaded.audio)],
    filename,
    { type: "application/prs.vielle.dong" }
  );
  console.log(dong);

  await interaction.editReply({
    files: [
      new AttachmentBuilder(Buffer.from(await dong.arrayBuffer()), {
        name: dong.name,
      }),
    ],
  });
};
