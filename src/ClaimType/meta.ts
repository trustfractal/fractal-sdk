export const ClaimTypeMetaschema = {
  $id: "https://json-schema.org/draft/2020-12/schema",
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    $id: {
      type: "string",
      format: "uri",
      pattern: "^fractal:ctype:0x[0-9a-f]+$",
    },
    $schema: {
      type: "string",
      format: "uri",
      const: "https://json-schema.org/draft/2020-12/schema",
    },
    title: {
      type: "string",
    },
    type: {
      type: "string",
      const: "object",
    },
    properties: {
      type: "object",
      patternProperties: {
        "^.*$": {
          type: "object",
          properties: {
            type: {
              oneOf: [
                {
                  type: "string",
                  enum: [
                    "string",
                    "integer",
                    "number",
                    "boolean",
                    "object",
                    "null",
                  ],
                },
                {
                  type: "array",
                  items: {
                    type: "string",
                    enum: [
                      "string",
                      "integer",
                      "number",
                      "boolean",
                      "object",
                      "null",
                    ],
                  },
                },
              ],
            },
            $ref: {
              type: "string",
              format: "uri",
            },
            format: {
              type: "string",
              enum: ["date", "time", "uri"],
            },
            properties: {
              type: "object",
            },
          },
          if: {
            properties: { type: { const: "object" } },
          },
          then: {
            required: ["properties"],
          },
          else: {
            not: { required: ["properties"] },
          },
          additionalProperties: false,
          oneOf: [
            {
              required: ["type"],
            },
            {
              required: ["$ref"],
            },
          ],
        },
      },
    },
  },
  additionalProperties: false,
  required: ["$id", "title", "$schema", "properties", "type"],
};
