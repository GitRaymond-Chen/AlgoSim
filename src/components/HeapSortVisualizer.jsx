import React, { useState, useEffect, useCallback } from 'react';
import './HeapSortVisualizer.css'; // To be created

const ARRAY_SIZE = 15;
const MIN_VAL = 5;
const MAX_VAL = 100;
const DELAY_MS = 200;

function generateRandomArray() {
  const arr = [];
  for (let i = 0; i < ARRAY_SIZE; i++) {
    arr.push(Math.floor(Math.random() * (MAX_VAL - MIN_VAL + 1)) + MIN_VAL);
  }
  return arr;
}

function getHeapSortHistory(initialArray) {
  const history = [];
  let array = [...initialArray];
  let n = array.length;

  function recordState(highlights, statusText) {
    history.push({ arrayState: [...array], highlights: { ...highlights, heapSize: n }, status: statusText });
  }

  // To heapify a subtree rooted with node i which is an index in array[]
  // n is size of heap
  function heapifyDown(heapSize, i) {
    let largest = i; // Initialize largest as root
    let left = 2 * i + 1; // left = 2*i + 1
    let right = 2 * i + 2; // right = 2*i + 2

    recordState({ currentRoot: i, comparing: [left, right].filter(idx => idx < heapSize), status: `Heapifying at index ${i} (value ${array[i]})` });

    // If left child is larger than root
    if (left < heapSize) {
        recordState({ currentRoot: i, comparingWith: left, status: `Comparing root ${array[i]} with left child ${array[left]}` });
        if (array[left] > array[largest]) {
            largest = left;
        }
    }

    // If right child is larger than largest so far
    if (right < heapSize) {
        recordState({ currentRoot: i, comparingWith: right, status: `Comparing current largest ${array[largest]} with right child ${array[right]}` });
        if (array[right] > array[largest]) {
            largest = right;
        }
    }
    // If largest is not root
    if (largest !== i) {
      recordState({ currentRoot: i, swapping: [i, largest], status: `Swapping ${array[i]} with ${array[largest]}` });
      [array[i], array[largest]] = [array[largest], array[i]];
      recordState({ currentRoot: i, swapped: [i, largest], status: `Swapped. Recursively heapify affected sub-tree.` });
      // Recursively heapify the affected sub-tree
      heapifyDown(heapSize, largest);
    } else {
        recordState({ currentRoot: i, heapifyDoneForNode: i, status: `Heap property maintained at index ${i}` });
    }
  }

  // Build heap (rearrange array)
  recordState({ status: 'Building Max Heap...' });
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapifyDown(n, i);
  }
  recordState({ heapBuilt: true, status: 'Max Heap Built.' });

  // One by one extract an element from heap
  for (let i = n - 1; i > 0; i--) {
    recordState({ extractingMax: 0, swappingWithLast: i, status: `Extracting max ${array[0]}. Swapping with last element ${array[i]} of current heap.` });
    // Move current root to end
    [array[0], array[i]] = [array[i], array[0]];
    recordState({ extracted: i, newRoot: 0, status: `Max element ${array[i]} moved to sorted position. Heap size reduced.` });
    n--; // Reduce heap size for heapify call
    // call max heapify on the reduced heap
    heapifyDown(n, 0);
     recordState({ heapBuilt: true, sortedPortionStart: i, status: `Heap re-established. Sorted portion from index ${i}.` });
  }
  recordState({ sorted: true, status: 'Array sorted' });
  return history;
}

const HeapSortVisualizer = () => {
  const [masterArray, setMasterArray] = useState(generateRandomArray());
  const [currentDisplayArray, setCurrentDisplayArray] = useState([...masterArray]);
  const [sortHistory, setSortHistory] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSorting, setIsSorting] = useState(false);
  const [isSorted, setIsSorted] = useState(false);
  const [highlights, setHighlights] = useState({});
  const [statusText, setStatusText] = useState('Press Start Sort');

  const initializeSort = useCallback(() => {
    const newArray = generateRandomArray();
    setMasterArray(newArray);
    setCurrentDisplayArray([...newArray]);
    const history = getHeapSortHistory([...newArray]);
    setSortHistory(history);
    setCurrentStepIndex(0);
    setIsSorted(false);
    setIsSorting(false);
    if (history.length > 0) {
      setCurrentDisplayArray(history[0].arrayState);
      setHighlights(history[0].highlights || {});
      setStatusText(history[0].status || 'Ready');
    }
  }, []);

  useEffect(() => {
    initializeSort();
  }, [initializeSort]);

  const stepForward = useCallback(() => {
    if (currentStepIndex >= sortHistory.length - 1) {
      setIsSorted(true);
      setIsSorting(false);
      setHighlights({ sorted: true, heapSize: 0 });
      setStatusText('Array sorted!');
      if(sortHistory.length > 0) setCurrentDisplayArray(sortHistory[sortHistory.length - 1].arrayState);
      return;
    }
    const nextStep = currentStepIndex + 1;
    setCurrentStepIndex(nextStep);
    setCurrentDisplayArray(sortHistory[nextStep].arrayState);
    setHighlights(sortHistory[nextStep].highlights || {});
    setStatusText(sortHistory[nextStep].status || '');
  }, [currentStepIndex, sortHistory]);

  useEffect(() => {
    if (isSorting && !isSorted) {
      const timer = setTimeout(stepForward, DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [isSorting, isSorted, stepForward]);

  const startSort = () => {
    if (isSorted) initializeSort();
    setIsSorting(true);
    if (currentStepIndex === 0 && sortHistory.length > 0) {
        setCurrentDisplayArray(sortHistory[0].arrayState);
        setHighlights(sortHistory[0].highlights || {});
        setStatusText(sortHistory[0].status || 'Sorting...');
    }
  };

  const stopSort = () => setIsSorting(false);

  return (
    <div className="heap-sort-visualizer">
      <div className="controls">
        <button onClick={initializeSort} disabled={isSorting}>Reset Array</button>
        <button onClick={startSort} disabled={isSorting || isSorted}>Start Sort</button>
        <button onClick={stopSort} disabled={!isSorting || isSorted}>Pause Sort</button>
        <button onClick={stepForward} disabled={isSorting || isSorted}>Next Step</button>
      </div>
      <div className="status-text">{statusText}</div>
      <div className="array-container">
        {currentDisplayArray.map((value, idx) => {
          let barClass = 'array-bar';
          const currentHeapSize = highlights.heapSize;

          if (highlights.sorted) barClass += ' sorted';
          else if (highlights.extracted === idx) barClass += ' extracted-max'; // Element just moved to sorted position
          else if (idx >= currentHeapSize && currentHeapSize !== undefined && !highlights.sorted) barClass += ' sorted-portion'; // Already sorted part
          
          if (idx < currentHeapSize) { // Element is in the current heap
            if (highlights.heapBuilt && !highlights.extractingMax && !highlights.swappingWithLast && !highlights.currentRoot) barClass += ' in-heap';
            if (highlights.currentRoot === idx) barClass += ' heap-root-active';
            if (highlights.comparing && highlights.comparing.includes(idx)) barClass += ' comparing';
            if (highlights.comparingWith === idx) barClass += ' comparing-with';
            if (highlights.swapping && highlights.swapping.includes(idx)) barClass += ' swapping';
            if (highlights.swapped && highlights.swapped.includes(idx)) barClass += ' swapped-done';
            if (highlights.extractingMax === idx) barClass += ' extracting-max-source';
            if (highlights.swappingWithLast === idx) barClass += ' swapping-with-last-target';
          }
          
          return (
            <div className={barClass} key={idx} style={{ height: `${value * 3}px` }}>
              <span className="bar-value">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HeapSortVisualizer;
