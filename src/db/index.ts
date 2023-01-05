import Keyv from "keyv";
import logger from "../modules/logger";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const interactionStore = new Keyv("sqlite://database.sqlite", {
  table: "interaction_store",
  busyTimeout: 10000,
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

export const timeoutCache = new Keyv();

interactionStore.on("error", (err: any) => {
  logger.error(
    "Connection Error while trying to connect to interactions sqlite store",
    err
  );
  process.exit(1);
});

// Checks the link of a given user
export async function checkLink(mojangId: string) {
  const data = await prisma.links.findFirst({
    where: {
      mojang_id: mojangId,
    },
  });
  return data;
}

// Adds a link to the sqlite database
export async function createLink(mojangId: string, discordId: string) {
  const grace = Date.now() + 604800000;

  const link = {
    discordId: discordId,
    gracePeriod: grace,
    mojangId: mojangId,
  };

  await prisma.links.create({
    data: {
      mojang_id: mojangId,
      discord_id: discordId,
      gracePeriod: grace,
    },
  });
  logger.info(`Added ${mojangId}, ${link.discordId} to store`);
}

export async function storeApplication(messageId: string, memberId: string) {
  await interactionStore.set(messageId, memberId);
  logger.info(`Added ${messageId}, ${memberId} to store`);
}
