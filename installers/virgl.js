// virgl.js
const { execSync } = require("child_process");
const fs = require("fs");

function run(cmd) {
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (e) {
    console.error("❌ Error running:", cmd);
  }
}

function packages() {
  run("pkg install x11-repo -y");
  run("pkg install pulseaudio wget xkeyboard-config virglrenderer-android proot-distro termux-x11-nightly termux-am -y");
}

function check_prev_version() {
  const config = "/sdcard/Box64Droid";
  if (fs.existsSync(config)) {
    run(`rm -rf ${config}`);
  }
  run("proot-distro remove ubuntu-box64droid");
}

function install_rootfs() {
  run("mkdir -p $PREFIX/var/lib/proot-distro/installed-rootfs/ubuntu");
  run("wget -q --show-progress https://github.com/Ilya114/Box64Droid/releases/download/stable/box64droid-rootfs-virgl.tar.xz");
  run("proot-distro restore box64droid-rootfs-virgl.tar.xz");
}

function scripts() {
  run("wget https://raw.githubusercontent.com/Ilya114/Box64Droid/main/scripts/virgl/box64droid");
  run("wget https://raw.githubusercontent.com/Ilya114/Box64Droid/main/scripts/non-root/start-box64droid");
  run("chmod +x start-box64droid box64droid");
  run("mv box64droid start-box64droid $PREFIX/bin/");
}

function clear_waste() {
  run("rm -f box64droid-rootfs-virgl.tar.xz install virgl.js");
  console.clear();
}

function storage() {
  if (!fs.existsSync("/data/data/com.termux/files/home/storage")) {
    run("termux-setup-storage");
  }
}

// MAIN
console.clear();
console.log("🚀 Starting Box64Droid (VirGL / non-root) installation...");
console.log("⚠️ Please allow storage permission!\n");

storage();

console.log("📦 Installing packages...\n");
packages();

console.log("🧹 Removing previous versions...\n");
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
console.log("🎮 Wine + 7-Zip should start if everything works.\n");
