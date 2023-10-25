# FreePBX IP Unblocker

## Setup

1. Install [NVM](https://github.com/nvm-sh/nvm).
2. Execute `nvm install 17`.
3. Execute `cd /opt`.
4. Execute `yum install git`.
5. Execute `git clone *this repo*`.
6. Execute `cd freepbx-ip-unblocker/`.
7. Execute `npm i` to install dependencies.
8. Execute `npx tsc` to build.
9.  **Optional:** Execute `nvm run 17 build/main.js` to manually run bot.
10. Run `nano /etc/systemd/system/ip-unblock-bot.service` and copy the following into the file:
    ```conf
    [Unit]
    Description=IP Unblock Bot

    [Service]
    ExecStart=/root/.nvm/nvm-exec node /opt/freepbx-ip-unblocker/build/main.js
    Restart=always
    User=root
    Environment="NODE_VERSION=17" "BOT_TOKEN=TOKE_HERE"

    [Install]
    WantedBy=multi-user.target
    ```
11. Execute `systemctl daemon-reload`.
12. Execute `systemctl start ip-unblock-bot && systemctl status ip-unblock-bot` and ensure no errors are encounterd before continuing.
13. Execute `systemctl enable ip-unblock-bot` to enable the service.