export default class TitleScene extends Phaser.Scene {
    constructor() {
      super('TitleScene');
    }
  
    create() {
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;
  
      // 背景
      this.add.image(width / 2, height / 2, 'titleBackground').setDisplaySize(width, height);
  
      // タイトル テキスト
      this.add.text(width / 2, height * 0.5 / 3, 'Solitary Struggle of Christmas', {
        fontSize: '60px',
        fill: '#ffffff'
      }).setOrigin(0.5);
  
      // 背景ボックスを追加
      const backgroundBox = this.add.graphics();
      backgroundBox.fillStyle(0x000000, 0.5); // 黒色、50%透明
      backgroundBox.fillRect(width / 2 - 300, height * 3 / 4 - 20, 600, 40);
  
      // スタートボタンの文字
      const startText = this.add.text(width / 2, height * 3 / 4, 'Press Any Key to Start', {
        fontSize: '32px',
        fill: '#ffffff'
      }).setOrigin(0.5);
  
      // 点滅アニメーション
      this.tweens.add({
        targets: startText,
        alpha: { from: 1, to: 0 }, // 透明度を 1 から 0 に変化
        duration: 1000, // 1秒かけて変化
        yoyo: true, // 元に戻す
        repeat: -1 // 無限に繰り返す
      });
  
      // 任意のキー押下でスタート
      this.input.keyboard.once('keydown', (event) => {
        console.log(`Key pressed: ${event.key}`); // デバッグ用ログ
        this.scene.start('GameScene');
      });
    }
  }
  