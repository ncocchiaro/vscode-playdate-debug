import * as assert from "assert";
import * as path from "path";

import * as vscode from "vscode";

import { SIMULATOR_DEBUG_PORT } from "../../constants";
import { waitForDebugPort } from "../../util";

import {
  assertTaskFixture,
  cleanPDXBundles,
  findTask,
  getFixturePath,
  killSimulator,
  testSDK,
  waitForFileToExist,
} from "./suiteTestUtils";

suite("Combined Test Suite", () => {
  let defaultBuildTask: vscode.Task;

  suiteSetup(async () => {
    const tasks = await vscode.tasks.fetchTasks();
    const task = findTask(tasks, "Playdate: Build and Run");
    assert.ok(task);
    assertTaskFixture(task, "basic-configuration");
    defaultBuildTask = task;
  });

  teardown(async () => {
    await killSimulator();
    await cleanPDXBundles();
  });

  testSDK("basic-configuration", "darwin", async () => {
    const execution = await vscode.tasks.executeTask(defaultBuildTask);
    assert.ok(execution);

    const pdxPath = path.resolve(
      getFixturePath("basic-configuration"),
      "Basic Configuration.pdx"
    );
    await waitForFileToExist(pdxPath);

    const socket = await waitForDebugPort(SIMULATOR_DEBUG_PORT);
    assert.ok(socket);
    socket.destroy();
  });
});