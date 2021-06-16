import { Command } from '@colyseus/command'

export class NextTurnCommand extends Command {
  execute() {
    const activePlayer = this.room.state.activePlayer

    if (activePlayer === 0) {
      this.room.state.activePlayer = 1
    } else {
      this.room.state.activePlayer = 0
    }
  }
}
