import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { arn } from "zod-arn";
import * as z from "zod/v4";

describe("decode", () => {
  test("parses each field", () => {
    assert.deepEqual(arn().parse("arn:aws:iam::123456789012:role/example"), {
      partition: "aws",
      service: "iam",
      region: "",
      accountId: "123456789012",
      resource: "role/example",
    });
  });

  test("trims surrounding whitespace", () => {
    assert.equal(arn().parse("  arn:aws:iam::123456789012:root \n").resource, "root");
  });

  test("accepts an empty region and account ID", () => {
    assert.equal(arn().parse("arn:aws:s3:::example-bucket").resource, "example-bucket");
  });

  test("keeps colons in the resource", () => {
    assert.equal(
      arn().parse("arn:aws:logs:us-east-1:123456789012:log-group:example:*").resource,
      "log-group:example:*",
    );
  });

  test("rejects a malformed ARN", () => {
    // oxfmt-ignore
    const malformedArns = [
      "",
      "   ",
      "not-an-arn",
      "arn:aws:iam::123456789012",
      "urn:aws:iam::123456789012:root",
      "ARN:aws:iam::123456789012:root",
    ];

    for (const input of malformedArns) {
      assert.equal(arn().safeParse(input).error?.issues[0]?.message, "Invalid ARN", JSON.stringify(input));
    }
  });

  test("accepts any partition, region, or account ID", () => {
    assert.equal(arn().safeParse("arn:not-a-partition:iam:not-a-region:not-an-account:root").success, true);
  });

  test("rejects an empty partition, service, or resource", () => {
    assert.equal(arn().safeParse("arn::iam::123456789012:root").error?.issues[0]?.message, "Missing partition field");
    assert.equal(arn().safeParse("arn:aws:::123456789012:root").error?.issues[0]?.message, "Missing service field");
    assert.equal(arn().safeParse("arn:aws:iam::123456789012:").error?.issues[0]?.message, "Missing resource field");
  });
});

describe("encode", () => {
  test("round-trips to the same string", () => {
    const value = "arn:aws:logs:us-east-1:123456789012:log-group:example:*";
    assert.equal(z.encode(arn(), z.decode(arn(), value)), value);
  });

  test("rejects an empty partition, service, or resource", () => {
    const value = { partition: "aws", service: "iam", region: "", accountId: "123456789012", resource: "root" };

    assert.throws(() => z.encode(arn(), { ...value, partition: "" }), /Missing partition field/);
    assert.throws(() => z.encode(arn(), { ...value, service: "" }), /Missing service field/);
    assert.throws(() => z.encode(arn(), { ...value, resource: "" }), /Missing resource field/);
  });

  test("round-trips padded input to the trimmed string", () => {
    assert.equal(z.encode(arn(), arn().parse(" arn:aws:iam::123456789012:root ")), "arn:aws:iam::123456789012:root");
  });
});
