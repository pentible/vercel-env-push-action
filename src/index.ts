import { setOutput, setFailed, getInput } from "@actions/core";
import { ZodError, z } from "zod";
import { HttpClient } from "./http-client";
import { Unreachable } from "./unreachable";
import {
    ProjectEnvTargetValues,
    addEnvVars,
    editEnvVars,
    getEnvVars,
    removeEnvRecord,
} from "./vercel";

function diffEnvs(
    oldEnvVars: Record<string, string>,
    newEnvVars: Record<string, string>,
) {
    const changed: [string, string][] = [];
    const added: [string, string][] = [];
    const unchanged: [string, string][] = [];

    for (const [key, value] of Object.entries(newEnvVars)) {
        if (!(key in oldEnvVars)) {
            added.push([key, value]);
        } else if (oldEnvVars[key] === value) {
            unchanged.push([key, value]);
        } else {
            changed.push([key, value]);
        }
    }

    const removed = Object.entries(oldEnvVars).filter(
        ([key]) => !(key in newEnvVars),
    );

    return {
        removed,
        changed,
        added,
        unchanged,
    };
}

const targetSchema = z.enum(ProjectEnvTargetValues, {
    errorMap: (issue, ctx) => {
        if (issue.code === z.ZodIssueCode.invalid_enum_value) {
            const expectedOptions = issue.options
                .map((o) => `'${o}'`)
                .join(" | ");

            return {
                message: `Invalid target. Expected ${expectedOptions}, received '${issue.received}'`,
            };
        }

        return { message: ctx.defaultError };
    },
});

const envsSchema = z.record(z.string(), z.string());

async function main() {
    const vercelToken = getInput("vercelToken", { required: true });
    const projectId = getInput("projectId", { required: true });
    const rawTarget = getInput("target", { required: true });
    const rawEnvs = getInput("envs", { required: true });
    const gitBranch = getInput("gitBranch") || undefined;

    const envs = envsSchema.parse(JSON.parse(rawEnvs));
    const target = targetSchema.parse(rawTarget);

    const client = new HttpClient({
        url: "https://api.vercel.com",
        headers: {
            Authorization: `Bearer ${vercelToken}`,
        },
    });

    // fetch remote env vars from vercel api
    const envVarResponse = await getEnvVars(client, {
        projectId,
        target,
        gitBranch,
        decrypt: true,
    });
    const oldEnvVars = Object.fromEntries(
        envVarResponse.envs.map((e) => [e.key, e.value]),
    );

    // diff env vars
    const diff = diffEnvs(oldEnvVars, envs);

    // TODO: maybe? just to prevent them being printed from outputs... not  100%
    // though just because some may not be really secrets they could be values
    // like true/false, they could be numbers, etc...
    // for (const envs of Object.values(diff)) {
    //     for (const [_, value] of envs) {
    //         setSecret(value);
    //     }
    // }

    // print diff
    // TODO: colour
    if (diff.removed.length > 0) {
        for (const [key] of diff.removed) {
            console.log(`- removed: ${key}`);
        }
    }

    if (diff.changed.length > 0) {
        for (const [key] of diff.changed) {
            console.log(`- changed: ${key}`);
        }
    }

    if (diff.added.length > 0) {
        for (const [key] of diff.added) {
            console.log(`- added: ${key}`);
        }
    }

    // apply changes
    for (const [key] of diff.removed) {
        const env = envVarResponse.envs.find((e) => e.key === key);
        if (!env) {
            throw new Unreachable(
                `all keys to remove should come from envVarResponse, but key "${key}" was not found`,
            );
        }

        await removeEnvRecord(client, { projectId, envId: env.id });
    }

    for (const [key, value] of diff.changed) {
        const env = envVarResponse.envs.find((e) => e.key === key);
        if (!env) {
            throw new Unreachable(
                `all keys to remove should come from envVarResponse, but key "${key}" was not found`,
            );
        }

        await editEnvVars(client, {
            projectId,
            envId: env.id,
            target,
            gitBranch,
            key,
            value,
        });
    }

    for (const [key, value] of diff.added) {
        await addEnvVars(client, {
            projectId,
            targets: [target],
            gitBranch,
            // TODO: input to change this
            // "sensitive" = created from a plain value, value cannot be retrieved (from dashboard/api)
            // "encrypted" = created from a plain value, returned encrypted (unless decrypt=true on api v8)
            // "plain" | "secret" = legacy values, unused as far as I can tell
            type: "encrypted",
            key,
            value,
        });
    }

    setOutput("removed", Object.keys(diff.removed));
    setOutput("changed", Object.keys(diff.changed));
    setOutput("added", Object.keys(diff.added));
    setOutput("unchanged", Object.keys(diff.unchanged));
    // TODO: output api results per env above?
}

function getErrorMessage(error: unknown) {
    if (error instanceof ZodError) {
        return error.issues[0]?.message ?? error.message;
    } else if (error instanceof Error) {
        return error.message;
    } else {
        return String(error);
    }
}

void main().catch((error) => {
    setFailed(getErrorMessage(error));
});
