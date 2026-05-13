const fs = require('fs');
const css = fs.readFileSync('style.css', 'utf8');
const lines = css.split('\n');
let inRoot = false;
let found = false;
for(let i=0; i<lines.length; i++) {
  if (lines[i].includes(':root')) inRoot = true;
  if (inRoot && lines[i].trim() === '}') inRoot = false;
  if (!inRoot) {
    if (/(#[0-9a-fA-F]{3,6}\b|rgba?\(.*?\))/.test(lines[i])) {
      console.log(`Line ${i+1}: ${lines[i].trim()}`);
      found = true;
    }
  }
}
if (!found) console.log('All clean! No hardcoded colors found outside :root.');
