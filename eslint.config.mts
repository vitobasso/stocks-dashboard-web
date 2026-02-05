import next from "eslint-config-next";

import {defineConfig} from "eslint/config";

export default defineConfig([
    ...next,
    {
        rules: {
            "react/no-unescaped-entities": ["error", {"forbid": ['>', '\'', '}']}], // relaxes the rule to allow quotes
        }
    }
]);
