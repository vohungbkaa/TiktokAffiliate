import { existsSync, readFileSync } from "node:fs";
import Link from "next/link";
import {
  createCrawlTarget,
  deleteCrawlTarget,
  resetCrawlTarget,
  startPendingCrawlTargets,
} from "@/app/actions";
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

  return (
    <>
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
                        <Link className="button secondary" href={`/crawler/${target.id}`}>
                          Detail
                        </Link>
                        <form action={resetCrawlTarget.bind(null, target.id)}>
                          <button type="submit" className="secondary">
                            Reset
                          </button>
                        </form>
                        <form action={deleteCrawlTarget.bind(null, target.id)}>
                          <button type="submit" className="secondary danger-button">
                            Delete
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
