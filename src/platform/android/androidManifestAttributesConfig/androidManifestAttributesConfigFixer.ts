import fs from 'fs';
import { ANDROID_ATTRIBUTES_RULES } from '@/rules';
import {
  getAndroidManifestFile,
  getAndroidManifestPath,
} from './androidManifestAttributesConfigUtils';
import { recuperateComments } from '@/utils/tool';
import { AndroidVariantContext } from '@/platform/android/context/androidVariantContext';
import { AuditOptions } from '@/types/audit';

const updateOrInsertAttribute = (
  content: string,
  tagRegex: RegExp,
  key: string,
  value: string
) => {
  const tagMatch = tagRegex.exec(content);
  if (!tagMatch) return content;

  const currentTag = tagMatch[0];
  const keyRegex = new RegExp(`${key}\\s*=\\s*"[^"]*"`);
  let updatedTag = currentTag;
  if (keyRegex.test(currentTag)) {
    updatedTag = currentTag.replace(keyRegex, `${key}="${value}"`);
  } else {
    updatedTag = currentTag.replace(/>$/, ` ${key}="${value}">`);
  }

  return `${content.slice(0, tagMatch.index)}${updatedTag}${content.slice(
    tagMatch.index + currentTag.length
  )}`;
};

const androidManifestAttributesConfigFix = async (
  currentPath: string,
  context?: AndroidVariantContext,
  _options?: AuditOptions
) => {
  const sourceSet = context?.variantManifestPath ? context.variant : 'main';
  let { androidManifestWithoutComments, comments } =
    await getAndroidManifestFile(currentPath, sourceSet);
  Object.entries(ANDROID_ATTRIBUTES_RULES).forEach(([key, data]) => {
    const value = data.values[0];
    const target = data.target ?? 'application';
    if (target === 'manifest') {
      androidManifestWithoutComments = updateOrInsertAttribute(
        androidManifestWithoutComments,
        /<manifest\b[^>]*>/,
        key,
        value
      );
      return;
    }

    if (target === 'mainActivity') {
      androidManifestWithoutComments = updateOrInsertAttribute(
        androidManifestWithoutComments,
        /<activity\b[^>]*android:name\s*=\s*"[^"]*MainActivity[^"]*"[^>]*>/,
        key,
        value
      );
      return;
    }

    androidManifestWithoutComments = updateOrInsertAttribute(
      androidManifestWithoutComments,
      /<application\b[^>]*>/,
      key,
      value
    );
  });
  fs.writeFileSync(
    getAndroidManifestPath(currentPath, sourceSet),
    recuperateComments(androidManifestWithoutComments, comments),
    'utf8'
  );
};

export default androidManifestAttributesConfigFix;
