# Free PBX IP Unblocker

`nvm run 17.0.0 build/main.js`

```toml
[Unit]
Description=IP Unblock Bot

[Service]
ExecStart=/root/.nvm/nvm-exec node /root/freepbx-ip-unblocker-v2/build/main.js
Restart=always
User=root
Environment="NODE_VERSION=17.0.0" "BOT_TOKEN=TOKE_HERE"

[Install]
WantedBy=multi-user.target
```