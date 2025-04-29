import React, { useState } from 'react';

function Xss() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setOutput(input); // Store user input

    // This will render HTML and execute any JS
    document.getElementById("output").innerHTML = input; // Unsafe: executes input as raw HTML
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test XSS and MongoDB Injection</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          rows="5"
          cols="50"
          placeholder="Enter something (try XSS or MongoDB injection)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <br />
        <button type="submit" style={{ marginTop: '10px' }}>Submit</button>
      </form>

      <div style={{ marginTop: '20px' }}>
        <h2>Output:</h2>
        <div id="output"></div> {/* Here the raw HTML will be rendered */}
      </div>
    </div>
  );
}

export default Xss;
