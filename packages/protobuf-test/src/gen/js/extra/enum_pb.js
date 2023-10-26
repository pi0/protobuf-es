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

// @generated by protoc-gen-es v1.4.0 with parameter "ts_nocheck=false,target=js+dts"
// @generated from file extra/enum.proto (package spec, syntax proto3)
/* eslint-disable */

import { proto3 } from "@bufbuild/protobuf";

/**
 * @generated from enum spec.AnnotatedEnum
 */
export const AnnotatedEnum = proto3.makeEnum(
  "spec.AnnotatedEnum",
  [
    {no: 0, name: "UNSPECIFIED"},
    {no: 1, name: "FOO"},
  ],
);

/**
 * @generated from enum spec.SimpleEnum
 */
export const SimpleEnum = proto3.makeEnum(
  "spec.SimpleEnum",
  [
    {no: 0, name: "SIMPLE_ZERO"},
    {no: 1, name: "SIMPLE_ONE"},
  ],
);

/**
 * @generated from enum spec.AliasEnum
 */
export const AliasEnum = proto3.makeEnum(
  "spec.AliasEnum",
  [
    {no: 0, name: "ALIAS_ZERO"},
    {no: 1, name: "ALIAS_ONE"},
    {no: 1, name: "ALIAS_ONE_ALIASED"},
  ],
);

/**
 * The generated enum values should drop the "PREFIX_"
 * part at the top if the target language allows
 * (basically every language except C++).
 *
 * @generated from enum spec.PrefixEnum
 */
export const PrefixEnum = proto3.makeEnum(
  "spec.PrefixEnum",
  [
    {no: 0, name: "PREFIX_ENUM_ZERO", localName: "ZERO"},
    {no: 1, name: "PREFIX_ENUM_ONE", localName: "ONE"},
  ],
);

/**
 * @generated from message spec.EnumMessage
 */
export const EnumMessage = proto3.makeMessageType(
  "spec.EnumMessage",
  () => [
    { no: 1, name: "enum_field", kind: "enum", T: proto3.getEnumType(EnumMessage_NestedEnum) },
  ],
);

/**
 * @generated from enum spec.EnumMessage.NestedEnum
 */
export const EnumMessage_NestedEnum = proto3.makeEnum(
  "spec.EnumMessage.NestedEnum",
  [
    {no: 0, name: "NESTED_ZERO"},
    {no: 1, name: "NESTED_ONE"},
  ],
);

