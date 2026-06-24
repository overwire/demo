const { loadConfig, validateConfig } = require('./config.js');
const { formatDuration, slugify } = require('../lib/utils.js');

const config = loadConfig({
  port: Number(process.env.PORT) || undefined,
  host: process.env.HOST || undefined,
});

validateConfig(config);

const uptime = formatDuration(process.uptime() * 1000);
const slug = slugify(config.host);

console.log(`pipeline-app ready on ${config.host}:${config.port}`);
console.log(`uptime: ${uptime}, host-slug: ${slug}`);
