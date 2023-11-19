let logData = ''; // Initialize logData variable

function viewLogFile() {
  const fileInput = document.getElementById('logFile');
  const resultsDiv = document.getElementById('results');
  const searchInput = document.getElementById('searchInput');
  const executeSearchBtn = document.getElementById('executeSearchBtn');

  if (fileInput.files.length === 0) {
    resultsDiv.innerHTML = '<p>Please select a file.</p>';
    return;
  }

  const selectedFile = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    const fileContent = event.target.result;
    logData = fileContent; // Update logData with file content

    resultsDiv.innerHTML = `<p>Uploaded file: ${selectedFile.name}</p>`;

    if (selectedFile.name.toLowerCase().endsWith('.xml')) {
      // Handle XML file
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(fileContent, 'text/xml');
      const xmlString = new XMLSerializer().serializeToString(xmlDoc);
      resultsDiv.innerHTML += `<pre>${xmlString}</pre>`;
    } else if (selectedFile.name.toLowerCase().endsWith('.sql')) {
      // Handle SQL file
      // For SQL, you might display the content as plain text
      resultsDiv.innerHTML += `<pre>${fileContent}</pre>`;
    } else {
      // For other file types, display as plain text
      resultsDiv.innerHTML += `<pre>${fileContent}</pre>`;
    }

    searchInput.style.display = 'block';
    executeSearchBtn.style.display = 'block';
  };

  reader.readAsText(selectedFile);
}

function executeSearch() {
  const searchTerm = document.getElementById('searchInput').value.trim();
  const resultsDiv = document.getElementById('results');

  if (searchTerm === '') {
    resultsDiv.innerHTML = '<p>Please enter a search keyword.</p>';
    return;
  }

  const lines = logData.split('\n');
  const matchingLines = lines.filter(line => line.toLowerCase().includes(searchTerm.toLowerCase()));

  if (matchingLines.length === 0) {
    resultsDiv.innerHTML = `<p>No matching logs found for "${searchTerm}".</p>`;
  } else {
    const commonAnomalies = detectCommonAnomalies(matchingLines);

    resultsDiv.innerHTML = `<p>Search results for "${searchTerm}":</p>`;
    resultsDiv.innerHTML += `<pre>${highlightSearchTerm(matchingLines.join('\n'), searchTerm, commonAnomalies)}</pre>`;
  }
}

function highlightSearchTerm(logs, searchTerm, anomalies) {
  let highlightedLogs = logs.replace(new RegExp(searchTerm, 'gi'), match => `<span style="background-color: yellow;">${match}</span>`);

  if (anomalies && anomalies.length > 0) {
    anomalies.forEach(anomaly => {
      highlightedLogs = highlightedLogs.replace(new RegExp(anomaly, 'gi'), match => `<span style="background-color: red; color: white; font-weight: bold;">${match}</span>`);
    });
  }

  return highlightedLogs;
}

function detectCommonAnomalies(lines) {
  const anomalies = [];

  const commonAnomalyPatterns = /(error|warning|failed)/i;

  lines.forEach(line => {
    const matches = line.match(commonAnomalyPatterns);
    if (matches && matches.length > 0) {
      anomalies.push(matches[0]);
    }
  });

  return anomalies;
}