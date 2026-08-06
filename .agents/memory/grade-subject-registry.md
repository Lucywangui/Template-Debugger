---
name: Grade subject registry
description: The curriculum subject contract used by the SOMA generator layer.
---

The generator layer must use an exact subject registry for the three CBC levels:

- Lower Primary: CRE, Creative Arts, English, Environmental Activities, Hygiene & Nutrition, Kiswahili, Mathematics.
- Upper Primary: Agriculture, Creative Arts, English, Environmental Activities, Home Science, Kiswahili, Mathematics, Social Studies.
- Junior Secondary: Agriculture, Biology, Business Studies, Chemistry, Computer Science, Creative Arts, English, Fasihi ya Kiswahili, Geography, History & Citizenship, Home Science, Integrated Science, Kiswahili, Literature, Mathematics, Physics, Pre-Technical Studies, Social Studies.

**Why:** Legacy generator files contained subjects outside the approved lists, which made it easy for catalog and template coverage to drift.

**How to apply:** Keep the central registry and per-subject compatibility exports limited to these subjects. Unknown subjects should return no template rules rather than silently falling back to generic language questions. Pre-Technical Studies is approved because it is explicitly listed under Junior Secondary.