"use client";

import React, { useState } from "react";
import clsx from "clsx";
import Link from "next/link";

const CHEATSHEET_DATA = [
  {
    id: "sliding-window",
    title: "Sliding Window",
    description: "Used to find a subarray or substring that satisfies a given condition, optimizing nested loops.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1) or O(K)",
    code: `int maxSubArrayLen(vector<int>& nums, int k) {
    int left = 0, right = 0, sum = 0, maxLen = 0; // Initialize window boundaries
    while (right < nums.size()) { // Expand window to the right
        sum += nums[right];
        while (sum > k) { // If sum is too large, shrink from the left
            sum -= nums[left];
            left++;
        }
        if (sum == k) maxLen = max(maxLen, right - left + 1); // Record best valid window
        right++;
    }
    return maxLen;
}`
  },
  {
    id: "two-pointers",
    title: "Two Pointers",
    description: "Used to search pairs in a sorted array or linked list, reducing time complexity from O(N^2) to O(N).",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    code: `vector<int> twoSum(vector<int>& numbers, int target) {
    int left = 0, right = numbers.size() - 1; // Pointers at start and end
    while (left < right) {
        int sum = numbers[left] + numbers[right];
        if (sum == target) return {left + 1, right + 1}; // Found the pair!
        else if (sum < target) left++; // Need a bigger sum, move left pointer
        else right--; // Need a smaller sum, move right pointer
    }
    return {}; // No pair found
}`
  },
  {
    id: "fast-slow-pointers",
    title: "Fast & Slow Pointers",
    description: "Also known as Hare & Tortoise algorithm. Used for finding cycles in a linked list or middle node.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    code: `bool hasCycle(ListNode *head) {
    ListNode *slow = head, *fast = head; // Start both pointers at the head
    while (fast && fast->next) { // Fast moves 2 steps, slow moves 1 step
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true; // They met! There is a cycle.
    }
    return false; // Fast reached the end, no cycle.
}`
  },
  {
    id: "merge-intervals",
    title: "Merge Intervals",
    description: "Used to handle overlapping intervals. First sort the intervals, then merge based on start and end times.",
    timeComplexity: "O(N log N)",
    spaceComplexity: "O(1) or O(N)",
    code: `vector<vector<int>> merge(vector<vector<int>>& intervals) {
    sort(intervals.begin(), intervals.end()); // Sort intervals by start time
    vector<vector<int>> merged;
    for (auto interval : intervals) {
        // If merged is empty or no overlap, add the interval
        if (merged.empty() || merged.back()[1] < interval[0]) {
            merged.push_back(interval);
        } else {
            // Overlap found! Merge by taking the maximum end time
            merged.back()[1] = max(merged.back()[1], interval[1]);
        }
    }
    return merged;
}`
  },
  {
    id: "binary-search",
    title: "Binary Search",
    description: "Used to find an element in a sorted array in logarithmic time.",
    timeComplexity: "O(log N)",
    spaceComplexity: "O(1)",
    code: `int binarySearch(vector<int>& nums, int target) {
    int left = 0, right = nums.size() - 1; // Define search boundaries
    while (left <= right) {
        int mid = left + (right - left) / 2; // Calculate mid without overflow
        if (nums[mid] == target) return mid; // Target found!
        if (nums[mid] < target) left = mid + 1; // Discard left half
        else right = mid - 1; // Discard right half
    }
    return -1; // Target not found
}`
  },
  {
    id: "dfs",
    title: "Depth First Search (DFS)",
    description: "Used to traverse trees or graphs, going as deep as possible before backtracking.",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    code: `void dfs(int node, vector<vector<int>>& adj, vector<bool>& visited) {
    visited[node] = true; // Mark current node as visited
    for (int neighbor : adj[node]) { // Traverse all adjacent nodes
        if (!visited[neighbor]) {
            dfs(neighbor, adj, visited); // Recursively visit unvisited neighbors
        }
    }
}`
  },
  {
    id: "bfs",
    title: "Breadth First Search (BFS)",
    description: "Used to traverse trees or graphs level by level. Ideal for shortest path in unweighted graphs.",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    code: `void bfs(int start, vector<vector<int>>& adj, int n) {
    vector<bool> visited(n, false);
    queue<int> q;
    
    q.push(start); // Start from the initial node
    visited[start] = true;
    
    while (!q.empty()) {
        int curr = q.front(); q.pop(); // Process current level
        for (int neighbor : adj[curr]) {
            if (!visited[neighbor]) {
                visited[neighbor] = true; // Mark as visited to prevent cycles
                q.push(neighbor); // Add neighbor to queue
            }
        }
    }
}`
  },
  {
    id: "top-k-elements",
    title: "Top K Elements (Heap)",
    description: "Used to find the largest/smallest K elements using a Min-Heap or Max-Heap.",
    timeComplexity: "O(N log K)",
    spaceComplexity: "O(K)",
    code: `vector<int> topKFrequent(vector<int>& nums, int k) {
    unordered_map<int, int> count;
    for (int n : nums) count[n]++; // 1. Count frequencies
    
    // 2. Use a Min-Heap to keep the Top K elements
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    for (auto& p : count) {
        pq.push({p.second, p.first});
        if (pq.size() > k) pq.pop(); // Remove the smallest frequency if size > K
    }
    
    // 3. Extract the elements from the heap
    vector<int> res;
    while (!pq.empty()) {
        res.push_back(pq.top().second);
        pq.pop();
    }
    return res;
}`
  },
  {
    id: "backtracking",
    title: "Backtracking",
    description: "Used to build all possible solutions incrementally and abandon a path as soon as it determines it cannot lead to a valid solution.",
    timeComplexity: "O(2^N) or O(N!)",
    spaceComplexity: "O(N)",
    code: `void backtrack(vector<int>& nums, vector<int>& path, vector<vector<int>>& res) {
    if (path.size() == nums.size()) {
        res.push_back(path);
        return;
    }
    for (int i = 0; i < nums.size(); i++) {
        if (find(path.begin(), path.end(), nums[i]) != path.end()) continue;
        path.push_back(nums[i]);
        backtrack(nums, path, res);
        path.pop_back(); // backtrack
    }
}`
  },
  {
    id: "dp-1d",
    title: "Dynamic Programming (1D)",
    description: "Used for optimization problems. Breaks problem down to overlapping subproblems and caches their results (Memoization / Tabulation).",
    timeComplexity: "O(N)",
    spaceComplexity: "O(N)",
    code: `int climbStairs(int n) {
    if (n <= 2) return n;
    vector<int> dp(n + 1);
    dp[1] = 1;
    dp[2] = 2;
    for (int i = 3; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    return dp[n];
}`
  },
  {
    id: "monotonic-stack",
    title: "Monotonic Stack",
    description: "Used to find the next greater or smaller element in an array efficiently.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(N)",
    code: `vector<int> nextGreaterElement(vector<int>& nums) {
    vector<int> res(nums.size(), -1);
    stack<int> st; // stores indices
    for (int i = 0; i < nums.size(); i++) {
        while (!st.empty() && nums[st.top()] < nums[i]) {
            res[st.top()] = nums[i];
            st.pop();
        }
        st.push(i);
    }
    return res;
}`
  },
  {
    id: "union-find",
    title: "Union Find (Disjoint Set)",
    description: "Used to keep track of a set of elements partitioned into disjoint subsets. Great for cycle detection in undirected graphs or connected components.",
    timeComplexity: "O(α(N)) ≈ O(1)",
    spaceComplexity: "O(N)",
    code: `class UnionFind {
    vector<int> parent, rank;
public:
    UnionFind(int n) {
        parent.resize(n); rank.resize(n, 0);
        iota(parent.begin(), parent.end(), 0);
    }
    int find(int i) {
        if (parent[i] == i) return i;
        return parent[i] = find(parent[i]); // path compression
    }
    bool unite(int i, int j) {
        int rootI = find(i), rootJ = find(j);
        if (rootI == rootJ) return false;
        if (rank[rootI] < rank[rootJ]) parent[rootI] = rootJ;
        else if (rank[rootI] > rank[rootJ]) parent[rootJ] = rootI;
        else { parent[rootJ] = rootI; rank[rootI]++; }
        return true;
    }
};`
  },
  {
    id: "topological-sort",
    title: "Topological Sort (Kahn's)",
    description: "Used for scheduling problems or finding a valid order of courses with prerequisites (Directed Acyclic Graphs).",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V + E)",
    code: `vector<int> topoSort(int numCourses, vector<vector<int>>& prerequisites) {
    vector<int> indegree(numCourses, 0);
    vector<vector<int>> adj(numCourses);
    for (auto& pre : prerequisites) {
        adj[pre[1]].push_back(pre[0]);
        indegree[pre[0]]++;
    }
    queue<int> q;
    for (int i = 0; i < numCourses; i++)
        if (indegree[i] == 0) q.push(i);
    vector<int> order;
    while (!q.empty()) {
        int curr = q.front(); q.pop();
        order.push_back(curr);
        for (int next : adj[curr]) {
            if (--indegree[next] == 0) q.push(next);
        }
    }
    return order.size() == numCourses ? order : vector<int>();
}`
  },
  {
    id: "trie",
    title: "Trie (Prefix Tree)",
    description: "Used for efficient string matching, autocomplete, and dictionary representations.",
    timeComplexity: "O(L) per word (L = length)",
    spaceComplexity: "O(N * L)",
    code: `class TrieNode {
public:
    TrieNode* children[26];
    bool isWord;
    TrieNode() {
        isWord = false;
        for (int i = 0; i < 26; i++) children[i] = nullptr;
    }
};
class Trie {
    TrieNode* root;
public:
    Trie() { root = new TrieNode(); }
    void insert(string word) {
        TrieNode* node = root;
        for (char c : word) {
            if (!node->children[c - 'a']) node->children[c - 'a'] = new TrieNode();
            node = node->children[c - 'a'];
        }
        node->isWord = true;
    }
};`
  },
  {
    id: "cyclic-sort",
    title: "Cyclic Sort",
    description: "Used for dealing with numbers in a given range (e.g., 1 to N). Finds missing or duplicate numbers in O(N) time without extra space.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    code: `void cyclicSort(vector<int>& nums) {
    int i = 0;
    while (i < nums.size()) {
        int correctIdx = nums[i] - 1;
        if (nums[i] > 0 && nums[i] <= nums.size() && nums[i] != nums[correctIdx]) {
            swap(nums[i], nums[correctIdx]);
        } else {
            i++;
        }
    }
}`
  },
  {
    id: "dijkstra",
    title: "Dijkstra's Algorithm",
    description: "Used to find the shortest paths from a source node to all other nodes in a graph with non-negative edge weights.",
    timeComplexity: "O(E log V)",
    spaceComplexity: "O(V + E)",
    code: `vector<int> dijkstra(int n, vector<vector<pair<int, int>>>& adj, int src) {
    vector<int> dist(n, INT_MAX);
    dist[src] = 0;
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    pq.push({0, src}); // {distance, node}
    
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        
        for (auto& edge : adj[u]) {
            int v = edge.first, weight = edge.second;
            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`
  }
];

export default function Cheatsheet() {
  const [activePattern, setActivePattern] = useState(CHEATSHEET_DATA[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(activePattern.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant h-16">
        <div className="flex justify-between items-center h-full px-[24px] max-w-[1400px] mx-auto w-full">
          <div className="flex items-center gap-[8px] text-on-surface">
            <span className="material-symbols-outlined text-[20px] text-primary">menu_book</span>
            <span className="font-headline-md text-headline-md font-semibold tracking-tight">Cheatsheet</span>
          </div>
          <div className="flex items-center gap-[16px]">
            <Link href="/settings" className="hover:text-primary transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined">settings</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="pt-16 min-h-screen">
        <div className="max-w-[1400px] mx-auto p-[24px] h-[calc(100vh-64px)]">
          <div className="grid grid-cols-12 gap-[24px] h-full">
            
            {/* Sidebar Patterns List */}
            <div className="col-span-12 lg:col-span-3 h-full flex flex-col glass-panel rounded-2xl overflow-hidden border border-outline-variant">
              <div className="p-[24px] border-b border-outline-variant bg-surface-container/50">
                <h3 className="font-label-md text-label-md text-on-surface font-bold text-[13px]">Patterns & Algorithms</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-[12px] space-y-[4px] custom-scrollbar">
                {CHEATSHEET_DATA.map((pattern) => (
                  <button
                    key={pattern.id}
                    onClick={() => setActivePattern(pattern)}
                    className={clsx(
                      "w-full text-left px-[16px] py-[12px] rounded-xl font-label-md text-sm transition-all flex justify-between items-center",
                      activePattern.id === pattern.id
                        ? "bg-primary text-on-primary font-bold shadow-md shadow-primary/20"
                        : "text-on-surface hover:bg-surface-container-highest"
                    )}
                  >
                    <span>{pattern.title}</span>
                    {activePattern.id === pattern.id && (
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern Detail View */}
            <div className="col-span-12 lg:col-span-9 h-full glass-panel rounded-2xl border border-outline-variant flex flex-col overflow-hidden bg-surface-container-lowest">
              <div className="p-[32px] border-b border-outline-variant flex flex-col gap-2">
                <h2 className="text-display-sm font-bold tracking-tight text-on-surface">
                  {activePattern.title}
                </h2>
                <p className="text-on-surface-variant text-body-lg max-w-[800px]">
                  {activePattern.description}
                </p>
                <div className="flex gap-4 mt-4">
                  <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant shadow-sm">
                    <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                    <span className="font-mono text-sm font-semibold">Time: {activePattern.timeComplexity}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant shadow-sm">
                    <span className="material-symbols-outlined text-[16px] text-secondary">memory</span>
                    <span className="font-mono text-sm font-semibold">Space: {activePattern.spaceComplexity}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-[32px] overflow-y-auto custom-scrollbar bg-surface-container/30">
                <div className="flex justify-between items-end mb-4">
                  <h3 className="font-headline-sm font-bold text-on-surface">C++ Implementation</h3>
                  <button 
                    onClick={handleCopy}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg font-label-md text-sm transition-colors border",
                      copied 
                        ? "bg-primary/10 text-primary border-primary/20" 
                        : "bg-surface text-on-surface-variant border-outline-variant hover:border-outline hover:text-on-surface"
                    )}
                    title="Copy code"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copied ? 'check' : 'content_copy'}
                    </span>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="relative group">
                  <pre className="p-[24px] rounded-xl bg-[#0d1117] text-[#c9d1d9] font-mono text-[14px] leading-relaxed overflow-x-auto shadow-inner border border-outline-variant/50">
                    <code>
                      {activePattern.code.split('\n').map((line, idx) => {
                        const commentIndex = line.indexOf('//');
                        if (commentIndex !== -1) {
                          const codePart = line.substring(0, commentIndex);
                          const commentPart = line.substring(commentIndex);
                          return (
                            <React.Fragment key={idx}>
                              {codePart}
                              <span className="text-[#7ee787] italic">{commentPart}</span>
                              {'\n'}
                            </React.Fragment>
                          );
                        }
                        return (
                          <React.Fragment key={idx}>
                            {line}
                            {'\n'}
                          </React.Fragment>
                        );
                      })}
                    </code>
                  </pre>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
