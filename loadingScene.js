export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  preload() {
    // ローディングバーの作成
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();

    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 4, height / 2 - 25, width / 2, 50);

    // ローディング中のテキスト
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      fill: '#ffffff'
    }).setOrigin(0.5, 0.5);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 4 + 10, height / 2 - 15, (width / 2 - 20) * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // アセットの読み込み
    this.load.image('player', 'assets/player.png');
    this.load.image('enemy', 'assets/enemy.png');
    this.load.image('titleBackground', 'assets/titleBackground.png');
    this.load.image('seen1', 'assets/seen1.png');
    this.load.image('enemy1', 'assets/ghost.png'); 
      // レベルアップ音を読み込み
    this.load.audio('levelUpSound', 'assets/level_up.mp3');
    // 星のエフェクト用スプライトを読み込み
    this.load.image('star', 'assets/star.png');
    // プレイヤーの攻撃音
    this.load.audio('playerAttackSound', 'assets/player_attack.mp3');
    // 敵がダメージを受けたときの音
    this.load.audio('enemyHitSound', 'assets/enemy_hit.mp3');
    this.load.audio('gameMusic', 'assets/seen1.mp3');
    this.load.audio('start', 'assets/start.mp3');
  }

  create() {
    // タイトル画面に移行
    this.scene.start('TitleScene');

  }
}
