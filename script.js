/**
 * Copyright (c) 2025 A. N. Hidayat (anhidayat.my.id)
 * JSON Formatter & Validator - A simple tool to format and validate JSON data
 * This file is part of JSON Formatter & Validator.
 * https://anhidayat.my.id/
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const inputJson = document.getElementById('inputJson');
    const outputJson = document.getElementById('outputJson');
    const formatBtn = document.getElementById('formatBtn');
    const minifyBtn = document.getElementById('minifyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const viewJsonBtn = document.getElementById('viewJsonBtn');
    const viewTableBtn = document.getElementById('viewTableBtn');
    const tableContainer = document.getElementById('tableContainer');
    const errorSection = document.getElementById('errorSection');
    const errorMessage = document.getElementById('errorMessage');
    
    let currentJson = null;
    let currentView = 'json';

    // Format JSON with syntax highlighting
    function formatJson(jsonString) {
        try {
            // Parse and stringify to validate JSON
            currentJson = JSON.parse(jsonString);
            const formattedJson = JSON.stringify(currentJson, null, 4);
            
            // Apply syntax highlighting
            const highlightedJson = syntaxHighlight(formattedJson);
            outputJson.innerHTML = highlightedJson;
            
            // Update table view if it's currently active
            if (currentView === 'table') {
                showTableView();
            }
            
            // Hide any previous errors
            errorSection.style.display = 'none';
            return true;
        } catch (error) {
            showError('Invalid JSON: ' + error.message);
            return false;
        }
    }

    // Minify JSON
    function minifyJson(jsonString) {
        try {
            currentJson = JSON.parse(jsonString);
            const minifiedJson = JSON.stringify(currentJson);
            outputJson.textContent = minifiedJson;
            
            // Update table view if it's currently active
            if (currentView === 'table') {
                showTableView();
            }
            
            // Hide any previous errors
            errorSection.style.display = 'none';
            return true;
        } catch (error) {
            showError('Invalid JSON: ' + error.message);
            return false;
        }
    }

    // Show table view
    function showTableView() {
        if (!currentJson) return;
        
        try {
            const tableHtml = createTableFromJson(currentJson);
            tableContainer.innerHTML = tableHtml;
            tableContainer.style.display = 'block';
            outputJson.style.display = 'none';
            viewJsonBtn.classList.remove('active');
            viewTableBtn.classList.add('active');
            currentView = 'table';
            errorSection.style.display = 'none';
        } catch (error) {
            showError('Cannot display as table: ' + error.message);
        }
    }
    
    // Show JSON view
    function showJsonView() {
        tableContainer.style.display = 'none';
        outputJson.style.display = 'block';
        viewTableBtn.classList.remove('active');
        viewJsonBtn.classList.add('active');
        currentView = 'json';
        
        // Add watermark to JSON output
        if (outputJson.textContent.trim() && outputJson.textContent !== '{}') {
            const watermark = document.createElement('div');
            watermark.className = 'json-watermark';
            watermark.textContent = 'anhidayat.my.id';
            outputJson.appendChild(watermark);
        }
    }

    // Create HTML table from JSON
    function createTableFromJson(jsonObj) {
        if (!jsonObj || typeof jsonObj !== 'object') {
            return '<p>No valid JSON data to display as table</p>';
        }

        let html = '<table id="jsonTable"><thead><tr>';
        const headers = new Set();
        const rows = [];

        // Function to collect all unique headers and row data
        function processObject(obj, parentKey = '') {
            const row = {};
            for (const [key, value] of Object.entries(obj)) {
                const fullKey = parentKey ? `${parentKey}.${key}` : key;
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    processObject(value, fullKey);
                } else {
                    headers.add(fullKey);
                    row[fullKey] = formatValue(value);
                }
            }
            if (Object.keys(row).length > 0) {
                rows.push(row);
            }
        }

        // Handle array of objects
        if (Array.isArray(jsonObj)) {
            jsonObj.forEach(item => {
                if (item && typeof item === 'object') {
                    processObject(item);
                }
            });
        } else {
            processObject(jsonObj);
        }

        // Create header row
        const headerArray = Array.from(headers);
        if (headerArray.length === 0) {
            return '<p>No tabular data found in JSON</p>';
        }

        html += headerArray.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';

        // Create data rows
        if (rows.length === 0) {
            html += `<tr><td colspan="${headerArray.length}" style="text-align: center;">No data rows</td></tr>`;
        } else {
            rows.forEach(row => {
                html += '<tr>';
                headerArray.forEach(header => {
                    const value = row[header] !== undefined ? row[header] : '';
                    html += `<td>${value}</td>`;
                });
                html += '</tr>';
            });
        }

        html += `</tbody></table>
        <div class="table-watermark">anhidayat.my.id</div>`;
        return html;
    }

    // Format value for table cell
    function formatValue(value) {
        if (value === null) return '<span class="null">null</span>';
        if (typeof value === 'boolean') return `<span class="boolean">${value}</span>`;
        if (typeof value === 'number') return `<span class="number">${value}</span>`;
        if (typeof value === 'string') {
            // Check if it's a date string
            if (!isNaN(Date.parse(value))) {
                const date = new Date(value);
                return date.toLocaleString();
            }
            return `<span class="string">${value}</span>`;
        }
        if (Array.isArray(value)) {
            return `[${value.length} items]`;
        }
        if (typeof value === 'object') {
            return '{...}';
        }
        return JSON.stringify(value);
    }

    // Syntax highlighting for JSON
    function syntaxHighlight(json) {
        if (typeof json !== 'string') {
            json = JSON.stringify(json, null, 4);
        }
        
        return json
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/("\w+"):/g, '<span class="key">$1</span>:')
            .replace(/"([^"]*)"(?=:)/g, '<span class="key">"$1"</span>')
            .replace(/"([^"]*)"(?=,?$)/gm, '<span class="string">"$1"</span>')
            .replace(/\b(true|false)\b/g, '<span class="boolean">$1</span>')
            .replace(/\b(null)\b/g, '<span class="null">$1</span>')
            .replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');
    }

    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorSection.style.display = 'block';
    }

    // Copy to clipboard
    function copyToClipboard() {
        let textToCopy;
        if (currentView === 'table') {
            // Convert table to TSV for better copy-paste experience
            const table = tableContainer.querySelector('table');
            if (!table) return;
            
            const rows = Array.from(table.querySelectorAll('tr'));
            const tsv = rows.map(row => 
                Array.from(row.querySelectorAll('th, td'))
                    .map(cell => cell.textContent.replace(/\n/g, ' ').replace(/\t/g, ' ').trim())
                    .join('\t')
            ).join('\n');
            
            textToCopy = tsv;
        } else {
            textToCopy = outputJson.textContent;
        }
        
        if (!textToCopy) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        }).catch(err => {
            showError('Failed to copy: ' + err);
        });
    }

    // Event Listeners
    formatBtn.addEventListener('click', () => {
        if (inputJson.value.trim() === '') return;
        formatJson(inputJson.value);
    });

    minifyBtn.addEventListener('click', () => {
        if (inputJson.value.trim() === '') return;
        minifyJson(inputJson.value);
    });

    clearBtn.addEventListener('click', () => {
        inputJson.value = '';
        outputJson.textContent = '{}';
        tableContainer.innerHTML = '';
        currentJson = null;
        errorSection.style.display = 'none';
        showJsonView();
    });

    copyBtn.addEventListener('click', copyToClipboard);
    viewJsonBtn.addEventListener('click', showJsonView);
    viewTableBtn.addEventListener('click', showTableView);

    // Auto-format on paste
    inputJson.addEventListener('paste', (e) => {
        // Let the paste happen first
        setTimeout(() => {
            formatJson(inputJson.value);
        }, 10);
    });

    // Auto-format when typing (with debounce)
    let typingTimer;
    inputJson.addEventListener('input', () => {
        clearTimeout(typingTimer);
        if (inputJson.value.trim() === '') {
            outputJson.textContent = '{}';
            tableContainer.innerHTML = '';
            currentJson = null;
            return;
        }
        
        // Only format if the input is valid JSON
        try {
            JSON.parse(inputJson.value);
            typingTimer = setTimeout(() => formatJson(inputJson.value), 800);
        } catch (e) {
            // Don't show error while typing, only on explicit actions
        }
    });

    // Load with example JSON
    const exampleJson = [
        {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "active": true,
            "joinDate": "2023-01-15T10:30:00Z",
            "roles": ["user", "admin"],
            "profile": {
                "age": 30,
                "country": "USA"
            }
        },
        {
            "id": 2,
            "name": "Jane Smith",
            "email": "jane@example.com",
            "active": true,
            "joinDate": "2023-02-20T14:45:00Z",
            "roles": ["user"],
            "profile": {
                "age": 25,
                "country": "Canada"
            }
        },
        {
            "id": 3,
            "name": "Bob Johnson",
            "email": "bob@example.com",
            "active": false,
            "joinDate": "2023-03-10T09:15:00Z",
            "roles": ["user", "editor"],
            "profile": {
                "age": 35,
                "country": "UK"
            }
        }
    ];
    
    inputJson.value = JSON.stringify(exampleJson, null, 2);
    formatJson(inputJson.value);
});
