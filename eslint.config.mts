import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import {defineConfig} from "eslint/config";

export default defineConfig([
    {
        ignores: [".next/**", "node_modules/**"],
    },
    {
        languageOptions: {
            globals: globals.browser
        },

    },
    js.configs.recommended,
    tseslint.configs.recommended,
    {
        ...pluginReact.configs.flat.recommended,
        settings: {
            react: {
                version: "detect",
            },
        },
    }
]);
