#!/usr/bin/env node
import fs from "fs";
import path, { dirname } from "path";
import PdfPrinter from "pdfmake";
import foundPrintJava from "./foundPrintJava";
import verifyUserPermissions from "./userPermissions";
import checkPermissionsGeneral from "./checkPermissionsGeneral";
import { createPdfDefinition } from "./pdfDesign";
import { execSync } from "child_process";
import { PdfDataPer, PdfDataPermission, PermissionData } from "./types/global";
import { PermissionStatus } from "./types/enums";
// import RobotoRegular from '../assets/fonts'

const fonts = {
  Roboto: {
    normal: path.resolve(__dirname, "assets/fonts/Roboto/Roboto-Regular.ttf"),
    bold: path.resolve(__dirname, "assets/fonts/Roboto/Roboto-Medium.ttf"),
    // italics: '..assets/Roboto/Roboto-Italic.ttf',
    // bolditalics: '..assets/Roboto/Roboto-MediumItalic.ttf',
  },
};

const printer = new PdfPrinter(fonts);

const generatePDF = async (contentArray: any) => {
  const docDefinition = createPdfDefinition(contentArray);

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  const outputPath = path.join(process.cwd(), "output4.pdf");
  pdfDoc.pipe(fs.createWriteStream(outputPath));
  pdfDoc.end();
  console.log(`PDF generado: ${outputPath}`);
};

const transformPdfdata = (data: PermissionData[]): PdfDataPermission => {
  const groupedPermissions = data.reduce((obj: PdfDataPermission, item) => {
    if (!obj[item.owaspCategory]) {
      obj[item.owaspCategory] = {
        percentageJustified: 0,
        percentageJustifiedLabel: "",
        permissions: [],
      };
    }
    obj[item.owaspCategory].permissions.push(item);
    return obj;
  }, {});

  const groupedPermissionsWithPercentage = Object.entries(groupedPermissions).map(
    ([permission, object]) => {
      const contJustifyPermission = object.permissions.filter(
        ({ status }) => PermissionStatus.OK === status
      ).length;
      const percentageJustified = Math.floor(
        ((contJustifyPermission / object.permissions.length) * 100) / 100
      );
      const newPermission: PdfDataPer = {
        ...object,
        percentageJustified,
        percentageJustifiedLabel: `${percentageJustified * 100}%`,
      };
      return [permission, newPermission] as const;
    }
  );
  return Object.fromEntries(groupedPermissionsWithPercentage)
};

const main = async () => {
  const args = process.argv.slice(2);
  const messages = []; // Array para acumular los mensajes

  switch (args[0]) {
    case "verify":
      const currentPath = process.cwd();
      const userPermissions = await verifyUserPermissions(currentPath);
      const generalPermissions = await checkPermissionsGeneral(currentPath);
      const currentBranch = execSync("git rev-parse --abbrev-ref HEAD", {
        encoding: "utf-8",
      }).trim();
      // const appName = JSON.parse(fs.readFileSync(path.join(currentPath, 'app.json', "utf-8")))
      const appJson = JSON.parse(
        fs.readFileSync(path.join(currentPath, "app.json"), "utf-8")
      );
      const today = new Date();
      let printJava = await foundPrintJava(currentPath);
      const data = {
        appName: appJson.displayName,
        currentBranch,
        percentage: '90%',
        status: true,
        date: new Intl.DateTimeFormat("es-ES").format(today),
        owasp: transformPdfdata([...(userPermissions || []), ...(generalPermissions || []), printJava])
      };
      console.log(JSON.stringify(data, null, 3))
      // let M1General = await checkPermissionsGeneral(currentPath);
      // console.log("M1 GENERLA", M1General)
      // generatePDF(logsJava);
      // console.log('-------------------------');

      break;

    default:
      console.log(
        "Comando no reconocido. Usa 'swasp verify' para verificar el proyecto."
      );
      break;
  }
};

main();
