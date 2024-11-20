const { app, BrowserWindow } = require('electron'); // CommonJS形式

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1850, // ウィンドウの幅
    height: 650, // ウィンドウの高さ
    resizable: true, // ウィンドウをリサイズ可能
    fullscreenable: false, // フルスクリーンを禁止
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html'); // HTMLファイルを読み込む
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
