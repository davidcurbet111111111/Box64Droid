const { execSync } = require("child_process");
const fs = require("fs");

function run(cmd) {
  try {
    execSync(cmd, { stdio: "inherit", shell: "/bin/bash" });
  } catch (e) {
    console.error("Failed:", cmd);
  }
}

// 📦 Install packages
function packages() {
  run("pkg install x11-repo glibc-repo -y");
  run("pkg install pulseaudio wget glibc git xkeyboard-config freetype fontconfig libpng xorg-xrandr termux-x11-nightly termux-am zenity which bash curl sed cabextract -y --no-install-recommends");
}

// 🧹 Remove previous install
function checkPrevVersion() {
  const paths = [
    "/data/data/com.termux/files/home/.wine",
    "/data/data/com.termux/files/usr/glibc",
    "/sdcard/Box64Droid"
  ];

  paths.forEach(p => {
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true, force: true });
    }
  });
}

// 📥 Install glibc
function installGlibc() {
  run("wget -q --show-progress https://github.com/Ilya114/Box64Droid/releases/download/alpha/glibc-prefix.tar.xz");
  run("tar -xJf glibc-prefix.tar.xz -C $PREFIX/");
}

// 📜 Install scripts + symlinks
function scripts() {
  run("wget -q https://raw.githubusercontent.com/davidcurbet111111111/Box64Droid/refs/heads/main/scripts/native/box64droid");
  run("wget -q https://raw.githubusercontent.com/davidcurbet111111111/Box64Droid/refs/heads/main/scripts/native/box64droid.py");
  run("wget -q https://raw.githubusercontent.com/Ilya114/Box64Droid/main/scripts/native/start-box64.py");
  run("wget -q https://raw.githubusercontent.com/Winetricks/winetricks/master/src/winetricks");

  run("chmod +x box64droid winetricks");
  run("mv box64droid box64droid.py start-box64.py winetricks $PREFIX/bin/");

  // Safe symlinks
  run("ln -sf $PREFIX/glibc/opt/wine/bin/wine $PREFIX/glibc/bin/wine");
  run("ln -sf $PREFIX/glibc/opt/wine/bin/wine64 $PREFIX/glibc/bin/wine64");
  run("ln -sf $PREFIX/glibc/opt/wine/bin/wineserver $PREFIX/glibc/bin/wineserver");
  run("ln -sf $PREFIX/glibc/opt/wine/bin/wineboot $PREFIX/glibc/bin/wineboot");
  run("ln -sf $PREFIX/glibc/opt/wine/bin/winecfg $PREFIX/glibc/bin/winecfg");
}

// 📱 Widget scripts (FIXED)
function downloadWidgetScripts() {
  const dir = "/data/data/com.termux/files/home/.shortcuts";
  run(`mkdir -p "${dir}"`);
  run(`chmod 700 -R "${dir}"`);

  const base = "https://raw.githubusercontent.com/Ilya114/Box64Droid/main/scripts/nativewd/";

  const files = [
    "1) Start Box64Droid",
    "2) Change Wine version",
    "3) Update Box64Droid",
    "4) Update Box64",
    "5) Open Winetricks",
    "6) Recreate Wine prefix",
    "7) Uninstall Box64Droid"
  ];

  files.forEach(name => {
    const escaped = name.replace(/\)/g, "\\)").replace(/ /g, "\\ ");
    run(`wget ${base}${escaped} -q -P "${dir}"`);
  });
}

// 🧼 Cleanup
function clearWaste() {
  run("rm -f glibc-prefix.tar.xz install native.js");
  run("clear");
}

// 📂 Storage permission
function storage() {
  if (!fs.existsSync("/data/data/com.termux/files/home/storage")) {
    run("termux-setup-storage");
  }
}

// ===== MAIN =====
run("clear");

console.log("Starting Box64Droid installation... Please allow storage permission!\n");

storage();

console.log("Installing packages (might be long)...\n");
packages();

console.log("Removing old versions...\n");
checkPrevVersion();

console.log("Downloading and unpacking glibc...\n");
installGlibc();

console.log("Downloading scripts...\n");
scripts();

console.log("Creating widget shortcuts...\n");
downloadWidgetScripts();

console.log("Cleaning up...\n");
clearWaste();

console.log('Installation finished!');
console.log('Use Termux:Widget → "1) Start Box64Droid"');
console.log('Or run: box64droid --start');
console.log('Help: box64droid --help\n');
console.log("If everything goes well, Wine and 7-Zip will start.\n");
