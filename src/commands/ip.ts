import { exec } from 'child_process'
import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { IPV4_REGEX } from '../lib/regex'
import util from 'util'
import { db, schema } from '../lib/db'
import { eq } from 'drizzle-orm'

const execPromise = util.promisify(exec)
const { ipLogs } = schema

@Discord()
@SlashGroup({ description: 'Manage IPs', name: 'ip' })
@SlashGroup('ip')
class IP {
    @Slash({ name: 'list', description: 'View your IP history.' })
    async list(interaction: CommandInteraction) {
        const records = await db
            .select({
                ip: ipLogs.ipv4,
                note: ipLogs.note,
                timestamp: ipLogs.timestamp,
                timestamp_untrusted: ipLogs.timestamp_untrusted
            })
            .from(ipLogs)
            .where(eq(ipLogs.discordUserID, interaction.user.id))
            .limit(10)

        await interaction.reply({
            content: 'List Here',
            ephemeral: true
        })
    }

    @Slash({ name: 'trust', description: 'Trust an IP.' })
    async trust(
        @SlashOption({
            name: 'ipv4',
            description: 'Your Public IPV4 Address.',
            required: true,
            type: ApplicationCommandOptionType.String
        })
        ip: string,

        @SlashOption({
            name: 'note',
            description: 'a note',
            required: false,
            type: ApplicationCommandOptionType.String
        })
        note: string,

        interaction: CommandInteraction
    ) {
        if (!ip.match(IPV4_REGEX)) {
            const content =
                'Please provide a valid IPv4 Address. [Get your IP here.](https://api.ipify.org/?format=txt)'
            await interaction.reply({ content, ephemeral: true })
            return
        }

        // Check IP

        let error = ''
        let reject = false
        let rejectReason = ''

        const canContinue = () => !reject && !error

        try {
            const output = await execPromise(`fwconsole firewall list trusted | grep ${ip}`)
            if (output.stdout) {
                reject = true
                rejectReason = 'This IP is already trusted.'
            }
        } catch (error: any) {
            error = error.message
        }

        // if (canContinue() && env.IPINFO_TOKEN) {
        // }

        // if (canContinue() && env.ABUSEIPDB_KEY) {
        // }

        if (reject) {
            const content = `IP Rejected. Reason: ${rejectReason} `
            await interaction.reply({ content, ephemeral: true })
            return
        }

        if (!error) {
            try {
                await execPromise(`fwconsole firewall trust ${ip}`)
            } catch (error: any) {
                error = error.message
            }
        }

        if (error) {
            const content = 'Something went wrong. Error:\n```' + error + '```'
            await interaction.reply({ content, ephemeral: true })
            return
        }

        const content = 'Your IP has been trusted.'
        await interaction.reply({ content, ephemeral: true })
        await db.insert(ipLogs).values({
            discordUserID: interaction.user.id,
            ipv4: ip,
            note
        })
    }

    @Slash({ name: 'untrust', description: 'Untrust an IP.' })
    async untrust(
        @SlashOption({
            name: 'ipv4',
            description: 'Your Public IPV4 Address.',
            required: true,
            type: ApplicationCommandOptionType.String
        })
        ip: string,

        interaction: CommandInteraction
    ) {
        if (!ip.match(IPV4_REGEX)) {
            const content =
                'Please provide a valid IPv4 Address. [Get your IP here.](https://api.ipify.org/?format=txt)'
            await interaction.reply({ content, ephemeral: true })
            return
        }
    }
}
