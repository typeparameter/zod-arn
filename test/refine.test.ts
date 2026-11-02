import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { arn } from "zod-arn";
import * as z from "zod/v4";

describe("refine", () => {
  const iamArn = arn().refine(({ service }) => service === "iam", { error: "Expected an IAM ARN" });

  test("runs against the parsed ARN", () => {
    assert.equal(iamArn.safeParse("arn:aws:iam::123456789012:root").success, true);
    assert.equal(iamArn.safeParse("arn:aws:s3:::example-bucket").error?.issues[0]?.message, "Expected an IAM ARN");
  });

  test("is skipped when the ARN is malformed", () => {
    assert.deepEqual(
      iamArn.safeParse("not-an-arn").error?.issues.map(({ message }) => message),
      ["Invalid ARN"],
    );
  });

  test("applies when encoding", () => {
    const value = { partition: "aws", region: "", accountId: "123456789012", resource: "root" };

    assert.equal(z.encode(iamArn, { ...value, service: "iam" }), "arn:aws:iam::123456789012:root");
    assert.throws(() => z.encode(iamArn, { ...value, service: "s3" }), /Expected an IAM ARN/);
  });
});
