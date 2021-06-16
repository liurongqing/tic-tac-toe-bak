import { Schema, ArraySchema, type } from '@colyseus/schema'
import { GameState } from '../types/message'

export class TicTacToeState extends Schema {
  @type('number')
  gameState = GameState.WaitingForPlayers

  @type(['number'])
  board: ArraySchema<number>

  @type('number')
  activePlayer = 0

  @type('number')
  winningPlayer = -1

  constructor() {
    super()
    this.board = new ArraySchema(0, 0, 0, 0, 0, 0, 0, 0, 0)
  }
}
