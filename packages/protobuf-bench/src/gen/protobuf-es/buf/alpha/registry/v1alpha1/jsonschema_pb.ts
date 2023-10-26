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

// @generated by protoc-gen-es v1.4.0 with parameter "ts_nocheck=false,target=ts"
// @generated from file buf/alpha/registry/v1alpha1/jsonschema.proto (package buf.alpha.registry.v1alpha1, syntax proto3)
/* eslint-disable */

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";

/**
 * @generated from message buf.alpha.registry.v1alpha1.GetJSONSchemaRequest
 */
export class GetJSONSchemaRequest extends Message<GetJSONSchemaRequest> {
  /**
   * @generated from field: string owner = 1;
   */
  owner = "";

  /**
   * @generated from field: string repository = 2;
   */
  repository = "";

  /**
   * @generated from field: string reference = 3;
   */
  reference = "";

  /**
   * A fully qualified name of the type to generate a JSONSchema for, e.g.
   * "pkg.foo.Bar". The type needs to resolve in the referenced module or any of
   * its dependencies. Currently only messages types are supported.
   *
   * @generated from field: string type_name = 4;
   */
  typeName = "";

  constructor(data?: PartialMessage<GetJSONSchemaRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "buf.alpha.registry.v1alpha1.GetJSONSchemaRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "owner", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "repository", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 3, name: "reference", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 4, name: "type_name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GetJSONSchemaRequest {
    return new GetJSONSchemaRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GetJSONSchemaRequest {
    return new GetJSONSchemaRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GetJSONSchemaRequest {
    return new GetJSONSchemaRequest().fromJsonString(jsonString, options);
  }

  static equals(a: GetJSONSchemaRequest | PlainMessage<GetJSONSchemaRequest> | undefined, b: GetJSONSchemaRequest | PlainMessage<GetJSONSchemaRequest> | undefined): boolean {
    return proto3.util.equals(GetJSONSchemaRequest, a, b);
  }
}

/**
 * @generated from message buf.alpha.registry.v1alpha1.GetJSONSchemaResponse
 */
export class GetJSONSchemaResponse extends Message<GetJSONSchemaResponse> {
  /**
   * A json schema representing what the json encoded payload for type_name
   * should conform to. This schema is an approximation to be used by editors
   * for validation and autocompletion, not a lossless representation of the
   * type's descriptor.
   *
   * @generated from field: bytes json_schema = 1;
   */
  jsonSchema = new Uint8Array(0);

  constructor(data?: PartialMessage<GetJSONSchemaResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "buf.alpha.registry.v1alpha1.GetJSONSchemaResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "json_schema", kind: "scalar", T: 12 /* ScalarType.BYTES */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GetJSONSchemaResponse {
    return new GetJSONSchemaResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GetJSONSchemaResponse {
    return new GetJSONSchemaResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GetJSONSchemaResponse {
    return new GetJSONSchemaResponse().fromJsonString(jsonString, options);
  }

  static equals(a: GetJSONSchemaResponse | PlainMessage<GetJSONSchemaResponse> | undefined, b: GetJSONSchemaResponse | PlainMessage<GetJSONSchemaResponse> | undefined): boolean {
    return proto3.util.equals(GetJSONSchemaResponse, a, b);
  }
}

