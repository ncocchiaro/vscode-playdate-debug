import * as path from "path";

import * as vscode from "vscode";

import { PDCTaskTerminal } from "./PDCTaskTerminal";

export class PlaydateTaskProvider implements vscode.TaskProvider {
  static PlaydateType = "pdc";
  private playdatePromise: Thenable<vscode.Task[]> | undefined = undefined;

  constructor(private workspaceRoot: string) {
    const pattern = path.join(workspaceRoot, "source", "pdxinfo");
    const fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
    fileWatcher.onDidChange(() => (this.playdatePromise = undefined));
    fileWatcher.onDidCreate(() => (this.playdatePromise = undefined));
    fileWatcher.onDidDelete(() => (this.playdatePromise = undefined));
  }

  public provideTasks(
    _token: vscode.CancellationToken
  ): Thenable<vscode.Task[]> | undefined {
    if (!this.playdatePromise) {
      this.playdatePromise = Promise.resolve([
        createPDCTask(this.workspaceRoot),
      ]);
    }
    return this.playdatePromise;
  }

  public resolveTask(task: vscode.Task): vscode.Task | undefined {
    return createPDCTask(this.workspaceRoot, task);
  }
}

function createPDCTask(workspaceRoot: string, task?: vscode.Task): vscode.Task {
  const definition = task?.definition ?? {
    type: PlaydateTaskProvider.PlaydateType,
  };
  const scope = task?.scope ?? vscode.TaskScope.Workspace;
  const execution = new vscode.CustomExecution(
    async (_task) => new PDCTaskTerminal(workspaceRoot)
  );
  const problemMatchers = ["$pdc-lua", "$pdc-external"];
  return new vscode.Task(definition, scope, "build", "pdc", execution, problemMatchers);
}