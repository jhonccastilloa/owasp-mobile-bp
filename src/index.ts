#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import foundPrintJava from './foundPrintJava';
import verifyPermissions from './checkPermissions';
import checkPermissionsGeneral from './checkPermissionsGeneral';



const main = async () => {
  const args = process.argv.slice(2);
  switch (args[0]) {
    case 'verify':
      const currentPath = process.cwd();
      await foundPrintJava(currentPath);
      console.log('-------------------------');
      await verifyPermissions(currentPath);
      console.log('-------------------------');
      await checkPermissionsGeneral(currentPath);
      break;

    default:
      console.log("Comando no reconocido. Usa 'swasp verify' para verificar el proyecto.");
      break;
  }


}

main();
