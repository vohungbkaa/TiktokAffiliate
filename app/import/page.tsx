import Link from "next/link";

export default function ImportPage() {
  return (
    <>
      <div className="page-header">
        <div>
          <h1>CSV Import</h1>
          <p>Upload product rows from a CSV file. Existing rows are matched by product_url.</p>
        </div>
        <Link className="button secondary" href="/products">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: "4px" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          View Products
        </Link>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Upload CSV</h2>
        </div>
        <div style={{ padding: "24px" }}>
          <form action="/api/products/import" method="post" encType="multipart/form-data">
            <div className="field">
              <label htmlFor="file">CSV File</label>
              <input id="file" name="file" type="file" accept=".csv,text/csv" required />
            </div>
            <div className="form-actions">
              <button type="submit">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: "4px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Import Products
              </button>
              <a className="button secondary" href="/data/sample-products.csv">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: "4px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Sample CSV
              </a>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
