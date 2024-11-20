export default class VolumeSettings {
    constructor(scene) {
      this.scene = scene; // 呼び出し元のシーン
      this.isVisible = false; // 音量調整画面の表示状態
      this.effectVolume = typeof scene.effectVolume === 'number' ? scene.effectVolume : 1; // 効果音の初期音量
      this.musicVolume = typeof scene.musicVolume === 'number' ? scene.musicVolume : 1; // 音楽の初期音量
    }
    
  
    show() {
      if (this.isVisible) return; // 既に表示されている場合は無視
      this.isVisible = true;
  
      // 背景
      this.background = this.scene.add.rectangle(this.scene.w / 2, this.scene.h / 2, 400, 300, 0x000000, 0.8);
  
      // タイトル
      this.title = this.scene.add.text(this.scene.w / 2, this.scene.h / 2 - 100, 'Volume Settings', {
        fontSize: '32px',
        fill: '#fff',
      }).setOrigin(0.5);
  
      // 効果音スライダー
      this.effectVolumeSlider = this.createSlider(
        this.scene.w / 2,
        this.scene.h / 2 - 45,
        'Effect Volume: ',
        this.effectVolume,
        value => {
          this.effectVolume = value;
          this.scene.effectVolume = value; // シーンに値を反映
          this.scene.updateVolumes(); // 音量を更新
        }
      );
  
      // 音楽スライダー
      this.musicVolumeSlider = this.createSlider(
        this.scene.w / 2,
        this.scene.h / 2 + 55,
        'Music Volume: ',
        this.musicVolume,
        value => {
          this.musicVolume = value;
          this.scene.musicVolume = value; // シーンに値を反映
          this.scene.updateVolumes(); // 音量を更新
        }
      );
  
      // 閉じるボタン
      this.closeButton = this.scene.add.text(this.scene.w / 2, this.scene.h / 2 + 120, 'Close', {
        fontSize: '24px',
        fill: '#000',
        backgroundColor: '#fff',
        padding: { x: 10, y: 5 },
      })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerover', () => this.closeButton.setStyle({ fill: '#ff0000' }))
        .on('pointerout', () => this.closeButton.setStyle({ fill: '#000' }))
        .on('pointerdown', () => {
          this.hide();
          this.scene.resumeGame(); // ゲームを再開
        });
    }
  
    createSlider(x, y, label, initialValue, onChange) {
      const sliderWidth = 200;
    
      // ラベル
      const labelText = this.scene.add.text(x - sliderWidth / 2 - 60, y + 20, `${label} ${Math.round(initialValue * 100)}%`, {
        fontSize: '18px',
        fill: '#fff',
      });
    
      // スライダー背景
      const sliderBackground = this.scene.add.rectangle(x, y, sliderWidth, 10, 0xaaaaaa);
    
      // スライダーハンドル
      const sliderHandle = this.scene.add.rectangle(
        x - sliderWidth / 2 + sliderWidth * initialValue,
        y,
        20,
        30,
        0xffffff
      ).setInteractive({ draggable: true });
    
      // ドラッグ操作
      sliderHandle.on('drag', (pointer, dragX) => {
        const clampedX = Phaser.Math.Clamp(dragX, x - sliderWidth / 2, x + sliderWidth / 2);
        sliderHandle.x = clampedX;
    
        // 値を計算し、範囲を確保
        const value = Phaser.Math.Clamp((clampedX - (x - sliderWidth / 2)) / sliderWidth, 0, 1);
        labelText.setText(`${label} ${Math.round(value * 100)}%`);
        onChange(value);
      });
    
      return { labelText, sliderBackground, sliderHandle };
    }
    
  
    hide() {
      this.isVisible = false;
  
      // 全ての要素を削除
      this.background.destroy();
      this.title.destroy();
      this.effectVolumeSlider.labelText.destroy();
      this.effectVolumeSlider.sliderBackground.destroy();
      this.effectVolumeSlider.sliderHandle.destroy();
      this.musicVolumeSlider.labelText.destroy();
      this.musicVolumeSlider.sliderBackground.destroy();
      this.musicVolumeSlider.sliderHandle.destroy();
      this.closeButton.destroy();
    }
  }
  