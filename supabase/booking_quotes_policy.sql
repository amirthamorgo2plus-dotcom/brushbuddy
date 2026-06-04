-- Lets a customer accept/decline quotes on THEIR OWN job.
-- Run once in the Supabase SQL Editor (safe to re-run).

drop policy if exists "customer updates job quotes" on quotes;
create policy "customer updates job quotes" on quotes for update using (
  auth.uid() = (select customer_id from jobs where jobs.id = quotes.job_id)
);
