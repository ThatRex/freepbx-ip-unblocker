#!/bin/bash

# constants
readonly SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

readonly BOT_NAME=freepbx-ip-unblocker

readonly NODE_DIR=$SCRIPT_DIR/node
readonly NODE=$NODE_DIR/bin/node
readonly NPM="$NODE $NODE_DIR/bin/npm"
readonly NPX="$NODE $NODE_DIR/bin/npx"

# options
bot_token=""

# set options
for arg in $@; do
    if [[ $arg =~ ^-bot_token=.+$ ]]; then
        bot_token="${arg#-bot_token=}"
    fi
done

if [[ $bot_token == "" ]]; then
    echo Error: Bot token was not provided.
    exit 1
fi

# download node
echo Downloading Node.
mkdir $NODE_DIR
wget -O - https://nodejs.org/dist/latest-v17.x/node-v17.9.1-linux-x64.tar.gz | tar -xzf - -C $NODE_DIR --strip-components=1
echo Done.

cd /opt/$BOT_NAME

# install deps & build bot
echo Installing Dependenies.
$NPM install
echo Building.
$NPM run build
echo Done.

# setup service
echo Installing Service. Name: $BOT_NAME
cat <<EOF >/etc/systemd/system/$BOT_NAME.service
[Unit]
Description=$BOT_NAME

[Service]
ExecStart=$NODE /opt/$BOT_NAME/build/main.js
Restart=always
User=root
Environment="NODE_VERSION=17" "BOT_TOKEN=$bot_token"

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
echo Done.
echo Install Complete.
