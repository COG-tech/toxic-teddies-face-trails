import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const projectPath = path.join(root, 'ios', 'App', 'App.xcodeproj', 'project.pbxproj');
let project = await readFile(projectPath, 'utf8');

if (project.includes('PrivacyInfo.xcprivacy in Resources')) {
  console.log('iOS privacy manifest is already included in the App target.');
} else {
  const buildFileId = '7A11AA012F10000100AA0001';
  const fileReferenceId = '7A11AA022F10000100AA0001';

  function replaceOnce(search, replacement, label) {
    if (!project.includes(search)) throw new Error(`Unable to add iOS privacy manifest: ${label} anchor not found`);
    project = project.replace(search, replacement);
  }

  replaceOnce(
    '\t\t504EC3121FED79650016851F /* LaunchScreen.storyboard in Resources */ = {isa = PBXBuildFile; fileRef = 504EC3101FED79650016851F /* LaunchScreen.storyboard */; };',
    `\t\t504EC3121FED79650016851F /* LaunchScreen.storyboard in Resources */ = {isa = PBXBuildFile; fileRef = 504EC3101FED79650016851F /* LaunchScreen.storyboard */; };\n\t\t${buildFileId} /* PrivacyInfo.xcprivacy in Resources */ = {isa = PBXBuildFile; fileRef = ${fileReferenceId} /* PrivacyInfo.xcprivacy */; };`,
    'PBXBuildFile',
  );
  replaceOnce(
    '\t\t504EC3131FED79650016851F /* Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = Info.plist; sourceTree = "<group>"; };',
    `\t\t504EC3131FED79650016851F /* Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = Info.plist; sourceTree = "<group>"; };\n\t\t${fileReferenceId} /* PrivacyInfo.xcprivacy */ = {isa = PBXFileReference; lastKnownFileType = text.xml; path = PrivacyInfo.xcprivacy; sourceTree = "<group>"; };`,
    'PBXFileReference',
  );
  replaceOnce(
    '\t\t\t\t504EC3131FED79650016851F /* Info.plist */,',
    `\t\t\t\t504EC3131FED79650016851F /* Info.plist */,\n\t\t\t\t${fileReferenceId} /* PrivacyInfo.xcprivacy */,`,
    'PBXGroup',
  );
  replaceOnce(
    '\t\t\t\t504EC30D1FED79650016851F /* Main.storyboard in Resources */,',
    `\t\t\t\t504EC30D1FED79650016851F /* Main.storyboard in Resources */,\n\t\t\t\t${buildFileId} /* PrivacyInfo.xcprivacy in Resources */,`,
    'PBXResourcesBuildPhase',
  );

  await writeFile(projectPath, project, 'utf8');
  console.log('Added PrivacyInfo.xcprivacy to the iOS App target resources.');
}
