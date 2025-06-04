import React, { useState, useEffect, useCallback } from 'react';
import './CountingSortVisualizer.css'; // To be created

const ARRAY_SIZE = 15;
const MIN_VAL = 0; // Counting sort works best with non-negative integers
const MAX_VAL = 20; // Keep range small for manageable count array visualization
const DELAY_MS = 300;

function generateRandomArray() {
  const arr = [];
  for (let i = 0; i < ARRAY_SIZE; i++) {
    arr.push(Math.floor(Math.random() * (MAX_VAL - MIN_VAL + 1)) + MIN_VAL);
  }
  return arr;
}

function getCountingSortHistory(initialArray) {
  const history = [];
  let array = [...initialArray];
  let outputArray = new Array(array.length).fill(null);

  function recordState(highlights, statusText, currentCountArray = null, currentOutputArray = null) {
    history.push({
      arrayState: [...array],
      countArrayState: currentCountArray ? [...currentCountArray] : null,
      outputArrayState: currentOutputArray ? [...currentOutputArray] : null,
      highlights,
      status: statusText,
    });
  }

  if (array.length === 0) {
    recordState({}, 'Array is empty, already sorted.');
    return history;
  }

  let max = Math.max(...array);
  let countArray = new Array(max + 1).fill(0);

  recordState({ maxVal: max }, `Initial array. Max value is ${max}. Count array initialized.`, countArray, outputArray);

  // Store count of each character
  for (let i = 0; i < array.length; i++) {
    countArray[array[i]]++;
    recordState({ countingElement: array[i], countArrayIndex: array[i], inputIndex: i }, `Counting element ${array[i]} from input. countArray[${array[i]}] is now ${countArray[array[i]]}.`, countArray, outputArray);
  }
  recordState({}, 'Finished counting elements.', countArray, outputArray);

  // Change countArray[i] so that countArray[i] now contains actual
  // position of this character in output array
  for (let i = 1; i <= max; i++) {
    countArray[i] += countArray[i - 1];
    recordState({ cumulatingIndex: i }, `Updating count array for cumulative sums. countArray[${i}] is now ${countArray[i]}.`, countArray, outputArray);
  }
  recordState({}, 'Finished creating cumulative count array.', countArray, outputArray);

  // Build the output character array
  for (let i = array.length - 1; i >= 0; i--) {
    const value = array[i];
    const outputIndex = countArray[value] - 1;
    outputArray[outputIndex] = value;
    recordState({ placingElement: value, inputIndexScan: i, outputArrayIndex: outputIndex, countArrayIndexUpdate: value }, `Placing ${value} from input at output index ${outputIndex}.`, countArray, outputArray);
    countArray[value]--;
    recordState({ placedElement: value, outputArrayIndexPlaced: outputIndex, countArrayIndexUpdated: value }, `Placed ${value}. Decremented countArray[${value}] to ${countArray[value]}.`, countArray, outputArray);
  }
  recordState({ sorted: true }, 'Array sorted.', countArray, outputArray);
  array = [...outputArray]; // For final display consistency if needed
  return history;
}

const CountingSortVisualizer = () => {
  const [masterArray, setMasterArray] = useState(generateRandomArray());
  const [currentDisplayArray, setCurrentDisplayArray] = useState([...masterArray]);
  const [currentCountArray, setCurrentCountArray] = useState(null);
  const [currentOutputArray, setCurrentOutputArray] = useState(null);
  const [sortHistory, setSortHistory] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSorting, setIsSorting] = useState(false);
  const [isSorted, setIsSorted] = useState(false);
  const [highlights, setHighlights] = useState({});
  const [statusText, setStatusText] = useState('Press Start Sort');

  const initializeSort = useCallback(() => {
    const newArray = generateRandomArray();
    setMasterArray(newArray);
    const history = getCountingSortHistory([...newArray]);
    setSortHistory(history);
    setCurrentStepIndex(0);
    setIsSorted(false);
    setIsSorting(false);
    if (history.length > 0) {
      setCurrentDisplayArray(history[0].arrayState);
      setCurrentCountArray(history[0].countArrayState);
      setCurrentOutputArray(history[0].outputArrayState);
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
      const lastState = sortHistory[sortHistory.length - 1];
      setHighlights({ sorted: true });
      setStatusText('Array sorted!');
      setCurrentDisplayArray(lastState.outputArrayState); // Final sorted array is in output
      setCurrentCountArray(lastState.countArrayState);
      setCurrentOutputArray(lastState.outputArrayState);
      return;
    }
    const nextStepIdx = currentStepIndex + 1;
    setCurrentStepIndex(nextStepIdx);
    const nextStepData = sortHistory[nextStepIdx];
    setCurrentDisplayArray(nextStepData.arrayState);
    setCurrentCountArray(nextStepData.countArrayState);
    setCurrentOutputArray(nextStepData.outputArrayState);
    setHighlights(nextStepData.highlights || {});
    setStatusText(nextStepData.status || '');
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
        const firstStep = sortHistory[0];
        setCurrentDisplayArray(firstStep.arrayState);
        setCurrentCountArray(firstStep.countArrayState);
        setCurrentOutputArray(firstStep.outputArrayState);
        setHighlights(firstStep.highlights || {});
        setStatusText(firstStep.status || 'Sorting...');
    }
  };

  const stopSort = () => setIsSorting(false);

  return (
    <div className="counting-sort-visualizer">
      <div className="controls">
        <button onClick={initializeSort} disabled={isSorting}>Reset Array</button>
        <button onClick={startSort} disabled={isSorting || isSorted}>Start Sort</button>
        <button onClick={stopSort} disabled={!isSorting || isSorted}>Pause Sort</button>
        <button onClick={stepForward} disabled={isSorting || isSorted}>Next Step</button>
      </div>
      <div className="status-text">{statusText}</div>
      
      <div className="data-arrays-container">
        <div className="array-display-section">
          <h4>Input Array</h4>
          <div className="array-container input-array">
            {masterArray.map((value, idx) => (
              <div 
                className={`array-bar ${highlights.inputIndex === idx ? 'active-input' : ''} ${highlights.inputIndexScan === idx ? 'active-scan' : ''}`}
                key={`input-${idx}`}
                style={{ height: `${value * 8 + 20}px` }} // Scale for smaller value range
              >
                <span className="bar-value">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {currentCountArray && (
          <div className="array-display-section">
            <h4>Count Array (Value: Count/Position)</h4>
            <div className="count-array-container">
              {currentCountArray.map((count, val) => (
                <div 
                  className={`count-cell ${highlights.countArrayIndex === val ? 'active-count' : ''} ${highlights.cumulatingIndex === val ? 'active-cumulate' : ''} ${highlights.countArrayIndexUpdate === val ? 'active-update' : ''} ${highlights.countArrayIndexUpdated === val ? 'active-updated-final' : ''}`}
                  key={`count-${val}`}
                >
                  <span className="count-index">{val}</span>
                  <span className="count-value">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentOutputArray && (
          <div className="array-display-section">
            <h4>Output Array (Sorted)</h4>
            <div className="array-container output-array">
              {currentOutputArray.map((value, idx) => (
                <div 
                  className={`array-bar ${highlights.outputArrayIndex === idx ? 'active-output-target' : ''} ${highlights.outputArrayIndexPlaced === idx ? 'active-output-placed' : ''} ${highlights.sorted ? 'sorted' : ''}`}
                  key={`output-${idx}`}
                  style={{ height: value !== null ? `${value * 8 + 20}px` : '20px', backgroundColor: value === null ? '#eee' : undefined }}
                >
                  {value !== null && <span className="bar-value">{value}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountingSortVisualizer;
