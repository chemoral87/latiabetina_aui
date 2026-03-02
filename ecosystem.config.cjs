module.exports = {
  apps: [
    {
      name: "admin",
      script: "npm",
      args: "start",
      cwd: "/var/www/admin/current",
      watch: false,
      instances: 1,
      autorestart: true,
      max_restarts: 5,
      env: {
        PORT: 3002,
        NODE_ENV: "production",
      },
    },
  ],
}
