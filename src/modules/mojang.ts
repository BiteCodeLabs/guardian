import axios from "axios";
import logger from "./logger";
import { MinecraftUser } from "../types";

// This queries the Mojang API for a users ID
export async function getId(ign: string) {
  logger.info(`Getting UUID for ${ign}`);
  try {
    const { data: response } = await axios.get(
      `https://api.mojang.com/users/profiles/minecraft/${ign}`
    );

    return addDashes(response.id);
  } catch (error) {
    logger.error("Error trying to get mojang user id");
  }
}

// This queries the Mojang API for a users IGN
export async function getIGN(id: string) {
  logger.info(`Getting UUID for ${id}`);
  try {
    const { data: response } = await axios.get(
      `https://api.mojang.com/user/profile/${id}`
    );

    return response as MinecraftUser;
  } catch (error) {
    logger.error("Error trying to get mojang user id");
  }
}

function addDashes(id: string) {
  const regex =
    /([0-9a-fA-F]{8})([0-9a-fA-F]{4})([0-9a-fA-F]{4})([0-9a-fA-F]{4})([0-9a-fA-F]+)/g;
  const subst = "$1-$2-$3-$4-$5";
  return id.replace(regex, subst);
}
