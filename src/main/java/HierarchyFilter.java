import java.util.ArrayList;
import java.util.List;
import java.util.function.IntPredicate;

/**
 * A node is present in the filtered hierarchy iff its node ID passes the predicate
 * and all of its ancestors pass it as well.
 */
public class HierarchyFilter {

    /**
     * Filters a hierarchy by removing nodes that fail the predicate or have any ancestor
     * that fails the predicate.
     *
     * <p>Processes directly from the DFS arrays without building an intermediate tree.
     * Time complexity: O(n), Space complexity: O(d) where d = max depth.
     *
     * @param hierarchy the hierarchy to filter
     * @param nodeIdPredicate predicate to test each node ID
     * @return a new hierarchy containing only nodes that pass the predicate and have all ancestors passing
     */
    public static Hierarchy filter(Hierarchy hierarchy, IntPredicate nodeIdPredicate) {
        int n = hierarchy.size();
        if (n == 0) {
            return new ArrayBasedHierarchy(new int[0], new int[0]);
        }

        List<Integer> resultIds = new ArrayList<>();
        List<Integer> resultDepths = new ArrayList<>();

        // Stack tracks whether all ancestors at each depth level pass the predicate.
        // Stack size = current depth in the DFS traversal.
        // true at index i means: all ancestors through depth i pass the predicate.
        boolean[] ancestorPasses = new boolean[32];
        int stackSize = 0;

        for (int i = 0; i < n; i++) {
            int nodeId = hierarchy.nodeId(i);
            int depth = hierarchy.depth(i);

            // Pop stack to match current depth (find parent)
            stackSize = depth;

            // Node is included iff: it passes predicate AND (root OR all ancestors pass)
            boolean nodePasses = nodeIdPredicate.test(nodeId);
            boolean ancestorsPass = (depth == 0) || ancestorPasses[depth - 1];
            boolean included = nodePasses && ancestorsPass;

            if (included) {
                resultIds.add(nodeId);
                resultDepths.add(depth);
            }

            // Ensure capacity
            if (stackSize >= ancestorPasses.length) {
                ancestorPasses = java.util.Arrays.copyOf(ancestorPasses, ancestorPasses.length * 2);
            }

            // Push: track if this node's inclusion chain is still valid
            ancestorPasses[stackSize] = included;
            stackSize++;
        }

        int[] ids = new int[resultIds.size()];
        int[] depths = new int[resultDepths.size()];
        for (int i = 0; i < resultIds.size(); i++) {
            ids[i] = resultIds.get(i);
            depths[i] = resultDepths.get(i);
        }
        return new ArrayBasedHierarchy(ids, depths);
    }
}
