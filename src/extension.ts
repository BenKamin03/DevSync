import { join } from "path";
import * as vscode from "vscode";
import { ExtensionContext, ExtensionMode, Uri, Webview, WebviewOptions } from "vscode";
import { MessageHandlerData } from "@estruyf/vscode";
import { readFileSync } from "fs";
import WebSocket from "ws";

// Storage key for workspace data
const STORAGE_KEY = 'vscode-react-webview-starter.data';

interface Message {
  message: string;
  username: string;
  timestamp: Date;
  isUser: boolean;
}
// Define the stored data interface
interface ExtensionState {
  wsurl: string;
  username: string;
  messages: Message[];
  unreadCount: number;
}

export function activate(context: vscode.ExtensionContext) {

  const state: ExtensionState = {
    wsurl: context.workspaceState.get('wsurl') || '',
    username: context.workspaceState.get('username') || '',
    messages: context.workspaceState.get('messages') || [],
    unreadCount: context.workspaceState.get('unreadCount') || 0
  };

  const notificationBadge = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  notificationBadge.command = 'vscode-react-webview-starter.openWebview';
  context.subscriptions.push(notificationBadge);

  function updateBadge(){
    if(state.unreadCount > 0){
      notificationBadge.text = `$(mail) ${state.unreadCount}`;
      notificationBadge.tooltip = `You have ${state.unreadCount} unread messages`;
      notificationBadge.show();
    } else {
      notificationBadge.hide();
    }

    context.workspaceState.update('unreadCount', state.unreadCount);
    context.workspaceState.update('messages', state.messages);
    context.workspaceState.update('wsurl', state.wsurl);
    context.workspaceState.update('username', state.username);
  }
  
  function addMessage(message: string, username: string, isUser: boolean){
    const newMessage: Message = {
      message,
      username, 
      timestamp: new Date(),
      isUser
    };

    if(!isUser){
      state.unreadCount++;
    }

    updateBadge();
  }
  

    const provider = new ReactWebviewViewProvider(context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("vscode-react-webview-starter.view", provider));
    
    // Register command to clear workspace data
    const clearDataCommand = vscode.commands.registerCommand(
        "vscode-react-webview-starter.clearWorkspaceData",
        async () => {
            await context.workspaceState.update(STORAGE_KEY, { messages: [] });
            const workspaceName = vscode.workspace.name || "current workspace";
            vscode.window.showInformationMessage(`Data cleared for ${workspaceName}!`);
        }
    );
    
    context.subscriptions.push(clearDataCommand);
}

export function deactivate() {}

const getWebviewContent = (context: ExtensionContext, webview: Webview) => {
    const jsFile = "main.bundle.js";
    const localServerUrl = "http://localhost:9000";

    let scriptUrl = [];
    let cssUrl = null;

    const isProduction = context.extensionMode === ExtensionMode.Production;
    if (isProduction) {
        const manifest = readFileSync(join(context.extensionPath, "dist", "webview", "manifest.json"), "utf-8");
        const manifestJson = JSON.parse(manifest);
        for (const [key, value] of Object.entries<string>(manifestJson)) {
            if (key.endsWith(".js")) {
                scriptUrl.push(webview.asWebviewUri(Uri.file(join(context.extensionPath, "dist", "webview", value))).toString());
            }
        }
    } else {
        scriptUrl.push(`${localServerUrl}/${jsFile}`);
    }

    return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		${isProduction ? `<link href="${cssUrl}" rel="stylesheet">` : ""}
	</head>
	<body>
		<div id="root"></div>

		${scriptUrl.map((url) => `<script src="${url}"></script>`).join("\n")}
	</body>
	</html>`;
};

class ReactWebviewViewProvider implements vscode.WebviewViewProvider {
    private context: vscode.ExtensionContext;
    private state: ExtensionState;
    private onWebview: any; // TODO: Define proper type

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.state = {
            wsurl: context.workspaceState.get('wsurl') || '',
            username: context.workspaceState.get('username') || '',
            messages: context.workspaceState.get('messages') || [],
            unreadCount: context.workspaceState.get('unreadCount') || 0
        };
        this.onWebview = this.onWebview.bind(this);
    }

    private addMessage(message: string, username: string, isUser: boolean) {
        const newMessage: Message = {
            message,
            username,
            timestamp: new Date(),
            isUser
        };
        
        this.state.messages.push(newMessage);
        if (!isUser) {
            this.state.unreadCount++;
        }
        
        // Update storage
        this.context.workspaceState.update('messages', this.state.messages);
        this.context.workspaceState.update('unreadCount', this.state.unreadCount);
    }

    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken) {
        webviewView.webview.options = {
            enableScripts: true,
            retainContextWhenHidden: true,
        } as WebviewOptions;

        webviewView.webview.html = getWebviewContent(this.context, webviewView.webview);

        let wsurl = "";
        let ws: WebSocket | null = null;
        let messages: Message[] = [];
        
        // Get stored data from workspace state
        let storedData: ExtensionState = this.context.workspaceState.get<ExtensionState>(STORAGE_KEY, { 
            wsurl: '',
            username: '',
            messages: [],
            unreadCount: 0
        });

        webviewView.webview.onDidReceiveMessage(
            (message) => {
                const { command, requestId, data } = message;

                if (command === "GET_DATA") {
                  // Return stored workspace data
                  webviewView.webview.postMessage({
                    command,
                    requestId,
                    data: storedData,
                  } as MessageHandlerData<ExtensionState>);
                } else if (command === "SAVE_DATA") {
                    // Save data to workspace storage
                    storedData = data as ExtensionState;
                    // Update returns a Thenable, not a Promise with catch
                    this.context.workspaceState.update(STORAGE_KEY, storedData)
                        .then(() => {
                            webviewView.webview.postMessage({
                                command,
                                requestId,
                                data: "Data saved successfully!",
                            } as MessageHandlerData<string>);
                        });
                } else if (command === "GET_WORKSPACE_INFO") {
                    // Return workspace name
                    webviewView.webview.postMessage({
                        command,
                        requestId,
                        data: vscode.workspace.name || "Current Workspace",
                    } as MessageHandlerData<string>);
                } else if (command === "GET_DATA_ERROR") {
                    webviewView.webview.postMessage({
                        command,
                        requestId,
                        error: `Oops, something went wrong!`,
                    } as MessageHandlerData<string>);
                } else if (command === "POST_DATA") {
                    // Store message in workspace data
                    storedData.messages = storedData.messages || [];
                    if (data && typeof data === 'object' && 'msg' in data) {
                        const newMessage: Message = {
                            message: data.msg as string,
                            username: storedData.username || 'Anonymous User',
                            timestamp: new Date(),
                            isUser: true
                        };
                        storedData.messages.push(newMessage);
                    }
                    
                    // Save to workspace storage
                    this.context.workspaceState.update(STORAGE_KEY, storedData);
                    
                    const workspaceName = vscode.workspace.name || "current workspace";
                    vscode.window.showInformationMessage(`Saved to ${workspaceName}: ${data?.msg || ''}`);
                } else if (command === "CONNECT_WS") {
                    try {
                        console.log("CONNECT_WS");
                        console.log(data);
                        ws?.close();
                        wsurl = data.wsurl;
                        console.log("wsurl", wsurl);
                        console.log("Creating WebSocket");
                        ws = new WebSocket(wsurl);
                        console.log("WebSocket created");

                        ws.onopen = () => {
                            console.log("WebSocket connected");
                            webviewView.webview.postMessage({
                                command,
                                requestId,
                                data: `WebSocket connected`,
                            } as MessageHandlerData<string>);

                            ws?.send("Hello from the extension!");
                        };

                        ws.onerror = (event) => {
                            console.log("WebSocket error:", event);
                        };

                        ws.onclose = () => {
                            console.log("WebSocket closed");
                            messages = [];
                        };

                        ws.onmessage = (event) => {
                            console.log("WebSocket message received:", event.data);
                            // Store as string in local array
                            messages.push(JSON.parse(event.data as string));
                            webviewView.webview.postMessage({
                                command: "MESSAGE",
                                data: {
                                  ...JSON.parse(event.data as string),
                                  isUser: false
                                },
                            });
                            

                        };
                    } catch (error) {
                        console.error("Error creating WebSocket:", error);
                    }
                } else if (command === "GET_MESSAGES") {
                    // Return messages
                    webviewView.webview.postMessage({
                        command,
                        requestId,
                        data: messages,
                    } as MessageHandlerData<Message[]>);
                } else if (command === "UPDATE_USER") {
                    storedData.username = data.username;
                    this.context.workspaceState.update(STORAGE_KEY, storedData);
                } else if (command === "MESSAGE") {
                    this.addMessage(data.message, storedData.username || 'Anonymous User', data.isUser);
                    
                    // Update the webview with the new message
                    webviewView.webview.postMessage({
                        command: "MESSAGE_ADDED",
                        requestId,
                        data: this.state.messages,
                    } as MessageHandlerData<Message[]>);
                }
            },
            undefined,
            this.context.subscriptions
        );
    }
}
