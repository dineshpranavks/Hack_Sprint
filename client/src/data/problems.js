export const PROBLEMS = [
  {
    id: 1,
    name: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",
    description:
      "Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to target</em>. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    example: "Input: nums = [2,7,11,15], target = 9 → Output: [0,1]",
    companies: ["Google", "Amazon", "Apple", "Microsoft", "Facebook", "Adobe"],
    platforms: [
      { name: "LeetCode",      key: "leetcode",   url: "https://leetcode.com/problems/two-sum/",                                                                                            color: "#FFA116" },
      { name: "HackerRank",    key: "hackerrank", url: "https://www.hackerrank.com/challenges/ctci-icpc-team/problem",                                                                      color: "#2EC866" },
      { name: "GeeksforGeeks", key: "gfg",        url: "https://www.geeksforgeeks.org/given-an-array-a-and-a-number-x-check-for-pair-in-a-with-sum-as-x/",                                  color: "#2F8D46" },
    ],
    tags: ["Array", "Hash Table"],
    approaches: [
      { title: "Brute Force — O(n²) Time, O(1) Space",           steps: ["Iterate through each element using two nested loops.", "For each pair (i, j) where i < j, check if nums[i] + nums[j] == target.", "If found, return [i, j]."] },
      { title: "Hash Map — O(n) Time, O(n) Space (Optimal)",     steps: ["Create an empty hash map to store {value → index}.", "For each element nums[i], compute complement = target − nums[i].", "Check if complement exists in the hash map.", "If yes, return [map[complement], i]. Otherwise store nums[i] → i.", "Single-pass O(n) — no need to pre-fill the map."] },
    ],
    edgeCases: ["Only one valid answer exists (guaranteed).", "Same element cannot be used twice.", "Negative numbers must be handled.", "Array with only two elements → answer is always [0, 1].", "Target is 0 — look for two negatives or two zeros."],
  },
  {
    id: 2,
    name: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    difficulty: "Medium",
    description: "Given a string <code>s</code>, find the length of the <em>longest substring without repeating characters</em>.",
    example: "Input: s = 'abcabcbb' → Output: 3 (the answer is 'abc')",
    companies: ["Amazon", "Microsoft", "Google", "Bloomberg", "Goldman Sachs", "Uber"],
    platforms: [
      { name: "LeetCode",      key: "leetcode", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", color: "#FFA116" },
      { name: "GeeksforGeeks", key: "gfg",      url: "https://www.geeksforgeeks.org/length-of-the-longest-substring-without-repeating-characters/",  color: "#2F8D46" },
    ],
    tags: ["String", "Sliding Window", "Hash Table"],
    approaches: [
      { title: "Brute Force — O(n³) Time",                           steps: ["Generate all possible substrings.", "For each substring, check if all characters are unique.", "Track the maximum length."] },
      { title: "Sliding Window + Hash Set — O(n) Time",              steps: ["Use two pointers left and right starting at 0.", "Use a hash set to track chars in current window.", "Expand right, shrink from left on duplicate.", "Update max = right − left + 1 at each step."] },
      { title: "Optimized Sliding Window + Hash Map — O(n) (Best)", steps: ["Store the last seen index of each character.", "On repeat, jump left to max(left, map[char] + 1).", "Avoids re-scanning already processed characters."] },
    ],
    edgeCases: ["Empty string → return 0.", "All identical characters → return 1.", "All unique characters → return len(s).", "Single character → return 1.", "Spaces and special characters must be handled."],
  },
  {
    id: 3,
    name: "Merge Intervals",
    slug: "merge-intervals",
    difficulty: "Medium",
    description: "Given an array of intervals where <code>intervals[i] = [start_i, end_i]</code>, merge all overlapping intervals and return non-overlapping intervals.",
    example: "Input: [[1,3],[2,6],[8,10],[15,18]] → Output: [[1,6],[8,10],[15,18]]",
    companies: ["Facebook", "Google", "Amazon", "LinkedIn", "Microsoft", "Twitter"],
    platforms: [
      { name: "LeetCode",      key: "leetcode", url: "https://leetcode.com/problems/merge-intervals/",  color: "#FFA116" },
      { name: "GeeksforGeeks", key: "gfg",      url: "https://www.geeksforgeeks.org/merging-intervals/", color: "#2F8D46" },
    ],
    tags: ["Array", "Sorting"],
    approaches: [
      { title: "Sort and Merge — O(n log n) Time", steps: ["Sort all intervals by their start time.", "Initialize result with first interval.", "For each interval, compare start with end of last merged.", "If overlap, merge by updating end = max(both ends).", "Otherwise push as new entry."] },
    ],
    edgeCases: ["Single interval → return as-is.", "All intervals overlap → return one merged interval.", "One interval completely contains another.", "Unsorted input — always sort first."],
  },
  {
    id: 4,
    name: "Coin Change",
    slug: "coin-change",
    difficulty: "Medium",
    description: "Given coins of different denominations and an amount, return the fewest number of coins needed. If impossible, return <code>-1</code>.",
    example: "Input: coins = [1,5,6,9], amount = 11 → Output: 2 (5 + 6)",
    companies: ["Amazon", "Google", "Goldman Sachs", "Morgan Stanley", "Apple", "Uber"],
    platforms: [
      { name: "LeetCode",      key: "leetcode",   url: "https://leetcode.com/problems/coin-change/",                                                    color: "#FFA116" },
      { name: "HackerRank",    key: "hackerrank", url: "https://www.hackerrank.com/challenges/coin-change/problem",                                      color: "#2EC866" },
      { name: "GeeksforGeeks", key: "gfg",        url: "https://www.geeksforgeeks.org/find-minimum-number-of-coins-that-make-a-change/",                  color: "#2F8D46" },
    ],
    tags: ["Dynamic Programming", "Array", "BFS"],
    approaches: [
      { title: "Recursion + Memoization — O(S×n) Time",          steps: ["Recursive function tries each coin.", "Store results in memo array.", "Base case: amount = 0 → 0; amount < 0 → −1."] },
      { title: "Bottom-Up DP — O(S×n) Time, O(S) Space (Best)", steps: ["Create dp[amount+1] initialized to Infinity.", "Set dp[0] = 0.", "For each amount 1..target, try every coin.", "dp[i] = min(dp[i], dp[i − coin] + 1).", "Return dp[amount] if not Infinity, else −1."] },
    ],
    edgeCases: ["Amount is 0 → return 0.", "No valid combination → return -1.", "Coin equals amount → return 1.", "Duplicate denominations in input."],
  },
  {
    id: 5,
    name: "LRU Cache",
    slug: "lru-cache",
    difficulty: "Medium",
    description: "Design a data structure following <em>Least Recently Used (LRU)</em> cache constraints. Implement <code>get(key)</code> and <code>put(key, value)</code> in O(1) time.",
    example: "LRUCache(2) → put(1,1), put(2,2), get(1)→1, put(3,3), get(2)→-1 (evicted)",
    companies: ["Amazon", "Google", "Microsoft", "Facebook", "Nvidia", "Snapchat"],
    platforms: [
      { name: "LeetCode",      key: "leetcode", url: "https://leetcode.com/problems/lru-cache/",              color: "#FFA116" },
      { name: "GeeksforGeeks", key: "gfg",      url: "https://www.geeksforgeeks.org/lru-cache-implementation/", color: "#2F8D46" },
    ],
    tags: ["Design", "Hash Table", "Linked List"],
    approaches: [
      { title: "HashMap + Doubly Linked List — O(1)", steps: ["Doubly linked list: MRU at head, LRU at tail.", "Hash map: key → node.", "On get: move node to head.", "On put: add at head. If over capacity, remove tail."] },
      { title: "OrderedDict (Python) — O(1)",         steps: ["collections.OrderedDict maintains insertion order.", "On get: move_to_end(key).", "On put: add, move_to_end. If over capacity, popitem(last=False)."] },
    ],
    edgeCases: ["get on missing key → -1.", "Capacity 1 → every new put evicts previous.", "Putting existing key → update value and refresh recency.", "Capacity 0 — handle gracefully."],
  },
  {
    id: 6,
    name: "Number of Islands",
    slug: "number-of-islands",
    difficulty: "Medium",
    description: "Given an m×n binary grid of '1's (land) and '0's (water), return the number of islands. Connected adjacent lands (horizontal/vertical) form one island.",
    example: "Input: [['1','1','0'],['1','1','0'],['0','0','1']] → Output: 2",
    companies: ["Amazon", "Google", "Facebook", "Microsoft", "Bloomberg", "Salesforce"],
    platforms: [
      { name: "LeetCode",      key: "leetcode", url: "https://leetcode.com/problems/number-of-islands/",                    color: "#FFA116" },
      { name: "GeeksforGeeks", key: "gfg",      url: "https://www.geeksforgeeks.org/find-the-number-of-islands-using-dfs/", color: "#2F8D46" },
    ],
    tags: ["DFS", "BFS", "Array", "Matrix", "Union Find"],
    approaches: [
      { title: "DFS — O(m×n) Time",    steps: ["Traverse cell by cell.", "On '1': increment count, start DFS.", "DFS marks all connected '1's as '0'.", "Explores all 4 directions."] },
      { title: "BFS — O(m×n) Time",    steps: ["Same as DFS but use a queue.", "For each unvisited '1', enqueue and mark visited.", "Process queue: enqueue adjacent unvisited '1's."] },
      { title: "Union Find — O(m×n)",  steps: ["Initialize parent array for all land cells.", "Union adjacent land cells.", "Count distinct roots."] },
    ],
    edgeCases: ["Empty grid → 0.", "All water → 0.", "All land → 1.", "Single cell.", "Diagonal connections do NOT count."],
  },
  {
    id: 7,
    name: "Trapping Rain Water",
    slug: "trapping-rain-water",
    difficulty: "Hard",
    description: "Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.",
    example: "Input: height = [0,1,0,2,1,0,1,3,2,1,2,1] → Output: 6",
    companies: ["Amazon", "Google", "Microsoft", "Goldman Sachs", "Apple", "Uber"],
    platforms: [
      { name: "LeetCode",      key: "leetcode", url: "https://leetcode.com/problems/trapping-rain-water/",  color: "#FFA116" },
      { name: "GeeksforGeeks", key: "gfg",      url: "https://www.geeksforgeeks.org/trapping-rain-water/",  color: "#2F8D46" },
    ],
    tags: ["Array", "Two Pointers", "Dynamic Programming", "Monotonic Stack"],
    approaches: [
      { title: "Precompute Max Arrays — O(n) Time, O(n) Space", steps: ["Precompute left_max[i] and right_max[i].", "Water at i = min(left_max[i], right_max[i]) − height[i].", "Sum all values."] },
      { title: "Two Pointer — O(n) Time, O(1) Space (Best)",    steps: ["Left and right pointers at both ends.", "Track left_max and right_max.", "Process the smaller side, accumulate water.", "Continue until pointers meet."] },
    ],
    edgeCases: ["Length < 3 → return 0.", "Monotonic array → return 0.", "All bars same height → 0."],
  },
  {
    id: 8,
    name: "Maximum Subarray",
    slug: "maximum-subarray",
    difficulty: "Easy",
    description: "Find the contiguous subarray with the largest sum and return its sum. Classic Kadane's Algorithm.",
    example: "Input: nums = [-2,1,-3,4,-1,2,1,-5,4] → Output: 6 (subarray [4,-1,2,1])",
    companies: ["Amazon", "Apple", "Google", "LinkedIn", "Microsoft"],
    platforms: [
      { name: "LeetCode",      key: "leetcode",   url: "https://leetcode.com/problems/maximum-subarray/",                         color: "#FFA116" },
      { name: "HackerRank",    key: "hackerrank", url: "https://www.hackerrank.com/challenges/maxsubarray/problem",               color: "#2EC866" },
      { name: "GeeksforGeeks", key: "gfg",        url: "https://www.geeksforgeeks.org/largest-sum-contiguous-subarray/",          color: "#2F8D46" },
    ],
    tags: ["Array", "Dynamic Programming", "Divide and Conquer"],
    approaches: [
      { title: "Brute Force — O(n²)",                          steps: ["Try all subarrays, track max sum."] },
      { title: "Kadane's Algorithm — O(n) Time, O(1) (Best)", steps: ["current_sum = max(nums[i], current_sum + nums[i]).", "max_sum = max(max_sum, current_sum).", "Return max_sum."] },
    ],
    edgeCases: ["All negatives → return largest element.", "Single element → return it.", "All zeros → return 0."],
  },
  {
    id: 9,
    name: "Word Break",
    slug: "word-break",
    difficulty: "Medium",
    description: "Given string <code>s</code> and dictionary <code>wordDict</code>, return true if <code>s</code> can be segmented into space-separated dictionary words.",
    example: "Input: s = 'leetcode', wordDict = ['leet','code'] → Output: true",
    companies: ["Google", "Facebook", "Amazon", "Bloomberg", "Snapchat"],
    platforms: [
      { name: "LeetCode",      key: "leetcode", url: "https://leetcode.com/problems/word-break/",                        color: "#FFA116" },
      { name: "GeeksforGeeks", key: "gfg",      url: "https://www.geeksforgeeks.org/word-break-problem-dp-32/",           color: "#2F8D46" },
    ],
    tags: ["Dynamic Programming", "String", "Hash Table", "Trie"],
    approaches: [
      { title: "BFS — O(n²)",             steps: ["Queue starting at index 0.", "For each index, try every word.", "Enqueue currentIndex + word.length if match.", "Return true when end is reached."] },
      { title: "Bottom-Up DP — O(n²)",    steps: ["dp[0] = true.", "For i 1..n, for j 0..i: if dp[j] && s[j..i] in dict → dp[i] = true.", "Return dp[n]."] },
    ],
    edgeCases: ["Empty string → true.", "Dictionary words longer than string → false.", "Repeated use of dictionary words is allowed."],
  },
  {
    id: 10,
    name: "Binary Tree Level Order Traversal",
    slug: "binary-tree-level-order-traversal",
    difficulty: "Medium",
    description: "Given the root of a binary tree, return the level order traversal of its nodes' values as a list of lists.",
    example: "Input: root = [3,9,20,null,null,15,7] → Output: [[3],[9,20],[15,7]]",
    companies: ["Amazon", "Facebook", "Google", "Microsoft", "Apple"],
    platforms: [
      { name: "LeetCode",      key: "leetcode", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/", color: "#FFA116" },
      { name: "GeeksforGeeks", key: "gfg",      url: "https://www.geeksforgeeks.org/level-order-tree-traversal/",        color: "#2F8D46" },
    ],
    tags: ["Trees & Graphs", "BFS", "Binary Tree"],
    approaches: [
      { title: "BFS with Queue — O(n)",      steps: ["Queue with root.", "Process level-size nodes per iteration.", "Collect values per level → append to result."] },
      { title: "DFS with Depth Param — O(n)", steps: ["Pass depth to recursive DFS.", "If depth == result.length, create new list.", "Append value to result[depth]."] },
    ],
    edgeCases: ["Empty tree → [].", "Single node → [[root.val]].", "Skewed tree still works.", "Very wide tree — queue may hold O(n) nodes."],
  },
  {
    id: 11,
    name: "Subsets",
    slug: "subsets",
    difficulty: "Medium",
    description: "Given an integer array <code>nums</code> of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets.",
    example: "Input: nums = [1,2,3] → Output: [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]",
    companies: ["Facebook", "Amazon", "Google", "Microsoft"],
    platforms: [
      { name: "LeetCode",      key: "leetcode", url: "https://leetcode.com/problems/subsets/", color: "#FFA116" },
      { name: "GeeksforGeeks", key: "gfg",      url: "https://www.geeksforgeeks.org/power-set/", color: "#2F8D46" },
    ],
    tags: ["Backtracking", "Array", "Bit Manipulation"],
    approaches: [
      { title: "Backtracking — O(n × 2ⁿ)", steps: ["Start with empty subset.", "At each step, decide to include or exclude current element.", "Recurse for next index.", "Add current subset to result at each call."] },
      { title: "Bit Manipulation — O(n × 2ⁿ)", steps: ["For each number 0 to 2ⁿ−1, treat bits as inclusion flags.", "If bit i is set, include nums[i] in subset.", "Collect all 2ⁿ subsets."] },
    ],
    edgeCases: ["Empty array → [[]].", "Single element → [[], [element]].", "All elements included → one subset.", "Result always has 2ⁿ subsets."],
  },
  {
    id: 12,
    name: "Climbing Stairs",
    slug: "climbing-stairs",
    difficulty: "Easy",
    description: "You are climbing a staircase with <code>n</code> steps. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    example: "Input: n = 5 → Output: 8",
    companies: ["Amazon", "Google", "Apple", "Adobe"],
    platforms: [
      { name: "LeetCode",      key: "leetcode", url: "https://leetcode.com/problems/climbing-stairs/", color: "#FFA116" },
      { name: "GeeksforGeeks", key: "gfg",      url: "https://www.geeksforgeeks.org/count-ways-reach-nth-stair/", color: "#2F8D46" },
    ],
    tags: ["Dynamic Programming", "Math", "Memoization"],
    approaches: [
      { title: "Recursion + Memoization — O(n)", steps: ["f(n) = f(n-1) + f(n-2).", "Base cases: f(1) = 1, f(2) = 2.", "Use memo to avoid recomputation."] },
      { title: "Bottom-Up DP — O(n) Time, O(1) Space", steps: ["prev2 = 1, prev1 = 2.", "For i from 3 to n: curr = prev1 + prev2.", "Shift prev2 = prev1, prev1 = curr.", "Return prev1."] },
    ],
    edgeCases: ["n = 1 → 1 way.", "n = 2 → 2 ways.", "Very large n — use iterative DP to avoid stack overflow."],
  },
  {
    id: 13,
    name: "Permutations",
    slug: "permutations",
    difficulty: "Medium",
    description: "Given an array <code>nums</code> of distinct integers, return all possible permutations.",
    example: "Input: nums = [1,2,3] → Output: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]",
    companies: ["Microsoft", "LinkedIn", "Amazon", "Google"],
    platforms: [
      { name: "LeetCode",      key: "leetcode", url: "https://leetcode.com/problems/permutations/", color: "#FFA116" },
      { name: "GeeksforGeeks", key: "gfg",      url: "https://www.geeksforgeeks.org/write-a-c-program-to-print-all-permutations-of-a-given-string/", color: "#2F8D46" },
    ],
    tags: ["Backtracking", "Array"],
    approaches: [
      { title: "Backtracking — O(n × n!)", steps: ["At each step, pick an unused element.", "Add to current permutation.", "Recurse until all elements used.", "Backtrack by removing last element."] },
    ],
    edgeCases: ["Single element → one permutation.", "Empty array → [[]].", "n! grows fast — watch memory for large n."],
  },
  {
    id: 14,
    name: "Longest Common Subsequence",
    slug: "longest-common-subsequence",
    difficulty: "Medium",
    description: "Given two strings <code>text1</code> and <code>text2</code>, return the length of their longest common subsequence.",
    example: "Input: text1 = 'abcde', text2 = 'ace' → Output: 3 ('ace')",
    companies: ["Google", "Amazon", "Microsoft", "Oracle"],
    platforms: [
      { name: "LeetCode",      key: "leetcode", url: "https://leetcode.com/problems/longest-common-subsequence/", color: "#FFA116" },
      { name: "GeeksforGeeks", key: "gfg",      url: "https://www.geeksforgeeks.org/longest-common-subsequence-dp-4/", color: "#2F8D46" },
    ],
    tags: ["Dynamic Programming", "String"],
    approaches: [
      { title: "2D DP Table — O(m×n) Time and Space", steps: ["Build dp[m+1][n+1] table.", "If text1[i] == text2[j]: dp[i][j] = dp[i-1][j-1] + 1.", "Else: dp[i][j] = max(dp[i-1][j], dp[i][j-1]).", "Return dp[m][n]."] },
    ],
    edgeCases: ["One string empty → LCS is 0.", "Both identical → LCS is len(string).", "No common characters → LCS is 0."],
  },
  {
    id: 15,
    name: "Word Search",
    slug: "word-search",
    difficulty: "Medium",
    description: "Given an m×n grid of characters and a string word, return true if word exists in the grid (horizontally/vertically adjacent cells, no reuse).",
    example: "Input: board = [['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], word = 'ABCCED' → Output: true",
    companies: ["Microsoft", "Amazon", "Google", "Facebook"],
    platforms: [
      { name: "LeetCode",      key: "leetcode", url: "https://leetcode.com/problems/word-search/",  color: "#FFA116" },
      { name: "GeeksforGeeks", key: "gfg",      url: "https://www.geeksforgeeks.org/search-a-word-in-a-2d-grid-of-characters/", color: "#2F8D46" },
    ],
    tags: ["Backtracking", "DFS", "Matrix", "Array"],
    approaches: [
      { title: "DFS + Backtracking — O(m×n×4^L)", steps: ["For each cell, try DFS if it matches word[0].", "Mark cell as visited (temporarily modify grid).", "Recurse on all 4 neighbors for next character.", "Backtrack by restoring original cell value."] },
    ],
    edgeCases: ["Word longer than total cells → false.", "Single character word.", "Word starts and ends at same cell.", "All cells same character."],
  },
];

/* ── Metadata ── */
export const CHAT_HISTORY = [
  { id: "c1", title: "Dynamic Programming problems",  time: "2h ago",    query: "dynamic programming" },
  { id: "c2", title: "Google interview questions",     time: "4h ago",    query: "google" },
  { id: "c3", title: "Array & Two Pointer problems",   time: "Yesterday", query: "array" },
  { id: "c4", title: "Tree traversal techniques",      time: "Yesterday", query: "tree" },
  { id: "c5", title: "Amazon SDE-1 prep",              time: "2 days ago",query: "amazon" },
  { id: "c6", title: "Backtracking patterns",          time: "3 days ago",query: "backtracking" },
];

/* ── All unique companies ── */
export const ALL_COMPANIES  = [...new Set(PROBLEMS.flatMap(p => p.companies))].sort();
export const ALL_DIFFICULTIES = ["Easy", "Medium", "Hard"];

/* ── Program Types (topic-based tags) ── */
export const PROGRAM_TYPES = [
  "Dynamic Programming",
  "Backtracking",
  "Arrays & Hashing",
  "Sliding Window",
  "Two Pointers",
  "DFS",
  "BFS",
  "Trees & Graphs",
  "Sorting",
  "Design",
  "String Manipulation",
  "Greedy",
  "Divide and Conquer",
];

/* Map display name → tags that match it */
const PROGRAM_TYPE_TAG_MAP = {
  "Dynamic Programming":  ["Dynamic Programming", "Memoization"],
  "Backtracking":         ["Backtracking"],
  "Arrays & Hashing":     ["Array", "Hash Table"],
  "Sliding Window":       ["Sliding Window"],
  "Two Pointers":         ["Two Pointers"],
  "DFS":                  ["DFS"],
  "BFS":                  ["BFS"],
  "Trees & Graphs":       ["Trees & Graphs", "Binary Tree", "Tree", "Union Find"],
  "Sorting":              ["Sorting"],
  "Design":               ["Design", "Linked List"],
  "String Manipulation":  ["String", "Trie"],
  "Greedy":               ["Greedy"],
  "Divide and Conquer":   ["Divide and Conquer"],
};

/* ── Search / Filter ── */
export function searchProblems(query = "", filters = {}) {
  let results = [...PROBLEMS];

  if (query.trim()) {
    const q = query.toLowerCase();
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.companies.some(c  => c.toLowerCase().includes(q)) ||
      p.tags.some(t       => t.toLowerCase().includes(q)) ||
      p.difficulty.toLowerCase().includes(q) ||
      p.platforms.some(pl => pl.name.toLowerCase().includes(q))
    );
  }

  if (filters.difficulty && filters.difficulty !== "All") {
    results = results.filter(p => p.difficulty === filters.difficulty);
  }

  if (filters.companies?.length) {
    results = results.filter(p =>
      filters.companies.some(c => p.companies.includes(c))
    );
  }

  if (filters.programTypes?.length) {
    const matchTags = filters.programTypes.flatMap(pt => PROGRAM_TYPE_TAG_MAP[pt] || []);
    results = results.filter(p =>
      p.tags.some(tag => matchTags.includes(tag))
    );
  }

  return results;
}

export function getProblemBySlug(slug) {
  return PROBLEMS.find(p => p.slug === slug) || null;
}
