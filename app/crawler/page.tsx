import { existsSync, readFileSync } from "node:fs";
import Link from "next/link";
import {
  createCrawlTarget,
  deleteCrawlTarget,
  resetCrawlTarget,
  startPendingCrawlTargets,
} from "@/app/actions";
import { CrawlerAutoRefresh } from "@/components/CrawlerAutoRefresh";
import { effectiveCrawlTargetStatus, getCrawlTargetProgress } from "@/lib/crawl-target-progress";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function statusClass(status: string) {
  if (status === "completed") {
    return "badge success";
  }
  if (status === "failed") {
    return "badge danger";
  }
  if (status === "running") {
    return "badge warning";
  }
  if (status === "partial") {
    return "badge warning";
  }
  return "badge";
}

export default async function CrawlerPage() {
  const logFile = "data/crawl-targets.log";
  const [targets, counts] = await Promise.all([
    prisma.crawlTarget.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }] }),
    prisma.crawlTarget.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const statusCounts = Object.fromEntries(counts.map((item) => [item.status, item._count.status]));
  const pendingCount = (statusCounts.pending ?? 0) + (statusCounts.failed ?? 0);
  const targetRows = await Promise.all(
    targets.map(async (target) => {
      const progress = await getCrawlTargetProgress(target.url);
      const discoveredCount = Math.max(target.discoveredCount, progress.discoveredCount);
      const crawledCount = Math.max(target.crawledCount, progress.crawledCount);
      const status = effectiveCrawlTargetStatus(target.status, { discoveredCount, crawledCount });
      return { target, discoveredCount, crawledCount, status };
    }),
  );
  const recentLog = existsSync(logFile)
    ? readFileSync(logFile, "utf8").split("\n").slice(-24).join("\n").trim()
    : "";
  const isCrawlLogActive = recentLog.includes("start crawl targets") && !recentLog.includes("finish crawl targets");
  const shouldAutoRefresh = isCrawlLogActive || targetRows.some(({ status }) => status === "running");

  return (
    <>
      <CrawlerAutoRefresh enabled={shouldAutoRefresh} />
      <div className="page-header">
        <div>
          <h1>Crawler URLs</h1>
          <p>Manage category URLs, item limits, and resume pending crawl targets from the database.</p>
        </div>
        <form action={startPendingCrawlTargets}>
          <button type="submit" disabled={pendingCount === 0}>
            Start Crawl
          </button>
        </form>
      </div>

      <div className="stats-grid">
        <div className="stat">
          <span>Total URLs</span>
          <strong>{targets.length.toLocaleString()}</strong>
        </div>
        <div className="stat">
          <span>Pending / Failed</span>
          <strong>{pendingCount.toLocaleString()}</strong>
        </div>
        <div className="stat">
          <span>Running</span>
          <strong>{(statusCounts.running ?? 0).toLocaleString()}</strong>
        </div>
        <div className="stat">
          <span>Completed</span>
          <strong>{(statusCounts.completed ?? 0).toLocaleString()}</strong>
        </div>
      </div>

      <section className="panel crawler-actions">
        <div className="panel-header">
          <h2>Add Category URL</h2>
        </div>
        <form action={createCrawlTarget} className="url-form">
          <div className="field">
            <label htmlFor="label">Label</label>
            <input id="label" name="label" placeholder="Food & Beverages" />
          </div>
          <div className="field url-field">
            <label htmlFor="url">URL</label>
            <input id="url" name="url" placeholder="https://shop.tiktok.com/vn/c/..." required />
          </div>
          <div className="field">
            <label htmlFor="maxItems">Items</label>
            <input id="maxItems" name="maxItems" type="number" min="1" max="500" defaultValue={25} />
          </div>
          <div className="field">
            <label>&nbsp;</label>
            <button type="submit">Add URL</button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Crawl URL Queue</h2>
          <span className="muted">Only pending or failed URLs are crawled when Start Crawl is pressed.</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Items</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {targets.length === 0 ? (
                <tr>
                  <td colSpan={5}>No crawl URLs yet.</td>
                </tr>
              ) : (
                targetRows.map(({ target, discoveredCount, crawledCount, status }) => (
                  <tr key={target.id}>
                    <td className="url-cell">
                      <Link href={`/crawler/${target.id}`}>
                        <strong>{target.label ?? "Category URL"}</strong>
                        <div className="muted">{target.url}</div>
                      </Link>
                    </td>
                    <td>{target.maxItems.toLocaleString()}</td>
                    <td>
                      <span className={statusClass(status)}>{status}</span>
                    </td>
                    <td>
                      <strong>
                        {crawledCount.toLocaleString()} / {target.maxItems.toLocaleString()}
                      </strong>
                      <div className="muted">{discoveredCount.toLocaleString()} detail URLs found</div>
                    </td>
                    <td>
                      <div className="button-group">
                        <Link className="button secondary icon-only" href={`/crawler/${target.id}`} title="View Detail Progress">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </Link>
                        <form action={resetCrawlTarget.bind(null, target.id)}>
                          <button type="submit" className="secondary icon-only" title="Reset Crawl Target Status">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                          </button>
                        </form>
                        <form action={deleteCrawlTarget.bind(null, target.id)}>
                          <button type="submit" className="secondary danger-button icon-only" title="Delete Crawl Target">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {recentLog ? (
        <section className="panel">
          <div className="panel-header">
            <h2>Crawl Log</h2>
          </div>
          <pre className="log-output">{recentLog}</pre>
        </section>
      ) : null}
    </>
  );
}
