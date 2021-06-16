import { Server } from '../services'

export class Bootstrap extends Phaser.Scene {
  private server!: Server
  constructor() {
    super('bootstrap')
  }

  init() {
    this.server = new Server()
  }

  create() {
    this.createNewGame()
  }

  private createNewGame() {
    this.scene.launch('game', {
      server: this.server,
      onGameOver: this.handleGameOver
    })
  }

  private handleGameOver = (data: any) => {
    this.server.leave()
    this.scene.stop('game')
    this.scene.launch('game-over', {
      ...data,
      onRestart: this.handleRestart
    })
  }

  private handleRestart = () => {
    this.scene.stop('game-over')
    this.createNewGame()
  }
}
