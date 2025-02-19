ipcMain.on("print-bill", (event, billHTML) => {
    // RETSOL RTP 82 settings (80mm thermal printer)
    const paperWidthPx = 512; // Slightly reduced width to ensure fit
    const barcodeHeight = 50;
    const fontSize = 12;
    const textMargin = 5;
  
    const canvasHeight = barcodeHeight + fontSize + textMargin;
    const canvas = createCanvas(paperWidthPx, canvasHeight);
    const ctx = canvas.getContext("2d");
  
    // Simplified barcode settings
    JsBarcode(canvas, "EXAMPLE123456789", {
      format: "CODE128",
      displayValue: false,
      height: barcodeHeight,
      width: 2,
      margin: 10,
      background: "#fff",
      lineColor: "#000",
    });
  
    // Simple text placement
    const text = "EXAMPLE-123456789";
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "left";
    ctx.fillStyle = "#000";
    ctx.fillText(text, paperWidthPx / 2, barcodeHeight + fontSize);
  
    const barcodeDataURL = canvas.toDataURL();
  
    // Simplified HTML structure
    const styledHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              width: ${paperWidthPx}px;
              margin: 0;
              padding: 0;
              font-family: Arial;
              font-size: 12px;
            }
            .bill-container {
              width: 100%;
            }
            .barcode {
              text-align: center;
              margin: 10px 0;
              margin-left: 0px;
            }
            .barcode img {
              max-width: 100%;
            }
          </style>
        </head>
        <body>
          <div class="bill-container">
            ${billHTML}
          </div>
          <div class="barcode">
            <img src="${barcodeDataURL}" alt="Barcode" >
          </div>
        </body>
      </html>
    `;
  
    // Create print window
    const printWindow = new BrowserWindow({
      show: false,
      width: paperWidthPx,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
      },
    });
  
    // Load and print
    printWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(styledHTML)}`
    );
  
    printWindow.webContents.on("did-finish-load", () => {
      // Basic print settings
      printWindow.webContents.print(
        {
          silent: true,
          printBackground: true,
          margins: {
            marginType: "none",
          },
          landscape: false,
          scaleFactor: 100,
        },
        (success, errorType) => {
          if (!success) {
            console.error(`Print failed: ${errorType}`);
          }
          printWindow.close();
        }
      );
    });
  });




// ipcMain.on("print-bill", (event, billHTML, barcode) => {
//   // console.log(barcode, "some of the game is her");
  
//   // RETSOL RTP 82 settings (80mm thermal printer)
//   const paperWidthPx = 512; // Slightly reduced width to ensure fit
//   const barcodeHeight = 50;
//   const fontSize = 12;
//   const textMargin = 5;

//   let barcodeDataURL = '';

//   // console.log(billHTML, barcode, "somer is here");
  
//   if (barcode) {
//     const canvasHeight = barcodeHeight + fontSize + textMargin;
//     const canvas = createCanvas(paperWidthPx, canvasHeight);
//     const ctx = canvas.getContext("2d");
  
//     // Simplified barcode settings
//     JsBarcode(canvas, barcode, {
//       format: "CODE128",
//       displayValue: false,
//       height: barcodeHeight,
//       width: 2,
//       margin: 10,
//       background: "#fff",
//       lineColor: "#000",
//     });
  
//     // Simple text placement
//     const text = barcode;
//     ctx.font = `${fontSize}px Arial`;
//     ctx.textAlign = "left";
//     ctx.fillStyle = "#000";
//     ctx.fillText(text, 10, barcodeHeight + fontSize); // Adjusted text position to be below the barcode

//     barcodeDataURL = canvas.toDataURL();
//   }

//   // Simplified HTML structure
//   const styledHTML = /*html*/ `
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <style>
//           body {
//             width: ${paperWidthPx}px;
//             margin: 0;
//             padding: 0;
//             font-family: Arial;
//             font-size: 10px;
//           }
//           .bill-container {
//             width: 100%;
//           }
//           .barcode {
//             text-align: left; /* Align barcode to the left */
//             margin: 10px 0;
//           }
//           .barcode img {
//             max-width: 100%;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="bill-container">
//           ${billHTML}
//         </div>
//         ${ barcode ? `<div class="barcode">
//           <img style="width: 270px; height: 48px;" src="${barcodeDataURL}" alt="Barcode" />
//           <p style="font-size: 14px; font-weight: bold; position: relative; top: -14px" >${barcode}</p>
//         </div>` : ''}
//       </body>
//     </html>
//   `;

//   // Create print window
//   const printWindow = new BrowserWindow({
//     show: false,
//     width: paperWidthPx,
//     height: 600,
//     webPreferences: {
//       nodeIntegration: true,
//     },
//   });

//   // Load and print
//   printWindow.loadURL(
//     `data:text/html;charset=utf-8,${encodeURIComponent(styledHTML)}`
//   );

//   printWindow.webContents.on("did-finish-load", () => {
//     // Basic print settings
//     // printWindow.webContents.print(
//     //   {
//     //     silent: true,
//     //     printBackground: true,
//     //     margins: {
//     //       marginType: "none",
//     //     },
//     //     landscape: false,
//     //     scaleFactor: 100,
//     //   },
//     //   (success, errorType) => {
//     //     if (!success) {
//     //       console.error(`Print failed: ${errorType}`);
//     //     }
//     //     printWindow.close();
//     //   }
//     // );

//     printWindow.webContents
//     .executeJavaScript(
//       `
//     new Promise((resolve) => {
//       const width = document.documentElement.scrollWidth;
//       const height = document.documentElement.scrollHeight;
//       resolve({ width, height });
//     });
//   `
//     )
//     .then(({ width, height }) => {
//       printWindow.setBounds({
//         x: 0,
//         y: 0,
//         width: Math.ceil(width),
//         height: Math.ceil(height),
//       });

//       // Show the resized window for debugging (optional)
//       // printWindow.show();

//       // Print silently after resizing
//       printWindow.webContents.print(
//         { silent: true, printBackground: true },
//         (success, errorType) => {
//           if (!success) console.error(`Print failed: ${errorType}`);
//           printWindow.close();
//         }
//       );
//     })
//     .catch((err) => {
//       console.error("Error resizing window:", err);
//     });
//   });
// });

// ipcMain.on("print-bill", (event, billHTML, barcode) => {
//   // RETSOL RTP 82 settings (80mm thermal printer)
//   const paperWidthPx = 512;
//   const barcodeHeight = 50;
//   const fontSize = 12;
//   const textMargin = 5;

//   let barcodeDataURL = '';
  
//   if (barcode) {
//     const canvasHeight = barcodeHeight + fontSize + textMargin;
//     const canvas = createCanvas(paperWidthPx, canvasHeight);
//     const ctx = canvas.getContext("2d");
  
//     JsBarcode(canvas, barcode, {
//       format: "CODE128",
//       displayValue: false,
//       height: barcodeHeight,
//       width: 2,
//       margin: 10,
//       background: "#fff",
//       lineColor: "#000",
//     });
  
//     const text = barcode;
//     ctx.font = `${fontSize}px Arial`;
//     ctx.textAlign = "left";
//     ctx.fillStyle = "#000";
//     ctx.fillText(text, 10, barcodeHeight + fontSize);

//     barcodeDataURL = canvas.toDataURL();
//   }

//   const styledHTML = `
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <meta charset="UTF-8">
//         <style>
//           @media print {
//             body {
//               -webkit-print-color-adjust: exact;
//               width: ${paperWidthPx}px;
//               margin: 0;
//               padding: 0;
//               font-family: Arial;
//               font-size: 10px;
//             }
//             .bill-container {
//               width: 100%;
//             }
//             .barcode {
//               text-align: left;
//               margin: 10px 0;
//             }
//             .barcode img {
//               max-width: 100%;
//             }
//           }
//         </style>
//       </head>
//       <body>
//         <div class="bill-container">
//           ${billHTML}
//         </div>
//         ${barcode ? `
//           <div class="barcode">
//             <img style="width: 270px; height: 48px;" src="${barcodeDataURL}" alt="Barcode" />
//             <p style="font-size: 14px; font-weight: bold; position: relative; top: -14px">${barcode}</p>
//           </div>
//         ` : ''}
//       </body>
//     </html>
//   `;

//   const printWindow = new BrowserWindow({
//     show: false,
//     width: paperWidthPx,
//     height: 600,
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: false  // Note: In production, you should use a more secure approach
//     },
//   });

//   printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(styledHTML)}`);

//   // Wait for content to load
//   printWindow.webContents.on("did-finish-load", () => {
//     // First get the page dimensions
//     printWindow.webContents
//       .executeJavaScript(`
//         new Promise((resolve) => {
//           // Wait a bit for any images to load
//           setTimeout(() => {
//             const width = document.documentElement.scrollWidth;
//             const height = document.documentElement.scrollHeight;
//             resolve({ width, height });
//           }, 500);
//         });
//       `)
//       .then(({ width, height }) => {
//         // Resize window to match content
//         printWindow.setBounds({
//           x: 0,
//           y: 0,
//           width: Math.ceil(width),
//           height: Math.ceil(height),
//         });

//         // Print settings
//         const printOptions = {
//           silent: true,
//           printBackground: true,
//           margins: {
//             marginType: 'none'
//           },
//           deviceName: '', // You can specify your thermal printer name here
//           pageSize: {
//             width: Math.ceil(width) * 1000,
//             height: Math.ceil(height) * 1000
//           }
//         };

//         // Print the content
//         printWindow.webContents.print(printOptions, (success, errorType) => {
//           if (!success) {
//             console.error(`Print failed: ${errorType}`);
//             event.reply('print-error', errorType);
//           } else {
//             event.reply('print-success');
//           }
//           printWindow.close();
//         });
//       })
//       .catch((err) => {
//         console.error("Error during print:", err);
//         event.reply('print-error', err.message);
//         printWindow.close();
//       });
//   });

//   // Handle load errors
//   printWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
//     console.error('Failed to load print window:', errorDescription);
//     event.reply('print-error', errorDescription);
//     printWindow.close();
//   });
// });

