const vscode = require('vscode');
var sb = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left,0);
var startTime = null

var config = vscode.workspace.getConfiguration('DiscordStatus');
var Presence = require("discord-rpc");

const cp = require('child_process');
const { parse } = require('path');

const Client = Presence.Client

let rpc =new Client({ transport: 'ipc' });

var clientId = '898271639354081302'

var connectedDC = false



var dir = ""
var gitURL = ""


function updateLoop(){
  if(connectedDC){
    updateDiscord();
  }           

  setTimeout( updateLoop, 200 );

}

function updateDiscord() {
  var config = vscode.workspace.getConfiguration('DiscordStatus');
  var actitity = {
    state: "",
    details: config.discordStatusProyect +  vscode.workspace.name,
    startTimestamp: startTime,
    largeImageKey: 'vscode',
    smallImageKey: "",
    instance: true
  }
  if(gitURL != ""){
    actitity = {
      state: "",
      details: config.discordStatusProyect +  vscode.workspace.name,
      startTimestamp: startTime,
      largeImageKey: 'vscode',
      smallImageKey: "",
      instance: true,
      buttons: [
        {
          label: config.discordGithubButton,
          url: gitURL
        }
      ]
    }
  };
  if(vscode.window.activeTextEditor != undefined){
    if (vscode.debug.activeDebugSession) {
      actitity.state = config.discordStatusDebug + vscode.window.activeTextEditor.document.fileName.slice(vscode.window.activeTextEditor.document.fileName.lastIndexOf('\\') + 1);
      actitity.smallImageKey = 'debug';
      dir = parse(vscode.window.activeTextEditor.document.fileName).dir
    } else {
      actitity.state =  config.discordStatusEditing + vscode.window.activeTextEditor.document.fileName.slice(vscode.window.activeTextEditor.document.fileName.lastIndexOf('\\') + 1),
      actitity.smallImageKey = 'edit';
      dir = parse(vscode.window.activeTextEditor.document.fileName).dir
    }
    
    if(config.discordShowErrors){
      const diag = vscode.languages.getDiagnostics();

      let total = 0;
      if(diag != undefined && diag[0] != undefined){
        
        var diag1 = diag[0][1]
        for(var i = 0; i < diag1.length; i++){
          var diagcurr = diag1[i]
          if(diagcurr.severity == 0){
            total++;
          }
        }
      }

      actitity.state = config.discordShowErrorsText.replace("{}", total) + "\n" + actitity.state
    }
  } else {
      actitity.state = config.discordStatusConfig
      actitity.smallImageKey = 'config'
  }
  rpc.setActivity(actitity);
  
  
  
}

function CreateStatusBar() {
  sb.text = config.initText;
  sb.show();
  return sb;
}

function updateOfConfigs() {
  var config = vscode.workspace.getConfiguration('DiscordStatus');
  if(config.enable){
    sb.text = config.initText;
    sb.show();
  }else{
    sb.hide();
  }
  
}




function activate(context) {
  startTime = Date.now();
  var config = vscode.workspace.getConfiguration('DiscordStatus');
  if(config.enable){
    sb = CreateStatusBar();
    vscode.workspace.onDidChangeConfiguration(updateOfConfigs);
    context.subscriptions.push(sb);
    updateLoop();

      rpc.login({ clientId }).catch(sb.text = config.notConnectedText);
      rpc.on('ready', () => {
        sb.text = config.connectedText;
        connectedDC = true;
      });
      
    

    cp.exec(`git config --get remote.origin.url`, { cwd: dir}, (err, stdout, stderr) => {
      gitURL = stdout.replace(".git\n", "")
    });
  }
}


exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;