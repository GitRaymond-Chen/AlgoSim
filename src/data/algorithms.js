const algorithms = {
  sorting: [
    {
      id: "bubble",
      name: "Bubble Sort",
      concept: "Repeatedly swaps adjacent elements if out of order.",
      complexity: "O(n^2) time (worst/average), O(1) space.",
      useCase: "Rarely used practically, but tests basic understanding."
    },
    {
      id: "selection",
      name: "Selection Sort",
      concept: "Selects the smallest element and swaps it into place.",
      complexity: "O(n^2) time, O(1) space.",
      useCase: "Simple but inefficient; useful for small datasets."
    },
    {
      id: "insertion",
      name: "Insertion Sort",
      concept: "Builds a sorted array by inserting elements one at a time.",
      complexity: "O(n^2) time (worst/average), O(1) space. Best-case O(n) for nearly sorted data.",
      useCase: "Efficient for small/partially sorted data (e.g., sort() in Python uses Timsort, which leverages insertion sort)."
    },
    {
      id: "merge",
      name: "Merge Sort",
      concept: "Divides the array, sorts subarrays recursively, then merges them.",
      complexity: "O(nlogn) time, O(n) space (stable).",
      useCase: "External sorting (large datasets), stable sorting, divide-and-conquer practice."
    },
    {
      id: "quick",
      name: "Quick Sort",
      concept: "Partitions the array around a pivot and recursively sorts subarrays.",
      complexity: "O(nlogn) average time, O(n^2) worst-case (rare with good pivot selection), O(logn) space (in-place).",
      useCase: "Default in many languages (e.g., C++ std::sort), highly optimized in practice."
    },
    {
      id: "heap",
      name: "Heap Sort",
      concept: "Uses a max-heap to extract the largest element repeatedly.",
      complexity: "O(nlogn) time, O(1) space.",
      useCase: "In-place sorting with guaranteed O(nlogn) time."
    },
    {
      id: "counting",
      name: "Counting Sort",
      concept: "Counts occurrences of each element for integer sorting.",
      complexity: "O(n+k) time, O(k) space (k = range of values).",
      useCase: "Small integer ranges (e.g., sorting characters)."
    },
    {
      id: "radix",
      name: "Radix Sort",
      concept: "Sorts integers digit-by-digit (LSD or MSD).",
      complexity: "O(d(n+k)) time (d = digits, k = base), O(n+k) space.",
      useCase: "Large integers or strings (e.g., phone numbers)."
    }
  ],
  searching: [
    {
      id: "linear",
      name: "Linear Search",
      concept: "Scans every element sequentially.",
      complexity: "O(n) time, O(1) space.",
      useCase: "Unsorted data."
    },
    {
      id: "binary",
      name: "Binary Search",
      concept: "Repeatedly halves a sorted array to find the target.",
      complexity: "O(logn) time, O(1) space (iterative).",
      useCase: "Efficient searching in sorted arrays (common interview staple)."
    }
  ],
  graph: [
    {
      id: "dfs",
      name: "Depth-First Search (DFS)",
      concept: "Explores as far as possible along a branch before backtracking.",
      complexity: "O(V+E) time (V = vertices, E = edges), O(V) space (recursion stack).",
      useCase: "Pathfinding, cycle detection, tree traversals (in-order/pre-order/post-order)."
    },
    {
      id: "bfs",
      name: "Breadth-First Search (BFS)",
      concept: "Explores neighbors level-by-level using a queue.",
      complexity: "O(V+E) time, O(V) space.",
      useCase: "Shortest path in unweighted graphs, level-order tree traversal."
    }
  ]
};

export default algorithms;
