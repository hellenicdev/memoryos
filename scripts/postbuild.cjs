const fs = require('fs');
const html = fs.readFileSync('dist/index.html', 'utf8');
const injected = html.replace(
  '<script type',
  '<script>if("serviceWorker"in navigator)navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(r){r.unregister()})})</script><script type'
);
fs.writeFileSync('dist/404.html', injected);
fs.writeFileSync('dist/index.html', injected);
