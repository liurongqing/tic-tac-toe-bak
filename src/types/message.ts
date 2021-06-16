export enum GameState {
  WaitingForPlayers,
  Playing,
  Finished
}

export enum Cell {
  Empty,
  X,
  O
}

export enum Message {
  PlayerSelection,
  PlayerIndex
}
