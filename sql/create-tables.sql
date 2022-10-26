CREATE TABLE IF NOT EXISTS links (
    mojang_id  VARCHAR(36) PRIMARY KEY,
    discord_id VARCHAR(18),
    grace_period INTEGER
);

CREATE TABLE IF NOT EXISTS applications_cache (
    message_id  VARCHAR(18) PRIMARY KEY,
    member_id VARCHAR(18),
    
);
