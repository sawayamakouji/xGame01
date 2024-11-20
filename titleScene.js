export default class TitleScene extends Phaser.Scene {
  constructor() {
      super('TitleScene');
  }

  create() {
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;

      // 背景画像
      this.add.image(width / 2, height / 2, 'titleBackground').setDisplaySize(width, height);

      // タイトルテキスト
      this.add.text(width / 2, height * 0.5 / 3, 'Solitary Struggle of Christmas', {
          fontSize: '60px',
          fill: '#ffffff',
          stroke: '#000',
          strokeThickness: 4
      }).setOrigin(0.5);

      // 背景ボックスを追加
      const backgroundBox = this.add.graphics();
      backgroundBox.fillStyle(0x000000, 0.5);
      backgroundBox.fillRect(width / 2 - 300, height * 3 / 4 - 20, 600, 40);

      // スタートボタンの文字
      const startText = this.add.text(width / 2, height * 3 / 4, 'Press Enter to Start', {
          fontSize: '32px',
          fill: '#ffffff'
      }).setOrigin(0.5);

      // 点滅アニメーション
      this.tweens.add({
          targets: startText,
          alpha: { from: 1, to: 0 },
          duration: 1000,
          yoyo: true,
          repeat: -1
      });

      // フラグで音楽の再生状態を管理
      let isMusicPlaying = false;

      // 任意のキー押下時の動作
      this.input.keyboard.on('keydown', (event) => {
          if (event.key === 'Enter') {
              // エンターキーでゲームスタート
              console.log('Game Started');
              this.scene.start('GameScene');
              if (this.startMusic && this.startMusic.isPlaying) {
                  this.startMusic.stop();
              }
          } else if (!isMusicPlaying) {
              // 他のキーで音楽を再生
              console.log(`Key pressed: ${event.key}`); // デバッグ用ログ
              this.startMusic = this.sound.add('start', { loop: true, volume: 0.4 });
              this.startMusic.play();
              isMusicPlaying = true;
            // 星のエフェクトを開始
            this.time.addEvent({
              delay: 500,
              callback: this.createStar,
              callbackScope: this,
              loop: true
          });
          }
      });
  }

  createStar() {
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;

      // ランダムな位置に星を作成
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);

      // 星を作成し、ランダムなサイズにスケール
      const star = this.add.image(x, y, 'star');
      const scale = Phaser.Math.FloatBetween(0.03, 0.1);
      star.setScale(scale);
  }
}