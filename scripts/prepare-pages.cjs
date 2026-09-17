const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(dist)) {
  console.error('dist/ missing. Run expo export first.');
  process.exit(1);
}

const redirects = path.join(dist, '_redirects');
if (fs.existsSync(redirects)) {
  fs.unlinkSync(redirects);
}

const expoDir = path.join(dist, '_expo');
const bundleDir = path.join(dist, 'bundle');
if (fs.existsSync(expoDir)) {
  if (fs.existsSync(bundleDir)) {
    fs.rmSync(bundleDir, { recursive: true, force: true });
  }
  fs.renameSync(expoDir, bundleDir);
}

const nestedFonts = path.join(
  dist,
  'assets',
  'node_modules',
  '@expo',
  'vector-icons',
  'build',
  'vendor',
  'react-native-vector-icons',
  'Fonts'
);
const flatFonts = path.join(dist, 'assets', 'icon-fonts');
fs.mkdirSync(flatFonts, { recursive: true });
if (fs.existsSync(nestedFonts)) {
  for (const file of fs.readdirSync(nestedFonts)) {
    if (file.endsWith('.ttf')) {
      fs.copyFileSync(path.join(nestedFonts, file), path.join(flatFonts, file));
    }
  }
}

const extraFonts = path.join(dist, 'fonts');
if (fs.existsSync(extraFonts)) {
  fs.rmSync(extraFonts, { recursive: true, force: true });
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

const nestedPrefix = '/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/';
const flatPrefix = '/assets/icon-fonts/';

for (const file of walk(dist)) {
  if (!/\.(html|js)$/i.test(file)) continue;
  let text = fs.readFileSync(file, 'utf8');
  const next = text
    .replaceAll('/_expo/', '/bundle/')
    .replaceAll(nestedPrefix, flatPrefix);
  if (next !== text) {
    fs.writeFileSync(file, next);
  }
}

const authDir = path.join(dist, 'auth');
fs.mkdirSync(authDir, { recursive: true });
fs.writeFileSync(
  path.join(authDir, 'callback.html'),
  `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Google Sign-In</title>
</head>
<body>
  <p>Đang hoàn tất đăng nhập Google...</p>
  <script>
    (function () {
      var params = new URLSearchParams(String(location.hash || '').replace(/^#/, ''));
      var search = new URLSearchParams(String(location.search || '').replace(/^\\?/, ''));
      var payload = {
        type: 'google-oauth',
        idToken: params.get('id_token') || search.get('id_token'),
        error: params.get('error') || search.get('error')
      };
      if (window.opener) {
        window.opener.postMessage(payload, location.origin);
      }
      setTimeout(function () { window.close(); }, 250);
    })();
  </script>
</body>
</html>
`
);

fs.writeFileSync(
  path.join(dist, '_routes.json'),
  JSON.stringify(
    {
      version: 1,
      include: ['/api/*'],
      exclude: ['/bundle/*', '/assets/*', '/favicon.ico', '/auth/*'],
    },
    null,
    2
  )
);

console.log('Prepared Cloudflare Pages dist/ (bundle + flattened icon fonts, no SPA rewrite)');
