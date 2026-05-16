// pm2.config.js
module.exports = {
  apps: [
    {
      name: "nextjs-app",
      script: "npm",
      args: "start",
    },
    {
      name: "workers",
      script: "workers/index.ts",
      interpreter: "tsx",
    },
  ],
};
