import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js'
import { Discord, Guard, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx'
import {
    existsSync,
    createReadStream,
    mkdirSync,
    writeFileSync,
    unlinkSync,
    renameSync,
    createWriteStream
} from 'fs'
import path from 'path'
import readline from 'readline'
import { PHONE_10_OR_11_DIGIT_REGEX } from '../lib/regex'
import { ErrorHandler } from '../guards/error-handler'
import { randomUUID } from 'crypto'

@Discord()
@Guard(ErrorHandler)
@SlashGroup({ name: 'blacklist', description: 'Outbound blacklist management.', root: 'staff' })
@SlashGroup('blacklist', 'staff')
class BlacklistStaff {
    readonly PATH = '/etc/asterisk/'
    readonly NAME = '_outbound_blacklist.csv'
    readonly DEST = path.join(this.PATH, this.NAME)

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
        const content = await this.doCommand({ todo: 'add', number, category, note })
        await interaction.reply({ content, ephemeral: true })
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
        const content = await this.doCommand({ todo: 'remove', number })
        await interaction.reply({ content, ephemeral: true })
    }

    private createOutboundBlacklistIfNotExists() {
        if (!existsSync(this.PATH)) mkdirSync(this.PATH, { recursive: true })
        if (!existsSync(this.DEST)) writeFileSync(this.DEST, '')
    }

    private parsNumber(number: string) {
        let parsedNum = number.replace(/[^0-9]/g, '')
        if (parsedNum.length === 10) parsedNum = '1' + parsedNum
        return parsedNum
    }

    private async isNumberBlacklisted(number: string) {
        let blacklisted = false

        await new Promise((resolve) => {
            const input = createReadStream(this.DEST)
            const rl = readline.createInterface({ input })

            rl.on('close', () => {
                input.close()
                resolve('')
            })

            rl.on('line', (line) => {
                if (!line.includes(number)) return
                blacklisted = true
                rl.close()
            })
        })

        return blacklisted
    }

    private async doCommand(
        params:
            | {
                  todo: 'add'
                  number: string
                  category: string
                  note?: string
              }
            | {
                  todo: 'remove'
                  number: string
              }
    ) {
        this.createOutboundBlacklistIfNotExists()

        const match = params.number.match(PHONE_10_OR_11_DIGIT_REGEX)
        if (!match) return 'Please provide a valid 10 or 11 digit phone number.'

        const parsedNum = this.parsNumber(match[0])
        const blacklisted = await this.isNumberBlacklisted(parsedNum)

        if (params.todo === 'add' && blacklisted) return 'This number is already blacklisted.'
        if (params.todo === 'remove' && !blacklisted) return 'This number is not blacklisted.'

        await new Promise((resolve) => {
            const tempDest = `${this.DEST}.${randomUUID()}`
            writeFileSync(tempDest, '')

            const input = createReadStream(this.DEST)
            const output = createWriteStream(tempDest)
            const rl = readline.createInterface({ input, output })

            rl.on('close', () => {
                input.close()
                output.close()

                unlinkSync(this.DEST)
                renameSync(tempDest, this.DEST)

                resolve('')
            })

            rl.on('line', (line) => {
                if (params.todo === 'remove' && line.includes(parsedNum)) return
                output.write(`${line}\n`)
            })

            if (params.todo === 'add') {
                output.write(`${parsedNum},${params.category},${params.note ?? ''}\n`)
            }
        })

        return params.todo === 'add'
            ? 'This number has been blacklisted.'
            : 'This number has been un-blacklisted.'
    }
}
