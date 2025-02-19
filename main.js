const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const JsBarcode = require("jsbarcode");
const { createCanvas } = require("canvas");

let mainWindow;
let savedPrinterSettings = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const indexPath = path.join(__dirname, 'index.html');
  console.log('Loading from:', indexPath);
  
  mainWindow.loadFile(indexPath).catch(err => {
    console.error('Failed to load:', err);
  });

};

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on("print-bill", (event, billHTML, barcode) => {
  // RETSOL RTP 82 specific settings (80mm thermal printer)
  const paperWidthMM = 80; // 80mm paper width
  const paperWidthPx = Math.floor(paperWidthMM * 8); // Approximate conversion to pixels (1mm ≈ 8px)
  let barcodeDataURL = '';

  if (barcode) {
    const canvas = createCanvas(paperWidthPx, 100);
    const ctx = canvas.getContext("2d");
    
    JsBarcode(canvas, barcode, {
      format: "CODE128",
      displayValue: false,
      height: 50,
      width: 2,
      margin: 10
    });
    
    barcodeDataURL = canvas.toDataURL();
  }

  const styledHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            width: ${paperWidthPx}px;
            padding: 4px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            background-color: white !important;
            color: black !important;
          }
          .bill-container {
            width: 100%;
            background-color: white !important;
            color: black !important;
          }
          @media print {
            html, body {
              width: 80mm;
              margin: 0 !important;
              padding: 4px !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              background-color: white !important;
              color: black !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="bill-container">
          ${billHTML}
        </div>
        ${barcode ? `
          <div style="margin: 10px 0;">
            <img style="width: 320px; height: 52px; display: block;" src="${barcodeDataURL}" alt="Barcode" />
            <p style="margin: 5px 0; font-size: 14px;">${barcode}</p>
          </div>
        ` : ''}
      </body>
    </html>
  `;

  let printWindow = new BrowserWindow({
    width: paperWidthPx,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(styledHTML)}`);

  printWindow.webContents.on('did-finish-load', () => {
    setTimeout(() => {
      // Get the actual content height
      printWindow.webContents.executeJavaScript(`
        document.body.scrollHeight;
      `).then((contentHeight) => {
        const options = {
          silent: false,
          deviceName: 'RETSOL RTP82',
          printBackground: true,
          copies: 1,
          pageSize: { 
            width: 80000,
            height: Math.max(contentHeight * 1000, 10000) // Convert to microns with minimum height
          },
          margins: {
            marginType: 'none'
          },
          preferCSSPageSize: true,
          printSelectionOnly: false,
          landscape: false
        };

        try {
          printWindow.webContents.print(options, (success, failureReason) => {
            if (success) {
              console.log('Print successful');
              event.reply('print-success');
              setTimeout(() => {
                printWindow.close();
                printWindow = null;
              }, 1000);
            } else {
              console.error('Print failed:', failureReason);
              // If silent print fails, try with dialog
              const dialogOptions = { ...options, silent: false };
              printWindow.webContents.print(dialogOptions, (dialogSuccess, dialogFailureReason) => {
                if (dialogSuccess) {
                  console.log('Dialog print successful');
                  event.reply('print-success');
                } else {
                  console.error('Dialog print failed:', dialogFailureReason);
                  event.reply('print-error', dialogFailureReason);
                }
                setTimeout(() => {
                  printWindow.close();
                  printWindow = null;
                }, 1000);
              });
            }
          });
        } catch (error) {
          console.error('Print error:', error);
          event.reply('print-error', error.message);
          printWindow.close();
        }
      }).catch(err => {
        console.error('Error getting content height:', err);
        event.reply('print-error', err.message);
        printWindow.close();
      });
    }, 1000);
  });

  printWindow.webContents.on('did-fail-load', (error, errorCode, errorDescription) => {
    console.error('Failed to load:', errorDescription);
    event.reply('print-error', errorDescription);
    printWindow.close();
  });
});

ipcMain.on('save-printer-settings', (event, settings) => {
  savedPrinterSettings = settings;
  console.log('Saved printer settings:', settings);
});

ipcMain.on('set-printer', (event, printerName) => {
  defaultPrinterName = printerName;
  event.reply('printer-set', defaultPrinterName);
});

ipcMain.handle('get-printers', (event) => {
  const window = BrowserWindow.getAllWindows()[0];
  return window.webContents.getPrinters();
});

ipcMain.on("window-minimize", () => {
  console.log("call minimized 1234");
  
  mainWindow.minimize();
});

ipcMain.on("window-close", () => {
  mainWindow.close();
});