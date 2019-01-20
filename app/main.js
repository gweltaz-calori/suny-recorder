const { app, Menu, Tray, ipcMain, BrowserWindow } = require("electron");
const path = require("path");
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({ width: 0, height: 0, show: false });
  mainWindow.loadFile(path.resolve(__dirname, "./index.html"));
  //mainWindow.webContents.openDevTools();

  mainWindow.on("closed", function() {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", function() {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function() {
  if (mainWindow === null) {
    createWindow();
  }
});

let isRecording = false;

let tray = null;
app.on("ready", () => {
  tray = new Tray(path.resolve(__dirname, "./icons/record.png"));
  tray.on("click", () => {
    click();
  });
  updateTray();
});

function createMenu() {
  return Menu.buildFromTemplate([
    { label: isRecording ? "Stop Recording" : "Start Recording", click },
    { role: "quit" }
  ]);
}

function click() {
  isRecording = !isRecording;
  mainWindow.webContents.send(isRecording ? "RECORDING" : "STOPING");
  updateTray();
}

function updateTray() {
  tray.setContextMenu(createMenu());
  tray.setImage(
    isRecording
      ? path.resolve(__dirname, "./icons/stop.png")
      : path.resolve(__dirname, "./icons/record.png")
  );
}

ipcMain.on("hello", () => console.log("hello"));
