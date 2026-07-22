const PROBLEMS_DATA = [
  {
    id: 1,
    name: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",
    description: "Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to target</em>. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    example: "Input: nums = [2,7,11,15], target = 9 → Output: [0,1] because nums[0] + nums[1] == 9.",
    companies: ["Google", "Amazon", "Apple", "Microsoft", "Facebook", "Adobe"],
    platforms: [
      { name: "LeetCode", logo: "leetcode", url: "https://leetcode.com/problems/two-sum/", color: "#FFA116" },
      { name: "HackerRank", logo: "hackerrank", url: "https://www.hackerrank.com/challenges/ctci-icpc-team/problem", color: "#2EC866" },
      { name: "GeeksforGeeks", logo: "gfg", url: "https://www.geeksforgeeks.org/given-an-array-a-and-a-number-x-check-for-pair-in-a-with-sum-as-x/", color: "#2F8D46" }
    ],
    tags: ["Array", "Hash Table"],
    approaches: [
      {
        title: "Brute Force — O(n²) Time, O(1) Space",
        steps: [
          "Iterate through each element using two nested loops.",
          "For each pair (i, j) where i < j, check if nums[i] + nums[j] == target.",
          "If found, return [i, j]."
        ]
      },
      {
        title: "Hash Map — O(n) Time, O(n) Space",
        steps: [
          "Create an empty hash map to store {value: index}.",
          "For each element nums[i], compute complement = target - nums[i].",
          "Check if complement exists in the hash map.",
          "If yes, return [map[complement], i]. Otherwise store nums[i] → i in the map.",
          "This gives a single-pass O(n) solution."
        ]
      }
    ],
    edgeCases: [
      "Only one valid answer exists (guaranteed by the problem).",
      "The same element cannot be used twice — ensure indices are different.",
      "Negative numbers in the array must be handled correctly.",
      "Array with only two elements: the answer is always [0, 1].",
      "Target is 0 — look for two negatives that cancel or two zeros."
    ]
  },
  {
    id: 2,
    name: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    difficulty: "Medium",
    description: "Given a string <code>s</code>, find the length of the <em>longest substring without repeating characters</em>. A substring is a contiguous sequence of characters within a string.",
    example: "Input: s = 'abcabcbb' → Output: 3 (The answer is 'abc' with length 3).",
    companies: ["Amazon", "Microsoft", "Google", "Bloomberg", "Goldman Sachs", "Uber"],
    platforms: [
      { name: "LeetCode", logo: "leetcode", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", color: "#FFA116" },
      { name: "GeeksforGeeks", logo: "gfg", url: "https://www.geeksforgeeks.org/length-of-the-longest-substring-without-repeating-characters/", color: "#2F8D46" }
    ],
    tags: ["Hash Table", "String", "Sliding Window"],
    approaches: [
      {
        title: "Brute Force — O(n³) Time, O(min(n,m)) Space",
        steps: [
          "Generate all possible substrings.",
          "For each substring, check if all characters are unique.",
          "Track the maximum length seen so far."
        ]
      },
      {
        title: "Sliding Window with Hash Set — O(n) Time, O(min(n,m)) Space",
        steps: [
          "Use two pointers: left and right, both starting at 0.",
          "Use a hash set to track characters in the current window.",
          "Expand right pointer, adding chars to the set.",
          "When a duplicate is found, shrink window from the left until duplicate is removed.",
          "At each step, update max length as right - left + 1."
        ]
      },
      {
        title: "Optimized Sliding Window with Hash Map — O(n) Time",
        steps: [
          "Store the last seen index of each character in a hash map.",
          "When a repeat is found, jump the left pointer to max(left, map[char] + 1).",
          "This avoids re-scanning already processed characters."
        ]
      }
    ],
    edgeCases: [
      "Empty string → return 0.",
      "String with all identical characters → return 1.",
      "String with all unique characters → return len(s).",
      "Single character string → return 1.",
      "Strings containing spaces and special characters must be handled."
    ]
  },
  {
    id: 3,
    name: "Merge Intervals",
    slug: "merge-intervals",
    difficulty: "Medium",
    description: "Given an array of intervals where <code>intervals[i] = [start_i, end_i]</code>, merge all overlapping intervals, and return <em>an array of the non-overlapping intervals</em> that cover all the intervals in the input.",
    example: "Input: intervals = [[1,3],[2,6],[8,10],[15,18]] → Output: [[1,6],[8,10],[15,18]].",
    companies: ["Facebook", "Google", "Amazon", "LinkedIn", "Microsoft", "Twitter"],
    platforms: [
      { name: "LeetCode", logo: "leetcode", url: "https://leetcode.com/problems/merge-intervals/", color: "#FFA116" },
      { name: "GeeksforGeeks", logo: "gfg", url: "https://www.geeksforgeeks.org/merging-intervals/", color: "#2F8D46" }
    ],
    tags: ["Array", "Sorting"],
    approaches: [
      {
        title: "Sort and Merge — O(n log n) Time, O(n) Space",
        steps: [
          "Sort all intervals by their start time.",
          "Initialize a result list with the first interval.",
          "For each subsequent interval, compare its start with the end of the last merged interval.",
          "If they overlap (start <= last end), merge by updating the end to max of both ends.",
          "Otherwise, push the current interval into results as a new entry."
        ]
      }
    ],
    edgeCases: [
      "Single interval in input → return it as is.",
      "All intervals overlap → return one single merged interval.",
      "No intervals overlap → return the original sorted array.",
      "Intervals with the same start and end point.",
      "Unsorted input — always sort first.",
      "Intervals where one completely contains another (e.g., [1,10] and [2,5])."
    ]
  },
  {
    id: 4,
    name: "Coin Change",
    slug: "coin-change",
    difficulty: "Medium",
    description: "You are given an integer array <code>coins</code> representing coins of different denominations and an integer <code>amount</code> representing a total amount of money. Return <em>the fewest number of coins that you need to make up that amount</em>. If that amount of money cannot be made up by any combination of the coins, return <code>-1</code>.",
    example: "Input: coins = [1,5,6,9], amount = 11 → Output: 2 (coins 5 + 6).",
    companies: ["Amazon", "Google", "Goldman Sachs", "Morgan Stanley", "Apple", "Uber"],
    platforms: [
      { name: "LeetCode", logo: "leetcode", url: "https://leetcode.com/problems/coin-change/", color: "#FFA116" },
      { name: "HackerRank", logo: "hackerrank", url: "https://www.hackerrank.com/challenges/coin-change/problem", color: "#2EC866" },
      { name: "GeeksforGeeks", logo: "gfg", url: "https://www.geeksforgeeks.org/find-minimum-number-of-coins-that-make-a-change/", color: "#2F8D46" }
    ],
    tags: ["Array", "Dynamic Programming", "BFS"],
    approaches: [
      {
        title: "Recursion with Memoization — O(S×n) Time",
        steps: [
          "Use a recursive function that tries each coin denomination.",
          "Store results in a memo array to avoid recomputation.",
          "Base case: amount == 0 returns 0; amount < 0 returns -1."
        ]
      },
      {
        title: "Bottom-Up Dynamic Programming — O(S×n) Time, O(S) Space",
        steps: [
          "Create a dp array of size amount+1, initialized to Infinity.",
          "Set dp[0] = 0 (base case: 0 coins needed for amount 0).",
          "For each amount from 1 to target, try every coin.",
          "dp[i] = min(dp[i], dp[i - coin] + 1) if i - coin >= 0.",
          "Return dp[amount] if it's not Infinity, else return -1."
        ]
      }
    ],
    edgeCases: [
      "Amount is 0 → return 0.",
      "No combination of coins can form the amount → return -1.",
      "Coins array contains denomination equal to amount → return 1.",
      "Very large amount with small denominations — check performance.",
      "Duplicate coin denominations in input array."
    ]
  },
  {
    id: 5,
    name: "LRU Cache",
    slug: "lru-cache",
    difficulty: "Medium",
    description: "Design a data structure that follows the constraints of a <em>Least Recently Used (LRU) cache</em>. Implement the <code>LRUCache</code> class with <code>get(key)</code> and <code>put(key, value)</code> operations, both running in <strong>O(1)</strong> average time complexity.",
    example: "LRUCache(2) → put(1,1), put(2,2), get(1)→1, put(3,3), get(2)→-1 (evicted).",
    companies: ["Amazon", "Google", "Microsoft", "Facebook", "Nvidia", "Snapchat"],
    platforms: [
      { name: "LeetCode", logo: "leetcode", url: "https://leetcode.com/problems/lru-cache/", color: "#FFA116" },
      { name: "GeeksforGeeks", logo: "gfg", url: "https://www.geeksforgeeks.org/lru-cache-implementation/", color: "#2F8D46" }
    ],
    tags: ["Hash Table", "Linked List", "Design"],
    approaches: [
      {
        title: "HashMap + Doubly Linked List — O(1) Time",
        steps: [
          "Use a doubly linked list to track order: most recently used at head, LRU at tail.",
          "Use a hash map: key → node in the linked list.",
          "On get: move the accessed node to the head. Return -1 if not found.",
          "On put: if key exists, update value and move to head. If new, add at head.",
          "If capacity exceeded, remove the tail node (LRU) and delete its key from the map."
        ]
      },
      {
        title: "Using OrderedDict (Python) — O(1) Time",
        steps: [
          "Python's collections.OrderedDict maintains insertion order.",
          "On get: move_to_end(key) to mark as recently used.",
          "On put: add key, then move_to_end(key). If over capacity, popitem(last=False) removes LRU."
        ]
      }
    ],
    edgeCases: [
      "get on a key that doesn't exist → return -1.",
      "put when capacity is 1 → every new put evicts the previous entry.",
      "Putting an existing key should update the value and refresh its recency.",
      "Capacity of 0 — handle gracefully.",
      "Thread-safety is not required unless specified."
    ]
  },
  {
    id: 6,
    name: "Number of Islands",
    slug: "number-of-islands",
    difficulty: "Medium",
    description: "Given an <code>m x n</code> 2D binary grid which represents a map of <code>'1'</code>s (land) and <code>'0'</code>s (water), return <em>the number of islands</em>. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
    example: "Input: grid = [['1','1','0'],['1','1','0'],['0','0','1']] → Output: 2.",
    companies: ["Amazon", "Google", "Facebook", "Microsoft", "Bloomberg", "Salesforce"],
    platforms: [
      { name: "LeetCode", logo: "leetcode", url: "https://leetcode.com/problems/number-of-islands/", color: "#FFA116" },
      { name: "GeeksforGeeks", logo: "gfg", url: "https://www.geeksforgeeks.org/find-the-number-of-islands-using-dfs/", color: "#2F8D46" }
    ],
    tags: ["Array", "DFS", "BFS", "Matrix", "Union Find"],
    approaches: [
      {
        title: "DFS — O(m×n) Time, O(m×n) Space",
        steps: [
          "Traverse the grid cell by cell.",
          "When a '1' is found, increment island count and start DFS.",
          "DFS marks all connected '1's as visited (set to '0' or use a visited array).",
          "DFS explores all 4 directions: up, down, left, right.",
          "Continue traversal after DFS returns."
        ]
      },
      {
        title: "BFS — O(m×n) Time, O(min(m,n)) Space",
        steps: [
          "Similar to DFS but use a queue instead of recursive calls.",
          "For each unvisited '1', enqueue it and mark visited.",
          "Process queue: for each cell, enqueue all adjacent unvisited '1's."
        ]
      }
    ],
    edgeCases: [
      "Empty grid → return 0.",
      "All water ('0') → return 0.",
      "All land ('1') → return 1 (one big island).",
      "Grid with a single cell — could be 0 or 1.",
      "Diagonal connections do NOT count (only horizontal/vertical)."
    ]
  },
  {
    id: 7,
    name: "Trapping Rain Water",
    slug: "trapping-rain-water",
    difficulty: "Hard",
    description: "Given <code>n</code> non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    example: "Input: height = [0,1,0,2,1,0,1,3,2,1,2,1] → Output: 6.",
    companies: ["Amazon", "Google", "Microsoft", "Goldman Sachs", "Apple", "Uber"],
    platforms: [
      { name: "LeetCode", logo: "leetcode", url: "https://leetcode.com/problems/trapping-rain-water/", color: "#FFA116" },
      { name: "GeeksforGeeks", logo: "gfg", url: "https://www.geeksforgeeks.org/trapping-rain-water/", color: "#2F8D46" }
    ],
    tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack", "Monotonic Stack"],
    approaches: [
      {
        title: "Precompute Max Arrays — O(n) Time, O(n) Space",
        steps: [
          "Precompute left_max[i]: maximum height from index 0 to i.",
          "Precompute right_max[i]: maximum height from index i to n-1.",
          "Water at index i = min(left_max[i], right_max[i]) - height[i].",
          "Sum up water across all indices."
        ]
      },
      {
        title: "Two Pointer — O(n) Time, O(1) Space (Optimal)",
        steps: [
          "Use left and right pointers starting at both ends.",
          "Track left_max and right_max as you go.",
          "If height[left] < height[right]: water at left = left_max - height[left]; move left right.",
          "Else: water at right = right_max - height[right]; move right left.",
          "Continue until pointers meet."
        ]
      }
    ],
    edgeCases: [
      "Array of length < 3 → no water can be trapped, return 0.",
      "Monotonically increasing or decreasing array → return 0.",
      "All bars at the same height → return 0.",
      "Array with a single pit in the middle — classic trap case.",
      "Heights with zeros in between tall bars."
    ]
  },
  {
    id: 8,
    name: "Maximum Subarray",
    slug: "maximum-subarray",
    difficulty: "Easy",
    description: "Given an integer array <code>nums</code>, find the contiguous subarray (containing at least one number) which has the <em>largest sum</em> and return its sum. This is the classic Kadane's Algorithm problem.",
    example: "Input: nums = [-2,1,-3,4,-1,2,1,-5,4] → Output: 6 (subarray [4,-1,2,1]).",
    companies: ["Amazon", "Apple", "Google", "LinkedIn", "Microsoft"],
    platforms: [
      { name: "LeetCode", logo: "leetcode", url: "https://leetcode.com/problems/maximum-subarray/", color: "#FFA116" },
      { name: "HackerRank", logo: "hackerrank", url: "https://www.hackerrank.com/challenges/maxsubarray/problem", color: "#2EC866" },
      { name: "GeeksforGeeks", logo: "gfg", url: "https://www.geeksforgeeks.org/largest-sum-contiguous-subarray/", color: "#2F8D46" }
    ],
    tags: ["Array", "Divide and Conquer", "Dynamic Programming"],
    approaches: [
      {
        title: "Brute Force — O(n²) Time",
        steps: [
          "Try all possible subarrays using two nested loops.",
          "Track the maximum sum found across all subarrays."
        ]
      },
      {
        title: "Kadane's Algorithm — O(n) Time, O(1) Space (Optimal)",
        steps: [
          "Initialize current_sum = nums[0] and max_sum = nums[0].",
          "For each element from index 1 onward:",
          "current_sum = max(nums[i], current_sum + nums[i]).",
          "max_sum = max(max_sum, current_sum).",
          "Return max_sum."
        ]
      }
    ],
    edgeCases: [
      "All negative numbers → return the largest (least negative) element.",
      "Single element array → return that element.",
      "Array with all zeros → return 0.",
      "Array with one positive surrounded by negatives.",
      "Large arrays — ensure no integer overflow."
    ]
  },
  {
    id: 9,
    name: "Word Break",
    slug: "word-break",
    difficulty: "Medium",
    description: "Given a string <code>s</code> and a dictionary of strings <code>wordDict</code>, return <em>true if <code>s</code> can be segmented into a space-separated sequence of one or more dictionary words</em>.",
    example: "Input: s = 'leetcode', wordDict = ['leet','code'] → Output: true.",
    companies: ["Google", "Facebook", "Amazon", "Bloomberg", "Snapchat"],
    platforms: [
      { name: "LeetCode", logo: "leetcode", url: "https://leetcode.com/problems/word-break/", color: "#FFA116" },
      { name: "GeeksforGeeks", logo: "gfg", url: "https://www.geeksforgeeks.org/word-break-problem-dp-32/", color: "#2F8D46" }
    ],
    tags: ["Hash Table", "String", "Dynamic Programming", "Trie", "Memoization"],
    approaches: [
      {
        title: "BFS — O(n²) Time",
        steps: [
          "Use a queue starting with index 0.",
          "For each index, try every word in the dictionary.",
          "If s.startsWith(word) at current index, enqueue currentIndex + word.length.",
          "If we reach the end of string, return true."
        ]
      },
      {
        title: "Bottom-Up DP — O(n²) Time, O(n) Space",
        steps: [
          "Create dp[0..n] boolean array, dp[0] = true (empty string base case).",
          "For i from 1 to n, for j from 0 to i:",
          "If dp[j] is true and s[j..i] is in wordDict, set dp[i] = true.",
          "Return dp[n]."
        ]
      }
    ],
    edgeCases: [
      "Empty string → return true (vacuously satisfied).",
      "Dictionary has longer words than the string → return false.",
      "Single character string and dictionary with that character.",
      "String that can be broken in multiple ways — any valid break returns true.",
      "Repeated use of dictionary words is allowed."
    ]
  },
  {
    id: 10,
    name: "Binary Tree Level Order Traversal",
    slug: "binary-tree-level-order-traversal",
    difficulty: "Medium",
    description: "Given the <code>root</code> of a binary tree, return <em>the level order traversal of its nodes' values</em> (i.e., from left to right, level by level) as a list of lists.",
    example: "Input: root = [3,9,20,null,null,15,7] → Output: [[3],[9,20],[15,7]].",
    companies: ["Amazon", "Facebook", "Google", "Microsoft", "Apple"],
    platforms: [
      { name: "LeetCode", logo: "leetcode", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/", color: "#FFA116" },
      { name: "GeeksforGeeks", logo: "gfg", url: "https://www.geeksforgeeks.org/level-order-tree-traversal/", color: "#2F8D46" }
    ],
    tags: ["Tree", "BFS", "Binary Tree"],
    approaches: [
      {
        title: "BFS with Queue — O(n) Time, O(n) Space",
        steps: [
          "Use a queue initialized with the root node.",
          "While queue is not empty, determine current level size.",
          "Process exactly that many nodes, adding their children to the queue.",
          "Collect all node values at current level into a list.",
          "Append that list to the result."
        ]
      },
      {
        title: "DFS with Level Tracking — O(n) Time",
        steps: [
          "Use recursive DFS, passing current depth as parameter.",
          "If depth == result.length, create a new list.",
          "Append current node value to result[depth].",
          "Recurse on left child (depth+1), then right child (depth+1)."
        ]
      }
    ],
    edgeCases: [
      "Empty tree (root is null) → return empty list [].",
      "Single node tree → return [[root.val]].",
      "Skewed tree (only left or only right children) — still works correctly.",
      "Very wide tree — BFS queue may hold O(n) nodes at the widest level."
    ]
  }
];

const CHAT_HISTORY = [
  { id: "c1", title: "Dynamic Programming problems", time: "2h ago", query: "dynamic programming" },
  { id: "c2", title: "Google interview questions", time: "5h ago", query: "google" },
  { id: "c3", title: "Array & Two Pointer problems", time: "Yesterday", query: "array two pointer" },
  { id: "c4", title: "Tree traversal techniques", time: "Yesterday", query: "tree traversal" },
  { id: "c5", title: "Amazon SDE-1 prep", time: "2 days ago", query: "amazon" },
  { id: "c6", title: "Hard LeetCode problems", time: "3 days ago", query: "hard" }
];

function searchProblems(query) {
  if (!query || query.trim() === "") return PROBLEMS_DATA;
  const q = query.toLowerCase();
  return PROBLEMS_DATA.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.companies.some(c => c.toLowerCase().includes(q)) ||
    p.tags.some(t => t.toLowerCase().includes(q)) ||
    p.difficulty.toLowerCase().includes(q) ||
    p.platforms.some(pl => pl.name.toLowerCase().includes(q))
  );
}

function getProblemBySlug(slug) {
  return PROBLEMS_DATA.find(p => p.slug === slug) || null;
}
