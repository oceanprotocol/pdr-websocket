import fs from "fs";
import path from "path";

export const logStream = () => {
  const logFile = path.join(__dirname, "logs.txt");
  const logStream = fs.createWriteStream(logFile, { flags: "a" });

  // Redirect console.log to the log file
  console.error = function (message) {
    const formattedMessage = message + "\n";

    logStream.write(formattedMessage);
    process.stdout.write(formattedMessage);
  };
};
