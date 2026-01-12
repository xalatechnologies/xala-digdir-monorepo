declare const _default: ({
    readonly rules: Readonly<import("eslint").Linter.RulesRecord>;
} | {
    languageOptions: {
        ecmaVersion: string;
        sourceType: string;
        globals: {
            console: string;
            document: string;
            window: string;
            HTMLElement: string;
            HTMLButtonElement: string;
            HTMLLabelElement: string;
            Element: string;
            MutationObserver: string;
            requestAnimationFrame: string;
            clearTimeout: string;
        };
    };
    rules: {
        'no-unused-vars': (string | {
            argsIgnorePattern: string;
        })[];
    };
} | {
    files: string[];
    ignores: string[];
    rules: {
        'no-restricted-imports': (string | {
            patterns: {
                group: string[];
                message: string;
            }[];
        })[];
    };
} | {
    ignores: string[];
})[];
export default _default;
