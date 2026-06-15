```markdown
# candera-payload Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `candera-payload` TypeScript codebase, which is built with the Next.js framework. You'll learn how to structure files, write imports and exports, follow commit message conventions, and write tests in the style of this repository.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `userProfile.ts`, `apiHandler.test.ts`

### Import Style
- Use **alias imports** for modules.
  - Example:
    ```typescript
    import { fetchData } from '@/utils/api'
    ```

### Export Style
- Use **named exports** instead of default exports.
  - Example:
    ```typescript
    // Good
    export const getUser = () => { /* ... */ }

    // Avoid
    // export default function getUser() { /* ... */ }
    ```

### Commit Messages
- Use prefixes like `feat` for features and `docs` for documentation.
- Commit messages are mixed-type and average 64 characters.
  - Example:
    ```
    feat: add user authentication to login endpoint
    docs: update README with setup instructions
    ```

## Workflows

_No automated workflows detected in this repository._

## Testing Patterns

- Test files use the pattern: `*.test.*`
  - Example: `apiHandler.test.ts`
- The testing framework is **unknown**, but tests are colocated with code using the `.test.` pattern.
- Example test file structure:
  ```typescript
  import { getUser } from '@/services/user'

  describe('getUser', () => {
    it('returns user data', () => {
      // test implementation
    })
  })
  ```

## Commands
| Command | Purpose |
|---------|---------|
| /new-feature | Scaffold a new feature using camelCase files and named exports |
| /add-test    | Create a new test file with the `.test.ts` pattern            |
| /commit      | Format a commit message using `feat` or `docs` prefix         |
```