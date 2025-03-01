import { join } from "path";
import * as vscode from "vscode";
import { ExtensionContext, ExtensionMode, Uri, Webview, WebviewOptions } from "vscode";
import { MessageHandlerData } from "@estruyf/vscode";
import { readFileSync } from "fs";
import WebSocket from "ws";

export function activate(context: vscode.ExtensionContext) {
    const provider = new ReactWebviewViewProvider(context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("vscode-react-webview-starter.view", provider));
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

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken) {
        webviewView.webview.options = {
            enableScripts: true,
            retainContextWhenHidden: true,
        } as WebviewOptions;

        webviewView.webview.html = getWebviewContent(this.context, webviewView.webview);

        let wsurl = "";
        let ws: WebSocket | null = null;
        let messages: string[] = [];

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
                            messages.push(event.data as string);
                            webviewView.webview.postMessage({
                                command,
                                requestId,
                                payload: event.data,
                            } as MessageHandlerData<string>);

                            console.log("messages", messages);
                        };
                    } catch (error) {
                        console.error("Error creating WebSocket:", error);
                    }
                }
            },
            undefined,
            this.context.subscriptions
        );
    }
}
