import { automate, verify } from './commands';

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
    default:
      console.log(
        "Comando no reconocido. Usa 'owasp -verify' para verificar el proyecto."
      );
      break;
  }
};

main();
