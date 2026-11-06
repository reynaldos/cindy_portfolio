@AGENTS.md

when giving explainations you very simple clear and concise message, unless explicitely asked for a dev explaination, in which you go in deeper detail. only report to me in ASD-STE100 Simplified Technical English.

Comments should never references docs or specs and shouldn’t not be so verbose, rarely ever more than one or two lines

After each issue completion stage the files an give me a one line commit message, if there a user Story its resolving, be sure to mention the story id, pause between issue to let me check progress. At the end of each summarize the changes and fixes you made.

use claude plugin /ponytail:ponytail-review  to reviw and check all staged files (even for small changes), and make any refinements you deem helpful that will improve the code without causing any regression, breaking the feature, or oversimplifying logic

NEVER COMMIT, PUSH OR PUBLISH ANY CODE YOURSELF

always make tsx test scripts to test changes after every phase or fix, never stage the test scripts. once moving onto the new issue, delete old test script unless explicitly told not to.

never stage seed scripts
dont ever write to the db explicitely told to do so dont every uddate the schema or run anymigrations. 

if we're ever working of a refrence doc, be sure to update the progress everytime we complete a task.

Imports go at the top of the file, never inline (no `import('...')` type references in the middle of a file).

After each phase or issue with a UI or user-visible side, end the hand-over with an eyeball checklist: the exact screens or pages to open (with dev links where the route is known), what to click, and what should appear. Keep each item to one line.


when making comments, never add "ponytail: " just say it

SQL in `prisma/*/migrations/planned/` follows one format, matching the existing files there:
- One statement per line; `IF NOT EXISTS` / `IF EXISTS` on everything so the file is re-runnable; no BEGIN/COMMIT.
- Types uppercase (`VARCHAR(30)`, `INTEGER`, `BOOLEAN`, `TEXT`, `JSONB`, `TIMESTAMP(6)`); `DEFAULT CURRENT_TIMESTAMP`; ids `concat('<abbr>_', "left"(replace(gen_random_uuid()::text, '-', ''), 20))`.
- In CREATE TABLE: 4-space indent, column names padded to one width, types padded to one width, then NOT NULL / DEFAULT / REFERENCES; allowed values and intent as a right-aligned `-- a | b | c` comment on the line.
- CHECKs are named `CONSTRAINT <abbr>_<column>_check` inside the table; FKs inline `REFERENCES t(id) ON DELETE ...`.
- Indexes after the table: `idx_<abbr>_<what>` / `uq_<abbr>_<what>`, `ON table (cols)` aligned when several; partial `WHERE` at the end.
- ALTER TABLE ADD COLUMN one per line with table names padded so columns line up; a short `--` line above a statement explains why, never what.
- Two blank lines between unrelated groups.



- always git ignore claude me and agents md