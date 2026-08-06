---
name: Generator template integrity
description: Durable constraints for maintaining SOMA's curriculum question templates
---

SOMA's question experience depends on valid subject template banks, not on an external generator at runtime. Keep each template's output as one question text, four options, and a correct answer that is one of those options.

**Why:** A corrupted template file prevents TypeScript from parsing the entire frontend, producing a large cascade of misleading errors and making the app appear not to run at all.

**How to apply:** When generator errors appear, check shared template types and syntax across the generator directory first, then verify that the material loader returns exactly 15 questions with valid answer indexes.