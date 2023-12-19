# FreePBX IP Unblocker

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
    git clone https://github.com/ThatRex/freepbx-ip-unblocker
    ```
4.  Run the install script. (Replace BOT_TOKEN your discord bot token.)

    ```
    bash /freepbx-ip-unblocker/install.sh -bot_token=BOT_TOKEN
    ```

## Managing The Service

The install script sets up the bot and adds it as a system service. You can manage the service using the `systemctl` CLI. Below are the primary commands you will need.

```bash
systemctl start freepbx-ip-unblocker   # Starts Service.
systemctl stop freepbx-ip-unblocker    # Stops Service.
systemctl status freepbx-ip-unblocker  # Show Service Status. Usefull when something goes wrong.
systemctl enable freepbx-ip-unblocker  # Enable Service. When enabled the service will start automaticly.
systemctl disable freepbx-ip-unblocker # Disable Service.
```

