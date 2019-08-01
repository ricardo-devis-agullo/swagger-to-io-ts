/*
 * @author Samuel Neff (https://github.com/samuelneff)
 *
 * based almost entirely on gist from
 *
 * @author SHIN Suzuki (shinout310@gmail.com)
 *
 * https://gist.github.com/shinout/1232505
 */

class EdgeNode<T> {
  public afters: T[] = [];
  // eslint-disable-next-line @typescript-eslint/no-parameter-properties
  public constructor(public id: T) {}
}

function sortDesc<T>(a: T, b: T) {
  if (a < b) return 1;
  if (a > b) return -1;
  // a must be equal to b
  return 0;
}

/**
 * general topological sort
 * @param edges : list of edges. each edge forms Array<ID,ID> e.g. [12 , 3]
 * @param options When provided with 'continueOnCircularDependency' set to true, sorting will continue even if a
 *                  circular dependency is found. The precise sort is not guaranteed.
 * @returns Array : topological sorted list of IDs
 **/
function topsort<T>(
  edges: T[][],
  options?: { continueOnCircularDependency: boolean }
): T[] {
  var nodes: { [key: string]: EdgeNode<T> } = {};
  options = options || { continueOnCircularDependency: false };

  var sorted: T[] = [];

  // hash: id of already visited node => true
  var visited: { [key: string]: boolean } = {};

  // 1. build data structures
  edges.forEach(function(edge: T[]) {
    var fromEdge: T = edge[0];
    var fromStr = String(fromEdge);
    var fromNode: EdgeNode<T>;

    if (!(fromNode = nodes[fromStr])) {
      fromNode = nodes[fromStr] = new EdgeNode<T>(fromEdge);
    }

    edge.forEach(function(toEdge: T) {
      // since from and to are in same array, we'll always see from again, so make sure we skip it..
      if (toEdge == fromEdge) {
        return;
      }

      var toEdgeStr = String(toEdge);

      if (!nodes[toEdgeStr]) {
        nodes[toEdgeStr] = new EdgeNode<T>(toEdge);
      }
      fromNode.afters.push(toEdge);
    });
  });

  // 2. topological sort
  var keys: string[] = Object.keys(nodes);
  keys.sort(sortDesc);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  keys.forEach(function visit(idstr: string, ancestorsIn: any) {
    var node: EdgeNode<T> = nodes[idstr];
    var id: T = node.id;

    // if already exists, do nothing
    if (visited[idstr]) {
      return;
    }

    var ancestors: T[] = Array.isArray(ancestorsIn) ? ancestorsIn : [];

    ancestors.push(id);
    visited[idstr] = true;

    node.afters.sort(sortDesc);
    node.afters.forEach(function(afterID: T) {
      // if already in ancestors, a closed chain exists.
      if (ancestors.indexOf(afterID) >= 0) {
        if (options && options.continueOnCircularDependency) {
          return;
        }
        throw new Error(
          'Circular chain found: ' +
            id +
            ' must be before ' +
            afterID +
            ' due to a direct order specification, but ' +
            afterID +
            ' must be before ' +
            id +
            ' based on other specifications.'
        );
      }

      // recursive call
      visit(
        String(afterID),
        ancestors.map(function(v) {
          return v;
        })
      );
    });

    sorted.unshift(id);
  });

  return sorted;
}

export = topsort;
