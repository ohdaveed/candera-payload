```markdown
# candera-payload Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `candera-payload` TypeScript codebase. You will learn how to structure files, write imports and exports, follow commit message standards, and implement and run tests. This guide is ideal for onboarding new contributors or maintaining consistency across the project.

## Coding Conventions

### File Naming
- Use **camelCase** for all file names.
  - Example: `dataLoader.ts`, `userProfile.test.ts`

### Imports
- Use **alias imports** to reference modules.
  - Example:
    ```typescript
    import { fetchData as getData } from './apiClient';
    ```

### Exports
- Use **named exports** for all modules.
  - Example:
    ```typescript
    // Good
    export function processPayload() { ... }
    export const PAYLOAD_VERSION = '1.0.0';

    // Avoid default exports
    // export default function processPayload() { ... }
    ```

### Commit Messages
- Follow **Conventional Commits** with prefixes:
  - `chore`: For maintenance, tooling, or non-feature changes.
  - `feat`: For new features.
- Average commit message length: ~48 characters.
  - Example:
    ```
    feat: add payload validation logic
    chore: update dependencies
    ```

## Workflows

### Code Contribution
**Trigger:** When adding new features or making changes  
**Command:** `/contribute`

1. Create a new branch from `main`.
2. Make changes following coding conventions.
3. Write or update tests in `*.test.*` files.
4. Commit using a conventional commit message (`feat:` or `chore:`).
5. Push your branch and open a Pull Request.

### Testing
**Trigger:** Before pushing or merging changes  
**Command:** `/test`

1. Identify test files matching `*.test.*` pattern.
2. Run the project's test command (framework not specified; refer to project scripts).
3. Ensure all tests pass before merging.

### Code Review
**Trigger:** Reviewing a Pull Request  
**Command:** `/review`

1. Check for adherence to coding conventions (file naming, imports/exports).
2. Verify commit messages follow conventional patterns.
3. Ensure new/updated code is covered by tests.
4. Approve or request changes.

## Testing Patterns

- Test files are named with the pattern `*.test.*` (e.g., `payloadProcessor.test.ts`).
- The testing framework is not specified; check project documentation or scripts for details.
- Place tests alongside the code they test or in a dedicated `tests` directory.
- Example test file:
  ```typescript
  import { processPayload } from './processPayload';

  describe('processPayload', () => {
    it('should return valid output for input', () => {
      const input = { ... };
      const result = processPayload(input);
      expect(result).toEqual({ ... });
    });
  });
  ```

## Commands
| Command      | Purpose                                      |
|--------------|----------------------------------------------|
| /contribute  | Start the code contribution workflow         |
| /test        | Run all tests in the repository              |
| /review      | Begin code review and convention checks      |
```