# 001 — Boundary lint missed a forbidden TypeScript import

Date: 2026-09-21
Stage: Slice 0A — module-boundary enforcement
Status: Resolved

## Design requirement

- Kernel Implementation Design §3 — Component map and ownership:
  the kernel must not import business modules.
- Kernel Implementation Design §14 — K-29:
  architectural violations must fail the engineering checks.

This investigation verifies one boundary rule, not all of K-29.

## Expected behavior

An import from src/kernel into src/modules/planning should cause
ESLint to report a boundaries/dependencies error.

## Actual behavior

pnpm lint passed even though this forbidden import existed:

File: apps/api/src/kernel/boundary-probe.ts

    import { planningProbe } from '../modules/planning/boundary-probe';

    export const kernelProbe = planningProbe;

The imported file existed at:
apps/api/src/modules/planning/boundary-probe.ts

    export const planningProbe = 'planning';

## Investigation

1. Confirmed that a file inside src/kernel was recognized.
2. Confirmed that moving it outside the classified folders caused
   boundaries/no-unknown-files to fail.
3. Added a policy forbidding kernel-to-bounded-context imports.
4. Created the deliberate violation above.
5. Observed that lint unexpectedly passed.
6. Inspected both probe files and eslint.config.mjs.
7. Found that TypeScript import resolution was not configured.
8. Checked the boundary plugin's TypeScript Support documentation.

## Cause

The setup could parse TypeScript and classify a directly supplied
file path, but lacked the TypeScript resolver configuration needed
to resolve the extensionless import to its .ts target.

Without the target being recognized as a bounded-context element,
the intended dependency restriction was not triggered.

## Fix

Installed the TypeScript import resolver:

    pnpm --filter api add --save-dev --save-exact eslint-import-resolver-typescript

Added this inside the boundary configuration's settings:

    'import/resolver': {
      typescript: {
        project: `${import.meta.dirname}/tsconfig.json`,
      },
    },

Also corrected a separate setting-name typo:

    'boundaries/legacy-template'

became:

    'boundaries/legacy-templates'

The typo was not the cause of this particular failure:
the tested policy does not use templates.

## Verification evidence

Ran pnpm lint again with the same forbidden import still present.

Observed:

    Dependencies to elements of type "bounded-context" are not
    allowed in elements of type "kernel".
    Denied by policy at index 0
    boundaries/dependencies

ESLint reported 1 error and exited with status 1.

This is the expected result: the architectural violation was detected.

Remaining check:
Remove the temporary probes and confirm pnpm lint passes again.

## Lessons

- A passing check does not prove that its rules are working.
- Test both permitted behavior and deliberately forbidden behavior.
- Parsing, file classification and import resolution are distinct steps.
- Read the specific ESLint rule error before pnpm's summary errors.
- Change the suspected cause and repeat the same failing scenario.

## Reference

Plugin documentation — TypeScript Support:
https://www.jsboundaries.dev/docs/guides/typescript-support/

Relevant sections: Prerequisites and Configuration.