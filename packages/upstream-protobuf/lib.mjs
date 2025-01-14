// Copyright 2021-2023 Buf Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  existsSync,
  writeFileSync,
  readFileSync,
  mkdirSync,
  chmodSync,
  readdirSync,
} from "node:fs";
import { join as joinPath, dirname, relative as relativePath } from "node:path";
import os from "node:os";
import { unzipSync } from "fflate";
import micromatch from "micromatch";

/**
 * Provides release of `protoc`, `conformance_test_runner`, and related proto
 * files from the following repositories:
 * - https://github.com/bufbuild/protobuf-conformance
 * - https://github.com/protocolbuffers/protobuf
 *
 * The upstream version is picked up from version.txt
 */
export class UpstreamProtobuf {
  /**
   * @typedef ProtoInclude
   * @property {string} dir
   * @property {string[]} files
   */

  /**
   * Upstream version of protobuf.
   *
   * @type {string}
   */
  #version;

  // TODO add the following files again once we have sufficient support for editions:
  //  - google/protobuf/unittest_preserve_unknown_enum2.proto
  //  - google/protobuf/unittest_preserve_unknown_enum.proto
  //  - google/protobuf/unittest_no_field_presence.proto
  //  - google/protobuf/unittest_lazy_dependencies_enum.proto
  //  - google/protobuf/unittest_lazy_dependencies.proto
  //  - google/protobuf/unittest_arena.proto
  //  - google/protobuf/unittest_drop_unknown_fields.proto
  //  - google/protobuf/unittest_lazy_dependencies_custom_option.proto
  /**
   * Relevant proto files for testing in upstream protobuf.
   *
   * @type {string[]}
   */
  #testprotos = [
    "src/google/protobuf/test_messages_*.proto",
    "src/google/protobuf/*unittest*.proto",
    "src/google/protobuf/editions/**/*.proto",
    "!src/google/protobuf/map_proto3_unittest.proto",
    "!src/google/protobuf/editions/**/*.proto",
    "!src/google/protobuf/unittest_arena.proto",
    "!src/google/protobuf/unittest_drop_unknown_fields.proto",
    "!src/google/protobuf/unittest_lazy_dependencies.proto",
    "!src/google/protobuf/unittest_lazy_dependencies_custom_option.proto",
    "!src/google/protobuf/unittest_lazy_dependencies_enum.proto",
    "!src/google/protobuf/unittest_no_field_presence.proto",
    "!src/google/protobuf/unittest_preserve_unknown_enum.proto",
    "!src/google/protobuf/unittest_preserve_unknown_enum2.proto",
  ];

  /**
   * @member {string}
   */
  #temp;

  /**
   * @param {string} [temp]
   * @param {string} [version]
   */
  constructor(temp, version) {
    if (typeof temp !== "string") {
      temp = new URL(".tmp", import.meta.url).pathname;
    }
    this.#temp = temp;
    if (typeof version !== "string") {
      version = readFileSync(
        new URL("version.txt", import.meta.url).pathname,
        "utf-8",
      ).trim();
    }
    this.#version = version;
  }

  /**
   * @return {Promise<void>}
   */
  async warmup() {
    await Promise.all([
      this.#extractProtocRelease(),
      this.#extractConformanceRelease(),
      this.#extractProtobufSourceTestProtos(),
    ]);
  }

  /**
   * @return {Promise<string>}
   */
  async getProtocPath() {
    const release = await this.#extractProtocRelease();
    return release.protocPath;
  }

  /**
   * @return {Promise<string>}
   */
  async getConformanceTestRunnerPath() {
    const release = await this.#extractConformanceRelease();
    return release.runnerPath;
  }

  /**
   * @return {Promise<ProtoInclude>}
   */
  async getConformanceProtoInclude() {
    const release = await this.#extractConformanceRelease();
    return release.protoInclude;
  }

  /**
   * @return {Promise<ProtoInclude>}
   */
  async getWktProtoInclude() {
    const release = await this.#extractProtocRelease();
    return release.protoInclude;
  }

  /**
   * @return {Promise<ProtoInclude>}
   */
  async getTestProtoInclude() {
    return await this.#extractProtobufSourceTestProtos();
  }

  /**
   * @param {...string[]} paths
   */
  #getTempPath(...paths) {
    const p = joinPath(this.#temp, this.#version, ...paths);
    if (!existsSync(dirname(p))) {
      mkdirSync(dirname(p), { recursive: true });
    }
    return p;
  }

  /**
   * @typedef ProtocRelease
   * @property {string} protocPath
   * @property {ProtoInclude} protoInclude
   */
  /**
   * @return {Promise<ProtocRelease>}
   */
  async #extractProtocRelease() {
    const path = this.#getTempPath("protoc");
    const protocPath = joinPath(path, "bin/protoc");
    const wktDir = joinPath(path, "include");
    if (!existsSync(path)) {
      const zipPath = await this.#downloadProtocRelease();
      const zip = await readFileSync(zipPath);
      const entries = Object.entries(
        unzipSync(zip, {
          filter: (file) =>
            file.name === "bin/protoc" || file.name.endsWith(".proto"),
        }),
      );
      if (!entries.some(([name]) => name === "bin/protoc")) {
        throw new Error(`Missing bin/protoc in protoc release`);
      }
      if (
        !entries.some(
          ([name]) =>
            name.startsWith("include/google/protobuf/") &&
            name.endsWith(".proto"),
        )
      ) {
        throw new Error(`Missing protos in protoc release`);
      }
      writeTree(entries, path);
      chmodSync(protocPath, 755);
    }
    return {
      protocPath,
      protoInclude: {
        dir: wktDir,
        files: lsfiles(wktDir).filter((n) => n.endsWith(".proto")),
      },
    };
  }

  /**
   * @return {Promise<string>}
   */
  async #downloadProtocRelease() {
    let build = `${os.platform()}-${os.arch()}`;
    switch (os.platform()) {
      case "darwin":
        switch (os.arch()) {
          case "arm64":
            build = "osx-aarch_64";
            break;
          case "x64":
            build = "osx-x86_64";
            break;
          default:
            build = "osx-universal_binary";
        }
        break;
      case "linux":
        switch (os.arch()) {
          case "x64":
            build = "linux-x86_64";
            break;
          case "x32":
            build = "linux-x86_32";
            break;
          case "arm64":
            build = "linux-aarch_64";
            break;
        }
        break;
      case "win32":
        switch (os.arch()) {
          case "x64":
            build = "win64";
            break;
          case "x32":
          case "ia32":
            build = "win32";
            break;
        }
        break;
    }
    const url = `https://github.com/protocolbuffers/protobuf/releases/download/v${
      this.#version
    }/protoc-${this.#version}-${build}.zip`;
    return this.#download(url, "protoc.zip");
  }

  /**
   * @typedef ConformanceRelease
   * @property {string} runnerPath
   * @property {ProtoInclude} protoInclude
   */
  /**
   * @return {Promise<ConformanceRelease>}
   */
  async #extractConformanceRelease() {
    const path = this.#getTempPath("conformance");
    const runnerPath = joinPath(path, "bin/conformance_test_runner");
    const wktDir = joinPath(path, "include");
    if (!existsSync(path)) {
      const zipPath = await this.#downloadConformanceRelease();
      const zip = await readFileSync(zipPath);
      const entries = Object.entries(
        unzipSync(zip, {
          filter: (file) =>
            file.name === "bin/conformance_test_runner" ||
            file.name.endsWith(".proto"),
        }),
      );
      if (!entries.some(([name]) => name === "bin/conformance_test_runner")) {
        throw new Error(
          `Missing bin/conformance_test_runner in conformance release`,
        );
      }
      if (
        !entries.some(
          ([name]) =>
            name.startsWith("include/google/protobuf/") &&
            name.endsWith(".proto"),
        )
      ) {
        throw new Error(`Missing protos in conformance release`);
      }
      writeTree(entries, path);
      chmodSync(runnerPath, 755);
    }
    return {
      runnerPath,
      protoInclude: {
        dir: wktDir,
        files: lsfiles(wktDir).filter((n) => n.endsWith(".proto")),
      },
    };
  }

  /**
   * @return {Promise<string>}
   */
  async #downloadConformanceRelease() {
    let build;
    switch (os.platform()) {
      case "darwin":
        switch (os.arch()) {
          case "arm64":
          case "x64":
            build = "osx-x86_64";
            break;
        }
        break;
      case "linux":
        switch (os.arch()) {
          case "x64":
            build = "linux-x86_64";
            break;
        }
        break;
    }
    if (typeof build !== "string") {
      throw new Error(
        `Unable to find conformance runner binary release for ${os.platform()} / ${os.arch()}`,
      );
    }
    const url = `https://github.com/bufbuild/protobuf-conformance/releases/download/v${
      this.#version
    }/conformance_test_runner-${this.#version}-${build}.zip`;
    return this.#download(url, "conformance_test_runner.zip");
  }

  /**
   * @return {Promise<string>}
   */
  async #downloadProtobufSource() {
    const url = `https://github.com/protocolbuffers/protobuf/releases/download/v${
      this.#version
    }/protobuf-${this.#version}.zip`;
    return this.#download(url, "protobuf.zip");
  }

  /**
   * @return {Promise<ProtoInclude>}
   */
  async #extractProtobufSource() {
    const path = this.#getTempPath("protobuf/");
    if (!existsSync(path)) {
      const zipPath = await this.#downloadProtobufSource();
      const zip = await readFileSync(zipPath);
      const allEntries = Object.entries(
        unzipSync(zip, {
          filter: (file) =>
            file.originalSize !== 0 /* assuming a directory entry */,
        }),
      ).map(([name, content]) => {
        // drop top directory, e.g. "protobuf-24.4"
        return [name.split("/").slice(1).join("/"), content];
      });
      writeTree(allEntries, path);
    }
    return {
      dir: path,
      files: lsfiles(path),
    };
  }

  /**
   * @return {Promise<ProtoInclude>}
   */
  async #extractProtobufSourceTestProtos() {
    const path = this.#getTempPath("protobuf-test/");
    if (!existsSync(path)) {
      const source = await this.#extractProtobufSource();
      const files = micromatch(source.files, this.#testprotos, {});
      const entries = files.map((file) => {
        const from = joinPath(source.dir, file);
        if (file.startsWith("src/")) {
          file = file.substring("src/".length);
        }
        return [file, readFileSync(from)];
      });
      writeTree(entries, path);
    }
    return {
      dir: path,
      files: lsfiles(path),
    };
  }

  /**
   * @param {string} url
   * @param {string} filename
   * @return {Promise<string>}
   */
  async #download(url, filename) {
    const path = this.#getTempPath(filename);
    if (existsSync(path)) {
      return path;
    }
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
    }
    writeFileSync(path, new Uint8Array(await res.arrayBuffer()));
    return path;
  }
}

/**
 * @param {Array<[string, Uint8Array]>} files
 * @param {string} [dir]
 */
function writeTree(files, dir = ".") {
  for (const [file, contents] of files) {
    const path = joinPath(dir, file);
    if (!existsSync(dirname(path))) {
      mkdirSync(dirname(path), { recursive: true });
    }
    writeFileSync(path, contents);
  }
}

/**
 * @param {string} dir
 * @return {string[]}
 */
function lsfiles(dir) {
  const hits = [];
  function ls(dir) {
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const entPath = joinPath(dir, ent.name);
      if (ent.isFile()) {
        hits.push(entPath);
      } else if (ent.isDirectory()) {
        ls(entPath);
      }
    }
  }
  ls(dir);
  return hits.map((path) => relativePath(dir, path));
}
