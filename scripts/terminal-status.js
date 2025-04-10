#!/usr/bin/env node
const { execSync } = require('child_process');
const os = require('os');

console.log('=== System Status Check ===\n');

// Function to safely run a command and return its output
function safeExec(command, errorMessage = 'Error running command') {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`${errorMessage}: ${error.message}`);
    return '';
  }
}

// Check operating system
const platform = os.platform();
console.log(`Operating System: ${platform} (${os.release()})`);

// Check MySQL status
console.log('\n--- MySQL Status ---');
if (platform === 'darwin') { // macOS
  const mysqlStatus = safeExec('brew services list | grep mysql', 'Could not check MySQL status');
  console.log(mysqlStatus || 'MySQL service not found via Homebrew');
} else if (platform === 'linux') {
  const mysqlStatus = safeExec('systemctl status mysql | grep Active', 'Could not check MySQL status');
  console.log(mysqlStatus || 'MySQL service not found or not running');
} else {
  console.log('MySQL status check not implemented for this platform');
}

// Check processes using port 3000 and 3001
console.log('\n--- Port Usage ---');
const checkPort = (port) => {
  if (platform === 'darwin' || platform === 'linux') {
    const result = safeExec(`lsof -i :${port} | grep LISTEN`, `No process using port ${port}`);
    if (result) {
      console.log(`Port ${port} is in use by:`);
      console.log(result);
    } else {
      console.log(`Port ${port} is available`);
    }
  } else if (platform === 'win32') {
    const result = safeExec(`netstat -ano | findstr :${port}`, `No process using port ${port}`);
    if (result) {
      console.log(`Port ${port} is in use by:`);
      console.log(result);
    } else {
      console.log(`Port ${port} is available`);
    }
  }
};

checkPort(3000); // Frontend React dev server
checkPort(3001); // Backend API server

// Check Node.js processes
console.log('\n--- Node.js Processes ---');
if (platform === 'darwin' || platform === 'linux') {
  const nodeProcesses = safeExec('ps aux | grep node | grep -v grep', 'Could not check Node.js processes');
  console.log(nodeProcesses || 'No Node.js processes running');
} else if (platform === 'win32') {
  const nodeProcesses = safeExec('tasklist | findstr node.exe', 'Could not check Node.js processes');
  console.log(nodeProcesses || 'No Node.js processes running');
}

// Kill process function
function killProcess(pid) {
  try {
    const command = platform === 'win32' ? `taskkill /F /PID ${pid}` : `kill -9 ${pid}`;
    execSync(command);
    console.log(`Process ${pid} terminated successfully`);
    return true;
  } catch (error) {
    console.error(`Failed to kill process ${pid}: ${error.message}`);
    return false;
  }
}

// Look for specific ports to terminate
if (process.argv.includes('--kill3001')) {
  console.log('\n--- Terminating Processes Using Port 3001 ---');
  if (platform === 'darwin' || platform === 'linux') {
    const processes = safeExec('lsof -i :3001 | grep LISTEN', 'No process using port 3001');
    if (processes) {
      const lines = processes.trim().split('\n');
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
          const pid = parts[1];
          killProcess(pid);
        }
      });
    }
  } else if (platform === 'win32') {
    const processes = safeExec('netstat -ano | findstr :3001', 'No process using port 3001');
    if (processes) {
      const lines = processes.trim().split('\n');
      lines.forEach(line => {
        if (line.includes('LISTENING')) {
          const pid = line.trim().split(/\s+/).pop();
          killProcess(pid);
        }
      });
    }
  }
}

console.log('\n=== Status Check Complete ===');
