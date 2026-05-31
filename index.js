const { spawn, execSync } = require("child_process");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");
const os = require("os");
const readline = require("readline");
let isRunning = false;

async function checkAndInstallFFmpeg() {
    try {
        execSync("ffmpeg -version", { stdio: "ignore" });
        return;
    } catch {}
    return new Promise(resolve => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question(chalk.yellow.bold("Do you want to install ffmpeg, but not working for media edit, webp, and formater (y/n): "), async answer => {
            rl.close();
            if (answer.toLowerCase() === "y") {
                console.log(chalk.blue.bold("Installing FFmpeg..."));
                const cmd = (process.env.PREFIX || process.env.TERMUX_VERSION) 
                    ? "pkg install ffmpeg --no-install-recommends -y" 
                    : "apt install ffmpeg --no-install-recommends -y";
                try {
                    execSync(cmd, { stdio: "inherit" });
                    console.log(chalk.green.bold("FFmpeg installed successfully."));
                } catch (e) {
                    console.error("Failed to install FFmpeg:", e.message);
                }
            } else {
                console.log("FFmpeg is required for some features. Continuing anyway...");
            }
            resolve();
        });
    });
}

function start(file) {
    if (isRunning) return;
    isRunning = true;
    const args = [path.join(__dirname, file), ...process.argv.slice(2)];
    const p = spawn(process.argv[0], args, { stdio: ["inherit", "inherit", "inherit", "ipc"] });

    p.on("message", data => {
        switch (data) {
            case "reset":
                p.kill();
                isRunning = false;
                start.apply(this, arguments);
                break;
            case "uptime":
                p.send(process.uptime());
                break;
        }
    });

    p.on("exit", code => {
        isRunning = false;
        console.error("\x1b[31m%s\x1b[0m", `Exited with code: ${code}`);
        start("main.js");
        if (code === 0) return;
        fs.watchFile(args[0], () => {
            fs.unwatchFile(args[0]);
            console.error("\x1b[31m%s\x1b[0m", `File ${args[0]} has been modified. Script will restart...`);
            start("main.js");
        });
    });

    p.on("error", err => {
        console.error("\x1b[31m%s\x1b[0m", `Error: ${err}`);
        p.kill();
        isRunning = false;
        start("main.js");
    });
    setInterval(() => {}, 1000);
}

(async () => {
    const targetFile = path.join(__dirname, "node_modules/libsignal/src/session_record.js");
    try {
        let content = fs.readFileSync(targetFile, "utf8");
        content = content.replace('console.info("Closing session:", session);', '// console.info("Closing session:", session);');
        fs.writeFileSync(targetFile, content);
    } catch (e) {
        console.error("Failed patch libsignal:", e.message);
    }
    
    await checkAndInstallFFmpeg();
    start("main.js");
})();

process.on("unhandledRejection", reason => {
    console.error("\x1b[31m%s\x1b[0m", `Unhandled promise rejection: ${reason}`);
    start("main.js");
});

process.on("exit", code => {
    console.error(`Exited with code: ${code}`);
    start("main.js");
});
