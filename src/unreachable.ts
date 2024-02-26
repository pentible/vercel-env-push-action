/**
 * Indicates unreachable code (ie. execution is impossible with current implementation)
 */
export class Unreachable extends Error {
    override name = "Unreachable" as const;

    constructor(message = "unexpected execution of unreachable code") {
        super(message);
    }
}
