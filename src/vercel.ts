import type { HttpClient } from "./http-client";
import { queryParams } from "./query-params";

export const ProjectEnvTargetValues = [
    "production",
    "preview",
    "development",
] as const;
type ProjectEnvTarget = (typeof ProjectEnvTargetValues)[number];

type ProjectEnvType = "encrypted" | "plain" | "secret" | "sensitive" | "system";

interface ProjectEnvVariable {
    id: string;
    key: string;
    value: string;
    type: ProjectEnvType;
    configurationId?: string | null;
    createdAt?: number;
    updatedAt?: number;
    target?: ProjectEnvTarget | ProjectEnvTarget[];
    system?: boolean;
    gitBranch?: string;
}

interface GetEnvVarsInput {
    projectId: string;
    target: ProjectEnvTarget;
    gitBranch?: string;
    // NOTE: deprecated after v8 (value is returned encrypted, so essentially
    // we'll just assume it's changed every time, similar to type=sensitive)
    decrypt?: boolean;
}

interface GetEnvVarsResponse {
    envs: ProjectEnvVariable[];
}

export async function getEnvVars(
    client: HttpClient,
    { projectId, target, gitBranch, decrypt }: GetEnvVarsInput,
) {
    return await client.get<GetEnvVarsResponse>(
        `/v8/projects/${projectId}/env`,
        queryParams({
            target,
            gitBranch,
            decrypt: decrypt?.toString(),
        }),
    );
}

interface RemoveEnvVarsInput {
    projectId: string;
    envId: string;
}

export async function removeEnvRecord(
    client: HttpClient,
    { projectId, envId }: RemoveEnvVarsInput,
) {
    return await client.delete<ProjectEnvVariable>(
        `/v8/projects/${projectId}/env/${envId}`,
    );
}

interface EditEnvVarsInput {
    projectId: string;
    envId: string;
    target: ProjectEnvTarget;
    gitBranch?: string;
    key: string;
    value: string;
    type?: ProjectEnvType;
    comment?: string;
}

interface EditEnvVarsResponse {
    envs: ProjectEnvVariable[];
}

export async function editEnvVars(
    client: HttpClient,
    {
        projectId,
        envId,
        target,
        gitBranch,
        type,
        key,
        value,
        comment,
    }: EditEnvVarsInput,
) {
    return await client.post<EditEnvVarsResponse>(
        `/v9/projects/${projectId}/env/${envId}`,
        {
            target,
            gitBranch,
            type,
            key,
            value,
            comment,
        },
    );
}

interface AddEnvVarsInput {
    projectId: string;
    targets: ProjectEnvTarget[];
    gitBranch?: string;
    type: ProjectEnvType;
    key: string;
    value: string;
}

interface AddEnvVarsResponse {
    envs: ProjectEnvVariable[];
}

export async function addEnvVars(
    client: HttpClient,
    { projectId, targets, gitBranch, type, key, value }: AddEnvVarsInput,
) {
    return await client.post<AddEnvVarsResponse>(
        `/v8/projects/${projectId}/env`,
        {
            target: targets,
            gitBranch,
            type,
            key,
            value,
        },
    );
}
