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
              <button type="submit">Import Products</button>
              <a className="button secondary" href="/data/sample-products.csv">
                Sample CSV
              </a>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
