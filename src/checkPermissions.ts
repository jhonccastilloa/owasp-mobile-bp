import fs from "fs";
import path from "path";

type Permission = {
  requiredDependencies: string;
  severity: string;
  message: string;
};

const requiredPermissions: Record<string, Permission> = {
  ACCESS_COARSE_LOCATION: {
    requiredDependencies:
      "react-native-geolocation-service\nreact-native-maps\nreact-native-google-maps-directions",
    severity: "E",
    message: "",
  },
  ACCESS_FINE_LOCATION: {
    requiredDependencies:
      "react-native-geolocation-service\nreact-native-maps\nreact-native-google-maps-directions",
    severity: "E",
    message: "",
  },
  ACCESS_FINGERPRINT_MANAGER: {
    requiredDependencies: "react-native-fingerprint-scanner",
    severity: "E",
    message: "",
  },
  ACCESS_NETWORK_STATE: {
    requiredDependencies: "react-native-geolocation-service\nreact-native-maps",
    severity: "W",
    message: "Functions dependent on internet connection",
  },
  ACCESS_WIFI_STATE: {
    requiredDependencies: "",
    severity: "W",
    message: "Functions like geolocation",
  },
  CAMERA: {
    requiredDependencies: "react-native-camera\nreact-native-qrcode-scanner",
    severity: "",
    message: "",
  },
  HIGH_SAMPLING_RATE_SENSORS: {
    requiredDependencies: "",
    severity: "W",
    message: "Sensor measurement accuracy",
  },
  INTERNET: {
    requiredDependencies:
      "react-native-webview\nreact-native-geolocation-service\nreact-native-maps\nreact-native-share",
    severity: "E",
    message: "",
  },
  QUERY_ALL_PACKAGES: {
    requiredDependencies: "",
    severity: "W",
    message: "List other installed applications",
  },
  READ_CONTACTS: {
    requiredDependencies: "react-native-contacts",
    severity: "E",
    message: "",
  },
  READ_PHONE_NUMBERS: {
    requiredDependencies: "react-native-contacts",
    severity: "E",
    message: "",
  },
  READ_EXTERNAL_STORAGE: {
    requiredDependencies: "react-native-share\nreact-native-view-shot",
    severity: "E",
    message: "",
  },
  READ_MEDIA_IMAGES: {
    requiredDependencies: "react-native-share\nreact-native-view-shot",
    severity: "E",
    message: "",
  },
  READ_PHONE_STATE: {
    requiredDependencies: "",
    severity: "W",
    message: "Monitor phone state",
  },
  READ_PROFILE: {
    requiredDependencies: "",
    severity: "W",
    message: "Retrieve profile information",
  },
  RECEIVE_BOOT_COMPLETED: {
    requiredDependencies: "",
    severity: "W",
    message: "Apps needing startup on system reboot",
  },
  USE_BIOMETRIC: {
    requiredDependencies: "react-native-fingerprint-scanner",
    severity: "E",
    message: "",
  },
  USE_FINGERPRINT: {
    requiredDependencies: "react-native-fingerprint-scanner",
    severity: "E",
    message: "",
  },
  VIBRATE: {
    requiredDependencies: "react-native-fingerprint-scanner",
    severity: "W",
    message: "Apps needing haptic feedback",
  },
  WRITE_CONTACTS: {
    requiredDependencies: "react-native-contacts",
    severity: "E",
    message: "",
  },
  WRITE_EXTERNAL_STORAGE: {
    requiredDependencies: "react-native-share\nreact-native-view-shot",
    severity: "E",
    message: "",
  },
  WRITE_USE_APP_FEATURE_SURVEY: {
    requiredDependencies: "",
    severity: "E",
    message: "",
  },
};

const getDependencies = async (packageFilePath: string): Promise<string[]> => {
  const data = await fs.promises.readFile(packageFilePath, "utf-8");
  const jsonData = JSON.parse(data);
  return Object.keys(jsonData.dependencies || {});
};

const getManifestPermissions = async (
  androidManifestFilePath: string
): Promise<string[]> => {
  const permissions: string[] = [];
  const data = await fs.promises.readFile(androidManifestFilePath, "utf-8");
  const lines = data.split("\n");
  const regex = /android:name="([^"]+)"/;

  lines.forEach((line) => {
    const match = line.match(regex);
    if (match) {
      const permission = match[1].split(".").pop();
      if (permission) permissions.push(permission);
    }
  });

  return permissions;
};

const verifyPermissions = async (currentPath: string) => {
  try {
    const packageFilePath = path.join(currentPath, "package.json");
    const dependencies = new Set(await getDependencies(packageFilePath));
    const manifestPath = path.join(
      currentPath,
      "android",
      "app",
      "src",
      "main",
      "AndroidManifest.xml"
    );
    const manifestPermissions = await getManifestPermissions(manifestPath);

    const warnings: string[] = [];
    const errors: string[] = [];

    for (const [
      permission,
      { requiredDependencies, severity, message },
    ] of Object.entries(requiredPermissions)) {
      const allowedDependencies = new Set(
        requiredDependencies.split("\n").filter((dep) => dep)
      );

      if (manifestPermissions.includes(permission)) {
        const hasRequiredDependency = [...allowedDependencies].some((dep) =>
          dependencies.has(dep)
        );

        if (!hasRequiredDependency) {
          if (severity === "E") {
            errors.push(
              `- ${permission}: Permission is in AndroidManifest.xml but none of its required dependencies were found.`
            );
          } else if (severity === "W") {
            warnings.push(`- ${permission}: ${message}`);
          }
        }
      }
    }

    if (warnings.length > 0) {
      console.log("Permission Warnings:");
      warnings.forEach((warning) => console.log(warning));
    }
    if (errors.length > 0) {
      console.log("\nPermission Errors:");
      errors.forEach((error) => console.log(error));
    }
    if (warnings.length === 0 && errors.length === 0) {
      console.log("Todos los permisos estan correctos");
    }
  } catch (error) {
    console.log(error);
  }
  console.log("finalizo")
};
export default verifyPermissions;
