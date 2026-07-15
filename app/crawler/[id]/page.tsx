import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteCrawlTarget, resetCrawlTarget } from "@/app/actions";
import { effectiveCrawlTargetStatus, getCrawlTargetProgress } from "@/lib/crawl-target-progress";
import { prisma } from "@/lib/prisma";

type CrawlTargetDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

function formatDate(value: Date | null) {
  if (!value) {
    return "-";
  }

  return value.toLocaleString();
}

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

export default async function CrawlTargetDetailPage({ params }: CrawlTargetDetailPageProps) {
  const { id } = await params;
  const target = await prisma.crawlTarget.findUnique({ where: { id } });

  if (!target) {
    notFound();
  }

  const jobs = await prisma.crawlJob.findMany({
    where: {
      OR: [{ targetUrl: target.url }, { targetUrl: { contains: target.id } }],
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const progress = await getCrawlTargetProgress(target.url);
  const productUrls = progress.productUrls;
  const products = productUrls.length
    ? await prisma.product.findMany({
        where: { productUrl: { in: productUrls } },
        select: {
          id: true,
          productUrl: true,
        },
      })
    : [];
  const productsByUrl = new Map(products.map((product) => [product.productUrl, product]));
  const status = effectiveCrawlTargetStatus(target.status, progress);
  const discoveredCount = Math.max(target.discoveredCount, progress.discoveredCount);
  const crawledCount = Math.max(target.crawledCount, progress.crawledCount);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>{target.label ?? "Crawl URL"}</h1>
          <p className="url-text">{target.url}</p>
        </div>
        <div className="button-group">
          <Link className="button secondary" href="/crawler">
            Back
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
      </div>

      <div className="detail-grid">
        <section className="card">
          <h2>URL Settings</h2>
          <div className="kv">
            <div>
              <span>Status</span>
              <span className={statusClass(status)}>{status}</span>
            </div>
            <div>
              <span>Items</span>
              {target.maxItems.toLocaleString()}
            </div>
            <div>
              <span>Found</span>
              {discoveredCount.toLocaleString()}
            </div>
            <div>
              <span>Crawled</span>
              {crawledCount.toLocaleString()}
            </div>
            <div>
              <span>Fetcher</span>
              {target.fetcher}
            </div>
            <div>
              <span>Expand Categories</span>
              {target.expandCategoryPages ? "Yes" : "No"}
            </div>
            <div>
              <span>Started</span>
              {formatDate(target.lastStartedAt)}
            </div>
            <div>
              <span>Finished</span>
              {formatDate(target.lastFinishedAt)}
            </div>
            <div>
              <span>Created</span>
              {formatDate(target.createdAt)}
            </div>
            <div>
              <span>Updated</span>
              {formatDate(target.updatedAt)}
            </div>
          </div>
        </section>

        <aside className="card">
          <h2>Last Error</h2>
          <p className="muted url-text">{target.lastError ?? "No error recorded."}</p>
        </aside>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Product Detail URLs</h2>
          <span className="muted">{productUrls.length.toLocaleString()} URLs from crawl snapshots</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Detail URL</th>
                <th>Product ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {productUrls.length === 0 ? (
                <tr>
                  <td colSpan={3}>No product detail URLs found for this crawl URL yet.</td>
                </tr>
              ) : (
                productUrls.map((url) => {
                  const product = productsByUrl.get(url);
                  return (
                    <tr key={url}>
                      <td className="url-cell">{url}</td>
                      <td>
                        {product ? (
                          <Link href={`/products/${product.id}`}>
                            <strong>{product.id}</strong>
                          </Link>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        <span className={product ? "badge success" : "badge"}>{product ? "crawled" : "pending"}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Related Crawl Jobs</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Status</th>
                <th>Started</th>
                <th>Finished</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={5}>No related jobs yet.</td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.jobType}</td>
                    <td>
                      <span className={statusClass(job.status)}>{job.status}</span>
                    </td>
                    <td>{formatDate(job.startedAt)}</td>
                    <td>{formatDate(job.completedAt ?? job.finishedAt)}</td>
                    <td className="url-cell">{job.errorMessage ?? job.error ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
