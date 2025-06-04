import React, { useState, useEffect, useCallback } from 'react';
import './LinearSearchVisualizer.css'; // To be created

const ARRAY_SIZE = 15;
const MIN_VAL = 1;
const MAX_VAL = 100;
const DELAY_MS = 150;

function generateRandomArray() {
  const arr = [];
  for (let i = 0; i < ARRAY_SIZE; i++) {
    arr.push(Math.floor(Math.random() * (MAX_VAL - MIN_VAL + 1)) + MIN_VAL);
  }
  return arr;
}

function getRandomTarget(array) {
  // 70% chance to pick an existing element, 30% chance for a non-existing one
  if (array.length === 0) return Math.floor(Math.random() * (MAX_VAL - MIN_VAL + 1)) + MIN_VAL;
  if (Math.random() < 0.7) {
    return array[Math.floor(Math.random() * array.length)];
  } else {
    let randomVal;
    do {
      randomVal = Math.floor(Math.random() * (MAX_VAL - MIN_VAL + 1)) + MIN_VAL;
    } while (array.includes(randomVal));
    return randomVal;
  }
}

function getLinearSearchHistory(array, target) {
  const history = [];

  function recordState(highlights, statusText) {
    history.push({ arrayState: [...array], highlights, status: statusText, target });
  }

  recordState({}, `Starting search for target: ${target}`);

  let found = false;
  for (let i = 0; i < array.length; i++) {
    recordState({ currentIndex: i, comparing: true }, `Comparing ${array[i]} with target ${target}`);
    if (array[i] === target) {
      recordState({ currentIndex: i, foundAtIndex: i }, `Target ${target} found at index ${i}!`);
      found = true;
      break;
    }
    recordState({ currentIndex: i, notMatch: true }, `${array[i]} is not the target.`);
  }

  if (!found) {
    recordState({ notFound: true }, `Target ${target} not found in the array.`);
  }
  recordState({ searchComplete: true, found }, `Search complete. Target ${found ? 'found' : 'not found'}.`);
  return history;
}

const LinearSearchVisualizer = () => {
  const [masterArray, setMasterArray] = useState(generateRandomArray());
  const [targetValue, setTargetValue] = useState(getRandomTarget(masterArray));
  const [currentDisplayArray, setCurrentDisplayArray] = useState([...masterArray]);
  const [sortHistory, setSortHistory] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchConcluded, setSearchConcluded] = useState(false);
  const [highlights, setHighlights] = useState({});
  const [statusText, setStatusText] = useState('Press Start Search');

  const initializeSearch = useCallback(() => {
    const newArray = generateRandomArray();
    const newTarget = getRandomTarget(newArray);
    setMasterArray(newArray);
    setTargetValue(newTarget);
    setCurrentDisplayArray([...newArray]);
    const history = getLinearSearchHistory([...newArray], newTarget);
    setSortHistory(history);
    setCurrentStepIndex(0);
    setSearchConcluded(false);
    setIsSearching(false);
    if (history.length > 0) {
      setHighlights(history[0].highlights || {});
      setStatusText(history[0].status || 'Ready');
    }
  }, []);

  useEffect(() => {
    initializeSearch();
  }, [initializeSearch]);

  const stepForward = useCallback(() => {
    if (currentStepIndex >= sortHistory.length - 1) {
      setSearchConcluded(true);
      setIsSearching(false);
      const lastStep = sortHistory[sortHistory.length - 1];
      setHighlights(lastStep.highlights || {});
      setStatusText(lastStep.status || 'Search complete.');
      return;
    }
    const nextStep = currentStepIndex + 1;
    setCurrentStepIndex(nextStep);
    setHighlights(sortHistory[nextStep].highlights || {});
    setStatusText(sortHistory[nextStep].status || '');
  }, [currentStepIndex, sortHistory]);

  useEffect(() => {
    if (isSearching && !searchConcluded) {
      const timer = setTimeout(stepForward, DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [isSearching, searchConcluded, stepForward]);

  const startSearch = () => {
    if (searchConcluded) initializeSearch();
    setIsSearching(true);
    if (currentStepIndex === 0 && sortHistory.length > 0) {
        setHighlights(sortHistory[0].highlights || {});
        setStatusText(sortHistory[0].status || 'Searching...');
    }
  };

  const stopSearch = () => setIsSearching(false);

  return (
    <div className="linear-search-visualizer">
      <div className="controls">
        <button onClick={initializeSearch} disabled={isSearching}>Reset Array & Target</button>
        <button onClick={startSearch} disabled={isSearching || searchConcluded}>Start Search</button>
        <button onClick={stopSearch} disabled={!isSearching || searchConcluded}>Pause Search</button>
        <button onClick={stepForward} disabled={isSearching || searchConcluded}>Next Step</button>
      </div>
      <div className="search-info">
        Searching for: <span className="target-value">{targetValue}</span>
      </div>
      <div className="status-text">{statusText}</div>
      <div className="array-container">
        {currentDisplayArray.map((value, idx) => {
          let barClass = 'array-bar';
          if (highlights.searchComplete) {
            if (highlights.found && highlights.foundAtIndex === idx) barClass += ' found';
            else if (highlights.found) barClass += ' not-relevant'; // Dim others if found
            else barClass += ' not-found-final'; // All dim if not found
          } else {
            if (highlights.currentIndex === idx && highlights.comparing) barClass += ' comparing';
            if (highlights.foundAtIndex === idx) barClass += ' found';
            else if (highlights.currentIndex === idx && highlights.notMatch) barClass += ' not-match';
            else if (highlights.currentIndex > idx && !highlights.foundAtIndex) barClass += ' scanned';
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

export default LinearSearchVisualizer;
