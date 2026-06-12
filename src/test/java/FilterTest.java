import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class FilterTest {

    @Test
    void testOriginalExample() {
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

    @Test
    void testEmptyResult() {
        Hierarchy hierarchy = new ArrayBasedHierarchy(
            new int[]{1, 2, 3},
            new int[]{0, 1, 2}
        );
        Hierarchy filtered = HierarchyFilter.filter(hierarchy, nodeId -> false);
        assertEquals(0, filtered.size());
    }

    @Test
    void testSingleRootNode() {
        Hierarchy hierarchy = new ArrayBasedHierarchy(
            new int[]{42},
            new int[]{0}
        );
        Hierarchy filtered = HierarchyFilter.filter(hierarchy, nodeId -> nodeId == 42);
        assertEquals("[42:0]", filtered.formatString());
    }

    @Test
    void testMultipleRoots() {
        Hierarchy hierarchy = new ArrayBasedHierarchy(
            new int[]{1, 2, 3},
            new int[]{0, 0, 0}
        );
        Hierarchy filtered = HierarchyFilter.filter(hierarchy, nodeId -> nodeId != 2);
        assertEquals("[1:0, 3:0]", filtered.formatString());
    }

    @Test
    void testParentRejectionRemovesChild() {
        // 1 -> 2 -> 3, but 2 fails predicate
        Hierarchy hierarchy = new ArrayBasedHierarchy(
            new int[]{1, 2, 3},
            new int[]{0, 1, 2}
        );
        Hierarchy filtered = HierarchyFilter.filter(hierarchy, nodeId -> nodeId != 2);
        assertEquals("[1:0]", filtered.formatString());
    }

    @Test
    void testDeepHierarchy() {
        // 1 -> 2 -> 3 -> 4 -> 5 (all pass)
        Hierarchy hierarchy = new ArrayBasedHierarchy(
            new int[]{1, 2, 3, 4, 5},
            new int[]{0, 1, 2, 3, 4}
        );
        Hierarchy filtered = HierarchyFilter.filter(hierarchy, nodeId -> true);
        assertEquals("[1:0, 2:1, 3:2, 4:3, 5:4]", filtered.formatString());
    }

    @Test
    void testDeepHierarchyWithFailure() {
        // 1 -> 2 -> 3 -> 4 -> 5, but 3 fails
        Hierarchy hierarchy = new ArrayBasedHierarchy(
            new int[]{1, 2, 3, 4, 5},
            new int[]{0, 1, 2, 3, 4}
        );
        Hierarchy filtered = HierarchyFilter.filter(hierarchy, nodeId -> nodeId != 3);
        assertEquals("[1:0, 2:1]", filtered.formatString());
    }

    @Test
    void testEntireTreeRemoval() {
        // Two trees: [1 -> 2 -> 3] and [4 -> 5], remove first tree root
        Hierarchy hierarchy = new ArrayBasedHierarchy(
            new int[]{1, 2, 3, 4, 5},
            new int[]{0, 1, 2, 0, 1}
        );
        Hierarchy filtered = HierarchyFilter.filter(hierarchy, nodeId -> nodeId != 1);
        assertEquals("[4:0, 5:1]", filtered.formatString());
    }

    @Test
    void testFullPass() {
        Hierarchy hierarchy = new ArrayBasedHierarchy(
            new int[]{1, 2, 3, 4, 5},
            new int[]{0, 1, 1, 0, 1}
        );
        Hierarchy filtered = HierarchyFilter.filter(hierarchy, nodeId -> true);
        assertEquals(hierarchy.formatString(), filtered.formatString());
    }

    @Test
    void testEmptyHierarchy() {
        Hierarchy hierarchy = new ArrayBasedHierarchy(new int[0], new int[0]);
        Hierarchy filtered = HierarchyFilter.filter(hierarchy, nodeId -> true);
        assertEquals(0, filtered.size());
    }

    @Test
    void testMultipleChildrenPartialRemoval() {
        // 1 -> [2, 3, 4], remove child 3
        Hierarchy hierarchy = new ArrayBasedHierarchy(
            new int[]{1, 2, 3, 4},
            new int[]{0, 1, 1, 1}
        );
        Hierarchy filtered = HierarchyFilter.filter(hierarchy, nodeId -> nodeId != 3);
        assertEquals("[1:0, 2:1, 4:1]", filtered.formatString());
    }

    @Test
    void testGrandchildSurvivesWhenParentPasses() {
        // 1 -> 2 -> 3 -> 4, all pass, remove only node 4
        Hierarchy hierarchy = new ArrayBasedHierarchy(
            new int[]{1, 2, 3, 4},
            new int[]{0, 1, 2, 3}
        );
        Hierarchy filtered = HierarchyFilter.filter(hierarchy, nodeId -> nodeId != 4);
        assertEquals("[1:0, 2:1, 3:2]", filtered.formatString());
    }

    @Test
    void testComplexForest() {
        // Forest: [1 -> 2 -> 3], [4 -> 5], [6 -> 7 -> 8]
        // Remove 4 and 7
        Hierarchy hierarchy = new ArrayBasedHierarchy(
            new int[]{1, 2, 3, 4, 5, 6, 7, 8},
            new int[]{0, 1, 2, 0, 1, 0, 1, 2}
        );
        Hierarchy filtered = HierarchyFilter.filter(hierarchy, nodeId -> nodeId != 4 && nodeId != 7);
        assertEquals("[1:0, 2:1, 3:2, 6:0]", filtered.formatString());
    }
}
