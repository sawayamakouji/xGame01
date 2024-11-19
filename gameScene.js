import Enemy from './Enemy.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // レベルアップ音を読み込み
    this.load.audio('levelUpSound', 'assets/level_up.mp3');
    // 星のエフェクト用スプライトを読み込み
    this.load.image('star', 'assets/star.png');
  }

  create() {
    // キャンバス幅と高さを取得
    this.w = this.scale.width;
    this.h = this.scale.height;

    // 背景
    this.add.image(this.w / 2, this.h / 2, 'seen1').setDisplaySize(this.w, this.h);

    // プレイヤーを追加（キャンバス中央に配置）
    this.player = this.physics.add.sprite(this.w / 2, this.h / 2, 'player');
    this.player.setCollideWorldBounds(true);

    // プレイヤー設定
    this.playerSpeed = 100;
    this.life = 100;
    this.isInvincible = false;
    this.isAttacking = false;
    this.attackCooldown = 1800;
    this.attackDamage = 30;
    this.attackRange = 150;

    // 経験値・レベル
    this.playerExp = 0;
    this.playerLevel = 1;
    this.expToNextLevel = 100;

    // 敵設定
    this.enemies = [];
    this.baseSpawnCount = 1;
    this.spawnIncreaseRate = 1;

    // スコア表示
    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

    // タイマー表示
    this.timeElapsed = 0;
    this.timerText = this.add.text(this.w - 250, 16, 'Time: 00:00', { fontSize: '32px', fill: '#fff' });

    // 経験値・レベル表示
    this.expText = this.add.text(16, 50, `EXP: 0 / 100`, { fontSize: '32px', fill: '#fff' });
    this.levelText = this.add.text(16, 84, `Level: 1`, { fontSize: '32px', fill: '#fff' });

    // プレイヤーのライフバー
    this.playerLifeBar = this.add.graphics();
    this.drawLifeBar(this.playerLifeBar, this.player.x, this.player.y + 40, this.life, 100);

    // キーボード入力
    this.cursors = this.input.keyboard.createCursorKeys();

    // 敵を時間とともに増やすタイマー
    this.time.addEvent({
      delay: 3000,
      callback: this.spawnEnemies,
      callbackScope: this,
      loop: true
    });

    // プレイヤーの攻撃タイマー
    this.time.addEvent({
      delay: this.attackCooldown,
      callback: this.playerAttack,
      callbackScope: this,
      loop: true
    });

    // ゲームタイマー（1秒ごとに更新）
    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // レベルアップ音の準備
    this.levelUpSound = this.sound.add('levelUpSound');
  }

  update() {
    // プレイヤーの移動処理
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-1 * this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-1 * this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    } else {
      this.player.setVelocityY(0);
    }

    // プレイヤーのライフバーを更新
    this.drawLifeBar(this.playerLifeBar, this.player.x, this.player.y + 40, this.life, 100);

    // 敵のライフバーを更新＆追尾処理
    for (const enemy of this.enemies) {
      enemy.update(this.player);
    }
  }

  drawLifeBar(graphics, x, y, currentLife, maxLife) {
    graphics.clear();
    const barWidth = 50;
    const barHeight = 5;
    const lifePercentage = currentLife / maxLife;

    // 背景バー
    graphics.fillStyle(0x808080);
    graphics.fillRect(x - barWidth / 2, y, barWidth, barHeight);

    // ライフバー
    graphics.fillStyle(0xff0000);
    graphics.fillRect(x - barWidth / 2, y, barWidth * lifePercentage, barHeight);
  }

  spawnEnemies() {
    const currentSpawnCount = this.baseSpawnCount + Math.floor(this.timeElapsed / 60) * this.spawnIncreaseRate;

    for (let i = 0; i < currentSpawnCount; i++) {
      const spawnPositions = [
        { x: -50, y: Phaser.Math.Between(0, this.h) },
        { x: this.w + 50, y: Phaser.Math.Between(0, this.h) },
        { x: Phaser.Math.Between(0, this.w), y: -50 },
        { x: Phaser.Math.Between(0, this.w), y: this.h + 50 }
      ];
      const spawnPosition = Phaser.Math.RND.pick(spawnPositions);

      const enemy = new Enemy(this, spawnPosition.x, spawnPosition.y);
      this.enemies.push(enemy);
    }
  }


  playerAttack() {
    if (!this.isAttacking) {
      this.isAttacking = true;

      const attackGraphics = this.add.graphics();
      attackGraphics.lineStyle(2, 0x00ff00, 0.8);
      const attackRange = new Phaser.Geom.Rectangle(
        this.player.x - this.attackRange / 2,
        this.player.y - this.attackRange / 2,
        this.attackRange,
        this.attackRange
      );
      attackGraphics.strokeRectShape(attackRange);

      this.time.delayedCall(200, () => {
        attackGraphics.clear();
        this.isAttacking = false;
      });

      for (const enemy of this.enemies) {
        if (enemy && Phaser.Geom.Intersects.RectangleToRectangle(attackRange, enemy.getBounds())) {
          enemy.takeDamage(this.attackDamage);
          if (enemy.life <= 0) {
            this.enemies = this.enemies.filter(e => e !== enemy);
            this.score += 50;
            this.scoreText.setText('Score: ' + this.score);
            this.addExperience(30);
          }
        }
      }
    }
  }

  addExperience(amount) {
    this.playerExp += amount;
    if (this.playerExp >= this.expToNextLevel) {
      this.levelUp();
    }
    this.expText.setText(`EXP: ${this.playerExp} / ${this.expToNextLevel}`);
  }

  levelUp() {
    this.playerLevel++;
    this.playerExp -= this.expToNextLevel;
    this.expToNextLevel = Math.floor(this.expToNextLevel * 1.5);

    this.levelText.setText(`Level: ${this.playerLevel}`);
    this.expText.setText(`EXP: ${this.playerExp} / ${this.expToNextLevel}`);

    // ゲームを一時停止
    this.pauseGame();

    // レベルアップ効果の演出
    this.levelUpSound.play(); // 音を鳴らす
    this.createStarEffect(); // 星のエフェクトを表示
    this.showUpgradeOptions(); // アップグレード選択肢を表示
  }

  createStarEffect() {
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, this.w);
      const y = Phaser.Math.Between(0, this.h);
      const star = this.add.sprite(x, y, 'star').setScale(0.5);
      this.tweens.add({
        targets: star,
        alpha: 0,
        duration: 1000,
        onComplete: () => star.destroy()
      });
    }
  }

  pauseGame() {
    this.physics.pause();
    this.spawnTimer.paused = true;
    this.attackTimer.paused = true;
    this.gameTimer.paused = true;
  }

  resumeGame() {
    this.physics.resume();
    this.spawnTimer.paused = false;
    this.attackTimer.paused = false;
    this.gameTimer.paused = false;
  }

  showUpgradeOptions() {
    const upgradeText = this.add.text(this.w / 2, this.h / 2 - 100, 'Choose an Upgrade', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

    const attackButton = this.add.text(this.w / 2, this.h / 2 - 50, 'Increase Attack Damage', { fontSize: '24px', fill: '#fff' })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.attackDamage += 10;
        this.cleanupUpgradeUI(upgradeText, attackButton, rangeButton, speedButton);
      });

    const rangeButton = this.add.text(this.w / 2, this.h / 2, 'Increase Attack Range', { fontSize: '24px', fill: '#fff' })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.attackRange += 50;
        this.cleanupUpgradeUI(upgradeText, attackButton, rangeButton, speedButton);
      });

    const speedButton = this.add.text(this.w / 2, this.h / 2 + 50, 'Increase Move Speed', { fontSize: '24px', fill: '#fff' })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.playerSpeed += 20;
        this.cleanupUpgradeUI(upgradeText, attackButton, rangeButton, speedButton);
      });
  }

  cleanupUpgradeUI(upgradeText, ...buttons) {
    upgradeText.destroy();
    buttons.forEach(button => button.destroy());
    this.resumeGame();
  }

  updateTimer() {
    this.timeElapsed++;
    const minutes = Math.floor(this.timeElapsed / 60);
    const seconds = this.timeElapsed % 60;
    this.timerText.setText(`Time: ${this.formatTime(minutes)}:${this.formatTime(seconds)}`);
  }

  formatTime(value) {
    return value < 10 ? `0${value}` : value;
  }

  gameOver() {
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.scoreText.setText('Game Over');

    const retryText = this.add.text(300, 300, 'Retry? (Press R)', { fontSize: '32px', fill: '#fff' });
    this.input.keyboard.once('keydown-R', () => {
      this.life = 100;
      this.score = 0;
      this.enemies = [];
      this.timeElapsed = 0;
      this.scene.restart();
    });
  }
}
