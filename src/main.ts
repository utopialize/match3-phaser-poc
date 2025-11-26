import Phaser from 'phaser';
import { GAME_CONFIG } from './config/GameConfig';
import { GameScene } from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: GAME_CONFIG.viewport.backgroundColor,
  width: GAME_CONFIG.viewport.width,
  height: GAME_CONFIG.viewport.height,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [GameScene]
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
