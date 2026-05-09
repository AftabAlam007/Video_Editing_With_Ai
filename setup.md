# Local AI Video Editor - Complete Setup Guide (Windows)

Welcome! This guide will walk you through setting up everything you need on your Windows PC to run this project. **Do not skip any steps.**

## 1. Install Node.js (For Frontend React)
1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS (Long Term Support)** version for Windows.
3. Run the installer and click "Next" through all default settings.
4. Open a new Command Prompt or PowerShell and type `node -v` to verify it's installed.

## 2. Install Java 17 & Maven (For Backend Spring Boot)
1. **Java:** Download the JDK 17 installer for Windows from [Adoptium/Eclipse Temurin](https://adoptium.net/temurin/releases/?version=17). Run it and ensure "Set JAVA_HOME variable" is selected during install.
2. **Maven:** Download the binary zip archive from [https://maven.apache.org/download.cgi](https://maven.apache.org/download.cgi).
    * Extract the zip to `C:\maven`.
    * Open Windows Start Menu, search "Environment Variables", and click "Edit the system environment variables".
    * Click "Environment Variables..." at the bottom.
    * Under "System variables", find `Path`, select it, and click "Edit...".
    * Click "New" and add `C:\maven\apache-maven-3.x.x\bin` (replace with your exact folder name).
    * Click OK on all windows.
3. Open a new terminal and verify with `java -version` and `mvn -version`.

## 3. Install Python 3.10+ (For AI Service)
1. Go to [https://www.python.org/downloads/windows/](https://www.python.org/downloads/windows/)
2. Download the latest Python 3.10 or 3.11 installer.
3. **CRITICAL STEP:** When the installer opens, check the box at the bottom that says **"Add python.exe to PATH"**.
4. Click "Install Now".
5. Verify in terminal with `python --version`.

## 4. Install FFmpeg (For Video Processing)
FFmpeg is a command-line tool for editing videos.
1. Download the Windows build from [gyan.dev](https://www.gyan.dev/ffmpeg/builds/) (download the `ffmpeg-git-full.7z` or `.zip`).
2. Extract the folder using 7-Zip or Windows Explorer.
3. Rename the extracted folder to `ffmpeg` and move it to `C:\ffmpeg`.
4. Open Windows Start Menu, search "Environment Variables".
5. Edit the `Path` variable (just like we did for Maven).
6. Click "New" and add `C:\ffmpeg\bin`.
7. Click OK on all windows.
8. Verify in a new terminal with `ffmpeg -version`.

## 5. Install MySQL Server (Database)
1. Download MySQL Installer from [https://dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/).
2. Choose the "Developer Default" or just "Server only" setup.
3. During setup, set a root password. **Remember this password.** We will use `root` for the username and whatever password you set.
4. Open MySQL Command Line Client or MySQL Workbench and run this command to create our database:
   ```sql
   CREATE DATABASE video_editor_db;
   ```

## Next Steps
Once you have installed all of the above, let me know, and we will move on to initializing the code in the `frontend`, `backend`, and `ai-service` folders!