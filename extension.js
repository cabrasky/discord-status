"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const path_1 = require("path");
const cp = require("child_process");
const Presence = require("discord-rpc");
const EXTENSION_ID = 'DiscordStatus';
const CLIENT_ID = '898271639354081302';
const STATUS_BAR_ALIGNMENT = vscode.StatusBarAlignment.Left;
const GIT_CMD = process.platform === 'win32' ? 'powershell git config --get remote.origin.url' : 'git config --get remote.origin.url';
let statusBar = vscode.window.createStatusBarItem(STATUS_BAR_ALIGNMENT, 0);
let startTime = null;
let rpc = new Presence.Client({ transport: 'ipc' });
let connectedToDiscord = false;
let gitUrl = '';
let dir = '';
function getConfig() {
    return vscode.workspace.getConfiguration(EXTENSION_ID);
}
function updateLoop() {
    if (connectedToDiscord) {
        updateDiscord();
    }
    setTimeout(updateLoop, 200);
}
function getGitUrl(currentDir) {
    try {
        return cp.execSync(GIT_CMD, { cwd: currentDir }).toString().replace('.git\n', '');
    }
    catch {
        return '';
    }
}
function getErrorCount() {
    const diagnostics = vscode.languages.getDiagnostics();
    if (!diagnostics || !diagnostics[0])
        return 0;
    const diagList = diagnostics[0][1];
    return diagList.filter((d) => d.severity === 0).length;
}
function buildActivity(config) {
    const workspaceName = vscode.workspace.name || '';
    let activity = {
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
        }
        else {
            activity.state = config.discordStatusEditing + fileName;
            activity.smallImageKey = 'edit';
        }
        dir = (0, path_1.parse)(editor.document.fileName).dir;
        gitUrl = getGitUrl(dir);
        if (config.discordShowErrors) {
            const errorCount = getErrorCount();
            activity.state = config.discordShowErrorsText.replace("{}", errorCount.toString()) + '\n' + activity.state;
        }
    }
    else {
        activity.state = config.discordStatusConfig;
        activity.smallImageKey = 'config';
    }
    return activity;
}
function updateDiscord() {
    const config = getConfig();
    const activity = buildActivity(config);
    rpc.setActivity(activity);
}
function createStatusBar(config) {
    statusBar.text = config.initText;
    statusBar.show();
    return statusBar;
}
function updateStatusBarConfig() {
    const config = getConfig();
    if (config.enable) {
        statusBar.text = config.initText;
        statusBar.show();
    }
    else {
        statusBar.hide();
    }
}
function activate(context) {
    startTime = Date.now();
    const config = getConfig();
    if (!config.enable)
        return;
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
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
