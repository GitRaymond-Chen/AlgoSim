import React, { useState } from "react";
import "./App.css";
import algorithms from "./data/algorithms";
import BubbleSortVisualizer from "./components/BubbleSortVisualizer";
import SelectionSortVisualizer from "./components/SelectionSortVisualizer";
import InsertionSortVisualizer from "./components/InsertionSortVisualizer";
import MergeSortVisualizer from "./components/MergeSortVisualizer";
import QuickSortVisualizer from "./components/QuickSortVisualizer";
import HeapSortVisualizer from "./components/HeapSortVisualizer";
import CountingSortVisualizer from "./components/CountingSortVisualizer";
import RadixSortVisualizer from "./components/RadixSortVisualizer";
import LinearSearchVisualizer from "./components/LinearSearchVisualizer";
import BinarySearchVisualizer from "./components/BinarySearchVisualizer";
import DFSVisualizer from "./components/DFSVisualizer";
import BFSVisualizer from "./components/BFSVisualizer";

function Sidebar({ selected, setSelected }) {
  return (
    <aside className="sidebar">
      <h2>Algorithms</h2>
      <div className="category">Sorting</div>
      {algorithms.sorting.map((algo) => (
        <div key={algo.id} className={selected === algo.id ? "selected" : ""} onClick={() => setSelected(algo.id)}>
          {algo.name}
        </div>
      ))}
      <div className="category">Searching</div>
      {algorithms.searching.map((algo) => (
        <div key={algo.id} className={selected === algo.id ? "selected" : ""} onClick={() => setSelected(algo.id)}>
          {algo.name}
        </div>
      ))}
      <div className="category">Graph Traversal</div>
      {algorithms.graph.map((algo) => (
        <div key={algo.id} className={selected === algo.id ? "selected" : ""} onClick={() => setSelected(algo.id)}>
          {algo.name}
        </div>
      ))}
    </aside>
  );
}

function AlgorithmPage({ algo }) {
  if (!algo) return <div className="algo-page">Select an algorithm to visualize!</div>;
  return (
    <div className="algo-page">
      <h1>{algo.name}</h1>
      <p><strong>Concept:</strong> {algo.concept}</p>
      <p><strong>Complexity:</strong> {algo.complexity}</p>
      <p><strong>Use Case:</strong> {algo.useCase}</p>
            {algo.id === 'bubble' && <BubbleSortVisualizer />}
      {algo.id === 'selection' && <SelectionSortVisualizer />}
      {algo.id === 'insertion' && <InsertionSortVisualizer />}
      {algo.id === 'merge' && <MergeSortVisualizer />}
      {algo.id === 'quick' && <QuickSortVisualizer />}
      {algo.id === 'heap' && <HeapSortVisualizer />}
      {algo.id === 'counting' && <CountingSortVisualizer />}
      {algo.id === 'radix' && <RadixSortVisualizer />}
      {algo.id === 'linear' && <LinearSearchVisualizer />}
      {algo.id === 'binary' && <BinarySearchVisualizer />}
      {algo.id === 'dfs' && <DFSVisualizer />}
      {algo.id === 'bfs' && <BFSVisualizer />}
      {algo.id !== 'bubble' && algo.id !== 'selection' && algo.id !== 'insertion' && algo.id !== 'merge' && algo.id !== 'quick' && algo.id !== 'heap' && algo.id !== 'counting' && algo.id !== 'radix' && algo.id !== 'linear' && algo.id !== 'binary' && algo.id !== 'dfs' && algo.id !== 'bfs' && <div className="visualizer-placeholder">[Visualizer for {algo.name} coming soon]</div>}
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState(null);
  const allAlgos = [
    ...algorithms.sorting,
    ...algorithms.searching,
    ...algorithms.graph
  ];
  const algo = allAlgos.find((a) => a.id === selected);
  return (
    <div className="app-container">
      <Sidebar selected={selected} setSelected={setSelected} />
      <AlgorithmPage algo={algo} />
    </div>
  );
}
