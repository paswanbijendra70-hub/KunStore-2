const fs = require('fs');
let code = fs.readFileSync('src/SubmitApp.tsx', 'utf8');
code = code.replace(
  "const promises = Array.from(files).slice(0, 4).map(f => processImage(f, 800));",
  "const promises = Array.from(files).slice(0, 4).map(f => processImage(f as File, 800));"
);
fs.writeFileSync('src/SubmitApp.tsx', code);
