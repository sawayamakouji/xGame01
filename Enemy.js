export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture = 'enemy1') {
      super(scene, x, y, texture);
  
      // シーンに敵を 追加
      scene.add.existing(this);
      scene.physics.add.existing(this);
  
      // 敵の初期設定
      this.life = 50; // 最大ライフ
      this.maxLife = 50; // 初期ライフ
      this.speed = 50; // 追いかけ速度
  
      // ライフバー
      this.lifeBar = scene.add.graphics();
    }
  
    update(player) {
      // プレイヤーを追尾するロジック
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
  
      // ライフバーの更新
      this.updateLifeBar();
    }
  
    updateLifeBar() {
      this.lifeBar.clear();
      const barWidth = 50;
      const barHeight = 5;
      const lifePercentage = this.life / this.maxLife;
  
      this.lifeBar.fillStyle(0x808080);
      this.lifeBar.fillRect(this.x - barWidth / 2, this.y + 40, barWidth, barHeight);
      this.lifeBar.fillStyle(0xff0000);
      this.lifeBar.fillRect(this.x - barWidth / 2, this.y + 40, barWidth * lifePercentage, barHeight);
    }
  
    takeDamage(damage) {
      this.life -= damage;
      this.setTint(0xff0000); // 被弾エフェクト
      this.scene.time.delayedCall(100, () => this.clearTint()); // 一時的な赤い点滅
      if (this.life <= 0) {
        this.destroy();
        this.lifeBar.destroy(); // ライフバーも削除
      }
    }
  }
  