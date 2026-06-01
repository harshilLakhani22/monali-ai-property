async function test() {
  try {
    const res = await fetch('http://localhost:8000/api/documents/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document_id: "test",
        project_id: "test",
        file_url: "http://example.com"
      })
    });
    console.log('Status:', res.status);
    console.log('Body:', await res.text());
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}
test();
