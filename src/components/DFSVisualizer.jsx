import React, { useState, useEffect, useCallback } from 'react';
import './DFSVisualizer.css'; // To be created

const DELAY_MS = 500;

// Generate a random graph with n nodes
function generateRandomGraph(numNodes) {
  const MIN_NODES = 4;
  const MAX_NODES = 15;
  const WIDTH = 300;
  const HEIGHT = 300;
  const PADDING = 30;
  
  // Ensure numNodes is within bounds
  numNodes = Math.max(MIN_NODES, Math.min(MAX_NODES, numNodes));
  
  // Generate node IDs (A, B, C, ...)
  const nodeIds = [];
  for (let i = 0; i < numNodes; i++) {
    nodeIds.push(String.fromCharCode(65 + i)); // A, B, C, ...
  }
  
  // Generate node positions - using a circular layout for better distribution
  const nodes = [];
  const radius = Math.min(WIDTH, HEIGHT) / 2 - PADDING;
  const centerX = WIDTH / 2;
  const centerY = HEIGHT / 2;
  
  for (let i = 0; i < nodeIds.length; i++) {
    const angle = (i / nodeIds.length) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    nodes.push({ id: nodeIds[i], x, y });
  }
  
  // Generate adjacency list (random connections)
  const adj = {};
  nodeIds.forEach(id => {
    adj[id] = [];
  });
  
  // Each node connects to approximately 2-3 other nodes
  nodeIds.forEach(id => {
    const numConnections = Math.floor(Math.random() * 2) + 2; // 2-3 connections
    const availableNodes = nodeIds.filter(n => n !== id && !adj[id].includes(n));
    
    for (let i = 0; i < Math.min(numConnections, availableNodes.length); i++) {
      // Pick a random node to connect to
      const randomIndex = Math.floor(Math.random() * availableNodes.length);
      const target = availableNodes[randomIndex];
      
      // Add bidirectional connection
      adj[id].push(target);
      adj[target].push(id);
      
      // Remove the node from available nodes
      availableNodes.splice(randomIndex, 1);
    }
  });
  
  // Ensure the graph is connected by adding connections if needed
  for (let i = 1; i < nodeIds.length; i++) {
    const current = nodeIds[i];
    const previous = nodeIds[i-1];
    
    if (!adj[current].includes(previous)) {
      adj[current].push(previous);
      adj[previous].push(current);
    }
  }
  
  return {
    nodes,
    adj,
    startNode: nodeIds[0], // Start from the first node
  };
}

// Default initial graph
const initialGraph = generateRandomGraph(6); // Start with 6 nodes

function getDFSHistory(graph, startNodeId) {
  const history = [];
  const adj = graph.adj;
  const visited = new Set();
  const path = []; // To store the order of visited nodes
  const callStack = []; // To visualize the stack for iterative DFS or recursion path

  function recordState(highlights, statusText) {
    history.push({
      visited: new Set(visited),
      path: [...path],
      callStack: [...callStack],
      highlights,
      status: statusText,
    });
  }

  function dfsRecursive(u) {
    visited.add(u);
    path.push(u);
    callStack.push(u);
    recordState({ visiting: u, currentEdge: null }, `Visiting node ${u}. Added to path and stack.`);

    for (const v of adj[u]) {
      recordState({ visiting: u, checkingNeighbor: v, currentEdge: { from: u, to: v } }, `Checking neighbor ${v} of ${u}.`);
      if (!visited.has(v)) {
        recordState({ visiting: u, movingTo: v, currentEdge: { from: u, to: v } }, `Moving from ${u} to unvisited neighbor ${v}.`);
        dfsRecursive(v);
        // Backtrack
        callStack.pop(); // Pop v as we return from its recursive call
        recordState({ visiting: u, backtrackedFrom: v, currentEdge: null }, `Backtracked from ${v} to ${u}. Stack: [${callStack.join(', ')}].`);
      } else {
        recordState({ visiting: u, neighborVisited: v, currentEdge: { from: u, to: v } }, `Neighbor ${v} already visited.`);
      }
    }
    // Finished with u's neighbors, effectively this is where u would be popped if we showed that explicitly for recursion
    if (callStack[callStack.length -1] === u) callStack.pop(); // Pop u as we finish its exploration
     recordState({ finishedNode: u, currentEdge: null }, `Finished exploring neighbors of ${u}. Stack: [${callStack.join(', ')}].`);
  }
  
  recordState({}, `Starting DFS from node ${startNodeId}.`);
  dfsRecursive(startNodeId);
  recordState({ dfsComplete: true }, `DFS complete. Path: ${path.join(' -> ')}.`);
  return history;
}

const DFSVisualizer = () => {
  const [nodeCount, setNodeCount] = useState(6);
  const [graphData, setGraphData] = useState(initialGraph);
  const [history, setHistory] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTraversing, setIsTraversing] = useState(false);
  const [traversalConcluded, setTraversalConcluded] = useState(false);
  
  const [currentVisited, setCurrentVisited] = useState(new Set());
  const [currentPath, setCurrentPath] = useState([]);
  const [currentCallStack, setCurrentCallStack] = useState([]);
  const [currentHighlights, setCurrentHighlights] = useState({});
  const [statusText, setStatusText] = useState('Press Start DFS');

  const initializeTraversal = useCallback(() => {
    const newHistory = getDFSHistory(graphData, graphData.startNode);
    setHistory(newHistory);
    setCurrentStepIndex(0);
    setIsTraversing(false);
    setTraversalConcluded(false);
    if (newHistory.length > 0) {
      const firstStep = newHistory[0];
      setCurrentVisited(firstStep.visited);
      setCurrentPath(firstStep.path);
      setCurrentCallStack(firstStep.callStack);
      setCurrentHighlights(firstStep.highlights || {});
      setStatusText(firstStep.status || 'Ready');
    }
  }, [graphData]);
  
  const regenerateGraph = useCallback(() => {
    const newGraph = generateRandomGraph(nodeCount);
    setGraphData(newGraph);
  }, [nodeCount]);
  
  // When node count changes, regenerate the graph
  useEffect(() => {
    regenerateGraph();
  }, [nodeCount, regenerateGraph]);

  useEffect(() => {
    initializeTraversal();
  }, [initializeTraversal]);

  const stepForward = useCallback(() => {
    if (currentStepIndex >= history.length - 1) {
      setTraversalConcluded(true);
      setIsTraversing(false);
      const lastStep = history[history.length - 1];
      setCurrentVisited(lastStep.visited);
      setCurrentPath(lastStep.path);
      setCurrentCallStack(lastStep.callStack);
      setCurrentHighlights(lastStep.highlights || {});
      setStatusText(lastStep.status || 'Traversal complete.');
      return;
    }
    const nextStepIdx = currentStepIndex + 1;
    setCurrentStepIndex(nextStepIdx);
    const nextStepData = history[nextStepIdx];
    setCurrentVisited(nextStepData.visited);
    setCurrentPath(nextStepData.path);
    setCurrentCallStack(nextStepData.callStack);
    setCurrentHighlights(nextStepData.highlights || {});
    setStatusText(nextStepData.status || '');
  }, [currentStepIndex, history]);

  useEffect(() => {
    if (isTraversing && !traversalConcluded) {
      const timer = setTimeout(stepForward, DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [isTraversing, traversalConcluded, stepForward]);

  const startTraversal = () => {
    if (traversalConcluded) initializeTraversal();
    setIsTraversing(true);
    if (currentStepIndex === 0 && history.length > 0) {
      const firstStep = history[0];
      setCurrentVisited(firstStep.visited);
      setCurrentPath(firstStep.path);
      setCurrentCallStack(firstStep.callStack);
      setCurrentHighlights(firstStep.highlights || {});
      setStatusText(firstStep.status || 'Traversing...');
    }
  };

  const stopTraversal = () => setIsTraversing(false);

  return (
    <div className="dfs-visualizer">
      <div className="controls">
        <button onClick={initializeTraversal} disabled={isTraversing}>Reset Graph</button>
        <button onClick={startTraversal} disabled={isTraversing || traversalConcluded}>Start DFS</button>
        <button onClick={stopTraversal} disabled={!isTraversing || traversalConcluded}>Pause</button>
        <button onClick={stepForward} disabled={isTraversing || traversalConcluded}>Next Step</button>
      </div>
      <div className="graph-controls">
        <label>
          Number of Nodes: 
          <input 
            type="range" 
            min="4" 
            max="15" 
            value={nodeCount} 
            onChange={(e) => {
              setNodeCount(parseInt(e.target.value));
              setIsTraversing(false);
              setTraversalConcluded(false);
            }} 
            disabled={isTraversing}
          />
          <span className="node-count-display">{nodeCount}</span>
        </label>
        <button onClick={regenerateGraph} disabled={isTraversing}>Generate New Graph</button>
      </div>
      <div className="status-text">{statusText}</div>
      <div className="info-panel">
        <div>Visited Order: {currentPath.join(' -> ')}</div>
        <div>Stack: [{currentCallStack.join(', ')}]</div>
      </div>
      <svg className="graph-container" viewBox="0 0 300 300">
        {/* Render Edges */} 
        {graphData.nodes.map(node => 
          graphData.adj[node.id].map(neighborId => {
            const neighborNode = graphData.nodes.find(n => n.id === neighborId);
            // To avoid drawing edges twice for undirected graph representation
            if (node.id < neighborId) { 
              let edgeClass = 'graph-edge';
              if (currentHighlights.currentEdge && 
                  ((currentHighlights.currentEdge.from === node.id && currentHighlights.currentEdge.to === neighborId) || 
                   (currentHighlights.currentEdge.from === neighborId && currentHighlights.currentEdge.to === node.id)))
              {
                edgeClass += ' active-edge';
              }
              return (
                <line 
                  key={`${node.id}-${neighborId}`}
                  x1={node.x} y1={node.y}
                  x2={neighborNode.x} y2={neighborNode.y}
                  className={edgeClass}
                />
              );
            }
            return null;
          })
        )}
        {/* Render Nodes */} 
        {graphData.nodes.map(node => {
          let nodeClass = 'graph-node';
          if (currentVisited.has(node.id)) nodeClass += ' visited';
          if (currentHighlights.visiting === node.id) nodeClass += ' visiting';
          if (currentHighlights.checkingNeighbor === node.id) nodeClass += ' checking-neighbor';
          if (currentHighlights.neighborVisited === node.id) nodeClass += ' neighbor-already-visited';
          if (currentHighlights.dfsComplete && currentPath.includes(node.id)) nodeClass += ' in-path-final';
          
          return (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              <circle r="15" className={nodeClass} />
              <text dy=".3em" textAnchor="middle" className="node-label">{node.id}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default DFSVisualizer;
