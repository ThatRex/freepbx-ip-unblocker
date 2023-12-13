import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js'
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx'
import { existsSync, appendFileSync, createReadStream, mkdirSync } from 'fs'
import readline from 'readline'

const PATH = '/etc/asterisk/_outbound_blacklist.csv'

function createOutboundBlacklistIfNotExists() {
    if (!existsSync(PATH)) mkdirSync(PATH, { recursive: true })
}

@Discord()
@SlashGroup({ name: 'blacklist', description: 'Outbound blacklist management.' })
@SlashGroup('blacklist')
class Blacklist {
    @Slash({ name: 'add', description: 'Add a number to the outbound blacklist.' })
    async add(
        @SlashOption({
            name: 'number',
            description: 'Phone number to blacklist.',
            required: true,
            type: ApplicationCommandOptionType.String
        })
        number: string,

        @SlashChoice('spoofed', 'prankster', 'business', 'government', 'police', 'own-did', 'other')
        @SlashOption({
            name: 'category',
            description: 'Category of this number.',
            type: ApplicationCommandOptionType.String,
            required: true
        })
        category: string,

        @SlashOption({
            name: 'note',
            description: 'Extra information about this number.',
            required: false,
            type: ApplicationCommandOptionType.String
        })
        note: string,

        interaction: CommandInteraction
    ) {
        createOutboundBlacklistIfNotExists()

        let alreadyBlacklisted = false

        await new Promise((resolve) => {
            const rl = readline.createInterface({ input: createReadStream(PATH) })

            rl.on('line', (line) => {
                if (line.includes(number)) alreadyBlacklisted = true
            })

            rl.on('close', resolve)
        })

        await interaction.reply({
            content: `number: ${number} | category: ${category} | note: ${note} | alreadyBlacklisted: ${alreadyBlacklisted}`,
            ephemeral: true
        })
    }

    @Slash({ name: 'remove', description: 'Remove a number from the outbound blacklist.' })
    async remove(
        @SlashOption({
            name: 'number',
            description: 'Phone number to blacklist.',
            required: true,
            type: ApplicationCommandOptionType.String
        })
        number: string,

        interaction: CommandInteraction
    ) {
        createOutboundBlacklistIfNotExists()

        await interaction.reply({
            content: `number: ${number}`,
            ephemeral: true
        })
    }
}
