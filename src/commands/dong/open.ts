import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import type { customClient } from "../..";
import { download } from "../../lib/download";
import { readDong } from "../../lib/dong-io";
import { Mime } from "mime";
import standardTypes from "mime/types/standard.js";
import otherTypes from "mime/types/other.js";

const mime = new Mime(standardTypes, otherTypes);
mime.define({ "audio/mpeg": ["mp3"] });

export const data = new SlashCommandBuilder()
  .setName("open")
  .setDescription("Open a dong file!")
  .addAttachmentOption((opt) =>
    opt.setName("dong").setDescription("The dong file").setRequired(true)
  );
export const execute = async (
  interaction: ChatInputCommandInteraction & { client: customClient }
) => {
  const dong = interaction.options.getAttachment("dong", true);
  await interaction.deferReply({flags: MessageFlags.Ephemeral});

  const downloadedDong = await download(dong);

  const output = await readDong(downloadedDong);
  if (typeof output === "string") {
    await interaction.editReply(output);
    return;
  }
  const { image, audio } = output;

  await interaction.editReply({
    files: [
      (() => {
        const img = new AttachmentBuilder(Buffer.from(image.data.buffer), {
          name: `${dong.name.match(/^.*(?=\.dong$)/gm)}.${mime.getExtension(
            image.mime
          )}`,
        });
        img.setSpoiler(true);
        return img;
      })(),
      new AttachmentBuilder(Buffer.from(audio.data.buffer), {
        name: `${dong.name.match(/^.*(?=\.dong$)/gm)}.${mime.getExtension(
          audio.mime
        )}`,
      }),
    ],
  });
};
