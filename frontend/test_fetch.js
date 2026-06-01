async function test() {
  try {
    const res = await fetch('http://localhost:8000/api/health');
    console.log('Status:', res.status);
    console.log('Body:', await res.text());
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}
test();
