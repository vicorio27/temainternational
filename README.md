# Senior Developer Take-Home Assessment

## Overview

This repository contains the solution for the Senior Developer Take-Home Assessment.

The assessment consists of two required tasks:

1. Implementing the `HierarchyFilter.filter()` method and adding comprehensive test coverage.
2. Performing a production readiness review of a concurrent cache implementation.

Java version used:

```text
Java 21
```

---

# Task 1 - Hierarchy Filter

## Problem Description

The hierarchy is represented as a forest of trees stored in DFS order using two parallel arrays:

* `nodeIds`
* `depths`

Example:

```text
nodeIds: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
depths:  0, 1, 2, 3, 1, 0, 1, 0, 1, 1, 2
```

Visualized as:

```text
1
- 2
- - 3
- - - 4
- 5

6
- 7

8
- 9
- 10
- - 11
```

---

## Filtering Rule

A node is included in the filtered hierarchy if:

* The node itself satisfies the predicate.
* Every ancestor of the node satisfies the predicate.

As stated in the exercise:

```java
A node is present in the filtered hierarchy iff
its node ID passes the predicate and
all of its ancestors pass it as well.
```

Example:

```text
1
└── 2
    └── 3
```

If:

```java
nodeId == 2
```

fails the predicate, then:

```text
2 is removed
3 is removed
```

even if node 3 would pass the predicate itself.

---

## Solution Approach

The implementation processes the hierarchy directly from its DFS representation.

No intermediate tree structure is created.

### Complexity

```text
Time Complexity: O(n)
Space Complexity: O(d)
```

Where:

* n = number of nodes
* d = maximum hierarchy depth

This allows processing large hierarchies efficiently while preserving the original traversal order.

---

## Example Test

Input hierarchy:

```java
Hierarchy unfiltered = new ArrayBasedHierarchy(
    new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11},
    new int[]{0, 1, 2, 3, 1, 0, 1, 0, 1, 1, 2}
);
```

Predicate:

```java
nodeId -> nodeId % 3 != 0
```

Expected result:

```java
new ArrayBasedHierarchy(
    new int[]{1, 2, 5, 8, 10, 11},
    new int[]{0, 1, 1, 0, 1, 2}
);
```

---

## Additional Test Coverage

The solution includes tests covering:

### Original Example

Verifies the example provided in the assessment.

### Empty Result

All nodes fail the predicate.

### Single Root Node

```text
1
```

### Multiple Roots

```text
1

2

3
```

### Parent Rejection

```text
1
└── 2
    └── 3
```

When node 2 fails, node 3 is removed automatically.

### Deep Hierarchies

Verifies ancestor tracking through multiple depth levels.

### Entire Tree Removal

Validates complete subtree exclusion.

### Full Pass Scenario

All nodes satisfy the predicate.

---

# Task 2 - SimpleCache Review

## Reviewed Implementation

The provided implementation uses:

```java
ConcurrentHashMap<K, CacheEntry<V>>
```

with a fixed TTL of one minute.

The target production workload is:

* Thousands of reads per second
* Hundreds of writes per second
* Tens of concurrent threads

---

## Issues Identified

### 1. Expired Entries Are Never Removed

Expired entries return `null` but remain stored indefinitely.

Impact:

* Memory growth over time
* Potential memory leak
* Reduced cache efficiency

---

### 2. Incorrect Size Reporting

The `size()` method returns:

```java
cache.size()
```

which includes expired entries.

Impact:

* Misleading operational metrics
* Inaccurate cache monitoring

---

### 3. Missing Eviction Strategy

No cleanup mechanism exists.

Missing:

* Scheduled cleanup
* Background eviction
* Lazy removal

Impact:

* Unbounded memory growth

---

### 4. Usage of System.currentTimeMillis()

Expiration is calculated using:

```java
System.currentTimeMillis()
```

System clock changes can affect expiration behavior.

Examples:

* NTP synchronization
* Manual clock changes
* VM clock adjustments

Impact:

* Incorrect expiration decisions

A monotonic clock such as:

```java
System.nanoTime()
```

is safer for measuring elapsed time.

---

### 5. Stale Read Scenarios

Concurrent reads and writes can observe outdated entries.

Impact:

* Temporary inconsistencies
* Unexpected cache behavior under load

---

### 6. Expired Data Remains Forever

Entries that expire but are never accessed again remain stored indefinitely.

Impact:

* Progressive memory consumption

---

### 7. Hardcoded TTL

```java
private final long ttlMs = 60000;
```

Impact:

* No operational flexibility
* Requires code changes for configuration updates

---

### 8. No Capacity Limits

The cache has no maximum size.

Impact:

```text
OutOfMemoryError
```

under sustained growth.

A production cache typically requires:

* Maximum size limits
* LRU eviction
* LFU eviction
* Memory-based constraints

---

### 9. Cache Stampede Risk

When a popular entry expires, multiple threads may simultaneously miss the cache and request the backing resource.

Impact:

* Increased latency
* Database pressure
* Cascading failures

---

### 10. Missing Observability

The implementation exposes no metrics.

Missing indicators:

* Cache hits
* Cache misses
* Expirations
* Evictions

Impact:

* Difficult troubleshooting
* Reduced operational visibility

---

### 11. Null Ambiguity

The method returns:

```java
null
```

for multiple situations:

* Key not found
* Entry expired
* Value stored as null

Impact:

* Ambiguous API behavior

---

### 12. Limited Expiration Model

Only expire-after-write behavior exists.

Missing capabilities:

* Expire after access
* Refresh after write
* Background refresh

Impact:

* Reduced effectiveness for real-world workloads

---

# Running Tests

Maven:

```bash
mvn test
```

Gradle:

```bash
./gradlew test
```

---

# Design Notes

The hierarchy filtering solution prioritizes:

* Correctness
* Linear complexity
* Minimal memory overhead
* Readability

The cache review focuses on identifying production risks related to:

* Concurrency
* Scalability
* Memory management
* Observability
* Reliability

---

# Task 3 - Sticky Notes Board (Frontend)

## Overview

An interactive sticky notes board built with React + TypeScript + Vite + Zustand.

Supports:

* Creating notes
* Dragging notes
* Resizing notes
* Deleting notes (double-click to confirm, double-click again to delete)
* Persistent storage (localStorage)
* Layer management (bring to front on click)

## Stack

* React 19
* TypeScript
* Vite
* Zustand (state management)

## Commands

```bash
cd frontend
npm install
npm run dev      # start dev server
npm run build    # tsc + vite build
```

## Architecture

```
frontend/src/
├── components/       Board, StickyNote, Toolbar (rendering only)
├── hooks/            useDrag, useResize, useDelete, usePointerTracking
├── state/            notesStore.ts (Zustand)
├── utils/            geometry, persistence
└── types/            note.ts (types + constants)
```

## Key Design Decisions

### Interaction Isolation

Only one interaction mode can be active at a time:

```text
NONE | DRAGGING | RESIZING | DELETING
```

This prevents resize from triggering drag, or delete from triggering selection.

### Global Pointer Tracking

Pointer listeners are attached to `window` during active interactions:

```javascript
window.addEventListener("pointermove", handleMove);
window.addEventListener("pointerup", handleEnd);
```

This ensures drag and resize continue working even when the cursor leaves the note boundaries.

### Performance

* `useRef` is used for transient interaction data (`positionRef`, `sizeRef`)
* DOM is mutated directly during drag/resize — no React re-renders per pixel
* Pointer listeners are attached only while interactions are active

### Persistence Strategy

Persistence is decoupled from pointer movement:

```text
Drag/Resize Start → Update In-Memory State → Drag/Resize End → Persist to localStorage
```

This avoids writing to storage on every pixel movement.

### Deletion

* Double-click shows confirmation hint
* Second double-click triggers deletion with fade-out animation
* Deletion is fully isolated from drag and resize

### Stacking Order

Clicking a note brings it to front by incrementing its z-index. This ensures predictable visual ordering.

## Edge Cases Handled

* Fast cursor movements — drag continues when cursor leaves the note
* Cursor leaving component — interactions remain active until pointer release
* Overlapping interaction areas — interaction isolation prevents conflicts
* Resize near boundaries — minimum size constraints enforced
* Multiple notes — stacking order remains predictable


# Hierarchy.java

```
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

// The task:
// 1. Read and understand the Hierarchy data structure described in this file.
// 2. Implement filter() method.
// 3. Implement more test cases.
//
// The task should take 30-90 minutes.
//
// When assessing the submission, we will pay attention to:
// - correctness, efficiency, and clarity of the code;
// - the test cases.

/**
 * A {@code Hierarchy} stores an arbitrary <i>forest</i> (an ordered collection of ordered trees)
 * as an array of node IDs in the order of DFS traversal, combined with a parallel array of node depths.
 *
 * <p>Parent-child relationships are identified by the position in the array and the associated depth.
 * Each tree root has depth 0, its children have depth 1 and follow it in the array, their children have depth 2 and follow them, etc.
 *
 * <p>Example:
 * <pre>
 * nodeIds: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
 * depths:  0, 1, 2, 3, 1, 0, 1, 0, 1, 1, 2
 * </pre>
 *
 * <p>the forest can be visualized as follows:
 * <pre>
 * 1
 * - 2
 * - - 3
 * - - - 4
 * - 5
 * 6
 * - 7
 * 8
 * - 9
 * - 10
 * - - 11
 * </pre>
 * 1 is a parent of 2 and 5, 2 is a parent of 3, etc. Note that depth is equal to the number of hyphens for each node.
 *
 * <p>Invariants on the depths array:
 * <ul>
 *   <li>Depth of the first element is 0.</li>
 *   <li>If the depth of a node is {@code D}, the depth of the next node in the array can be:
 *     <ul>
 *       <li>{@code D + 1} if the next node is a child of this node;</li>
 *       <li>{@code D} if the next node is a sibling of this node;</li>
 *       <li>{@code d < D} - in this case the next node is not related to this node.</li>
 *     </ul>
 *   </li>
 * </ul>
 */
interface Hierarchy {
    /** The number of nodes in the hierarchy. */
    int size();

    /**
     * Returns the unique ID of the node identified by the hierarchy index. The depth for this node will be {@code depth(index)}.
     * @param index must be non-negative and less than {@link #size()}
     */
    int nodeId(int index);

    /**
     * Returns the depth of the node identified by the hierarchy index. The unique ID for this node will be {@code nodeId(index)}.
     * @param index must be non-negative and less than {@link #size()}
     */
    int depth(int index);

    default String formatString() {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < size(); i++) {
            if (i > 0) sb.append(", ");
            sb.append(nodeId(i)).append(":").append(depth(i));
        }
        sb.append("]");
        return sb.toString();
    }
}

/**
 * A node is present in the filtered hierarchy iff its node ID passes the predicate and all of its ancestors pass it as well.
 */
class HierarchyFilter {
    public static Hierarchy filter(Hierarchy hierarchy, java.util.function.IntPredicate nodeIdPredicate) {
        // todo implement
        return new ArrayBasedHierarchy(new int[0], new int[0]);
    }
}

class ArrayBasedHierarchy implements Hierarchy {
    private final int[] nodeIds;
    private final int[] depths;

    public ArrayBasedHierarchy(int[] nodeIds, int[] depths) {
        this.nodeIds = nodeIds;
        this.depths = depths;
    }

    @Override
    public int size() {
        return depths.length;
    }

    @Override
    public int nodeId(int index) {
        return nodeIds[index];
    }

    @Override
    public int depth(int index) {
        return depths[index];
    }
}

class FilterTest {
    @Test
    void testFilter() {
        Hierarchy unfiltered = new ArrayBasedHierarchy(
            new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11},
            new int[]{0, 1, 2, 3, 1, 0, 1, 0, 1, 1, 2}
        );
        Hierarchy filteredActual = HierarchyFilter.filter(unfiltered, nodeId -> nodeId % 3 != 0);
        Hierarchy filteredExpected = new ArrayBasedHierarchy(
            new int[]{1, 2, 5, 8, 10, 11},
            new int[]{0, 1, 1, 0, 1, 2}
        );
        assertEquals(filteredExpected.formatString(), filteredActual.formatString());
    }
}```


# SimpleCache.md


## Code Review

You are reviewing the following code submitted as part of a task to implement an item cache in a highly concurrent application. The anticipated load includes: thousands of reads per second, hundreds of writes per second, tens of concurrent threads.
Your objective is to identify and explain the issues in the implementation that must be addressed before deploying the code to production. Please provide a clear explanation of each issue and its potential impact on production behaviour.

```java
import java.util.concurrent.ConcurrentHashMap;

public class SimpleCache<K, V> {
    private final ConcurrentHashMap<K, CacheEntry<V>> cache = new ConcurrentHashMap<>();
    private final long ttlMs = 60000; // 1 minute

    public static class CacheEntry<V> {
        private final V value;
        private final long timestamp;

        public CacheEntry(V value, long timestamp) {
            this.value = value;
            this.timestamp = timestamp;
        }

        public V getValue() {
            return value;
        }

        public long getTimestamp() {
            return timestamp;
        }
    }

    public void put(K key, V value) {
        cache.put(key, new CacheEntry<>(value, System.currentTimeMillis()));
    }

    public V get(K key) {
        CacheEntry<V> entry = cache.get(key);
        if (entry != null) {
            if (System.currentTimeMillis() - entry.getTimestamp() < ttlMs) {
                return entry.getValue();
            }
        }
        return null;
    }

    public int size() {
        return cache.size();
    }
}
```