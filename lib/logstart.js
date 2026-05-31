module.exports = () => {
    const chalk = require("chalk");
    const os = require("os");
    const { execSync } = require("child_process");

    process.stdout.write(`
\x1b[38;5;201m█\x1b[38;5;198m█\x1b[0m    \x1b[38;5;198m█\x1b[38;5;201m█\x1b[0m
\x1b[38;5;165m█\x1b[38;5;129m█\x1b[0m    \x1b[38;5;129m█\x1b[38;5;165m█\x1b[0m
 \x1b[38;5;99m█\x1b[38;5;93m█\x1b[0m  \x1b[38;5;93m█\x1b[38;5;99m█\x1b[0m    \x1b[37m█▄▄ █▀█ ▀█▀\x1b[0m
  \x1b[38;5;69m█\x1b[38;5;45m█\x1b[38;5;51m█\x1b[38;5;45m█\x1b[0m     \x1b[37m█▄█ █▄█  █\x1b[0m
`);

    function shortPath(path) {
        const parts = path.split("/").filter(Boolean);
        if (parts.length <= 2) return path;
        return `.../${parts.slice(-2).join("/")}`;
    }

    const workspace = shortPath(process.cwd());

    const ramUsed = Math.round(process.memoryUsage().rss / 1024 / 1024);
    const ramTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0);
    const ramPercent = ((ramUsed / (ramTotal * 1024)) * 100).toFixed(0);

    let diskUsed = "?";
    let diskTotal = "?";
    let diskPercent = "?";

    try {
        const output = execSync("df -h /").toString().split("\n")[1];
        const cols = output.trim().split(/\s+/);

        diskTotal = cols[1];
        diskUsed = cols[2];
        diskPercent = cols[4].replace("%", "");
    } catch {}

    const powered = chalk.blue.bold(`Powered By ${global.ownername}`);

    console.log(`
${chalk.cyan("Workspace")} : ${chalk.white(workspace)}
${chalk.green("Runtime")}   : ${chalk.white(`Node.js ${process.version.replace("v", "")}`)}
${chalk.yellow("Memory")}    : ${chalk.white(`${ramUsed}MB/${ramTotal}GB`)} ${chalk.gray(`(${ramPercent}%)`)}
${chalk.magenta("Disk")}      : ${chalk.white(`${diskUsed}/${diskTotal}`)} ${chalk.gray(`(${diskPercent}%)`)}

${powered}
`);
};