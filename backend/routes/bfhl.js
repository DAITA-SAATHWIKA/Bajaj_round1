const express = require('express');
const router = express.Router();

function getDepth(u, adj) {
    let maxCDepth = 0;
    const children = adj.get(u) || [];
    for (const v of children) {
        maxCDepth = Math.max(maxCDepth, getDepth(v, adj));
    }
    return 1 + maxCDepth;
}

function getTreeSize(u, adj) {
    let size = 1;
    const children = adj.get(u) || [];
    for (const v of children) {
        size += getTreeSize(v, adj);
    }
    return size;
}

function buildTree(u, adj, visited) {
    if (visited) visited.add(u);
    const obj = {};
    const children = adj.get(u) || [];
    for (const v of children) {
        obj[v] = buildTree(v, adj, visited);
    }
    return obj;
}

router.post('/', (req, res) => {
    try {
        const { data } = req.body;
        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ error: "Invalid request payload. Expected an array in 'data' field." });
        }

        const invalid_entries = [];
        const duplicate_edges = [];
        const seenEdges = new Set();
        const allNodes = new Set();
        
        const adj = new Map();
        const parentMap = new Map();

        data.forEach(item => {
            const trimmed = typeof item === 'string' ? item.trim() : "";
            const validRegex = /^[A-Z]->[A-Z]$/;
            
            if (!validRegex.test(trimmed)) {
                invalid_entries.push(item);
                return;
            }

            const [u, v] = trimmed.split('->');
            if (u === v) { // Rules might treat A->A as invalid based on "A->A" in invalid examples
                invalid_entries.push(item);
                return;
            }

            if (seenEdges.has(trimmed)) {
                if (!duplicate_edges.includes(item)) { // the requirement says "only once" and duplicates go to duplicate_edges
                    duplicate_edges.push(trimmed);
                }
                return; // skip exactly identical edges
            }

            seenEdges.add(trimmed);
            
            // Add nodes
            allNodes.add(u);
            allNodes.add(v);

            // "If a node has multiple parents -> keep first, ignore others"
            if (!parentMap.has(v)) {
                parentMap.set(v, u);
                if (!adj.has(u)) adj.set(u, []);
                adj.get(u).push(v);
            }
        });

        const roots = [];
        for (const node of allNodes) {
            if (!parentMap.has(node)) {
                roots.push(node);
            }
        }

        const visited = new Set();
        const hierarchies = [];
        let total_trees = 0;
        let total_cycles = 0;
        let largest_tree_root = "";
        let max_tree_depth = 0;

        roots.sort(); // Sorting for determinism, although not explicitly required

        for (const r of roots) {
            total_trees++;
            const treeRootObj = {};
            treeRootObj[r] = buildTree(r, adj, visited);
            const depth = getDepth(r, adj);
            hierarchies.push({
                root: r,
                tree: treeRootObj,
                depth: depth
            });

            if (depth > max_tree_depth || (depth === max_tree_depth && (largest_tree_root === "" || r < largest_tree_root))) {
                max_tree_depth = depth;
                largest_tree_root = r;
            }
        }

        const unvisited = [...allNodes].filter(node => !visited.has(node));
        const visitedCycles = new Set(); // to keep track of cycle traversal locally

        for (const unvNode of unvisited) {
            if (!visitedCycles.has(unvNode)) {
                total_cycles++;
                // Find all nodes in this weakly connected component
                const q = [unvNode];
                const compNodes = [];
                visitedCycles.add(unvNode);

                while (q.length > 0) {
                    const current = q.shift();
                    compNodes.push(current);
                    
                    const neighbors = [];
                    if (adj.has(current)) neighbors.push(...adj.get(current));
                    if (parentMap.has(current)) neighbors.push(parentMap.get(current));

                    for (const neighbor of neighbors) {
                        if (!visitedCycles.has(neighbor)) {
                            visitedCycles.add(neighbor);
                            q.push(neighbor);
                        }
                    }
                }

                compNodes.sort();
                const cycleRoot = compNodes[0]; // Lexicographically smallest

                hierarchies.push({
                    root: cycleRoot,
                    tree: {},
                    has_cycle: true
                });
            }
        }

        res.json({
            user_id: "Daita Saathwika_04012005",
            email_id: "sd1754@srmist.edu.in",
            college_roll_number: "RA2311033010165",
            hierarchies,
            invalid_entries,
            duplicate_edges,
            summary: {
                total_trees,
                total_cycles,
                largest_tree_root: largest_tree_root || null
            }
        });

    } catch (error) {
        console.error("Error processing graph", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get('/', (req, res) => {
    // Returns default schema for direct browser visits (GET requests)
    res.status(200).json({
        user_id: "Daita Saathwika_04012005",
        email_id: "sd1754@srmist.edu.in",
        college_roll_number: "RA2311033010165",
        hierarchies: [],
        invalid_entries: [],
        duplicate_edges: [],
        summary: {
            total_trees: 0,
            total_cycles: 0,
            largest_tree_root: null
        }
    });
});

module.exports = router;
