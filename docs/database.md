# Database & Schema Specifications (Cloud Firestore)

## Firestore Data Collections

### 1. `users`
- `uid` (string): Firebase UID
- `email` (string)
- `displayName` (string)
- `photoURL` (string)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### 2. `questions`
- `id` (string)
- `title` (string)
- `category` (string - e.g., 'Data Structures', 'System Design', 'Behavioral')
- `difficulty` (string - 'Easy' | 'Medium' | 'Hard')
- `companyTags` (array of strings)
- `sourcePlatform` (string - 'leetcode' | 'gfg' | 'hackerrank' | 'interviewbit' | 'ai')
- `createdAt` (timestamp)

### 3. `company_sets`
- `id` (string)
- `companyName` (string)
- `questionIds` (array of strings)
- `updatedAt` (timestamp)

### 4. `evaluations`
- `id` (string)
- `userId` (string)
- `questionId` (string)
- `userAnswer` (string)
- `feedback` (object)
- `score` (number)
- `evaluatedAt` (timestamp)

---
*TODO: Document Firestore index requirements and security rules.*
