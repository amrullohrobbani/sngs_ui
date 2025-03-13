import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
    on: (channel: string, callback: (...args: unknown[]) => void) => {
        ipcRenderer.on(channel, callback);
    },
    send: (channel: string, args: unknown) => {
        ipcRenderer.send(channel, args);
    }
});