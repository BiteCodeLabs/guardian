import logger from "./logger";
import ptero from "jspteroapi";
import { Pterodactyl } from "../types";

// Responsible for whitelisting users to specified servers
export async function whitelist(ign: string, pteroConfig: Pterodactyl) {
  const panelClient = new ptero.Client(pteroConfig.host, pteroConfig.api_token);
  //Parses server specified and whitelists them
  for (const server of pteroConfig.servers) {
    // Sends command to panel to whitelist user
    try {
      await panelClient.sendCommand(server, `whitelist add ${ign}`);
    } catch (error) {
      logger.error("An error occured while trying to whitelist ", ign, error);
    }
  }
}

export async function unwhitelist(ign: string, pteroConfig: Pterodactyl) {
  const panelClient = new ptero.Client(pteroConfig.host, pteroConfig.api_token);
  //Parses server specified and whitelists them
  for (const server of pteroConfig.servers) {
    // Sends command to panel to unwhitelist user
    try {
      await panelClient.sendCommand(server, `whitelist remove ${ign}`);
    } catch (error) {
      logger.error("An error occured while trying to unwhitelist ", ign, error);
    }
  }
}
