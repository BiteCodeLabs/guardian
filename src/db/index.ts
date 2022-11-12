import Keyv from 'keyv';
import { LinkData } from '../types';
import logger from '../modules/logger';

export const linkStore = new Keyv('sqlite://database.sqlite', {
  table: 'link_store',
  busyTimeout: 10000,
  serialize: JSON.stringify,
  deserialize: JSON.parse
});

export const interactionStore = new Keyv('sqlite://database.sqlite', {
  table: 'interaction_store',
  busyTimeout: 10000,
  serialize: JSON.stringify,
  deserialize: JSON.parse
});

export const timeoutCache = new Keyv();

linkStore.on('error', (err: any) => {
  logger.error(
    'Connection Error while trying to connect to links sqlite store',
    err
  );
  process.exit(1);
});

interactionStore.on('error', (err: any) => {
  logger.error(
    'Connection Error while trying to connect to interactions sqlite store',
    err
  );
  process.exit(1);
});

// Checks the link of a given user
export async function checkLink(mojangId: string) {
  const data = await linkStore.get(mojangId);
  return data as LinkData;
}

// Adds a link to the sqlite database
export async function createLink(mojangId: string, discordId: string) {
  const grace = Date.now() + 604800000;

  const link = {
    discordId: discordId,
    gracePeriod: grace,
    mojangId: mojangId
  };

  await linkStore.set(mojangId, link);
  logger.info(`Added ${mojangId}, ${link.discordId} to store`);
}
// Removes link from the table
export async function removeLink(mojangId: string) {
  logger.info('Removing link: ', mojangId);
  await linkStore.delete(mojangId);
}

export async function storeApplication(messageId: string, memberId: string) {
  await interactionStore.set(messageId, memberId);
  logger.info(`Added ${messageId}, ${memberId} to store`);
}
