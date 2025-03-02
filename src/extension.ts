import { join } from "path";
import * as vscode from "vscode";
import { ExtensionContext, ExtensionMode, Uri, Webview, WebviewOptions } from "vscode";
import { MessageHandlerData } from "@estruyf/vscode";
import { readFileSync } from "fs";
import WebSocket from "ws";
import { Message } from "./webview/components/ui/chat";

export function activate(context: vscode.ExtensionContext) {
    const provider = new ReactWebviewViewProvider(context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("vscode-react-webview-starter.view", provider));
}

let wsurl = "";
let ws: WebSocket | null = null;
let messages: Message[] = [];
let username = "Anonymous";
let isFocused = false;
let unreadMessages = 0;

export function deactivate() {
    if (ws) {
        ws.close();
        ws = null;
    }
}

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
    private webviewView: vscode.WebviewView | undefined;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken) {
        this.webviewView = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            retainContextWhenHidden: true,
        } as WebviewOptions;

        webviewView.webview.html = getWebviewContent(this.context, webviewView.webview);

        isFocused = true;
        unreadMessages = 0;
        this.updateBadge(0);
        console.log("Webview opened, focus set to true");

        webviewView.onDidChangeVisibility(() => {
            isFocused = webviewView.visible;
            if (isFocused) {
                unreadMessages = 0;
                this.updateBadge(0);
                console.log("Webview visible, focus set to true");
            } else {
                console.log("Webview hidden, focus set to false");
            }
        });

        webviewView.onDidDispose(() => {
            isFocused = false;
            console.log("Webview disposed, focus set to false");
        });

        webviewView.webview.onDidReceiveMessage(
            (message) => {
                const { command, requestId, payload } = message;

                if (command === "GET_DATA") {
                    webviewView.webview.postMessage({
                        command,
                        requestId,
                        payload: `Hello from the extension!`,
                    } as MessageHandlerData<string>);
                } else if (command === "GET_DATA_ERROR") {
                    webviewView.webview.postMessage({
                        command,
                        requestId,
                        error: `Oops, something went wrong!`,
                    } as MessageHandlerData<string>);
                } else if (command === "POST_DATA") {
                    vscode.window.showInformationMessage(`Received data from the webview: ${payload.msg}`);
                } else if (command === "CONNECT_WS") {
                    try {
                        console.log("CONNECT_WS");
                        console.log(payload);
                        ws?.close();
                        wsurl = payload.wsurl;
                        console.log("wsurl", wsurl);
                        console.log("Creating WebSocket");
                        ws = new WebSocket(wsurl);
                        console.log("WebSocket created");

                        ws.onopen = () => {
                            console.log("WebSocket connected");
                            webviewView.webview.postMessage({
                                command,
                                requestId,
                                payload: `WebSocket connected`,
                            } as MessageHandlerData<string>);
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
                            messages.push(JSON.parse(event.data as string) as Message);
                            webviewView.webview.postMessage({
                                command: "MESSAGE",
                                data: {
                                    ...JSON.parse(event.data as string),
                                    isUser: false,
                                },
                            });

                            if (!isFocused) {
                                unreadMessages++;
                                console.log("unreadMessages", unreadMessages);
                                this.updateBadge(unreadMessages);
                            }

                            this.pushNotification(JSON.parse(event.data as string));

                            console.log("messages", messages);
                        };
                    } catch (error) {
                        console.error("Error creating WebSocket:", error);
                    }
                } else if (command === "SEND_MESSAGE") {
                    const message = { message: payload.message, username, timestamp: new Date() };
                    ws?.send(JSON.stringify(message));
                    messages.push({ ...message, isUser: true });
                } else if (command === "GET_MESSAGES") {
                    webviewView.webview.postMessage({
                        command,
                        requestId,
                        payload: messages,
                    } as MessageHandlerData<Message[]>);
                } else if (command === "UPDATE_USER") {
                    username = payload.username;
                } else if (command === "CONNECTED") {
                    console.log("CONNECTED", !!ws);
                    webviewView.webview.postMessage({
                        command: "CONNECTED",
                        requestId,
                        data: {
                            connected: !!ws,
                        },
                    });
                } else if (command === "DISCONNECT") {
                    ws?.close();
                    ws = null;
                    messages = [];
                } else if (command === "GET_USERNAME") {
                    webviewView.webview.postMessage({
                        command,
                        requestId,
                        payload: username,
                    } as MessageHandlerData<string>);
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    private updateBadge(count: number) {
        console.log("updateBadge", count);
        vscode.commands.executeCommand("setContext", "myExtension.badgeCount", count);

        if (this.webviewView) {
            this.webviewView.badge = {
                tooltip: ``,
                value: count,
            };
        }
    }

    private pushNotification(message: Message) {
        if (!isFocused) {
            const msg = message.message.length > 20 ? message.message.substring(0, 20) + "..." : message.message;
            vscode.window.showInformationMessage(`${message.username}: ${msg}`);
        }
    }
}
