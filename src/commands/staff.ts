import { Discord, Guard, SlashGroup } from 'discordx'
import { ErrorHandler } from '../guards/error-handler'

@Discord()
@Guard(ErrorHandler)
@SlashGroup({ description: 'Staff Commands', name: 'staff' })
@SlashGroup('staff')
class Staff {}
