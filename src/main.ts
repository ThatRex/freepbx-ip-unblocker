import { dirname, importx } from '@discordx/importer'
import { IntentsBitField, type Interaction } from 'discord.js'
import { Client } from 'discordx'
import 'dotenv/config'
import { dev, env } from './lib/environment'
import './jobs'

export const bot = new Client({ intents: [IntentsBitField.Flags.Guilds], silent: false })

bot.once('ready', async () => {
    await bot.guilds.fetch()
    await bot.initApplicationCommands()
    await bot.clearApplicationCommands(...bot.guilds.cache.map(({ id }) => id))
    console.log('>> Bot started')
})

bot.on('interactionCreate', (interaction: Interaction) => {
    bot.executeInteraction(interaction)
})

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection: ', error)
})

async function run() {
    await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`)
    await bot.login(env.BOT_TOKEN)
}

run()
