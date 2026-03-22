# Commission PWA - Database Setup

Run this SQL against the **strikeworks** NeonDB (`be0146df-79b1-45ca-925f-4e54410824e4`):

```sql
CREATE TABLE IF NOT EXISTS commission_reps (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  cw_rep_id INTEGER NOT NULL,
  cw_rep_name VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
