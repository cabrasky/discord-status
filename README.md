# Discord Status VS Code Extension

Easily display your VS Code activity as a Discord Rich Presence status. Highly customizable and supports showing project, file, and error information directly on your Discord profile.

## Features
- Shows your current project and file in Discord Rich Presence
- Displays when you are editing or debugging
- Shows error count in your project (optional)
- Customizable status bar text and Discord button
- Automatically detects GitHub repository and adds a button to your Discord status

## Installation
1. Download the latest `.vsix` file from the `versions/` folder or from the [Releases](https://github.com/cabrasky/discord-status/releases) page.
2. Install the extension in VS Code:
   - Open the command palette (`Ctrl+Shift+P`)
   - Run `Extensions: Install from VSIX...`
   - Select the downloaded `.vsix` file
3. Reload VS Code if prompted.

## Usage
- The extension activates automatically and shows your VS Code activity on Discord.
- A status bar item will appear indicating the connection status.
- When editing or debugging, your Discord status will update in real time.

## Configuration
You can customize the extension via VS Code settings (`File` > `Preferences` > `Settings` > search for `Discord Status`).

| Setting | Description | Default |
|---------|-------------|---------|
| `DiscordStatus.enable` | Enable/Disable the extension | `true` |
| `DiscordStatus.initText` | Status bar text when connecting | `Connecting ...` |
| `DiscordStatus.connectedText` | Status bar text when connected | `Connected` |
| `DiscordStatus.notConnectedText` | Status bar text if connection fails | `Error Connecting` |
| `DiscordStatus.discordStatusDebug` | Text when debugging | `Debugging: ` |
| `DiscordStatus.discordStatusEditing` | Text when editing files | `Editando: ` |
| `DiscordStatus.discordStatusProyect` | Text for project name | `En el proyecto: ` |
| `DiscordStatus.discordStatusConfig` | Text for configuration | `En la configuracion del proyecto ` |
| `DiscordStatus.discordGithubButton` | GitHub button label | `Ir a Github` |
| `DiscordStatus.discordShowErrors` | Show error count in status | `true` |
| `DiscordStatus.discordShowErrorsText` | Error count text (`{}` will be replaced by the number) | `Tiene {} errores` |

## Development
- Clone the repository and run `npm install` to install dependencies.
- Use `vsce package` or the provided `package.sh` script to build the extension.

## License
ISC

## Author
[Cabrasky](https://github.com/cabrasky)

---
For issues or feature requests, please open an issue on the [GitHub repository](https://github.com/cabrasky/discord-status).
