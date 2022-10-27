export interface setting {
  value?: String;
}

export interface servers {
  guild_id: string;
  server_id: string;
  host: string;
  token: string;
}

export type Config = {
  bot: Bot;
  applications: Applications;
  interviews: Interviews;
  pterodactyl: Pterodactyl;
  plan: Plan;
};

export type Bot = {
  owner: string;
  server: string;
  token: string;
  status: string;
  prefix: string;
  console_channel: string;
  join_channel: string;
};

export type Applications = {
  enabled: boolean;
  timeout: number;
  member_role: number;
  join_message: string;
  welcome_channel: string;
  welcome_message: string;
  applications_channel: string;
  questions: string[];
};

export type Interviews = {
  enabled: boolean;
  member_role: string;
  notification: string;
  interview_role: string;
  interview_channel: string;
  welcome_channel: string;
  welcome_message: string;
};

export type Pterodactyl = {
  enabled: boolean;
  host: string;
  servers: string[];
  api_token: string;
  whitelist: boolean;
};

export type Plan = {
  enabled: boolean;
  database: Database;
  inactivity: Inactivity;
};

export type Database = {
  type: string;
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
};

export type Inactivity = {
  enabled: boolean;
  vaction_role: string;
  message: string;
};

// Key value pair for submitted applications
export type Application = {
  [key: string]: string;
};

export type MinecraftUser = {
  name: string;
  id: string;
};

export type Link = {
  mojang_id: string;
  discord_id: string;
  grace_period: number;
};

export type Response = {
  number: number;
  question: string;
  content: string;
};

export type ApplicationCache = {
  message_id: string;
  member_id: string;
};
