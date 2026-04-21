#!/usr/bin/env node

const { execSync } = require("child_process");
const readline = require("readline");
const fs = require("fs");

function run(cmd) {
    try {
        execSync(cmd, { stdio: "inherit" });
    } catch (e) {}
}

function clear() {
    process.stdout.write("\x1Bc");
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// ----------------------
// Load configs (SAFE)
// ----------------------
function loadConfig(path) {
    if (fs.existsSync(path)) {
        console.log("Loading config:", path);
        // Instead of exec(), just read or parse if needed
    }
}

loadConfig("/sdcard/Box64Droid (native)/Box64Droid.conf");
loadConfig("/sdcard/Box64Droid (native)/DXVK_D8VK_HUD.conf");

// ----------------------
// Menu
// ----------------------
function menu() {
    clear();

    if (process.env.WD) {
        console.log("Welcome to Box64Droid! Select resolution:\n");
    } else {
        console.log("Select resolution:\n");
    }

    console.log("1) 800x600 (4:3)");
    console.log("2) 1024x768 (4:3)");
    console.log("3) 1280x720 (16:9)");
    console.log("4) 1920x1080 (16:9)");
    console.log("5) Custom resolution");
    console.log(process.env.WD ? "6) Exit" : "6) Back\n");

    rl.question("Choice: ", (res) => {

        let resolution = "";

        switch (res.trim()) {
            case "1": resolution = "800x600"; break;
            case "2": resolution = "1024x768"; break;
            case "3": resolution = "1280x720"; break;
            case "4": resolution = "1920x1080"; break;

            case "5":
                rl.question("Enter resolution (e.g. 1366x768): ", (custom) => {
                    if (!custom) {
                        console.log("❌ Empty resolution!");
                        return menu();
                    }
                    startWine(custom);
                });
                return;

            case "6":
                if (process.env.WD) process.exit();
                run("node $PREFIX/bin/start-box64.js");
                process.exit();

            default:
                console.log("❌ Invalid option!");
                return setTimeout(menu, 1000);
        }

        startWine(resolution);
    });
}

// ----------------------
// Start Wine
// ----------------------
function startWine(resolution) {
    clear();

    console.log("\nStarting Wine with resolution:", resolution);
    console.log("Press '1' to exit or '2' to go back\n");

    run(`taskset -c 4-7 box64 wine explorer /desktop=shell,${resolution} $PREFIX/glibc/opt/autostart.bat &>/dev/null &`);
    run("am start -n com.termux.x11/com.termux.x11.MainActivity &>/dev/null");

    rl.question("> ", (stop) => {
        console.log("Stopping Wine...");
        run("box64 wineserver -k");

        if (stop.trim() === "2") {
            if (process.env.WD) {
                run("node $PREFIX/bin/start-box64.js");
            } else {
                run("python $PREFIX/bin/box64droid.py --start");
            }
        } else {
            console.log("Stopping Termux-X11...");
            run("pkill -f pulseaudio");
            run("pkill -f 'app_process / com.termux.x11'");
        }

        process.exit();
    });
}

// ----------------------
menu();
