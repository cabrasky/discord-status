import * as vscode from 'vscode';
import { parse } from 'path';
import * as cp from 'child_process';
import * as Presence from 'discord-rpc';

const EXTENSION_ID = 'DiscordStatus';
const CLIENT_ID = '898271639354081302';
const STATUS_BAR_ALIGNMENT = vscode.StatusBarAlignment.Left;
const GIT_CMD = process.platform === 'win32' ? 'powershell git config --get remote.origin.url' : 'git config --get remote.origin.url';

let statusBar: vscode.StatusBarItem = vscode.window.createStatusBarItem(STATUS_BAR_ALIGNMENT, 0);
let startTime: number | null = null;
let rpc = new Presence.Client({ transport: 'ipc' });
let connectedToDiscord = false;
let gitUrl = '';
let dir = '';

interface DiscordStatusConfig {
  enable: boolean;
  initText: string;
  connectedText: string;
  notConnectedText: string;
  discordStatusDebug: string;
  discordStatusEditing: string;
  discordStatusProyect: string;
  discordStatusConfig: string;
  discordGithubButton: string;
  discordShowErrors: boolean;
  discordShowErrorsText: string;
}

function getConfig(): DiscordStatusConfig {
  return vscode.workspace.getConfiguration(EXTENSION_ID) as unknown as DiscordStatusConfig;
}

function updateLoop(): void {
  if (connectedToDiscord) {
    updateDiscord();
  }
  setTimeout(updateLoop, 200);
}

function getGitUrl(currentDir: string): string {
  try {
    return cp.execSync(GIT_CMD, { cwd: currentDir }).toString().replace('.git\n', '');
  } catch {
    return '';
  }
}

function getErrorCount(): number {
  const diagnostics = vscode.languages.getDiagnostics();
  if (!diagnostics || !diagnostics[0]) return 0;
  const diagList = diagnostics[0][1];
  return diagList.filter((d: any) => d.severity === 0).length;
}

function buildActivity(config: DiscordStatusConfig): any {
  const workspaceName = vscode.workspace.name || '';
  let activity: any = {
    state: '',
    details: config.discordStatusProyect + workspaceName,
    startTimestamp: startTime,
    largeImageKey: 'vscode',
    smallImageKey: '',
    instance: true
  };

  if (gitUrl) {
    activity.buttons = [{ label: config.discordGithubButton, url: gitUrl }];
  }

  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const fileName = editor.document.fileName.replace(vscode.workspace.rootPath || '', '').substring(1);
    if (vscode.debug.activeDebugSession) {
      activity.state = config.discordStatusDebug + fileName;
      activity.smallImageKey = 'debug';
    } else {
      activity.state = config.discordStatusEditing + fileName;
      activity.smallImageKey = 'edit';
    }
    dir = parse(editor.document.fileName).dir;
    gitUrl = getGitUrl(dir);
    if (config.discordShowErrors) {
      const errorCount = getErrorCount();
      activity.state = config.discordShowErrorsText.replace("{}", errorCount.toString()) + '\n' + activity.state;
    }
  } else {
    activity.state = config.discordStatusConfig;
    activity.smallImageKey = 'config';
  }
  return activity;
}

function updateDiscord(): void {
  const config = getConfig();
  const activity = buildActivity(config);
  rpc.setActivity(activity);
}

function createStatusBar(config: DiscordStatusConfig): vscode.StatusBarItem {
  statusBar.text = config.initText;
  statusBar.show();
  return statusBar;
}

function updateStatusBarConfig(): void {
  const config = getConfig();
  if (config.enable) {
    statusBar.text = config.initText;
    statusBar.show();
  } else {
    statusBar.hide();
  }
}

export function activate(context: vscode.ExtensionContext): void {
  startTime = Date.now();
  const config = getConfig();
  if (!config.enable) return;
  statusBar = createStatusBar(config);
  vscode.workspace.onDidChangeConfiguration(updateStatusBarConfig);
  context.subscriptions.push(statusBar);
  updateLoop();
  rpc.login({ clientId: CLIENT_ID }).catch(() => {
    statusBar.text = config.notConnectedText;
  });
  rpc.on('ready', () => {
    statusBar.text = config.connectedText;
    connectedToDiscord = true;
  });
}

export function deactivate(): void {}
