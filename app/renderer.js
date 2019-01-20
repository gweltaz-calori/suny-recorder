const { desktopCapturer, screen, ipcRenderer, remote } = require("electron");
const fs = require("fs");

let recorder;
let blobs = [];

function startRecording() {
  desktopCapturer.getSources(
    { types: ["window", "screen"] },
    (error, sources) => {
      if (error) throw error;

      for (let i = 0; i < sources.length; ++i) {
        if (sources[i].name === "Entire screen") {
          navigator.mediaDevices
            .getUserMedia({
              audio: false,
              video: {
                mandatory: {
                  chromeMediaSource: "desktop",
                  chromeMediaSourceId: sources[i].id,
                  minWidth: screen.getPrimaryDisplay().size.width,
                  maxWidth: screen.getPrimaryDisplay().size.width,
                  minHeight: screen.getPrimaryDisplay().size.height,
                  maxHeight: screen.getPrimaryDisplay().size.height
                }
              }
            })
            .then(stream => handleStream(stream))
            .catch(e => handleError(e));
          return;
        }
      }
    }
  );
}

function toArrayBuffer(blob) {
  return new Promise(resolve => {
    let arrayBuffer;
    let fileReader = new FileReader();
    fileReader.onload = function(event) {
      resolve(event.target.result);
    };
    fileReader.readAsArrayBuffer(blob);
  });
}

function handleStream(stream) {
  blobs = [];
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = function(event) {
    blobs.push(event.data);
  };
  recorder.start();
}

function stopRecording() {
  function save() {
    remote.dialog.showSaveDialog(
      null,
      {
        filters: [
          {
            name: "Webm File",
            extensions: ["webm"]
          }
        ]
      },
      fileName => {
        toArrayBuffer(new Blob(blobs, { type: "video/webm" })).then(arr =>
          fs.writeFile(fileName, Buffer.from(arr), err => {})
        );
      }
    );
  }

  recorder.onstop = save;
  recorder.stop();
}

ipcRenderer.on("RECORDING", () => {
  startRecording();
});

ipcRenderer.on("STOPING", () => {
  stopRecording();
});
