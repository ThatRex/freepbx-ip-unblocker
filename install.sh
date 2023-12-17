#!/bin/bash

# constants
readonly SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

readonly PREVIOUS_BOT_DIR=/opt/freepbx-ip-unblocker/
readonly PREVIOUS_BOT_NAME=ip-unblock-bot

readonly BOT_NAME=freepbx-manager-bot

readonly NODE_DIR=$SCRIPT_DIR/node
readonly NODE=$NODE_DIR/bin/node
readonly NPM="$NODE $NODE_DIR/bin/npm"
readonly NPX="$NODE $NODE_DIR/bin/npx"

# options
remove_previous_version=false
bot_token=""
abuseipdb_key=""

# set options
for arg in $@; do
    if [[ $arg == "-rpv" ]]; then
        remove_previous_version=true
    fi

    if [[ $arg =~ ^-bot_token=.+$ ]]; then
        bot_token="${arg#-bot_token=}"
    fi

    if [[ $arg =~ ^-abuseipdb_key=.+$ ]]; then
        abuseipdb_key="${arg#-abuseipdb_key=}"
    fi
done

if [[ $bot_token == "" ]]; then
    echo Error: Bot token was not provided.
    exit 1
fi

# remove previous bot
if $remove_previous_version; then
    echo Attempting to remove previous bot.
    systemctl stop $PREVIOUS_BOT_NAME
    systemctl disable $PREVIOUS_BOT_NAME
    rm -f /etc/systemd/system/$PREVIOUS_BOT_NAME.service
    rm -rf $PREVIOUS_BOT_DIR
    echo Done.
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
echo Setting Up Datebase.
$NPM run db:migration:run
echo Done.

# creating env
echo Creating ENV File.
cat <<EOF >.env
BOT_TOKEN=$bot_token
ABUSEIPDB_KEY=$abuseipdb_key
IP_TRUST_TIMEOUT_HOURS=24
IP_ABUSE_CONFIDENCE_SCORE_REJECTION_PERCENTAGE=50
EOF
echo Done.

# setup service
echo Installing Service. Name: $BOT_NAME
cat <<EOF >/etc/systemd/system/$BOT_NAME.service
[Unit]
Description=FreePBX Manager Bot

[Service]
ExecStart=$NODE /opt/$BOT_NAME/build/main.js
Restart=always
User=root
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
echo Done.
echo Install Complete.
