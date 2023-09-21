import { exec } from 'child_process'
import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js'
import {
    Discord,
    // SimpleCommand,
    // SimpleCommandMessage,
    // SimpleCommandOption,
    // SimpleCommandOptionType,
    Slash,
    SlashOption
} from 'discordx'

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

        const { stdout, stderr } = await exec(`fwconsole firewall trust ${ip}`)

        console.debug(`[IP Unblock] stdout: ${stdout}`)

        if (stderr) {
            return interaction.reply({
                content: 'Something when wrong. Error: `' + stderr + '`',
                ephemeral: true
            })
        }

        interaction.reply({
            content: 'Your IP has been unblocked',
            ephemeral: true
        })
    }

    // @SimpleCommand({ name: 'unblock', description: 'Unblock your IP on the PBX.' })
    // async simpleUnblock(
    //     @SimpleCommandOption({
    //         name: 'ip',
    //         description: 'your public ipv4 address',
    //         type: SimpleCommandOptionType.String
    //     })
    //     ip: string | undefined,

    //     command: SimpleCommandMessage
    // ) {
    //     if (!command.isValid()) return command.sendUsageSyntax()

    //     const message = await (async () => {
    //         if (!ip!.match(ipRegex)) {
    //             return command.message.reply(
    //                 'Please provide a valid IPv4 Address. (Example: 541.241.104.65)'
    //             )
    //         }

    //         const { stdout, stderr } = await exec(`fwconsole firewall trust ${ip}`)

    //         console.debug(`[IP Unblock] stdout: ${stdout}`)

    //         if (stderr) {
    //             return command.message.reply('Something when wrong. Error: `' + stderr + '`')
    //         }

    //         return command.message.reply('Your IP has been unblocked!')
    //     })()

    //     await command.message.delete()
    //     setTimeout(async () => await message.delete(), 4000)
    // }
}
