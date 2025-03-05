import type { Attachment } from "discord.js";

export const download = async (file: Attachment): Promise<File> =>
  new File(
    [
      await fetch(file.url).then((res) => {
        return res.blob();
      }),
    ],
    file.name,
    {
      type: file.contentType ?? "application/octet-stream",
    }
  );
