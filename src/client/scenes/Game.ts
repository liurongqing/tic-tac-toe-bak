import type { Server } from '../services/Server'
import { Cell, GameState } from '../../types/message'

export class Game extends Phaser.Scene {
  private server?: Server
  private cells: { display: Phaser.GameObjects.Rectangle; value: Cell }[] = []
  private onGameOver?: (data: any) => void
  private gameStateText?: Phaser.GameObjects.Text

  constructor() {
    super('game')
  }

  init() {
    this.cells = []
  }

  async create(data: any) {
    const { server, onGameOver } = data
    if (!server) throw new Error('server instance missing')
    this.server = server
    this.onGameOver = onGameOver
    await this.server?.join()
    this.server?.onceStateChanged(this.createBoard, this)
  }

  createBoard(state) {
    // console.log('board', state)
    const { width, height } = this.scale
    const size = 128
    const padding = 20

    let x = width / 2 - size - padding
    let y = height / 2 - size - padding
    state.board.forEach((cellState, idx) => {
      const cell = this.add
        .rectangle(x, y, size, size, 0xffffff)
        .setInteractive()
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
          this.server?.makeSelection(idx)
        })

      x += size + padding
      if ((idx + 1) % 3 === 0) {
        x = width / 2 - size - padding
        y += size + padding
      }
      // console.log(cellState, idx)
      this.cells.push({
        display: cell,
        value: cellState
      })
    })

    if (this.server?.gameState === GameState.WaitingForPlayers) {
      const width = this.scale.width
      this.gameStateText = this.add
        .text(width / 2, 50, 'Waiting for opponent..')
        .setOrigin(0.5)
    }

    // 棋盘创建以后，再进行监听
    this.server?.onBoardChanged(this.handleBoardChanged, this)
    this.server?.onPlayerTurnChanged(this.handlePlayerTurnChanged, this)
    this.server?.onPlayerWon(this.handlePlayerWon, this)
    this.server?.onGameStateChanged(this.handleGameStateChanged, this)
  }

  handleBoardChanged(newValue: Cell, idx: number) {
    const cell = this.cells[idx]
    if (cell.value !== newValue) {
      switch (newValue) {
        case Cell.X: {
          this.add
            .star(cell.display.x, cell.display.y, 4, 4, 60, 0xff0000)
            .setAngle(45)
          break
        }
        case Cell.O: {
          this.add.circle(cell.display.x, cell.display.y, 50, 0x0000ff)
          break
        }
      }
      cell.value = newValue
    }
  }

  handlePlayerTurnChanged(playerIndex: number) {
    // TODO 显示信息，让玩家知道轮到他了
  }

  handlePlayerWon(playerIndex: number) {
    this.time.delayedCall(200, () => {
      if (!this.onGameOver) return
      this.onGameOver({
        winner: this.server?.playerIndex === playerIndex
      })
    })
  }

  private handleGameStateChanged(state: any) {
    if (state === GameState.Playing && this.gameStateText) {
      this.gameStateText.destroy()
      this.gameStateText = undefined
    }
  }
}
