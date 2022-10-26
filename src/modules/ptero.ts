import { config } from "..";
import ptero from "jspteroapi";
import { logger } from "./logger";

// Gets config data
const pteroConfig = config.pterodactyl;

if (!pteroConfig || !pteroConfig.enabled) {
  logger.warn(
    "Pterodactyl module has not been enabled or is missing from your config file"
  );
}

const panelClient = new ptero.Client(pteroConfig.host, pteroConfig.api_token);

// Responsible for whitelisting users to specified servers
export async function whitelist(ign: string) {
  //Parses server specified and whitelists them
  for (const server of pteroConfig.servers) {
    // Sends command to panel to whitelist user
    try {
      await panelClient.sendCommand(server, `whitelist add ${ign}`);
    } catch (error) {
      logger.error(error);
    }
  }
}

export async function unwhitelist(ign: string) {
  //Parses server specified and whitelists them
  for (const server of pteroConfig.servers) {
    // Sends command to panel to unwhitelist user
    try {
      await panelClient.sendCommand(server, `whitelist remove ${ign}`);
    } catch (error) {
      logger.error(error);
    }
  }
}
