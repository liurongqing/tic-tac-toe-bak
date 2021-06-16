import { Client, Room } from 'colyseus.js'
import { Message, GameState } from '../../types/message'

export class Server {
  private client: Client
  private events: Phaser.Events.EventEmitter

  private room?: Room
  private _playerIndex = -1

  get gameState() {
    if (!this.room) {
      return GameState.WaitingForPlayers
    }
    return this.room?.state.gameState
  }

  get playerIndex() {
    return this._playerIndex
  }

  constructor() {
    this.client = new Client('ws://localhost:2567')
    this.events = new Phaser.Events.EventEmitter()
  }

  async join() {
    this.room = await this.client.joinOrCreate('tic-tac-toe')
    this.room.onStateChange.once((state) => {
      this.events.emit('once-state-changed', state)
    })

    this.room.onMessage(
      Message.PlayerIndex,
      (message: { playerIndex: number }) => {
        this._playerIndex = message.playerIndex
      }
    )

    // 有人断开链接
    this.room.onLeave((code) => {
      console.log('code', code)
      alert('leave')
    })

    // this.room.onError((code, message) => {
    //   console.log('oops, error ocurred:', code)
    //   console.log(message)
    // })

    this.room.state.onChange = (changes) => {
      changes.forEach((change) => {
        const { field, value } = change
        switch (field) {
          case 'activePlayer': {
            this.events.emit('player-turn-changed', value)
            break
          }
          case 'winningPlayer': {
            this.events.emit('player-win', value)
            break
          }
          case 'gameState': {
            this.events.emit('game-state-changed', value)
            break
          }
        }
      })
      console.log('changes', changes)
    }

    this.room.state.board.onChange = (item, idx) => {
      this.events.emit('board-changed', item, idx)
    }
  }

  // 刚进来初始化井字盘
  onceStateChanged(cb: (state) => void, context?: any) {
    this.events.once('once-state-changed', cb, context)
  }

  // 点击井字，下子后端返回时回调更新
  onBoardChanged(cb: (cell: number, index: number) => void, context?: any) {
    this.events.on('board-changed', cb, context)
  }

  // 点击时向后端发送信息
  makeSelection(idx: number) {
    if (!this.room) return
    if (this.room.state.gameState !== GameState.Playing) {
      return
    }
    console.log('roommmm', this.room)
    if (this.playerIndex !== this.room?.state.activePlayer) {
      console.warn('当前为对方下子')
      return
    }
    this.room?.send(Message.PlayerSelection, { index: idx })
  }

  // 轮流下子用户变化时回调
  onPlayerTurnChanged(cb: (playerIndex: number) => void, context?: any) {
    this.events.on('player-turn-changed', cb, context)
  }

  onPlayerWon(cb: (playerIndex: number) => void, context?: any) {
    this.events.on('player-win', cb, context)
  }

  onGameStateChanged(cb: (state: any) => void, context?: any) {
    this.events.on('game-state-changed', cb, context)
  }

  leave() {
    this.room?.leave()
    this.events.removeAllListeners()
  }
}
