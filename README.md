# zod-arn

[![npm](https://img.shields.io/npm/v/zod-arn/latest)](https://www.npmjs.com/package/zod-arn)
[![license: MIT](https://img.shields.io/npm/l/zod-arn)](https://github.com/typeparameter/zod-arn/blob/main/LICENSE)

A [Zod] codec that parses [Amazon Resource Names][ARN] (ARNs) into their components and formats them back into strings.

```typescript
import { arn } from "zod-arn";

arn().parse("arn:aws:iam::123456789012:role/example");
// {
//   partition: "aws",
//   service: "iam",
//   region: "",
//   accountId: "123456789012",
//   resource: "role/example",
// }
```

## Decoding and encoding

`arn()` returns a [Zod codec], so it converts in both directions. Decoding trims surrounding whitespace and requires a non-empty partition, service, and resource. Encoding validates the same fields before formatting the ARN.

```typescript
import * as z from "zod";
import { arn } from "zod-arn";

const value = z.decode(arn(), " arn:aws:s3:::example-bucket ");
z.encode(arn(), value); // "arn:aws:s3:::example-bucket"

arn().safeParse("not-an-arn").error?.issues[0]?.message; // "Invalid ARN"
```

## Refinements

Add [refinements] to restrict which ARNs are accepted. They run against the parsed ARN in both directions, and are skipped when the input isn't a valid ARN.

```typescript
const iamRole = arn().refine(({ service, resource }) => service === "iam" && resource.startsWith("role/"), {
  error: "Expected an IAM role ARN",
});

iamRole.parse("arn:aws:iam::123456789012:role/example"); // OK
iamRole.parse("arn:aws:s3:::example-bucket"); // throws "Expected an IAM role ARN"
```

## License

Licensed under the [MIT License](https://github.com/typeparameter/zod-arn/blob/main/LICENSE).

[Zod]: https://zod.dev
[ARN]: https://docs.aws.amazon.com/IAM/latest/UserGuide/reference-arns.html
[Zod codec]: https://zod.dev/codecs
[refinements]: https://zod.dev/api#refinements
