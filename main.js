const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };
  
  const game = new Phaser.Game(config);
  
  let player;
  let cursors;
  let score = 0;
  let life = 100; // プレイヤーの初期ライフ
  let scoreText;
  let playerLifeBar;
  let enemies = []; // 敵を管理する配列
  let enemyLifeBars = []; // 敵のライフバーを管理する配列
  let attackCooldown = 1000; // 攻撃間隔
  let attackDamage = 20;
  let isAttacking = false; // プレイヤーが攻撃中かどうか
  let isInvincible = false; // プレイヤーが無敵状態かどうか
  let enemyChaseSpeed = 50; // 敵が追いかける速度
  
  function preload() {
    this.load.image('player', 'assets/player.png'); // 主人公
    this.load.image('enemy', 'assets/enemy.png');   // 敵
  }
  
  function create() {
    // プレイヤーを追加
    player = this.physics.add.sprite(400, 300, 'player');
    player.setCollideWorldBounds(true);
  
    // スコア表示
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
  
    // プレイヤーのライフバー
    playerLifeBar = this.add.graphics();
    drawLifeBar(playerLifeBar, player.x, player.y + 40, life, 100);
  
    // キーボード入力
    cursors = this.input.keyboard.createCursorKeys();
  
    // 敵を時間とともに増やすタイマー
    this.time.addEvent({
      delay: 3000, // 3秒ごとに敵を追加
      callback: spawnEnemy,
      callbackScope: this,
      loop: true
    });
  
    // プレイヤーの攻撃タイマー
    this.time.addEvent({
      delay: attackCooldown,
      callback: playerAttack,
      callbackScope: this,
      loop: true
    });
  }
  
  function update() {
    // プレイヤーの移動
    if (cursors.left.isDown) {
      player.setVelocityX(-200);
    } else if (cursors.right.isDown) {
      player.setVelocityX(200);
    } else {
      player.setVelocityX(0);
    }
  
    if (cursors.up.isDown) {
      player.setVelocityY(-200);
    } else if (cursors.down.isDown) {
      player.setVelocityY(200);
    } else {
      player.setVelocityY(0);
    }
  
    // プレイヤーのライフバーを更新
    drawLifeBar(playerLifeBar, player.x, player.y + 40, life, 100);
  
    // 敵のライフバーを更新＆敵がプレイヤーを追いかける処理
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      if (enemy) {
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
        const velocityX = Math.cos(angle) * enemyChaseSpeed;
        const velocityY = Math.sin(angle) * enemyChaseSpeed;
        enemy.setVelocity(velocityX, velocityY);
  
        // 敵のライフバーを更新
        drawLifeBar(enemyLifeBars[i], enemy.x, enemy.y + 40, enemy.life, enemy.maxLife);
      }
    }
  }
  
  function drawLifeBar(graphics, x, y, currentLife, maxLife) {
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
  
  function spawnEnemy() {
    const spawnPositions = [
      { x: -50, y: Phaser.Math.Between(0, 600) },
      { x: 850, y: Phaser.Math.Between(0, 600) },
      { x: Phaser.Math.Between(0, 800), y: -50 },
      { x: Phaser.Math.Between(0, 800), y: 650 }
    ];
    const spawnPosition = Phaser.Math.RND.pick(spawnPositions);
  
    const enemy = this.physics.add.sprite(spawnPosition.x, spawnPosition.y, 'enemy');
    enemy.life = 50; // 初期ライフ
    enemy.maxLife = 50; // 最大ライフ
  
    // ライフバー
    const lifeBar = this.add.graphics();
  
    enemies.push(enemy);
    enemyLifeBars.push(lifeBar);
  
    // 衝突処理を追加
    this.physics.add.overlap(player, enemy, () => handleCombat(enemy), null, this);
  }
  
  function playerAttack() {
    if (!isAttacking) {
      isAttacking = true;
  
      const attackGraphics = this.add.graphics();
      attackGraphics.lineStyle(2, 0x00ff00, 0.8);
      const attackRange = new Phaser.Geom.Rectangle(
        player.x - 100, player.y - 100, 200, 200
      );
      attackGraphics.strokeRectShape(attackRange);
  
      this.time.delayedCall(200, () => {
        attackGraphics.clear();
        isAttacking = false;
      });
  
      for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (enemy && Phaser.Geom.Intersects.RectangleToRectangle(attackRange, enemy.getBounds())) {
          enemy.life -= attackDamage;
          enemy.setTint(0xff0000);
          this.time.delayedCall(100, () => {
            enemy.clearTint();
          });
          if (enemy.life <= 0) {
            enemy.destroy();
            enemyLifeBars[i].destroy();
            enemies[i] = null;
            enemyLifeBars[i] = null;
            score += 50;
            scoreText.setText('Score: ' + score);
          }
        }
      }
    }
  }
  
  function handleCombat(enemy) {
    if (!isInvincible) {
      life -= 10;
      drawLifeBar(playerLifeBar, player.x, player.y + 40, life, 100);
  
      const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
      player.x += Math.cos(angle) * 50;
      player.y += Math.sin(angle) * 50;
  
      isInvincible = true;
      player.setTint(0xff0000);
  
      const scene = player.scene; // シーン参照を取得
      scene.time.delayedCall(1000, () => {
        isInvincible = false;
        player.clearTint();
      });
  
      if (life <= 0) {
        gameOver.call(scene);
      }
    }
  }
  
  function gameOver() {
    this.physics.pause();
    player.setTint(0xff0000);
    scoreText.setText('Game Over');
  
    const retryText = this.add.text(300, 300, 'Retry? (Press R)', { fontSize: '32px', fill: '#fff' });
    this.input.keyboard.once('keydown-R', () => {
      life = 100;
      score = 0;
      enemies = [];
      enemyLifeBars = [];
      this.scene.restart();
    });
  }
  