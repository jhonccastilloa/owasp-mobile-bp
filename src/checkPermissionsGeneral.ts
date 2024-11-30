import fs from "fs";
import path from "path";

type Results = Record<string, string>;

const results: Results = {};

const keyValues: Record<string, [string, string]> = {
  "M1.1": ["android:allowBackup", "false"],
  "M1.2": ["android:debuggable", "false"],
  "M1.3": ["android:InstallLocation", "false"],
  // "M4.1": ["android:launchMode", "singleInstance"],
};

const searchFile = async (androidManifestFilePath: string): Promise<void> => {
  const data = await fs.promises.readFile(androidManifestFilePath, "utf-8");
  const lines = data.split("\n");

  for (const [mainKey, [subKey, subValue]] of Object.entries(keyValues)) {
    let found = false;
    for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
      if (searchKey(mainKey, subKey, subValue, lines[lineNumber])) {
        found = true;
        break;
      }
    }

    if (!found) {
      results[mainKey] = "NOT FOUND";
    }
  }
};

const searchKey = (
  mainKey: string,
  subKey: string,
  subValue: string,
  line: string
): boolean => {
  const result = line.match(/^[^=]+/);
  if (!result) return false;
  const value = result[0].trim();
  if (value === subKey) {
    validateValue(mainKey, subValue, line);
    return true;
  }
  return false;
};

const validateValue = (
  mainKey: string,
  subValue: string,
  line: string
): void => {
  const result = line.match(/"([^"]*)"/);
  if (result && result[1] !== subValue) {
    results[mainKey] = "Error";
  } else {
    results[mainKey] = "OK";
  }
};

const checkPermissionsGeneral = async (currentPath: string): Promise<any> => {
  const androidManifestFilePath = path.join(
    currentPath,
    "android",
    "app",
    "src",
    "main",
    "AndroidManifest.xml"
  );
  await searchFile(androidManifestFilePath);


  console.log("RESULTADOS:--->", results)
  // results ={ 'M1.1': 'OK', 'M1.2': 'NOT FOUND', 'M1.3': 'NOT FOUND' }
  // const results = { 'M1.1': 'OK', 'M1.2': 'NOT FOUND', 'M1.3': 'NOT FOUND' };

  const resultsArray = Object.keys(results).map((key: any) => ({
    control: key,
    status: results[key]
  }));

  console.log("resultsArray, ", resultsArray);

  const M1results: any = []
  resultsArray.forEach(element => {
    let result = {}
    if (element.status == "OK") {
      result = {
        desc: "La aplicación no permite que sus datos se incluyan en copias de seguridad.",
        item: element.control
      }
    } else if (element.status == "NOT FOUND") {
      result = {
        desc: "No esta declarado Android:allowBackup",
        item: element.control
      }
    } else {
      result = {
        desc: "android:allowBackup debe estar declarado como false",
        item: element.control
      }
    }
    M1results.push(result)
    console.log("M1results", M1results)

  });

  // return results
};

export default checkPermissionsGeneral;
