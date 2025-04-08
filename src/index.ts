import { automate, verify } from './commands';
const { exec } = require('child_process');

const main = async () => {
  const args = process.argv.slice(2);
  const currentPath = process.cwd();
  switch (args[0]) {
    case 'verify':
      verify(currentPath);
      break;
    case 'automate':
      automate(currentPath);
      break;

      case 'documentation':
        exec('start https://github.com/jhonccastilloa/owasp-mobile-bp/blob/main/DOCUMENTATION.md', (err:any, stdout:any, stderr:any) => {
          if (err) {
            console.error(`Error: ${err}`);
            return;
          }
          if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
        });
        break;
    default:
      console.log(
        "Comando no reconocido. Usa 'owasp -verify' para verificar el proyecto."
      );
      break;
  }
};

main();
