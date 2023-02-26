export default () => ({
  port: parseInt(process.env.PORT, 10) || 8080,
  discordToken: process.env.DISCORD_TOKEN,
  rovacc: {
    core: {
      host: process.env.ROVACC_CORE_ENDPOINT,
    },
  },
});
