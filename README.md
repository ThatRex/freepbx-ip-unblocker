# FreePBX Manager Bot

_Tested on FreePBX 16_

## Getting Setup

1.  Install Git.
    ```
    yum install git
    ```
2.  Change directory to `/opt/`.
    ```
    cd /opt/
    ```
3.  Clone this repo.
    ```
    git clone https://github.com/ThatRex/freepbx-manager-bot
    ```
4.  Run the install script.

    ```
    bash /freepbx-manager-bot/install.sh -bot_token=BOT_TOKEN -rpv
    ```

    ```bash
    -bot_token=X        # Required. Replace X with your discord bot token.
    -abuseipdb_key=X    # Optional. Replace X with your ipabusedb key.
    -rpv                # Optional. Removes previous version of the bot.
    ```

    \* Additional options are available in the `.env` file generated during install.

## Managing The Service

The install script sets up the bot and adds it as a system service. You can manage the service using the `systemctl` CLI. Below are the primary commands you will need.

```bash
systemctl start freepbx-manager-bot   # Starts Service.
systemctl stop freepbx-manager-bot    # Stops Service.
systemctl status freepbx-manager-bot  # Show Service Status. Usefull when something goes wrong.
systemctl enable freepbx-manager-bot  # Enable Service. When enabled the service will start automaticly.
systemctl disable freepbx-manager-bot # Disable Service.
```

## Managing Slash Commands

You may notice by default the staff slash command group is available to everyone. You will need to change this in your server settings. [Find out how here.](https://discord.com/blog/slash-commands-permissions-discord-apps-bots)

## What does the blacklist do & how do I use it?

It adds & removes numbers from `_outbound_blacklist.csv`. It can be found by going to **Admin > Config Edit**. Note: The bot will only create the file when a number is added, you may create it yourself too.

Assuming you don't already have a `trunk-predial-hook` you can do the following to use the blacklist feature. Ensure `_outbound_blacklist.csv` exists then add the following into `extensions_custom.conf`:

```asterisk
[macro-dialout-trunk-predial-hook]
exten => s,1,NoOp(macro-dialout-trunk-predial-hook)
 same => n,NoOp(Checking Blacklist)
 same => n,Set(BLACKLISTED_NUM=${SHELL(grep ${DIAL_NUMBER} /etc/asterisk/_outbound_blacklist.csv)})
 same => n,ExecIf($["${BLACKLISTED_NUM}"!=""]?Playback(privacy-this-number-is&privacy-blacklisted))
 same => n,ExecIf($["${BLACKLISTED_NUM}"!=""]?Hangup())
```
