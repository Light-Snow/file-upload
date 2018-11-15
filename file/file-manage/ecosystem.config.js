module.exports = {
  apps: [{
    name: "file-manage",
    script: "src/index.js",
    watch: true,
    env: {
      "NODE_ENV": "dev",
    },
    env_production: {
      "NODE_ENV": "production"
    },
    env_test: {
      "NODE_ENV": "test"
    },
    instances: 3,
    exec_mode: "cluster"
  }]
}
