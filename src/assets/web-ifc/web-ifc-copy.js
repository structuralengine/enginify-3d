const fs = require('fs');
const path = require('path');

const sourceDir = 'node_modules/web-ifc';
const targetDir = path.join(__dirname, './bin');

function copyFiles(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const files = fs.readdirSync(source);

    files.forEach(file => {
        const sourceFile = path.join(source, file);
        const targetFile = path.join(target, file);

        if (fs.lstatSync(sourceFile).isDirectory()) {
            copyFiles(sourceFile, targetFile);
        } else {
            fs.copyFileSync(sourceFile, targetFile);
        }
    });
}

copyFiles(sourceDir, targetDir);