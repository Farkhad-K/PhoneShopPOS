const fs = require('fs').promises;
const path = require('path');

const MAX_LINES = 300;
// Change this if needed, or pass as CLI arg
const ROOT_DIR = process.argv[2] || path.join(process.cwd(), 'src');

const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const IGNORE_DIRS = new Set(['node_modules', 'dist', 'build', '.git']);

async function walkDir(dir, results) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      await walkDir(fullPath, results);
    } else {
      const ext = path.extname(entry.name);
      if (!EXTENSIONS.has(ext)) continue;

      const content = await fs.readFile(fullPath, 'utf8');
      const lines = content.split(/\r\n|\r|\n/).length;

      results.push({
        file: path.relative(process.cwd(), fullPath),
        lines,
      });
    }
  }
}

(async () => {
  try {
    const results = [];
    await walkDir(ROOT_DIR, results);

    if (!results.length) {
      console.log(`No matching files found under: ${ROOT_DIR}`);
      process.exit(0);
    }

    // Sort by line count, descending
    results.sort((a, b) => b.lines - a.lines);

    console.log(`Files under ${ROOT_DIR} (sorted by line count):\n`);

    for (const r of results) {
      const mark = r.lines > MAX_LINES ? '  *' : '   ';
      console.log(
        `${r.lines.toString().padStart(5, ' ')} lines${mark}  ${r.file}`,
      );
    }

    console.log(
      `\n(*) Files marked with * are over ${MAX_LINES} lines and good candidates to split.`,
    );
  } catch (err) {
    console.error('Error while scanning files:', err);
    process.exit(1);
  }
})();
