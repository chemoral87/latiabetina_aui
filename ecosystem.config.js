module.exports = {
  apps: [
    {
      name: 'Admin',
      exec_mode: 'cluster',
      instances: 'max', // Or a number of instances
      script: './node_modules/nuxt/bin/nuxt.js',
      args: 'start',
      env: {
        PORT: 3001, // Set the desired port
        NODE_ENV: 'production',
      },
    },
  ],
}
