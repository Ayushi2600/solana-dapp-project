/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/blog.json`.
 */
export type Blog = {
  "address": "FLbwydxCq8AT5PbhiqZpvgTAXv4VnfvbYjMR7cg5WSLA",
  "metadata": {
    "name": "blog",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createBlog",
      "discriminator": [
        221,
        118,
        241,
        5,
        53,
        181,
        90,
        253
      ],
      "accounts": [
        {
          "name": "blogEntry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "title"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteBlog",
      "discriminator": [
        110,
        242,
        46,
        158,
        112,
        4,
        189,
        122
      ],
      "accounts": [
        {
          "name": "blogEntry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "title"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateBlog",
      "discriminator": [
        252,
        54,
        5,
        181,
        182,
        6,
        112,
        203
      ],
      "accounts": [
        {
          "name": "blogEntry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "blog_entry.title",
                "account": "blogEntryState"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "newDescription",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "blogEntryState",
      "discriminator": [
        32,
        194,
        56,
        21,
        2,
        166,
        32,
        91
      ]
    }
  ],
  "types": [
    {
      "name": "blogEntryState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          }
        ]
      }
    }
  ]
};
