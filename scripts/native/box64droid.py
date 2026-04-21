#!/usr/bin/env python3

import os
import sys
import shutil

ver = "311224"

# ---------------- START ----------------
def start_box64droid():
    os.system("clear")

    if "LD_PRELOAD" in os.environ:
        del os.environ["LD_PRELOAD"]

    print("Starting Termux-X11...")
    os.system("termux-x11 :0 >/dev/null 2>&1 &")

    print("Starting PulseAudio...")
    os.system(
        'pulseaudio --start --load="module-native-protocol-tcp auth-ip-acl=127.0.0.1 auth-anonymous=1" --exit-idle-time=-1 >/dev/null 2>&1'
    )

# ---------------- CONFIG ----------------
def check_config():
    config_folder = "/sdcard/Box64Droid (native)/"
    box64_conf = config_folder + "Box64Droid.conf"
    dxvk_conf = config_folder + "DXVK_D8VK.conf"
    dxvk_hud = config_folder + "DXVK_D8VK_HUD.conf"

    print("Checking configuration...")
    os.makedirs(config_folder, exist_ok=True)

    if not os.path.exists(box64_conf):
        shutil.copyfile(
            "/data/data/com.termux/files/usr/glibc/opt/Box64Droid.conf",
            box64_conf,
        )

    if not os.path.exists(dxvk_conf):
        shutil.copyfile(
            "/data/data/com.termux/files/usr/glibc/opt/DXVK_D8VK.conf",
            dxvk_conf,
        )

    if not os.path.exists(dxvk_hud):
        shutil.copyfile(
            "/data/data/com.termux/files/usr/glibc/opt/DXVK_D8VK_HUD.conf",
            dxvk_hud,
        )

    exec(open(box64_conf).read(), globals())
    exec(open(dxvk_hud).read(), globals())

# ---------------- PREFIX ----------------
def check_prefix():
    if not os.path.exists(os.path.expanduser("~/.wine")):
        print("Wine prefix not found! Creating...")
        create_prefix()

def recreate_prefix():
    prefix = os.path.expanduser("~/.wine")

    os.system("clear")
    print("Removing previous Wine prefix...")

    if os.path.exists(prefix):
        shutil.rmtree(prefix)

    print("Creating Wine prefix...")
    create_prefix()

def create_prefix():
    os.system('WINEDLLOVERRIDES="mscoree=" box64 wineboot >/dev/null 2>&1')

    os.system(
        'cp -r $PREFIX/glibc/opt/Shortcuts/* "$HOME/.wine/drive_c/ProgramData/Microsoft/Windows/Start Menu"'
    )

    os.system("rm -f $HOME/.wine/dosdevices/z:")
    os.system("rm -f $HOME/.wine/dosdevices/d:")

    os.system("ln -s /sdcard/Download $HOME/.wine/dosdevices/d:")
    os.system("ln -s /sdcard $HOME/.wine/dosdevices/e:")
    os.system("ln -s /data/data/com.termux/files $HOME/.wine/dosdevices/z:")

    print("Installing DXVK / D8VK / VKD3D...")

    os.system(
        'box64 wine "$PREFIX/glibc/opt/Resources64/DXVK2.3/DXVK2.3.bat" >/dev/null 2>&1'
    )

    # ✅ FIXED registry command (your broken line)
    os.system(
        r'box64 wine reg add "HKEY_CURRENT_USER\Software\Wine\DllOverrides" /v d3d12 /d native /f >/dev/null 2>&1'
    )
    os.system(
        r'box64 wine reg add "HKEY_CURRENT_USER\Software\Wine\DllOverrides" /v d3d12core /d native /f >/dev/null 2>&1'
    )

    os.system(
        "cp $PREFIX/glibc/opt/Resources/vkd3d-proton/* $HOME/.wine/drive_c/windows/syswow64"
    )
    os.system(
        "cp $PREFIX/glibc/opt/Resources64/vkd3d-proton/* $HOME/.wine/drive_c/windows/system32"
    )

    print("Done!")

# ---------------- WINE VERSION ----------------
def change_wine_version():
    os.system("clear")

    print("Select Wine version:")
    print("1) Wine 9.1")
    print("2) Wine 9.2")
    print("3) Wine 9.4")
    print("4) Wine 9.7")
    print("5) Wine 9.11")
    print("6) Wine 9.13")
    print("7) Back")

    choice = input("> ")

    if choice == "7":
        return

    wine_path = "/data/data/com.termux/files/usr/glibc/opt/wine"

    if os.path.exists(wine_path):
        shutil.rmtree(wine_path)

    files = {
        "1": "wine-9.1-esync.tar.xz",
        "2": "wine-9.2-amd64-wow64.tar.xz",
        "3": "wine-9.4-amd64-wow64.tar.xz",
        "4": "wine-9.7-glibc-wow64.tar.xz",
        "5": "wine-9.11-amd64-wow64.tar.xz",
        "6": "wine-9.13-glibc-amd64-wow64.tar.xz",
    }

    if choice in files:
        f = files[choice]

        print(f"Downloading {f}...")
        os.system(
            f"wget -q --show-progress https://github.com/Ilya114/Box64Droid/releases/download/alpha/{f}"
        )

        print("Extracting...")
        os.system(f"tar -xf {f} -C $PREFIX/glibc/opt")
        os.system(f"rm {f}")

        print("Done!")

# ---------------- MENU ----------------
def main_menu():
    while True:
        os.system("clear")

        print("=== Box64Droid ===")
        print("1) Start Wine")
        print("2) Debug Wine")
        print("3) Change Wine version")
        print("4) Recreate prefix")
        print("5) Winetricks")
        print("6) Exit")

        choice = input("> ")

        if choice == "1":
            os.system("node $PREFIX/bin/start-box64.js")
            break

        elif choice == "2":
            os.system("clear")

            print("Debug mode enabled...")

            os.system(
                "BOX64_LOG=1 WINEDEBUG=+err taskset -c 4-7 box64 wine explorer /desktop=shell,800x600 >/sdcard/Box64Droid.log 2>&1 &"
            )

            os.system("am start -n com.termux.x11/com.termux.x11.MainActivity")

            input("Press Enter to stop...")

            os.system("box64 wineserver -k")

        elif choice == "3":
            change_wine_version()

        elif choice == "4":
            recreate_prefix()

        elif choice == "5":
            os.system("am start -n com.termux.x11/com.termux.x11.MainActivity")
            os.system("box64 winetricks")

        elif choice == "6":
            os.system('pkill -f "app_process / com.termux.x11"')
            os.system("pkill -f pulseaudio")
            sys.exit()

# ---------------- ENTRY ----------------
def start():
    if len(sys.argv) < 2:
        print("Use --start")
        return

    if sys.argv[1] == "--start":
        start_box64droid()
        check_config()
        check_prefix()
        main_menu()

    elif sys.argv[1] == "--version":
        print(ver)

    elif sys.argv[1] == "--help":
        print("Usage: box64droid --start")

    else:
        print("Invalid argument")

# ---------------- RUN ----------------
if __name__ == "__main__":
    start()
