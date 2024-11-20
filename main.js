import LoadingScene from './loadingScene.js';
import TitleScene from './titleScene.js';
import GameScene from './gameScene.js';

const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [LoadingScene, TitleScene, GameScene] // シーンを 登録
};

const game = new Phaser.Game(config);
