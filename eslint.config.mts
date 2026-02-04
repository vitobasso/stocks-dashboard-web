import next from "eslint-config-next";

import {defineConfig} from "eslint/config";

export default defineConfig([
    ...next,
    {
        rules: {
            "react-hooks/preserve-manual-memoization": "off", // TODO: enable react compiler and remove this
            "react/no-unescaped-entities": ["error", {"forbid": ['>', '\'', '}']}], // relaxes the rule to allow quotes
        }
    }
]);
