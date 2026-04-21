// root.js
const { execSync } = require("child_process");
const fs = require("fs");

function run(cmd) {
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (e) {
    console.error("❌ Error:", cmd);
  }
}

// detect root method
function rootCmd(cmd) {
  // try tsu (Termux root)
  try {
    execSync("which tsu", { stdio: "ignore" });
    run(`tsu -c "${cmd}"`);
  } catch {
    // fallback to sudo (if exists)
    run(`sudo ${cmd}`);
  }
}

function packages() {
  run("pkg install x11-repo -y");
  run("pkg install pulseaudio wget tsu xkeyboard-config termux-x11-nightly termux-am -y");
}

function check_prev_version() {
  rootCmd("rm -rf ~/ubuntu");
}

function install_rootfs() {
  rootCmd("mkdir -p ~/ubuntu");
  run("wget -q --show-progress https://github.com/Ilya114/Box64Droid/releases/download/stable/box64droid-rootfs-chroot.tar.xz");
  rootCmd("tar -xJf box64droid-rootfs-chroot.tar.xz -C ~/ubuntu");
  rootCmd("mkdir -p ~/ubuntu/dev/shm");
  rootCmd("chmod 1777 ~/ubuntu/dev/shm");
}

function scripts() {
  run("wget https://raw.githubusercontent.com/Ilya114/Box64Droid/main/scripts/root/box64droid");
  run("chmod +x box64droid");
  run("mv box64droid $PREFIX/bin/");
}

function clear_waste() {
  run("rm -f box64droid-rootfs-chroot.tar.xz install root.js");
  console.clear();
}

function storage() {
  if (!fs.existsSync("/data/data/com.termux/files/home/storage")) {
    run("termux-setup-storage");
  }
}

// MAIN
console.clear();
console.log("🚀 Starting Box64Droid installation...");
console.log("⚠️ Please allow storage permission!\n");

storage();

console.log("📦 Installing packages...\n");
packages();

console.log("🧹 Removing old versions...\n");
check_prev_version();

console.log("⬇️ Downloading and installing rootfs...\n");
install_rootfs();

console.log("📜 Downloading startup scripts...\n");
scripts();

console.log("🧼 Cleaning up...\n");
clear_waste();

console.log("✅ Installation finished!\n");
console.log("▶ Run: box64droid --start");
console.log("❓ Help: box64droid --help\n");
console.log("🍷 Wine and 7-Zip should start if everything works.\n");
