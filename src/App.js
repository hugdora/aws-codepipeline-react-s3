function App() {
  return (
    <div style={{ fontFamily: 'monospace', maxWidth: '800px', margin: '80px auto', padding: '0 32px' }}>
      <h1 style={{ color: '#f04a79', fontSize: '32px' }}>AWS CodePipeline Demo</h1>
      <p style={{ color: '#469357', fontSize: '16px', lineHeight: '1.7' }}>
        Simple React application automatically deployed via AWS CodePipeline + CodeBuild + S3.
      </p>
      <div style={{ marginTop: '40px', padding: '20px', background: '#0d1322', border: '1px solid #1e2d4a' }}>
        <p style={{ color: '#a7ba84', margin: 0 }}>Pipeline: GitHub → CodePipeline → CodeBuild → S3</p>
      </div>
    </div>
  );
}

export default App;
