import { Client, Room } from 'colyseus'
import { Dispatcher } from '@colyseus/command'
import { TicTacToeState } from './TicTacToeState'
import { Message, GameState } from '../types/message'
import PlayerSelectionCommand from './commands/PlayerSelectionCommand'

const maxClients = 2
export class TicTacToe extends Room {
  private dispatcher = new Dispatcher(this)

  onCreate() {
    this.maxClients = maxClients
    // 创建的时候生效
    this.setState(new TicTacToeState())

    this.onMessage(
      Message.PlayerSelection,
      (client, message: { index: Number }) => {
        this.dispatcher.dispatch(new PlayerSelectionCommand(), {
          client,
          index: message.index
        })
      }
    )
  }

  onJoin(client: Client) {
    const idx = this.clients.findIndex((c) => c.sessionId === client.sessionId)
    client.send(Message.PlayerIndex, { playerIndex: idx })

    if (this.clients.length >= maxClients) {
      this.state.gameState = GameState.Playing
      this.lock()
    }
  }
}
