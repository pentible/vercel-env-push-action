import { getInput, setOutput, setFailed } from "@actions/core";

function main() {
    // TODO: const checkName =
    getInput("check-name", { required: true });

    // TODO:
    setOutput("temp", "temp");
}

try {
    main();
} catch (error) {
    setFailed(error instanceof Error ? error : new Error(String(error)));
}
