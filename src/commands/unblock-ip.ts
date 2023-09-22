import { exec } from 'child_process'
import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js'
import { Discord, Slash, SlashOption } from 'discordx'

const ipRegex =
    /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

@Discord()
export class UnblockIP {
    @Slash({
        name: 'unblock',
        description: 'Unblock your IP on the PBX.'
    })
    async unblock(
        @SlashOption({
            name: 'ip',
            description: 'your public ipv4 address',
            required: true,
            type: ApplicationCommandOptionType.String
        })
        ip: string,

        interaction: CommandInteraction
    ) {
        if (!ip.match(ipRegex)) {
            return interaction.reply({
                content: 'Please provide a valid IPv4 Address. (Example: 541.241.104.65)',
                ephemeral: true
            })
        }

        exec(`fwconsole firewall trust ${ip}`, (error) => {
            if (error) {
                interaction.reply({
                    content: 'Something when wrong. Error: `' + error + '`',
                    ephemeral: true
                })
                return
            }
            interaction.reply({
                content: 'Your IP has been unblocked',
                ephemeral: true
            })
        })
    }
}
