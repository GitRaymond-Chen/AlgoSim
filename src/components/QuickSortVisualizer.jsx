import React, { useState, useEffect, useCallback } from 'react';
import './QuickSortVisualizer.css'; // To be created

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

function getQuickSortHistory(initialArray) {
  const history = [];
  let array = [...initialArray];

  function recordState(highlights, statusText) {
    history.push({ arrayState: [...array], highlights, status: statusText });
  }

  function partition(low, high) {
    const pivotValue = array[high];
    let i = low - 1; // Index of smaller element

    recordState({ low, high, pivotIndex: high, i: i, status: `Partitioning [${low}-${high}]. Pivot: ${pivotValue} (at index ${high})` });

    for (let j = low; j < high; j++) {
      recordState({ low, high, pivotIndex: high, i: i, j: j, comparing: [j, high], status: `Comparing ${array[j]} with pivot ${pivotValue}` });
      if (array[j] < pivotValue) {
        i++;
        [array[i], array[j]] = [array[j], array[i]];
        recordState({ low, high, pivotIndex: high, i: i, j: j, swapped: [i, j], status: `Swapped ${array[i]} and ${array[j]}` });
      } else {
        recordState({ low, high, pivotIndex: high, i: i, j: j, notSwapped: j, status: `${array[j]} > pivot ${pivotValue}, no swap` });
      }
    }
    // Swap pivot to its correct position
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    const finalPivotIndex = i + 1;
    recordState({ low, high, pivotIndex: finalPivotIndex, pivotPlaced: finalPivotIndex, status: `Pivot ${pivotValue} placed at index ${finalPivotIndex}` });
    return finalPivotIndex;
  }

  function sortRecursive(low, high) {
    if (low < high) {
      recordState({ range: [low, high], status: `Sorting subarray [${low}-${high}]` });
      const pi = partition(low, high);
      recordState({ range: [low, high], pivotFinalIndex: pi, status: `Pivot ${array[pi]} is in final position. Recursively sort left and right.` });
      sortRecursive(low, pi - 1);
      sortRecursive(pi + 1, high);
    }
     else if (low === high) {
      // Single element is considered sorted in its place for visualization
      recordState({ range: [low, high], pivotFinalIndex: low, status: `Element ${array[low]} at [${low}] is sorted in its partition.` });
    }
  }

  recordState({ status: 'Initial array' });
  sortRecursive(0, array.length - 1);
  recordState({ sorted: true, status: 'Array sorted' });
  return history;
}

const QuickSortVisualizer = () => {
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
    const history = getQuickSortHistory([...newArray]);
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
      setHighlights({ sorted: true });
      setStatusText('Array sorted!');
      if (sortHistory.length > 0) setCurrentDisplayArray(sortHistory[sortHistory.length - 1].arrayState);
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
    <div className="quick-sort-visualizer">
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
          if (highlights.sorted) barClass += ' sorted';
          else if (highlights.pivotFinalIndex === idx) barClass += ' pivot-final-pos';
          else if (highlights.pivotPlaced === idx) barClass += ' pivot-placed'; // Moment pivot is placed
          
          if (highlights.range && idx >= highlights.range[0] && idx <= highlights.range[1]) {
            barClass += ' active-partition';
          }
          if (highlights.pivotIndex === idx) barClass += ' pivot';
          if (highlights.comparing && (idx === highlights.comparing[0] || idx === highlights.comparing[1])) barClass += ' comparing';
          if (highlights.swapped && (idx === highlights.swapped[0] || idx === highlights.swapped[1])) barClass += ' swapped';
          if (highlights.i === idx) barClass += ' i-pointer';
          if (highlights.j === idx) barClass += ' j-pointer';
          
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

export default QuickSortVisualizer;
