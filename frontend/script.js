document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('graph-form');
    const edgesInput = document.getElementById('edges-input');
    const submitBtn = document.getElementById('submit-btn');
    const loader = document.getElementById('loader');
    const btnText = submitBtn.querySelector('span');
    const errorMsg = document.getElementById('error-message');
    const resultsPanel = document.getElementById('results');

    // Badges
    const valTrees = document.getElementById('val-trees');
    const valCycles = document.getElementById('val-cycles');
    const valRoot = document.getElementById('val-root');

    // UI lists
    const treesContainer = document.getElementById('trees-container');
    const invalidList = document.getElementById('invalid-list');
    const duplicateList = document.getElementById('duplicate-list');

    function renderTreeHTML(node, treeObj, isRoot = false) {
        let html = `<div class="node-item">`;
        html += `<span class="node-value ${isRoot ? 'root-node-value' : ''}">${node}</span>`;
        if (treeObj && treeObj[node]) {
            const children = Object.keys(treeObj[node]);
            if (children.length > 0) {
                html += `<div class="node-container">`;
                for (const child of children) {
                    html += renderTreeHTML(child, treeObj[node]);
                }
                html += `</div>`;
            }
        }
        html += `</div>`;
        return html;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let parsedData = [];
        try {
            const raw = edgesInput.value.trim();
            if (raw.startsWith('[')) {
                parsedData = JSON.parse(raw);
            } else {
                parsedData = raw.split(',').map(s => s.trim()).filter(s => s);
            }
        } catch (err) {
            errorMsg.textContent = "Invalid format. Use a JSON array or comma separated items.";
            errorMsg.style.display = 'block';
            return;
        }

        // Reset UI
        errorMsg.style.display = 'none';
        loader.classList.remove('loader-hidden');
        btnText.textContent = 'Processing...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('http://localhost:3000/bfhl', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data: parsedData })
            });

            if (!response.ok) {
                throw new Error("API request failed with status " + response.status);
            }

            const resData = await response.json();
            
            // Render Badges
            valTrees.textContent = resData.summary.total_trees;
            valCycles.textContent = resData.summary.total_cycles;
            valRoot.textContent = resData.summary.largest_tree_root || '-';

            // Render Trees
            treesContainer.innerHTML = '';
            if (resData.hierarchies.length === 0) {
                treesContainer.innerHTML = '<p style="color:var(--text-secondary)">No hierarchies computed.</p>';
            } else {
                resData.hierarchies.forEach(h => {
                    const card = document.createElement('div');
                    card.className = 'tree-card';
                    
                    let html = `<div class="tree-header">
                        <h3>Root: ${h.root}</h3>
                        <div class="tree-meta">`;
                        
                    if (h.has_cycle) {
                        html += `<span class="meta-badge meta-cycle">Cycle Detected</span>`;
                    } else {
                        html += `<span class="meta-badge">Depth: ${h.depth}</span>`;
                    }
                    html += `</div></div>`;
                    
                    html += `<div class="tree-visual">`;
                    if (h.has_cycle) {
                        html += `<div class="node-item">
                            <span class="node-value root-node-value">${h.root}</span>
                            <span class="cycle-text">... (Nodes trapped in cycle)</span>
                        </div>`;
                    } else {
                        html += renderTreeHTML(h.root, h.tree, true);
                    }
                    html += `</div>`;
                    card.innerHTML = html;
                    treesContainer.appendChild(card);
                });
            }

            // Render Invalids
            invalidList.innerHTML = '';
            if (resData.invalid_entries.length === 0) {
                invalidList.innerHTML = '<li>None</li>';
            } else {
                resData.invalid_entries.forEach(entry => {
                    const li = document.createElement('li');
                    li.textContent = entry;
                    invalidList.appendChild(li);
                });
            }

            // Render Duplicates
            duplicateList.innerHTML = '';
            if (resData.duplicate_edges.length === 0) {
                duplicateList.innerHTML = '<li>None</li>';
            } else {
                resData.duplicate_edges.forEach(entry => {
                    const li = document.createElement('li');
                    li.textContent = entry;
                    duplicateList.appendChild(li);
                });
            }

            resultsPanel.classList.remove('hidden');

        } catch (error) {
            console.error(error);
            errorMsg.textContent = "Failed to connect to API. Is the server running?";
            errorMsg.style.display = 'block';
            resultsPanel.classList.add('hidden');
        } finally {
            loader.classList.add('loader-hidden');
            btnText.textContent = 'Process Graph';
            submitBtn.disabled = false;
        }
    });

    // Setup initial state: Pre-fill some data to wow the user
    edgesInput.value = '["A->B", "A->C", "B->D", "B->E", "C->F", "X->Y", "Y->X", "1->2", "A->B", "A->B"]';
});
