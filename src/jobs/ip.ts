import cron from 'node-cron'

cron.schedule('0 * * * *', () => {
    console.log('running a task every hour')
})
