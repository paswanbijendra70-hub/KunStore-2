const fs = require('fs');
let code = fs.readFileSync('src/StoreFront.tsx', 'utf8');
code = code.replace(
  "const AppCard = ({ app }: { app: any }) => (",
  "const AppCard = ({ app, key }: { app: any, key?: string | number }) => ("
);
fs.writeFileSync('src/StoreFront.tsx', code);
