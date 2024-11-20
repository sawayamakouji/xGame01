import Enemy from './Enemy.js';
import VolumeSettings from './VolumeSettings.js';


export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }
  
  preload() {
  }

  create() {
    // キャンバス幅と高さを取得
    this.w = this.scale.width;
    this.h = this.scale.height;

    // 背景
    this.add.image(this.w / 2, this.h / 2, 'seen1').setDisplaySize(this.w, this.h);
    // ゲーム音楽を再生
    this.gameMusic = this.sound.add('gameMusic', { loop: true });
    this.gameMusic.play();
        // 音量調整画面の初期化
    this.volumeSettings = new VolumeSettings(this);

    // Qキーで音量調整画面を表示/非表示
    this.input.keyboard.on('keydown-Q', () => {
      console.log('Q key pressed');
      console.log('VolumeSettings visible:', this.volumeSettings.isVisible);
      if (this.volumeSettings.isVisible) {
        console.log('Hiding volume settings');
        this.volumeSettings.hide();
        this.resumeGame();
      } else {
        console.log('Showing volume settings');
        this.volumeSettings.show();
        this.pauseGame();
      }
    });


  
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
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff',
    stroke: '#000', // 黒い縁取り
    strokeThickness: 4 // 縁取りの厚さ

     });

    // タイマー表示
    this.timeElapsed = 0;
    this.timerText = this.add.text(this.w - 250, 16, 'Time: 00:00', { fontSize: '32px', fill: '#fff' ,
    stroke: '#000', // 黒い縁取り
    strokeThickness: 4 // 縁取りの厚さ

    });
  

    // 経験値・レベル表示
    this.expText = this.add.text(16, 50, `EXP: 0 / 100`, { fontSize: '32px', fill: '#fff' ,
    stroke: '#000', // 黒い縁取り
    strokeThickness: 4 // 縁取りの厚さ
    });
    this.levelText = this.add.text(16, 84, `Level: 1`, { fontSize: '32px', fill: '#fff',
    stroke: '#000', // 黒い縁取り 
    strokeThickness: 4 // 縁取りの厚さ

     });

    // プレイヤーのライフバー
    this.playerLifeBar = this.add.graphics();
    this.drawLifeBar(this.playerLifeBar, this.player.x, this.player.y + 40, this.life, 100);

    // キーボード入力
    this.cursors = this.input.keyboard.createCursorKeys();

    // 敵を時間とともに増やすタイマー
    this.spawnTimer = this.time.addEvent({
      delay: 3000,
      callback: this.spawnEnemies,
      callbackScope: this,
      loop: true
    });

    // プレイヤーの攻撃タイマー
    this.attackTimer = this.time.addEvent({
      delay: this.attackCooldown,
      callback: this.playerAttack,
      callbackScope: this,
      loop: true
    });

    // ゲームタイマー（1秒ごとに更新）
    this.gameTimer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // 敵との衝突処理を設定	
    this.enemiesGroup = this.physics.add.group();
    this.physics.add.overlap(this.player, this.enemiesGroup, this.handleCombat, null, this);    

    // レベルアップ音の準備
    this.levelUpSound = this.sound.add('levelUpSound');
    // 音声を準備
    this.playerAttackSound = this.sound.add('playerAttackSound');
    this.enemyHitSound = this.sound.add('enemyHitSound');
  }

  update() {
    // ゲームが一時停止中の場合は何も更新しない
    if (this.volumeSettings.isVisible) {
      this.player.setVelocity(0, 0); // プレイヤーを停止
      return;
    }

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

  updateVolumes() {
    if (typeof this.effectVolume === 'number') {
      console.log('Updating effect volume:', this.effectVolume);
      if (this.playerAttackSound) this.playerAttackSound.setVolume(this.effectVolume);
      if (this.enemyHitSound) this.enemyHitSound.setVolume(this.effectVolume);
      if (this.levelUpSound) this.levelUpSound.setVolume(this.effectVolume);
    } else {
      console.warn('Effect volume is not a valid number:', this.effectVolume);
    }
  
    if (typeof this.musicVolume === 'number') {
      console.log('Updating music volume:', this.musicVolume);
      if (this.gameMusic) this.gameMusic.setVolume(this.musicVolume);
    } else {
      console.warn('Music volume is not a valid number:', this.musicVolume);
    }
  }
  
  
  

  handleCombat(player, enemy) {
    if (!this.isInvincible) {
      this.life -= 10; // ライフを減らす
      this.drawLifeBar(this.playerLifeBar, this.player.x, this.player.y + 40, this.life, 100);
  
      // 無敵状態をオンにする
      this.isInvincible = true;
      this.player.setTint(0xff0000); // プレイヤーを赤く点滅
  
      // 一定時間後に無敵状態を解除
      this.time.delayedCall(1000, () => {
        this.isInvincible = false;
        this.player.clearTint();
      });
  
      if (this.life <= 0) {
        this.gameOver(); // ライフが0以下ならゲームオーバー
      }
    }
  }
  
  openVolumeSettings() {
    this.volumeSettings.show();

    // ゲームの物理演算とタイマーを停止
    this.physics.pause();
    this.time.timeScale = 0; // タイマーを停止
  }
    closeVolumeSettings() {
    this.volumeSettings.hide();

    // ゲームを再開
    this.physics.resume();
    this.time.timeScale = 1; // タイマーを再開
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
      // 敵をグループに追加

      if (!this.isAttacking) {
      this.enemiesGroup.add(enemy);
     }
    }
  }

  displayDamageText(x, y, damage) {
    // ダメージの色を決定
    let color = '#ffffff'; // デフォルトは白
    if (damage >= 21 && damage <= 40) {
      color = '#ffff00'; // 黄色
    } else if (damage >= 41 && damage <= 60) {
      color = '#ffa500'; // オレンジ
    } else if (damage >= 61) {
      color = '#ff0000'; // 赤
    }
  
    // テキストを追加
    const damageText = this.add.text(x, y, damage.toString(), {
      fontSize: '24px',
      fill: color,
      fontStyle: 'bold',
      stroke: '#000', // 黒い縁取り
      strokeThickness: 2 // 縁取りの厚さ
    }).setOrigin(0.5);
  
    // アニメーションで上昇させながら消す
    this.tweens.add({
      targets: damageText,
      y: y - 30, // 上に移動
      alpha: 0, // 透明にする
      duration: 1200, // 0.8秒で消える
      onComplete: () => damageText.destroy() // 完了後に削除
    });
  }
  

  playerAttack() {

    if (this.volumeSettings.isVisible) {
      return; // 音量設定画面が開いている間は攻撃を無効化
    }
    if (!this.isAttacking) 
      this.isAttacking = true;
          // プレイヤーの攻撃音を再生
      this.playerAttackSound.play();
  
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
        if (enemy.active && Phaser.Geom.Intersects.RectangleToRectangle(attackRange, enemy.getBounds())) {
          // ダメージを±10%の範囲でランダム化
          const randomFactor = Phaser.Math.FloatBetween(0.9, 1.1); // 0.9 ~ 1.1 の間の値
          const actualDamage = Math.floor(this.attackDamage * randomFactor); // 実際のダメージを計算
          
          // ダメージを表示
          this.displayDamageText(enemy.x, enemy.y, actualDamage);
          // 敵がダメージを受けたときの音を再生
          this.enemyHitSound.play();
          enemy.takeDamage(actualDamage);
          if (enemy.life <= 0) {
            this.enemies = this.enemies.filter(e => e !== enemy);
            this.score += 50;
            this.scoreText.setText('Score: ' + this.score);
            this.addExperience(30);
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
    console.log('Game paused'); // デバッグログ
    this.physics.pause();
    this.spawnTimer.paused = true;
    this.attackTimer.paused = true;
    this.gameTimer.paused = true;
  }
  
  resumeGame() {
    console.log('Game resumed'); // デバッグログ
    this.physics.resume();
    this.spawnTimer.paused = false;
    this.attackTimer.paused = false;
    this.gameTimer.paused = false;
  };

  

  showUpgradeOptions() {
    // 現在の入力を一時停止してキーイベントをリセット
    this.input.keyboard.removeAllListeners();
    // アップグレードタイトル
    const upgradeText = this.add.text(this.w / 2, this.h / 2 - 100, '🎁🎄Choose an Upgrade🌟🎅', { 
        fontSize: '32px', 
        fill: '#fff', 
        fontStyle: 'bold', 
        stroke: '#000',
        strokeThickness: 4
    }).setOrigin(0.5);
  
    // ボーナスの選択肢を定義
    const options = [
      { text: 'Increase Attack Damage', action: () => this.attackDamage += 10 },
      { text: 'Increase Attack Range', action: () => this.attackRange += 50 },
      { text: 'Increase Move Speed', action: () => this.playerSpeed += 20 }
  ];
  let selectedIndex = 0;

  // 各選択肢のテキストを作成
  const buttons = options.map((option, index) => {
      return this.add.text(this.w / 2, this.h / 2 - 50 + index * 50, option.text, { 
          fontSize: '24px', 
          fill: '#fff', 
          fontStyle: 'bold',
          stroke: '#000',
          strokeThickness: 4
      }).setOrigin(0.5);
  });

  // 選択中のボタンを強調
  const updateSelection = () => {
      buttons.forEach((button, index) => {
          if (index === selectedIndex) {
              button.setStyle({ fontSize: '28px', fill: '#ffff00' }); // 選択中は大きく黄色に
          } else {
              button.setStyle({ fontSize: '24px', fill: '#fff' }); // 通常は元のスタイル
          }
      });
  };

  // 初期選択を更新
  updateSelection();

  // 入力処理を登録
  const onKeyUp = () => {
      selectedIndex = (selectedIndex - 1 + options.length) % options.length; // 上に移動
      updateSelection();
  };
  const onKeyDown = () => {
      selectedIndex = (selectedIndex + 1) % options.length; // 下に移動
      updateSelection();
  };
  const onKeyEnter = () => {
      options[selectedIndex].action(); // 選択されたアクションを実行
      this.cleanupUpgradeUI(upgradeText, ...buttons); // UIをクリーンアップ
  };

  // キーボードイベントを登録
  this.input.keyboard.on('keydown-UP', onKeyUp);
  this.input.keyboard.on('keydown-DOWN', onKeyDown);
  this.input.keyboard.on('keydown-ENTER', onKeyEnter);

  // クリーンアップ時にリスナーを削除
  this.cleanupListeners = () => {
      this.input.keyboard.off('keydown-UP', onKeyUp);
      this.input.keyboard.off('keydown-DOWN', onKeyDown);
      this.input.keyboard.off('keydown-ENTER', onKeyEnter);
  };
}

cleanupUpgradeUI(upgradeText, ...buttons) {
  upgradeText.destroy();
  buttons.forEach(button => button.destroy());
  this.cleanupListeners(); // リスナーを削除
  this.resumeGame(); // ゲーム再開
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
    this.pauseGame() 
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.scoreText.setText('Game Over');

    const retryText = this.add.text(300, 300, 'Retry? (Press R)', { fontSize: '32px', fill: '#fff' });
    this.input.keyboard.once('keydown-R', () => {
      this.resumeGame();
      this.life = 100;
      this.score = 0;
      this.enemies = [];
      this.timeElapsed = 0;
      this.scene.restart();

    });
  }
}
